import secrets
import hashlib
import random
import string
from datetime import datetime, timedelta
from typing import Optional, Tuple
import logging

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database.models import OTPVerification, Patient
from app.services.email_service import send_otp as send_otp_email

logger = logging.getLogger(__name__)


def generate_patient_id():
    """Generate unique patient ID like PA-7X9K2M4"""
    letters = ''.join(random.choices(string.ascii_uppercase, k=2))
    alphanumeric = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"PA-{letters}{alphanumeric}"


class OTPService:
    """Service for OTP generation, validation, and management"""
    
    OTP_LENGTH = 6
    OTP_EXPIRY_MINUTES = 5
    MAX_ATTEMPTS = 5
    RESEND_COOLDOWN_MINUTES = 1
    MAX_OTP_PER_DAY = 10
    
    @staticmethod
    def generate_otp() -> str:
        """Generate a secure random 6-digit OTP"""
        return ''.join(secrets.choice('0123456789') for _ in range(OTPService.OTP_LENGTH))
    
    @staticmethod
    def hash_otp(otp: str) -> str:
        """Hash OTP for secure storage"""
        return hashlib.sha256(otp.encode()).hexdigest()
    
    @staticmethod
    def verify_otp_hash(stored_hash: str, provided_otp: str) -> bool:
        """Verify OTP against stored hash"""
        return stored_hash == OTPService.hash_otp(provided_otp)
    
    @staticmethod
    async def create_otp_with_user_data(
        db: AsyncSession,
        email: str,
        name: str,
        password: str,
        phone: str
    ) -> Tuple[str, bool]:
        """
        Create a new OTP with user data for pending registration
        
        Args:
            db: Database session
            email: User email address
            name: User's full name
            password: Hashed password
            phone: User's phone number
            
        Returns:
            tuple: (OTP code, success status)
        """
        # Check for existing OTP record
        result = await db.execute(
            select(OTPVerification).where(OTPVerification.email == email)
        )
        existing_otp = result.scalar_one_or_none()
        
        # Check if email is already verified/registered
        if existing_otp and existing_otp.is_verified:
            logger.warning(f"Email {email} already has a verified OTP")
            return "", False
        
        # Check rate limiting
        if existing_otp and not existing_otp.is_verified:
            # Check if within cooldown period
            time_since_creation = datetime.utcnow() - existing_otp.created_at
            if time_since_creation < timedelta(minutes=OTPService.RESEND_COOLDOWN_MINUTES):
                remaining_time = OTPService.RESEND_COOLDOWN_MINUTES - time_since_creation.seconds // 60
                logger.warning(f"OTP resend rate limited for {email}. Try again in {remaining_time} minutes.")
                return "", False
            
            # Delete old OTP record
            await db.delete(existing_otp)
            await db.commit()
        
        # Generate new OTP
        otp_code = OTPService.generate_otp()
        hashed_otp = OTPService.hash_otp(otp_code)
        expires_at = datetime.utcnow() + timedelta(minutes=OTPService.OTP_EXPIRY_MINUTES)
        
        # Store in database with user data
        otp_record = OTPVerification(
            email=email,
            otp_code=hashed_otp,
            expires_at=expires_at,
            user_name=name,
            user_password=password,
            user_phone=phone
        )
        db.add(otp_record)
        await db.commit()
        
        logger.info(f"OTP created with user data for {email}")
        return otp_code, True
    
    @staticmethod
    async def send_otp(db: AsyncSession, email: str) -> Tuple[bool, str]:
        """
        Generate and send OTP via email
        
        Args:
            db: Database session
            email: Recipient email
            
        Returns:
            tuple: (success, message)
        """
        # Check if there's pending user data
        result = await db.execute(
            select(OTPVerification).where(OTPVerification.email == email)
        )
        otp_record = result.scalar_one_or_none()
        
        if not otp_record:
            return False, "No pending registration found. Please signup first."
        
        otp_code, success = await OTPService.create_otp_with_user_data(
            db, email,
            otp_record.user_name,
            otp_record.user_password,
            otp_record.user_phone
        )
        
        if not success:
            return False, "Please wait before requesting a new OTP"
        
        # Send OTP via email
        email_sent = send_otp_email(email, otp_code)
        
        if not email_sent:
            return False, "Failed to send OTP email. Please try again."
        
        return True, f"OTP sent to {email}"
    
    @staticmethod
    async def verify_otp(db: AsyncSession, email: str, provided_otp: str) -> Tuple[bool, str]:
        """
        Verify the OTP code and create patient account
        
        Args:
            db: Database session
            email: User email
            provided_otp: OTP code to verify
            
        Returns:
            tuple: (success, message)
        """
        # Find OTP record
        result = await db.execute(
            select(OTPVerification).where(OTPVerification.email == email)
        )
        otp_record = result.scalar_one_or_none()
        
        if not otp_record:
            return False, "No OTP found. Please request a new OTP."
        
        # Check if already verified
        if otp_record.is_verified:
            return False, "OTP already verified."
        
        # Check expiry
        if datetime.utcnow() > otp_record.expires_at:
            await db.delete(otp_record)
            await db.commit()
            return False, "OTP has expired. Please request a new OTP."
        
        # Increment attempt count
        otp_record.attempt_count += 1
        await db.commit()
        
        # Check max attempts
        if otp_record.attempt_count > OTPService.MAX_ATTEMPTS:
            await db.delete(otp_record)
            await db.commit()
            return False, "Too many failed attempts. Please request a new OTP."
        
        # Verify OTP
        if OTPService.verify_otp_hash(otp_record.otp_code, provided_otp):
            # OTP valid - create patient account from stored data
            try:
                # Generate unique patient_id
                patient_id = generate_patient_id()
                
                new_patient = Patient(
                    patient_id=patient_id,
                    name=otp_record.user_name,
                    email=otp_record.email,
                    password=otp_record.user_password,
                    phone=otp_record.user_phone
                )
                db.add(new_patient)
                
                # Delete OTP record
                await db.delete(otp_record)
                await db.commit()
                
                logger.info(f"Patient account created for {email} after OTP verification")
                return True, "OTP verified successfully. Account created!"
            except Exception as e:
                await db.rollback()
                logger.error(f"Error creating patient account: {e}")
                return False, "Failed to create account. Please try again."
        
        remaining_attempts = OTPService.MAX_ATTEMPTS - otp_record.attempt_count
        return False, f"Invalid OTP. {remaining_attempts} attempts remaining."
    
    @staticmethod
    async def resend_otp(db: AsyncSession, email: str) -> Tuple[bool, str]:
        """
        Resend OTP for the given email
        
        Args:
            db: Database session
            email: User email
            
        Returns:
            tuple: (success, message)
        """
        return await OTPService.send_otp(db, email)
    
    @staticmethod
    async def delete_otp(db: AsyncSession, email: str) -> bool:
        """
        Delete OTP record after verification
        
        Args:
            db: Database session
            email: User email
            
        Returns:
            bool: True if deleted, False if not found
        """
        result = await db.execute(
            select(OTPVerification).where(OTPVerification.email == email)
        )
        otp_record = result.scalar_one_or_none()
        
        if otp_record:
            await db.delete(otp_record)
            await db.commit()
            return True
        return False
    
    @staticmethod
    async def is_email_verified(db: AsyncSession, email: str) -> bool:
        """
        Check if email has been verified
        
        Args:
            db: Database session
            email: User email
            
        Returns:
            bool: True if verified
        """
        result = await db.execute(
            select(OTPVerification).where(OTPVerification.email == email)
        )
        otp_record = result.scalar_one_or_none()
        return otp_record is not None and otp_record.is_verified


# Singleton instance
otp_service = OTPService()

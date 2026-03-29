from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.db import get_db
from app.database.models import Patient
from app.security import hash_password
from app.services.otp_service import OTPService
from app.routers.auth import validate_password_strength
import secrets

router = APIRouter(prefix="/auth", tags=["password-reset"])

@router.post("/patient/forgot-password")
async def patient_forgot_password(
    request: dict,
    db: AsyncSession = Depends(get_db)
):
    """
    Send OTP to patient email for password reset.
    """
    email = request.get("email")
    
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is required"
        )
    
    # Check if patient exists
    result = await db.execute(select(Patient).where(Patient.email == email))
    patient = result.scalar_one_or_none()
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No patient found with this email"
        )
    
    # Generate and send OTP
    otp_service = OTPService()
    success, message = await otp_service.create_otp_for_password_reset(email, db)
    
    if success:
        return {"message": "OTP sent to your email for password reset"}
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message
        )

@router.post("/patient/verify-reset-otp")
async def verify_reset_otp(
    request: dict,
    db: AsyncSession = Depends(get_db)
):
    """
    Verify OTP for password reset and return a token for setting new password.
    """
    email = request.get("email")
    otp = request.get("otp")
    
    if not all([email, otp]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and OTP are required"
        )
    
    # Verify OTP
    otp_service = OTPService()
    success, message = await otp_service.verify_password_reset_otp(email, otp, db)
    
    if success:
        # Generate a reset token (valid for 15 minutes)
        reset_token = secrets.token_urlsafe(32)
        
        return {
            "message": "OTP verified successfully",
            "reset_token": reset_token,
            "expires_in": 900  # 15 minutes in seconds
        }
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message
        )

@router.post("/patient/reset-password")
async def reset_patient_password(
    request: dict,
    db: AsyncSession = Depends(get_db)
):
    """
    Reset patient password after OTP verification.
    """
    email = request.get("email")
    new_password = request.get("new_password")
    
    if not all([email, new_password]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and new password are required"
        )
    
    # Validate password strength
    valid, error_msg = validate_password_strength(new_password)
    if not valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )
    
    # Find patient
    result = await db.execute(select(Patient).where(Patient.email == email))
    patient = result.scalar_one_or_none()
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # Update password
    patient.password = hash_password(new_password)
    await db.commit()
    
    return {"message": "Password reset successfully"}

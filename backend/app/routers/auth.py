import json
import random
import string
import re
import os
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.database.db import get_db
from app.database.models import Clinic, Patient, OTPVerification, Appointment, CompletedAppointment, Review, ReviewReaction, ClinicImage, QRAppointment
from app.schemas import (
    ClinicSignup, ClinicLogin, PatientSignup, PatientLogin,
    ChangePasswordRequest, ChangePhoneRequest, DeleteAccountRequest,
    AuthResponse, SendOTPRequest, VerifyOTPRequest, OTPResponse, OTPVerifyResponse
)
from app.security import hash_password, verify_password
from app.services.otp_service import OTPService
from fastapi.responses import JSONResponse


def validate_password_strength(password: str) -> tuple[bool, str]:
    """
    Validate password strength.
    Returns (is_valid, error_message).
    Requirements: 8+ chars, 1 uppercase, 1 lowercase, 1 special, 1 number.
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least 1 uppercase letter (A-Z)"
    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least 1 lowercase letter (a-z)"
    if not re.search(r"[0-9]", password):
        return False, "Password must contain at least 1 number (0-9)"
    if not re.search(r"[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?]", password):
        return False, "Password must contain at least 1 special character (!@#$%^&*...)"
    return True, ""

def generate_clinic_id():
    """Generate unique clinic ID like FA23W3"""
    # Generate 2 random letters
    letters = ''.join(random.choices(string.ascii_uppercase, k=2))
    # Generate 2 random digits
    digits = ''.join(random.choices(string.digits, k=2))
    # Generate 3 random letters
    more_letters = ''.join(random.choices(string.ascii_uppercase, k=3))
    
    return f"{letters}{digits}{more_letters}"

def generate_patient_id():
    """
    Generate unique patient ID like PA-7X9K2M4
    Format: PA-XXYYYY where X is letter and Y is alphanumeric
    """
    # Generate 2 random letters
    letters = ''.join(random.choices(string.ascii_uppercase, k=2))
    # Generate 4 random alphanumeric characters (mix of letters and digits)
    alphanumeric = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    
    return f"PA-{letters}{alphanumeric}"

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/clinic/signup", response_model=AuthResponse)
async def clinic_signup(clinic_data: ClinicSignup, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Clinic).where(Clinic.email == clinic_data.email))
    existing_clinic = result.scalar_one_or_none()
    
    if existing_clinic:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    hashed_password = hash_password(clinic_data.password)
    
    # Generate unique clinic ID
    clinic_id = generate_clinic_id()
    
    new_clinic = Clinic(
        clinic_id=clinic_id,
        clinic_name=clinic_data.clinic_name,
        email=clinic_data.email,
        password=hashed_password,
        phone=clinic_data.phone,
        address=clinic_data.address,
        doctor_name=clinic_data.doctor_name if clinic_data.doctor_name else ""
    )
    
    db.add(new_clinic)
    await db.commit()
    await db.refresh(new_clinic)
    
    return AuthResponse(message="Signup successful", clinic_id=clinic_id)

@router.post("/clinic/login", response_model=AuthResponse)
async def clinic_login(login_data: ClinicLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Clinic).where(Clinic.email == login_data.email))
    clinic = result.scalar_one_or_none()
    
    if not clinic or not verify_password(login_data.password, clinic.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    return AuthResponse(message="Login successful", user_type="clinic", clinic_id=clinic.clinic_id)

@router.post("/patient/signup", response_model=AuthResponse)
async def patient_signup(patient_data: PatientSignup, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Patient).where(Patient.email == patient_data.email))
    existing_patient = result.scalar_one_or_none()
    
    if existing_patient:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    valid, error_msg = validate_password_strength(patient_data.password)
    if not valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )
    
    # Generate unique patient ID
    patient_id = generate_patient_id()
    
    # Ensure patient_id is unique
    while True:
        check_result = await db.execute(select(Patient).where(Patient.patient_id == patient_id))
        if not check_result.scalar_one_or_none():
            break
        patient_id = generate_patient_id()
    
    hashed_password = hash_password(patient_data.password)
    
    new_patient = Patient(
        patient_id=patient_id,
        name=patient_data.name,
        email=patient_data.email,
        password=hashed_password,
        phone=patient_data.phone
    )
    
    db.add(new_patient)
    await db.commit()
    await db.refresh(new_patient)
    
    return AuthResponse(
        message="Signup successful",
        patient_data={
            "patient_id": patient_id,
            "name": patient_data.name,
            "email": patient_data.email
        }
    )

@router.post("/patient/login", response_model=AuthResponse)
async def patient_login(login_data: PatientLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Patient).where(Patient.email == login_data.email))
    patient = result.scalar_one_or_none()
    
    if not patient or not verify_password(login_data.password, patient.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    return AuthResponse(
        message="Login successful",
        user_type="patient",
        patient_data={
            "patient_id": patient.patient_id,
            "name": patient.name,
            "email": patient.email
        }
    )

# Get Patient Data Endpoint
@router.get("/patient/data")
async def get_patient_data(
    email: str = Query(..., description="Patient email"),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Patient).where(Patient.email == email))
    patient = result.scalar_one_or_none()
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # Return patient data (excluding password)
    return {
        "patient_id": patient.patient_id,
        "id": patient.id,
        "name": patient.name,
        "email": patient.email,
        "phone": patient.phone,
        "created_at": patient.created_at
    }

# Get Clinic Data Endpoint
@router.get("/clinic/data")
async def get_clinic_data(
    clinic_id: str = Query(..., description="Clinic ID"),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Clinic).where(Clinic.clinic_id == clinic_id))
    clinic = result.scalar_one_or_none()
    
    if not clinic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clinic not found"
        )
    
    # Return clinic data (excluding password)
    return {
        "clinic_id": clinic.clinic_id,
        "clinic_name": clinic.clinic_name,
        "email": clinic.email,
        "phone": clinic.phone,
        "address": clinic.address,
        "image_urls": clinic.image_urls or [],
        "doctor_name": clinic.doctor_name,
        "available": clinic.available,
        "created_at": clinic.created_at
    }

# List All Clinics Endpoint
@router.get("/clinics/list")
async def list_clinics(db: AsyncSession = Depends(get_db)):
    """
    List all clinics for patient to browse.
    Only shows clinics that are available today (available=true).
    """
    result = await db.execute(select(Clinic).where(Clinic.available == True))
    clinics = result.scalars().all()
    
    clinic_list = []
    for clinic in clinics:
        clinic_list.append({
            "id": clinic.id,
            "clinic_id": clinic.clinic_id,
            "clinic_name": clinic.clinic_name,
            "email": clinic.email,
            "phone": clinic.phone,
            "address": clinic.address,
            "doctor_name": clinic.doctor_name or "",
            "specializations": ["general"],  # Default specialization
            "doctors": [{"name": clinic.doctor_name or "Available Doctor"}],
            "rating": 4.5,  # Default rating
            "wait_time": "15-30 min",
            "distance": "2.5 km",
            "is_active": clinic.is_active or False
        })
    
    return {"clinics": clinic_list}

# Clinic Profile Management Endpoints
@router.put("/clinic/change-phone")
async def clinic_change_phone(
    request: ChangePhoneRequest,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Clinic).where(Clinic.clinic_id == request.patient_email))
    clinic = result.scalar_one_or_none()
    
    if not clinic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clinic not found"
        )
    
    # Update phone
    clinic.phone = request.new_phone
    await db.commit()
    
    return {"message": "Phone number updated successfully"}

@router.put("/clinic/change-password")
async def clinic_change_password(
    request: ChangePasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Clinic).where(Clinic.clinic_id == request.patient_email))
    clinic = result.scalar_one_or_none()
    
    if not clinic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clinic not found"
        )
    
    # Verify current password
    if not verify_password(request.current_password, clinic.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect"
        )
    
    # Update password
    clinic.password = hash_password(request.new_password)
    await db.commit()
    
    return {"message": "Password changed successfully"}

@router.put("/clinic/update-profile")
async def update_clinic_profile(
    request: dict,
    db: AsyncSession = Depends(get_db)
):
    """Update clinic address and images"""
    clinic_id = request.get("clinic_id")
    address = request.get("address")
    image_urls = request.get("image_urls")
    
    if not clinic_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="clinic_id is required"
        )
    
    result = await db.execute(select(Clinic).where(Clinic.clinic_id == clinic_id))
    clinic = result.scalar_one_or_none()
    
    if not clinic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clinic not found"
        )
    
    # Update address if provided
    if address is not None:
        clinic.address = address
    
    # Update image URLs if provided (max 5 images)
    if image_urls is not None:
        # Ensure only 5 images max
        clinic.image_urls = image_urls[:5] if len(image_urls) > 5 else image_urls
    
    await db.commit()
    
    return {
        "message": "Profile updated successfully",
        "address": clinic.address,
        "image_urls": clinic.image_urls or []
    }

@router.post("/clinic/upload-image")
async def upload_clinic_image(
    clinic_id: str = Form(...),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    """Upload clinic image and store binary data in database"""
    
    # Validate clinic exists
    result = await db.execute(select(Clinic).where(Clinic.clinic_id == clinic_id))
    clinic = result.scalar_one_or_none()
    
    if not clinic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clinic not found"
        )
    
    # Check current image count
    current_images = clinic.image_urls or []
    if len(current_images) >= 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 5 images allowed. Please delete an image first."
        )
    
    # Validate file type - accept any image type
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Please upload an image file."
        )
    
    # Validate file size (max 5MB)
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds 5MB limit. Please upload a smaller image."
        )
    
    # Convert to base64
    import base64
    image_data_b64 = base64.b64encode(contents).decode('utf-8')
    
    # Find or create ClinicImage record for this clinic
    result = await db.execute(select(ClinicImage).where(ClinicImage.clinic_id == clinic_id))
    clinic_image_record = result.scalar_one_or_none()
    
    if not clinic_image_record:
        # Create new record with first image
        clinic_image_record = ClinicImage(
            clinic_id=clinic_id,
            images=[{
                "image_data": image_data_b64,
                "image_type": file.content_type,
                "uploaded_at": datetime.now().isoformat()
            }]
        )
        db.add(clinic_image_record)
        await db.flush()
    else:
        # Fill empty slots first (null values)
        current_images = list(clinic_image_record.images) if clinic_image_record.images else []
        
        # Count non-null images
        non_null_count = sum(1 for img in current_images if img is not None)
        
        if non_null_count >= 5:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Maximum 5 images allowed. Please delete an image first."
            )
        
        # Find first empty slot (null)
        empty_slot_index = None
        for i, img in enumerate(current_images):
            if img is None:
                empty_slot_index = i
                break
        
        if empty_slot_index is not None:
            # Fill the empty slot
            current_images[empty_slot_index] = {
                "image_data": image_data_b64,
                "image_type": file.content_type,
                "uploaded_at": datetime.now().isoformat()
            }
        else:
            # No empty slots, append new image
            current_images.append({
                "image_data": image_data_b64,
                "image_type": file.content_type,
                "uploaded_at": datetime.now().isoformat()
            })
        
        clinic_image_record.images = current_images
        await db.flush()
    
    # Sync clinic.image_urls - keep nulls for deleted images
    all_images = list(clinic_image_record.images) if clinic_image_record.images else []
    new_urls = []
    for i, img in enumerate(all_images):
        if img is not None:
            new_urls.append(f"/auth/clinic/image/{clinic_id}/{i}")
        else:
            new_urls.append(None)
    clinic.image_urls = new_urls
    
    await db.commit()
    
    # Return the filled slot index
    filled_index = None
    for i, img in enumerate(all_images):
        if img is not None and (empty_slot_index is None or i == empty_slot_index):
            if empty_slot_index is not None:
                filled_index = i
                break
            elif i == len(all_images) - 1:
                filled_index = i
                break
    
    return {
        "message": "Image uploaded successfully",
        "image_url": f"/auth/clinic/image/{clinic_id}/{filled_index}" if filled_index is not None else "",
        "filled_index": filled_index,
        "total_images": sum(1 for img in all_images if img is not None),
        "image_urls": new_urls
    }

@router.get("/clinic/image/{clinic_id}/{image_index}")
async def get_clinic_image(
    clinic_id: str,
    image_index: int,
    db: AsyncSession = Depends(get_db)
):
    """Serve clinic image from JSON array in database"""
    import base64
    
    result = await db.execute(select(ClinicImage).where(ClinicImage.clinic_id == clinic_id))
    clinic_image_record = result.scalar_one_or_none()
    
    if not clinic_image_record or not clinic_image_record.images:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clinic images not found"
        )
    
    images = clinic_image_record.images
    if image_index < 0 or image_index >= len(images):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image index out of range"
        )
    
    image_data = images[image_index]
    image_bytes = base64.b64decode(image_data["image_data"])
    
    from fastapi.responses import Response
    return Response(
        content=image_bytes,
        media_type=image_data["image_type"]
    )

@router.delete("/clinic/image/{clinic_id}/{image_index}")
async def delete_clinic_image(
    clinic_id: str,
    image_index: int,
    db: AsyncSession = Depends(get_db)
):
    """Delete a clinic image by index - renumbers remaining images"""
    # Get clinic image record
    result = await db.execute(select(ClinicImage).where(ClinicImage.clinic_id == clinic_id))
    clinic_image_record = result.scalar_one_or_none()
    
    if not clinic_image_record or not clinic_image_record.images:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clinic images not found"
        )
    
    images = clinic_image_record.images or []
    if image_index < 0 or image_index >= len(images):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image index out of range"
        )
    
    # Remove the image at index and renumber remaining
    remaining_images = [img for i, img in enumerate(images) if i != image_index]
    clinic_image_record.images = remaining_images
    
    # Update clinic.image_urls with renumbered URLs
    clinic_result = await db.execute(select(Clinic).where(Clinic.clinic_id == clinic_id))
    clinic = clinic_result.scalar_one_or_none()
    if clinic:
        new_urls = [f"/auth/clinic/image/{clinic_id}/{i}" for i in range(len(remaining_images))]
        clinic.image_urls = new_urls
    
    await db.commit()
    
    return {
        "message": "Image deleted successfully", 
        "deleted_index": image_index,
        "total_images": len(remaining_images),
        "image_urls": new_urls if clinic else []
    }

@router.delete("/clinic/delete")
async def clinic_delete_account(
    request: DeleteAccountRequest,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Clinic).where(Clinic.clinic_id == request.patient_email))
    clinic = result.scalar_one_or_none()
    
    if not clinic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clinic not found"
        )
    
    # Verify password
    if not verify_password(request.password, clinic.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Password is incorrect"
        )
    
    # Verify confirmation
    if request.confirmation != "DELETE":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Confirmation must be 'DELETE'"
        )
    
    # Delete clinic account
    await db.delete(clinic)
    await db.commit()
    
    return {"message": "Account deleted successfully"}

# Patient Profile Management Endpoints
@router.put("/patient/change-password")
async def patient_change_password(
    request: ChangePasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Patient).where(Patient.email == request.patient_email))
    patient = result.scalar_one_or_none()
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # Verify current password
    if not verify_password(request.current_password, patient.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect"
        )
    
    # Update password
    patient.password = hash_password(request.new_password)
    await db.commit()
    
    return {"message": "Password changed successfully"}

@router.put("/patient/change-phone")
async def patient_change_phone(
    request: ChangePhoneRequest,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Patient).where(Patient.email == request.patient_email))
    patient = result.scalar_one_or_none()
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # Update phone
    patient.phone = request.new_phone
    await db.commit()
    
    return {"message": "Phone number updated successfully"}

@router.delete("/patient/delete-account")
async def patient_delete_account(
    request: DeleteAccountRequest,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Patient).where(Patient.email == request.patient_email))
    patient = result.scalar_one_or_none()
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # Verify password
    if not verify_password(request.password, patient.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Password is incorrect"
        )
    
    # Verify confirmation
    if request.confirmation != "DELETE":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Confirmation must be 'DELETE'"
        )
    
    # Delete patient account
    await db.delete(patient)
    await db.commit()
    
    return {"message": "Account deleted successfully"}

# ============= OTP VERIFICATION ENDPOINTS =============

@router.post("/register/send-otp", response_model=OTPResponse)
async def register_send_otp(
    request: PatientSignup,  # Reuse PatientSignup schema for user data
    db: AsyncSession = Depends(get_db)
):
    """
    Store user data and send OTP for registration.
    This is the first step in the OTP registration flow.
    """
    email = request.email.strip().lower()
    
    # Check if patient already exists (already verified)
    result = await db.execute(select(Patient).where(Patient.email == email))
    existing_patient = result.scalar_one_or_none()
    
    if existing_patient:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    valid, error_msg = validate_password_strength(request.password)
    if not valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )
    
    # Check if there's already a pending OTP
    from app.database.models import OTPVerification
    otp_result = await db.execute(
        select(OTPVerification).where(OTPVerification.email == email)
    )
    existing_otp = otp_result.scalar_one_or_none()
    
    if existing_otp and not existing_otp.is_verified:
        # Delete existing pending record
        await db.delete(existing_otp)
        await db.commit()
    
    # Hash password
    hashed_password = hash_password(request.password)
    
    # Create OTP with user data
    otp_code, success = await OTPService.create_otp_with_user_data(
        db, email,
        name=request.name,
        password=hashed_password,
        phone=request.phone
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Please wait before requesting a new OTP"
        )
    
    # Send OTP via email
    from app.services.email_service import send_otp as send_otp_email
    email_sent = send_otp_email(email, otp_code)
    
    if not email_sent:
        # Delete OTP record if email failed
        otp_result = await db.execute(
            select(OTPVerification).where(OTPVerification.email == email)
        )
        otp_record = otp_result.scalar_one_or_none()
        if otp_record:
            await db.delete(otp_record)
            await db.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send OTP email"
        )
    
    return {
        "message": f"OTP sent to {email}",
        "success": True,
        "expires_in": 300  # 5 minutes in seconds
    }

@router.post("/send-otp", response_model=OTPResponse)
async def send_otp(request: SendOTPRequest, db: AsyncSession = Depends(get_db)):
    """
    Send OTP to email for verification (resend case).
    """
    email = request.email.strip().lower()
    
    # Check if patient already exists (already verified)
    result = await db.execute(select(Patient).where(Patient.email == email))
    existing_patient = result.scalar_one_or_none()
    
    if existing_patient:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered and verified"
        )
    
    # Send OTP
    success, message = await OTPService.send_otp(db, email)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=message
        )
    
    return {
        "message": message,
        "success": True,
        "expires_in": 300  # 5 minutes in seconds
    }

@router.post("/verify-otp", response_model=OTPVerifyResponse)
async def verify_otp(request: VerifyOTPRequest, db: AsyncSession = Depends(get_db)):
    """
    Verify OTP code and create patient account.
    """
    email = request.email.strip().lower()
    otp_code = request.otp_code.strip()
    
    # Verify OTP
    success, message = await OTPService.verify_otp(db, email, otp_code)
    
    if not success:
        return OTPVerifyResponse(
            message=message,
            success=False,
            verified=False
        )
    
    # OTP verified - delete the OTP record
    await OTPService.delete_otp(db, email)
    
    return OTPVerifyResponse(
        message="OTP verified successfully",
        success=True,
        verified=True
    )

@router.post("/resend-otp", response_model=OTPResponse)
async def resend_otp(request: SendOTPRequest, db: AsyncSession = Depends(get_db)):
    """
    Resend OTP to email.
    """
    email = request.email.strip().lower()
    
    # Resend OTP
    success, message = await OTPService.resend_otp(db, email)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=message
        )
    
    return {
        "message": message,
        "success": True,
        "expires_in": 300  # 5 minutes in seconds
    }

@router.get("/otp/status")
async def get_otp_status(email: str = Query(..., description="Email to check"), db: AsyncSession = Depends(get_db)):
    """
    Check if email has been verified.
    """
    from app.services.otp_service import OTPService
    is_verified = await OTPService.is_email_verified(db, email)
    
    return {
        "email": email,
        "is_verified": is_verified
    }

# ============= APPOINTMENT ENDPOINTS =============

@router.post("/appointments/create")
async def create_appointment(
    request: dict,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new appointment with auto-incrementing token number.
    Stop booking X minutes before clinic end time.
    """
    from datetime import datetime, timedelta
    
    clinic_id = request.get("clinic_id")
    patient_id = request.get("patient_id")
    patient_name = request.get("patient_name")
    patient_email = request.get("patient_email")
    patient_phone = request.get("patient_phone", "")
    doctor_name = request.get("doctor_name", "")
    date = request.get("date")
    time = request.get("time")
    
    # Validate required fields
    if not all([clinic_id, patient_id, patient_name, patient_email, date, time]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing required fields"
        )
    
    # Get clinic details
    result = await db.execute(
        select(Clinic).where(Clinic.clinic_id == clinic_id)
    )
    clinic = result.scalar_one_or_none()
    
    if not clinic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clinic not found"
        )
    
    # Check if booking is still allowed (cutoff time)
    if clinic.end is not None:
        now = datetime.now()
        cutoff_minutes = clinic.booking_cutoff_minutes or 15
        
        # Create today's end time datetime
        end_hour = clinic.end
        end_time_today = now.replace(hour=end_hour, minute=0, second=0, microsecond=0)
        cutoff_time = end_time_today - timedelta(minutes=cutoff_minutes)
        
        # If current time is past cutoff, reject booking
        if now >= cutoff_time:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Booking closed — doctor will not be available before end time. Last booking at {cutoff_time.strftime('%H:%M')}."
            )
    
    # Check if patient already has an appointment for this clinic on this date
    result = await db.execute(
        select(Appointment).where(
            Appointment.clinic_id == clinic_id,
            Appointment.patient_email == patient_email,
            Appointment.date == date
        )
    )
    existing_appointment = result.scalar_one_or_none()
    
    if existing_appointment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have an appointment booked for this clinic on this date"
        )
    
    # Get next token number for this clinic AND date (start from T-0 for each date)
    # Count from BOTH tables (online appointments + QR walk-ins) for unified numbering
    result = await db.execute(
        select(Appointment).where(
            Appointment.clinic_id == clinic_id,
            Appointment.date == date
        )
    )
    online_count = len(result.scalars().all())

    result = await db.execute(
        select(QRAppointment).where(
            QRAppointment.clinic_id == clinic_id,
            QRAppointment.date == date
        )
    )
    qr_count = len(result.scalars().all())

    # Get highest token number from all three tables (active + completed)
    max_token = -1
    
    # Check online appointments
    result = await db.execute(
        select(Appointment).where(
            Appointment.clinic_id == clinic_id,
            Appointment.date == date
        )
    )
    for apt in result.scalars().all():
        if apt.appointment_token:
            try:
                token_num = int(apt.appointment_token.replace("T-", ""))
                if token_num > max_token:
                    max_token = token_num
            except:
                pass
    
    # Check QR appointments
    result = await db.execute(
        select(QRAppointment).where(
            QRAppointment.clinic_id == clinic_id,
            QRAppointment.date == date
        )
    )
    for apt in result.scalars().all():
        if apt.appointment_token:
            try:
                token_num = int(apt.appointment_token.replace("T-", ""))
                if token_num > max_token:
                    max_token = token_num
            except:
                pass
    
    # Check completed appointments for today
    result = await db.execute(
        select(CompletedAppointment).where(
            CompletedAppointment.clinic_id == clinic_id,
            CompletedAppointment.date == date
        )
    )
    for apt in result.scalars().all():
        if apt.appointment_token:
            try:
                token_num = int(apt.appointment_token.replace("T-", ""))
                if token_num > max_token:
                    max_token = token_num
            except:
                pass

    # Next token is highest + 1
    next_token_number = max_token + 1
    appointment_token = f"T-{next_token_number}"
    
    # Create appointment
    new_appointment = Appointment(
        appointment_token=appointment_token,
        clinic_id=clinic_id,
        patient_id=patient_id,
        patient_name=patient_name,
        patient_email=patient_email,
        patient_phone=patient_phone or "Not provided",
        doctor_name=doctor_name,
        date=date,
        time=time,
        status="booked"
    )
    
    db.add(new_appointment)
    await db.commit()
    await db.refresh(new_appointment)
    
    return {
        "message": "Appointment booked successfully",
        "appointment_id": new_appointment.id,
        "token": appointment_token,
        "patient_name": patient_name,
        "patient_phone": patient_phone,
        "patient_email": patient_email,
        "clinic_id": clinic_id,
        "date": date,
        "time": time
    }

@router.get("/appointments/clinic/{clinic_id}")
async def get_clinic_appointments(
    clinic_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get all appointments for a specific clinic.
    """
    result = await db.execute(
        select(Appointment).where(Appointment.clinic_id == clinic_id).order_by(Appointment.id)
    )
    appointments = result.scalars().all()
    
    appointment_list = []
    for apt in appointments:
        appointment_list.append({
            "id": apt.id,
            "token": apt.appointment_token,
            "patient_id": apt.patient_id,
            "patient_name": apt.patient_name,
            "patient_email": apt.patient_email,
            "patient_phone": apt.patient_phone,
            "doctor_name": apt.doctor_name,
            "date": apt.date,
            "time": apt.time,
            "status": apt.status,
            "created_at": apt.created_at
        })
    
    return {"appointments": appointment_list, "total": len(appointment_list)}

@router.get("/appointments/patient/{patient_id}")
async def get_patient_appointments(
    patient_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get all appointments for a specific patient.
    """
    result = await db.execute(
        select(Appointment).where(Appointment.patient_id == patient_id).order_by(Appointment.id)
    )
    appointments = result.scalars().all()
    
    appointment_list = []
    for apt in appointments:
        appointment_list.append({
            "id": apt.id,
            "token": apt.appointment_token,
            "clinic_id": apt.clinic_id,
            "doctor_name": apt.doctor_name,
            "date": apt.date,
            "time": apt.time,
            "status": apt.status
        })
    
    return {"appointments": appointment_list, "total": len(appointment_list)}

@router.get("/patient/appointments")
async def get_patient_appointments_by_email(
    email: str = Query(..., description="Patient email"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all appointments for a specific patient by email.
    """
    from app.database.models import Clinic
    
    result = await db.execute(
        select(Appointment).where(Appointment.patient_email == email).order_by(Appointment.id)
    )
    appointments = result.scalars().all()
    
    appointment_list = []
    for apt in appointments:
        clinic_name = apt.clinic_id
        clinic_result = await db.execute(
            select(Clinic).where(Clinic.clinic_id == apt.clinic_id)
        )
        clinic = clinic_result.scalar_one_or_none()
        if clinic:
            clinic_name = clinic.clinic_name
            
        appointment_list.append({
            "id": apt.id,
            "appointment_token": apt.appointment_token,
            "clinic_id": apt.clinic_id,
            "clinic_name": clinic_name,
            "address": clinic.address if clinic else "",
            "patient_id": apt.patient_id,
            "patient_name": apt.patient_name,
            "patient_email": apt.patient_email,
            "patient_phone": apt.patient_phone,
            "doctor_name": apt.doctor_name,
            "date": apt.date,
            "time": apt.time,
            "status": apt.status,
            "created_at": apt.created_at
        })
    
    return {"appointments": appointment_list, "total": len(appointment_list)}

@router.get("/clinic/appointments")
async def get_clinic_appointments(
    clinic_id: str = Query(..., description="Clinic ID"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get today's appointments for a specific clinic with patient details.
    Only fetches appointments for today's date.
    """
    from datetime import datetime
    today = datetime.now().strftime("%Y-%m-%d")
    
    result = await db.execute(
        select(Appointment).where(
            Appointment.clinic_id == clinic_id,
            Appointment.date == today
        ).order_by(Appointment.id)
    )
    appointments = result.scalars().all()
    
    appointment_list = []
    for apt in appointments:
        appointment_list.append({
            "id": apt.id,
            "token": apt.appointment_token,
            "patient_id": apt.patient_id,
            "patient_name": apt.patient_name,
            "patient_email": apt.patient_email,
            "patient_phone": apt.patient_phone,
            "doctor_name": apt.doctor_name,
            "date": apt.date,
            "time": apt.time,
            "status": apt.status,
            "created_at": apt.created_at
        })
    
    return {"appointments": appointment_list, "total": len(appointment_list)}

@router.get("/appointments/today")
async def get_today_appointments(
    clinic_id: str = Query(..., description="Clinic ID"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get today's appointments for a specific clinic from both:
    - appointments table (online bookings)
    - qr_appointments table (QR walk-in bookings)
    Returns combined list ordered by creation time.
    """
    from datetime import datetime
    today = datetime.now().strftime("%Y-%m-%d")

    # Fetch online appointments from appointments table
    result = await db.execute(
        select(Appointment).where(
            Appointment.clinic_id == clinic_id,
            Appointment.date == today
        ).order_by(Appointment.id)
    )
    online_appointments = result.scalars().all()

    # Fetch QR walk-in appointments from qr_appointments table
    result = await db.execute(
        select(QRAppointment).where(
            QRAppointment.clinic_id == clinic_id,
            QRAppointment.date == today
        ).order_by(QRAppointment.id)
    )
    qr_appointments = result.scalars().all()

    # Combine both lists
    appointment_list = []

    # Add online appointments
    for apt in online_appointments:
        appointment_list.append({
            "id": apt.id,
            "token": apt.appointment_token,
            "clinic_id": apt.clinic_id,
            "patient_id": apt.patient_id,
            "patient_name": apt.patient_name,
            "patient_email": apt.patient_email,
            "patient_phone": apt.patient_phone,
            "doctor_name": apt.doctor_name,
            "date": apt.date,
            "time": apt.time,
            "status": apt.status,
            "created_at": apt.created_at,
            "source": apt.source or "online"
        })

    # Add QR walk-in appointments
    for apt in qr_appointments:
        appointment_list.append({
            "id": apt.id,
            "token": apt.appointment_token,
            "clinic_id": apt.clinic_id,
            "patient_id": f"qr-{apt.id}",  # QR appointments don't have patient_id
            "patient_name": apt.patient_name,
            "patient_email": "",  # QR appointments don't have email
            "patient_phone": apt.patient_phone,
            "doctor_name": apt.doctor_name,
            "date": apt.date,
            "time": "walk-in",
            "status": apt.status,
            "created_at": apt.created_at,
            "source": "walkin"
        })

    # Sort by created_at time
    appointment_list.sort(key=lambda x: x["created_at"] or datetime.min)

    return {"appointments": appointment_list, "total": len(appointment_list)}

@router.delete("/appointments/{appointment_id}")
async def delete_appointment(
    appointment_id: int,
    source: str = Query("online", description="Source type: online or walkin"),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete an appointment by ID.
    Handles both online appointments (appointments table) and QR walk-ins (qr_appointments table).
    """
    if source == "walkin":
        # Try to find and delete from qr_appointments table
        result = await db.execute(
            select(QRAppointment).where(QRAppointment.id == appointment_id)
        )
        appointment = result.scalar_one_or_none()
        if appointment:
            await db.delete(appointment)
            await db.commit()
            return {"message": "QR walk-in appointment deleted successfully"}
    else:
        # Try to find and delete from appointments table
        result = await db.execute(
            select(Appointment).where(Appointment.id == appointment_id)
        )
        appointment = result.scalar_one_or_none()
        if appointment:
            await db.delete(appointment)
            await db.commit()
            return {"message": "Appointment deleted successfully"}

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Appointment not found"
    )

@router.get("/appointments/queue-position")
async def get_queue_position(
    clinic_id: str = Query(..., description="Clinic ID"),
    appointment_token: str = Query(..., description="Appointment Token"),
    appointment_id: int = Query(..., description="Appointment ID"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get queue position for a specific appointment.
    Returns number of patients ahead, estimated wait time, and current position.
    """
    from datetime import datetime

    def parse_token_number(token: str | None) -> int:
        if not token:
            return 0
        digits = "".join(ch for ch in token if ch.isdigit())
        return int(digits) if digits else 0
    
    # Get today's date
    today = datetime.now().strftime("%Y-%m-%d")
    
    # Get all active appointments for this clinic today.
    result = await db.execute(
        select(Appointment).where(
            Appointment.clinic_id == clinic_id,
            Appointment.date == today,
            Appointment.status.in_(["booked", "serving"])
        )
    )
    appointments = result.scalars().all()
    appointments = sorted(
        appointments,
        key=lambda apt: (parse_token_number(apt.appointment_token), apt.id)
    )
    
    # Find the current appointment's position
    total_in_queue = len(appointments)
    
    your_position = 0
    patients_ahead = 0
    
    current_appointment = None
    for index, apt in enumerate(appointments):
        if apt.id == appointment_id or apt.appointment_token == appointment_token:
            current_appointment = apt
            your_position = index + 1
            patients_ahead = index
            break

    if current_appointment is None:
        your_position = min(parse_token_number(appointment_token) + 1, total_in_queue) if total_in_queue else 1
        patients_ahead = max(your_position - 1, 0)
    
    serving_appointment = next((apt for apt in appointments if apt.status == "serving"), None)
    if serving_appointment:
        now_serving_token = serving_appointment.appointment_token
    elif current_appointment and your_position > 1:
        now_serving_token = appointments[your_position - 2].appointment_token
    elif appointments:
        now_serving_token = appointments[0].appointment_token
    else:
        now_serving_token = appointment_token
    
    # Calculate estimated wait time (15 minutes per patient ahead)
    estimated_wait_minutes = patients_ahead * 15
    
    return {
        "patients_ahead": patients_ahead,
        "estimated_wait_minutes": estimated_wait_minutes,
        "your_position": your_position,
        "total_in_queue": total_in_queue,
        "current_token": your_position,
        "now_serving_token": now_serving_token,
        "status": "in_queue"
    }

# Review Endpoints
@router.get("/reviews/patient")
async def get_patient_reviews(
    patient_id: str = Query(..., description="Patient ID"),
    db: AsyncSession = Depends(get_db)
):
    """Get all reviews written by a patient"""
    result = await db.execute(
        select(Review).where(Review.patient_id == patient_id).order_by(Review.created_at.desc())
    )
    reviews = result.scalars().all()
    
    review_list = []
    for r in reviews:
        review_list.append({
            "id": r.id,
            "clinic_id": r.clinic_id,
            "patient_id": r.patient_id,
            "patient_name": r.patient_name,
            "rating": r.rating,
            "review_text": r.review_text,
            "likes": r.likes,
            "dislikes": r.dislikes,
            "created_at": r.created_at
        })
    
    return {"reviews": review_list, "total": len(review_list)}

@router.get("/reviews/clinic")
async def get_clinic_reviews(
    clinic_id: str = Query(..., description="Clinic ID"),
    db: AsyncSession = Depends(get_db)
):
    """Get all reviews for a clinic"""
    result = await db.execute(
        select(Review).where(Review.clinic_id == clinic_id).order_by(Review.created_at.desc())
    )
    reviews = result.scalars().all()
    
    # Calculate average rating
    total_rating = sum(r.rating for r in reviews)
    avg_rating = round(total_rating / len(reviews), 1) if reviews else 0
    
    review_list = []
    for r in reviews:
        review_list.append({
            "id": r.id,
            "patient_name": r.patient_name,
            "rating": r.rating,
            "review_text": r.review_text,
            "likes": r.likes,
            "dislikes": r.dislikes,
            "created_at": r.created_at
        })
    
    return {
        "reviews": review_list,
        "total": len(review_list),
        "average_rating": avg_rating
    }

@router.post("/reviews/create")
async def create_review(
    request: dict,
    db: AsyncSession = Depends(get_db)
):
    """Create a new review for a clinic"""
    clinic_id = request.get("clinic_id")
    patient_id = request.get("patient_id")
    patient_name = request.get("patient_name")
    rating = request.get("rating")
    review_text = request.get("review_text", "")
    
    if not clinic_id or not patient_id or not rating:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="clinic_id, patient_id, and rating are required"
        )
    
    # Check if review already exists for this patient and clinic
    result = await db.execute(
        select(Review).where(
            Review.clinic_id == clinic_id,
            Review.patient_id == patient_id
        )
    )
    existing_review = result.scalar_one_or_none()
    
    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already reviewed this clinic"
        )
    
    # Create review
    new_review = Review(
        clinic_id=clinic_id,
        patient_id=patient_id,
        patient_name=patient_name,
        rating=rating,
        review_text=review_text,
        likes=0,
        dislikes=0
    )
    
    db.add(new_review)
    await db.commit()
    await db.refresh(new_review)
    
    return {
        "message": "Review created successfully",
        "id": new_review.id,
        "rating": rating,
        "review_text": review_text,
        "likes": 0,
        "dislikes": 0
    }

@router.get("/patient/completed-appointments")
async def get_patient_completed_appointments(
    patient_id: str = Query(..., description="Patient ID"),
    db: AsyncSession = Depends(get_db)
):
    """Get completed appointments for a patient, grouped by clinic (one per clinic)"""
    # Get all completed appointments for this patient
    result = await db.execute(
        select(CompletedAppointment).where(
            CompletedAppointment.patient_id == patient_id
        ).order_by(CompletedAppointment.served_at.desc())
    )
    completed = result.scalars().all()
    
    # Get patient's existing reviews
    result = await db.execute(
        select(Review).where(Review.patient_id == patient_id)
    )
    reviews = result.scalars().all()
    reviewed_clinic_ids = set(r.clinic_id for r in reviews)
    
    # Get clinic names for all visited clinics
    clinic_ids = list(set(apt.clinic_id for apt in completed))
    clinic_names = {}
    if clinic_ids:
        result = await db.execute(
            select(Clinic).where(Clinic.clinic_id.in_(clinic_ids))
        )
        clinics = result.scalars().all()
        for clinic in clinics:
            clinic_names[clinic.clinic_id] = clinic.clinic_name
    
    # Group by clinic_id and get the most recent visit per clinic
    clinic_visits = {}
    for apt in completed:
        if apt.clinic_id not in clinic_visits:
            clinic_visits[apt.clinic_id] = {
                "clinic_id": apt.clinic_id,
                "clinic_name": clinic_names.get(apt.clinic_id, apt.doctor_name or "Clinic"),
                "date": apt.date,
                "time": apt.time,
                "served_at": apt.served_at,
                "has_reviewed": apt.clinic_id in reviewed_clinic_ids
            }
    
    visit_list = list(clinic_visits.values())
    
    return {"visits": visit_list, "total": len(visit_list)}

@router.post("/reviews/like")
async def like_review(
    review_id: int = Query(..., description="Review ID"),
    patient_id: str = Query(..., description="Patient ID"),
    db: AsyncSession = Depends(get_db)
):
    """Like a review - patient can only like or dislike, not both"""
    # Get the review
    result = await db.execute(
        select(Review).where(Review.id == review_id)
    )
    review = result.scalar_one_or_none()
    
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    
    # Check if patient already reacted to this review
    result = await db.execute(
        select(ReviewReaction).where(
            ReviewReaction.review_id == review_id,
            ReviewReaction.patient_id == patient_id
        )
    )
    existing = result.scalar_one_or_none()
    
    if existing:
        if existing.reaction_type == "like":
            # Already liked - remove it (toggle off)
            await db.delete(existing)
            review.likes = max((review.likes or 0) - 1, 0)
            await db.commit()
            return {"message": "Like removed", "likes": review.likes, "dislikes": review.dislikes, "user_reaction": None}
        else:
            # Previously disliked - switch to like
            existing.reaction_type = "like"
            review.dislikes = max((review.dislikes or 0) - 1, 0)
            review.likes = (review.likes or 0) + 1
            await db.commit()
            return {"message": "Switched to like", "likes": review.likes, "dislikes": review.dislikes, "user_reaction": "like"}
    else:
        # New like
        db.add(ReviewReaction(review_id=review_id, patient_id=patient_id, reaction_type="like"))
        review.likes = (review.likes or 0) + 1
        await db.commit()
        return {"message": "Review liked", "likes": review.likes, "dislikes": review.dislikes, "user_reaction": "like"}

@router.post("/reviews/dislike")
async def dislike_review(
    review_id: int = Query(..., description="Review ID"),
    patient_id: str = Query(..., description="Patient ID"),
    db: AsyncSession = Depends(get_db)
):
    """Dislike a review - patient can only like or dislike, not both"""
    # Get the review
    result = await db.execute(
        select(Review).where(Review.id == review_id)
    )
    review = result.scalar_one_or_none()
    
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    
    # Check if patient already reacted to this review
    result = await db.execute(
        select(ReviewReaction).where(
            ReviewReaction.review_id == review_id,
            ReviewReaction.patient_id == patient_id
        )
    )
    existing = result.scalar_one_or_none()
    
    if existing:
        if existing.reaction_type == "dislike":
            # Already disliked - remove it (toggle off)
            await db.delete(existing)
            review.dislikes = max((review.dislikes or 0) - 1, 0)
            await db.commit()
            return {"message": "Dislike removed", "likes": review.likes, "dislikes": review.dislikes, "user_reaction": None}
        else:
            # Previously liked - switch to dislike
            existing.reaction_type = "dislike"
            review.likes = max((review.likes or 0) - 1, 0)
            review.dislikes = (review.dislikes or 0) + 1
            await db.commit()
            return {"message": "Switched to dislike", "likes": review.likes, "dislikes": review.dislikes, "user_reaction": "dislike"}
    else:
        # New dislike
        db.add(ReviewReaction(review_id=review_id, patient_id=patient_id, reaction_type="dislike"))
        review.dislikes = (review.dislikes or 0) + 1
        await db.commit()
        return {"message": "Review disliked", "likes": review.likes, "dislikes": review.dislikes, "user_reaction": "dislike"}

@router.get("/reviews/user-reaction")
async def get_user_reactions(
    clinic_id: str = Query(..., description="Clinic ID"),
    patient_id: str = Query(..., description="Patient ID"),
    db: AsyncSession = Depends(get_db)
):
    """Get patient's reactions for all reviews of a clinic"""
    result = await db.execute(
        select(Review).where(Review.clinic_id == clinic_id)
    )
    reviews = result.scalars().all()
    review_ids = [r.id for r in reviews]
    
    if not review_ids:
        return {"reactions": {}}
    
    result = await db.execute(
        select(ReviewReaction).where(
            ReviewReaction.review_id.in_(review_ids),
            ReviewReaction.patient_id == patient_id
        )
    )
    reactions = result.scalars().all()
    
    return {"reactions": {str(r.review_id): r.reaction_type for r in reactions}}

@router.get("/clinic/patients/search")
async def search_clinic_patients(
    clinic_id: str = Query(..., description="Clinic ID"),
    from_date: str = Query(None, description="From date (YYYY-MM-DD)"),
    to_date: str = Query(None, description="To date (YYYY-MM-DD)"),
    patient_id: str = Query(None, description="Patient ID"),
    email: str = Query(None, description="Patient email"),
    phone: str = Query(None, description="Patient phone"),
    db: AsyncSession = Depends(get_db)
):
    """Search patients by date range, patient ID, email, or phone in both appointments and completed_appointments"""
    
    # Helper function to build query with filters
    def build_query(model, clinic_id, from_date, to_date, patient_id, email, phone):
        query = select(model).where(model.clinic_id == clinic_id)
        
        if from_date and to_date:
            query = query.where(model.date >= from_date, model.date <= to_date)
        
        if patient_id:
            query = query.where(model.patient_id == patient_id)
        
        if email:
            query = query.where(model.patient_email.ilike(f"%{email}%"))
        
        if phone:
            query = query.where(model.patient_phone.ilike(f"%{phone}%"))
        
        return query.order_by(model.date.desc(), model.time.desc())
    
    # Search appointments table
    appointments_query = build_query(Appointment, clinic_id, from_date, to_date, patient_id, email, phone)
    result = await db.execute(appointments_query)
    appointments = result.scalars().all()
    
    # Search completed_appointments table
    completed_query = build_query(CompletedAppointment, clinic_id, from_date, to_date, patient_id, email, phone)
    result = await db.execute(completed_query)
    completed = result.scalars().all()
    
    # Combine and format results
    patients = []
    
    # Add appointments
    for apt in appointments:
        patients.append({
            "appointment_token": apt.appointment_token,
            "patient_name": apt.patient_name,
            "patient_phone": apt.patient_phone,
            "patient_id": apt.patient_id,
            "patient_email": apt.patient_email,
            "date": apt.date,
            "time": apt.time,
            "status": apt.status,
            "source": "appointment"
        })
    
    # Add completed appointments
    for apt in completed:
        patients.append({
            "appointment_token": apt.appointment_token,
            "patient_name": apt.patient_name,
            "patient_phone": apt.patient_phone,
            "patient_id": apt.patient_id,
            "patient_email": apt.patient_email,
            "date": apt.date,
            "time": apt.time,
            "status": "completed",
            "source": "completed"
        })
    
    # Remove duplicates by patient_id + date + time
    seen = set()
    unique_patients = []
    for p in patients:
        key = (p["patient_id"], p["date"], p["time"])
        if key not in seen:
            seen.add(key)
            unique_patients.append(p)
    
    return {"reactions": reaction_map}

# ============= TOKEN/JOIN QUEUE ENDPOINTS =============

@router.post("/tokens/create")
async def create_token(
    request: dict,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new token and append to the end of the queue.
    New patients join at the position after the last current patient.
    Token format: T-0, T-1, T-2, etc. (appends to end of queue).
    """
    from datetime import datetime
    
    clinic_id = request.get("clinicId")
    doctor_id = request.get("doctorId")
    category_id = request.get("categoryId")
    patient_name = request.get("patientName")
    source = request.get("source", "ONLINE")  # QR, ONLINE, etc.
    
    # Validate required fields
    if not all([clinic_id, patient_name]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="clinicId and patientName are required"
        )
    
    # Get current date
    today = datetime.now().strftime("%Y-%m-%d")
    
    # Get all active appointments for this clinic today (booked, serving status)
    result = await db.execute(
        select(Appointment).where(
            Appointment.clinic_id == clinic_id,
            Appointment.date == today,
            Appointment.status.in_(["booked", "serving"])
        ).order_by(Appointment.id)
    )
    existing_appointments = result.scalars().all()
    
    # Calculate next token number (append to end of queue)
    next_token_number = len(existing_appointments)
    token_label = f"T-{next_token_number}"
    
    # Get clinic info for doctor name
    doctor_name = ""
    if doctor_id:
        # Map doctor_id to name (simplified - you can expand this)
        doctor_names = {
            "1": "Dr. John Smith",
            "2": "Dr. Sarah Johnson", 
            "3": "Dr. Michael Brown"
        }
        doctor_name = doctor_names.get(str(doctor_id), "")
    
    # Create new appointment at the end of queue
    new_appointment = Appointment(
        appointment_token=token_label,
        clinic_id=clinic_id,
        patient_id=f"PENDING-{int(datetime.now().timestamp())}",  # Temporary ID for non-logged-in patients
        patient_name=patient_name,
        patient_email=request.get("patientEmail", ""),
        patient_phone=request.get("patientPhone", ""),
        doctor_name=doctor_name,
        date=today,
        time=datetime.now().strftime("%H:%M"),
        status="booked"
    )
    
    db.add(new_appointment)
    await db.commit()
    await db.refresh(new_appointment)
    
    return {
        "message": "Successfully joined the queue",
        "tokenLabel": token_label,
        "tokenNumber": next_token_number,
        "position": next_token_number + 1,  # 1-based position for display
        "patientsAhead": next_token_number,
        "appointmentId": new_appointment.id,
        "clinicId": clinic_id,
        "patientName": patient_name,
        "date": today
    }
    return {"patients": unique_patients, "count": len(unique_patients)}

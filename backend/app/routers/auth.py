import json
import random
import string
import re
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.database.db import get_db
from app.database.models import Clinic, Patient, OTPVerification, Appointment, CompletedAppointment, Time, Review, ReviewReaction
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
            "distance": "2.5 km"
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

@router.put("/clinic/update-availability")
async def clinic_update_availability(
    request: dict,
    db: AsyncSession = Depends(get_db)
):
    """Update clinic availability status for today"""
    clinic_id = request.get("clinic_id")
    available = request.get("available")
    
    if clinic_id is None or available is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="clinic_id and available are required"
        )
    
    result = await db.execute(select(Clinic).where(Clinic.clinic_id == clinic_id))
    clinic = result.scalar_one_or_none()
    
    if not clinic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clinic not found"
        )
    
    # Update availability
    clinic.available = available
    await db.commit()
    
    return {"message": "Availability updated successfully", "available": available}

@router.put("/clinic/save-time")
async def clinic_save_time(
    request: dict,
    db: AsyncSession = Depends(get_db)
):
    """Save clinic operating hours and unavailable time slots"""
    clinic_id = request.get("clinic_id")
    email = request.get("email") or ""
    starting = request.get("starting")
    ending = request.get("ending")
    not_available = request.get("not_available")  # Comma-separated hours like "1,11"
    
    if not clinic_id or starting is None or ending is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="clinic_id, starting, and ending are required"
        )
    
    # Update clinics table with start and end
    result = await db.execute(select(Clinic).where(Clinic.clinic_id == clinic_id))
    clinic = result.scalar_one_or_none()
    
    if clinic:
        clinic.start = starting
        clinic.end = ending
    
    # Check if record exists in times table
    result = await db.execute(select(Time).where(Time.clinic_id == clinic_id))
    time_record = result.scalar_one_or_none()
    
    if time_record:
        # Update existing record
        time_record.starting = starting
        time_record.ending = ending
        time_record.not_available = not_available or ""
    else:
        # Create new record
        new_time = Time(
            clinic_id=clinic_id,
            email=email,
            starting=starting,
            ending=ending,
            not_available=not_available or ""
        )
        db.add(new_time)
    
    await db.commit()
    
    return {
        "message": "Time saved successfully",
        "starting": starting,
        "ending": ending,
        "not_available": not_available
    }

@router.get("/clinic/get-time")
async def clinic_get_time(
    clinic_id: str = Query(...),
    db: AsyncSession = Depends(get_db)
):
    """Get clinic operating hours and unavailable time slots"""
    result = await db.execute(select(Time).where(Time.clinic_id == clinic_id))
    time_record = result.scalar_one_or_none()
    
    if not time_record:
        return {
            "starting": None,
            "ending": None,
            "not_available": ""
        }
    
    return {
        "starting": time_record.starting,
        "ending": time_record.ending,
        "not_available": time_record.not_available or ""
    }

@router.get("/clinic/time-slots")
async def clinic_get_time_slots(
    clinic_id: str = Query(...),
    date: str = Query(...),  # Format: YYYY-MM-DD
    db: AsyncSession = Depends(get_db)
):
    """Get available time slots for a clinic on a specific date"""
    # Get clinic data
    result = await db.execute(select(Clinic).where(Clinic.clinic_id == clinic_id))
    clinic = result.scalar_one_or_none()
    
    if not clinic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clinic not found"
        )
    
    # Get time data
    result = await db.execute(select(Time).where(Time.clinic_id == clinic_id))
    time_record = result.scalar_one_or_none()
    
    start_hour = time_record.starting if time_record and time_record.starting else 9
    end_hour = time_record.ending if time_record and time_record.ending else 17
    
    # Parse not_available hours (stored as comma-separated like "1,11")
    not_available_hours = []
    if time_record and time_record.not_available:
        try:
            not_available_hours = [int(x.strip()) for x in time_record.not_available.split(",") if x.strip()]
        except:
            not_available_hours = []
    
    # Get booked appointments for this date
    result = await db.execute(
        select(Appointment).where(
            Appointment.clinic_id == clinic_id,
            Appointment.date == date,
            Appointment.status == "booked"
        )
    )
    booked_appointments = result.scalars().all()
    booked_times = [apt.time for apt in booked_appointments]
    
    # Check if this is today (apply not_available only for today)
    today = datetime.now().strftime("%Y-%m-%d")
    is_today = date == today
    
    # Get current hour for today filtering
    current_hour = datetime.now().hour
    
    # Generate time slots (1-hour intervals)
    slots = []
    for hour in range(start_hour, end_hour + 1):
        slot_time = f"{hour:02d}:00"
        
        # For today: check not_available AND booked AND past time
        # For tomorrow/day after: only check booked (show full availability)
        if is_today:
            # Check if slot is in the past (hour < current hour)
            is_past = hour < current_hour
            is_available = not is_past and hour not in not_available_hours and slot_time not in booked_times
        else:
            is_available = slot_time not in booked_times
        
        # Format for display
        display_time = ""
        if hour == 12:
            display_time = "12:00 PM"
        elif hour > 12:
            display_time = f"{hour - 12}:00 PM"
        else:
            display_time = f"{hour}:00 AM"
        
        slots.append({
            "time": slot_time,
            "display": display_time,
            "available": is_available
        })
    
    return {
        "clinic_id": clinic_id,
        "date": date,
        "is_today": is_today,
        "start_hour": start_hour,
        "end_hour": end_hour,
        "slots": slots,
        "booked_count": len(booked_times)
    }

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
    Token format: T-1, T-2, T-3, etc.
    """
    clinic_id = request.get("clinic_id")
    patient_id = request.get("patient_id")
    patient_name = request.get("patient_name")
    patient_email = request.get("patient_email")
    patient_phone = request.get("patient_phone", "")
    doctor_name = request.get("doctor_name", "")
    date = request.get("date")
    time = request.get("time")
    
    # Validate required fields (patient_phone is optional)
    if not all([clinic_id, patient_id, patient_name, patient_email, date, time]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing required fields"
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
    result = await db.execute(
        select(Appointment).where(
            Appointment.clinic_id == clinic_id,
            Appointment.date == date
        )
    )
    existing_appointments = result.scalars().all()
    
    # Calculate next token number (start from T-0, increment by 1 for each date)
    next_token_number = len(existing_appointments)
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
        "doctor_name": doctor_name,
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
    result = await db.execute(
        select(Appointment).where(Appointment.patient_email == email).order_by(Appointment.id)
    )
    appointments = result.scalars().all()
    
    appointment_list = []
    for apt in appointments:
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
    
    # Get today's date
    today = datetime.now().strftime("%Y-%m-%d")
    
    # Get all booked appointments for this clinic today, ordered by ID
    result = await db.execute(
        select(Appointment).where(
            Appointment.clinic_id == clinic_id,
            Appointment.date == today,
            Appointment.status == "booked"
        ).order_by(Appointment.id)
    )
    appointments = result.scalars().all()
    
    # Find the current appointment's position
    total_in_queue = len(appointments)
    
    your_position = 0
    patients_ahead = 0
    
    for index, apt in enumerate(appointments):
        if apt.id == appointment_id:
            your_position = index + 1
            patients_ahead = index
            break
    
    # Get current serving token (first appointment in queue that hasn't been served)
    current_token_num = 1
    if appointments and len(appointments) > 0:
        current_token_num = 1  # Start from T-0
    
    # Calculate estimated wait time (15 minutes per patient ahead)
    estimated_wait_minutes = patients_ahead * 15
    
    return {
        "patients_ahead": patients_ahead,
        "estimated_wait_minutes": estimated_wait_minutes,
        "your_position": your_position,
        "total_in_queue": total_in_queue,
        "current_token": current_token_num,
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
    
    # Check if patient already has a reaction to this review
    result = await db.execute(
        select(ReviewReaction).where(
            ReviewReaction.review_id == review_id,
            ReviewReaction.patient_id == patient_id
        )
    )
    existing_reaction = result.scalar_one_or_none()
    
    if existing_reaction:
        if existing_reaction.reaction_type == "like":
            # Already liked - remove the like (toggle off)
            await db.delete(existing_reaction)
            review.likes = max((review.likes or 0) - 1, 0)
            await db.commit()
            return {
                "message": "Like removed",
                "likes": review.likes,
                "dislikes": review.dislikes,
                "user_reaction": None
            }
        else:
            # Previously disliked - switch to like
            existing_reaction.reaction_type = "like"
            review.dislikes = max((review.dislikes or 0) - 1, 0)
            review.likes = (review.likes or 0) + 1
            await db.commit()
            return {
                "message": "Switched to like",
                "likes": review.likes,
                "dislikes": review.dislikes,
                "user_reaction": "like"
            }
    else:
        # No previous reaction - add like
        new_reaction = ReviewReaction(
            review_id=review_id,
            patient_id=patient_id,
            reaction_type="like"
        )
        db.add(new_reaction)
        review.likes = (review.likes or 0) + 1
        await db.commit()
        return {
            "message": "Review liked",
            "likes": review.likes,
            "dislikes": review.dislikes,
            "user_reaction": "like"
        }

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
    
    # Check if patient already has a reaction to this review
    result = await db.execute(
        select(ReviewReaction).where(
            ReviewReaction.review_id == review_id,
            ReviewReaction.patient_id == patient_id
        )
    )
    existing_reaction = result.scalar_one_or_none()
    
    if existing_reaction:
        if existing_reaction.reaction_type == "dislike":
            # Already disliked - remove the dislike (toggle off)
            await db.delete(existing_reaction)
            review.dislikes = max((review.dislikes or 0) - 1, 0)
            await db.commit()
            return {
                "message": "Dislike removed",
                "likes": review.likes,
                "dislikes": review.dislikes,
                "user_reaction": None
            }
        else:
            # Previously liked - switch to dislike
            existing_reaction.reaction_type = "dislike"
            review.likes = max((review.likes or 0) - 1, 0)
            review.dislikes = (review.dislikes or 0) + 1
            await db.commit()
            return {
                "message": "Switched to dislike",
                "likes": review.likes,
                "dislikes": review.dislikes,
                "user_reaction": "dislike"
            }
    else:
        # No previous reaction - add dislike
        new_reaction = ReviewReaction(
            review_id=review_id,
            patient_id=patient_id,
            reaction_type="dislike"
        )
        db.add(new_reaction)
        review.dislikes = (review.dislikes or 0) + 1
        await db.commit()
        return {
            "message": "Review disliked",
            "likes": review.likes,
            "dislikes": review.dislikes,
            "user_reaction": "dislike"
        }

@router.get("/reviews/user-reaction")
async def get_user_reactions(
    clinic_id: str = Query(..., description="Clinic ID"),
    patient_id: str = Query(..., description="Patient ID"),
    db: AsyncSession = Depends(get_db)
):
    """Get all reactions by a patient for reviews of a specific clinic"""
    # Get all reviews for this clinic
    result = await db.execute(
        select(Review).where(Review.clinic_id == clinic_id)
    )
    reviews = result.scalars().all()
    review_ids = [r.id for r in reviews]
    
    if not review_ids:
        return {"reactions": {}}
    
    # Get patient's reactions for these reviews
    result = await db.execute(
        select(ReviewReaction).where(
            ReviewReaction.review_id.in_(review_ids),
            ReviewReaction.patient_id == patient_id
        )
    )
    reactions = result.scalars().all()
    
    # Build map of review_id -> reaction_type
    reaction_map = {str(r.review_id): r.reaction_type for r in reactions}
    
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

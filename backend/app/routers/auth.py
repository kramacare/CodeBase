import json

import random

import string

import os

from datetime import datetime

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query, Header

from sqlalchemy.ext.asyncio import AsyncSession

from sqlalchemy import select, delete

from app.database.db import engine, get_db

from app.database.models import Base, Clinic, Patient, Appointment, QueueHistory

from app.schemas import (
    ClinicSignup, ClinicLogin, PatientSignup, PatientLogin,
    ChangePasswordRequest, ChangePhoneRequest, DeleteAccountRequest,
    AuthResponse, AppointmentCreateRequest, AppointmentResponse
)

from app.security import hash_password, verify_password

from fastapi.responses import JSONResponse


# JWT Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"


def generate_clinic_id():

    """Generate unique clinic ID like FA23W3"""

    # Generate 2 random letters

    letters = ''.join(random.choices(string.ascii_uppercase, k=2))

    # Generate 2 random digits

    digits = ''.join(random.choices(string.digits, k=2))

    # Generate 3 random letters

    more_letters = ''.join(random.choices(string.ascii_uppercase, k=3))

    

    return f"{letters}{digits}{more_letters}"



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

    

    hashed_password = hash_password(patient_data.password)

    

    new_patient = Patient(

        name=patient_data.name,

        email=patient_data.email,

        password=hashed_password,

        phone=patient_data.phone

    )

    

    db.add(new_patient)

    await db.commit()

    await db.refresh(new_patient)

    

    return AuthResponse(message="Signup successful")



@router.post("/patient/login", response_model=AuthResponse)

async def patient_login(login_data: PatientLogin, db: AsyncSession = Depends(get_db)):

    print(f"🔍 Login attempt for email: '{login_data.email}'")

    print(f"🔍 Email length: {len(login_data.email)}")

    print(f"🔍 Email stripped: '{login_data.email.strip()}'")

    

    result = await db.execute(select(Patient).where(Patient.email == login_data.email.strip()))

    patient = result.scalar_one_or_none()

    

    if not patient or not verify_password(login_data.password, patient.password):

        print(f"❌ Login failed for email: {login_data.email.strip()}")

        raise HTTPException(

            status_code=status.HTTP_401_UNAUTHORIZED,

            detail="Invalid email or password"

        )

    

    print(f"✅ Login successful for: {patient.name}")

    return AuthResponse(

        message="Login successful", 

        user_type="patient",

        patient_data={

            "id": patient.id,

            "name": patient.name,

            "email": patient.email,

            "phone": patient.phone

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

        "created_at": clinic.created_at

    }



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

# Appointment Management Endpoints

@router.post("/appointments/create", response_model=AppointmentResponse)
async def create_appointment(
    request: AppointmentCreateRequest,
    db: AsyncSession = Depends(get_db)
):
    try:
        # Get next token number for this clinic
        result = await db.execute(
            select(Appointment)
            .where(Appointment.clinic_id == request.clinic_id)
            .order_by(Appointment.id.desc())
            .limit(1)
        )
        last_appointment = result.scalar_one_or_none()

        if last_appointment and last_appointment.token:
            try:
                last_token_num = int(last_appointment.token.split("-")[1])
                next_token_num = last_token_num + 1
            except (ValueError, IndexError):
                next_token_num = 1
        else:
            next_token_num = 1

        token_number = f"T-{next_token_num}"

        print(f"Creating appointment for patient: {request.patient_name}")
        print(f"Patient email: {request.patient_email}")
        print(f"Patient phone: {request.patient_phone}")
        print(f"Clinic: {request.clinic_name} ({request.clinic_id})")
        print(f"Doctor: {request.doctor_name}")
        print(f"Date: {request.date}, Time: {request.time}")
        print(f"Token: {token_number}")

        new_appointment = Appointment(
            patient_name=request.patient_name,
            patient_email=request.patient_email,
            patient_phone=request.patient_phone or "",
            clinic_id=request.clinic_id,
            clinic_name=request.clinic_name,
            doctor_name=request.doctor_name,
            date=request.date,
            time=request.time,
            token=token_number,
            status=request.status
        )

        db.add(new_appointment)
        await db.commit()
        await db.refresh(new_appointment)

        return {
            "message": "Appointment created successfully",
            "appointment_id": new_appointment.id,
            "token": token_number
        }
    except Exception as e:
        print(f"Error creating appointment: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/patient/appointments")

async def get_patient_appointments(

    email: str = Query(..., description="Patient email"),

    db: AsyncSession = Depends(get_db)

):

    result = await db.execute(

        select(Appointment)

        .where(Appointment.patient_email == email)

        .order_by(Appointment.created_at.desc())

    )

    appointments = result.scalars().all()

    

    return {

        "appointments": [

            {

                "id": apt.id,

                "patient_name": apt.patient_name,

                "patient_email": apt.patient_email,

                "patient_phone": apt.patient_phone,

                "clinic_id": apt.clinic_id,

                "clinic_name": apt.clinic_name,

                "doctor_name": apt.doctor_name,

                "date": apt.date,

                "time": apt.time,

                "token": apt.token,

                "status": apt.status,

                "created_at": apt.created_at

            }

            for apt in appointments

        ]

    }



@router.get("/appointments/today")

async def get_today_appointments(

    clinic_id: str = Query(..., description="Clinic ID"),

    db: AsyncSession = Depends(get_db)

):

    # Get today's date

    today = datetime.now().strftime("%Y-%m-%d")

    

    # Fetch appointments for this clinic today

    result = await db.execute(

        select(Appointment)

        .where(

            (Appointment.clinic_id == clinic_id) & 

            (Appointment.date == today)

        )

    )

    appointments = result.scalars().all()

    

    return {

        "appointments": [

            {

                "id": apt.id,

                "patient_name": apt.patient_name,

                "patient_email": apt.patient_email,

                "patient_phone": apt.patient_phone,

                "clinic_id": apt.clinic_id,

                "clinic_name": apt.clinic_name,

                "doctor_name": apt.doctor_name,

                "date": apt.date,

                "time": apt.time,

                "token": apt.token,

                "status": apt.status,

                "created_at": apt.created_at

            }

            for apt in appointments

        ]

    }



@router.get("/appointments/queue-position")

async def get_queue_position(

    clinic_id: str = Query(..., description="Clinic ID"),

    appointment_token: str = Query(..., description="Current appointment token"),

    appointment_id: int = Query(..., description="Current appointment ID"),

    db: AsyncSession = Depends(get_db)

):

    """Calculate how many patients are ahead based on token number"""

    today = datetime.now().strftime("%Y-%m-%d")

    

    # Extract token number (e.g., "T-5" -> 5)

    try:

        current_token_num = int(appointment_token.split("-")[1])

    except (ValueError, IndexError):

        current_token_num = 1

    

    # Count all appointments for this clinic today with token number less than current

    result = await db.execute(

        select(Appointment)

        .where(

            (Appointment.clinic_id == clinic_id) &

            (Appointment.date == today) &

            (Appointment.id != appointment_id)

        )

    )

    appointments = result.scalars().all()

    

    # Calculate patients ahead based on token number

    patients_ahead = 0

    for apt in appointments:

        if apt.token:

            try:

                apt_token_num = int(apt.token.split("-")[1])

                if apt_token_num < current_token_num:

                    patients_ahead += 1

            except (ValueError, IndexError):

                pass

    

    # Estimate wait time (5 minutes per patient)

    estimated_wait = patients_ahead * 5

    

    # Your position = patients ahead + 1

    your_position = patients_ahead + 1

    

    # Total in queue = your position + patients ahead

    total_in_queue = len(appointments) + 1

    

    return {

        "patients_ahead": patients_ahead,

        "estimated_wait_minutes": estimated_wait,

        "your_position": your_position,

        "total_in_queue": total_in_queue,

        "current_token": current_token_num

    }



@router.put("/appointments/{appointment_id}/status")

async def update_appointment_status(

    appointment_id: int,

    status: str = Query(..., description="New status: booked, completed, cancelled"),

    db: AsyncSession = Depends(get_db)

):

    result = await db.execute(select(Appointment).where(Appointment.id == appointment_id))

    appointment = result.scalar_one_or_none()

    

    if not appointment:

        raise HTTPException(

            status_code=status.HTTP_404_NOT_FOUND,

            detail="Appointment not found"

        )

    

    # Update status

    appointment.status = status

    await db.commit()

    

    return {"message": f"Appointment status updated to {status}"}



# Get All Clinics Endpoint

@router.get("/clinics/list")

async def get_all_clinics(db: AsyncSession = Depends(get_db)):

    result = await db.execute(select(Clinic))

    clinics = result.scalars().all()

    

    # Transform clinic data to match frontend interface

    clinic_list = []

    for clinic in clinics:

        clinic_list.append({

            "id": clinic.clinic_id,  # Use clinic_id as the frontend id

            "name": clinic.clinic_name,

            "address": clinic.address,

            "city": "Unknown",  # Could be extracted from address or added as separate field

            "distance": "2.5 km",  # Placeholder - could calculate based on user location

            "rating": 4.5,  # Placeholder - could add rating field to database

            "reviewCount": 150,  # Placeholder - could add review count field

            "phone": clinic.phone,

            "doctors": [

                {

                    "id": f"doc-{clinic.clinic_id}",

                    "name": clinic.doctor_name or "Dr. Unknown",

                    "department": "General",

                    "specialization": "General Practice",

                    "nextAvailable": "Today, 2:00 PM",

                    "slots": []

                }

            ],

            "specializations": ["General Practice"]  # Could be added as separate field

        })

    

    return {"clinics": clinic_list}



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



# Queue History Endpoints

@router.post("/queue/history/start")

async def start_serving(

    clinic_id: str = Query(..., description="Clinic ID"),

    patient_name: str = Query(..., description="Patient name"),

    patient_email: str = Query(default=None, description="Patient email"),

    token: str = Query(..., description="Token number"),

    position: int = Query(..., description="Position in queue"),

    db: AsyncSession = Depends(get_db)

):

    """Record when a patient starts being served"""

    history = QueueHistory(

        clinic_id=clinic_id,

        patient_name=patient_name,

        patient_email=patient_email,

        token=token,

        position=position,

        start_time=datetime.now(),

        status="completed"

    )

    db.add(history)

    await db.commit()

    await db.refresh(history)

    

    return {

        "message": "Started serving patient",

        "history_id": history.id,

        "start_time": history.start_time.isoformat()

    }



@router.put("/queue/history/{history_id}/end")

async def end_serving(

    history_id: int,

    db: AsyncSession = Depends(get_db)

):

    """Record when a patient finishes being served"""

    result = await db.execute(select(QueueHistory).where(QueueHistory.id == history_id))

    history = result.scalar_one_or_none()

    

    if not history:

        raise HTTPException(

            status_code=status.HTTP_404_NOT_FOUND,

            detail="History record not found"

        )

    

    # Calculate total time (round to 2 decimal places)

    end_time = datetime.now()

    total_seconds = (end_time - history.start_time).total_seconds()

    total_minutes = round(total_seconds / 60, 2)

    

    # Update record

    history.end_time = end_time

    history.total_time_minutes = total_minutes

    

    await db.commit()

    

    return {

        "message": "Finished serving patient",

        "history_id": history_id,

        "start_time": history.start_time.isoformat(),

        "end_time": end_time.isoformat(),

        "total_time_minutes": total_minutes

    }



@router.get("/queue/history")

async def get_queue_history(

    clinic_id: str = Query(..., description="Clinic ID"),

    limit: int = Query(default=50, description="Number of records to return"),

    db: AsyncSession = Depends(get_db)

):

    """Get queue history for a clinic"""

    result = await db.execute(

        select(QueueHistory)

        .where(QueueHistory.clinic_id == clinic_id)

        .order_by(QueueHistory.created_at.desc())

        .limit(limit)

    )

    history_records = result.scalars().all()

    

    return {

        "history": [

            {

                "id": record.id,

                "patient_name": record.patient_name,

                "patient_email": record.patient_email,

                "token": record.token,

                "position": record.position,

                "start_time": record.start_time.isoformat() if record.start_time else None,

                "end_time": record.end_time.isoformat() if record.end_time else None,

                "total_time_minutes": record.total_time_minutes,

                "status": record.status,

                "created_at": record.created_at.isoformat()

            }

            for record in history_records

        ]

    }



@router.get("/queue/history/stats")

async def get_queue_stats(

    clinic_id: str = Query(..., description="Clinic ID"),

    db: AsyncSession = Depends(get_db)

):

    """Get queue statistics for a clinic"""

    result = await db.execute(

        select(QueueHistory)

        .where(QueueHistory.clinic_id == clinic_id)

    )

    history_records = result.scalars().all()

    

    # Calculate statistics

    completed_records = [r for r in history_records if r.total_time_minutes is not None]

    total_patients = len(completed_records)

    avg_time = 0

    if completed_records:

        avg_time = sum(r.total_time_minutes for r in completed_records) / total_patients

    

    return {

        "total_patients_served": total_patients,

        "average_time_minutes": round(avg_time, 2),

        "total_skipped": len([r for r in history_records if r.status == "skipped"]),

        "today": datetime.now().strftime("%Y-%m-%d")

    }



@router.delete("/appointments/{appointment_id}")

async def delete_appointment(

    appointment_id: int,

    db: AsyncSession = Depends(get_db)

):

    """Delete an appointment after it's served"""

    result = await db.execute(select(Appointment).where(Appointment.id == appointment_id))

    appointment = result.scalar_one_or_none()

    

    if not appointment:

        raise HTTPException(

            status_code=status.HTTP_404_NOT_FOUND,

            detail="Appointment not found"

        )

    

    # Store appointment info before deleting

    appointment_info = {

        "patient_name": appointment.patient_name,

        "patient_email": appointment.patient_email,

        "clinic_id": appointment.clinic_id,

        "clinic_name": appointment.clinic_name,

        "doctor_name": appointment.doctor_name,

        "date": appointment.date,

        "time": appointment.time,

        "token": appointment.token

    }

    

    # Delete the appointment

    await db.delete(appointment)

    await db.commit()

    return {
        "message": "Appointment deleted successfully",
        "appointment": appointment_info
    }


# JWT Validation Dependency
async def get_current_user(authorization: Optional[str] = Header(None)):
    """Validate JWT token and return user info"""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing"
        )
    
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise ValueError()
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format. Use 'Bearer <token>'"
        )
    
    try:
        import jwt
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return {
            "user_id": payload["user_id"],
            "user_type": payload["user_type"],
            "contact": payload["contact"]
        }
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    except ImportError:
        # If PyJWT not installed, accept any token (dev mode)
        return {"user_id": 1, "user_type": "patient", "contact": "test"}


@router.get("/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current authenticated user info (protected route)"""
    return current_user

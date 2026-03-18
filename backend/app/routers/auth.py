from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.db import get_db
from app.database.models import Clinic, Patient
from app.schemas import ClinicSignup, ClinicLogin, PatientSignup, PatientLogin, Response, LoginResponse
from app.security import hash_password, verify_password
from app.utils import get_unique_clinic_id

router = APIRouter(prefix="/auth", tags=["authentication"])

# Clinic Endpoints
@router.post("/clinic/signup", response_model=Response)
async def clinic_signup(clinic_data: ClinicSignup, db: AsyncSession = Depends(get_db)):
    # Check if email already exists
    result = await db.execute(select(Clinic).where(Clinic.email == clinic_data.email))
    existing_clinic = result.scalar_one_or_none()
    
    if existing_clinic:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password and create clinic
    hashed_password = hash_password(clinic_data.password)
    
    # Generate unique clinic ID
    clinic_id = await get_unique_clinic_id(db)
    
    new_clinic = Clinic(
        clinic_id=clinic_id,
        clinic_name=clinic_data.clinic_name,
        doctor_name=clinic_data.doctor_name,
        specialization=clinic_data.specialization,
        address=clinic_data.address,
        city=clinic_data.city,
        email=clinic_data.email,
        password=hashed_password,
        phone=clinic_data.phone
    )
    
    db.add(new_clinic)
    await db.commit()
    await db.refresh(new_clinic)
    
    return {"message": "Signup successful", "clinic_id": clinic_id}

@router.post("/clinic/login", response_model=LoginResponse)
async def clinic_login(login_data: ClinicLogin, db: AsyncSession = Depends(get_db)):
    # Try to find clinic by email first, then by clinic_id
    result = await db.execute(select(Clinic).where(Clinic.email == login_data.email))
    clinic = result.scalar_one_or_none()
    
    # If not found by email, try clinic_id
    if not clinic:
        result = await db.execute(select(Clinic).where(Clinic.clinic_id == login_data.email))
        clinic = result.scalar_one_or_none()
    
    if not clinic or not verify_password(login_data.password, clinic.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid clinic ID/email or password"
        )
    
    return {
        "message": "Login successful",
        "user_id": clinic.id,
        "user_type": "clinic"
    }

# Patient Endpoints
@router.post("/patient/signup", response_model=Response)
async def patient_signup(patient_data: PatientSignup, db: AsyncSession = Depends(get_db)):
    # Check if email already exists
    result = await db.execute(select(Patient).where(Patient.email == patient_data.email))
    existing_patient = result.scalar_one_or_none()
    
    if existing_patient:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password and create patient
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
    
    return {"message": "Signup successful"}

@router.post("/patient/login", response_model=LoginResponse)
async def patient_login(login_data: PatientLogin, db: AsyncSession = Depends(get_db)):
    # Find patient by email
    result = await db.execute(select(Patient).where(Patient.email == login_data.email))
    patient = result.scalar_one_or_none()
    
    if not patient or not verify_password(login_data.password, patient.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    return {
        "message": "Login successful",
        "user_id": patient.id,
        "user_type": "patient"
    }

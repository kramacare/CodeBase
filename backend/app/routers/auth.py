from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.db import get_db
from app.database.models import Clinic, Patient
from app.schemas import ClinicSignup, ClinicLogin, PatientSignup, PatientLogin, Response, LoginResponse
from app.security import hash_password, verify_password

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
    new_clinic = Clinic(
        clinic_name=clinic_data.clinic_name,
        email=clinic_data.email,
        password=hashed_password,
        phone=clinic_data.phone
    )
    
    db.add(new_clinic)
    await db.commit()
    await db.refresh(new_clinic)
    
    return {"message": "Signup successful"}

@router.post("/clinic/login", response_model=LoginResponse)
async def clinic_login(login_data: ClinicLogin, db: AsyncSession = Depends(get_db)):
    # Find clinic by email
    result = await db.execute(select(Clinic).where(Clinic.email == login_data.email))
    clinic = result.scalar_one_or_none()
    
    if not clinic or not verify_password(login_data.password, clinic.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
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

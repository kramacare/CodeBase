import json
import random
import string
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.database.db import get_db
from app.database.models import Clinic, Patient
from app.schemas import (
    ClinicSignup, ClinicLogin, PatientSignup, PatientLogin,
    ChangePasswordRequest, ChangePhoneRequest, DeleteAccountRequest,
    AuthResponse
)
from app.security import hash_password, verify_password
from fastapi.responses import JSONResponse

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
    result = await db.execute(select(Patient).where(Patient.email == login_data.email))
    patient = result.scalar_one_or_none()
    
    if not patient or not verify_password(login_data.password, patient.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    return AuthResponse(message="Login successful", user_type="patient")

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

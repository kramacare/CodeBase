from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from app.database.db import get_db
from app.database.models import TodayToken, HistoryToken, TokenStatus, Clinic
from app.schemas import (
    TokenRequest, TokenResponse, NextPatientRequest, NextPatientResponse,
    PatientDashboardResponse, ClinicDashboardResponse, ErrorResponse
)
from app.queue_utils import (
    ensure_daily_reset, get_next_token_number, get_current_serving_token,
    get_next_waiting_token, get_patients_ahead_count,
    get_waiting_patients, get_total_patients_today
)
from datetime import datetime
import asyncio

router = APIRouter(prefix="/queue", tags=["queue management"])

# Semaphore to prevent race conditions in token generation
token_semaphore = asyncio.Semaphore(1)

@router.post("/generate-token", response_model=TokenResponse)
async def generate_token(token_request: TokenRequest, db: AsyncSession = Depends(get_db)):
    """
    Generate a new token for a patient.
    """
    async with token_semaphore:  # Prevent race conditions
        # Validate input
        if not token_request.clinic_id or not token_request.patient_name or not token_request.patient_number:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="All fields are required"
            )
        
        # Verify clinic exists
        clinic_result = await db.execute(
            select(Clinic).where(Clinic.clinic_id == token_request.clinic_id)
        )
        clinic = clinic_result.scalar_one_or_none()
        
        if not clinic:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Clinic not found"
            )
        
        # Ensure daily reset for this clinic
        await ensure_daily_reset(db, token_request.clinic_id)
        
        # Check for duplicate patient number today
        duplicate_check = await db.execute(
            select(TodayToken).where(
                and_(
                    TodayToken.clinic_id == token_request.clinic_id,
                    TodayToken.patient_number == token_request.patient_number
                )
            )
        )
        if duplicate_check.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Patient number already registered for today"
            )
        
        # Get next token number
        next_token_number = await get_next_token_number(db, token_request.clinic_id)
        
        # Create new token
        new_token = TodayToken(
            clinic_id=token_request.clinic_id,
            patient_name=token_request.patient_name,
            patient_number=token_request.patient_number,
            token_number=next_token_number,
            status=TokenStatus.WAITING
        )
        
        db.add(new_token)
        await db.commit()
        await db.refresh(new_token)
        
        return TokenResponse(
            message="Token generated successfully",
            token_number=new_token.token_number,
            patient_name=new_token.patient_name,
            patient_number=new_token.patient_number,
            status=new_token.status.value
        )

@router.post("/next-patient", response_model=NextPatientResponse)
async def next_patient(request: NextPatientRequest, db: AsyncSession = Depends(get_db)):
    """
    Handle clinic's "Next" button logic.
    """
    # Verify clinic exists
    clinic_result = await db.execute(
        select(Clinic).where(Clinic.clinic_id == request.clinic_id)
    )
    clinic = clinic_result.scalar_one_or_none()
    
    if not clinic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clinic not found"
        )
    
    # Ensure daily reset
    await ensure_daily_reset(db, request.clinic_id)
    
    # STEP 1: Find current serving patient
    current_serving = await get_current_serving_token(db, request.clinic_id)
    current_serving_data = None
    
    if current_serving:
        # Move current serving to history
        history_token = HistoryToken(
            clinic_id=current_serving.clinic_id,
            patient_name=current_serving.patient_name,
            patient_number=current_serving.patient_number,
            token_number=current_serving.token_number,
            date=current_serving.date,
            completed_at=datetime.now()
        )
        db.add(history_token)
        
        # Store current serving data for response
        current_serving_data = {
            "token_number": current_serving.token_number,
            "patient_name": current_serving.patient_name,
            "patient_number": current_serving.patient_number
        }
        
        # Remove from today_tokens
        await db.delete(current_serving)
    
    # STEP 2: Get next waiting patient
    next_patient = await get_next_waiting_token(db, request.clinic_id)
    next_patient_data = None
    
    if next_patient:
        # Update to serving status
        next_patient.status = TokenStatus.SERVING
        await db.commit()
        
        next_patient_data = {
            "token_number": next_patient.token_number,
            "patient_name": next_patient.patient_name,
            "patient_number": next_patient.patient_number
        }
    
    message = "Next patient processed successfully"
    if not current_serving and not next_patient:
        message = "No patients in queue"
    elif not next_patient:
        message = "No more patients in queue"
    
    return NextPatientResponse(
        message=message,
        current_serving=current_serving_data,
        next_patient=next_patient_data
    )

@router.get("/patient-dashboard/{clinic_id}/{token_number}", response_model=PatientDashboardResponse)
async def patient_dashboard(clinic_id: str, token_number: int, db: AsyncSession = Depends(get_db)):
    """
    Get patient dashboard information.
    """
    # Verify clinic exists
    clinic_result = await db.execute(
        select(Clinic).where(Clinic.clinic_id == clinic_id)
    )
    clinic = clinic_result.scalar_one_or_none()
    
    if not clinic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clinic not found"
        )
    
    # Ensure daily reset
    await ensure_daily_reset(db, clinic_id)
    
    # Get patient's token
    token_result = await db.execute(
        select(TodayToken)
        .where(
            (TodayToken.clinic_id == clinic_id) &
            (TodayToken.token_number == token_number)
        )
    )
    token = token_result.scalar_one_or_none()
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Token not found"
        )
    
    # Get patients ahead count
    patients_ahead = await get_patients_ahead_count(db, clinic_id, token_number)
    
    # Calculate estimated wait time (5 minutes per patient)
    estimated_wait_time = patients_ahead * 5 if patients_ahead > 0 else None
    
    return PatientDashboardResponse(
        token_number=token.token_number,
        patient_name=token.patient_name,
        patient_number=token.patient_number,
        status=token.status.value,
        patients_ahead=patients_ahead,
        estimated_wait_time=estimated_wait_time
    )

@router.get("/clinic-dashboard/{clinic_id}", response_model=ClinicDashboardResponse)
async def clinic_dashboard(clinic_id: str, db: AsyncSession = Depends(get_db)):
    """
    Get clinic dashboard information.
    """
    # Verify clinic exists
    clinic_result = await db.execute(
        select(Clinic).where(Clinic.clinic_id == clinic_id)
    )
    clinic = clinic_result.scalar_one_or_none()
    
    if not clinic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clinic not found"
        )
    
    # Ensure daily reset
    await ensure_daily_reset(db, clinic_id)
    
    # Get current serving patient
    current_serving = await get_current_serving_token(db, clinic_id)
    current_serving_data = None
    
    if current_serving:
        current_serving_data = {
            "token_number": current_serving.token_number,
            "patient_name": current_serving.patient_name,
            "patient_number": current_serving.patient_number,
            "status": current_serving.status.value
        }
    
    # Get waiting patients
    waiting_patients = await get_waiting_patients(db, clinic_id)
    waiting_patients_list = []
    
    for patient in waiting_patients:
        waiting_patients_list.append({
            "token_number": patient.token_number,
            "patient_name": patient.patient_name,
            "patient_number": patient.patient_number,
            "status": patient.status.value
        })
    
    # Get total patients today
    total_patients = await get_total_patients_today(db, clinic_id)
    
    return ClinicDashboardResponse(
        current_serving=current_serving_data,
        waiting_patients=waiting_patients_list,
        total_patients_today=total_patients,
        clinic_id=clinic_id
    )

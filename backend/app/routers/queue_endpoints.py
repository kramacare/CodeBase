from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.database.db import get_db
from app.database.models import Appointment, CompletedAppointment

router = APIRouter(prefix="/auth", tags=["queue"])

@router.post("/clinic/serve-patient")
async def serve_patient(
    request: dict,
    db: AsyncSession = Depends(get_db)
):
    """
    Mark patient as being served and move from appointments to serving state.
    This is called when clicking 'Next' button.
    """
    clinic_id = request.get("clinic_id")
    appointment_id = request.get("appointment_id")
    
    if not all([clinic_id, appointment_id]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing clinic_id or appointment_id"
        )
    
    # Get the appointment
    result = await db.execute(
        select(Appointment).where(
            Appointment.id == appointment_id,
            Appointment.clinic_id == clinic_id
        )
    )
    appointment = result.scalar_one_or_none()
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    # Update status to serving
    appointment.status = "serving"
    await db.commit()
    
    return {
        "message": "Patient is now being served",
        "appointment": {
            "id": appointment.id,
            "token": appointment.appointment_token,
            "patient_name": appointment.patient_name,
            "patient_email": appointment.patient_email,
            "patient_phone": appointment.patient_phone,
            "status": "serving"
        }
    }


@router.post("/clinic/finish-patient")
async def finish_patient(
    request: dict,
    db: AsyncSession = Depends(get_db)
):
    """
    Mark patient as served/finished and move to completed_appointments table.
    This is called when clicking 'Served' button.
    """
    clinic_id = request.get("clinic_id")
    appointment_id = request.get("appointment_id")
    
    if not all([clinic_id, appointment_id]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing clinic_id or appointment_id"
        )
    
    # Get the appointment
    result = await db.execute(
        select(Appointment).where(
            Appointment.id == appointment_id,
            Appointment.clinic_id == clinic_id
        )
    )
    appointment = result.scalar_one_or_none()
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    # Calculate wait time in minutes
    from datetime import timezone
    served_at = appointment.created_at
    if served_at.tzinfo is None:
        served_at = served_at.replace(tzinfo=timezone.utc)
    finished_at = datetime.now(timezone.utc)
    wait_time = int((finished_at - served_at).total_seconds() / 60)
    
    # Move to completed_appointments
    completed = CompletedAppointment(
        appointment_token=appointment.appointment_token,
        clinic_id=appointment.clinic_id,
        patient_id=appointment.patient_id,
        patient_name=appointment.patient_name,
        patient_email=appointment.patient_email,
        patient_phone=appointment.patient_phone,
        doctor_name=appointment.doctor_name,
        date=appointment.date,
        time=appointment.time,
        served_at=served_at,
        finished_at=finished_at,
        status="completed",
        wait_time_minutes=wait_time
    )
    db.add(completed)
    
    # Delete from appointments
    await db.delete(appointment)
    await db.commit()
    
    return {
        "message": "Patient marked as served and moved to history",
        "completed": {
            "token": completed.appointment_token,
            "patient_name": completed.patient_name,
            "served_at": completed.served_at,
            "finished_at": completed.finished_at,
            "wait_time_minutes": completed.wait_time_minutes
        }
    }


@router.post("/clinic/skip-patient")
async def skip_patient(
    request: dict,
    db: AsyncSession = Depends(get_db)
):
    """
    Skip a patient - they go to the end of the queue.
    Order: A,B,C,D,E -> Skip A -> B,C,D,E,A
    """
    clinic_id = request.get("clinic_id")
    appointment_id = request.get("appointment_id")
    
    if not all([clinic_id, appointment_id]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing clinic_id or appointment_id"
        )
    
    # Get the appointment to skip
    result = await db.execute(
        select(Appointment).where(
            Appointment.id == appointment_id,
            Appointment.clinic_id == clinic_id
        )
    )
    skipped_appointment = result.scalar_one_or_none()
    
    if not skipped_appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    # Get all appointments for this clinic ordered by id
    result = await db.execute(
        select(Appointment).where(
            Appointment.clinic_id == clinic_id
        ).order_by(Appointment.id)
    )
    all_appointments = result.scalars().all()
    
    # Find the skipped appointment and move it to the end by updating its id
    # We do this by deleting and re-inserting with a new higher id
    if len(all_appointments) > 1:
        # Delete the skipped appointment
        await db.delete(skipped_appointment)
        await db.commit()
        
        # Re-create it at the end (new id will be highest)
        new_appointment = Appointment(
            appointment_token=skipped_appointment.appointment_token,
            clinic_id=skipped_appointment.clinic_id,
            patient_id=skipped_appointment.patient_id,
            patient_name=skipped_appointment.patient_name,
            patient_email=skipped_appointment.patient_email,
            patient_phone=skipped_appointment.patient_phone,
            doctor_name=skipped_appointment.doctor_name,
            date=skipped_appointment.date,
            time=skipped_appointment.time,
            status="skipped"  # Mark as skipped
        )
        db.add(new_appointment)
        await db.commit()
        await db.refresh(new_appointment)
    
    return {
        "message": "Patient skipped and moved to end of queue",
        "skipped_patient": {
            "id": new_appointment.id if len(all_appointments) > 1 else skipped_appointment.id,
            "token": skipped_appointment.appointment_token,
            "patient_name": skipped_appointment.patient_name,
            "new_position": "end of queue"
        }
    }


@router.get("/clinic/completed-appointments")
async def get_completed_appointments(
    clinic_id: str = Query(..., description="Clinic ID"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all completed/served appointments for a clinic (history).
    """
    result = await db.execute(
        select(CompletedAppointment).where(
            CompletedAppointment.clinic_id == clinic_id
        ).order_by(CompletedAppointment.served_at.desc())
    )
    completed = result.scalars().all()
    
    completed_list = []
    for apt in completed:
        completed_list.append({
            "id": apt.id,
            "token": apt.appointment_token,
            "patient_id": apt.patient_id,
            "patient_name": apt.patient_name,
            "patient_email": apt.patient_email,
            "patient_phone": apt.patient_phone,
            "doctor_name": apt.doctor_name,
            "date": apt.date,
            "time": apt.time,
            "served_at": apt.served_at,
            "finished_at": apt.finished_at,
            "wait_time_minutes": apt.wait_time_minutes,
            "status": apt.status
        })
    
    return {"completed": completed_list, "total": len(completed_list)}

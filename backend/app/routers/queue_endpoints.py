from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.database.db import get_db
from app.database.models import Appointment, CompletedAppointment, QRAppointment, ClinicTimeSlot, Clinic

router = APIRouter(prefix="/auth", tags=["queue"])

@router.post("/clinic/set-active")
async def set_clinic_active(
    request: dict,
    db: AsyncSession = Depends(get_db)
):
    """
    Set clinic as active (clicked Start) or inactive.
    """
    clinic_id = request.get("clinic_id")
    is_active = request.get("is_active", True)
    
    if not clinic_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="clinic_id is required"
        )
    
    result = await db.execute(
        select(Clinic).where(Clinic.clinic_id == clinic_id)
    )
    clinic = result.scalar_one_or_none()
    
    if not clinic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clinic not found"
        )
    
    clinic.is_active = is_active
    await db.commit()
    
    return {
        "message": f"Clinic {'activated' if is_active else 'deactivated'}",
        "is_active": is_active
    }

@router.get("/clinic/active-status")
async def get_clinic_active_status(
    clinic_id: str = Query(..., description="Clinic ID"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get clinic active status.
    """
    result = await db.execute(
        select(Clinic).where(Clinic.clinic_id == clinic_id)
    )
    clinic = result.scalar_one_or_none()
    
    if not clinic:
        return {"is_active": False}
    
    return {"is_active": clinic.is_active}

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
    Handles both online appointments and QR walk-ins.
    This is called when clicking 'Completed' button.
    """
    import logging
    logger = logging.getLogger(__name__)
    
    clinic_id = request.get("clinic_id")
    appointment_id = request.get("appointment_id")
    source = request.get("source", "online")  # "online" or "walkin"
    
    logger.info(f"finish_patient called: clinic_id={clinic_id}, appointment_id={appointment_id}, source={source}")
    
    if not all([clinic_id, appointment_id]):
        logger.error(f"Missing required fields: clinic_id={clinic_id}, appointment_id={appointment_id}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing clinic_id or appointment_id"
        )
    
    appointment = None
    
    if source == "walkin":
        # Get from QR appointments table
        result = await db.execute(
            select(QRAppointment).where(
                QRAppointment.id == appointment_id,
                QRAppointment.clinic_id == clinic_id
            )
        )
        appointment = result.scalar_one_or_none()
    else:
        # Get from online appointments table
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
        patient_id=getattr(appointment, 'patient_id', f"qr-{appointment.id}"),
        patient_name=appointment.patient_name,
        patient_email=getattr(appointment, 'patient_email', ""),
        patient_phone=appointment.patient_phone,
        doctor_name=getattr(appointment, 'doctor_name', None),
        date=appointment.date,
        time=getattr(appointment, 'time', "walk-in"),
        served_at=served_at,
        finished_at=finished_at,
        status="completed",
        wait_time_minutes=wait_time
    )
    db.add(completed)
    
    # Delete from the appropriate table
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


@router.get("/queue/history/stats")
async def get_queue_history_stats(
    clinic_id: str = Query(..., description="Clinic ID"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get queue history stats for a clinic - today's only.
    """
    from datetime import date
    today = date.today().isoformat()
    
    # Count completed (served) patients for today
    result = await db.execute(
        select(CompletedAppointment).where(
            CompletedAppointment.clinic_id == clinic_id,
            CompletedAppointment.date == today,
            CompletedAppointment.status == "served"
        )
    )
    served = result.scalars().all()
    total_served = len(served)
    
    # Count skipped patients for today
    result = await db.execute(
        select(CompletedAppointment).where(
            CompletedAppointment.clinic_id == clinic_id,
            CompletedAppointment.date == today,
            CompletedAppointment.status == "skipped"
        )
    )
    skipped = result.scalars().all()
    total_skipped = len(skipped)
    
    return {
        "total_patients_served": total_served,
        "total_skipped": total_skipped
    }


@router.get("/queue/patient-dashboard/{patient_email}")
async def get_patient_dashboard(
    patient_email: str,
    clinic_id: str = Query("ALL", description="Clinic ID or ALL"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get patient's queue position and status.
    """
    from datetime import datetime
    today = datetime.now().strftime("%Y-%m-%d")
    
    # Search in appointments table
    if clinic_id == "ALL":
        result = await db.execute(
            select(Appointment).where(
                Appointment.patient_email == patient_email,
                Appointment.date == today
            ).order_by(Appointment.id)
        )
    else:
        result = await db.execute(
            select(Appointment).where(
                Appointment.patient_email == patient_email,
                Appointment.clinic_id == clinic_id,
                Appointment.date == today
            ).order_by(Appointment.id)
        )
    
    appointments = result.scalars().all()
    
    if not appointments:
        return {"your_token": None, "status": "not_found", "patients_ahead": 0}
    
    # Get the first appointment
    apt = appointments[0]
    
    # Count patients ahead in queue
    if clinic_id == "ALL":
        count_result = await db.execute(
            select(Appointment).where(
                Appointment.date == today,
                Appointment.id < apt.id
            )
        )
    else:
        count_result = await db.execute(
            select(Appointment).where(
                Appointment.clinic_id == clinic_id,
                Appointment.date == today,
                Appointment.id < apt.id
            )
        )
    
    patients_ahead = len(count_result.scalars().all())
    
    return {
        "your_token": {
            "token_number": int(apt.appointment_token.replace("T-", "")) if apt.appointment_token else 0,
            "patient_name": apt.patient_name,
            "clinic_id": apt.clinic_id,
            "date": apt.date,
            "time": apt.time
        },
        "status": "waiting",
        "patients_ahead": patients_ahead
    }

# QR Walk-in: POST /queue/join
# Called by JoinQueue.tsx when a patient scans the clinic QR code.
# Inserts them into the appointments table at the end of today's queue
# and returns their token number + position.
# ─────────────────────────────────────────────────────────────────────────────

from pydantic import BaseModel
from typing import Optional

class QueueJoinRequest(BaseModel):
    clinic_id: str
    doctor_id: str          # doctor name or id — stored in doctor_name column
    patient_name: str
    phone: str
    source: str = "walkin"  # always "walkin" from the QR page
    booking_id: Optional[str] = None  # unused for walk-ins, kept for compatibility

@router.post("/queue/join")
async def join_queue(
    payload: QueueJoinRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Walk-in patients join the live queue via QR code scan.
    - Counts total appointments from BOTH tables (online + QR) for unified numbering
    - Assigns next sequential token (e.g. if last is T-7, new one is T-8)
    - Inserts a new row in qr_appointments table
    - Returns token_label, token_number, and position in queue
    """
    from datetime import date

    today = date.today().isoformat()  # e.g. "2024-01-15"

    # Get highest token number from all three tables (active + completed)
    max_token = -1
    
    # Check online appointments
    result = await db.execute(
        select(Appointment).where(
            Appointment.clinic_id == payload.clinic_id,
            Appointment.date == today
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
            QRAppointment.clinic_id == payload.clinic_id,
            QRAppointment.date == today
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
            CompletedAppointment.clinic_id == payload.clinic_id,
            CompletedAppointment.date == today
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
    token_label = f"T-{next_token_number}"

    # Count total active appointments for position
    result = await db.execute(
        select(Appointment).where(
            Appointment.clinic_id == payload.clinic_id,
            Appointment.date == today
        )
    )
    online_count = len(result.scalars().all())
    
    result = await db.execute(
        select(QRAppointment).where(
            QRAppointment.clinic_id == payload.clinic_id,
            QRAppointment.date == today
        )
    )
    qr_count = len(result.scalars().all())
    
    total_appointments = online_count + qr_count

    # Create the QR walk-in appointment row in separate table
    walkin = QRAppointment(
        appointment_token=token_label,
        clinic_id=payload.clinic_id,
        patient_name=payload.patient_name,
        patient_phone=payload.phone,
        doctor_name=payload.doctor_id,
        date=today,
        status="booked",
    )
    db.add(walkin)
    await db.commit()
    await db.refresh(walkin)

    # Position = total appointments including this patient
    position = total_appointments + 1

    return {
        "token_number": next_token_number,
        "token_label": token_label,
        "position": position,
        "patient_name": payload.patient_name,
        "clinic_id": payload.clinic_id,
        "source": "walkin",
    }

# ─────────────────────────────────────────────────────────────────────────────
# Clinic Time Slot Management Endpoints
# ─────────────────────────────────────────────────────────────────────────────
# One row per clinic - all slots stored as JSON array

@router.get("/clinic/time-slots")
async def get_time_slots(
    clinic_id: str = Query(..., description="Clinic ID"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all time slots for a clinic (one row per clinic with slots as JSON array).
    Returns: {clinic_id, slots: [{slot_name, time_range, is_open}, ...]}
    """
    result = await db.execute(
        select(ClinicTimeSlot).where(ClinicTimeSlot.clinic_id == clinic_id)
    )
    record = result.scalar_one_or_none()
    
    if not record:
        # Return empty slots array if no record exists
        return {"clinic_id": clinic_id, "slots": []}
    
    import json
    slots = record.slots
    if isinstance(slots, str):
        slots = json.loads(slots)
    
    return {"clinic_id": clinic_id, "slots": slots or []}

@router.post("/clinic/time-slots")
async def add_time_slot(
    request: dict,
    db: AsyncSession = Depends(get_db)
):
    """
    Add a new time slot to a clinic.
    Creates clinic record if doesn't exist.
    Request: {clinic_id, slot_name, time_range: [start, end]}
    """
    clinic_id = request.get("clinic_id")
    slot_name = request.get("slot_name")
    time_range = request.get("time_range")  # [start_hour, end_hour] e.g., [8, 11]
    
    if not all([clinic_id, slot_name, time_range]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing required fields: clinic_id, slot_name, time_range"
        )
    
    # Find or create clinic record
    result = await db.execute(
        select(ClinicTimeSlot).where(ClinicTimeSlot.clinic_id == clinic_id)
    )
    record = result.scalar_one_or_none()
    
    new_slot = {
        "slot_name": slot_name,
        "time_range": time_range,
        "is_open": True
    }
    
    import json
    if not record:
        # Create new record with this slot
        record = ClinicTimeSlot(
            clinic_id=clinic_id,
            slots=[new_slot]
        )
        db.add(record)
    else:
        # Append to existing slots
        current_slots = record.slots
        if isinstance(current_slots, str):
            current_slots = json.loads(current_slots)
        current_slots = list(current_slots or [])
        current_slots.append(new_slot)
        record.slots = current_slots
    
    await db.commit()
    await db.refresh(record)
    
    return {
        "message": "Time slot added successfully",
        "clinic_id": clinic_id,
        "slots": record.slots
    }

@router.put("/clinic/time-slots/{slot_index}")
async def update_time_slot(
    slot_index: int,
    request: dict,
    db: AsyncSession = Depends(get_db)
):
    """
    Update a time slot by index (0-based).
    Request: {clinic_id, slot_name?, time_range?, is_open?}
    """
    clinic_id = request.get("clinic_id")
    if not clinic_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="clinic_id is required"
        )
    
    result = await db.execute(
        select(ClinicTimeSlot).where(ClinicTimeSlot.clinic_id == clinic_id)
    )
    record = result.scalar_one_or_none()
    
    if not record or not record.slots or slot_index >= len(record.slots):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Time slot not found"
        )
    
    # Update the slot at the given index
    import json
    slots = record.slots
    if isinstance(slots, str):
        slots = json.loads(slots)
    slots = list(slots)
    
    if "is_open" in request:
        new_value = request["is_open"]
        if isinstance(new_value, bool):
            slots[slot_index]["is_open"] = new_value
        elif isinstance(new_value, str):
            slots[slot_index]["is_open"] = new_value.lower() == "true"
        else:
            slots[slot_index]["is_open"] = bool(new_value)
    
    record.slots = slots
    await db.commit()
    await db.refresh(record)
    
    return {
        "message": "Time slot updated successfully",
        "clinic_id": clinic_id,
        "slots": record.slots
    }

@router.delete("/clinic/time-slots/{slot_index}")
async def delete_time_slot(
    slot_index: int,
    clinic_id: str = Query(..., description="Clinic ID"),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a time slot by index (0-based).
    """
    result = await db.execute(
        select(ClinicTimeSlot).where(ClinicTimeSlot.clinic_id == clinic_id)
    )
    record = result.scalar_one_or_none()
    
    if not record or not record.slots or slot_index >= len(record.slots):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Time slot not found"
        )
    
    # Remove slot at index
    import json
    slots = record.slots
    if isinstance(slots, str):
        slots = json.loads(slots)
    slots = list(slots)
    slots.pop(slot_index)
    record.slots = slots
    
    await db.commit()
    
    return {
        "message": "Time slot deleted successfully",
        "clinic_id": clinic_id,
        "slots": record.slots
    }

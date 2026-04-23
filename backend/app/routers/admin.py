"""
Admin router for managing clinic registrations.
Provides endpoints for viewing, approving, and rejecting pending clinic registrations.
"""
import random
import string
from datetime import datetime
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func

from app.database.db import get_db
from app.database.models import (
    PendingClinicRegistration, Clinic, Admin, ClinicImage
)
from app.security import hash_password, verify_password
from app.services.geocoding_service import get_coordinates_from_address
from app.services.email_service import (
    send_clinic_approval_email,
    send_clinic_rejection_email
)

router = APIRouter(prefix="/admin", tags=["admin"])


def generate_clinic_id():
    """Generate unique clinic ID like FA23W3"""
    letters = ''.join(random.choices(string.ascii_uppercase, k=2))
    digits = ''.join(random.choices(string.digits, k=2))
    more_letters = ''.join(random.choices(string.ascii_uppercase, k=3))
    return f"{letters}{digits}{more_letters}"


def generate_admin_id():
    """Generate unique admin ID like AD-1234"""
    letters = ''.join(random.choices(string.ascii_uppercase, k=2))
    digits = ''.join(random.choices(string.digits, k=4))
    return f"AD-{letters}{digits}"


# ============ Admin Authentication Endpoints ============

class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/login")
async def admin_login(
    request: LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Admin login endpoint.
    Accepts username and password.
    """
    username = request.username
    password = request.password
    
    # Hardcoded admin credentials for now
    ADMIN_USERNAME = "admin1"
    ADMIN_PASSWORD = "Diganthadmin1"
    
    if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
        return {
            "success": True,
            "message": "Login successful",
            "admin_id": "admin-001",
            "name": "Admin",
            "username": username,
        }
    
    # Also check database
    result = await db.execute(
        select(Admin).where(Admin.email == username, Admin.is_active == True)
    )
    admin = result.scalar_one_or_none()
    
    if admin and verify_password(password, admin.password):
        admin.last_login = datetime.now()
        await db.commit()
        return {
            "success": True,
            "message": "Login successful",
            "admin_id": admin.admin_id,
            "name": admin.name,
            "email": admin.email,
            "role": admin.role
        }
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid username or password"
    )


@router.post("/create")
async def create_admin(
    name: str,
    email: str,
    password: str,
    role: str = "admin",
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new admin account. (Should be protected in production)
    """
    # Check if email already exists
    result = await db.execute(select(Admin).where(Admin.email == email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Generate unique admin ID
    admin_id = generate_admin_id()
    while True:
        result = await db.execute(select(Admin).where(Admin.admin_id == admin_id))
        if not result.scalar_one_or_none():
            break
        admin_id = generate_admin_id()
    
    hashed_password = hash_password(password)
    
    new_admin = Admin(
        admin_id=admin_id,
        name=name,
        email=email,
        password=hashed_password,
        role=role
    )
    
    db.add(new_admin)
    await db.commit()
    await db.refresh(new_admin)
    
    return {
        "message": "Admin created successfully",
        "admin_id": admin_id,
        "email": email
    }


# ============ Pending Registration Management ============

@router.get("/pending-registrations")
async def get_pending_registrations(
    status: Optional[str] = Query(None, description="Filter by status: pending, approved, rejected"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all pending clinic registrations with optional filtering.
    """
    query = select(PendingClinicRegistration)
    
    if status:
        query = query.where(PendingClinicRegistration.status == status)
    else:
        # Default to showing pending only
        query = query.where(PendingClinicRegistration.status == "pending")
    
    query = query.order_by(PendingClinicRegistration.created_at.desc())
    
    # Get total count
    count_result = await db.execute(
        select(func.count()).select_from(PendingClinicRegistration)
        .where(PendingClinicRegistration.status == (status or "pending"))
    )
    total = count_result.scalar()
    
    # Get paginated results
    offset = (page - 1) * limit
    query = query.offset(offset).limit(limit)
    
    result = await db.execute(query)
    registrations = result.scalars().all()
    
    return {
        "registrations": [
            {
                "id": reg.id,
                "clinic_id": reg.clinic_id,
                "clinic_name": reg.clinic_name,
                "email": reg.email,
                "phone": reg.phone,
                "category": reg.category,
                # Address fields
                "street_address": reg.street_address,
                "road": reg.road,
                "layout": reg.layout,
                "section": reg.section,
                "city": reg.city,
                "pincode": reg.pincode,
                "address": reg.address,
                "latitude": reg.latitude,
                "longitude": reg.longitude,
                # Doctor details
                "doctor_name": reg.doctor_name,
                "specialization": reg.specialization,
                "experience": reg.experience,
                "qualifications": reg.qualifications,
                "image_urls": reg.image_urls,
                "status": reg.status,
                "created_at": reg.created_at.isoformat() if reg.created_at else None,
                "updated_at": reg.updated_at.isoformat() if reg.updated_at else None,
            }
            for reg in registrations
        ],
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "pages": (total + limit - 1) // limit
        }
    }


@router.get("/pending-registrations/{registration_id}")
async def get_pending_registration_details(
    registration_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get detailed information about a specific pending registration.
    """
    result = await db.execute(
        select(PendingClinicRegistration)
        .where(PendingClinicRegistration.id == registration_id)
    )
    reg = result.scalar_one_or_none()
    
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registration not found"
        )
    
    return {
        "id": reg.id,
        "clinic_id": reg.clinic_id,
        "clinic_name": reg.clinic_name,
        "email": reg.email,
        "phone": reg.phone,
        "category": reg.category,
        # Address fields
        "street_address": reg.street_address,
        "road": reg.road,
        "layout": reg.layout,
        "section": reg.section,
        "city": reg.city,
        "pincode": reg.pincode,
        "address": reg.address,
        "latitude": reg.latitude,
        "longitude": reg.longitude,
        # Doctor details
        "doctor_name": reg.doctor_name,
        "specialization": reg.specialization,
        "experience": reg.experience,
        "qualifications": reg.qualifications,
        "image_urls": reg.image_urls,
        "status": reg.status,
        "created_at": reg.created_at.isoformat() if reg.created_at else None,
        "updated_at": reg.updated_at.isoformat() if reg.updated_at else None,
    }


@router.post("/pending-registrations/{registration_id}/approve")
async def approve_registration(
    registration_id: int,
    admin_id: str,
    notes: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Approve a pending clinic registration.
    Moves the clinic from pending table to approved clinics table.
    """
    try:
        # Get the pending registration
        result = await db.execute(
            select(PendingClinicRegistration)
            .where(PendingClinicRegistration.id == registration_id)
        )
        pending_reg = result.scalar_one_or_none()
 
        if not pending_reg:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Registration not found"
            )
 
        if pending_reg.status != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Registration is already {pending_reg.status}"
            )
 
        # Check if email already exists in clinics
        result = await db.execute(select(Clinic).where(Clinic.email == pending_reg.email))
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A clinic with this email already exists"
            )
 
        # Create approved clinic with all address fields, category and doctor details
        new_clinic = Clinic(
            clinic_id=pending_reg.clinic_id,
            clinic_name=pending_reg.clinic_name,
            email=pending_reg.email,
            password=pending_reg.password,
            phone=pending_reg.phone,
            category=pending_reg.category,
            street_address=pending_reg.street_address,
            road=pending_reg.road,
            layout=pending_reg.layout,
            section=pending_reg.section,
            city=pending_reg.city,
            pincode=pending_reg.pincode,
            address=pending_reg.address,
            latitude=pending_reg.latitude,
            longitude=pending_reg.longitude,
            image_urls=pending_reg.image_urls,
            doctor_name=pending_reg.doctor_name,
            specialization=pending_reg.specialization,
            experience=pending_reg.experience,
            qualifications=pending_reg.qualifications,
            available=True,
            is_active=False,
        )

        approved_clinic_id = pending_reg.clinic_id
        approved_email = pending_reg.email
        approved_clinic_name = pending_reg.clinic_name
 
        db.add(new_clinic)

        # Remove from pending table after approval
        await db.delete(pending_reg)

        await db.commit()
        await db.refresh(new_clinic)
 
        # Send approval email (best-effort)
        try:
            email_sent = send_clinic_approval_email(
                approved_email,
                approved_clinic_name,
                approved_clinic_id
            )
        except Exception as e:
            print(f"Approval email failed: {str(e)}")
            email_sent = False
 
        return {
            "message": "Clinic registration approved successfully",
            "clinic_id": approved_clinic_id,
            "email_sent": email_sent,
            "clinic": {
                "clinic_id": new_clinic.clinic_id,
                "clinic_name": new_clinic.clinic_name,
                "email": new_clinic.email,
                "phone": new_clinic.phone,
                "address": new_clinic.address,
                "latitude": new_clinic.latitude,
                "longitude": new_clinic.longitude,
                "category": new_clinic.category,
                "city": new_clinic.city,
                "doctor_name": new_clinic.doctor_name,
                "specialization": new_clinic.specialization,
            },
        }
    except HTTPException:
        # Let FastAPI handle HTTP errors as-is
        raise
    except Exception as e:
        await db.rollback()
        import traceback
        error_msg = f"Error during approval: {str(e)}"
        print(error_msg)
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=error_msg
        )


@router.post("/pending-registrations/{registration_id}/reject")
async def reject_registration(
    registration_id: int,
    admin_id: str,
    reason: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Reject a pending clinic registration.
    """
    try:
        # Get the pending registration
        result = await db.execute(
            select(PendingClinicRegistration)
            .where(PendingClinicRegistration.id == registration_id)
        )
        pending_reg = result.scalar_one_or_none()
 
        if not pending_reg:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Registration not found"
            )
 
        if pending_reg.status != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Registration is already {pending_reg.status}"
            )
 
        from app.database.models import RejectedClinic
 
        rejected_clinic = RejectedClinic(
            clinic_id=pending_reg.clinic_id,
            clinic_name=pending_reg.clinic_name,
            email=pending_reg.email,
            password=pending_reg.password,
            phone=pending_reg.phone,
            category=pending_reg.category,
            street_address=pending_reg.street_address,
            road=pending_reg.road,
            layout=pending_reg.layout,
            section=pending_reg.section,
            city=pending_reg.city,
            pincode=pending_reg.pincode,
            address=pending_reg.address,
            latitude=pending_reg.latitude,
            longitude=pending_reg.longitude,
            doctor_name=pending_reg.doctor_name,
            specialization=pending_reg.specialization,
            experience=pending_reg.experience,
            qualifications=pending_reg.qualifications,
            image_urls=pending_reg.image_urls,
            rejection_reason=reason,
        )

        rejected_clinic_id = pending_reg.clinic_id
        rejected_email = pending_reg.email
        rejected_clinic_name = pending_reg.clinic_name
 
        db.add(rejected_clinic)

        # Remove from pending table after rejection
        await db.delete(pending_reg)

        await db.commit()
 
        # Send rejection email (best-effort)
        try:
            email_sent = send_clinic_rejection_email(
                rejected_email,
                rejected_clinic_name,
                reason
            )
        except Exception as e:
            print(f"Rejection email failed: {str(e)}")
            email_sent = False
 
        return {
            "message": "Clinic registration rejected",
            "clinic_id": rejected_clinic_id,
            "email_sent": email_sent,
            "reason": reason,
        }
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        import traceback
        error_msg = f"Error during rejection: {str(e)}"
        print(error_msg)
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=error_msg
        )


# ============ Statistics Endpoints ============

@router.get("/statistics")
async def get_admin_statistics(db: AsyncSession = Depends(get_db)):
    """
    Get statistics for the admin dashboard.
    """
    from app.database.models import RejectedClinic
    
    # Pending count - from pending_clinic_registrations table
    pending_result = await db.execute(
        select(func.count())
        .select_from(PendingClinicRegistration)
        .where(PendingClinicRegistration.status == "pending")
    )
    pending_count = pending_result.scalar()
    
    # Approved count - from clinics table (all approved clinics)
    approved_result = await db.execute(
        select(func.count()).select_from(Clinic)
    )
    approved_count = approved_result.scalar()
    
    # Rejected count - from rejected_clinics table
    rejected_result = await db.execute(
        select(func.count()).select_from(RejectedClinic)
    )
    rejected_count = rejected_result.scalar()
    
    # Active clinics - from clinics table where is_active = true
    active_result = await db.execute(
        select(func.count()).select_from(Clinic).where(Clinic.is_active == True)
    )
    active_clinics = active_result.scalar()
    
    return {
        "pending_registrations": pending_count,
        "approved_registrations": approved_count,
        "rejected_registrations": rejected_count,
        "total_active_clinics": active_clinics,
    }


@router.get("/approved-clinics")
async def get_approved_clinics(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all approved clinics from the clinics table.
    """
    # Get total count
    count_result = await db.execute(select(func.count()).select_from(Clinic))
    total = count_result.scalar()
    
    # Get paginated results
    offset = (page - 1) * limit
    result = await db.execute(
        select(Clinic).order_by(Clinic.created_at.desc()).offset(offset).limit(limit)
    )
    clinics = result.scalars().all()
    
    return {
        "clinics": [
            {
                "id": c.id,
                "clinic_id": c.clinic_id,
                "clinic_name": c.clinic_name,
                "email": c.email,
                "phone": c.phone,
                "category": c.category,
                "street_address": c.street_address,
                "road": c.road,
                "layout": c.layout,
                "section": c.section,
                "city": c.city,
                "pincode": c.pincode,
                "address": c.address,
                "latitude": c.latitude,
                "longitude": c.longitude,
                "doctor_name": c.doctor_name,
                "specialization": c.specialization,
                "experience": c.experience,
                "qualifications": c.qualifications,
                "image_urls": c.image_urls,
                "available": c.available,
                "is_active": c.is_active,
                "created_at": c.created_at.isoformat() if c.created_at else None,
            }
            for c in clinics
        ],
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "pages": (total + limit - 1) // limit
        }
    }


@router.get("/rejected-clinics")
async def get_rejected_clinics(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all rejected clinics from the rejected_clinics table.
    """
    from app.database.models import RejectedClinic
    
    # Get total count
    count_result = await db.execute(select(func.count()).select_from(RejectedClinic))
    total = count_result.scalar()
    
    # Get paginated results
    offset = (page - 1) * limit
    result = await db.execute(
        select(RejectedClinic).order_by(RejectedClinic.rejected_at.desc()).offset(offset).limit(limit)
    )
    clinics = result.scalars().all()
    
    return {
        "clinics": [
            {
                "id": c.id,
                "clinic_id": c.clinic_id,
                "clinic_name": c.clinic_name,
                "email": c.email,
                "phone": c.phone,
                "category": c.category,
                "street_address": c.street_address,
                "road": c.road,
                "layout": c.layout,
                "section": c.section,
                "city": c.city,
                "pincode": c.pincode,
                "address": c.address,
                "latitude": c.latitude,
                "longitude": c.longitude,
                "doctor_name": c.doctor_name,
                "specialization": c.specialization,
                "experience": c.experience,
                "qualifications": c.qualifications,
                "image_urls": c.image_urls,
                "rejection_reason": c.rejection_reason,
                "created_at": c.created_at.isoformat() if c.created_at else None,
                "rejected_at": c.rejected_at.isoformat() if c.rejected_at else None,
            }
            for c in clinics
        ],
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "pages": (total + limit - 1) // limit
        }
    }

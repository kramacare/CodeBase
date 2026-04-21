from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, JSON, ARRAY, LargeBinary
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func

Base = declarative_base()

class Clinic(Base):
    __tablename__ = "clinics"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(String, unique=True, index=True, nullable=False)
    clinic_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    address = Column(String, nullable=False)
    image_urls = Column(JSON, default=list)  # Store image IDs for reference
    doctor_name = Column(String, nullable=True)
    available = Column(Boolean, default=True)
    start = Column(Integer, nullable=True)
    end = Column(Integer, nullable=True)
    booking_cutoff_minutes = Column(Integer, default=15)  # Stop booking X minutes before end
    is_active = Column(Boolean, default=False)  # True when clinic clicks "Start"
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ClinicImage(Base):
    __tablename__ = "clinic_images"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(String, unique=True, nullable=False, index=True)  # One row per clinic
    images = Column(JSON, default=list)  # Array of {image_data: "base64...", image_type: "image/jpeg"}
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class Patient(Base):
    __tablename__ = "patients"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Appointment(Base):
    __tablename__ = "appointments"
    
    id = Column(Integer, primary_key=True, index=True)
    appointment_token = Column(String, nullable=False)
    clinic_id = Column(String, nullable=False)
    patient_id = Column(String, nullable=False)
    patient_name = Column(String, nullable=False)
    patient_email = Column(String, nullable=False)
    patient_phone = Column(String, nullable=False)
    doctor_name = Column(String, nullable=True)
    date = Column(String, nullable=False)
    time = Column(String, nullable=False)
    status = Column(String, default="booked")
    notification_stage = Column(String, default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    source = Column(String, default="online")

class CompletedAppointment(Base):
    """Model for storing completed/served patient history"""
    __tablename__ = "completed_appointments"
    
    id = Column(Integer, primary_key=True, index=True)
    appointment_token = Column(String, nullable=False)
    clinic_id = Column(String, nullable=False)
    patient_id = Column(String, nullable=False)
    patient_name = Column(String, nullable=False)
    patient_email = Column(String, nullable=False)
    patient_phone = Column(String, nullable=False)
    doctor_name = Column(String, nullable=True)
    date = Column(String, nullable=False)
    time = Column(String, nullable=False)
    served_at = Column(DateTime(timezone=True), server_default=func.now())
    finished_at = Column(DateTime(timezone=True))
    status = Column(String, default="served")  # served, completed, skipped
    wait_time_minutes = Column(Integer, nullable=True)  # how long they waited

class ClinicTimeSlot(Base):
    """Model for storing clinic operating time slots - one row per clinic with all slots as JSON array"""
    __tablename__ = "clinic_time_slots"

    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(String, unique=True, nullable=False, index=True)
    slots = Column(JSON, default=list)  # Array of {slot_name, time_range, is_open}
    slot = Column(ARRAY(String), default=list)  # Array of "open"/"close" for each slot
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class OTPVerification(Base):
    """Model for storing OTP verification codes and pending user data"""
    __tablename__ = "otp_verifications"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    otp_code = Column(String(64), nullable=False)  # SHA256 hash = 64 chars
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime, nullable=False)
    attempt_count = Column(Integer, default=0)
    
    # Store pending user data (will be moved to Patient table after verification)
    user_name = Column(String(255), nullable=False)
    user_password = Column(String(255), nullable=False)  # Bcrypt hash = ~60 chars
    user_phone = Column(String(50), nullable=False)

class Review(Base):
    """Model for storing patient reviews for clinics"""
    __tablename__ = "reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(String, nullable=False, index=True)
    patient_id = Column(String, nullable=False, index=True)
    patient_name = Column(String, nullable=False)
    rating = Column(Integer, nullable=False)  # 1-5 stars
    review_text = Column(String, nullable=True)
    likes = Column(Integer, default=0)
    dislikes = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ReviewReaction(Base):
    """Track which patients liked/disliked which reviews"""
    __tablename__ = "review_reactions"

    id = Column(Integer, primary_key=True, index=True)
    review_id = Column(Integer, nullable=False, index=True)
    patient_id = Column(String, nullable=False, index=True)
    reaction_type = Column(String, nullable=False)  # 'like' or 'dislike'
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class QRAppointment(Base):
    """Model for QR walk-in appointments - separate from online bookings"""
    __tablename__ = "qr_appointments"

    id = Column(Integer, primary_key=True, index=True)
    appointment_token = Column(String, nullable=False)
    clinic_id = Column(String, nullable=False)
    patient_name = Column(String, nullable=False)
    patient_phone = Column(String, nullable=False)
    doctor_name = Column(String, nullable=True)
    date = Column(String, nullable=False)
    status = Column(String, default="booked")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

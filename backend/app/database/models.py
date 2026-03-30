from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, JSON
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
    doctor_name = Column(String, nullable=True)
    available = Column(Boolean, default=True)
    start = Column(Integer, nullable=True)
    end = Column(Integer, nullable=True)
    booking_cutoff_minutes = Column(Integer, default=15)  # Stop booking X minutes before end
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Time(Base):
    __tablename__ = "times"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(String, nullable=False)
    email = Column(String, nullable=False)
    starting = Column(Integer, nullable=False)  # Start hour (e.g., 9)
    ending = Column(Integer, nullable=False)    # End hour (e.g., 17)
    not_available = Column(String, nullable=True)  # Comma-separated unavailable hours (e.g., "1,11")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

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
    created_at = Column(DateTime(timezone=True), server_default=func.now())

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

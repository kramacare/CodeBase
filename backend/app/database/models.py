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

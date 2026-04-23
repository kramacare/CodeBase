from pydantic import BaseModel, EmailStr
from typing import Optional, List

class DoctorInfo(BaseModel):
    name: str
    specialization: str

class ClinicSignup(BaseModel):
    clinic_name: str
    email: EmailStr
    password: str
    phone: str
    category: str  # Clinic category (e.g., general, dental, skin)
    address: str  # Full combined address
    # Individual address components
    street_address: Optional[str] = None  # Street/Building Number
    road: Optional[str] = None  # Road/Street Name
    layout: Optional[str] = None  # Layout/Area
    section: Optional[str] = None  # Section/Block
    city: Optional[str] = None  # City
    pincode: Optional[str] = None  # Pincode
    # Doctor details
    doctor_name: Optional[str] = ""  # Doctor name
    specialization: Optional[str] = ""  # Specialization
    experience: Optional[str] = ""  # Years of experience
    qualifications: Optional[str] = ""  # Qualifications (MBBS, MD, etc.)

class ClinicLogin(BaseModel):
    email: EmailStr
    password: str

class PatientSignup(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: str

class PatientLogin(BaseModel):
    email: EmailStr
    password: str

class AuthResponse(BaseModel):
    message: str
    user_type: Optional[str] = None
    clinic_id: Optional[str] = None
    patient_data: Optional[dict] = None

class ErrorResponse(BaseModel):
    error: str

# OTP Schemas
class SendOTPRequest(BaseModel):
    email: EmailStr

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp_code: str

class OTPResponse(BaseModel):
    message: str
    success: bool
    expires_in: int  # seconds

class OTPVerifyResponse(BaseModel):
    message: str
    success: bool
    verified: bool

# Profile Management Schemas
class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
    patient_email: str

class ChangePhoneRequest(BaseModel):
    new_phone: str
    patient_email: str

class DeleteAccountRequest(BaseModel):
    password: str
    confirmation: str = "DELETE"
    patient_email: str

class DeleteClinicRequest(BaseModel):
    password: str
    confirmation: str = "DELETE"
    clinic_id: str

# Appointment Schemas
class AppointmentCreateRequest(BaseModel):
    patient_name: str
    patient_email: str
    patient_phone: Optional[str] = ""
    clinic_id: str
    clinic_name: str
    doctor_name: str
    date: str
    time: str
    status: str = "booked"

    class Config:
        extra = "allow"  # Allow extra fields

class AppointmentResponse(BaseModel):
    message: str
    appointment_id: int
    token: str

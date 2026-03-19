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
    address: str
    doctor_name: Optional[str] = ""  # Doctor name field

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

class ErrorResponse(BaseModel):
    error: str

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
    confirmation: str  # Must be "DELETE" to confirm
    patient_email: str

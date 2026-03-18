from pydantic import BaseModel, EmailStr
from typing import Optional

class ClinicSignup(BaseModel):
    clinic_name: str
    email: EmailStr
    password: str
    phone: str

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

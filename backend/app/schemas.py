from pydantic import BaseModel
from typing import Optional

class ClinicSignup(BaseModel):
    clinic_name: str
    email: str
    password: str
    phone: Optional[str] = None

class ClinicLogin(BaseModel):
    email: str
    password: str

class PatientSignup(BaseModel):
    name: str
    email: str
    password: str
    phone: Optional[str] = None

class PatientLogin(BaseModel):
    email: str
    password: str

class Response(BaseModel):
    message: str

class LoginResponse(BaseModel):
    message: str
    user_id: int
    user_type: str

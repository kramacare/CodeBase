from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ClinicSignup(BaseModel):
    clinic_name: str
    doctor_name: str
    specialization: str
    address: str
    city: str
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
    clinic_id: Optional[str] = None

class LoginResponse(BaseModel):
    message: str
    user_id: int
    user_type: str

# Queue System Schemas
class TokenRequest(BaseModel):
    clinic_id: str
    patient_name: str
    patient_number: str

class TokenResponse(BaseModel):
    message: str
    token_number: int
    patient_name: str
    patient_number: str
    status: str

class NextPatientRequest(BaseModel):
    clinic_id: str

class NextPatientResponse(BaseModel):
    message: str
    current_serving: Optional[dict] = None
    next_patient: Optional[dict] = None

class PatientDashboardResponse(BaseModel):
    token_number: int
    patient_name: str
    patient_number: str
    status: str
    patients_ahead: int
    estimated_wait_time: Optional[int] = None

class ClinicDashboardResponse(BaseModel):
    current_serving: Optional[dict] = None
    waiting_patients: list
    total_patients_today: int
    clinic_id: str

class ErrorResponse(BaseModel):
    detail: str

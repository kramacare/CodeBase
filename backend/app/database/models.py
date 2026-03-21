from sqlalchemy import Column, Integer, String, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func

Base = declarative_base()

class Clinic(Base):
    __tablename__ = "clinics"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(String, unique=True, index=True, nullable=False)  # Generated clinic ID like "FA23W3"
    clinic_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    address = Column(String, nullable=False)
    doctor_name = Column(String, nullable=True)  # Doctor name field to avoid conflict with Patient.name
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Patient(Base):
    __tablename__ = "patients"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

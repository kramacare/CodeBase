from sqlalchemy import Column, Integer, String, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func

Base = declarative_base()

# Create tables when models are imported
async def create_tables():
    """Create all database tables"""
    from app.database.db import engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Database tables created successfully!")

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

class Appointment(Base):
    __tablename__ = "appointments"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_name = Column(String, nullable=False)
    patient_email = Column(String, nullable=False)
    patient_phone = Column(String, nullable=False)
    clinic_id = Column(String, nullable=False)  # Foreign key reference
    clinic_name = Column(String, nullable=False)
    doctor_name = Column(String, nullable=False)
    date = Column(String, nullable=False)  # Appointment date
    time = Column(String, nullable=False)  # Appointment time
    token = Column(String, unique=True, nullable=False)  # Unique token like "T-123"
    status = Column(String, nullable=False, default="booked")  # booked, completed, cancelled
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class QueueHistory(Base):
    __tablename__ = "queue_history"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(String, nullable=False, index=True)
    patient_name = Column(String, nullable=False)
    patient_email = Column(String, nullable=True)
    token = Column(String, nullable=False)
    position = Column(Integer, nullable=False)  # Position in queue
    start_time = Column(DateTime(timezone=True), nullable=False)  # When serving started
    end_time = Column(DateTime(timezone=True), nullable=True)  # When serving ended
    total_time_minutes = Column(Integer, nullable=True)  # Calculated total time in minutes
    status = Column(String, nullable=False, default="completed")  # completed, skipped
    created_at = Column(DateTime(timezone=True), server_default=func.now())

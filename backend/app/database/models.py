from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.sql import func
import enum

class Base(DeclarativeBase):
    pass

class TokenStatus(enum.Enum):
    WAITING = "waiting"
    SERVING = "serving"

class Clinic(Base):
    __tablename__ = "clinic"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(String(10), unique=True, index=True, nullable=False)
    clinic_name = Column(String, nullable=False)
    doctor_name = Column(String, nullable=True)
    specialization = Column(String, nullable=True)
    address = Column(String, nullable=True)
    city = Column(String, nullable=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class TodayToken(Base):
    __tablename__ = "today_tokens"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(String(10), index=True, nullable=False)
    patient_name = Column(String, nullable=False)
    patient_number = Column(String, nullable=False)
    token_number = Column(Integer, nullable=False)
    status = Column(Enum(TokenStatus), default=TokenStatus.WAITING, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    date = Column(DateTime(timezone=True), server_default=func.now())
    
    # Ensure unique token per clinic per day
    __table_args__ = (
        {"schema": None},
    )

class HistoryToken(Base):
    __tablename__ = "history_tokens"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(String(10), index=True, nullable=False)
    patient_name = Column(String, nullable=False)
    patient_number = Column(String, nullable=False)
    token_number = Column(Integer, nullable=False)
    date = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), server_default=func.now())

class Patient(Base):
    __tablename__ = "patients"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

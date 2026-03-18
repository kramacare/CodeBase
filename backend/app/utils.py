import random
import string
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.models import Clinic

def generate_clinic_id() -> str:
    """Generate a unique clinic ID in format aaaa01-aaaa99"""
    prefix = "aaaa"
    random_number = random.randint(1, 99)
    return f"{prefix}{random_number:02d}"

async def get_unique_clinic_id(db: AsyncSession) -> str:
    """Generate a unique clinic ID that doesn't exist in the database"""
    max_attempts = 100
    attempts = 0
    
    while attempts < max_attempts:
        clinic_id = generate_clinic_id()
        
        # Check if this ID already exists
        result = await db.execute(select(Clinic).where(Clinic.clinic_id == clinic_id))
        existing_clinic = result.scalar_one_or_none()
        
        if not existing_clinic:
            return clinic_id
        
        attempts += 1
    
    # If we can't find a unique ID after 100 attempts, use a different approach
    # Generate with random letters and numbers
    while True:
        prefix = ''.join(random.choices(string.ascii_lowercase, k=4))
        random_number = random.randint(1, 99)
        clinic_id = f"{prefix}{random_number:02d}"
        
        result = await db.execute(select(Clinic).where(Clinic.clinic_id == clinic_id))
        existing_clinic = result.scalar_one_or_none()
        
        if not existing_clinic:
            return clinic_id

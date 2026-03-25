import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.database.models import Patient
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

async def check_patient_data():
    engine = create_async_engine(DATABASE_URL)
    AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Patient).where(Patient.email == 'diganths083@gmail.com'))
        patient = result.scalar_one_or_none()
        if patient:
            print(f'✅ Patient found: {patient.name}')
            print(f'   ID: {patient.id}')
            print(f'   Email: {patient.email}')
            print(f'   Phone: {patient.phone}')
            print(f'   Created: {patient.created_at}')
        else:
            print('❌ Patient NOT found in database')

if __name__ == "__main__":
    asyncio.run(check_patient_data())

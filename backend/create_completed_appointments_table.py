import asyncio
from app.database.db import engine
from sqlalchemy import text

async def create_completed_appointments_table():
    """Create completed_appointments table"""
    async with engine.begin() as conn:
        await conn.execute(text("DROP TABLE IF EXISTS completed_appointments CASCADE"))
        await conn.execute(text("""
            CREATE TABLE completed_appointments (
                id SERIAL PRIMARY KEY,
                appointment_token VARCHAR(50) NOT NULL,
                clinic_id VARCHAR(50) NOT NULL,
                patient_id VARCHAR(50) NOT NULL,
                patient_name VARCHAR(255) NOT NULL,
                patient_email VARCHAR(255) NOT NULL,
                patient_phone VARCHAR(50) NOT NULL,
                doctor_name VARCHAR(255),
                date VARCHAR(50) NOT NULL,
                time VARCHAR(50) NOT NULL,
                served_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                finished_at TIMESTAMP WITH TIME ZONE,
                status VARCHAR(50) DEFAULT 'served',
                wait_time_minutes INTEGER
            )
        """))
        print("Created completed_appointments table!")

asyncio.run(create_completed_appointments_table())

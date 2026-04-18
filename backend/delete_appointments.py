import asyncio
from sqlalchemy import text
from app.database.db import engine

async def delete_all():
    async with engine.begin() as conn:
        await conn.execute(text("DELETE FROM appointments"))
        await conn.execute(text("DELETE FROM qr_appointments"))
        await conn.execute(text("DELETE FROM completed_appointments"))
    print("Deleted all data from appointments, qr_appointments, and completed_appointments")

asyncio.run(delete_all())

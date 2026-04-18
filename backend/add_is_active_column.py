import asyncio
from sqlalchemy import text
from app.database.db import engine

async def add_is_active_column():
    async with engine.begin() as conn:
        try:
            await conn.execute(text("ALTER TABLE clinics ADD COLUMN is_active BOOLEAN DEFAULT FALSE"))
            print("Added is_active column to clinics table")
        except Exception as e:
            print(f"Column may already exist or error: {e}")

if __name__ == "__main__":
    asyncio.run(add_is_active_column())

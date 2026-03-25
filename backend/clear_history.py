"""
Clear all queue history and appointments data
Run this script to delete all appointment history details
"""
import os
from dotenv import load_dotenv
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

# Load from .env file
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
print(f"Connecting to: {DATABASE_URL}")

async def clear_all_data():
    """Delete all queue history and appointments data"""
    
    engine = create_async_engine(DATABASE_URL, echo=True)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with engine.begin() as conn:
        async with async_session() as session:
            # Clear queue_history table
            print("🗑️ Deleting all queue_history records...")
            await session.execute(text("DELETE FROM queue_history"))
            
            # Clear appointments table
            print("🗑️ Deleting all appointment records...")
            await session.execute(text("DELETE FROM appointments"))
            
            await session.commit()
            print("✅ All data cleared successfully!")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(clear_all_data())

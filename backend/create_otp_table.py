"""
Database migration script for OTP verification system.
Run this to create/update the otp_verifications table.
"""
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.database.db import engine
from app.database.models import Base, OTPVerification


async def create_otp_table():
    """Create the otp_verifications table"""
    async with engine.begin() as conn:
        # Create the table using SQLAlchemy's create_all
        await conn.run_sync(Base.metadata.create_all)
        print("Tables created successfully!")


async def drop_and_recreate():
    """Drop and recreate all tables (WARNING: deletes all data!)"""
    async with engine.begin() as conn:
        # Drop all tables
        await conn.run_sync(Base.metadata.drop_all)
        print("All tables dropped!")
        
        # Recreate all tables
        await conn.run_sync(Base.metadata.create_all)
        print("All tables recreated!")


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--force":
        print("⚠️  Dropping and recreating ALL tables (ALL DATA WILL BE LOST!)")
        asyncio.run(drop_and_recreate())
    else:
        print("Creating/updating OTP verification table...")
        asyncio.run(create_otp_table())
        print("Done! If you see errors about missing columns, run with --force flag")

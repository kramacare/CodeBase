from sqlalchemy import text
from app.database.db import AsyncSessionLocal, engine
from app.database.models import Base


async def truncate_table(table_name: str):
    """Delete all data from a table by name."""
    async with AsyncSessionLocal() as session:
        await session.execute(text(f"TRUNCATE TABLE {table_name} CASCADE"))
        await session.commit()


if __name__ == "__main__":
    import asyncio
    import sys

    if len(sys.argv) < 2:
        print("Usage: python truncate_table.py <table_name>")
        print("Available tables: clinics, patients, otp_verifications")
        sys.exit(1)

    table = sys.argv[1]
    asyncio.run(truncate_table(table))
    print(f"All data truncated from table: {table}")

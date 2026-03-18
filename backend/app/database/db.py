from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./clinic.db")

# Use SQLite for development if PostgreSQL is not available
if DATABASE_URL.startswith("postgresql"):
    engine = create_async_engine(
        DATABASE_URL,
        echo=True,
    )
else:
    # SQLite configuration
    from sqlalchemy.ext.asyncio import create_async_engine
    engine = create_async_engine(
        DATABASE_URL,
        echo=True,
        poolclass=StaticPool,
        connect_args={"check_same_thread": False},
    )

AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

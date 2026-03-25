from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.database.db import engine
from app.database.models import Base
from app.routers import auth

app = FastAPI(title="Clinic Authentication API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:3000", "http://localhost:8001", "*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600
)

app.include_router(auth.router)

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        # Create tables if they don't exist
        await conn.run_sync(Base.metadata.create_all)

@app.get("/")
async def root():
    return {"message": "Clinic Authentication API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

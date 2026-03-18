from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.db import engine
from app.database.models import Base
from app.routers import auth, queue
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="Krama Authentication API", version="1.0.0")

# ✅ ENV-BASED CORS (IMPORTANT)
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:8080")

origins = [
    FRONTEND_URL,
]

# ✅ CORS middleware (MUST be before routers)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Include routers AFTER CORS
app.include_router(auth.router)
app.include_router(queue.router)

# ✅ Debug endpoint to show all routes
@app.get("/debug/routes")
async def debug_routes():
    """Show all registered routes for debugging"""
    from fastapi.routing import APIRoute
    routes = []
    for route in app.routes:
        if isinstance(route, APIRoute):
            routes.append({
                "path": route.path,
                "methods": list(route.methods),
                "name": route.name
            })
    return {"routes": routes}

# ✅ Test endpoint for CORS testing
@app.post("/test")
async def test_endpoint():
    return {"message": "CORS test successful"}

# ✅ Startup event
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print(f" Server started with CORS allowed for: {origins}")

@app.get("/")
async def root():
    return {"message": "Krama Authentication API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
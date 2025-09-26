from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv("../.env")

from app.api.v1.router import router as api_v1_router
from app.core.database import engine
from app.models import user, repository

# Create database tables
user.Base.metadata.create_all(bind=engine)
repository.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CodeCritic AI API",
    description="AI-powered code review and analysis platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_v1_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "CodeCritic AI API is running!", "status": "healthy"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy", 
        "service": "codecritic-ai-api",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
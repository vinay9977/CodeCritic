from fastapi import APIRouter
from app.api.v1.endpoints import auth, repositories

router = APIRouter()

router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
router.include_router(repositories.router, prefix="/repositories", tags=["Repositories"])

@router.get("/")
async def api_status():
    return {"message": "CodeCritic AI API v1", "status": "operational"}
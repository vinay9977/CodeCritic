from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def repositories_status():
    return {"message": "Repositories endpoint working", "status": "ok"}

@router.get("/list")
async def list_repositories():
    return {"message": "Repository list - coming soon", "repositories": []}
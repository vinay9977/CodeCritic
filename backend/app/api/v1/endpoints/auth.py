from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer
from pydantic import BaseModel
from typing import Optional
import os

router = APIRouter()
security = HTTPBearer()

class LoginRequest(BaseModel):
    code: str
    state: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    username: str
    name: Optional[str] = None
    email: Optional[str] = None
    avatar_url: Optional[str] = None
    github_url: Optional[str] = None
    is_active: bool = True

@router.get("/github/login")
async def github_login():
    """Initiate GitHub OAuth login"""
    client_id = os.getenv("GITHUB_CLIENT_ID", "placeholder")
    redirect_uri = os.getenv("GITHUB_REDIRECT_URI", "http://localhost:3000/auth/callback")
    
    auth_url = f"https://github.com/login/oauth/authorize?client_id={client_id}&redirect_uri={redirect_uri}&scope=user:email repo"
    
    return {"auth_url": auth_url}

@router.post("/github/callback")
async def github_callback(login_request: LoginRequest):
    """Handle GitHub OAuth callback"""
    try:
        print(f"Received callback with code: {login_request.code}")
        
        return {
            "access_token": "test_jwt_token_12345",
            "token_type": "bearer",
            "user": {
                "id": 1,
                "github_id": 123456,
                "username": "testuser",
                "name": "Test User",
                "email": "test@example.com",
                "avatar_url": "https://github.com/images/error/octocat_happy.gif",
                "github_url": "https://github.com/testuser",
                "is_active": True,
                "created_at": "2024-01-01T00:00:00Z"
            }
        }
    except Exception as e:
        print(f"Callback error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Authentication failed: {str(e)}"
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user(token: str = Depends(security)):
    """Get current authenticated user"""
    try:
        print(f"Getting user info for token: {token.credentials}")
        
        # For now, return a test user
        return UserResponse(
            id=1,
            username="testuser",
            name="Test User",
            email="test@example.com",
            avatar_url="https://github.com/images/error/octocat_happy.gif",
            github_url="https://github.com/testuser",
            is_active=True
        )
    except Exception as e:
        print(f"Get user error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token"
        )

@router.post("/logout")
async def logout():
    """Logout user"""
    return {"message": "Successfully logged out"}

@router.get("/")
async def auth_status():
    return {"message": "Auth endpoint working", "status": "ok"}
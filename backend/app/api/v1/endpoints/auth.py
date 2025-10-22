from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.database import get_db
from app.core.auth import create_access_token, verify_token
from app.services.github_auth import GitHubAuthService
from app.schemas.user import LoginRequest, Token, UserResponse, UserCreate
from app.crud import crud_user

router = APIRouter()
security = HTTPBearer()
github_service = GitHubAuthService()

@router.get("/github/login")
async def github_login():
    """Initiate GitHub OAuth login"""
    try:
        auth_url = github_service.get_authorization_url()
        return {"auth_url": auth_url}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/github/callback", response_model=Token)
async def github_callback(
    login_request: LoginRequest,
    db: Session = Depends(get_db)
):
    """Handle GitHub OAuth callback and create/update user"""
    try:
        # Exchange code for access token
        github_token = await github_service.exchange_code_for_token(login_request.code)
        
        # Get user info from GitHub
        github_user_info = await github_service.get_user_info(github_token)
        
        # Create or update user in database
        user_data = UserCreate(
            github_id=github_user_info["id"],
            username=github_user_info["username"],
            name=github_user_info.get("name"),
            email=github_user_info.get("email"),
            avatar_url=github_user_info.get("avatar_url"),
            github_url=github_user_info.get("github_url"),
            github_access_token=github_token
        )
        
        db_user = crud_user.get_or_create_user(db, user_data)
        
        # Create JWT token
        access_token = create_access_token(data={"sub": str(db_user.id)})
        
        # Prepare user response
        user_response = UserResponse(
            id=db_user.id,
            github_id=db_user.github_id,
            username=db_user.username,
            name=db_user.name,
            email=db_user.email,
            avatar_url=db_user.avatar_url,
            github_url=db_user.github_url,
            is_active=db_user.is_active,
            created_at=db_user.created_at
        )
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            user=user_response
        )
        
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Callback error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Authentication failed: {str(e)}"
        )

async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> int:
    """Verify JWT token and extract user ID"""
    token = credentials.credentials
    user_id = verify_token(token)
    
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user_id

@router.get("/me", response_model=UserResponse)
async def get_current_user(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get current authenticated user"""
    db_user = crud_user.get_user_by_id(db, user_id)
    
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(
        id=db_user.id,
        github_id=db_user.github_id,
        username=db_user.username,
        name=db_user.name,
        email=db_user.email,
        avatar_url=db_user.avatar_url,
        github_url=db_user.github_url,
        is_active=db_user.is_active,
        created_at=db_user.created_at
    )

@router.post("/logout")
async def logout(user_id: int = Depends(get_current_user_id)):
    """Logout user (client-side token removal)"""
    return {"message": "Successfully logged out"}

@router.get("/")
async def auth_status():
    """Check auth endpoint status"""
    return {"message": "Auth endpoint working", "status": "ok"}
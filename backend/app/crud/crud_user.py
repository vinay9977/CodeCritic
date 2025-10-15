from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate
from typing import Optional

def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    """Get user by ID"""
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_github_id(db: Session, github_id: int) -> Optional[User]:
    """Get user by GitHub ID"""
    return db.query(User).filter(User.github_id == github_id).first()

def get_user_by_username(db: Session, username: str) -> Optional[User]:
    """Get user by username"""
    return db.query(User).filter(User.username == username).first()

def create_user(db: Session, user_data: UserCreate) -> User:
    """Create a new user"""
    db_user = User(
        github_id=user_data.github_id,
        username=user_data.username,
        name=user_data.name,
        email=user_data.email,
        avatar_url=user_data.avatar_url,
        github_url=user_data.github_url,
        github_access_token=user_data.github_access_token,
        is_active=True
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user_data: dict) -> Optional[User]:
    """Update user information"""
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        return None
    
    for key, value in user_data.items():
        if hasattr(db_user, key):
            setattr(db_user, key, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user

def get_or_create_user(db: Session, user_data: UserCreate) -> User:
    """Get existing user or create new one"""
    existing_user = get_user_by_github_id(db, user_data.github_id)
    
    if existing_user:
        # Update user info with latest data from GitHub
        update_data = {
            "username": user_data.username,
            "name": user_data.name,
            "email": user_data.email,
            "avatar_url": user_data.avatar_url,
            "github_url": user_data.github_url,
            "github_access_token": user_data.github_access_token
        }
        return update_user(db, existing_user.id, update_data)
    
    return create_user(db, user_data)
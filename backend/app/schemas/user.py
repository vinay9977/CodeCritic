from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    username: str
    name: Optional[str] = None
    email: Optional[EmailStr] = None

class UserCreate(UserBase):
    github_id: int
    avatar_url: Optional[str] = None
    github_url: Optional[str] = None
    github_access_token: str

class UserResponse(UserBase):
    id: int
    github_id: int
    avatar_url: Optional[str] = None
    github_url: Optional[str] = None
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class LoginRequest(BaseModel):
    code: str
    state: Optional[str] = None
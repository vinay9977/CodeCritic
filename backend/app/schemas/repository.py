from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class RepositoryBase(BaseModel):
    name: str
    full_name: str
    description: Optional[str] = None
    html_url: str
    language: Optional[str] = None
    is_private: bool = False
    stars_count: int = 0
    forks_count: int = 0

class RepositoryCreate(RepositoryBase):
    github_id: int
    url: str
    default_branch: str = "main"
    is_fork: bool = False
    open_issues_count: int = 0
    size: int = 0

class RepositoryResponse(RepositoryBase):
    id: int
    github_id: int
    user_id: int
    url: str
    default_branch: str
    is_fork: bool
    open_issues_count: int
    size: int
    last_synced_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class RepositorySyncResponse(BaseModel):
    message: str
    synced_count: int
    total_count: int
    repositories: list[RepositoryResponse]
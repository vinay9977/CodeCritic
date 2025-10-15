from sqlalchemy.orm import Session
from app.models.repository import Repository
from typing import List, Optional
from datetime import datetime

def get_repository_by_id(db: Session, repo_id: int) -> Optional[Repository]:
    """Get repository by ID"""
    return db.query(Repository).filter(Repository.id == repo_id).first()

def get_repository_by_github_id(db: Session, github_id: int) -> Optional[Repository]:
    """Get repository by GitHub ID"""
    return db.query(Repository).filter(Repository.github_id == github_id).first()

def get_user_repositories(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Repository]:
    """Get all repositories for a user"""
    return db.query(Repository).filter(
        Repository.user_id == user_id
    ).offset(skip).limit(limit).all()

def create_repository(db: Session, user_id: int, repo_data: dict) -> Repository:
    """Create a new repository"""
    db_repo = Repository(
        user_id=user_id,
        **repo_data,
        last_synced_at=datetime.utcnow()
    )
    db.add(db_repo)
    db.commit()
    db.refresh(db_repo)
    return db_repo

def update_repository(db: Session, repo_id: int, repo_data: dict) -> Optional[Repository]:
    """Update repository information"""
    db_repo = get_repository_by_id(db, repo_id)
    if not db_repo:
        return None
    
    for key, value in repo_data.items():
        if hasattr(db_repo, key):
            setattr(db_repo, key, value)
    
    db_repo.last_synced_at = datetime.utcnow()
    db.commit()
    db.refresh(db_repo)
    return db_repo

def create_or_update_repository(db: Session, user_id: int, repo_data: dict) -> Repository:
    """Create a new repository or update if it exists"""
    existing_repo = get_repository_by_github_id(db, repo_data["github_id"])
    
    if existing_repo:
        # Update existing repository
        for key, value in repo_data.items():
            if hasattr(existing_repo, key):
                setattr(existing_repo, key, value)
        existing_repo.last_synced_at = datetime.utcnow()
        db.commit()
        db.refresh(existing_repo)
        return existing_repo
    else:
        # Create new repository
        return create_repository(db, user_id, repo_data)

def delete_repository(db: Session, repo_id: int) -> bool:
    """Delete a repository"""
    db_repo = get_repository_by_id(db, repo_id)
    if not db_repo:
        return False
    
    db.delete(db_repo)
    db.commit()
    return True

def get_repository_count(db: Session, user_id: int) -> int:
    """Get total repository count for a user"""
    return db.query(Repository).filter(Repository.user_id == user_id).count()
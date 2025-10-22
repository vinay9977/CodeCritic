from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.api.v1.endpoints.auth import get_current_user_id
from app.services.github_repo import GitHubRepoService
from app.schemas.repository import RepositoryResponse, RepositorySyncResponse
from app.crud import crud_user, crud_repository

router = APIRouter()
github_repo_service = GitHubRepoService()

@router.get("/")
async def repositories_status():
    """Check repositories endpoint status"""
    return {"message": "Repositories endpoint working", "status": "ok"}

@router.post("/sync", response_model=RepositorySyncResponse)
async def sync_repositories(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Sync user's GitHub repositories to database"""
    try:
        # Get user from database to retrieve GitHub access token
        db_user = crud_user.get_user_by_id(db, user_id)
        if not db_user or not db_user.github_access_token:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found or GitHub token missing"
            )
        
        # Fetch repositories from GitHub
        github_repos = await github_repo_service.fetch_user_repositories(
            db_user.github_access_token
        )
        
        # Parse and save repositories to database
        synced_repos = []
        for repo in github_repos:
            repo_data = github_repo_service.parse_repository_data(repo)
            db_repo = crud_repository.create_or_update_repository(
                db, user_id, repo_data
            )
            synced_repos.append(db_repo)
        
        # Get updated repository list
        all_user_repos = crud_repository.get_user_repositories(db, user_id)
        
        return RepositorySyncResponse(
            message="Repositories synced successfully",
            synced_count=len(synced_repos),
            total_count=len(all_user_repos),
            repositories=[RepositoryResponse.from_orm(repo) for repo in all_user_repos]
        )
        
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Sync error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to sync repositories: {str(e)}"
        )

@router.get("/list", response_model=List[RepositoryResponse])
async def list_repositories(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """Get list of user's repositories from database"""
    repositories = crud_repository.get_user_repositories(db, user_id, skip, limit)
    return [RepositoryResponse.from_orm(repo) for repo in repositories]

@router.get("/{repo_id}", response_model=RepositoryResponse)
async def get_repository(
    repo_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get a specific repository by ID"""
    repository = crud_repository.get_repository_by_id(db, repo_id)
    
    if not repository:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Repository not found"
        )
    
    # Verify the repository belongs to the user
    if repository.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this repository"
        )
    
    return RepositoryResponse.from_orm(repository)

@router.delete("/{repo_id}")
async def delete_repository(
    repo_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Delete a repository from database"""
    repository = crud_repository.get_repository_by_id(db, repo_id)
    
    if not repository:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Repository not found"
        )
    
    # Verify the repository belongs to the user
    if repository.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this repository"
        )
    
    crud_repository.delete_repository(db, repo_id)
    return {"message": "Repository deleted successfully"}

@router.get("/stats/summary")
async def get_repository_stats(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get repository statistics for the user"""
    total_repos = crud_repository.get_repository_count(db, user_id)
    repos = crud_repository.get_user_repositories(db, user_id)
    
    # Calculate statistics
    total_stars = sum(repo.stars_count for repo in repos)
    total_forks = sum(repo.forks_count for repo in repos)
    languages = {}
    for repo in repos:
        if repo.language:
            languages[repo.language] = languages.get(repo.language, 0) + 1
    
    return {
        "total_repositories": total_repos,
        "total_stars": total_stars,
        "total_forks": total_forks,
        "languages": languages,
        "private_repos": sum(1 for repo in repos if repo.is_private),
        "public_repos": sum(1 for repo in repos if not repo.is_private)
    }
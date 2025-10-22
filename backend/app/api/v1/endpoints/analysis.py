from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.api.v1.endpoints.auth import get_current_user_id
from app.services.analysis_service import AnalysisService
from app.schemas.analysis import (
    AnalysisResponse,
    AnalysisDetailResponse,
    AnalysisStartResponse,
    CodeIssueResponse
)
from app.crud import crud_analysis, crud_repository

router = APIRouter()
analysis_service = AnalysisService()

@router.post("/analyze/{repository_id}", response_model=AnalysisStartResponse)
async def start_analysis(
    repository_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Start code analysis for a repository
    Runs synchronously to ensure proper error handling
    """
    # Verify repository exists and belongs to user
    repository = crud_repository.get_repository_by_id(db, repository_id)
    
    if not repository:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Repository not found"
        )
    
    if repository.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this repository"
        )
    
    # Run analysis directly (for better error handling)
    try:
        analysis = await analysis_service.analyze_repository(db, user_id, repository_id)
        
        return AnalysisStartResponse(
            message="Analysis completed successfully",
            analysis_id=analysis.id,
            status=analysis.status
        )
    except Exception as e:
        # Create failed analysis record
        from app.models.analysis import Analysis
        from datetime import datetime
        
        failed_analysis = Analysis(
            repository_id=repository_id,
            user_id=user_id,
            status="failed",
            error_message=str(e),
            completed_at=datetime.utcnow()
        )
        db.add(failed_analysis)
        db.commit()
        db.refresh(failed_analysis)
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(e)}"
        )

@router.get("/list", response_model=List[AnalysisResponse])
async def list_user_analyses(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 50
):
    """Get all analyses for the current user"""
    analyses = crud_analysis.get_user_analyses(db, user_id, skip, limit)
    return [AnalysisResponse.from_orm(analysis) for analysis in analyses]

@router.get("/repository/{repository_id}", response_model=List[AnalysisResponse])
async def get_repository_analyses(
    repository_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 20
):
    """Get all analyses for a specific repository"""
    # Verify repository belongs to user
    repository = crud_repository.get_repository_by_id(db, repository_id)
    
    if not repository or repository.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    analyses = crud_analysis.get_repository_analyses(db, repository_id, skip, limit)
    return [AnalysisResponse.from_orm(analysis) for analysis in analyses]

@router.get("/{analysis_id}", response_model=AnalysisDetailResponse)
async def get_analysis(
    analysis_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get detailed analysis results including all issues"""
    analysis = crud_analysis.get_analysis_by_id(db, analysis_id)
    
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found"
        )
    
    # Verify analysis belongs to user
    if analysis.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Get issues
    issues = crud_analysis.get_analysis_issues(db, analysis_id)
    
    # Build response
    response = AnalysisDetailResponse.from_orm(analysis)
    response.issues = [CodeIssueResponse.from_orm(issue) for issue in issues]
    
    return response

@router.get("/{analysis_id}/issues", response_model=List[CodeIssueResponse])
async def get_analysis_issues(
    analysis_id: int,
    severity: Optional[str] = None,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get issues for an analysis, optionally filtered by severity"""
    analysis = crud_analysis.get_analysis_by_id(db, analysis_id)
    
    if not analysis or analysis.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    issues = crud_analysis.get_analysis_issues(db, analysis_id, severity)
    return [CodeIssueResponse.from_orm(issue) for issue in issues]

@router.delete("/{analysis_id}")
async def delete_analysis(
    analysis_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Delete an analysis"""
    analysis = crud_analysis.get_analysis_by_id(db, analysis_id)
    
    if not analysis or analysis.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    success = crud_analysis.delete_analysis(db, analysis_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete analysis"
        )
    
    return {"message": "Analysis deleted successfully"}

@router.get("/repository/{repository_id}/latest", response_model=AnalysisDetailResponse)
async def get_latest_repository_analysis(
    repository_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get the most recent completed analysis for a repository"""
    # Verify repository belongs to user
    repository = crud_repository.get_repository_by_id(db, repository_id)
    
    if not repository or repository.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    analysis = crud_analysis.get_latest_analysis(db, repository_id)
    
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No completed analysis found for this repository"
        )
    
    # Get issues
    issues = crud_analysis.get_analysis_issues(db, analysis.id)
    
    # Build response
    response = AnalysisDetailResponse.from_orm(analysis)
    response.issues = [CodeIssueResponse.from_orm(issue) for issue in issues]
    
    return response

@router.get("/")
async def analysis_status():
    """Check analysis endpoint status"""
    return {"message": "Analysis endpoint working", "status": "ok"}
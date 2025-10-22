from sqlalchemy.orm import Session
from app.models.analysis import Analysis, CodeIssue
from typing import List, Optional

def get_analysis_by_id(db: Session, analysis_id: int) -> Optional[Analysis]:
    """Get analysis by ID"""
    return db.query(Analysis).filter(Analysis.id == analysis_id).first()

def get_repository_analyses(
    db: Session, 
    repository_id: int,
    skip: int = 0,
    limit: int = 20
) -> List[Analysis]:
    """Get all analyses for a repository"""
    return db.query(Analysis).filter(
        Analysis.repository_id == repository_id
    ).order_by(Analysis.created_at.desc()).offset(skip).limit(limit).all()

def get_user_analyses(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 50
) -> List[Analysis]:
    """Get all analyses for a user"""
    return db.query(Analysis).filter(
        Analysis.user_id == user_id
    ).order_by(Analysis.created_at.desc()).offset(skip).limit(limit).all()

def get_analysis_issues(
    db: Session,
    analysis_id: int,
    severity: Optional[str] = None
) -> List[CodeIssue]:
    """Get issues for an analysis, optionally filtered by severity"""
    query = db.query(CodeIssue).filter(CodeIssue.analysis_id == analysis_id)
    
    if severity:
        query = query.filter(CodeIssue.severity == severity)
    
    return query.order_by(
        CodeIssue.severity.desc(),
        CodeIssue.line_number
    ).all()

def delete_analysis(db: Session, analysis_id: int) -> bool:
    """Delete an analysis and its issues"""
    analysis = get_analysis_by_id(db, analysis_id)
    if not analysis:
        return False
    
    # Delete associated issues first
    db.query(CodeIssue).filter(CodeIssue.analysis_id == analysis_id).delete()
    
    # Delete analysis
    db.delete(analysis)
    db.commit()
    return True

def get_latest_analysis(db: Session, repository_id: int) -> Optional[Analysis]:
    """Get the most recent completed analysis for a repository"""
    return db.query(Analysis).filter(
        Analysis.repository_id == repository_id,
        Analysis.status == "completed"
    ).order_by(Analysis.created_at.desc()).first()
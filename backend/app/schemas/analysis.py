from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class CodeIssueResponse(BaseModel):
    id: int
    severity: str
    category: str
    file_path: str
    line_number: Optional[int]
    title: str
    description: str
    suggestion: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class AnalysisResponse(BaseModel):
    id: int
    repository_id: int
    user_id: int
    status: str
    overall_score: Optional[float]
    total_issues: int
    critical_issues: int
    high_issues: int
    medium_issues: int
    low_issues: int
    summary: Optional[str]
    files_analyzed: int
    lines_analyzed: int
    tokens_used: int
    estimated_cost: float
    error_message: Optional[str]
    created_at: datetime
    completed_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class AnalysisDetailResponse(AnalysisResponse):
    issues: List[CodeIssueResponse] = []
    analysis_data: Optional[Dict[str, Any]] = None

class AnalysisStartResponse(BaseModel):
    message: str
    analysis_id: int
    status: str
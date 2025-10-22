from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, JSON
from sqlalchemy.sql import func
from app.core.database import Base

class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    repository_id = Column(Integer, ForeignKey("repositories.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Analysis status: pending, processing, completed, failed
    status = Column(String, default="pending", index=True)
    
    # Results
    overall_score = Column(Float, nullable=True)  # 0-100 quality score
    total_issues = Column(Integer, default=0)
    critical_issues = Column(Integer, default=0)
    high_issues = Column(Integer, default=0)
    medium_issues = Column(Integer, default=0)
    low_issues = Column(Integer, default=0)
    
    # Summary and detailed results
    summary = Column(Text, nullable=True)
    files_analyzed = Column(Integer, default=0)
    lines_analyzed = Column(Integer, default=0)
    
    # Store full analysis data as JSON
    analysis_data = Column(JSON, nullable=True)
    
    # Cost tracking
    tokens_used = Column(Integer, default=0)
    estimated_cost = Column(Float, default=0.0)
    
    # Error tracking
    error_message = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    def __repr__(self):
        return f"<Analysis {self.id} - Repo {self.repository_id} - Status: {self.status}>"


class CodeIssue(Base):
    __tablename__ = "code_issues"

    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("analyses.id"), nullable=False, index=True)
    
    # Issue details
    severity = Column(String, nullable=False, index=True)  # critical, high, medium, low
    category = Column(String, nullable=False)  # security, performance, quality, style
    
    # Location
    file_path = Column(String, nullable=False)
    line_number = Column(Integer, nullable=True)
    code_snippet = Column(Text, nullable=True)
    
    # Description and fix
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    suggestion = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    def __repr__(self):
        return f"<CodeIssue {self.id} - {self.severity} - {self.title}>"
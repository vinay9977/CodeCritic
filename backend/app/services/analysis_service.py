from sqlalchemy.orm import Session
from datetime import datetime
from typing import Dict, Any
from app.services.github_code import GitHubCodeService
from app.services.openai_service import OpenAIService
from app.models.analysis import Analysis, CodeIssue
from app.crud import crud_user, crud_repository

class AnalysisService:
    """Orchestrates the code analysis process"""
    
    def __init__(self):
        self.github_service = GitHubCodeService()
        self.openai_service = OpenAIService()
    
    async def analyze_repository(
        self,
        db: Session,
        user_id: int,
        repository_id: int
    ) -> Analysis:
        """
        Main analysis workflow - cost-optimized
        
        Steps:
        1. Create analysis record
        2. Fetch repository code (smart sampling)
        3. Send to OpenAI for analysis
        4. Parse and store results
        5. Create issue records
        """
        # Create initial analysis record
        analysis = Analysis(
            repository_id=repository_id,
            user_id=user_id,
            status="processing"
        )
        db.add(analysis)
        db.commit()
        db.refresh(analysis)
        
        try:
            # Get repository and user info
            repository = crud_repository.get_repository_by_id(db, repository_id)
            user = crud_user.get_user_by_id(db, user_id)
            
            if not repository or not user:
                raise Exception("Repository or user not found")
            
            # Extract owner and repo name from full_name
            owner, repo_name = repository.full_name.split('/')
            
            # Fetch repository code (smart sampling)
            code_data = await self.github_service.fetch_repository_code(
                access_token=user.github_access_token,
                owner=owner,
                repo=repo_name,
                language=repository.language
            )
            
            analysis.files_analyzed = code_data["total_files"]
            analysis.lines_analyzed = code_data["total_lines"]
            
            # If no files found
            if not code_data["files"]:
                analysis.status = "completed"
                analysis.summary = "No analyzable code files found"
                analysis.overall_score = 0
                analysis.completed_at = datetime.utcnow()
                db.commit()
                return analysis
            
            # Analyze code with OpenAI
            analysis_result = self.openai_service.analyze_code(
                code_files=code_data["files"],
                language=code_data["language"]
            )
            
            # Update analysis with results
            analysis.status = "completed"
            analysis.overall_score = analysis_result.get("overall_score", 0)
            analysis.summary = analysis_result.get("summary", "")
            analysis.tokens_used = analysis_result.get("tokens_used", 0)
            analysis.estimated_cost = analysis_result.get("estimated_cost", 0)
            analysis.analysis_data = analysis_result
            analysis.completed_at = datetime.utcnow()
            
            # Count issues by severity
            issues = analysis_result.get("issues", [])
            analysis.total_issues = len(issues)
            
            severity_count = {"critical": 0, "high": 0, "medium": 0, "low": 0}
            for issue in issues:
                severity = issue.get("severity", "low").lower()
                if severity in severity_count:
                    severity_count[severity] += 1
            
            analysis.critical_issues = severity_count["critical"]
            analysis.high_issues = severity_count["high"]
            analysis.medium_issues = severity_count["medium"]
            analysis.low_issues = severity_count["low"]
            
            # Create issue records
            for issue in issues:
                code_issue = CodeIssue(
                    analysis_id=analysis.id,
                    severity=issue.get("severity", "low"),
                    category=issue.get("category", "quality"),
                    file_path=issue.get("file", "unknown"),
                    line_number=issue.get("line"),
                    title=issue.get("title", "Code issue"),
                    description=issue.get("description", ""),
                    suggestion=issue.get("suggestion", "")
                )
                db.add(code_issue)
            
            db.commit()
            db.refresh(analysis)
            return analysis
            
        except Exception as e:
            # Update analysis with error
            analysis.status = "failed"
            analysis.error_message = str(e)
            analysis.completed_at = datetime.utcnow()
            db.commit()
            raise e
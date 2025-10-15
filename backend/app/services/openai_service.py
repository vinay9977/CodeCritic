import os
import json
from typing import Dict, List, Any
from openai import OpenAI
from fastapi import HTTPException

class OpenAIService:
    """Cost-optimized OpenAI service for code analysis"""
    
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables")
        
        self.client = OpenAI(
            api_key=api_key,
            timeout=30.0,  # 30 second timeout
            max_retries=2   # Retry twice on failure
        )
        self.model = "gpt-3.5-turbo"  # 10x cheaper than GPT-4
        self.max_tokens_per_request = 3000  # Limit to control costs
        
        # Cost tracking (approximate)
        self.cost_per_1k_input_tokens = 0.0005  # $0.50 per 1M tokens
        self.cost_per_1k_output_tokens = 0.0015  # $1.50 per 1M tokens
        
        # Enable mock mode for testing (will use if OpenAI fails)
        self.mock_mode = os.getenv("USE_MOCK_ANALYSIS", "false").lower() == "true"
    
    def analyze_code(self, code_files: List[Dict[str, str]], language: str = "python") -> Dict[str, Any]:
        """
        Analyze multiple code files in a single API call (cost optimization)
        
        Args:
            code_files: List of dicts with 'path' and 'content'
            language: Programming language
            
        Returns:
            Analysis results with issues and score
        """
        # If mock mode enabled, return mock data
        if self.mock_mode:
            return self._generate_mock_analysis(code_files, language)
        
        try:
            # Prepare consolidated code for analysis
            code_context = self._prepare_code_context(code_files, language)
            
            # Create optimized prompt
            prompt = self._create_analysis_prompt(code_context, language)
            
            # Call OpenAI API
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert code reviewer. Analyze code and return structured JSON feedback focusing on critical issues only."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.3,  # Lower temperature for consistent results
                max_tokens=1500,  # Limit output tokens to reduce cost
                response_format={"type": "json_object"}  # Ensure JSON response
            )
            
            # Extract and parse response
            result = response.choices[0].message.content
            analysis_data = json.loads(result)
            
            # Calculate cost
            input_tokens = response.usage.prompt_tokens
            output_tokens = response.usage.completion_tokens
            estimated_cost = (
                (input_tokens / 1000) * self.cost_per_1k_input_tokens +
                (output_tokens / 1000) * self.cost_per_1k_output_tokens
            )
            
            # Add metadata
            analysis_data["tokens_used"] = response.usage.total_tokens
            analysis_data["estimated_cost"] = round(estimated_cost, 6)
            analysis_data["files_analyzed"] = len(code_files)
            
            return analysis_data
            
        except json.JSONDecodeError as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to parse OpenAI response: {str(e)}"
            )
        except Exception as e:
            error_msg = str(e)
            # If connection error, try mock mode as fallback
            if "connection" in error_msg.lower() or "timeout" in error_msg.lower():
                print(f"⚠️  OpenAI connection failed, using mock analysis: {error_msg}")
                return self._generate_mock_analysis(code_files, language)
            
            raise HTTPException(
                status_code=500,
                detail=f"OpenAI API error: {str(e)}"
            )
    
    def _prepare_code_context(self, code_files: List[Dict[str, str]], language: str) -> str:
        """Prepare code files for analysis, respecting token limits"""
        context_parts = []
        total_chars = 0
        max_chars = 10000  # Approximately 2500 tokens
        
        for file in code_files:
            file_content = f"### File: {file['path']}\n```{language}\n{file['content']}\n```\n"
            
            if total_chars + len(file_content) > max_chars:
                # Truncate if too long
                remaining = max_chars - total_chars
                if remaining > 200:  # Only add if meaningful content fits
                    file_content = file_content[:remaining] + "\n... (truncated)"
                    context_parts.append(file_content)
                break
            
            context_parts.append(file_content)
            total_chars += len(file_content)
        
        return "\n".join(context_parts)
    
    def _create_analysis_prompt(self, code_context: str, language: str) -> str:
        """Create optimized prompt focusing on critical issues only"""
        return f"""Analyze the following {language} code and identify ONLY critical and high-priority issues.

{code_context}

Focus on:
1. Security vulnerabilities (SQL injection, XSS, etc.)
2. Critical bugs and logic errors
3. Major performance issues
4. Serious code quality problems

Provide response in this EXACT JSON format:
{{
  "overall_score": 75,
  "summary": "Brief 1-sentence overview",
  "issues": [
    {{
      "severity": "critical",
      "category": "security",
      "file": "filename.py",
      "line": 42,
      "title": "SQL Injection vulnerability",
      "description": "Brief description",
      "suggestion": "How to fix"
    }}
  ],
  "total_lines": 150
}}

Keep response concise. Score from 0-100 (100 = perfect). List max 10 most important issues."""
    
    def quick_score_code(self, code_snippet: str, language: str = "python") -> int:
        """
        Ultra-fast quality score (minimal tokens for quick checks)
        Used for initial screening
        """
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "user",
                        "content": f"Rate this {language} code quality from 0-100. Respond with ONLY a number:\n\n{code_snippet[:500]}"
                    }
                ],
                temperature=0,
                max_tokens=10
            )
            
            score = int(response.choices[0].message.content.strip())
            return max(0, min(100, score))  # Clamp between 0-100
            
        except:
            return 50  # Default middle score if quick check fails
    
    def _generate_mock_analysis(self, code_files: List[Dict[str, str]], language: str) -> Dict[str, Any]:
        """
        Generate mock analysis for testing when OpenAI is unavailable
        """
        total_lines = sum(f.get('lines', len(f['content'].split('\n'))) for f in code_files)
        
        # Generate sample issues based on file content
        issues = [
            {
                "severity": "high",
                "category": "quality",
                "file": code_files[0]['path'] if code_files else "main.py",
                "line": 42,
                "title": "Code complexity issue",
                "description": "Function has high cyclomatic complexity",
                "suggestion": "Consider breaking down into smaller functions"
            },
            {
                "severity": "medium",
                "category": "performance",
                "file": code_files[0]['path'] if code_files else "main.py",
                "line": 15,
                "title": "Inefficient loop",
                "description": "Nested loop could be optimized",
                "suggestion": "Use dictionary lookup instead of nested iteration"
            }
        ]
        
        return {
            "overall_score": 75,
            "summary": f"Mock analysis of {len(code_files)} {language} files. OpenAI API unavailable.",
            "issues": issues[:min(len(code_files), 3)],  # Limit based on files
            "total_lines": total_lines,
            "tokens_used": 100,
            "estimated_cost": 0.0001,
            "files_analyzed": len(code_files)
        }
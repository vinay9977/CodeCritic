import httpx
import base64
from typing import List, Dict, Any
from fastapi import HTTPException

class GitHubCodeService:
    """Smart code fetcher with file filtering for cost optimization"""
    
    # File extensions to analyze (prioritized)
    PRIORITY_EXTENSIONS = {
        'python': ['.py'],
        'javascript': ['.js', '.jsx', '.ts', '.tsx'],
        'java': ['.java'],
        'c': ['.c', '.h'],
        'cpp': ['.cpp', '.hpp', '.cc'],
        'go': ['.go'],
        'rust': ['.rs'],
        'php': ['.php'],
        'ruby': ['.rb'],
        'swift': ['.swift'],
        'kotlin': ['.kt']
    }
    
    # Files/directories to skip
    SKIP_PATTERNS = [
        'node_modules', 'venv', 'env', '__pycache__', '.git', 
        'dist', 'build', 'target', 'vendor', 'public',
        'test', 'tests', '__tests__', 'spec', 'docs',
        '.next', '.nuxt', 'coverage', '.pytest_cache'
    ]
    
    def __init__(self):
        self.base_url = "https://api.github.com"
        self.max_files = 10  # Limit files to analyze (cost control)
        self.max_file_size = 5000  # Max lines per file
    
    async def fetch_repository_code(
        self, 
        access_token: str, 
        owner: str, 
        repo: str,
        language: str = None
    ) -> Dict[str, Any]:
        """
        Fetch most important code files from repository
        
        Returns:
            Dict with files and metadata
        """
        headers = {
            "Authorization": f"token {access_token}",
            "Accept": "application/vnd.github.v3+json"
        }
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                # Get repository contents
                repo_url = f"{self.base_url}/repos/{owner}/{repo}/contents"
                response = await client.get(repo_url, headers=headers)
                
                if response.status_code != 200:
                    raise HTTPException(
                        status_code=400,
                        detail="Failed to fetch repository contents"
                    )
                
                contents = response.json()
                
                # Find and prioritize code files
                code_files = await self._get_priority_files(
                    client, headers, owner, repo, contents, language
                )
                
                return {
                    "files": code_files,
                    "language": language or self._detect_primary_language(code_files),
                    "total_files": len(code_files),
                    "total_lines": sum(f["lines"] for f in code_files)
                }
                
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error fetching code: {str(e)}"
            )
    
    async def _get_priority_files(
        self,
        client: httpx.AsyncClient,
        headers: dict,
        owner: str,
        repo: str,
        contents: List[dict],
        language: str = None
    ) -> List[Dict[str, Any]]:
        """Get most important files based on smart filtering"""
        priority_files = []
        
        for item in contents:
            # Skip directories and files we don't want
            if item["type"] == "dir":
                if not any(skip in item["name"] for skip in self.SKIP_PATTERNS):
                    # Recursively check directory (limited depth)
                    dir_contents = await self._fetch_directory_contents(
                        client, headers, item["url"]
                    )
                    if dir_contents:
                        sub_files = await self._get_priority_files(
                            client, headers, owner, repo, dir_contents, language
                        )
                        priority_files.extend(sub_files)
                continue
            
            # Check if file is worth analyzing
            if not self._should_analyze_file(item["name"], language):
                continue
            
            # Fetch file content
            try:
                file_content = await self._fetch_file_content(
                    client, headers, item["url"]
                )
                
                if file_content:
                    lines = file_content.count('\n') + 1
                    
                    # Skip very large files
                    if lines > self.max_file_size:
                        continue
                    
                    priority_files.append({
                        "path": item["path"],
                        "content": file_content,
                        "lines": lines,
                        "size": item["size"]
                    })
                    
                    # Stop if we have enough files
                    if len(priority_files) >= self.max_files:
                        break
                        
            except Exception as e:
                print(f"Error fetching {item['name']}: {e}")
                continue
        
        # Sort by importance (main files first, then by size)
        priority_files.sort(
            key=lambda x: (
                'main' not in x['path'].lower() and 'index' not in x['path'].lower(),
                -x['lines']
            )
        )
        
        return priority_files[:self.max_files]
    
    async def _fetch_directory_contents(
        self,
        client: httpx.AsyncClient,
        headers: dict,
        url: str
    ) -> List[dict]:
        """Fetch directory contents"""
        try:
            response = await client.get(url, headers=headers)
            if response.status_code == 200:
                return response.json()
        except:
            pass
        return []
    
    async def _fetch_file_content(
        self,
        client: httpx.AsyncClient,
        headers: dict,
        url: str
    ) -> str:
        """Fetch and decode file content"""
        try:
            response = await client.get(url, headers=headers)
            if response.status_code == 200:
                data = response.json()
                if data.get("encoding") == "base64":
                    content = base64.b64decode(data["content"]).decode('utf-8')
                    return content
        except:
            pass
        return None
    
    def _should_analyze_file(self, filename: str, language: str = None) -> bool:
        """Determine if file should be analyzed"""
        # Skip non-code files
        skip_extensions = [
            '.md', '.txt', '.json', '.xml', '.yml', '.yaml',
            '.lock', '.svg', '.png', '.jpg', '.gif', '.ico',
            '.css', '.scss', '.sass', '.html'
        ]
        
        if any(filename.endswith(ext) for ext in skip_extensions):
            return False
        
        # If language specified, check for matching extension
        if language:
            extensions = self.PRIORITY_EXTENSIONS.get(language.lower(), [])
            return any(filename.endswith(ext) for ext in extensions)
        
        # Accept any code file
        all_extensions = [ext for exts in self.PRIORITY_EXTENSIONS.values() for ext in exts]
        return any(filename.endswith(ext) for ext in all_extensions)
    
    def _detect_primary_language(self, files: List[Dict[str, Any]]) -> str:
        """Detect primary language from file extensions"""
        extension_count = {}
        
        for file in files:
            for lang, extensions in self.PRIORITY_EXTENSIONS.items():
                if any(file["path"].endswith(ext) for ext in extensions):
                    extension_count[lang] = extension_count.get(lang, 0) + 1
        
        if extension_count:
            return max(extension_count, key=extension_count.get)
        
        return "unknown"
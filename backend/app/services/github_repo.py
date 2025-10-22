import httpx
from typing import List, Dict, Any
from fastapi import HTTPException, status

class GitHubRepoService:
    """Service for interacting with GitHub Repository API"""
    
    def __init__(self):
        self.base_url = "https://api.github.com"
    
    async def fetch_user_repositories(self, access_token: str) -> List[Dict[str, Any]]:
        """Fetch all repositories for the authenticated user"""
        headers = {
            "Authorization": f"token {access_token}",
            "Accept": "application/vnd.github.v3+json"
        }
        
        all_repos = []
        page = 1
        per_page = 100  # Maximum allowed by GitHub API
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            while True:
                try:
                    response = await client.get(
                        f"{self.base_url}/user/repos",
                        headers=headers,
                        params={
                            "per_page": per_page,
                            "page": page,
                            "sort": "updated",
                            "affiliation": "owner,collaborator,organization_member"
                        }
                    )
                    
                    if response.status_code != 200:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Failed to fetch repositories from GitHub: {response.text}"
                        )
                    
                    repos = response.json()
                    
                    if not repos:
                        break
                    
                    all_repos.extend(repos)
                    
                    # If we got fewer repos than per_page, we've reached the end
                    if len(repos) < per_page:
                        break
                    
                    page += 1
                    
                except httpx.TimeoutException:
                    raise HTTPException(
                        status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                        detail="GitHub API request timed out"
                    )
                except Exception as e:
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail=f"Error fetching repositories: {str(e)}"
                    )
        
        return all_repos
    
    def parse_repository_data(self, repo_data: Dict[str, Any]) -> Dict[str, Any]:
        """Parse GitHub repository data into our format"""
        return {
            "github_id": repo_data["id"],
            "name": repo_data["name"],
            "full_name": repo_data["full_name"],
            "description": repo_data.get("description"),
            "url": repo_data["url"],
            "html_url": repo_data["html_url"],
            "default_branch": repo_data.get("default_branch", "main"),
            "language": repo_data.get("language"),
            "is_private": repo_data["private"],
            "is_fork": repo_data["fork"],
            "stars_count": repo_data["stargazers_count"],
            "forks_count": repo_data["forks_count"],
            "open_issues_count": repo_data["open_issues_count"],
            "size": repo_data["size"],
        }
import httpx
import os
from typing import Dict, Any
from fastapi import HTTPException, status

class GitHubAuthService:
    def __init__(self):
        self.client_id = os.getenv("GITHUB_CLIENT_ID")
        self.client_secret = os.getenv("GITHUB_CLIENT_SECRET")
        self.redirect_uri = os.getenv("GITHUB_REDIRECT_URI")
        
        if not all([self.client_id, self.client_secret, self.redirect_uri]):
            raise ValueError("GitHub OAuth credentials not properly configured")

    def get_authorization_url(self, state: str = None) -> str:
        """Generate GitHub OAuth authorization URL"""
        base_url = "https://github.com/login/oauth/authorize"
        params = {
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "scope": "user:email repo",
            "state": state or "random_state_string"
        }
        
        query_string = "&".join([f"{k}={v}" for k, v in params.items()])
        return f"{base_url}?{query_string}"

    async def exchange_code_for_token(self, code: str) -> str:
        """Exchange authorization code for access token"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://github.com/login/oauth/access_token",
                headers={"Accept": "application/json"},
                data={
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "code": code,
                    "redirect_uri": self.redirect_uri
                }
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to exchange code for token"
                )
            
            data = response.json()
            if "access_token" not in data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No access token received from GitHub"
                )
            
            return data["access_token"]

    async def get_user_info(self, access_token: str) -> Dict[str, Any]:
        """Get user information from GitHub API"""
        headers = {
            "Authorization": f"token {access_token}",
            "Accept": "application/vnd.github.v3+json"
        }
        
        async with httpx.AsyncClient() as client:
            # Get user info
            user_response = await client.get(
                "https://api.github.com/user",
                headers=headers
            )
            
            if user_response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to fetch user info from GitHub"
                )
            
            user_data = user_response.json()
            
            # Get user email
            email_response = await client.get(
                "https://api.github.com/user/emails",
                headers=headers
            )
            
            primary_email = None
            if email_response.status_code == 200:
                emails = email_response.json()
                for email in emails:
                    if email.get("primary", False):
                        primary_email = email["email"]
                        break
                if not primary_email and emails:
                    primary_email = emails[0]["email"]
            
            return {
                "id": user_data["id"],
                "username": user_data["login"],
                "name": user_data.get("name"),
                "email": primary_email,
                "avatar_url": user_data.get("avatar_url"),
                "github_url": user_data.get("html_url")
            }
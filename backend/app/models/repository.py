from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Repository(Base):
    __tablename__ = "repositories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    github_id = Column(Integer, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    url = Column(String, nullable=False)
    html_url = Column(String, nullable=False)
    default_branch = Column(String, default="main")
    language = Column(String, nullable=True)
    is_private = Column(Boolean, default=False)
    is_fork = Column(Boolean, default=False)
    stars_count = Column(Integer, default=0)
    forks_count = Column(Integer, default=0)
    open_issues_count = Column(Integer, default=0)
    size = Column(Integer, default=0)  # Repository size in KB
    last_synced_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship with User
    # user = relationship("User", back_populates="repositories")

    def __repr__(self):
        return f"<Repository {self.full_name}>"
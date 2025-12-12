"""Course schemas"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID


class CourseBase(BaseModel):
    """Base course schema"""
    title: str = Field(..., min_length=3, max_length=200)
    description: Optional[str] = None
    difficulty_level: Optional[str] = Field(None, pattern="^(beginner|intermediate|advanced)$")
    estimated_hours: Optional[int] = Field(None, ge=1)
    token_gated: bool = False
    required_token_amount: Optional[str] = None


class CourseCreate(CourseBase):
    """Course creation schema"""
    slug: str = Field(..., min_length=3, max_length=100, pattern="^[a-z0-9-]+$")


class CourseUpdate(BaseModel):
    """Course update schema"""
    title: Optional[str] = Field(None, min_length=3, max_length=200)
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    difficulty_level: Optional[str] = Field(None, pattern="^(beginner|intermediate|advanced)$")
    estimated_hours: Optional[int] = Field(None, ge=1)
    published: Optional[bool] = None
    token_gated: Optional[bool] = None
    required_token_amount: Optional[str] = None


class CourseResponse(BaseModel):
    """Course response schema"""
    id: UUID
    slug: str
    title: str
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    difficulty_level: Optional[str] = None
    estimated_hours: Optional[int] = None
    xp_total: int
    author_id: UUID
    published: bool
    token_gated: bool
    required_token_amount: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CourseEnrollResponse(BaseModel):
    """Course enrollment response"""
    id: UUID
    course_id: UUID
    user_id: UUID
    completion_percentage: float
    started_at: datetime
    completed_at: Optional[datetime] = None
    last_accessed_at: datetime

    class Config:
        from_attributes = True


class CourseWithProgress(CourseResponse):
    """Course with user progress"""
    enrollment: Optional[CourseEnrollResponse] = None

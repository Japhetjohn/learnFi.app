"""User schemas"""

from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime
from uuid import UUID


class UserBase(BaseModel):
    """Base user schema"""
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    bio: Optional[str] = Field(None, max_length=500)


class UserCreate(UserBase):
    """User creation schema"""
    wallet_address: str = Field(..., min_length=42, max_length=42)


class UserUpdate(BaseModel):
    """User update schema"""
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    bio: Optional[str] = Field(None, max_length=500)
    profile_picture_url: Optional[str] = None


class UserResponse(BaseModel):
    """User response schema"""
    id: UUID
    wallet_address: str
    username: Optional[str] = None
    email: Optional[str] = None
    profile_picture_url: Optional[str] = None
    bio: Optional[str] = None
    xp_total: int
    role: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserPublic(BaseModel):
    """Public user info (for leaderboard, etc.)"""
    id: UUID
    wallet_address: str
    username: Optional[str] = None
    profile_picture_url: Optional[str] = None
    xp_total: int
    role: str

    class Config:
        from_attributes = True

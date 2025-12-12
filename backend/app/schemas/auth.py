"""Authentication schemas"""

from pydantic import BaseModel, Field
from typing import Optional


class NonceRequest(BaseModel):
    """Request schema for nonce generation"""
    address: str = Field(..., description="Wallet address", min_length=42, max_length=42)


class NonceResponse(BaseModel):
    """Response schema for nonce generation"""
    nonce: str = Field(..., description="Random nonce for signing")
    message: str = Field(..., description="Full SIWE message to sign")
    expires_at: str = Field(..., description="Nonce expiration timestamp")


class VerifyRequest(BaseModel):
    """Request schema for signature verification"""
    address: str = Field(..., description="Wallet address", min_length=42, max_length=42)
    signature: str = Field(..., description="Signed message signature", min_length=132, max_length=132)
    message: str = Field(..., description="SIWE message that was signed")


class TokenResponse(BaseModel):
    """Response schema for token issuance"""
    access_token: str = Field(..., description="JWT access token")
    refresh_token: str = Field(..., description="JWT refresh token")
    token_type: str = Field(default="bearer", description="Token type")
    user: "UserResponse"


class RefreshRequest(BaseModel):
    """Request schema for token refresh"""
    refresh_token: str = Field(..., description="Refresh token")


# Import UserResponse to avoid circular imports
from app.schemas.user import UserResponse

TokenResponse.model_rebuild()

"""Authentication endpoints - SIWE wallet authentication"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import redis.asyncio as aioredis

from app.core.database import get_db
from app.api.deps import get_redis, get_current_active_user
from app.services.auth_service import AuthService
from app.schemas.auth import (
    NonceRequest,
    NonceResponse,
    VerifyRequest,
    TokenResponse,
    RefreshRequest,
)
from app.models.user import User
from app.core.security import verify_token, create_access_token

router = APIRouter()


@router.post("/nonce", response_model=NonceResponse)
async def request_nonce(
    request: NonceRequest,
    db: AsyncSession = Depends(get_db),
    redis_client: aioredis.Redis = Depends(get_redis),
):
    """
    Generate a nonce for SIWE authentication.

    The frontend should:
    1. Call this endpoint with the user's wallet address
    2. Receive the nonce and SIWE message
    3. Prompt the user to sign the message with their wallet
    4. Call /auth/verify with the signature
    """
    auth_service = AuthService(db, redis_client)

    try:
        nonce_response = await auth_service.generate_nonce(request.address)
        return nonce_response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate nonce: {str(e)}"
        )


@router.post("/verify", response_model=TokenResponse)
async def verify_signature(
    request: VerifyRequest,
    db: AsyncSession = Depends(get_db),
    redis_client: aioredis.Redis = Depends(get_redis),
):
    """
    Verify SIWE signature and issue JWT tokens.

    The signature verification process:
    1. Validate the SIWE message format
    2. Verify the cryptographic signature
    3. Check nonce validity (prevent replay attacks)
    4. Get or create user account
    5. Issue access and refresh tokens
    """
    auth_service = AuthService(db, redis_client)

    # Verify signature
    is_valid, error_message = await auth_service.verify_signature(
        address=request.address,
        signature=request.signature,
        message=request.message,
    )

    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=error_message or "Invalid signature",
        )

    # Get or create user
    user = await auth_service.get_or_create_user(request.address)

    # Create tokens
    token_response = await auth_service.create_tokens(user)

    return token_response


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    request: RefreshRequest,
    db: AsyncSession = Depends(get_db),
    redis_client: aioredis.Redis = Depends(get_redis),
):
    """
    Refresh access token using refresh token.

    This endpoint allows the frontend to obtain a new access token
    without requiring the user to sign a message again.
    """
    # Verify refresh token
    payload = verify_token(request.refresh_token)

    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    # Check if refresh token is revoked (if using Redis)
    if redis_client:
        refresh_key = f"refresh_token:{user_id}"
        stored_token = await redis_client.get(refresh_key)

        if not stored_token or stored_token != request.refresh_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token revoked or invalid",
            )

    # Get user
    auth_service = AuthService(db, redis_client)
    from sqlalchemy import select

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Create new tokens
    token_response = await auth_service.create_tokens(user)

    return token_response


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    current_user: User = Depends(get_current_active_user),
    redis_client: aioredis.Redis = Depends(get_redis),
):
    """
    Logout user and revoke refresh token.

    This invalidates the user's refresh token, requiring them
    to sign in again to get new tokens.
    """
    auth_service = AuthService(None, redis_client)
    await auth_service.revoke_token(str(current_user.id))

    return None


@router.get("/me", response_model=TokenResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
    redis_client: aioredis.Redis = Depends(get_redis),
):
    """
    Get current authenticated user information.

    This endpoint is useful for:
    - Checking if the access token is still valid
    - Getting updated user information
    - Frontend state initialization
    """
    auth_service = AuthService(db, redis_client)

    # Return fresh tokens along with user info
    token_response = await auth_service.create_tokens(current_user)

    return token_response

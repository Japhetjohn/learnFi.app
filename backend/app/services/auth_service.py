"""Authentication service - SIWE verification and JWT issuance"""

import secrets
from datetime import datetime, timedelta
from typing import Optional, Tuple
from siwe import SiweMessage
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import redis.asyncio as aioredis

from app.core.config import settings
from app.core.security import create_access_token, create_refresh_token
from app.models.user import User
from app.schemas.auth import NonceResponse, TokenResponse
from app.schemas.user import UserResponse


class AuthService:
    """Authentication service for SIWE and JWT"""

    def __init__(self, db: AsyncSession, redis_client: Optional[aioredis.Redis] = None):
        self.db = db
        self.redis = redis_client

    async def generate_nonce(self, address: str) -> NonceResponse:
        """Generate a nonce for SIWE authentication"""
        # Generate random nonce
        nonce = secrets.token_hex(16)

        # Create SIWE message
        expiration_time = datetime.utcnow() + timedelta(minutes=5)

        message = self._create_siwe_message(
            address=address,
            nonce=nonce,
            expiration_time=expiration_time
        )

        # Store nonce in Redis with 5-minute expiration
        if self.redis:
            nonce_key = f"nonce:{address}"
            await self.redis.setex(nonce_key, 300, nonce)  # 5 minutes

        return NonceResponse(
            nonce=nonce,
            message=message,
            expires_at=expiration_time.isoformat()
        )

    def _create_siwe_message(
        self,
        address: str,
        nonce: str,
        expiration_time: datetime
    ) -> str:
        """Create SIWE message string"""
        message = f"""{settings.APP_NAME} wants you to sign in with your Ethereum account:
{address}

Sign in to {settings.APP_NAME} to access your learning dashboard.

URI: https://app.learnfi.com
Version: 1
Chain ID: 8453
Nonce: {nonce}
Issued At: {datetime.utcnow().isoformat()}
Expiration Time: {expiration_time.isoformat()}"""

        return message

    async def verify_signature(
        self,
        address: str,
        signature: str,
        message: str
    ) -> Tuple[bool, Optional[str]]:
        """Verify SIWE signature"""
        try:
            # Parse SIWE message
            siwe_message = SiweMessage.from_message(message=message)

            # Verify the signature
            siwe_message.verify(signature=signature)

            # Check if nonce is valid (if using Redis)
            if self.redis:
                nonce_key = f"nonce:{address}"
                stored_nonce = await self.redis.get(nonce_key)

                if not stored_nonce:
                    return False, "Nonce expired or invalid"

                if stored_nonce.decode() != siwe_message.nonce:
                    return False, "Nonce mismatch"

                # Delete nonce after successful verification (prevent replay)
                await self.redis.delete(nonce_key)

            # Verify address matches
            if siwe_message.address.lower() != address.lower():
                return False, "Address mismatch"

            return True, None

        except Exception as e:
            return False, f"Signature verification failed: {str(e)}"

    async def get_or_create_user(self, wallet_address: str) -> User:
        """Get existing user or create new one"""
        # Normalize address to lowercase
        wallet_address = wallet_address.lower()

        # Try to find existing user
        result = await self.db.execute(
            select(User).where(User.wallet_address == wallet_address)
        )
        user = result.scalar_one_or_none()

        if user:
            return user

        # Create new user
        new_user = User(wallet_address=wallet_address)
        self.db.add(new_user)
        await self.db.commit()
        await self.db.refresh(new_user)

        return new_user

    async def create_tokens(self, user: User) -> TokenResponse:
        """Create access and refresh tokens for user"""
        # Create token data
        token_data = {
            "sub": str(user.id),
            "wallet_address": user.wallet_address,
            "role": user.role.value,
        }

        # Generate tokens
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)

        # Store refresh token in Redis (optional - for revocation)
        if self.redis:
            refresh_key = f"refresh_token:{user.id}"
            await self.redis.setex(
                refresh_key,
                settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
                refresh_token
            )

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            user=UserResponse.from_orm(user)
        )

    async def revoke_token(self, user_id: str) -> bool:
        """Revoke user's refresh token"""
        if self.redis:
            refresh_key = f"refresh_token:{user_id}"
            await self.redis.delete(refresh_key)
            return True
        return False

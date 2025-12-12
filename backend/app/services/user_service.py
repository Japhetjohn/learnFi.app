"""User service - user management operations"""

from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from uuid import UUID

from app.models.user import User
from app.schemas.user import UserUpdate


class UserService:
    """User management service"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_by_id(self, user_id: UUID) -> Optional[User]:
        """Get user by ID"""
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def get_user_by_wallet(self, wallet_address: str) -> Optional[User]:
        """Get user by wallet address"""
        wallet_address = wallet_address.lower()
        result = await self.db.execute(
            select(User).where(User.wallet_address == wallet_address)
        )
        return result.scalar_one_or_none()

    async def update_user(self, user_id: UUID, user_update: UserUpdate) -> User:
        """Update user profile"""
        user = await self.get_user_by_id(user_id)
        if not user:
            raise ValueError("User not found")

        # Update fields
        update_data = user_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)

        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def get_user_xp_history(self, user_id: UUID, limit: int = 50):
        """Get user's XP history"""
        from app.models.xp import XPLedger

        result = await self.db.execute(
            select(XPLedger)
            .where(XPLedger.user_id == user_id)
            .order_by(desc(XPLedger.created_at))
            .limit(limit)
        )
        return result.scalars().all()

    async def get_user_badges(self, user_id: UUID):
        """Get user's earned badges"""
        from app.models.badge import UserBadge

        result = await self.db.execute(
            select(UserBadge).where(UserBadge.user_id == user_id)
        )
        return result.scalars().all()

    async def get_leaderboard(
        self, limit: int = 100, offset: int = 0, time_period: str = "all_time"
    ):
        """Get leaderboard rankings"""
        # All-time leaderboard
        query = select(User).order_by(desc(User.xp_total)).limit(limit).offset(offset)

        result = await self.db.execute(query)
        users = result.scalars().all()

        # Add rankings
        leaderboard = []
        for idx, user in enumerate(users, start=offset + 1):
            leaderboard.append({
                "rank": idx,
                "user": user,
                "xp_total": user.xp_total,
            })

        return leaderboard

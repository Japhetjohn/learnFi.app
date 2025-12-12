"""XP Service - manages XP awarding and tracking"""

from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from datetime import datetime

from app.models.xp import XPLedger
from app.models.user import User


class XPService:
    """XP management service"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def award_xp(
        self,
        user_id: UUID,
        xp_amount: int,
        source_type: str,
        source_id: UUID = None,
        reason: str = None,
    ) -> XPLedger:
        """
        Award XP to a user and create ledger entry.

        Args:
            user_id: User receiving XP
            xp_amount: Amount of XP to award
            source_type: Source of XP (task_completion, course_completion, etc.)
            source_id: ID of the source (task_id, course_id, etc.)
            reason: Optional reason for XP award

        Returns:
            XP ledger entry
        """
        # Get user and current XP
        from sqlalchemy import select
        result = await self.db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()

        if not user:
            raise ValueError("User not found")

        # Calculate new balance
        new_balance = user.xp_total + xp_amount

        # Create ledger entry
        ledger_entry = XPLedger(
            user_id=user_id,
            source_type=source_type,
            source_id=source_id,
            xp_change=xp_amount,
            balance_after=new_balance,
            reason=reason,
        )
        self.db.add(ledger_entry)

        # Update user's total XP
        user.xp_total = new_balance

        await self.db.commit()
        await self.db.refresh(ledger_entry)

        return ledger_entry

    async def deduct_xp(
        self,
        user_id: UUID,
        xp_amount: int,
        source_type: str,
        source_id: UUID = None,
        reason: str = None,
    ) -> XPLedger:
        """Deduct XP from a user (admin only)"""
        return await self.award_xp(
            user_id=user_id,
            xp_amount=-xp_amount,  # Negative amount
            source_type=source_type,
            source_id=source_id,
            reason=reason,
        )

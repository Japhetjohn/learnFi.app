"""Staking models"""

import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, Numeric, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
import enum


class PoolType(str, enum.Enum):
    """Staking pool type"""

    TOKEN = "token"
    NFT = "nft"


class StakingStatus(str, enum.Enum):
    """Staking status"""

    ACTIVE = "active"
    UNSTAKED = "unstaked"


class StakingPosition(Base):
    """Staking Position - active staking positions"""

    __tablename__ = "staking_positions"

    # Primary Key
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    # Foreign Keys
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )

    # Staking Details
    pool_type: Mapped[PoolType] = mapped_column(Enum(PoolType), nullable=False)
    asset_address: Mapped[str] = mapped_column(
        String(42), nullable=False
    )  # Contract address of token/NFT
    amount: Mapped[int] = mapped_column(Numeric(78, 0), nullable=False)  # Wei amount or token ID

    # Rewards
    rewards_earned: Mapped[int] = mapped_column(Numeric(78, 0), default=0, nullable=False)

    # Status
    status: Mapped[StakingStatus] = mapped_column(
        Enum(StakingStatus), default=StakingStatus.ACTIVE, nullable=False
    )

    # Timestamps
    staked_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )
    unstaked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="staking_positions")

    def __repr__(self) -> str:
        return f"<StakingPosition {self.pool_type.value} - {self.status.value}>"

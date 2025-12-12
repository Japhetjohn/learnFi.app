"""Badge models"""

import uuid
from datetime import datetime
from sqlalchemy import String, Text, Boolean, DateTime, ForeignKey, Numeric, Enum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
import enum


class BadgeTier(str, enum.Enum):
    """Badge tier enum"""

    BRONZE = "bronze"
    SILVER = "silver"
    GOLD = "gold"
    LEGENDARY = "legendary"


class CriteriaType(str, enum.Enum):
    """Badge criteria type"""

    COURSE_COMPLETION = "course_completion"
    XP_MILESTONE = "xp_milestone"
    SPECIAL_EVENT = "special_event"


class Badge(Base):
    """Badge model - badge definitions"""

    __tablename__ = "badges"

    # Primary Key
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    # Basic Info
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_url: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Badge Details
    tier: Mapped[BadgeTier] = mapped_column(Enum(BadgeTier), nullable=False)

    # Criteria
    criteria_type: Mapped[CriteriaType] = mapped_column(Enum(CriteriaType), nullable=False)
    criteria_config: Mapped[dict] = mapped_column(
        JSONB, nullable=False
    )  # e.g., {"course_id": "...", "min_xp": 1000}

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )

    # Relationships
    user_badges: Mapped[list["UserBadge"]] = relationship(
        "UserBadge", back_populates="badge", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Badge {self.name} - {self.tier.value}>"


class UserBadge(Base):
    """UserBadge model - badges earned by users"""

    __tablename__ = "user_badges"

    # Primary Key
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    # Foreign Keys
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    badge_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("badges.id"), nullable=False
    )

    # NFT Minting
    nft_minted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    nft_token_id: Mapped[int | None] = mapped_column(Numeric(78, 0), nullable=True)
    nft_tx_hash: Mapped[str | None] = mapped_column(String(66), nullable=True)
    ipfs_metadata_uri: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Timestamps
    earned_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="badges")
    badge: Mapped["Badge"] = relationship("Badge", back_populates="user_badges")

    def __repr__(self) -> str:
        return f"<UserBadge {self.user_id} - {self.badge_id}>"

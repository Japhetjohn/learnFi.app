"""XP Ledger model"""

import uuid
from datetime import datetime
from sqlalchemy import String, Integer, BigInteger, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class XPLedger(Base):
    """XP Ledger - immutable append-only log of XP changes"""

    __tablename__ = "xp_ledger"

    # Primary Key (auto-incrementing)
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)

    # Foreign Keys
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )

    # XP Change Details
    source_type: Mapped[str] = mapped_column(
        String(30), nullable=False
    )  # task_completion, course_completion, admin_grant, bounty
    source_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
    xp_change: Mapped[int] = mapped_column(Integer, nullable=False)  # Can be positive or negative
    balance_after: Mapped[int] = mapped_column(Integer, nullable=False)
    reason: Mapped[str | None] = mapped_column(String(200), nullable=True)

    # Timestamp (immutable)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="xp_entries")

    def __repr__(self) -> str:
        return f"<XPLedger {self.user_id} {self.xp_change:+d}>"

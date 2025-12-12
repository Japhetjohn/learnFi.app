"""User model"""

import uuid
from datetime import datetime
from sqlalchemy import String, Integer, Text, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
import enum


class UserRole(str, enum.Enum):
    """User role enum"""

    LEARNER = "learner"
    INSTRUCTOR = "instructor"
    ADMIN = "admin"
    PARTNER = "partner"


class User(Base):
    """User model - registered users with wallet authentication"""

    __tablename__ = "users"

    # Primary Key
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    # Wallet & Authentication
    wallet_address: Mapped[str] = mapped_column(
        String(42), unique=True, nullable=False, index=True
    )

    # Profile
    username: Mapped[str | None] = mapped_column(String(50), unique=True, nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)
    profile_picture_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Gamification
    xp_total: Mapped[int] = mapped_column(Integer, default=0, index=True)

    # Role & Permissions
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole), default=UserRole.LEARNER, nullable=False
    )

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationships
    xp_entries: Mapped[list["XPLedger"]] = relationship(
        "XPLedger", back_populates="user", cascade="all, delete-orphan"
    )
    badges: Mapped[list["UserBadge"]] = relationship(
        "UserBadge", back_populates="user", cascade="all, delete-orphan"
    )
    submissions: Mapped[list["Submission"]] = relationship(
        "Submission", back_populates="user", foreign_keys="Submission.user_id"
    )
    enrollments: Mapped[list["CourseEnrollment"]] = relationship(
        "CourseEnrollment", back_populates="user", cascade="all, delete-orphan"
    )
    authored_courses: Mapped[list["Course"]] = relationship(
        "Course", back_populates="author", foreign_keys="Course.author_id"
    )
    staking_positions: Mapped[list["StakingPosition"]] = relationship(
        "StakingPosition", back_populates="user", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<User {self.username or self.wallet_address[:8]}...>"

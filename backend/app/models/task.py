"""Task and Submission models"""

import uuid
from datetime import datetime
from sqlalchemy import String, Integer, Text, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
import enum


class TaskType(str, enum.Enum):
    """Task type enum"""

    FILE_UPLOAD = "file_upload"
    LINK_SUBMISSION = "link_submission"
    TRANSACTION_PROOF = "transaction_proof"
    QUIZ = "quiz"
    TEXT_SUBMISSION = "text_submission"


class SubmissionStatus(str, enum.Enum):
    """Submission status enum"""

    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class Task(Base):
    """Task model - assignments within courses"""

    __tablename__ = "tasks"

    # Primary Key
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    # Foreign Keys
    course_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("courses.id"), nullable=False
    )

    # Basic Info
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    task_type: Mapped[TaskType] = mapped_column(Enum(TaskType), nullable=False)

    # Gamification
    xp_reward: Mapped[int] = mapped_column(Integer, nullable=False)

    # Auto-Verification
    auto_verify: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    verification_rules: Mapped[dict | None] = mapped_column(JSONB, nullable=True, default={})

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )

    # Relationships
    course: Mapped["Course"] = relationship("Course", back_populates="tasks")
    submissions: Mapped[list["Submission"]] = relationship(
        "Submission", back_populates="task", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Task {self.title}>"


class Submission(Base):
    """Submission model - task submissions from users"""

    __tablename__ = "submissions"

    # Primary Key
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    # Foreign Keys
    task_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tasks.id"), nullable=False
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )

    # Submission Data
    submission_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    files: Mapped[dict | None] = mapped_column(
        JSONB, nullable=True
    )  # Array of {name, url, size}
    links: Mapped[list[str] | None] = mapped_column(ARRAY(Text), nullable=True)
    transaction_hash: Mapped[str | None] = mapped_column(String(66), nullable=True)

    # Review
    status: Mapped[SubmissionStatus] = mapped_column(
        Enum(SubmissionStatus), default=SubmissionStatus.PENDING, nullable=False
    )
    reviewer_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    xp_awarded: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    feedback: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    task: Mapped["Task"] = relationship("Task", back_populates="submissions")
    user: Mapped["User"] = relationship(
        "User", back_populates="submissions", foreign_keys=[user_id]
    )
    reviewer: Mapped["User | None"] = relationship("User", foreign_keys=[reviewer_id])

    def __repr__(self) -> str:
        return f"<Submission {self.id} - {self.status.value}>"

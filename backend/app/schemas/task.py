"""Task and Submission schemas"""

from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field
from app.models.task import TaskType, SubmissionStatus


# ===== Task Schemas =====
class TaskBase(BaseModel):
    """Base Task schema"""

    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1)
    task_type: TaskType
    xp_reward: int = Field(..., ge=0)
    auto_verify: bool = False
    verification_rules: Optional[dict] = None


class TaskCreate(TaskBase):
    """Schema for creating a task"""

    course_id: UUID


class TaskUpdate(BaseModel):
    """Schema for updating a task"""

    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, min_length=1)
    xp_reward: Optional[int] = Field(None, ge=0)
    auto_verify: Optional[bool] = None
    verification_rules: Optional[dict] = None


class TaskResponse(TaskBase):
    """Schema for task response"""

    id: UUID
    course_id: UUID
    created_at: datetime

    model_config = {"from_attributes": True}


# ===== Submission Schemas =====
class SubmissionBase(BaseModel):
    """Base Submission schema"""

    submission_text: Optional[str] = None
    files: Optional[dict] = None
    links: Optional[list[str]] = None
    transaction_hash: Optional[str] = Field(None, max_length=66)


class SubmissionCreate(SubmissionBase):
    """Schema for creating a submission"""

    task_id: UUID


class SubmissionReview(BaseModel):
    """Schema for reviewing a submission"""

    status: SubmissionStatus
    xp_awarded: int = Field(..., ge=0)
    feedback: Optional[str] = None


class SubmissionResponse(SubmissionBase):
    """Schema for submission response"""

    id: UUID
    task_id: UUID
    user_id: UUID
    status: SubmissionStatus
    reviewer_id: Optional[UUID] = None
    xp_awarded: int
    feedback: Optional[str] = None
    created_at: datetime
    reviewed_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class SubmissionWithTask(SubmissionResponse):
    """Submission response with task details"""

    task: TaskResponse

    model_config = {"from_attributes": True}


class TaskWithSubmissions(TaskResponse):
    """Task response with user's submission"""

    user_submission: Optional[SubmissionResponse] = None

    model_config = {"from_attributes": True}

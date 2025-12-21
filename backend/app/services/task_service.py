"""Task service for task and submission management"""

from uuid import UUID
from typing import Optional
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.task import Task, Submission, SubmissionStatus
from app.models.user import User
from app.schemas.task import TaskCreate, TaskUpdate, SubmissionCreate, SubmissionReview
from app.services.xp_service import XPService
from app.services.verification_service import VerificationService


class TaskService:
    """Service for managing tasks and submissions"""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.xp_service = XPService(db)
        self.verification_service = VerificationService()

    async def create_task(self, task_data: TaskCreate, user: User) -> Task:
        """Create a new task (instructor/admin only)"""
        # Verify user is instructor or admin
        if user.role not in ["instructor", "admin"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only instructors can create tasks",
            )

        task = Task(**task_data.model_dump())
        self.db.add(task)
        await self.db.commit()
        await self.db.refresh(task)
        return task

    async def get_task(self, task_id: UUID) -> Task:
        """Get a task by ID"""
        stmt = select(Task).where(Task.id == task_id)
        result = await self.db.execute(stmt)
        task = result.scalar_one_or_none()

        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
            )

        return task

    async def get_course_tasks(
        self, course_id: UUID, user_id: Optional[UUID] = None
    ) -> list[Task]:
        """Get all tasks for a course, optionally with user's submissions"""
        stmt = select(Task).where(Task.course_id == course_id).order_by(Task.created_at)

        if user_id:
            stmt = stmt.options(selectinload(Task.submissions))

        result = await self.db.execute(stmt)
        tasks = result.scalars().all()
        return list(tasks)

    async def update_task(
        self, task_id: UUID, task_data: TaskUpdate, user: User
    ) -> Task:
        """Update a task (instructor/admin only)"""
        if user.role not in ["instructor", "admin"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only instructors can update tasks",
            )

        task = await self.get_task(task_id)

        for field, value in task_data.model_dump(exclude_unset=True).items():
            setattr(task, field, value)

        await self.db.commit()
        await self.db.refresh(task)
        return task

    async def delete_task(self, task_id: UUID, user: User) -> None:
        """Delete a task (instructor/admin only)"""
        if user.role not in ["instructor", "admin"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only instructors can delete tasks",
            )

        task = await self.get_task(task_id)
        await self.db.delete(task)
        await self.db.commit()

    # ===== Submission Methods =====

    async def submit_task(
        self, submission_data: SubmissionCreate, user: User
    ) -> Submission:
        """Submit a task completion"""
        # Verify task exists
        task = await self.get_task(submission_data.task_id)

        # Check if user already has a submission
        stmt = (
            select(Submission)
            .where(Submission.task_id == task.id)
            .where(Submission.user_id == user.id)
        )
        result = await self.db.execute(stmt)
        existing = result.scalar_one_or_none()

        if existing and existing.status == SubmissionStatus.APPROVED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Task already completed",
            )

        # Create or update submission
        if existing:
            # Update existing submission
            for field, value in submission_data.model_dump(exclude={"task_id"}).items():
                if value is not None:
                    setattr(existing, field, value)
            existing.status = SubmissionStatus.PENDING
            submission = existing
        else:
            # Create new submission
            submission = Submission(
                **submission_data.model_dump(), user_id=user.id, status=SubmissionStatus.PENDING
            )
            self.db.add(submission)

        await self.db.commit()
        await self.db.refresh(submission)

        # Auto-verify if enabled
        if task.auto_verify:
            await self._auto_verify_submission(submission, task)

        return submission

    async def get_submission(self, submission_id: UUID) -> Submission:
        """Get a submission by ID"""
        stmt = (
            select(Submission)
            .where(Submission.id == submission_id)
            .options(selectinload(Submission.task))
        )
        result = await self.db.execute(stmt)
        submission = result.scalar_one_or_none()

        if not submission:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found"
            )

        return submission

    async def get_user_submissions(
        self, user_id: UUID, course_id: Optional[UUID] = None
    ) -> list[Submission]:
        """Get all submissions for a user"""
        stmt = (
            select(Submission)
            .where(Submission.user_id == user_id)
            .options(selectinload(Submission.task))
        )

        if course_id:
            stmt = stmt.join(Task).where(Task.course_id == course_id)

        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def review_submission(
        self, submission_id: UUID, review_data: SubmissionReview, reviewer: User
    ) -> Submission:
        """Review a submission (instructor/admin only)"""
        if reviewer.role not in ["instructor", "admin"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only instructors can review submissions",
            )

        submission = await self.get_submission(submission_id)

        # Update submission status
        submission.status = review_data.status
        submission.xp_awarded = review_data.xp_awarded
        submission.feedback = review_data.feedback
        submission.reviewer_id = reviewer.id
        submission.reviewed_at = datetime.utcnow()

        # Award XP if approved
        if review_data.status == SubmissionStatus.APPROVED and review_data.xp_awarded > 0:
            await self.xp_service.award_xp(
                user_id=submission.user_id,
                xp_amount=review_data.xp_awarded,
                source_type="task_completion",
                source_id=submission.task_id,
                description=f"Completed task: {submission.task.title}",
            )

        await self.db.commit()
        await self.db.refresh(submission)
        return submission

    async def get_pending_submissions(self, course_id: Optional[UUID] = None) -> list[Submission]:
        """Get all pending submissions (for instructors)"""
        stmt = (
            select(Submission)
            .where(Submission.status == SubmissionStatus.PENDING)
            .options(selectinload(Submission.task), selectinload(Submission.user))
            .order_by(Submission.created_at)
        )

        if course_id:
            stmt = stmt.join(Task).where(Task.course_id == course_id)

        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    # ===== Auto-Verification =====

    async def _auto_verify_submission(self, submission: Submission, task: Task) -> None:
        """Auto-verify submission based on rules"""
        try:
            is_valid, error_message = await self.verification_service.verify_submission(
                submission, task
            )

            if is_valid:
                await self._approve_submission(submission, task.xp_reward)
            else:
                # Store validation error in feedback
                submission.feedback = f"Auto-verification failed: {error_message}"
                await self.db.commit()

        except Exception as e:
            print(f"Auto-verification failed: {e}")
            # Don't fail the submission, just leave it pending

    async def _approve_submission(self, submission: Submission, xp_reward: int) -> None:
        """Approve submission and award XP"""
        submission.status = SubmissionStatus.APPROVED
        submission.xp_awarded = xp_reward
        submission.reviewed_at = datetime.utcnow()

        await self.xp_service.award_xp(
            user_id=submission.user_id,
            xp_amount=xp_reward,
            source_type="task_completion",
            source_id=submission.task_id,
            description="Auto-verified task completion",
        )

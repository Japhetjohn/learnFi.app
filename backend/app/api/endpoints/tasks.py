"""Task and submission API endpoints"""

from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.services.task_service import TaskService
from app.schemas.task import (
    TaskCreate,
    TaskUpdate,
    TaskResponse,
    TaskWithSubmissions,
    SubmissionCreate,
    SubmissionReview,
    SubmissionResponse,
    SubmissionWithTask,
)

router = APIRouter()


# ===== Task Endpoints =====


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new task (instructor/admin only).

    - **title**: Task title
    - **description**: Detailed task description
    - **task_type**: Type of task (file_upload, link_submission, etc.)
    - **xp_reward**: XP awarded on completion
    - **auto_verify**: Whether to auto-verify submissions
    - **verification_rules**: Rules for auto-verification
    """
    service = TaskService(db)
    task = await service.create_task(task_data, current_user)
    return task


@router.get("/course/{course_id}", response_model=list[TaskWithSubmissions])
async def get_course_tasks(
    course_id: UUID,
    current_user: Optional[User] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get all tasks for a course.

    Includes user's submission status if authenticated.
    """
    service = TaskService(db)
    user_id = current_user.id if current_user else None
    tasks = await service.get_course_tasks(course_id, user_id)

    # Add user submissions to response
    tasks_with_submissions = []
    for task in tasks:
        user_submission = None
        if current_user:
            submissions = [s for s in task.submissions if s.user_id == current_user.id]
            user_submission = submissions[0] if submissions else None

        tasks_with_submissions.append({
            **task.__dict__,
            "user_submission": user_submission,
        })

    return tasks_with_submissions


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get a task by ID"""
    service = TaskService(db)
    task = await service.get_task(task_id)
    return task


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: UUID,
    task_data: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a task (instructor/admin only)"""
    service = TaskService(db)
    task = await service.update_task(task_id, task_data, current_user)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a task (instructor/admin only)"""
    service = TaskService(db)
    await service.delete_task(task_id, current_user)


# ===== Submission Endpoints =====


@router.post("/submissions", response_model=SubmissionResponse, status_code=status.HTTP_201_CREATED)
async def submit_task(
    submission_data: SubmissionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Submit a task completion.

    Provide the appropriate data based on task type:
    - **file_upload**: Include files dict
    - **link_submission**: Include links array
    - **transaction_proof**: Include transaction_hash
    - **quiz**: Include submission_text with quiz answers
    - **text_submission**: Include submission_text
    """
    service = TaskService(db)
    submission = await service.submit_task(submission_data, current_user)
    return submission


@router.get("/submissions/{submission_id}", response_model=SubmissionWithTask)
async def get_submission(
    submission_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a submission by ID"""
    service = TaskService(db)
    submission = await service.get_submission(submission_id)

    # Verify user has access (owner, instructor, or admin)
    if (
        submission.user_id != current_user.id
        and current_user.role not in ["instructor", "admin"]
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this submission",
        )

    return submission


@router.get("/submissions/user/{user_id}", response_model=list[SubmissionWithTask])
async def get_user_submissions(
    user_id: UUID,
    course_id: Optional[UUID] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get all submissions for a user.

    Optionally filter by course_id.
    """
    # Verify user has access (own submissions or instructor/admin)
    if user_id != current_user.id and current_user.role not in ["instructor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to these submissions",
        )

    service = TaskService(db)
    submissions = await service.get_user_submissions(user_id, course_id)
    return submissions


@router.patch("/submissions/{submission_id}/review", response_model=SubmissionResponse)
async def review_submission(
    submission_id: UUID,
    review_data: SubmissionReview,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Review a submission (instructor/admin only).

    - **status**: approved or rejected
    - **xp_awarded**: XP to award (if approved)
    - **feedback**: Optional feedback for the learner
    """
    service = TaskService(db)
    submission = await service.review_submission(submission_id, review_data, current_user)
    return submission


@router.get("/submissions/pending", response_model=list[SubmissionWithTask])
async def get_pending_submissions(
    course_id: Optional[UUID] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get all pending submissions (instructor/admin only).

    Optionally filter by course_id.
    """
    if current_user.role not in ["instructor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only instructors can view pending submissions",
        )

    service = TaskService(db)
    submissions = await service.get_pending_submissions(course_id)
    return submissions

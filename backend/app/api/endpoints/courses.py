"""Course endpoints"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.core.database import get_db
from app.api.deps import get_current_active_user, get_current_user_optional
from app.services.course_service import CourseService
from app.schemas.course import CourseResponse, CourseCreate, CourseUpdate, CourseEnrollResponse
from app.models.user import User, UserRole

router = APIRouter()


@router.get("", response_model=dict)
async def list_courses(
    published_only: bool = True,
    difficulty: Optional[str] = Query(None, regex="^(beginner|intermediate|advanced)$"),
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """
    List all courses with filters.

    Query parameters:
    - published_only: Show only published courses (default: true)
    - difficulty: Filter by difficulty (beginner, intermediate, advanced)
    - search: Search in title and description
    - page: Page number (default: 1)
    - per_page: Items per page (default: 20, max: 100)

    Returns paginated list of courses.
    """
    course_service = CourseService(db)

    offset = (page - 1) * per_page
    courses, total = await course_service.list_courses(
        published_only=published_only,
        difficulty=difficulty,
        search=search,
        limit=per_page,
        offset=offset,
    )

    return {
        "success": True,
        "data": [CourseResponse.from_orm(course) for course in courses],
        "meta": {
            "page": page,
            "per_page": per_page,
            "total": total,
            "total_pages": (total + per_page - 1) // per_page,
        },
    }


@router.get("/{slug}", response_model=CourseResponse)
async def get_course(
    slug: str,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """
    Get course details by slug.

    Returns complete course information including:
    - Course metadata
    - Author info
    - XP total
    - Token gating requirements
    """
    course_service = CourseService(db)
    course = await course_service.get_course_by_slug(slug)

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    # If course is not published, only author and admins can view
    if not course.published:
        if not current_user or (
            current_user.id != course.author_id
            and current_user.role != UserRole.ADMIN
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Course not published"
            )

    return course


@router.post("/{course_id}/enroll", response_model=CourseEnrollResponse)
async def enroll_in_course(
    course_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Enroll in a course.

    Creates an enrollment record and starts tracking progress.

    Requirements:
    - User must be authenticated
    - Course must be published
    - User must not already be enrolled
    - If token-gated, user must hold required tokens
    """
    course_service = CourseService(db)

    # Get course
    course = await course_service.get_course_by_id(course_id)
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    # Check if published
    if not course.published:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Course not published"
        )

    # TODO: Check token gating requirements
    if course.token_gated and course.required_token_amount:
        # In a real implementation, verify user holds tokens on-chain
        pass

    # Enroll user
    try:
        enrollment = await course_service.enroll_user(course.id, current_user.id)
        return enrollment
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/{course_id}/progress", response_model=CourseEnrollResponse)
async def get_course_progress(
    course_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get user's progress in a course.

    Returns:
    - Completion percentage
    - Start date
    - Completion date (if completed)
    - Last accessed timestamp
    """
    course_service = CourseService(db)

    enrollment = await course_service.get_user_enrollment(course_id, current_user.id)
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not enrolled in this course"
        )

    return enrollment


@router.post("", response_model=CourseResponse)
async def create_course(
    course_data: CourseCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new course.

    Only instructors and admins can create courses.

    Required fields:
    - title
    - slug (unique, URL-friendly)
    - description
    """
    # Check permissions
    if current_user.role not in [UserRole.INSTRUCTOR, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only instructors and admins can create courses"
        )

    course_service = CourseService(db)

    try:
        course = await course_service.create_course(course_data, current_user.id)
        return course
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create course: {str(e)}"
        )


@router.patch("/{course_id}", response_model=CourseResponse)
async def update_course(
    course_id: str,
    course_update: CourseUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Update a course.

    Only the course author or admins can update courses.
    """
    course_service = CourseService(db)

    course = await course_service.get_course_by_id(course_id)
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    # Check permissions
    if current_user.id != course.author_id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this course"
        )

    try:
        updated_course = await course_service.update_course(course_id, course_update)
        return updated_course
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

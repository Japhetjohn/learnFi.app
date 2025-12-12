"""Course service - course management and enrollment"""

from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func
from uuid import UUID
from datetime import datetime

from app.models.course import Course, CourseEnrollment
from app.models.user import User
from app.schemas.course import CourseCreate, CourseUpdate


class CourseService:
    """Course management service"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_course(self, course_data: CourseCreate, author_id: UUID) -> Course:
        """Create a new course"""
        course = Course(
            **course_data.model_dump(),
            author_id=author_id
        )
        self.db.add(course)
        await self.db.commit()
        await self.db.refresh(course)
        return course

    async def get_course_by_id(self, course_id: UUID) -> Optional[Course]:
        """Get course by ID"""
        result = await self.db.execute(
            select(Course).where(Course.id == course_id)
        )
        return result.scalar_one_or_none()

    async def get_course_by_slug(self, slug: str) -> Optional[Course]:
        """Get course by slug"""
        result = await self.db.execute(
            select(Course).where(Course.slug == slug)
        )
        return result.scalar_one_or_none()

    async def list_courses(
        self,
        published_only: bool = True,
        difficulty: Optional[str] = None,
        search: Optional[str] = None,
        limit: int = 20,
        offset: int = 0,
    ) -> tuple[List[Course], int]:
        """List courses with filters"""
        query = select(Course)

        # Filters
        if published_only:
            query = query.where(Course.published == True)

        if difficulty:
            query = query.where(Course.difficulty_level == difficulty)

        if search:
            query = query.where(
                or_(
                    Course.title.ilike(f"%{search}%"),
                    Course.description.ilike(f"%{search}%"),
                )
            )

        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar()

        # Pagination
        query = query.limit(limit).offset(offset)

        result = await self.db.execute(query)
        courses = result.scalars().all()

        return courses, total

    async def update_course(
        self, course_id: UUID, course_update: CourseUpdate
    ) -> Course:
        """Update course"""
        course = await self.get_course_by_id(course_id)
        if not course:
            raise ValueError("Course not found")

        update_data = course_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(course, field, value)

        await self.db.commit()
        await self.db.refresh(course)
        return course

    async def enroll_user(self, course_id: UUID, user_id: UUID) -> CourseEnrollment:
        """Enroll user in course"""
        # Check if already enrolled
        existing = await self.db.execute(
            select(CourseEnrollment).where(
                and_(
                    CourseEnrollment.course_id == course_id,
                    CourseEnrollment.user_id == user_id,
                )
            )
        )
        if existing.scalar_one_or_none():
            raise ValueError("User already enrolled")

        # Create enrollment
        enrollment = CourseEnrollment(
            course_id=course_id,
            user_id=user_id,
        )
        self.db.add(enrollment)
        await self.db.commit()
        await self.db.refresh(enrollment)
        return enrollment

    async def get_user_enrollment(
        self, course_id: UUID, user_id: UUID
    ) -> Optional[CourseEnrollment]:
        """Get user's enrollment for a course"""
        result = await self.db.execute(
            select(CourseEnrollment).where(
                and_(
                    CourseEnrollment.course_id == course_id,
                    CourseEnrollment.user_id == user_id,
                )
            )
        )
        return result.scalar_one_or_none()

    async def update_progress(
        self, course_id: UUID, user_id: UUID, completion_percentage: float
    ) -> CourseEnrollment:
        """Update user's progress in course"""
        enrollment = await self.get_user_enrollment(course_id, user_id)
        if not enrollment:
            raise ValueError("Enrollment not found")

        enrollment.completion_percentage = completion_percentage
        enrollment.last_accessed_at = datetime.utcnow()

        # Mark as completed if 100%
        if completion_percentage >= 100 and not enrollment.completed_at:
            enrollment.completed_at = datetime.utcnow()

        await self.db.commit()
        await self.db.refresh(enrollment)
        return enrollment

    async def get_user_enrollments(self, user_id: UUID) -> List[CourseEnrollment]:
        """Get all enrollments for a user"""
        result = await self.db.execute(
            select(CourseEnrollment).where(CourseEnrollment.user_id == user_id)
        )
        return result.scalars().all()

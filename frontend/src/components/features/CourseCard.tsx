import { Link } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { getDifficultyColor, formatTokenAmount, truncate } from '@/lib/utils'
import type { Course } from '@/types'

interface CourseCardProps {
  course: Course
  enrollment?: {
    progress_percentage: number
    is_completed: boolean
  }
}

export function CourseCard({ course, enrollment }: CourseCardProps) {
  const isEnrolled = !!enrollment

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      {/* Course Image */}
      <div className="relative h-48 bg-gradient-to-br from-primary-500 to-accent-500 overflow-hidden">
        {course.cover_image_url ? (
          <img
            src={course.cover_image_url}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl font-bold text-white/20">
              {course.title.charAt(0)}
            </span>
          </div>
        )}

        {/* Difficulty Badge */}
        <div className="absolute top-3 right-3">
          <Badge className={getDifficultyColor(course.difficulty)}>
            {course.difficulty}
          </Badge>
        </div>

        {/* Token Gated Indicator */}
        {course.token_gated && course.required_token_amount && (
          <div className="absolute bottom-3 left-3">
            <Badge variant="secondary" className="bg-white/90 text-gray-900">
              🔒 {formatTokenAmount(course.required_token_amount)} LEARN
            </Badge>
          </div>
        )}
      </div>

      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xl line-clamp-2">{course.title}</CardTitle>
          {course.is_published ? (
            <Badge variant="success" className="shrink-0">
              Live
            </Badge>
          ) : (
            <Badge variant="warning" className="shrink-0">
              Draft
            </Badge>
          )}
        </div>
        <CardDescription className="line-clamp-2">
          {course.short_description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar for Enrolled Courses */}
        {isEnrolled && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Progress</span>
              <span className="font-medium">
                {enrollment.progress_percentage}%
              </span>
            </div>
            <Progress value={enrollment.progress_percentage} />
            {enrollment.is_completed && (
              <Badge variant="success" className="w-full justify-center">
                ✓ Completed
              </Badge>
            )}
          </div>
        )}

        {/* Course Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <span>📚</span>
            <span>{course.total_lessons || 0} lessons</span>
          </div>
          <div className="flex items-center gap-1">
            <span>⭐</span>
            <span>{course.xp_reward} XP</span>
          </div>
        </div>

        {/* Tags */}
        {course.tags && course.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {course.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {course.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{course.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Link to={`/courses/${course.slug}`} className="w-full">
          <Button variant={isEnrolled ? 'outline' : 'gradient'} className="w-full">
            {isEnrolled ? 'Continue Learning' : 'View Course'}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

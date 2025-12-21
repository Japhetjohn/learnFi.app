import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { apiClient } from '@/lib/api/client'
import { useAuthStore } from '@/stores/authStore'
import { getDifficultyColor, formatTokenAmount } from '@/lib/utils'
import type { Course } from '@/types'
import toast from 'react-hot-toast'

export function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  const [course, setCourse] = useState<Course | null>(null)
  const [enrollment, setEnrollment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)

  useEffect(() => {
    fetchCourseDetails()
  }, [slug])

  const fetchCourseDetails = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get(`/courses/${slug}`)
      setCourse(response.data)

      // Check if user is enrolled
      if (isAuthenticated) {
        try {
          const enrollmentResponse = await apiClient.get(`/courses/${response.data.id}/progress`)
          setEnrollment(enrollmentResponse.data)
        } catch (error) {
          // User not enrolled
          setEnrollment(null)
        }
      }
    } catch (error) {
      console.error('Failed to fetch course:', error)
      toast.error('Course not found')
      navigate('/courses')
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      toast.error('Please connect your wallet to enroll')
      return
    }

    if (!course) return

    try {
      setEnrolling(true)
      await apiClient.post(`/courses/${course.id}/enroll`)
      toast.success('Successfully enrolled!')
      fetchCourseDetails()
    } catch (error: any) {
      console.error('Failed to enroll:', error)
      toast.error(error.response?.data?.detail || 'Failed to enroll in course')
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-light-primary dark:bg-dark-primary py-12">
        <div className="container mx-auto px-4">
          <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
        </div>
      </div>
    )
  }

  if (!course) {
    return null
  }

  return (
    <div className="min-h-screen bg-light-primary dark:bg-dark-primary">
      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-br from-primary-500 to-accent-500">
        {course.cover_image_url && (
          <img
            src={course.cover_image_url}
            alt={course.title}
            className="w-full h-full object-cover opacity-30"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 pb-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-4">
              <Badge className={getDifficultyColor(course.difficulty)}>
                {course.difficulty}
              </Badge>
              {course.token_gated && (
                <Badge variant="secondary" className="bg-white/90 text-gray-900">
                  🔒 {formatTokenAmount(course.required_token_amount || '0')} LEARN
                </Badge>
              )}
              {!course.is_published && (
                <Badge variant="warning">Draft</Badge>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {course.title}
            </h1>
            <p className="text-xl text-white/90 max-w-3xl">
              {course.short_description}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Description */}
            <Card>
              <CardHeader>
                <CardTitle>About This Course</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                  {course.long_description || course.short_description}
                </div>
              </CardContent>
            </Card>

            {/* What You'll Learn */}
            <Card>
              <CardHeader>
                <CardTitle>What You'll Learn</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {[
                    'Build real-world Web3 applications',
                    'Master smart contract development',
                    'Understand blockchain fundamentals',
                    'Deploy to production networks',
                    'Earn certifications and rewards',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Prerequisites */}
            {course.prerequisites && course.prerequisites.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Prerequisites</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {course.prerequisites.map((prereq, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-gray-400 mt-0.5">•</span>
                        <span>{prereq}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enrollment Card */}
            <Card className="sticky top-20">
              <CardContent className="p-6 space-y-6">
                {enrollment ? (
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Your Progress
                        </span>
                        <span className="font-semibold">
                          {enrollment.progress_percentage}%
                        </span>
                      </div>
                      <Progress value={enrollment.progress_percentage} />
                    </div>

                    {enrollment.is_completed ? (
                      <Badge variant="success" className="w-full justify-center">
                        ✓ Completed
                      </Badge>
                    ) : (
                      <Button
                        className="w-full"
                        variant="gradient"
                        size="lg"
                        onClick={() => navigate(`/dashboard/courses/${course.id}`)}
                      >
                        Continue Learning
                      </Button>
                    )}
                  </>
                ) : (
                  <Button
                    className="w-full"
                    variant="gradient"
                    size="lg"
                    onClick={handleEnroll}
                    disabled={enrolling || !isAuthenticated}
                  >
                    {enrolling
                      ? 'Enrolling...'
                      : isAuthenticated
                      ? 'Enroll Now'
                      : 'Connect Wallet to Enroll'}
                  </Button>
                )}

                {/* Course Stats */}
                <div className="space-y-3 pt-6 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Lessons</span>
                    <span className="font-medium">{course.total_lessons || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">XP Reward</span>
                    <span className="font-medium text-primary-500">
                      {course.xp_reward} XP
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Duration</span>
                    <span className="font-medium">
                      {course.estimated_duration_hours || 0}h
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Students</span>
                    <span className="font-medium">
                      {course.enrollment_count || 0}
                    </span>
                  </div>
                </div>

                {/* Tags */}
                {course.tags && course.tags.length > 0 && (
                  <div className="pt-6 border-t">
                    <div className="flex flex-wrap gap-2">
                      {course.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

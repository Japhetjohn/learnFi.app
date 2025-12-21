import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CourseCard } from '@/components/features/CourseCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { apiClient } from '@/lib/api/client'
import { useAuthStore } from '@/stores/authStore'
import { formatXP } from '@/lib/utils'

export function DashboardPage() {
  const { user } = useAuthStore()
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    totalXP: 0,
    currentStreak: 0,
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch user's enrolled courses
      const coursesResponse = await apiClient.get('/courses/enrolled')
      const enrolledData = coursesResponse.data

      setEnrolledCourses(enrolledData)

      // Calculate stats
      const completed = enrolledData.filter((e: any) => e.is_completed).length
      setStats({
        totalCourses: enrolledData.length,
        completedCourses: completed,
        totalXP: user?.xp_total || 0,
        currentStreak: 7, // TODO: Implement streak tracking
      })

      // Fetch recent XP activity
      if (user?.id) {
        const xpResponse = await apiClient.get(`/users/${user.id}/xp?limit=5`)
        setRecentActivity(xpResponse.data)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
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

  return (
    <div className="min-h-screen bg-light-primary dark:bg-dark-primary py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.username || 'Learner'}!</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Continue your Web3 learning journey
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total XP
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                {formatXP(stats.totalXP)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Courses Enrolled
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalCourses}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">
                {stats.completedCourses}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Current Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-500">
                {stats.currentStreak} 🔥
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Continue Learning */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Continue Learning</h2>
                <Link to="/courses">
                  <Button variant="ghost">Browse All Courses</Button>
                </Link>
              </div>

              {enrolledCourses.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {enrolledCourses
                    .filter((e) => !e.is_completed)
                    .slice(0, 4)
                    .map((enrollment) => (
                      <CourseCard
                        key={enrollment.course.id}
                        course={enrollment.course}
                        enrollment={{
                          progress_percentage: enrollment.progress_percentage,
                          is_completed: enrollment.is_completed,
                        }}
                      />
                    ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      You haven't enrolled in any courses yet
                    </p>
                    <Link to="/courses">
                      <Button variant="gradient">Explore Courses</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Completed Courses */}
            {stats.completedCourses > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Completed Courses</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {enrolledCourses
                    .filter((e) => e.is_completed)
                    .slice(0, 4)
                    .map((enrollment) => (
                      <CourseCard
                        key={enrollment.course.id}
                        course={enrollment.course}
                        enrollment={{
                          progress_percentage: 100,
                          is_completed: true,
                        }}
                      />
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, i) => (
                    <div key={i} className="flex items-start gap-3 pb-3 border-b last:border-0">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center text-white font-bold">
                        +{activity.xp_change}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{activity.source_type}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {activity.description || 'XP earned'}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {new Date(activity.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    No recent activity
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/courses" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    📚 Browse Courses
                  </Button>
                </Link>
                <Link to="/profile" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    👤 View Profile
                  </Button>
                </Link>
                <Link to="/leaderboard" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    🏆 Leaderboard
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Achievements Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Badges</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  Complete courses to earn NFT badges
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

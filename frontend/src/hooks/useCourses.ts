import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listCourses, getCourse, enrollInCourse, getCourseProgress, getEnrolledCourses, type CourseListParams } from '@/lib/api/courses'
import { QUERY_KEYS } from '@/constants'
import toast from 'react-hot-toast'

export function useCourses(params?: CourseListParams) {
  return useQuery({
    queryKey: [QUERY_KEYS.COURSES, params],
    queryFn: () => listCourses(params),
  })
}

export function useCourse(slug: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.COURSE, slug],
    queryFn: () => getCourse(slug),
    enabled: !!slug,
  })
}

export function useEnrolledCourses() {
  return useQuery({
    queryKey: [QUERY_KEYS.ENROLLED_COURSES],
    queryFn: getEnrolledCourses,
  })
}

export function useCourseProgress(courseId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.COURSE, courseId, 'progress'],
    queryFn: () => getCourseProgress(courseId),
    enabled: !!courseId,
  })
}

export function useEnrollInCourse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: enrollInCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ENROLLED_COURSES] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COURSE] })
      toast.success('Successfully enrolled in course!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to enroll in course')
    },
  })
}

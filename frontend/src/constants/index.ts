export const DIFFICULTIES = ['beginner', 'intermediate', 'advanced', 'expert'] as const
export type Difficulty = typeof DIFFICULTIES[number]

export const CATEGORIES = [
  'DeFi',
  'NFTs',
  'DAOs',
  'Smart Contracts',
  'dApps',
  'Security',
  'Infrastructure',
] as const
export type Category = typeof CATEGORIES[number]

export const USER_ROLES = ['learner', 'instructor', 'admin', 'partner'] as const
export type UserRole = typeof USER_ROLES[number]

export const TASK_TYPES = [
  'file_upload',
  'link_submission',
  'transaction_proof',
  'quiz',
  'text_submission',
] as const
export type TaskType = typeof TASK_TYPES[number]

export const SUBMISSION_STATUS = ['pending', 'approved', 'rejected'] as const
export type SubmissionStatus = typeof SUBMISSION_STATUS[number]

export const ROUTES = {
  HOME: '/',
  COURSES: '/courses',
  COURSE_DETAIL: '/courses/:slug',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  LEADERBOARD: '/leaderboard',
} as const

export const API_ENDPOINTS = {
  // Auth
  AUTH_NONCE: '/auth/nonce',
  AUTH_VERIFY: '/auth/verify',
  AUTH_REFRESH: '/auth/refresh',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_ME: '/auth/me',

  // Users
  USERS_ME: '/users/me',
  USERS_XP: '/users/:id/xp',
  USERS_BADGES: '/users/:id/badges',
  LEADERBOARD: '/users/leaderboard',

  // Courses
  COURSES: '/courses',
  COURSE_DETAIL: '/courses/:slug',
  COURSE_ENROLL: '/courses/:id/enroll',
  COURSE_PROGRESS: '/courses/:id/progress',
  COURSES_ENROLLED: '/courses/enrolled',

  // Tasks
  TASKS: '/tasks',
  TASK_DETAIL: '/tasks/:id',
  TASK_SUBMISSIONS: '/tasks/submissions',
  TASK_SUBMISSION_DETAIL: '/tasks/submissions/:id',
} as const

export const QUERY_KEYS = {
  USER: 'user',
  COURSES: 'courses',
  COURSE: 'course',
  ENROLLED_COURSES: 'enrolled-courses',
  XP_HISTORY: 'xp-history',
  BADGES: 'badges',
  LEADERBOARD: 'leaderboard',
  TASKS: 'tasks',
  SUBMISSIONS: 'submissions',
} as const

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  AUTH_STORE: 'auth-storage',
} as const

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 50,
} as const

export const XP_REWARDS = {
  TASK_COMPLETION: 100,
  COURSE_COMPLETION: 1000,
  DAILY_LOGIN: 10,
} as const

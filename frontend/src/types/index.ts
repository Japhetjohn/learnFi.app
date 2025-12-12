// User Types
export interface User {
  id: string
  wallet_address: string
  username?: string
  email?: string
  profile_picture_url?: string
  bio?: string
  xp_total: number
  role: 'learner' | 'instructor' | 'admin' | 'partner'
  created_at: string
  updated_at: string
}

// Course Types
export interface Course {
  id: string
  slug: string
  title: string
  description: string
  thumbnail_url?: string
  difficulty_level: 'beginner' | 'intermediate' | 'advanced'
  estimated_hours: number
  xp_total: number
  author_id: string
  author?: User
  published: boolean
  token_gated: boolean
  required_token_amount?: string
  created_at: string
  progress?: CourseProgress
}

export interface CourseProgress {
  course_id: string
  user_id: string
  completion_percentage: number
  started_at: string
  completed_at?: string
  last_accessed_at: string
}

// Task Types
export interface Task {
  id: string
  course_id: string
  title: string
  description: string
  task_type: 'file_upload' | 'link_submission' | 'transaction_proof' | 'quiz' | 'text_submission'
  xp_reward: number
  auto_verify: boolean
  verification_rules?: Record<string, any>
  created_at: string
  user_submission?: Submission
}

// Submission Types
export interface Submission {
  id: string
  task_id: string
  user_id: string
  submission_text?: string
  files?: Array<{
    name: string
    url: string
    size: number
  }>
  links?: string[]
  transaction_hash?: string
  status: 'pending' | 'approved' | 'rejected'
  reviewer_id?: string
  xp_awarded: number
  feedback?: string
  created_at: string
  reviewed_at?: string
}

// XP Types
export interface XPEntry {
  id: string
  user_id: string
  source_type: 'task_completion' | 'course_completion' | 'admin_grant' | 'bounty'
  source_id?: string
  xp_change: number
  balance_after: number
  reason?: string
  created_at: string
}

// Badge Types
export interface Badge {
  id: string
  name: string
  description: string
  image_url?: string
  tier: 'bronze' | 'silver' | 'gold' | 'legendary'
  criteria_type: 'course_completion' | 'xp_milestone' | 'special_event'
  criteria_config: Record<string, any>
  created_at: string
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  badge?: Badge
  earned_at: string
  nft_minted: boolean
  nft_token_id?: string
  nft_tx_hash?: string
  ipfs_metadata_uri?: string
}

// Leaderboard Types
export interface LeaderboardEntry {
  rank: number
  user: User
  xp_total: number
  xp_this_week?: number
  xp_this_month?: number
}

// Staking Types
export interface StakingPosition {
  id: string
  user_id: string
  pool_type: 'token' | 'nft'
  asset_address: string
  amount: string
  staked_at: string
  unstaked_at?: string
  rewards_earned: string
  status: 'active' | 'unstaked'
}

export interface StakingPool {
  id: string
  pool_type: 'token' | 'nft'
  total_staked: string
  apy: number
  reward_token_address: string
}

// API Response Types
export interface APIResponse<T> {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  meta: {
    page: number
    per_page: number
    total: number
    total_pages: number
  }
}

// Auth Types
export interface AuthTokens {
  access_token: string
  refresh_token?: string
}

export interface SIWEMessage {
  domain: string
  address: string
  statement: string
  uri: string
  version: string
  chain_id: number
  nonce: string
  issued_at: string
  expiration_time?: string
}

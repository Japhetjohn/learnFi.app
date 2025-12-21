import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getUserProfile,
  updateUserProfile,
  getUserXPHistory,
  getUserBadges,
  getLeaderboard,
} from '@/lib/api/users'
import { QUERY_KEYS } from '@/constants'
import { useAuthStore } from '@/stores/authStore'
import toast from 'react-hot-toast'

export function useCurrentUser() {
  const { isAuthenticated } = useAuthStore()

  return useQuery({
    queryKey: [QUERY_KEYS.USER, 'me'],
    queryFn: getUserProfile,
    enabled: isAuthenticated,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const { setUser } = useAuthStore()

  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER] })
      setUser(data)
      toast.success('Profile updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update profile')
    },
  })
}

export function useXPHistory(userId: string, limit = 20) {
  return useQuery({
    queryKey: [QUERY_KEYS.XP_HISTORY, userId, limit],
    queryFn: () => getUserXPHistory(userId, limit),
    enabled: !!userId,
  })
}

export function useUserBadges(userId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.BADGES, userId],
    queryFn: () => getUserBadges(userId),
    enabled: !!userId,
  })
}

export function useLeaderboard(limit = 100) {
  return useQuery({
    queryKey: [QUERY_KEYS.LEADERBOARD, limit],
    queryFn: () => getLeaderboard(limit),
  })
}

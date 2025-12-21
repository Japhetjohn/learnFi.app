import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { apiClient } from '@/lib/api/client'
import { useAuthStore } from '@/stores/authStore'
import { formatAddress, formatXP } from '@/lib/utils'
import toast from 'react-hot-toast'

export function ProfilePage() {
  const { user, setUser } = useAuthStore()
  const [editing, setEditing] = useState(false)
  const [username, setUsername] = useState(user?.username || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [xpHistory, setXpHistory] = useState<any[]>([])
  const [badges, setBadges] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    try {
      setLoading(true)

      // Fetch XP history
      if (user?.id) {
        const xpResponse = await apiClient.get(`/users/${user.id}/xp?limit=20`)
        setXpHistory(xpResponse.data)

        // Fetch badges
        const badgesResponse = await apiClient.get(`/users/${user.id}/badges`)
        setBadges(badgesResponse.data)
      }
    } catch (error) {
      console.error('Failed to fetch profile data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await apiClient.patch('/users/me', { username, bio })
      setUser(response.data)
      setEditing(false)
      toast.success('Profile updated successfully')
    } catch (error: any) {
      console.error('Failed to update profile:', error)
      toast.error(error.response?.data?.detail || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setUsername(user?.username || '')
    setBio(user?.bio || '')
    setEditing(false)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-light-primary dark:bg-dark-primary py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Please connect your wallet to view your profile
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-light-primary dark:bg-dark-primary py-12">
      <div className="container mx-auto px-4">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start gap-8">
              {/* Avatar */}
              <Avatar className="w-32 h-32">
                <AvatarImage src={user.avatar_url} alt={user.username} />
                <AvatarFallback className="text-4xl">
                  {user.wallet_address.slice(2, 4).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Profile Info */}
              <div className="flex-1 space-y-4">
                {editing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Username</label>
                      <Input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter username"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Bio</label>
                      <Input
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell us about yourself"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : 'Save'}
                      </Button>
                      <Button variant="outline" onClick={handleCancel} disabled={saving}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <h1 className="text-3xl font-bold mb-2">
                        {user.username || formatAddress(user.wallet_address)}
                      </h1>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        {formatAddress(user.wallet_address)}
                      </p>
                      {user.bio && (
                        <p className="text-gray-700 dark:text-gray-300">{user.bio}</p>
                      )}
                    </div>
                    <Button variant="outline" onClick={() => setEditing(true)}>
                      Edit Profile
                    </Button>
                  </>
                )}

                {/* Stats */}
                <div className="flex flex-wrap gap-6 pt-4">
                  <div>
                    <div className="text-2xl font-bold text-primary-500">
                      {formatXP(user.xp_total)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total XP</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{badges.length}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Badges</div>
                  </div>
                  <div>
                    <Badge
                      variant="outline"
                      className="text-base px-4 py-1"
                    >
                      {user.role}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* XP History */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>XP History</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-16 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                    ))}
                  </div>
                ) : xpHistory.length > 0 ? (
                  <div className="space-y-3">
                    {xpHistory.map((activity, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold ${
                              activity.xp_change > 0
                                ? 'bg-gradient-to-br from-green-500 to-green-600'
                                : 'bg-gradient-to-br from-red-500 to-red-600'
                            }`}
                          >
                            {activity.xp_change > 0 ? '+' : ''}
                            {activity.xp_change}
                          </div>
                          <div>
                            <p className="font-medium">{activity.source_type}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {activity.description || 'XP change'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatXP(activity.balance_after)} XP</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(activity.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    No XP history yet. Start completing courses to earn XP!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Badges */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>NFT Badges</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="grid grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : badges.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {badges.map((badge, i) => (
                      <div
                        key={i}
                        className="relative aspect-square bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg p-1 overflow-hidden"
                      >
                        {badge.metadata_uri ? (
                          <img
                            src={badge.metadata_uri}
                            alt={badge.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-full bg-white dark:bg-dark-surface rounded-lg flex items-center justify-center">
                            <span className="text-4xl">🏆</span>
                          </div>
                        )}
                        {badge.is_soulbound && (
                          <Badge
                            variant="secondary"
                            className="absolute top-2 right-2 text-xs"
                          >
                            Soulbound
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-4xl mb-2">🏆</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Complete courses to earn NFT badges
                    </p>
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

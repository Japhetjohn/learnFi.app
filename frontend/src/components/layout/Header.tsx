import { Link, useLocation } from 'react-router-dom'
import { WalletButton } from '@/components/features/WalletButton'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/authStore'

export function Header() {
  const location = useLocation()
  const { isAuthenticated } = useAuthStore()

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-lg dark:border-gray-800 dark:bg-dark-surface/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg">
              <span className="text-white font-bold text-xl">L</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
              LearnFi
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/courses">
              <Button
                variant="ghost"
                className={isActive('/courses') ? 'text-primary-500' : ''}
              >
                Courses
              </Button>
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/dashboard">
                  <Button
                    variant="ghost"
                    className={isActive('/dashboard') ? 'text-primary-500' : ''}
                  >
                    Dashboard
                  </Button>
                </Link>
                <Link to="/leaderboard">
                  <Button
                    variant="ghost"
                    className={isActive('/leaderboard') ? 'text-primary-500' : ''}
                  >
                    Leaderboard
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button
                    variant="ghost"
                    className={isActive('/profile') ? 'text-primary-500' : ''}
                  >
                    Profile
                  </Button>
                </Link>
              </>
            )}
          </nav>

          {/* Wallet Button */}
          <WalletButton />
        </div>
      </div>
    </header>
  )
}

import { useAccount, useConnect } from 'wagmi'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatAddress } from '@/lib/utils'
import { useAuth } from '@/hooks'

export function WalletButton() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { user, isAuthenticated, isAuthenticating, authenticate, signOut } = useAuth()

  // Auto-authenticate when wallet connects
  useEffect(() => {
    if (isConnected && address && !isAuthenticated && !isAuthenticating) {
      authenticate()
    }
  }, [isConnected, address, isAuthenticated, isAuthenticating])

  if (isConnected && isAuthenticated && user) {
    return (
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500/10 to-accent-500/10 rounded-lg border border-primary-500/20">
          <span className="text-sm font-medium text-primary-500">
            {user.xp_total.toLocaleString()} XP
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">
              {address ? address.slice(2, 4).toUpperCase() : '??'}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:flex flex-col">
            <span className="text-sm font-medium">{user.username || formatAddress(address!)}</span>
            <span className="text-xs text-gray-500">{formatAddress(address!)}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="ml-2"
          >
            Disconnect
          </Button>
        </div>
      </div>
    )
  }

  if (isConnected && !isAuthenticated) {
    return (
      <Button disabled variant="outline">
        {isAuthenticating ? 'Signing in...' : 'Connected'}
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {connectors.slice(0, 1).map((connector) => (
        <Button
          key={connector.id}
          onClick={() => connect({ connector })}
          variant="gradient"
          size="lg"
        >
          Connect Wallet
        </Button>
      ))}
    </div>
  )
}

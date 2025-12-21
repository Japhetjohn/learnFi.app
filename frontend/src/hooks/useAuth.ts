import { useState } from 'react'
import { useAccount, useSignMessage, useDisconnect } from 'wagmi'
import { SiweMessage } from 'siwe'
import { useAuthStore } from '@/stores/authStore'
import { requestNonce, verifySignature } from '@/lib/api/auth'
import { STORAGE_KEYS } from '@/constants'
import toast from 'react-hot-toast'

export function useAuth() {
  const { address } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const { disconnect } = useDisconnect()
  const { user, isAuthenticated, setUser, logout } = useAuthStore()
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  const authenticate = async () => {
    if (!address) {
      toast.error('Please connect your wallet first')
      return
    }

    try {
      setIsAuthenticating(true)

      // Step 1: Request nonce
      const { nonce } = await requestNonce(address)

      // Step 2: Create SIWE message
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: 'Sign in to LearnFi with Ethereum',
        uri: window.location.origin,
        version: '1',
        chainId: 8453, // Base Mainnet
        nonce,
      })

      const messageString = message.prepareMessage()

      // Step 3: Sign message
      const signature = await signMessageAsync({ message: messageString })

      // Step 4: Verify and get tokens
      const tokenResponse = await verifySignature({
        address,
        signature,
        message: messageString,
      })

      // Step 5: Store tokens
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokenResponse.access_token)
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokenResponse.refresh_token)
      setUser(tokenResponse.user)

      toast.success('Successfully signed in!')
      return true
    } catch (error: any) {
      console.error('Authentication error:', error)
      toast.error(error.response?.data?.detail || 'Failed to authenticate')
      disconnect()
      return false
    } finally {
      setIsAuthenticating(false)
    }
  }

  const signOut = () => {
    disconnect()
    logout()
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
    toast.success('Signed out successfully')
  }

  return {
    user,
    isAuthenticated,
    isAuthenticating,
    authenticate,
    signOut,
  }
}

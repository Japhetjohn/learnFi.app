import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter as Router } from 'react-router-dom'
import { config } from './lib/wagmi-config'
import { Toaster } from 'sonner'
import '@/styles/index.css'

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="min-h-screen bg-light-primary dark:bg-dark-primary">
            <div className="container-custom py-16">
              <h1 className="text-5xl font-display font-bold text-gradient text-center mb-4">
                🚀 LearnFi Platform
              </h1>
              <p className="text-center text-xl text-text-light-secondary dark:text-text-dark-secondary mb-12">
                Own your Web3 education. Learn. Build. Earn.
              </p>

              <div className="flex justify-center gap-4">
                <button className="btn btn-primary">
                  Connect Wallet
                </button>
                <button className="btn btn-secondary">
                  Explore Courses
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
                <div className="card">
                  <h3 className="text-xl font-bold mb-2">Learn</h3>
                  <p className="text-text-light-tertiary dark:text-text-dark-tertiary">
                    Complete courses and earn XP
                  </p>
                </div>
                <div className="card">
                  <h3 className="text-xl font-bold mb-2">Build</h3>
                  <p className="text-text-light-tertiary dark:text-text-dark-tertiary">
                    Submit tasks and get verified
                  </p>
                </div>
                <div className="card">
                  <h3 className="text-xl font-bold mb-2">Earn</h3>
                  <p className="text-text-light-tertiary dark:text-text-dark-tertiary">
                    Mint NFT certificates and tokens
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Router>
        <Toaster position="top-right" />
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App

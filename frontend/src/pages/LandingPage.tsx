import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/stores/authStore'

export function LandingPage() {
  const { isAuthenticated } = useAuthStore()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-500 via-purple-600 to-accent-500 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>

        <div className="container relative mx-auto px-4 py-24 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Learn Web3.
              <br />
              <span className="bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                Earn Rewards.
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
              Master blockchain development through hands-on courses, complete tasks, earn XP, and get rewarded with tokens and NFT certificates.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              {isAuthenticated ? (
                <Link to="/courses">
                  <Button size="xl" variant="secondary" className="min-w-[200px]">
                    Browse Courses
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/courses">
                    <Button size="xl" variant="secondary" className="min-w-[200px]">
                      Explore Courses
                    </Button>
                  </Link>
                  <Button size="xl" variant="outline" className="min-w-[200px] bg-white/10 hover:bg-white/20 border-white/30 text-white">
                    Learn More
                  </Button>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-12">
              <div>
                <div className="text-4xl font-bold">50+</div>
                <div className="text-white/80 text-sm">Courses</div>
              </div>
              <div>
                <div className="text-4xl font-bold">10K+</div>
                <div className="text-white/80 text-sm">Learners</div>
              </div>
              <div>
                <div className="text-4xl font-bold">$2M+</div>
                <div className="text-white/80 text-sm">Earned</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-light-primary dark:bg-dark-primary">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why LearnFi?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              The most rewarding way to learn blockchain development
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <Card className="border-2 hover:border-primary-500 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🎓</span>
                </div>
                <CardTitle>Learn by Doing</CardTitle>
                <CardDescription>
                  Complete real-world tasks and projects. No boring lectures - just hands-on building.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 2 */}
            <Card className="border-2 hover:border-primary-500 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">💰</span>
                </div>
                <CardTitle>Earn Real Rewards</CardTitle>
                <CardDescription>
                  Get LEARN tokens for completing courses. Redeem for perks or stake for passive income.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 3 */}
            <Card className="border-2 hover:border-primary-500 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🏆</span>
                </div>
                <CardTitle>Prove Your Skills</CardTitle>
                <CardDescription>
                  Earn NFT certificates that showcase your achievements on-chain forever.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 4 */}
            <Card className="border-2 hover:border-primary-500 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🎮</span>
                </div>
                <CardTitle>Gamified XP System</CardTitle>
                <CardDescription>
                  Level up, climb the leaderboard, and unlock exclusive content as you learn.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 5 */}
            <Card className="border-2 hover:border-primary-500 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🔒</span>
                </div>
                <CardTitle>Token-Gated Access</CardTitle>
                <CardDescription>
                  Premium courses require LEARN tokens - aligning incentives and ensuring quality.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 6 */}
            <Card className="border-2 hover:border-primary-500 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">💼</span>
                </div>
                <CardTitle>Job Opportunities</CardTitle>
                <CardDescription>
                  Get matched with Web3 companies looking for skilled developers like you.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gray-50 dark:bg-dark-surface">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Your journey to Web3 mastery in 4 simple steps
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {[
              {
                step: '1',
                title: 'Connect Your Wallet',
                description: 'Sign in with your Web3 wallet - no password needed.',
              },
              {
                step: '2',
                title: 'Choose Your Path',
                description: 'Browse courses from beginner to expert across DeFi, NFTs, DAOs, and more.',
              },
              {
                step: '3',
                title: 'Complete Tasks & Earn XP',
                description: 'Build real projects, submit tasks, and watch your XP grow.',
              },
              {
                step: '4',
                title: 'Claim Rewards',
                description: 'Collect LEARN tokens and NFT certificates. Stake, trade, or use them to unlock premium content.',
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {item.step}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary-500 to-accent-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Start Learning?
          </h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Join thousands of developers earning while they learn Web3 development
          </p>
          <Link to="/courses">
            <Button size="xl" variant="secondary" className="min-w-[250px]">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

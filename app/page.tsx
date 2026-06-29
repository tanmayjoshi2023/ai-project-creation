import { getSession } from '@/lib/auth-helpers'
import { DashboardHeader } from '@/components/dashboard-header'
import { CompanySearchBar } from '@/components/company-search'
import { AnalysisList } from '@/components/analysis-list'
import { Button } from '@/components/ui/button'
import { ArrowRight, TrendingUp, Zap, Shield, BarChart3 } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'InvestIQ - AI-Powered Investment Research',
  description: 'Get intelligent investment analysis in under 90 seconds powered by advanced AI agents',
}

export default async function HomePage() {
  const session = await getSession()

  // Show dashboard if authenticated
  if (session?.user) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader user={session.user} />
        <main className="container mx-auto max-w-6xl px-4 py-8">
          <div className="space-y-8">
            <div className="space-y-4">
              <div>
                <h1 className="text-4xl font-bold">Investment Analysis</h1>
                <p className="text-lg text-muted-foreground mt-2">
                  Get AI-powered investment research in under 90 seconds
                </p>
              </div>
              <CompanySearchBar />
            </div>

            <AnalysisList />
          </div>
        </main>
      </div>
    )
  }

  // Show landing page if not authenticated
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="container mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold">InvestIQ</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto max-w-6xl px-4 py-20 space-y-12">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            Investment Research at the Speed of AI
          </h1>
          <p className="text-xl text-muted-foreground">
            Get comprehensive investment analysis powered by 8 specialized AI agents in under 90 seconds. Make informed decisions with confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/sign-up">
              <Button size="lg" className="gap-2 text-base h-12">
                Start Free <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline" className="text-base h-12">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div id="features" className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 py-12 scroll-mt-20">
          {[
            {
              icon: Zap,
              title: '8 AI Agents',
              description: 'Specialized financial analysis from multiple perspectives',
            },
            {
              icon: BarChart3,
              title: 'Real-time Analysis',
              description: 'Latest market data and company financials',
            },
            {
              icon: Shield,
              title: 'Verified Facts',
              description: 'Every claim backed by credible sources',
            },
            {
              icon: TrendingUp,
              title: '90 Seconds',
              description: 'Complete analysis faster than manual research',
            },
          ].map((feature, idx) => {
            const Icon = feature.icon
            return (
              <div key={idx} className="p-6 rounded-xl bg-card border border-border/50 hover:border-primary/50 transition-all hover:shadow-md">
                <Icon className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* How It Works */}
      <section id="research" className="bg-muted/30 py-20 scroll-mt-20">
        <div className="container mx-auto max-w-6xl px-4 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI system analyzes investments from multiple angles to give you a complete picture
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { number: '1', title: 'Search', description: 'Enter any ticker symbol' },
              { number: '2', title: 'Analyze', description: '8 agents analyze from different angles' },
              { number: '3', title: 'Verify', description: 'Judge agent validates all claims' },
              { number: '4', title: 'Decide', description: 'Get a clear BUY/HOLD/PASS verdict' },
            ].map((step, idx) => (
              <div key={idx} className="relative">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-xl font-bold text-primary mx-auto">
                    {step.number}
                  </div>
                  <h3 className="font-semibold text-lg">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
                {idx < 3 && (
                  <ArrowRight className="hidden md:block absolute -right-4 top-5 w-8 h-8 text-muted-foreground/30" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="pricing" className="container mx-auto max-w-6xl px-4 py-20 scroll-mt-20">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-12 text-center space-y-6">
          <h2 className="text-4xl font-bold">Ready to Invest Smarter?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start your free analysis today and see how AI can transform your investment decisions.
          </p>
          <Link href="/sign-up">
            <Button size="lg" className="gap-2 text-base h-12">
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer id="disclaimer" className="border-t border-border/40 py-12 bg-gradient-to-b from-background to-muted/50 scroll-mt-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-bold text-lg">InvestIQ</h4>
              </div>
              <p className="text-sm text-muted-foreground">AI-powered investment research platform built for smarter decisions</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Product</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#features" className="text-muted-foreground hover:text-primary transition-colors duration-200 font-medium">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="text-muted-foreground hover:text-primary transition-colors duration-200 font-medium">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#research" className="text-muted-foreground hover:text-primary transition-colors duration-200 font-medium">
                    How It Works
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Company</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#about" className="text-muted-foreground hover:text-primary transition-colors duration-200 font-medium">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#blog" className="text-muted-foreground hover:text-primary transition-colors duration-200 font-medium">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#contact" className="text-muted-foreground hover:text-primary transition-colors duration-200 font-medium">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#privacy" className="text-muted-foreground hover:text-primary transition-colors duration-200 font-medium">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#terms" className="text-muted-foreground hover:text-primary transition-colors duration-200 font-medium">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#disclaimer" className="text-muted-foreground hover:text-primary transition-colors duration-200 font-medium">
                    Disclaimer
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/40 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-muted-foreground text-center md:text-left">
                &copy; 2026 InvestIQ. All rights reserved. Not financial advice. Always consult a licensed financial advisor.
              </p>
              <div className="flex gap-6">
                <a href="#twitter" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">
                  Twitter
                </a>
                <a href="#linkedin" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">
                  LinkedIn
                </a>
                <a href="#github" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth-helpers'
import { DashboardHeader } from '@/components/dashboard-header'
import { Disclaimer } from '@/components/disclaimer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, BarChart3, Shield, Zap, TrendingUp } from 'lucide-react'

export const metadata = {
  title: 'Research - InvestIQ',
  description: 'AI-powered investment research analysis',
}

const steps = [
  { title: 'Search', description: 'Enter any publicly traded company ticker' },
  { title: 'Analyze', description: '8 AI agents analyze financials, news, and competitors' },
  { title: 'Verify', description: 'Judge and verifier agents validate every claim' },
  { title: 'Decide', description: 'Get a clear BUY, HOLD, or PASS verdict' },
]

const features = [
  { icon: Zap, text: 'Live streaming analysis with 8 specialized AI agents' },
  { icon: Shield, text: 'Source-backed claims with citations' },
  { icon: BarChart3, text: 'Complete analysis in under 90 seconds' },
  { icon: TrendingUp, text: 'Bull vs Bear debate before final verdict' },
]

export default async function ResearchPage() {
  const session = await getSession()

  if (!session?.user) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={session.user} />
      <main className="container mx-auto max-w-6xl px-4 py-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Investment Research</h1>
          <p className="text-lg text-muted-foreground">
            AI-powered analysis with real-time agent insights
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                {steps.map((step, idx) => (
                  <li key={step.title} className="flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue text-sm font-bold">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-foreground">{step.title}</p>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {features.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-blue/10">
                      <Icon className="h-4 w-4 text-brand-blue" />
                    </div>
                    <span className="text-sm text-foreground/80 pt-1">{text}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="border-brand-blue/20 bg-linear-to-r from-brand-blue/5 to-brand-gold/5">
          <CardContent className="pt-6 text-center space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Start Your Analysis</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Search for any company from your dashboard to launch a full AI investment analysis.
            </p>
            <Button size="lg" className="gap-2" nativeButton={false} render={
              <Link href="/">
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            } />
          </CardContent>
        </Card>

        <Disclaimer />
      </main>
    </div>
  )
}

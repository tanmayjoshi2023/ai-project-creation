import Link from 'next/link'
import { getSession } from '@/lib/auth-helpers'
import { DashboardHeader } from '@/components/dashboard-header'
import { Button } from '@/components/ui/button'
import { ArrowRight, Shield, TrendingUp, Zap, BarChart3 } from 'lucide-react'

export const metadata = {
  title: 'Pricing - InvestIQ',
  description: 'Choose the right InvestIQ plan and unlock unlimited AI investment analysis',
}

const plans = [
  {
    title: 'Starter',
    price: '$9',
    description: 'Perfect for occasional investors who want fast AI analysis.',
    features: ['Monthly analysis cap: 5', 'Basic score breakdown', 'Email support'],
  },
  {
    title: 'Growth',
    price: '$19',
    description: 'For active investors who want more frequent insights.',
    features: ['Monthly analysis cap: 25', 'Premium scoring insights', 'Priority email support'],
    highlight: true,
  },
  {
    title: 'Pro',
    price: '$29',
    description: 'Best for power users who run frequent investment research.',
    features: ['Unlimited analyses', 'Advanced source verification', 'Dedicated support'],
  },
]

export default async function PricingPage() {
  const session = await getSession()

  return (
    <div className="min-h-screen bg-background">
      {session?.user ? (
        <DashboardHeader user={session.user} />
      ) : (
        <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur border-b border-border/40">
          <div className="container mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">InvestIQ</span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/sign-in">Sign In</Link>} />
              <Button size="sm" nativeButton={false} render={<Link href="/sign-up">Get Started</Link>} />
            </div>
          </div>
        </nav>
      )}

      <main className="container mx-auto max-w-6xl px-4 py-20 space-y-12">
        <section className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-sm text-primary">
            <Zap className="w-4 h-4" />
            Upgrade and unlock more analyses
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl font-bold">Choose the right plan for your investing workflow</h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Upgrade your InvestIQ account to access more analyses, deeper scoring, and premium support.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" className="gap-2" nativeButton={false} render={<Link href="/sign-up">Create Account</Link>} />
            <Button variant="outline" size="lg" className="gap-2" nativeButton={false} render={<Link href="/sign-in">Already have an account?</Link>} />
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.title}
              className={`rounded-3xl border p-8 shadow-sm transition-all duration-200 ${
                plan.highlight ? 'border-primary bg-primary/5 shadow-primary/10' : 'border-border bg-card'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">{plan.title}</p>
                  <p className="text-4xl font-bold mt-4">{plan.price}</p>
                </div>
                {plan.highlight && (
                  <span className="rounded-full bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold">Most popular</span>
                )}
              </div>
              <p className="mt-6 text-sm text-muted-foreground">{plan.description}</p>
              <ul className="mt-8 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-3 text-sm text-foreground">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <Button
                  size="lg"
                  className="w-full"
                  nativeButton={false}
                  render={
                    <Link href={session?.user ? '/sign-up' : '/sign-up'}>
                      {plan.title === 'Pro' ? 'Get Pro' : plan.title === 'Growth' ? 'Get Growth' : 'Get Starter'}
                    </Link>
                  }
                />
              </div>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-2 rounded-3xl border border-border/50 bg-card p-8">
          <div>
            <h2 className="text-2xl font-semibold">Why upgrade?</h2>
            <p className="mt-4 text-muted-foreground">
              Investing smarter means fewer limits. With a paid plan, you can run more analyses, access expanded scoring details, and get faster insights from the AI pipeline.
            </p>
          </div>
          <div className="space-y-4">
            {[
              'Unlimited access to AI analysis on Pro',
              'More detailed scoring and risk insights',
              'Priority support and faster results',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 text-foreground">
                <Shield className="mt-1 h-5 w-5 text-primary" />
                <p>{item}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth-helpers'
import { DashboardHeader } from '@/components/dashboard-header'
import { AnalyzeForm } from '@/components/analyze-form'
import { companies } from '@/lib/company-data'

export const metadata = {
  title: 'Analyze Company - InvestIQ',
  description: 'Get AI-powered investment analysis',
}

export default async function AnalyzePage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker: rawTicker } = await params
  const session = await getSession()

  if (!session?.user) {
    redirect('/sign-in')
  }

  const ticker = rawTicker.toUpperCase()
  const company = companies.find((c) => c.ticker === ticker)

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={session.user} />
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <AnalyzeForm ticker={ticker} company={company} />
      </main>
    </div>
  )
}

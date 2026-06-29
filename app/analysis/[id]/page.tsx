import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth-helpers'
import { getAnalysisWithAgents } from '@/app/actions/analyses'
import { getCompany } from '@/app/actions/companies'
import { DashboardHeader } from '@/components/dashboard-header'
import { AnalysisDetailView } from '@/components/analysis-detail-view'
import { StreamingAnalysis } from '@/components/streaming-analysis'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  return {
    title: `Analysis ${id.slice(0, 8)} - InvestIQ`,
    description: 'AI-powered investment analysis with BUY/HOLD/PASS verdict',
    openGraph: {
      title: 'InvestIQ Analysis',
      description: 'AI investment research with source-backed reasoning',
      type: 'website',
    },
  }
}

export default async function AnalysisPage({ params }: Props) {
  const { id } = await params
  const session = await getSession()

  if (!session?.user) {
    redirect('/sign-in')
  }

  const analysis = await getAnalysisWithAgents(id)

  if (!analysis) {
    redirect('/')
  }

  const company = await getCompany(analysis.ticker)
  const isLive = analysis.status === 'pending' || analysis.status === 'processing'

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={session.user} />
      <main className="container mx-auto max-w-6xl px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="gap-2" nativeButton={false} render={
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            } />
          </div>

          {isLive ? (
            <StreamingAnalysis
              analysisId={analysis.id}
              ticker={analysis.ticker}
              companyName={company?.name}
              sector={company?.sector ?? undefined}
              initialStatus={analysis.status}
              autoStart
            />
          ) : (
            <AnalysisDetailView analysis={analysis} companyName={company?.name} />
          )}
        </div>
      </main>
    </div>
  )
}

import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth-helpers'
import { DashboardHeader } from '@/components/dashboard-header'
import CompareClient from './compare-client'

export const metadata = {
  title: 'Compare Companies - InvestIQ',
  description: 'Compare two companies side-by-side with AI-generated investment analysis',
}

export default async function ComparePage() {
  const session = await getSession()

  if (!session?.user) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={session.user} />
      <main className="container mx-auto max-w-6xl px-4 py-8">
        <CompareClient />
      </main>
    </div>
  )
}

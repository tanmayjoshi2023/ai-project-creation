'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getAnalyses } from '@/app/actions/analyses'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { VerdictBadge } from '@/components/ui/verdict-badge'
import { TrendingUp, Clock, AlertCircle } from 'lucide-react'

interface AnalysisSummary {
  id: string
  ticker: string
  status: string
  verdict?: 'BUY' | 'HOLD' | 'PASS' | null
  confidence?: number | null
  summary?: string | null
  createdAt: Date
}

export function AnalysisList() {
  const [analyses, setAnalyses] = useState<AnalysisSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAnalyses()
  }, [])

  async function loadAnalyses() {
    try {
      const data = await getAnalyses(10)
      setAnalyses(data)
    } catch {
      setAnalyses([])
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Recent Analyses</h2>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-5 bg-muted rounded w-16 mb-2" />
                <div className="h-3 bg-muted rounded w-24" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Recent Analyses</h2>

      {analyses.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-3 py-6">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto opacity-50" />
              <p className="text-muted-foreground">No analyses yet. Start by searching for a company!</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {analyses.map((analysis) => (
            <Link key={analysis.id} href={`/analysis/${analysis.id}`} className="group">
              <Card className="cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {analysis.ticker}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {new Date(analysis.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </CardDescription>
                    </div>
                    {analysis.verdict && (
                      <VerdictBadge
                        verdict={analysis.verdict}
                        variant="subtle"
                        size="sm"
                        confidence={
                          analysis.confidence ? Math.round(analysis.confidence * 100) : undefined
                        }
                      />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {analysis.summary && (
                      <p className="text-muted-foreground line-clamp-2">{analysis.summary}</p>
                    )}

                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                      {analysis.status === 'completed' && (
                        <>
                          <TrendingUp className="h-4 w-4 text-verdict-success" />
                          <span>Analysis complete</span>
                        </>
                      )}
                      {analysis.status === 'processing' && (
                        <>
                          <Clock className="h-4 w-4 animate-spin" />
                          <span>Processing...</span>
                        </>
                      )}
                      {analysis.status === 'pending' && (
                        <>
                          <Clock className="h-4 w-4" />
                          <span>Pending</span>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

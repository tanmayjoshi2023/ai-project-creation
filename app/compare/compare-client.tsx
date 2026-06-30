'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CompanySearchAutocomplete } from '@/components/company-search-autocomplete'
import { VerdictBadge } from '@/components/ui/verdict-badge'
import { DebateView } from '@/components/debate-view'
import { Disclaimer } from '@/components/disclaimer'
import { Scale, Loader2, ArrowLeftRight, Check, AlertTriangle, ShieldCheck } from 'lucide-react'
import type { OrchestratorState, Verdict } from '@/lib/agent/types'

interface Company {
  symbol: string
  name: string
  region: string
}

interface CompareData {
  company1: {
    ticker: string
    name: string
    analysis: OrchestratorState | null
    error: string | null
  }
  company2: {
    ticker: string
    name: string
    analysis: OrchestratorState | null
    error: string | null
  }
}

export function CompareClient() {
  const [comp1, setComp1] = useState<Company | null>(null)
  const [comp2, setComp2] = useState<Company | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [compareData, setCompareData] = useState<CompareData | null>(null)

  const handleCompare = async () => {
    if (!comp1 || !comp2) return
    setIsLoading(true)
    setError(null)
    setCompareData(null)

    try {
      const response = await fetch('/api/analysis/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker1: comp1.symbol,
          ticker2: comp2.symbol,
        }),
      })

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}))
        throw new Error(errJson.error?.message || 'Failed to compare companies')
      }

      const json = await response.json()
      if (json.success) {
        setCompareData(json.data)
      } else {
        throw new Error(json.error?.message || 'Comparison failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during comparison')
    } finally {
      setIsLoading(false)
    }
  }

  // Helpers for mapping debate points
  const getDebatePoints = (args?: string | null) => {
    if (!args) return []
    return args.split('\n').filter(Boolean).map((point) => ({
      point,
      sourceIndex: 0,
      specificity: 4,
      severity: 4,
    }))
  }

  return (
    <div className="space-y-8">
      {/* Search and Selector Panel */}
      <Card className="p-6">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <Scale className="h-6 w-6 text-brand-blue" />
            Stock Comparison
          </CardTitle>
          <CardDescription>
            Select two stocks to run parallel multi-agent analyses and compare verdicts
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">First Stock</label>
              <CompanySearchAutocomplete onSelect={setComp1} />
              {comp1 && (
                <p className="text-xs text-muted-foreground">
                  Selected: <span className="font-semibold">{comp1.symbol}</span> — {comp1.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Second Stock</label>
              <CompanySearchAutocomplete onSelect={setComp2} />
              {comp2 && (
                <p className="text-xs text-muted-foreground">
                  Selected: <span className="font-semibold">{comp2.symbol}</span> — {comp2.name}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <Button
              onClick={handleCompare}
              disabled={!comp1 || !comp2 || isLoading}
              size="lg"
              className="gap-2 px-8 min-w-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <ArrowLeftRight className="h-5 w-5" />
                  Compare Investments
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="mt-6 p-4 rounded-lg bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-900 text-sm text-red-800 dark:text-red-200 flex gap-2">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comparison Loading State */}
      {isLoading && (
        <div className="text-center py-16 space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-brand-blue mx-auto" />
          <p className="text-muted-foreground text-sm">
            8 AI agents are analyzing both stocks in parallel. This may take up to 30 seconds...
          </p>
        </div>
      )}

      {/* Comparison Results */}
      {compareData && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Verdict Overview Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Stock 1 Verdict */}
            <Card className="overflow-hidden border border-border shadow-md">
              <div className="p-6 bg-linear-to-b from-muted/30 to-transparent flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50">
                <div>
                  <h3 className="text-2xl font-bold text-foreground">{compareData.company1.ticker}</h3>
                  <p className="text-sm text-muted-foreground">{compareData.company1.name}</p>
                </div>
                {compareData.company1.analysis ? (
                  <VerdictBadge
                    verdict={compareData.company1.analysis.verdict as Verdict}
                    confidence={Math.round((compareData.company1.analysis.confidence || 0.75) * 100)}
                    size="lg"
                    variant="glow"
                  />
                ) : (
                  <span className="text-sm text-red-500">Analysis Failed</span>
                )}
              </div>
              <CardContent className="p-6">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {compareData.company1.analysis?.summary || 'No summary available.'}
                </p>
              </CardContent>
            </Card>

            {/* Stock 2 Verdict */}
            <Card className="overflow-hidden border border-border shadow-md">
              <div className="p-6 bg-linear-to-b from-muted/30 to-transparent flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50">
                <div>
                  <h3 className="text-2xl font-bold text-foreground">{compareData.company2.ticker}</h3>
                  <p className="text-sm text-muted-foreground">{compareData.company2.name}</p>
                </div>
                {compareData.company2.analysis ? (
                  <VerdictBadge
                    verdict={compareData.company2.analysis.verdict as Verdict}
                    confidence={Math.round((compareData.company2.analysis.confidence || 0.75) * 100)}
                    size="lg"
                    variant="glow"
                  />
                ) : (
                  <span className="text-sm text-red-500">Analysis Failed</span>
                )}
              </div>
              <CardContent className="p-6">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {compareData.company2.analysis?.summary || 'No summary available.'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Metrics Comparison Grid */}
          <Card className="p-6 shadow-md">
            <h3 className="text-xl font-bold mb-6 text-foreground">Score Breakdown comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-3 px-4 font-semibold text-muted-foreground">Dimension / Metric</th>
                    <th className="py-3 px-4 font-semibold text-center text-foreground">{compareData.company1.ticker}</th>
                    <th className="py-3 px-4 font-semibold text-center text-foreground">{compareData.company2.ticker}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-foreground">Composite Score (Opportunity)</td>
                    <td className="py-3.5 px-4 text-center font-bold text-brand-blue">
                      {compareData.company1.analysis?.compositeScore || '—'}/100
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-brand-blue">
                      {compareData.company2.analysis?.compositeScore || '—'}/100
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-medium text-foreground">Financial Health Score</td>
                    <td className="py-3.5 px-4 text-center text-foreground">
                      {compareData.company1.analysis?.explainability?.scores?.financial ?? '—'}/100
                    </td>
                    <td className="py-3.5 px-4 text-center text-foreground">
                      {compareData.company2.analysis?.explainability?.scores?.financial ?? '—'}/100
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-medium text-foreground">Market Position Score</td>
                    <td className="py-3.5 px-4 text-center text-foreground">
                      {compareData.company1.analysis?.explainability?.scores?.market ?? '—'}/100
                    </td>
                    <td className="py-3.5 px-4 text-center text-foreground">
                      {compareData.company2.analysis?.explainability?.scores?.market ?? '—'}/100
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-medium text-foreground">Sentiment Score</td>
                    <td className="py-3.5 px-4 text-center text-foreground">
                      {compareData.company1.analysis?.explainability?.scores?.sentiment ?? '—'}/100
                    </td>
                    <td className="py-3.5 px-4 text-center text-foreground">
                      {compareData.company2.analysis?.explainability?.scores?.sentiment ?? '—'}/100
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-medium text-foreground">Competitive Score</td>
                    <td className="py-3.5 px-4 text-center text-foreground">
                      {compareData.company1.analysis?.explainability?.scores?.competition ?? '—'}/100
                    </td>
                    <td className="py-3.5 px-4 text-center text-foreground">
                      {compareData.company2.analysis?.explainability?.scores?.competition ?? '—'}/100
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-medium text-foreground">Risk Score (Inverted)</td>
                    <td className="py-3.5 px-4 text-center text-red-600 dark:text-red-400 font-semibold">
                      {compareData.company1.analysis?.riskScore ?? '—'}/100
                    </td>
                    <td className="py-3.5 px-4 text-center text-red-600 dark:text-red-400 font-semibold">
                      {compareData.company2.analysis?.riskScore ?? '—'}/100
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-medium text-foreground">Source Grounding Score</td>
                    <td className="py-3.5 px-4 text-center text-foreground">
                      {compareData.company1.analysis?.groundingScore ? `${Math.round(compareData.company1.analysis.groundingScore * 100)}%` : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-center text-foreground">
                      {compareData.company2.analysis?.groundingScore ? `${Math.round(compareData.company2.analysis.groundingScore * 100)}%` : '—'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-medium text-foreground">Total Execution Time</td>
                    <td className="py-3.5 px-4 text-center text-muted-foreground">
                      {compareData.company1.analysis?.totalExecutionTimeMs ? `${(compareData.company1.analysis.totalExecutionTimeMs / 1000).toFixed(1)}s` : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-center text-muted-foreground">
                      {compareData.company2.analysis?.totalExecutionTimeMs ? `${(compareData.company2.analysis.totalExecutionTimeMs / 1000).toFixed(1)}s` : '—'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* Parallel Debate Arena Views */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-foreground">Individual Debate Arenas</h3>
            
            {compareData.company1.analysis && (
              <div className="border border-border/60 rounded-xl p-6 bg-card/40">
                <div className="flex items-center gap-2 mb-6">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <h4 className="text-lg font-bold text-foreground">{compareData.company1.ticker} Debate Detail</h4>
                </div>
                <DebateView
                  ticker={compareData.company1.ticker}
                  companyName={compareData.company1.name}
                  bullPoints={getDebatePoints(compareData.company1.analysis.bullArguments)}
                  bearPoints={getDebatePoints(compareData.company1.analysis.bearArguments)}
                  bullConfidence={78}
                  bearConfidence={68}
                  verdict={compareData.company1.analysis.verdict as Verdict}
                  confidence={Math.round((compareData.company1.analysis.confidence || 0.75) * 100)}
                  reasoning={compareData.company1.analysis.summary || ''}
                  citations={(compareData.company1.analysis.explainability?.sources || []).map((s) => ({
                    title: s.title,
                    url: s.url,
                    type: s.type,
                  }))}
                />
              </div>
            )}

            {compareData.company2.analysis && (
              <div className="border border-border/60 rounded-xl p-6 bg-card/40">
                <div className="flex items-center gap-2 mb-6">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <h4 className="text-lg font-bold text-foreground">{compareData.company2.ticker} Debate Detail</h4>
                </div>
                <DebateView
                  ticker={compareData.company2.ticker}
                  companyName={compareData.company2.name}
                  bullPoints={getDebatePoints(compareData.company2.analysis.bullArguments)}
                  bearPoints={getDebatePoints(compareData.company2.analysis.bearArguments)}
                  bullConfidence={78}
                  bearConfidence={68}
                  verdict={compareData.company2.analysis.verdict as Verdict}
                  confidence={Math.round((compareData.company2.analysis.confidence || 0.75) * 100)}
                  reasoning={compareData.company2.analysis.summary || ''}
                  citations={(compareData.company2.analysis.explainability?.sources || []).map((s) => ({
                    title: s.title,
                    url: s.url,
                    type: s.type,
                  }))}
                />
              </div>
            )}
          </div>
        </div>
      )}

      <Disclaimer />
    </div>
  )
}

export default CompareClient

'use client'

import React, { useMemo } from 'react'
import { VerdictCard } from '@/components/verdict-card'
import { DebateView } from '@/components/debate-view'
import { AgentProgressBar } from '@/components/agent-progress-bar'
import { ThoughtStream } from '@/components/thought-stream'
import { ReasoningList } from '@/components/reasoning-list'
import { MetricsGrid } from '@/components/metrics-grid'
import { RiskMatrix } from '@/components/risk-matrix'
import { ExplainabilityPanelComponent } from '@/components/explainability-panel'
import { Disclaimer } from '@/components/disclaimer'
import type { ExplainabilityPanel, Verdict } from '@/lib/agent/types'

interface AgentExecution {
  id: string
  agentName: string
  agentType: string
  output: string | null
  confidence: number | null
  executionTimeMs: number | null
  createdAt: Date
}

interface AnalysisRecord {
  id: string
  ticker: string
  companyId: string
  status: string
  verdict?: 'BUY' | 'HOLD' | 'PASS' | null
  confidence?: number | null
  summary?: string | null
  bullArguments?: string | null
  bearArguments?: string | null
  riskScore?: number | null
  opportunityScore?: number | null
  reasoning?: string | null
  createdAt: Date
  agents?: AgentExecution[]
}

interface AnalysisDetailViewProps {
  analysis: AnalysisRecord
  companyName?: string
}

export function AnalysisDetailView({ analysis, companyName }: AnalysisDetailViewProps) {
  const [viewMode, setViewMode] = React.useState<'standard' | 'debate'>('standard')
  const verdictType = (analysis.verdict || 'HOLD') as Verdict
  const confidencePct = Math.round((analysis.confidence ?? 0.75) * 100)

  const explainability: ExplainabilityPanel | null = useMemo(() => {
    if (!analysis.reasoning) return null
    try {
      return JSON.parse(analysis.reasoning) as ExplainabilityPanel
    } catch {
      return null
    }
  }, [analysis.reasoning])

  const agentNodes = useMemo(
    () =>
      (analysis.agents || []).map((exec) => ({
        name: exec.agentName,
        status: 'complete' as const,
        duration: exec.executionTimeMs ?? undefined,
      })),
    [analysis.agents]
  )

  const thoughts = useMemo(
    () =>
      (analysis.agents || []).map((exec, idx) => ({
        id: `${exec.agentName}-${idx}`,
        agent: exec.agentName,
        type: 'research' as const,
        content: exec.output || 'No output',
        timestamp: new Date(exec.createdAt),
      })),
    [analysis.agents]
  )

  const bullish = useMemo(() => {
    if (!analysis.bullArguments) return []
    return analysis.bullArguments.split('\n').filter(Boolean).map((point, i) => ({
      id: `bull-${i}`,
      type: 'bullish' as const,
      point,
      confidence: confidencePct,
      sources: [],
    }))
  }, [analysis.bullArguments, confidencePct])

  const bearish = useMemo(() => {
    if (!analysis.bearArguments) return []
    return analysis.bearArguments.split('\n').filter(Boolean).map((point, i) => ({
      id: `bear-${i}`,
      type: 'bearish' as const,
      point,
      confidence: Math.round(confidencePct * 0.85),
      sources: [],
    }))
  }, [analysis.bearArguments, confidencePct])

  const bullConfidence = useMemo(() => {
    const agent = (analysis.agents || []).find((a) => a.agentType === 'bull')
    return agent?.confidence ? Math.round(agent.confidence * 100) : 75
  }, [analysis.agents])

  const bearConfidence = useMemo(() => {
    const agent = (analysis.agents || []).find((a) => a.agentType === 'bear')
    return agent?.confidence ? Math.round(agent.confidence * 100) : 70
  }, [analysis.agents])

  const debateBullPoints = useMemo(() => {
    return bullish.map((b) => ({
      point: b.point,
      sourceIndex: 0,
      specificity: 4,
    }))
  }, [bullish])

  const debateBearPoints = useMemo(() => {
    return bearish.map((b) => ({
      point: b.point,
      sourceIndex: 0,
      severity: 4,
    }))
  }, [bearish])

  const citationsForDebate = useMemo(() => {
    return (explainability?.sources || []).map((s) => ({
      title: s.title,
      url: s.url,
      type: s.type,
    }))
  }, [explainability])

  const metrics = [
    { label: 'Composite Score', value: explainability?.scores.composite ?? analysis.opportunityScore ?? '—', unit: explainability ? '/100' : '' },
    { label: 'Risk Score', value: analysis.riskScore ?? '—', unit: '/100' },
    { label: 'Confidence', value: confidencePct, unit: '%', trend: 'up' as const },
    { label: 'Analyzed', value: new Date(analysis.createdAt).toLocaleDateString(), unit: '' },
  ]

  const risks = [
    {
      name: 'Market Risk',
      likelihood: Math.round((analysis.riskScore ?? 50) * 0.6),
      impact: Math.round((analysis.riskScore ?? 50) * 0.5),
      mitigation: 'Monitor macro conditions and sector trends',
    },
    {
      name: 'Company Risk',
      likelihood: Math.round((analysis.riskScore ?? 50) * 0.4),
      impact: Math.round((analysis.riskScore ?? 50) * 0.7),
      mitigation: 'Track earnings and competitive developments',
    },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">{analysis.ticker}</h1>
          {companyName && <p className="text-lg text-muted-foreground">{companyName}</p>}
        </div>

        {/* View Mode Toggle */}
        <div className="inline-flex rounded-lg border border-border p-1 bg-muted/40">
          <button
            onClick={() => setViewMode('standard')}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
              viewMode === 'standard'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Standard View
          </button>
          <button
            onClick={() => setViewMode('debate')}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
              viewMode === 'debate'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Debate Arena
          </button>
        </div>
      </div>

      {viewMode === 'debate' ? (
        <DebateView
          ticker={analysis.ticker}
          companyName={companyName}
          bullPoints={debateBullPoints}
          bearPoints={debateBearPoints}
          bullConfidence={bullConfidence}
          bearConfidence={bearConfidence}
          verdict={verdictType}
          confidence={confidencePct}
          reasoning={analysis.summary || ''}
          citations={citationsForDebate}
        />
      ) : (
        <>
          {analysis.verdict && (
            <VerdictCard
              verdict={verdictType}
              confidence={confidencePct}
              summary={analysis.summary || 'Analysis complete.'}
            />
          )}

          {agentNodes.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">Analysis Progress</h2>
              <AgentProgressBar agents={agentNodes} />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">Key Metrics</h2>
                <MetricsGrid metrics={metrics} />
              </div>

              {(bullish.length > 0 || bearish.length > 0) && (
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-4">Bull vs Bear</h2>
                  <ReasoningList bullish={bullish} bearish={bearish} citations={[]} />
                </div>
              )}

              {explainability && <ExplainabilityPanelComponent explainability={explainability} />}
            </div>

            <div className="space-y-6">
              {thoughts.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-4">Agent Insights</h2>
                  <ThoughtStream thoughts={thoughts} isStreaming={false} />
                </div>
              )}

              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">Risk Assessment</h2>
                <RiskMatrix risks={risks} overallScore={analysis.riskScore ?? 50} />
              </div>
            </div>
          </div>
        </>
      )}

      <Disclaimer />
    </div>
  )
}

export default AnalysisDetailView

'use client'

import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { AgentProgressBar } from '@/components/agent-progress-bar'
import { ThoughtStream } from '@/components/thought-stream'
import { VerdictCard } from '@/components/verdict-card'
import { ExplainabilityPanelComponent } from '@/components/explainability-panel'
import { ReasoningList } from '@/components/reasoning-list'
import { Disclaimer } from '@/components/disclaimer'
import { Card } from '@/components/ui/card'
import { AlertCircle, Loader2 } from 'lucide-react'
import type { ExplainabilityPanel, Verdict } from '@/lib/agent/types'

interface StreamingAnalysisProps {
  analysisId: string
  ticker: string
  companyName?: string
  sector?: string
  autoStart?: boolean
  initialStatus: string
}

interface AgentProgress {
  name: string
  status: 'pending' | 'running' | 'complete' | 'error'
  duration?: number
}

interface Thought {
  id: string
  agent: string
  type: 'research' | 'warning'
  content: string
  timestamp: Date
}

const PIPELINE_AGENTS = [
  'Planner',
  'Financial Analyst',
  'News Analyst',
  'Competitor Analyst',
  'Scoring Engine',
  'Bull Case',
  'Bear Case',
  'Judge',
  'Verifier',
]

export function StreamingAnalysis({
  analysisId,
  ticker,
  companyName,
  sector,
  autoStart = true,
  initialStatus,
}: StreamingAnalysisProps) {
  const router = useRouter()
  const [status, setStatus] = useState<'idle' | 'connecting' | 'streaming' | 'complete' | 'error'>(
    initialStatus === 'completed' ? 'complete' : 'idle'
  )
  const [error, setError] = useState<string | null>(null)
  const [agentProgress, setAgentProgress] = useState<AgentProgress[]>(
    PIPELINE_AGENTS.map((name) => ({ name, status: 'pending' as const }))
  )
  const [thoughts, setThoughts] = useState<Thought[]>([])
  const [currentTicker, setCurrentTicker] = useState(ticker)
  const [currentCompanyName, setCurrentCompanyName] = useState(companyName)
  const [result, setResult] = useState<{
    verdict: Verdict
    confidence: number
    summary: string
    bullArguments: string
    bearArguments: string
    explainability?: ExplainabilityPanel
    riskScore?: number
  } | null>(null)

  const runAnalysis = useCallback(async () => {
    setStatus('connecting')
    setError(null)
    setAgentProgress(PIPELINE_AGENTS.map((name) => ({ name, status: 'pending' })))
    setThoughts([])

    try {
      const response = await fetch('/api/analysis/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker, companyName, sector, analysisId }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        const message =
          err.error?.message || err.error || err.message || `Analysis failed (HTTP ${response.status})`
        throw new Error(typeof message === 'string' ? message : 'Analysis failed')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response stream')

      setStatus('streaming')
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6).trim()
          if (payload === '[DONE]') continue

          try {
            const event = JSON.parse(payload)
            handleStreamEvent(event)
          } catch {
            // skip malformed
          }
        }
      }

      setStatus('complete')
      router.refresh()
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Analysis failed')
    }
  }, [ticker, companyName, sector, analysisId, router])

  function handleStreamEvent(event: { type: string; data: Record<string, unknown> }) {
    if (event.type === 'thought') {
      const { agent, status: thoughtStatus, text, elapsedMs } = event.data as {
        agent: string
        status: string
        text?: string
        elapsedMs?: number
      }

      setAgentProgress((prev) =>
        prev.map((a) => {
          if (a.name !== agent) return a
          if (thoughtStatus === 'running') return { ...a, status: 'running' }
          if (thoughtStatus === 'complete') return { ...a, status: 'complete', duration: elapsedMs }
          if (thoughtStatus === 'error') return { ...a, status: 'error' }
          return a
        })
      )

      if (text) {
        setThoughts((prev) => {
          if (prev.some((t) => t.agent === agent && t.content === text)) {
            return prev
          }
          return [
            ...prev,
            {
              id: `${agent}-${thoughtStatus}-${prev.length}-${Date.now()}`,
              agent,
              type: thoughtStatus === 'error' ? 'warning' as const : 'research' as const,
              content: text,
              timestamp: new Date(),
            },
          ]
        })
      }
    }

    if (event.type === 'start') {
      const data = event.data as { ticker: string; companyName?: string }
      if (data.ticker) setCurrentTicker(data.ticker)
      if (data.companyName) setCurrentCompanyName(data.companyName)
    }

    if (event.type === 'complete') {
      const data = event.data as {
        ticker?: string
        companyName?: string
        verdict: Verdict
        confidence: number
        summary: string
        bullArguments: string
        bearArguments: string
        explainability?: ExplainabilityPanel
        riskScore?: number
      }
      setResult(data)
      if (data.ticker) setCurrentTicker(data.ticker)
      if (data.companyName) setCurrentCompanyName(data.companyName)
      setAgentProgress((prev) => prev.map((a) => ({ ...a, status: 'complete' as const })))
    }

    if (event.type === 'error') {
      setError((event.data as { message: string }).message)
      setStatus('error')
    }
  }

  useEffect(() => {
    if (autoStart && initialStatus !== 'completed' && status === 'idle') {
      runAnalysis()
    }
  }, [autoStart, initialStatus, status, runAnalysis])

  const bullishPoints = useMemo(() => {
    if (!result?.bullArguments) return []
    return result.bullArguments.split('\n').filter(Boolean).map((point, i) => ({
      id: `bull-${i}`,
      type: 'bullish' as const,
      point,
      confidence: Math.round((result.confidence ?? 0.75) * 100),
      sources: [],
    }))
  }, [result])

  const bearishPoints = useMemo(() => {
    if (!result?.bearArguments) return []
    return result.bearArguments.split('\n').filter(Boolean).map((point, i) => ({
      id: `bear-${i}`,
      type: 'bearish' as const,
      point,
      confidence: Math.round((result.confidence ?? 0.75) * 100 * 0.85),
      sources: [],
    }))
  }, [result])

  const isRunning = status === 'connecting' || status === 'streaming'

  return (
    <div className="space-y-6" aria-live="polite" aria-busy={isRunning}>
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">{currentTicker}</h1>
        {currentCompanyName && <p className="text-lg text-muted-foreground">{currentCompanyName}</p>}
      </div>

      {error && (
        <Card className="p-4 border-red-200 bg-red-50 dark:bg-red-950/20 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-800 dark:text-red-200">{error}</p>
            <button
              type="button"
              onClick={runAnalysis}
              className="text-sm text-red-700 underline mt-1"
            >
              Retry analysis
            </button>
          </div>
        </Card>
      )}

      {isRunning && (
        <Card className="p-4 flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-brand-blue" />
          <span className="text-sm text-muted-foreground">
            {status === 'connecting' ? 'Connecting to analysis pipeline...' : 'AI agents analyzing...'}
          </span>
        </Card>
      )}

      <AgentProgressBar agents={agentProgress} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {result && (
            <>
              <VerdictCard
                verdict={result.verdict}
                confidence={Math.round(result.confidence * 100)}
                summary={result.summary}
              />
              <ReasoningList bullish={bullishPoints} bearish={bearishPoints} citations={[]} />
              {result.explainability && (
                <ExplainabilityPanelComponent explainability={result.explainability} />
              )}
            </>
          )}
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-3">Agent Thought Stream</h2>
          <ThoughtStream thoughts={thoughts} isStreaming={isRunning} />
        </div>
      </div>

      <Disclaimer />
    </div>
  )
}

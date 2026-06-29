'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { ExplainabilityPanel } from '@/lib/agent/types'

interface ExplainabilityPanelProps {
  explainability: ExplainabilityPanel
  className?: string
}

function scoreColor(score: number): string {
  if (score > 65) return 'text-verdict-success border-verdict-success/30 bg-green-50 dark:bg-green-950/30'
  if (score >= 40) return 'text-verdict-warning border-verdict-warning/30 bg-amber-50 dark:bg-amber-950/30'
  return 'text-verdict-error border-verdict-error/30 bg-red-50 dark:bg-red-950/30'
}

export function ExplainabilityPanelComponent({ explainability, className = '' }: ExplainabilityPanelProps) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const { weights, scores, sources } = explainability

  const dimensions = [
    { key: 'financial', label: 'Financial Health', weight: weights.financial, score: scores.financial },
    { key: 'market', label: 'Market Position', weight: weights.market, score: scores.market },
    { key: 'sentiment', label: 'Sentiment', weight: weights.sentiment, score: scores.sentiment },
    { key: 'competition', label: 'Competition', weight: weights.competition, score: scores.competition },
    { key: 'risk', label: 'Risk (inverted)', weight: weights.risk, score: scores.risk },
  ] as const

  return (
    <Card className={`p-6 space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Explainability</h2>
        <span className="text-sm font-mono text-muted-foreground">
          Composite: {scores.composite}/100
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {dimensions.map((dim) => (
          <button
            key={dim.key}
            type="button"
            onClick={() => setExpanded(expanded === dim.key ? null : dim.key)}
            className={`text-left p-4 rounded-lg border-2 transition-all ${scoreColor(dim.score)}`}
            aria-expanded={expanded === dim.key}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium uppercase tracking-wide">{dim.label}</span>
              {expanded === dim.key ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{dim.score}</span>
              <span className="text-xs opacity-70">/100 · weight {dim.weight}%</span>
            </div>
            {expanded === dim.key && (
              <p className="mt-2 text-xs opacity-80">
                Deterministic score from financial metrics engine before AI interpretation.
              </p>
            )}
          </button>
        ))}
      </div>

      {sources.length > 0 && (
        <div className="pt-4 border-t space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Data Sources</h3>
          <ul className="space-y-1">
            {sources.map((source, i) => (
              <li key={`${source.url}-${i}`}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-brand-blue hover:underline"
                >
                  [{i + 1}] {source.title} — {source.type}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  )
}

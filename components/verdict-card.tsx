import React, { type JSX } from 'react'
import { Card } from '@/components/ui/card'
import { VerdictBadge } from '@/components/ui/verdict-badge'
import type { ExplainabilityPanel } from '@/lib/agent/types'

interface VerdictCardProps {
  verdict: 'BUY' | 'HOLD' | 'PASS'
  confidence: number
  targetPrice?: number
  currentPrice?: number
  upside?: number
  timeframe?: string
  summary: string
  explainability?: ExplainabilityPanel | null
  hallucinations?: string[] | null
  className?: string
}

export function VerdictCard({
  verdict,
  confidence,
  targetPrice,
  currentPrice,
  upside,
  timeframe = '12 months',
  summary,
  explainability = null,
  hallucinations = null,
  className = '',
}: VerdictCardProps): JSX.Element {
  return (
    <Card className={`p-6 space-y-6 animate-verdict-entrance ${className}`}>
      {/* Verdict Badge and Confidence */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <VerdictBadge verdict={verdict} size="lg" confidence={confidence} />
          <p className="text-sm text-muted-foreground">
            Confidence: <span className="font-semibold text-foreground">{Math.round(confidence)}%</span>
          </p>
        </div>

        {/* Confidence Ring */}
        <svg className="w-20 h-20" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-muted"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={verdict === 'BUY' ? '#22C55E' : verdict === 'HOLD' ? '#F59E0B' : '#EF4444'}
            strokeWidth="3"
            strokeDasharray={`${(confidence / 100) * 283} 283`}
            strokeLinecap="round"
            className="animate-progress-ring transition-all"
          />
          <text
            x="50"
            y="55"
            textAnchor="middle"
            className="text-lg font-bold fill-foreground"
          >
            {Math.round(confidence)}%
          </text>
        </svg>
      </div>

      {/* Price Metrics */}
      {(currentPrice !== undefined || targetPrice || upside !== undefined) && (
        <div className="grid grid-cols-3 gap-4 py-4 border-y">
          {currentPrice !== undefined && (
            <div>
              <p className="text-xs text-muted-foreground">Current</p>
              <p className="text-lg font-semibold text-foreground">${currentPrice.toFixed(2)}</p>
            </div>
          )}
          {targetPrice && (
            <div>
              <p className="text-xs text-muted-foreground">Target ({timeframe})</p>
              <p className="text-lg font-semibold text-foreground">${targetPrice.toFixed(2)}</p>
            </div>
          )}
          {upside !== undefined && (
            <div>
              <p className="text-xs text-muted-foreground">Upside</p>
              <p
                className={`text-lg font-semibold ${upside >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {upside >= 0 ? '+' : ''}{upside.toFixed(1)}%
              </p>
            </div>
          )}
        </div>
      )}

      {/* Explainability Breakdown */}
      {explainability?.scores && (
        <div className="border-t pt-4 space-y-3">
          <h4 className="font-semibold text-foreground text-sm uppercase tracking-wider">Analysis Score Breakdown</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="p-2 bg-muted/40 rounded-lg text-center border">
              <p className="text-[10px] text-muted-foreground font-semibold uppercase">Financial</p>
              <p className="text-lg font-bold text-foreground mt-0.5">{explainability.scores.financial}</p>
            </div>
            <div className="p-2 bg-muted/40 rounded-lg text-center border">
              <p className="text-[10px] text-muted-foreground font-semibold uppercase">News / Sent</p>
              <p className="text-lg font-bold text-foreground mt-0.5">{explainability.scores.sentiment}</p>
            </div>
            <div className="p-2 bg-muted/40 rounded-lg text-center border">
              <p className="text-[10px] text-muted-foreground font-semibold uppercase">Competition</p>
              <p className="text-lg font-bold text-foreground mt-0.5">{explainability.scores.competition}</p>
            </div>
            <div className="p-2 bg-muted/40 rounded-lg text-center border">
              <p className="text-[10px] text-muted-foreground font-semibold uppercase">Risk / Safety</p>
              <p className="text-lg font-bold text-foreground mt-0.5">{explainability.scores.risk}</p>
            </div>
            <div className="p-2 bg-brand-blue/5 dark:bg-brand-blue/15 rounded-lg text-center border border-brand-blue/30 col-span-2 md:col-span-1">
              <p className="text-[10px] text-brand-blue font-bold uppercase">Composite</p>
              <p className="text-lg font-black text-brand-blue mt-0.5">{explainability.scores.composite}</p>
            </div>
          </div>
        </div>
      )}

      {/* Evidence & Verification Drivers */}
      {explainability?.scores && (
        <div className="border-t pt-4 space-y-2">
          <h4 className="font-semibold text-foreground text-sm uppercase tracking-wider">Verdict Drivers</h4>
          <ul className="space-y-1.5 pl-4 list-disc text-sm text-foreground/80 leading-relaxed">
            {explainability.scores.financial >= 70 && (
              <li>Outstanding balance sheet and income statement quality.</li>
            )}
            {explainability.scores.financial < 70 && explainability.scores.financial >= 50 && (
              <li>Stable financial foundation with minor metrics pressures.</li>
            )}
            {explainability.scores.financial < 50 && (
              <li>Elevated financial pressures detected in margins or debt load.</li>
            )}
            {explainability.scores.sentiment >= 60 && (
              <li>Predominantly positive media coverage and analyst sentiment.</li>
            )}
            {explainability.scores.sentiment < 60 && (
              <li>Mixed or cautious recent public sentiment and news flow.</li>
            )}
            {explainability.scores.competition >= 60 && (
              <li>Strong competitive moat and market position relative to peers.</li>
            )}
            {explainability.scores.competition < 60 && (
              <li>Active competitive threats and pricing pressures from rivals.</li>
            )}
            {explainability.scores.risk >= 60 && (
              <li>Low structural risk with comfortable debt and leverage limits.</li>
            )}
            {explainability.scores.risk < 60 && (
              <li>Significant operational or financial leverage risks present.</li>
            )}
            {(hallucinations?.length ?? 0) === 0 ? (
              <li>Verifier confirmed 100% citation grounding for all thesis claims.</li>
            ) : (
              <li>Verifier flagged some arguments with limited primary documentation.</li>
            )}
          </ul>
        </div>
      )}

      {/* Summary */}
      <div className="space-y-2 border-t pt-4">
        <h4 className="font-semibold text-foreground">Key Takeaway</h4>
        <p className="text-sm text-foreground/80 leading-relaxed">{summary}</p>
      </div>
    </Card>
  )
}

export default VerdictCard

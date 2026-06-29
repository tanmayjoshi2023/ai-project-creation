import React from 'react'
import { Card } from '@/components/ui/card'
import { VerdictBadge } from '@/components/ui/verdict-badge'

interface VerdictCardProps {
  verdict: 'BUY' | 'HOLD' | 'PASS'
  confidence: number
  targetPrice?: number
  currentPrice?: number
  upside?: number
  timeframe?: string
  summary: string
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
  className = '',
}: VerdictCardProps): JSX.Element {
  return (
    <Card className={`p-6 space-y-4 animate-verdict-entrance ${className}`}>
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

      {/* Summary */}
      <div className="space-y-2">
        <h4 className="font-semibold text-foreground">Key Takeaway</h4>
        <p className="text-sm text-foreground/80 leading-relaxed">{summary}</p>
      </div>
    </Card>
  )
}

export default VerdictCard

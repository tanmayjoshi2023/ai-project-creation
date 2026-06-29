import React, { type JSX } from 'react'
import { Card } from '@/components/ui/card'
import { CheckCircle2, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react'

interface Reasoning {
  id: string
  type: 'bullish' | 'bearish' | 'neutral'
  point: string
  confidence: number
  sources: number[] // Index references to citations
}

interface ReasoningListProps {
  bullish: Reasoning[]
  bearish: Reasoning[]
  citations: Array<{ title: string; url: string; date: string }>
  className?: string
}

export function ReasoningList({
  bullish,
  bearish,
  citations,
  className = '',
}: ReasoningListProps): JSX.Element {
  const renderReasoningPoint = (reasoning: Reasoning) => (
    <div key={reasoning.id} className="flex gap-3 p-3 rounded-lg bg-muted/50">
      <div className="flex-shrink-0 mt-0.5">
        {reasoning.type === 'bullish' ? (
          <TrendingUp className="w-4 h-4 text-green-600" />
        ) : reasoning.type === 'bearish' ? (
          <TrendingDown className="w-4 h-4 text-red-600" />
        ) : (
          <AlertCircle className="w-4 h-4 text-amber-600" />
        )}
      </div>
      <div className="flex-grow space-y-1">
        <p className="text-sm text-foreground">
          {reasoning.point}
          {reasoning.sources.length > 0 && (
            <span className="ml-2 text-xs font-semibold">
              {reasoning.sources.map((src) => (
                <a
                  key={src}
                  href={`#citation-${src}`}
                  className="text-brand-blue hover:underline"
                  title={citations[src]?.title}
                >
                  <sup>[{src + 1}]</sup>
                </a>
              ))}
            </span>
          )}
        </p>
        <div className="flex items-center gap-2">
          <div className="h-1.5 flex-grow bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full ${reasoning.type === 'bullish' ? 'bg-green-500' : reasoning.type === 'bearish' ? 'bg-red-500' : 'bg-amber-500'}`}
              style={{ width: `${reasoning.confidence}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{Math.round(reasoning.confidence)}%</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Bull Case */}
      <Card className="p-4 space-y-3 border-l-4 border-l-green-500">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <h3 className="font-semibold text-green-700 dark:text-green-400">Bull Case</h3>
        </div>
        <div className="space-y-2">
          {bullish.length > 0 ? (
            bullish.map(renderReasoningPoint)
          ) : (
            <p className="text-sm text-muted-foreground">No bullish points identified</p>
          )}
        </div>
      </Card>

      {/* Bear Case */}
      <Card className="p-4 space-y-3 border-l-4 border-l-red-500">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <h3 className="font-semibold text-red-700 dark:text-red-400">Bear Case</h3>
        </div>
        <div className="space-y-2">
          {bearish.length > 0 ? (
            bearish.map(renderReasoningPoint)
          ) : (
            <p className="text-sm text-muted-foreground">No bearish points identified</p>
          )}
        </div>
      </Card>

      {/* Citations */}
      {citations.length > 0 && (
        <Card className="p-4 space-y-3">
          <h3 className="font-semibold text-foreground">Sources</h3>
          <div className="space-y-2">
            {citations.map((citation, idx) => (
              <div key={idx} id={`citation-${idx}`} className="flex gap-2 text-sm">
                <span className="font-semibold text-brand-blue flex-shrink-0">[{idx + 1}]</span>
                <div className="flex-grow">
                  <a href={citation.url} target="_blank" rel="noopener noreferrer"
                    className="text-brand-blue hover:underline truncate block">
                    {citation.title}
                  </a>
                  <p className="text-xs text-muted-foreground">{citation.date}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

export default ReasoningList

'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { VerdictBadge } from '@/components/ui/verdict-badge'
import { TrendingUp, TrendingDown, Scale, Minus } from 'lucide-react'
import type { Verdict } from '@/lib/agent/types'

interface DebatePoint {
  point: string
  sourceIndex: number
  specificity?: number
  severity?: number
}

interface DebateViewProps {
  ticker: string
  companyName?: string
  bullPoints: DebatePoint[]
  bearPoints: DebatePoint[]
  bullConfidence: number
  bearConfidence: number
  verdict: Verdict
  confidence: number
  reasoning: string
  citations?: Array<{ title: string; url: string; type: string }>
}

export function DebateView({
  ticker,
  companyName,
  bullPoints,
  bearPoints,
  bullConfidence,
  bearConfidence,
  verdict,
  confidence,
  reasoning,
  citations = [],
}: DebateViewProps): JSX.Element {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Panel */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Adversarial Debate Arena</h2>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto">
          Structured debate between specialized AI research agents. Optimist (Bull) case vs. Risk-focused (Bear) case, synthesized by the Judge Committee.
        </p>
      </div>

      {/* Main Debate Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative items-stretch">
        
        {/* Decorative central divider line on desktop */}
        <div className="hidden lg:flex absolute left-1/2 top-10 bottom-10 w-[2px] bg-gradient-to-b from-green-500/30 via-slate-300 dark:via-slate-800 to-red-500/30 -translate-x-1/2 z-0 items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center shadow-md">
            <Scale className="w-5 h-5 text-muted-foreground animate-pulse" />
          </div>
        </div>

        {/* Left Column: Bull Case */}
        <Card className="flex flex-col p-6 space-y-6 border-l-4 border-l-green-500 bg-gradient-to-b from-green-500/5 to-transparent shadow-md hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between pb-2 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-green-700 dark:text-green-400">Bull Case</h3>
                <p className="text-xs text-muted-foreground font-medium">The Optimist Analyst</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                {bullConfidence}% Confidence
              </span>
              <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                <div className="h-full bg-green-500" style={{ width: `${bullConfidence}%` }} />
              </div>
            </div>
          </div>

          <div className="flex-grow space-y-4">
            {bullPoints.length > 0 ? (
              bullPoints.map((bp, i) => (
                <div
                  key={`bull-pt-${i}`}
                  className="p-4 rounded-lg bg-card/65 border border-border/40 hover:border-green-500/30 hover:bg-green-500/5 transition-all duration-200"
                >
                  <p className="text-sm leading-relaxed text-foreground">
                    {bp.point}
                    {bp.sourceIndex !== undefined && citations[bp.sourceIndex] && (
                      <span className="ml-2 inline-flex items-center">
                        <a
                          href={citations[bp.sourceIndex].url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-brand-blue hover:underline"
                          title={citations[bp.sourceIndex].title}
                        >
                          <sup>[{bp.sourceIndex + 1}]</sup>
                        </a>
                      </span>
                    )}
                  </p>
                  {bp.specificity !== undefined && (
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/30">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                        Evidence Specificity:
                      </span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <div
                            key={idx}
                            className={`w-2.5 h-1 rounded-full ${
                              idx < (bp.specificity ?? 3)
                                ? 'bg-green-500'
                                : 'bg-muted dark:bg-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground italic text-center py-6">
                No optimistic arguments generated.
              </p>
            )}
          </div>
        </Card>

        {/* Right Column: Bear Case */}
        <Card className="flex flex-col p-6 space-y-6 border-l-4 border-l-red-500 bg-gradient-to-b from-red-500/5 to-transparent shadow-md hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between pb-2 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-red-700 dark:text-red-400">Bear Case</h3>
                <p className="text-xs text-muted-foreground font-medium">The Skeptical Risk Analyst</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                {bearConfidence}% Confidence
              </span>
              <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                <div className="h-full bg-red-500" style={{ width: `${bearConfidence}%` }} />
              </div>
            </div>
          </div>

          <div className="flex-grow space-y-4">
            {bearPoints.length > 0 ? (
              bearPoints.map((bp, i) => (
                <div
                  key={`bear-pt-${i}`}
                  className="p-4 rounded-lg bg-card/65 border border-border/40 hover:border-red-500/30 hover:bg-red-500/5 transition-all duration-200"
                >
                  <p className="text-sm leading-relaxed text-foreground">
                    {bp.point}
                    {bp.sourceIndex !== undefined && citations[bp.sourceIndex] && (
                      <span className="ml-2 inline-flex items-center">
                        <a
                          href={citations[bp.sourceIndex].url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-brand-blue hover:underline"
                          title={citations[bp.sourceIndex].title}
                        >
                          <sup>[{bp.sourceIndex + 1}]</sup>
                        </a>
                      </span>
                    )}
                  </p>
                  {bp.severity !== undefined && (
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/30">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                        Risk Severity:
                      </span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <div
                            key={idx}
                            className={`w-2.5 h-1 rounded-full ${
                              idx < (bp.severity ?? 3)
                                ? 'bg-red-500'
                                : 'bg-muted dark:bg-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground italic text-center py-6">
                No risk arguments generated.
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Synthesis / Judge Decision Panel */}
      <Card className="relative overflow-hidden p-6 border border-border bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-900/10 shadow-lg mt-8 rounded-xl">
        <div className="absolute right-4 top-4 opacity-10 pointer-events-none">
          <Scale className="w-24 h-24 text-muted-foreground" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex flex-col items-center justify-center p-4 bg-background border border-border/50 rounded-xl shadow-sm text-center md:w-48 shrink-0">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-2 block">
              Synthesized Verdict
            </span>
            <VerdictBadge verdict={verdict} confidence={confidence} size="lg" variant="glow" />
          </div>

          <div className="space-y-3 flex-grow">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse" />
              <h4 className="font-bold text-base text-foreground">Judge Committee Synthesis</h4>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {reasoning}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default DebateView

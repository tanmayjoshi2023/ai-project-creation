import React, { useEffect, useRef } from 'react'
import { Zap, TrendingUp, BarChart3, Users, AlertCircle, Sparkles, ClipboardList, Calculator, TrendingDown, Scale, ShieldCheck } from 'lucide-react'

interface Thought {
  id: string
  agent: string
  type: 'research' | 'analysis' | 'comparison' | 'sentiment' | 'warning' | 'insight'
  content: string
  timestamp: Date
}

interface ThoughtStreamProps {
  thoughts: Thought[]
  isStreaming?: boolean
  className?: string
}

const agentIcons: Record<string, React.ReactNode> = {
  'Planner': <ClipboardList className="w-4 h-4" />,
  'Financial Analyst': <BarChart3 className="w-4 h-4" />,
  'News Analyst': <Zap className="w-4 h-4" />,
  'Competitor Analyst': <Users className="w-4 h-4" />,
  'Scoring Engine': <Calculator className="w-4 h-4" />,
  'Bull Case': <TrendingUp className="w-4 h-4" />,
  'Bear Case': <TrendingDown className="w-4 h-4" />,
  'Judge': <Scale className="w-4 h-4" />,
  'Verifier': <ShieldCheck className="w-4 h-4" />,
}

export function ThoughtStream({
  thoughts,
  isStreaming = false,
  className = '',
}: ThoughtStreamProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new thoughts arrive
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [thoughts])

  return (
    <div
      ref={containerRef}
      className={`
        relative overflow-y-auto space-y-3 p-4 rounded-lg border bg-card
        max-h-96 md:max-h-[500px]
        ${className}
      `}
    >
      {thoughts.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-muted-foreground">
          <p className="text-sm">Waiting for analysis to begin...</p>
        </div>
      ) : (
        thoughts.map((thought, idx) => (
          <div
            key={thought.id}
            className="animate-thought-slide space-y-1 pb-3 border-b border-border last:border-b-0"
          >
            <div className="flex items-center gap-2">
              <div className="text-brand-blue">
                {agentIcons[thought.agent] || <Sparkles className="w-4 h-4" />}
              </div>
              <span className="text-xs font-semibold text-foreground">{thought.agent}</span>
              <span className="text-xs text-muted-foreground">
                {thought.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </span>
            </div>
            <p className="text-sm text-foreground leading-relaxed ml-6">{thought.content}</p>
          </div>
        ))
      )}

      {isStreaming && (
        <div className="flex items-center gap-2 pt-2 text-xs text-brand-blue">
          <div className="w-2 h-2 bg-brand-blue rounded-full animate-pulse" />
          Analyzing...
        </div>
      )}
    </div>
  )
}

export default ThoughtStream

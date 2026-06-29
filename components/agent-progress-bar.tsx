import React from 'react'
import { CheckCircle2, Circle, Loader2 } from 'lucide-react'

interface AgentNode {
  name: string
  status: 'pending' | 'running' | 'complete' | 'error'
  duration?: number
}

interface AgentProgressBarProps {
  agents: AgentNode[]
  className?: string
}

export function AgentProgressBar({ agents, className = '' }: AgentProgressBarProps): JSX.Element {
  const completedCount = agents.filter(a => a.status === 'complete').length
  const progressPercent = (completedCount / agents.length) * 100

  return (
    <div className={`w-full space-y-4 ${className}`}>
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-muted-foreground">Analysis Progress</span>
          <span className="text-xs text-muted-foreground">
            {completedCount} of {agents.length} agents
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-blue via-brand-gold to-brand-blue rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Agent Nodes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {agents.map((agent, idx) => (
          <div
            key={idx}
            className={`
              flex flex-col items-center p-3 rounded-lg border-2 transition-all duration-300
              ${
                agent.status === 'running'
                  ? 'border-brand-blue bg-blue-50 dark:bg-blue-950'
                  : agent.status === 'complete'
                    ? 'border-green-500 bg-green-50 dark:bg-green-950'
                    : agent.status === 'error'
                      ? 'border-red-500 bg-red-50 dark:bg-red-950'
                      : 'border-muted bg-muted/50'
              }
            `}
          >
            <div className="mb-2">
              {agent.status === 'running' && (
                <Loader2 className="w-5 h-5 text-brand-blue animate-spin" />
              )}
              {agent.status === 'complete' && (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              )}
              {agent.status === 'error' && (
                <Circle className="w-5 h-5 text-red-500" />
              )}
              {agent.status === 'pending' && (
                <Circle className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            <span className="text-xs font-medium text-center text-foreground line-clamp-2">
              {agent.name}
            </span>
            {agent.duration && (
              <span className="text-xs text-muted-foreground mt-1">
                {(agent.duration / 1000).toFixed(1)}s
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default AgentProgressBar

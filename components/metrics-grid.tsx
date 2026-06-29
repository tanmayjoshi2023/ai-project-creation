import React, { type JSX } from 'react'
import { Card } from '@/components/ui/card'
import { ArrowUp, ArrowDown, Minus } from 'lucide-react'

interface Metric {
  label: string
  value: string | number
  change?: number
  unit?: string
  trend?: 'up' | 'down' | 'neutral'
}

interface MetricsGridProps {
  metrics: Metric[]
  className?: string
}

export function MetricsGrid({ metrics, className = '' }: MetricsGridProps): JSX.Element {
  const getTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
    if (trend === 'up') return <ArrowUp className="w-4 h-4 text-green-600" />
    if (trend === 'down') return <ArrowDown className="w-4 h-4 text-red-600" />
    return <Minus className="w-4 h-4 text-amber-600" />
  }

  const getTrendColor = (trend?: 'up' | 'down' | 'neutral') => {
    if (trend === 'up') return 'text-green-600'
    if (trend === 'down') return 'text-red-600'
    return 'text-amber-600'
  }

  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 ${className}`}>
      {metrics.map((metric, idx) => (
        <Card key={idx} className="p-3 space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {metric.label}
          </p>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-lg md:text-2xl font-bold text-foreground">
                {metric.value}
                {metric.unit && <span className="text-sm ml-1">{metric.unit}</span>}
              </p>
            </div>
            {metric.change !== undefined && (
              <div className={`flex items-center gap-1 ${getTrendColor(metric.trend)}`}>
                {getTrendIcon(metric.trend)}
                <span className="text-xs font-semibold">
                  {metric.change >= 0 ? '+' : ''}{metric.change}%
                </span>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}

export default MetricsGrid

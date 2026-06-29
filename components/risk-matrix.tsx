import React, { type JSX } from 'react'
import { Card } from '@/components/ui/card'
import { AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react'

interface RiskFactor {
  name: string
  likelihood: number // 0-100
  impact: number // 0-100
  mitigation?: string
}

interface RiskMatrixProps {
  risks: RiskFactor[]
  overallScore: number
  className?: string
}

export function RiskMatrix({
  risks,
  overallScore,
  className = '',
}: RiskMatrixProps): JSX.Element {
  const getRiskLevel = (likelihood: number, impact: number): 'critical' | 'high' | 'medium' | 'low' => {
    const score = (likelihood * impact) / 100
    if (score > 60) return 'critical'
    if (score > 40) return 'high'
    if (score > 20) return 'medium'
    return 'low'
  }

  const getRiskColor = (level: 'critical' | 'high' | 'medium' | 'low') => {
    switch (level) {
      case 'critical':
        return 'bg-red-100 dark:bg-red-950 border-red-300 dark:border-red-700'
      case 'high':
        return 'bg-orange-100 dark:bg-orange-950 border-orange-300 dark:border-orange-700'
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-950 border-yellow-300 dark:border-yellow-700'
      default:
        return 'bg-green-100 dark:bg-green-950 border-green-300 dark:border-green-700'
    }
  }

  const getRiskIcon = (level: 'critical' | 'high' | 'medium' | 'low') => {
    switch (level) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="w-4 h-4" />
      case 'medium':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <CheckCircle2 className="w-4 h-4" />
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Overall Risk Score */}
      <Card className="p-4 space-y-3">
        <h3 className="font-semibold text-foreground">Overall Risk Assessment</h3>
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 flex-shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full">
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
                stroke={overallScore > 70 ? '#EF4444' : overallScore > 40 ? '#F59E0B' : '#22C55E'}
                strokeWidth="3"
                strokeDasharray={`${(overallScore / 100) * 283} 283`}
                strokeLinecap="round"
                className="transition-all"
              />
              <text x="50" y="55" textAnchor="middle" className="text-lg font-bold fill-foreground">
                {Math.round(overallScore)}
              </text>
            </svg>
          </div>
          <div className="flex-grow">
            <p className="text-2xl font-bold text-foreground">{Math.round(overallScore)} / 100</p>
            <p className={`text-sm font-medium ${
              overallScore > 70
                ? 'text-red-600'
                : overallScore > 40
                  ? 'text-amber-600'
                  : 'text-green-600'
            }`}>
              {overallScore > 70 ? 'High Risk' : overallScore > 40 ? 'Medium Risk' : 'Low Risk'}
            </p>
          </div>
        </div>
      </Card>

      {/* Risk Factors */}
      <Card className="p-4 space-y-3">
        <h3 className="font-semibold text-foreground">Risk Factors</h3>
        <div className="space-y-2">
          {risks.map((risk, idx) => {
            const level = getRiskLevel(risk.likelihood, risk.impact)
            return (
              <div key={idx} className={`p-3 rounded-lg border ${getRiskColor(level)}`}>
                <div className="flex items-start gap-2 mb-2">
                  <div
                    className={`mt-1 ${
                      level === 'critical' || level === 'high'
                        ? 'text-red-600'
                        : level === 'medium'
                          ? 'text-amber-600'
                          : 'text-green-600'
                    }`}
                  >
                    {getRiskIcon(level)}
                  </div>
                  <div className="flex-grow">
                    <p className="font-medium text-foreground text-sm">{risk.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Likelihood: {risk.likelihood}% | Impact: {risk.impact}%
                    </p>
                  </div>
                </div>
                {risk.mitigation && (
                  <p className="text-xs text-foreground/75 ml-6 italic">
                    Mitigation: {risk.mitigation}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

export default RiskMatrix

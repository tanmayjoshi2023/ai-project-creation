import React, { type JSX } from 'react'
import { TrendingUp, Minus, TrendingDown, Zap, AlertCircle, CheckCircle2 } from 'lucide-react'

type Verdict = 'BUY' | 'HOLD' | 'PASS'
type Variant = 'solid' | 'outline' | 'subtle' | 'glow' | 'gradient' | 'minimal'
type Size = 'sm' | 'md' | 'lg'

interface VerdictBadgeProps {
  verdict: Verdict
  size?: Size
  confidence?: number
  variant?: Variant
  className?: string
  showLabel?: boolean
}

const verdictConfig: Record<
  Verdict,
  {
    icon: React.ReactNode
    solidBg: string
    solidText: string
    outlineBg: string
    outlineText: string
    outlineBorder: string
    subtleBg: string
    subtleText: string
    glowColor: string
    gradientFrom: string
    gradientTo: string
    minimalColor: string
    label: string
  }
> = {
  BUY: {
    icon: <TrendingUp className="w-full h-full" />,
    solidBg: 'bg-gradient-to-br from-green-500 to-green-600',
    solidText: 'text-white',
    outlineBg: 'bg-transparent',
    outlineText: 'text-green-600 dark:text-green-400',
    outlineBorder: 'border-2 border-green-600 dark:border-green-400',
    subtleBg: 'bg-green-100 dark:bg-green-900/30',
    subtleText: 'text-green-700 dark:text-green-200',
    glowColor: 'from-green-400 to-green-600',
    gradientFrom: '#22c55e',
    gradientTo: '#16a34a',
    minimalColor: 'text-green-600 dark:text-green-400',
    label: 'BUY',
  },
  HOLD: {
    icon: <Minus className="w-full h-full" />,
    solidBg: 'bg-gradient-to-br from-amber-500 to-amber-600',
    solidText: 'text-white',
    outlineBg: 'bg-transparent',
    outlineText: 'text-amber-600 dark:text-amber-400',
    outlineBorder: 'border-2 border-amber-600 dark:border-amber-400',
    subtleBg: 'bg-amber-100 dark:bg-amber-900/30',
    subtleText: 'text-amber-700 dark:text-amber-200',
    glowColor: 'from-amber-400 to-amber-600',
    gradientFrom: '#f59e0b',
    gradientTo: '#d97706',
    minimalColor: 'text-amber-600 dark:text-amber-400',
    label: 'HOLD',
  },
  PASS: {
    icon: <TrendingDown className="w-full h-full" />,
    solidBg: 'bg-gradient-to-br from-red-500 to-red-600',
    solidText: 'text-white',
    outlineBg: 'bg-transparent',
    outlineText: 'text-red-600 dark:text-red-400',
    outlineBorder: 'border-2 border-red-600 dark:border-red-400',
    subtleBg: 'bg-red-100 dark:bg-red-900/30',
    subtleText: 'text-red-700 dark:text-red-200',
    glowColor: 'from-red-400 to-red-600',
    gradientFrom: '#ef4444',
    gradientTo: '#dc2626',
    minimalColor: 'text-red-600 dark:text-red-400',
    label: 'PASS',
  },
}

const sizeConfig: Record<Size, { container: string; icon: string; text: string; padding: string }> = {
  sm: {
    container: 'h-6',
    icon: 'w-3 h-3',
    text: 'text-xs font-bold tracking-tight',
    padding: 'px-2 gap-1',
  },
  md: {
    container: 'h-9',
    icon: 'w-4 h-4',
    text: 'text-sm font-bold tracking-wide',
    padding: 'px-3 gap-2',
  },
  lg: {
    container: 'h-11',
    icon: 'w-5 h-5',
    text: 'text-base font-bold tracking-wider',
    padding: 'px-4 gap-2.5',
  },
}

export function VerdictBadge({
  verdict,
  size = 'md',
  confidence,
  variant = 'solid',
  className = '',
  showLabel = true,
}: VerdictBadgeProps): JSX.Element {
  const config = verdictConfig[verdict]
  const sizeClasses = sizeConfig[size]

  const getBgStyles = () => {
    switch (variant) {
      case 'solid':
        return `${config.solidBg} ${config.solidText} shadow-lg`
      case 'outline':
        return `${config.outlineBg} ${config.outlineBorder} ${config.outlineText}`
      case 'subtle':
        return `${config.subtleBg} ${config.subtleText}`
      case 'glow':
        return `${config.solidBg} ${config.solidText} shadow-lg shadow-current blur-0 relative before:absolute before:-inset-1 before:rounded-lg before:bg-gradient-to-r before:${config.glowColor} before:-z-10 before:opacity-75 before:blur-md`
      case 'gradient':
        return `bg-gradient-to-r from-slate-900 to-slate-800 ${config.solidText} shadow-lg`
      case 'minimal':
        return `${config.minimalColor} bg-transparent font-bold`
      default:
        return config.solidBg
    }
  }

  return (
    <div
      className={`
        inline-flex items-center justify-center rounded-lg font-medium transition-all
        ${sizeClasses.container}
        ${sizeClasses.padding}
        ${getBgStyles()}
        hover:shadow-xl hover:scale-105
        active:scale-95
        duration-200
        ${className}
      `}
      role="status"
      aria-label={`${verdict} verdict ${confidence ? `with ${confidence}% confidence` : ''}`}
    >
      <div className={`${sizeClasses.icon} flex-shrink-0`}>{config.icon}</div>
      {showLabel && <span className={sizeClasses.text}>{verdict}</span>}
      {confidence !== undefined && (
        <span className={`${sizeClasses.text} opacity-80 font-medium ml-1`}>
          {Math.round(confidence)}%
        </span>
      )}
    </div>
  )
}

export default VerdictBadge

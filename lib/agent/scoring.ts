import type { FinancialMetrics, RiskTolerance, ScoreBreakdown, Verdict } from './types'

const WEIGHTS = {
  financial: 0.3,
  market: 0.2,
  sentiment: 0.15,
  competition: 0.15,
  risk: 0.2,
} as const

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value))
}

function scorePe(pe: number | null): number {
  if (pe === null) return 50
  if (pe < 15) return 100
  if (pe > 40) return 20
  return clamp(100 - ((pe - 15) / 25) * 80)
}

function scoreGrowth(growth: number | null): number {
  if (growth === null) return 50
  if (growth > 0.2) return 100
  if (growth < 0) return 0
  return clamp(growth * 500)
}

function scoreDebt(debt: number | null): number {
  if (debt === null) return 50
  if (debt < 0.3) return 100
  if (debt > 3) return 0
  return clamp(100 - ((debt - 0.3) / 2.7) * 100)
}

function scoreMargin(margin: number | null): number {
  if (margin === null) return 50
  if (margin > 0.6) return 100
  if (margin < 0.1) return 0
  return clamp(((margin - 0.1) / 0.5) * 100)
}

function scoreFcfYield(fcf: number | null): number {
  if (fcf === null) return 50
  if (fcf > 0.05) return 100
  if (fcf < 0) return 0
  return clamp(fcf * 2000)
}

export function calculateFinancialScore(metrics: FinancialMetrics): number {
  const subScores = [
    scorePe(metrics.peRatio) * 0.2,
    scoreGrowth(metrics.revenueGrowthYoY) * 0.2,
    scoreFcfYield(metrics.freeCashFlowYield) * 0.2,
    scoreMargin(metrics.grossMargin) * 0.2,
    scoreDebt(metrics.debtToEquity) * 0.2,
  ]
  return Math.round(subScores.reduce((a, b) => a + b, 0))
}

export function applyRiskTolerance(
  compositeScore: number,
  riskTolerance: RiskTolerance = 'moderate'
): Verdict {
  const thresholds = {
    conservative: { buy: 80, hold: 60 },
    moderate: { buy: 70, hold: 45 },
    aggressive: { buy: 55, hold: 35 },
  }
  const { buy, hold } = thresholds[riskTolerance]
  if (compositeScore >= buy) return 'BUY'
  if (compositeScore >= hold) return 'HOLD'
  return 'PASS'
}

export function calculateCompositeScore(scores: Omit<ScoreBreakdown, 'composite'>): ScoreBreakdown {
  const composite = Math.round(
    scores.financial * WEIGHTS.financial +
      scores.market * WEIGHTS.market +
      scores.sentiment * WEIGHTS.sentiment +
      scores.competition * WEIGHTS.competition +
      scores.risk * WEIGHTS.risk
  )
  return { ...scores, composite }
}

/** Deterministic mock metrics keyed by ticker for demo / offline mode */
export function getMockFinancialMetrics(ticker: string): FinancialMetrics {
  const seed = ticker.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const normalized = (seed % 100) / 100
  return {
    peRatio: 12 + normalized * 35,
    revenueGrowthYoY: -0.05 + normalized * 0.35,
    debtToEquity: 0.2 + normalized * 1.5,
    grossMargin: 0.25 + normalized * 0.45,
    freeCashFlowYield: -0.01 + normalized * 0.08,
  }
}

export function buildScoreBreakdown(ticker: string, sector?: string): ScoreBreakdown {
  const metrics = getMockFinancialMetrics(ticker)
  const financial = calculateFinancialScore(metrics)
  const sectorBoost = sector?.toLowerCase().includes('tech') ? 8 : 0
  const market = clamp(financial + sectorBoost - 5)
  const sentiment = clamp(55 + (ticker.charCodeAt(0) % 30))
  const competition = clamp(50 + (ticker.length * 3))
  const risk = clamp(100 - financial * 0.4)
  return calculateCompositeScore({ financial, market, sentiment, competition, risk })
}

export { WEIGHTS }

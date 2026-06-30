import type { FinancialMetrics, RiskTolerance, ScoreBreakdown, Verdict } from './types'

export interface ScoreContext {
  metrics?: FinancialMetrics | null
  newsArticles?: Array<{ sentiment?: number | null; relevanceScore?: number | null }> | null
  competitorData?: Array<{ threatLevel?: number | null }> | null
  sector?: string
  riskTolerance?: RiskTolerance
}

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
  if (pe < 12) return 100
  if (pe > 35) return 20
  return clamp(100 - ((pe - 12) / 23) * 80)
}

function scoreGrowth(growth: number | null): number {
  if (growth === null) return 50
  if (growth > 0.18) return 100
  if (growth < -0.05) return 0
  return clamp(50 + growth * 500)
}

function scoreDebt(debt: number | null): number {
  if (debt === null) return 50
  if (debt < 0.35) return 100
  if (debt > 2.5) return 0
  return clamp(100 - ((debt - 0.35) / 2.15) * 100)
}

function scoreMargin(margin: number | null): number {
  if (margin === null) return 50
  if (margin > 0.45) return 100
  if (margin < 0.08) return 0
  return clamp(((margin - 0.08) / 0.37) * 100)
}

function scoreFcfYield(fcf: number | null): number {
  if (fcf === null) return 50
  if (fcf > 0.04) return 100
  if (fcf < 0) return 0
  return clamp(fcf * 2500)
}

function scoreNewsSentiment(newsArticles?: Array<{ sentiment?: number | null; relevanceScore?: number | null }> | null): number {
  if (!newsArticles || newsArticles.length === 0) return 50
  const weighted = newsArticles.reduce((sum, article) => {
    const relevance = article.relevanceScore ?? 0.5
    const sentiment = article.sentiment ?? 0
    return sum + sentiment * relevance
  }, 0)
  const average = weighted / newsArticles.length
  return clamp(Math.round(50 + average * 40))
}

function scoreCompetition(competitorData?: Array<{ threatLevel?: number | null }> | null): number {
  if (!competitorData || competitorData.length === 0) return 55
  const averageThreat = competitorData.reduce((sum, item) => sum + (item.threatLevel ?? 0.5), 0) / competitorData.length
  return clamp(Math.round(100 - averageThreat * 30))
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

export function buildScoreBreakdown(ticker: string, sector?: string, context?: ScoreContext): ScoreBreakdown {
  const metrics = context?.metrics ?? getMockFinancialMetrics(ticker)
  const financial = calculateFinancialScore(metrics)
  const sectorBoost = sector?.toLowerCase().includes('tech') ? 8 : 0
  const newsScore = scoreNewsSentiment(context?.newsArticles)
  const competitionScore = scoreCompetition(context?.competitorData)
  const riskPressure = (metrics.debtToEquity ?? 0.5) * 24 + (newsScore < 50 ? 12 : 0)
  const market = clamp(Math.round(financial * 0.55 + newsScore * 0.25 + sectorBoost * 0.2 + 5))
  const sentiment = clamp(Math.round(newsScore * 0.75 + (metrics.revenueGrowthYoY ?? 0) * 55 + 10))
  const competition = clamp(Math.round(competitionScore * 0.85 + (sectorBoost > 0 ? 6 : 0)))
  const risk = clamp(Math.round(100 - financial * 0.3 - riskPressure))
  return calculateCompositeScore({ financial, market, sentiment, competition, risk })
}

export { WEIGHTS }

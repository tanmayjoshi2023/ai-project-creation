import type { InvestmentAnalysisState } from '@/lib/agent/state'
import { makeAgentOutput, makeThought, stateInput } from './helpers'
import { emitThought } from '@/lib/agent/event-bus'

/**
 * Verifier — deterministic (no LLM). Computes a grounding score from the ratio of
 * cited claims and finalizes the confidence score using the deterministic
 * component scores. No model call keeps the tail of the pipeline fast.
 */
export async function verifierNode(state: InvestmentAnalysisState): Promise<Partial<InvestmentAnalysisState>> {
  const start = Date.now()
  emitThought(state.analysisId, 'Verifier', 'running', 'Verifying citations...')
  const input = stateInput(state)

  const bullPoints = state.bullCase || []
  const bearPoints = state.bearCase || []
  const citedCount = bullPoints.filter((p) => p.sourceIndex).length + bearPoints.filter((p) => p.sourceIndex).length
  const totalClaims = bullPoints.length + bearPoints.length
  const groundingScore = totalClaims > 0 ? Math.min(1, citedCount / totalClaims) : 0.8

  // Flag any claim that lacks a source index as uncited.
  const uncitedClaims = [
    ...bullPoints.filter((p) => !p.sourceIndex).map((p) => p.point),
    ...bearPoints.filter((p) => !p.sourceIndex).map((p) => p.point),
  ]

  const financial = state.financialScore || 50
  const market = state.marketScore || 50
  const sentiment = state.sentimentScore || 55
  const competition = state.competitionScore || 50
  const risk = state.riskScore || 50

  const base = Math.round(
    financial * 0.3 +
    sentiment * 0.2 +
    market * 0.15 +
    competition * 0.15 +
    risk * 0.2
  )

  const components = [financial, market, sentiment, competition, risk]
  const mean = components.reduce((sum, val) => sum + val, 0) / components.length
  const variance = components.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / components.length
  const stdDev = Math.sqrt(variance)
  const consistencyPenalty = Math.min(20, stdDev * 0.5)

  const avgSpecificity = bullPoints.length > 0
    ? bullPoints.reduce((sum, p) => sum + (p.specificity || 3), 0) / bullPoints.length
    : 3
  const avgSeverity = bearPoints.length > 0
    ? bearPoints.reduce((sum, p) => sum + (p.severity || 3), 0) / bearPoints.length
    : 3

  const qualityMultiplier = groundingScore * (0.5 + 0.5 * ((avgSpecificity + avgSeverity) / 10))
  const confidenceScore = Math.max(30, Math.min(95, Math.round((base - consistencyPenalty) * qualityMultiplier)))

  const output = `Grounding: ${Math.round(groundingScore * 100)}%. ${uncitedClaims.length} uncited claims flagged.`

  const agent = makeAgentOutput('Verifier', 'verifier', input, output, groundingScore, Date.now() - start)

  emitThought(state.analysisId, 'Verifier', 'complete', output, agent.executionTimeMs)

  return {
    groundingScore,
    uncitedClaims,
    confidenceScore,
    agents: [agent],
    thoughtEvents: [
      makeThought('Verifier', 'running', 'Verifying citations...'),
      makeThought('Verifier', 'complete', output, agent.executionTimeMs),
    ],
  }
}

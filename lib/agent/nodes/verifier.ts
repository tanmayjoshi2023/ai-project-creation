import type { InvestmentAnalysisState } from '@/lib/agent/state'
import { callStructuredLLM } from '@/lib/agent/llm'
import { VerifierOutputSchema } from '@/lib/agent/schemas'
import { verifierPrompt } from '@/lib/agent/prompts'
import { makeAgentOutput, makeThought, stateInput } from './helpers'
import { emitThought } from '@/lib/agent/event-bus'

export async function verifierNode(state: InvestmentAnalysisState): Promise<Partial<InvestmentAnalysisState>> {
  const start = Date.now()
  emitThought(state.analysisId, 'Verifier', 'running', 'Verifying citations...')
  const input = stateInput(state)

  const verdictText = `${state.reasoning}\nBull:\n${state.bullCase.map((p) => p.point).join('\n')}\nBear:\n${state.bearCase.map((p) => p.point).join('\n')}`
  const sourcesText = state.citations.map((c) => `[${c.index}] ${c.title}: ${c.url}`).join('\n')

  const citedCount = state.bullCase.filter((p) => p.sourceIndex).length + state.bearCase.filter((p) => p.sourceIndex).length
  const totalClaims = state.bullCase.length + state.bearCase.length
  const fallbackGrounding = totalClaims > 0 ? citedCount / totalClaims : 0.8

  const fallback = () => ({
    groundingScore: Math.min(1, fallbackGrounding),
    uncitedClaims: [] as string[],
    verifiedCitations: state.citations,
  })

  const result = await callStructuredLLM(
    'verifier',
    verifierPrompt(verdictText, sourcesText),
    verdictText,
    VerifierOutputSchema,
    fallback
  )

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

  const bullPoints = state.bullCase || []
  const bearPoints = state.bearCase || []
  const avgSpecificity = bullPoints.length > 0
    ? bullPoints.reduce((sum, p) => sum + (p.specificity || 3), 0) / bullPoints.length
    : 3
  const avgSeverity = bearPoints.length > 0
    ? bearPoints.reduce((sum, p) => sum + (p.severity || 3), 0) / bearPoints.length
    : 3

  const grounding = result.groundingScore
  const qualityMultiplier = grounding * (0.5 + 0.5 * ((avgSpecificity + avgSeverity) / 10))

  const confidenceScore = Math.max(30, Math.min(95, Math.round((base - consistencyPenalty) * qualityMultiplier)))

  const output = `Grounding: ${Math.round(result.groundingScore * 100)}%. ${result.uncitedClaims.length} uncited claims flagged.`

  const agent = makeAgentOutput('Verifier', 'verifier', input, output, result.groundingScore, Date.now() - start)

  emitThought(state.analysisId, 'Verifier', 'complete', output, agent.executionTimeMs)

  return {
    groundingScore: result.groundingScore,
    uncitedClaims: result.uncitedClaims,
    confidenceScore,
    agents: [agent],
    thoughtEvents: [
      makeThought('Verifier', 'running', 'Verifying citations...'),
      makeThought('Verifier', 'complete', output, agent.executionTimeMs),
    ],
  }
}

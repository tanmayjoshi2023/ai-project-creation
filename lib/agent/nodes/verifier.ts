import type { InvestmentAnalysisState } from '@/lib/agent/state'
import { callStructuredLLM } from '@/lib/agent/llm'
import { VerifierOutputSchema } from '@/lib/agent/schemas'
import { verifierPrompt } from '@/lib/agent/prompts'
import { makeAgentOutput, makeThought, stateInput } from './helpers'

export async function verifierNode(state: InvestmentAnalysisState): Promise<Partial<InvestmentAnalysisState>> {
  const start = Date.now()
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

  let confidenceScore = state.confidenceScore
  if (result.groundingScore < 0.8) {
    confidenceScore = Math.max(30, confidenceScore - 20)
  }

  const output = `Grounding: ${Math.round(result.groundingScore * 100)}%. ${result.uncitedClaims.length} uncited claims flagged.`

  const agent = makeAgentOutput('Verifier', 'verifier', input, output, result.groundingScore, Date.now() - start)

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

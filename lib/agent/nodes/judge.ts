import type { InvestmentAnalysisState } from '@/lib/agent/state'
import { applyRiskTolerance } from '@/lib/agent/scoring'
import { callStructuredLLM } from '@/lib/agent/llm'
import { VerdictSchema } from '@/lib/agent/schemas'
import { judgePrompt } from '@/lib/agent/prompts'
import { makeAgentOutput, makeThought, stateInput } from './helpers'
import { emitThought } from '@/lib/agent/event-bus'

export async function judgeNode(state: InvestmentAnalysisState): Promise<Partial<InvestmentAnalysisState>> {
  const start = Date.now()
  emitThought(state.analysisId, 'Judge', 'running', 'Weighing bull vs bear evidence...')
  const input = stateInput(state)
  const bullText = state.bullCase.map((p) => p.point).join('\n')
  const bearText = state.bearCase.map((p) => p.point).join('\n')

  const fallbackVerdict = applyRiskTolerance(state.compositeScore, state.riskTolerance)
  const fallbackConfidence = Math.min(95, Math.round(state.compositeScore * 0.85 + 10))

  const fallback = () => ({
    verdict: fallbackVerdict,
    confidenceScore: fallbackConfidence,
    reasoning: `Judge evaluated the investment thesis for ${state.companyName} (${state.ticker}). The bull case shows ${state.bullConfidence}% confidence supported by strong operational factors, while the bear case indicates ${state.bearConfidence}% confidence on risk factors. A composite score of ${state.compositeScore}/100 under ${state.riskTolerance} risk parameters yields a ${fallbackVerdict} verdict.`,
    bullPointsUsed: state.bullCase.map((_, i) => i + 1),
    bearPointsUsed: state.bearCase.map((_, i) => i + 1),
    contestedPoints: [] as string[],
  })

  const result = await callStructuredLLM(
    'judge',
    judgePrompt(state.companyName, state.ticker, bullText, bearText, state.compositeScore, state.riskTolerance),
    `Bull:\n${bullText}\n\nBear:\n${bearText}`,
    VerdictSchema,
    fallback
  )

  const agent = makeAgentOutput(
    'Judge',
    'judge',
    input,
    result.reasoning,
    result.confidenceScore / 100,
    Date.now() - start
  )

  emitThought(state.analysisId, 'Judge', 'complete', `Verdict: ${result.verdict} (${result.confidenceScore}%)`, agent.executionTimeMs)

  return {
    verdict: result.verdict,
    confidenceScore: result.confidenceScore,
    reasoning: result.reasoning,
    agents: [agent],
    thoughtEvents: [
      makeThought('Judge', 'running', 'Weighing bull vs bear evidence...'),
      makeThought('Judge', 'complete', `Verdict: ${result.verdict} (${result.confidenceScore}%)`, agent.executionTimeMs),
    ],
  }
}

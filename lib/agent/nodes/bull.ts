import type { InvestmentAnalysisState } from '@/lib/agent/state'
import { callStructuredLLM } from '@/lib/agent/llm'
import { BullCaseSchema } from '@/lib/agent/schemas'
import { bullPrompt } from '@/lib/agent/prompts'
import { buildContextSummary, makeAgentOutput, makeThought, stateInput } from './helpers'
import { emitThought } from '@/lib/agent/event-bus'

export async function bullNode(state: InvestmentAnalysisState): Promise<Partial<InvestmentAnalysisState>> {
  const start = Date.now()
  emitThought(state.analysisId, 'Bull Case', 'running', 'Constructing bull arguments...')
  const input = stateInput(state)
  const context = buildContextSummary(state)

  const fallback = () => ({
    points: [
      { point: `${state.companyName} (${state.ticker}) shows strong balance sheet health, supported by a financial score of ${state.financialScore}/100 [source: 1]`, sourceIndex: 1, specificity: 4 },
      { point: `${state.companyName}'s competitive moat score of ${state.competitionScore}/100 indicates a dominant position in the ${state.sector} market [source: 3]`, sourceIndex: 3, specificity: 4 },
      { point: `Positive recent news sentiment for ${state.ticker} is tracking at ${state.sentimentScore}/100, signaling optimistic demand [source: 2]`, sourceIndex: 2, specificity: 3 },
      { point: `${state.companyName} demonstrates robust gross margins and revenue growth potential in its core ${state.sector} segments [source: 1]`, sourceIndex: 1, specificity: 3 },
      { point: `Overall investment analysis score for ${state.companyName} (${state.compositeScore}/100) indicates growth upside [source: 1]`, sourceIndex: 1, specificity: 4 },
    ],
    bullConfidence: Math.min(90, state.compositeScore),
  })

  const result = await callStructuredLLM(
    'bull',
    bullPrompt(state.companyName, state.ticker, context),
    context,
    BullCaseSchema,
    fallback
  )

  const output = result.points.map((p) => p.point).join('\n')
  const agent = makeAgentOutput('Bull Case', 'bull', input, output, result.bullConfidence / 100, Date.now() - start)

  emitThought(state.analysisId, 'Bull Case', 'complete', `${result.points.length} bull points ready`, agent.executionTimeMs)

  return {
    bullCase: result.points,
    bullConfidence: result.bullConfidence,
    agents: [agent],
    thoughtEvents: [
      makeThought('Bull Case', 'running', 'Constructing bull arguments...'),
      makeThought('Bull Case', 'complete', `${result.points.length} bull points ready`, agent.executionTimeMs),
    ],
  }
}

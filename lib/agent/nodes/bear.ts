import type { InvestmentAnalysisState } from '@/lib/agent/state'
import { callStructuredLLM } from '@/lib/agent/llm'
import { BearCaseSchema } from '@/lib/agent/schemas'
import { bearPrompt } from '@/lib/agent/prompts'
import { buildContextSummary, makeAgentOutput, makeThought, stateInput } from './helpers'
import { emitThought } from '@/lib/agent/event-bus'

export async function bearNode(state: InvestmentAnalysisState): Promise<Partial<InvestmentAnalysisState>> {
  const start = Date.now()
  emitThought(state.analysisId, 'Bear Case', 'running', 'Constructing bear arguments...')
  const input = stateInput(state)
  const context = buildContextSummary(state)

  const fallback = () => ({
    points: [
      { point: `Risk score of ${state.riskScore}/100 signals elevated operational and market downside for ${state.companyName} [source: 2]`, sourceIndex: 2, severity: 4 },
      { point: `${state.companyName}'s current valuation premium leaves little margin for error relative to ${state.sector} sector peers [source: 1]`, sourceIndex: 1, severity: 3 },
      { point: `Intensifying competition from rivals poses potential threats to ${state.companyName}'s long-term market share [source: 3]`, sourceIndex: 3, severity: 4 },
      { point: `Sentiment score of ${state.sentimentScore}/100 suggests that optimism for ${state.ticker} may have peaked [source: 2]`, sourceIndex: 2, severity: 3 },
      { point: `Macro headwinds and regulatory shifts in the ${state.sector} industry could impact ${state.companyName}'s projected margins [source: 2]`, sourceIndex: 2, severity: 3 },
    ],
    bearConfidence: Math.min(85, 100 - state.compositeScore),
  })

  const result = await callStructuredLLM(
    'bear',
    bearPrompt(state.companyName, state.ticker, context),
    context,
    BearCaseSchema,
    fallback
  )

  const output = result.points.map((p) => p.point).join('\n')
  const agent = makeAgentOutput('Bear Case', 'bear', input, output, result.bearConfidence / 100, Date.now() - start)

  emitThought(state.analysisId, 'Bear Case', 'complete', `${result.points.length} bear points ready`, agent.executionTimeMs)

  return {
    bearCase: result.points,
    bearConfidence: result.bearConfidence,
    agents: [agent],
    thoughtEvents: [
      makeThought('Bear Case', 'running', 'Constructing bear arguments...'),
      makeThought('Bear Case', 'complete', `${result.points.length} bear points ready`, agent.executionTimeMs),
    ],
  }
}

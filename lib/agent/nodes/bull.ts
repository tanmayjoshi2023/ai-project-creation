import type { InvestmentAnalysisState } from '@/lib/agent/state'
import { callStructuredLLM } from '@/lib/agent/llm'
import { BullCaseSchema } from '@/lib/agent/schemas'
import { bullPrompt } from '@/lib/agent/prompts'
import { buildContextSummary, makeAgentOutput, makeThought, stateInput } from './helpers'

export async function bullNode(state: InvestmentAnalysisState): Promise<Partial<InvestmentAnalysisState>> {
  const start = Date.now()
  const input = stateInput(state)
  const context = buildContextSummary(state)

  const fallback = () => ({
    points: [
      { point: `Financial health score ${state.financialScore}/100 supports upside [source: 1]`, sourceIndex: 1, specificity: 4 },
      { point: `Market position score ${state.marketScore}/100 indicates leadership [source: 3]`, sourceIndex: 3, specificity: 4 },
      { point: `Positive sentiment at ${state.sentimentScore}/100 [source: 2]`, sourceIndex: 2, specificity: 3 },
      { point: `Competitive moat score ${state.competitionScore}/100 [source: 3]`, sourceIndex: 3, specificity: 3 },
      { point: `Composite score ${state.compositeScore}/100 above hold threshold [source: 1]`, sourceIndex: 1, specificity: 4 },
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

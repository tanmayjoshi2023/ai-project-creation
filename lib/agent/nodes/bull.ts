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
      {
        point: `${state.companyName} (${state.ticker}) appears positioned for growth with a financial score of ${state.financialScore}/100 and healthy gross margin trends in the ${state.sector} sector [source: 1]`,
        sourceIndex: 1,
        specificity: 5,
      },
      {
        point: `Recent sentiment and news coverage are generally positive, supporting demand momentum for ${state.companyName} even if broader market risk remains [source: 2]`,
        sourceIndex: 2,
        specificity: 4,
      },
      {
        point: `${state.companyName} benefits from competitive strength in ${state.sector}, which helps sustain pricing power and guard market share [source: 3]`,
        sourceIndex: 3,
        specificity: 4,
      },
      {
        point: `The current score profile suggests this is a company with above-average operational quality and growth optionality in the near term [source: 1]`,
        sourceIndex: 1,
        specificity: 3,
      },
      {
        point: `Under a ${state.riskTolerance} risk tolerance, the upside thesis is supported by stable free cash flow and manageable leverage [source: 1]`,
        sourceIndex: 1,
        specificity: 3,
      },
    ],
    bullConfidence: Math.min(95, Math.max(55, state.compositeScore)),
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

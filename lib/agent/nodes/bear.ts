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
      {
        point: `A risk score of ${state.riskScore}/100 indicates this company may be sensitive to macro or execution risk, especially given its ${state.sector} exposure [source: 2]`,
        sourceIndex: 2,
        severity: 5,
      },
      {
        point: `If ${state.companyName} is priced for perfection, any earnings miss or slowdown would reduce upside sharply [source: 1]`,
        sourceIndex: 1,
        severity: 4,
      },
      {
        point: `Competitive pressure from peers could erode margins and market share unless the company maintains a clear advantage [source: 3]`,
        sourceIndex: 3,
        severity: 4,
      },
      {
        point: `Sentiment strength of ${state.sentimentScore}/100 may have already priced in positive growth assumptions, leaving limited downside protection [source: 2]`,
        sourceIndex: 2,
        severity: 3,
      },
      {
        point: `Under ${state.riskTolerance} risk preferences, the current profile looks more suited to Hold or Pass until evidence of durable growth is clearer [source: 2]`,
        sourceIndex: 2,
        severity: 3,
      },
    ],
    bearConfidence: Math.min(90, Math.max(50, 100 - state.compositeScore)),
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

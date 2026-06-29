import type { InvestmentAnalysisState } from '@/lib/agent/state'
import { callStructuredLLM } from '@/lib/agent/llm'
import { BearCaseSchema } from '@/lib/agent/schemas'
import { bearPrompt } from '@/lib/agent/prompts'
import { buildContextSummary, makeAgentOutput, makeThought, stateInput } from './helpers'

export async function bearNode(state: InvestmentAnalysisState): Promise<Partial<InvestmentAnalysisState>> {
  const start = Date.now()
  const input = stateInput(state)
  const context = buildContextSummary(state)

  const fallback = () => ({
    points: [
      { point: `Risk score ${state.riskScore}/100 signals elevated downside [source: 2]`, sourceIndex: 2, severity: 4 },
      { point: `Valuation may reflect premium vs peers [source: 1]`, sourceIndex: 1, severity: 3 },
      { point: `Competitive threats from ${state.competitorData.length || 'multiple'} rivals [source: 3]`, sourceIndex: 3, severity: 4 },
      { point: `Sentiment only ${state.sentimentScore}/100 — room for negative revision [source: 2]`, sourceIndex: 2, severity: 3 },
      { point: `Macro headwinds could impact ${state.sector} sector [source: 2]`, sourceIndex: 2, severity: 3 },
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

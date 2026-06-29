import type { InvestmentAnalysisState } from '@/lib/agent/state'
import { callStructuredLLM } from '@/lib/agent/llm'
import { PlannerOutputSchema } from '@/lib/agent/schemas'
import { plannerPrompt, wrapUserInput } from '@/lib/agent/prompts'
import { resolveTicker } from '@/lib/agent/tools'
import { makeAgentOutput, makeThought, stateInput } from './helpers'

export async function plannerNode(state: InvestmentAnalysisState): Promise<Partial<InvestmentAnalysisState>> {
  const start = Date.now()
  const resolved = await resolveTicker(state.ticker || state.companyName)

  const fallback = () => ({
    ticker: resolved.ticker,
    sector: resolved.sector,
    researchPlan: [
      { step: 'Fetch financial statements and ratios', agent: 'financial' },
      { step: 'Search recent news and sentiment', agent: 'news' },
      { step: 'Analyze competitive landscape', agent: 'competitor' },
      { step: 'Run bull/bear debate', agent: 'bull/bear' },
      { step: 'Deliver final verdict', agent: 'judge' },
    ],
    searchQueries: [
      `${resolved.name} earnings news`,
      `${resolved.name} stock risk`,
      `${resolved.name} competitors market share`,
    ],
  })

  const result = await callStructuredLLM(
    'planner',
    plannerPrompt(resolved.name, resolved.ticker),
    wrapUserInput(`${state.companyName} (${state.ticker})`),
    PlannerOutputSchema,
    fallback
  )

  const input = stateInput(state)
  const agent = makeAgentOutput(
    'Planner',
    'planner',
    input,
    `Plan: ${result.researchPlan.map((s) => s.step).join('; ')}`,
    0.95,
    Date.now() - start
  )

  return {
    ticker: result.ticker,
    companyName: resolved.name,
    sector: result.sector,
    researchPlan: result.researchPlan,
    searchQueries: result.searchQueries,
    agents: [agent],
    thoughtEvents: [
      makeThought('Planner', 'running', 'Building research plan...'),
      makeThought('Planner', 'complete', agent.output, agent.executionTimeMs),
    ],
  }
}

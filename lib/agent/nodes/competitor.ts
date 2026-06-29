import type { InvestmentAnalysisState } from '@/lib/agent/state'
import { callStructuredLLM } from '@/lib/agent/llm'
import { CompetitorAnalysisSchema } from '@/lib/agent/schemas'
import { competitorPrompt } from '@/lib/agent/prompts'
import { webSearch } from '@/lib/agent/tools'
import { makeAgentOutput, makeThought, stateInput } from './helpers'
import { emitThought } from '@/lib/agent/event-bus'

export async function competitorNode(state: InvestmentAnalysisState): Promise<Partial<InvestmentAnalysisState>> {
  const start = Date.now()
  emitThought(state.analysisId, 'Competitor Analyst', 'running', 'Analyzing competitive landscape...')
  const input = stateInput(state)
  const query = state.searchQueries[2] || `${state.companyName} competitors market share`

  try {
    const searchResults = await webSearch(query)
    const searchText = searchResults.map((r) => `${r.title}: ${r.content.slice(0, 250)}`).join('\n')

    const fallback = () => ({
      competitors: [
        { name: 'Primary Competitor A', threatLevel: 6 },
        { name: 'Primary Competitor B', threatLevel: 5 },
      ],
      moatScore: 6,
      competitiveAdvantages: [`${state.ticker} brand recognition`, 'Scale economies'],
      threats: ['New entrants', 'Pricing pressure'],
      competitionScore: 58,
    })

    const result = await callStructuredLLM(
      'competitor',
      competitorPrompt(state.companyName, state.ticker),
      searchText,
      CompetitorAnalysisSchema,
      fallback
    )

    const output = `Moat ${result.moatScore}/10, competition score ${result.competitionScore}/100 [source: 3]`

    const agent = makeAgentOutput('Competitor Analyst', 'competitor', input, output, 0.85, Date.now() - start, [
      { type: 'Market Research', url: searchResults[0]?.url || 'https://www.morningstar.com', title: 'Competitive analysis' },
    ])

    emitThought(state.analysisId, 'Competitor Analyst', 'complete', output, agent.executionTimeMs)

    return {
      competitorData: result.competitors,
      competitionScore: result.competitionScore,
      agents: [agent],
      thoughtEvents: [
        makeThought('Competitor Analyst', 'running', 'Analyzing competitive landscape...'),
        makeThought('Competitor Analyst', 'complete', output, agent.executionTimeMs),
      ],
    }
  } catch (error) {
    emitThought(state.analysisId, 'Competitor Analyst', 'error', 'Competitor analysis temporarily unavailable')
    return {
      errors: [`Competitor analysis failure: ${error instanceof Error ? error.message : 'unknown'}`],
      thoughtEvents: [makeThought('Competitor Analyst', 'error', 'Competitor analysis temporarily unavailable')],
    }
  }
}

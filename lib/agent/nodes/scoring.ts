import type { InvestmentAnalysisState } from '@/lib/agent/state'
import { buildScoreBreakdown, calculateCompositeScore, WEIGHTS } from '@/lib/agent/scoring'
import type { ExplainabilityPanel } from '@/lib/agent/types'
import { makeAgentOutput, makeThought, stateInput } from './helpers'
import { emitThought } from '@/lib/agent/event-bus'

/** Deterministic scoring engine — Bible Vol 7 */
export async function scoringNode(state: InvestmentAnalysisState): Promise<Partial<InvestmentAnalysisState>> {
  const start = Date.now()
  emitThought(state.analysisId, 'Scoring Engine', 'running', 'Computing deterministic scores...')
  const input = stateInput(state)

  const scores = buildScoreBreakdown(state.ticker, state.sector, {
    metrics: state.financialMetrics,
    newsArticles: state.newsArticles,
    competitorData: state.competitorData,
    sector: state.sector,
    riskTolerance: state.riskTolerance,
  })

  const explainability: ExplainabilityPanel = {
    weights: {
      financial: WEIGHTS.financial * 100,
      market: WEIGHTS.market * 100,
      sentiment: WEIGHTS.sentiment * 100,
      competition: WEIGHTS.competition * 100,
      risk: WEIGHTS.risk * 100,
    },
    scores,
    sources: state.citations.map((c) => ({ title: c.title, url: c.url, type: c.type })),
  }

  const output = `Composite: ${scores.composite}/100 | Financial ${scores.financial} | Market ${scores.market} | Sentiment ${scores.sentiment} | Competition ${scores.competition} | Risk ${scores.risk}`

  const agent = makeAgentOutput('Scoring Engine', 'scoring', input, output, 1, Date.now() - start)

  emitThought(state.analysisId, 'Scoring Engine', 'complete', output, agent.executionTimeMs)

  return {
    financialScore: scores.financial,
    marketScore: scores.market,
    sentimentScore: scores.sentiment,
    competitionScore: scores.competition,
    riskScore: scores.risk,
    compositeScore: scores.composite,
    explainability,
    agents: [agent],
    thoughtEvents: [
      makeThought('Scoring Engine', 'running', 'Computing deterministic scores...'),
      makeThought('Scoring Engine', 'complete', output, agent.executionTimeMs),
    ],
  }
}

import type { InvestmentAnalysisState } from '@/lib/agent/state'
import { calculateFinancialScore, calculateCompositeScore, WEIGHTS } from '@/lib/agent/scoring'
import type { ExplainabilityPanel } from '@/lib/agent/types'
import { makeAgentOutput, makeThought, stateInput } from './helpers'

/** Deterministic scoring engine — Bible Vol 7 */
export async function scoringNode(state: InvestmentAnalysisState): Promise<Partial<InvestmentAnalysisState>> {
  const start = Date.now()
  const input = stateInput(state)

  const metrics = state.financialMetrics
  const financial = metrics ? calculateFinancialScore(metrics) : 50
  const market = Math.max(0, Math.min(100, Math.round((financial + (state.competitionScore || 50)) / 2)))
  const sentiment = state.sentimentScore || 55
  const competition = state.competitionScore || 50
  const risk = Math.round(100 - financial * 0.4)

  const scores = calculateCompositeScore({ financial, market, sentiment, competition, risk })

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

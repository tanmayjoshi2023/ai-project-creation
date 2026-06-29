import type { AgentOutput, AgentInput } from '@/lib/agent/types'
import type { InvestmentAnalysisState, ThoughtEvent } from '@/lib/agent/state'

export function makeThought(agent: string, status: ThoughtEvent['status'], text: string, elapsedMs?: number): ThoughtEvent {
  return { agent, status, text, elapsedMs }
}

export function makeAgentOutput(
  agentName: string,
  agentType: string,
  input: AgentInput,
  output: string,
  confidence: number,
  executionTimeMs: number,
  sources: AgentOutput['sources'] = []
): AgentOutput {
  return {
    agentName,
    agentType,
    input,
    output,
    confidence,
    sources,
    executionTimeMs,
  }
}

export function stateInput(state: InvestmentAnalysisState): AgentInput {
  return {
    ticker: state.ticker,
    companyName: state.companyName,
    sector: state.sector,
    riskTolerance: state.riskTolerance,
  }
}

export function buildContextSummary(state: InvestmentAnalysisState): string {
  const parts: string[] = []
  if (state.financialMetrics) {
    parts.push(`Financial: P/E ${state.financialMetrics.peRatio}, growth ${state.financialMetrics.revenueGrowthYoY}`)
  }
  parts.push(`Scores: financial=${state.financialScore}, market=${state.marketScore}, sentiment=${state.sentimentScore}`)
  parts.push(`Competition score: ${state.competitionScore}, risk: ${state.riskScore}`)
  if (state.newsArticles.length) parts.push(`News articles: ${state.newsArticles.length}`)
  if (state.competitorData.length) parts.push(`Competitors: ${state.competitorData.map((c) => c.name).join(', ')}`)
  return parts.join('\n')
}

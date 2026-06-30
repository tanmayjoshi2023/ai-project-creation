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
  parts.push(`Company: ${state.companyName} (${state.ticker})`)
  parts.push(`Sector: ${state.sector}`)
  parts.push(`Risk tolerance: ${state.riskTolerance}`)

  if (state.financialMetrics) {
    parts.push(
      `Financial metrics: P/E ${state.financialMetrics.peRatio ?? 'N/A'}, revenue growth ${
        state.financialMetrics.revenueGrowthYoY ?? 'N/A'
      }, gross margin ${state.financialMetrics.grossMargin ?? 'N/A'}, debt/equity ${state.financialMetrics.debtToEquity ?? 'N/A'}`
    )
  }

  parts.push(
    `Scores: financial=${state.financialScore}, market=${state.marketScore}, sentiment=${state.sentimentScore}, competition=${state.competitionScore}, risk=${state.riskScore}`
  )

  if (state.newsArticles.length) {
    parts.push(`News coverage: ${state.newsArticles.length} articles available`)
  }
  if (state.competitorData.length) {
    parts.push(`Competitors: ${state.competitorData.map((c) => c.name).join(', ')}`)
  }
  if (state.citations.length) {
    parts.push(`Citations: ${state.citations.length} sources available`)
  }
  return parts.join('\n')
}

import type { InvestmentAnalysisState } from '@/lib/agent/state'
import { getFinancials, getSECFilings } from '@/lib/agent/tools'
import { makeAgentOutput, makeThought, stateInput } from './helpers'
import { emitThought } from '@/lib/agent/event-bus'

/** Deterministic — no LLM (Bible Vol 5 Agent 2) */
export async function financialNode(state: InvestmentAnalysisState): Promise<Partial<InvestmentAnalysisState>> {
  const start = Date.now()
  emitThought(state.analysisId, 'Financial Analyst', 'running', 'Fetching financial statements...')
  const input = stateInput(state)

  try {
    const [financials, filings] = await Promise.all([
      getFinancials(state.ticker),
      getSECFilings(state.ticker),
    ])

    const citations = filings.map((f, i) => ({
      index: state.citations.length + i + 1,
      title: `${f.formType} — ${state.ticker}`,
      url: f.url,
      type: 'sec_filing',
    }))

    const output = `P/E ${financials.peRatio?.toFixed(1) ?? 'N/A'}, revenue growth ${((financials.revenueGrowthYoY ?? 0) * 100).toFixed(1)}%, gross margin ${((financials.grossMargin ?? 0) * 100).toFixed(1)}%, D/E ${financials.debtToEquity?.toFixed(2) ?? 'N/A'} [source: 1]${financials.stale ? ' (cached/stale data)' : ''}`

    const agent = makeAgentOutput(
      'Financial Analyst',
      'financial',
      input,
      output,
      financials.stale ? 0.75 : 0.88,
      Date.now() - start,
      [{ type: 'SEC Filing', url: filings[0]?.url || `https://www.sec.gov/cgi-bin/browse-edgar?CIK=${state.ticker}`, title: 'SEC EDGAR' }]
    )

    emitThought(state.analysisId, 'Financial Analyst', 'complete', output, agent.executionTimeMs)

    return {
      financialMetrics: {
        peRatio: financials.peRatio,
        revenueGrowthYoY: financials.revenueGrowthYoY,
        debtToEquity: financials.debtToEquity,
        grossMargin: financials.grossMargin,
        freeCashFlowYield: financials.freeCashFlowYield,
      },
      secFilings: filings,
      citations,
      agents: [agent],
      thoughtEvents: [
        makeThought('Financial Analyst', 'running', 'Fetching financial statements...'),
        makeThought('Financial Analyst', 'complete', output, agent.executionTimeMs),
      ],
      dataQualityScore: financials.stale ? 0.7 : 1,
    }
  } catch (error) {
    emitThought(state.analysisId, 'Financial Analyst', 'error', 'Financial data temporarily unavailable')
    return {
      errors: [`Financial API failure: ${error instanceof Error ? error.message : 'unknown'}`],
      thoughtEvents: [makeThought('Financial Analyst', 'error', 'Financial data temporarily unavailable')],
    }
  }
}

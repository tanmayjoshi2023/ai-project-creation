import { getMockFinancialMetrics } from '@/lib/agent/scoring'
import type { FinancialMetrics } from '@/lib/agent/types'
import { FinancialMetricsSchema } from '@/lib/agent/schemas'

export interface FinancialDataResult extends FinancialMetrics {
  ticker: string
  source: 'alpha_vantage' | 'yahoo_finance' | 'manual'
  stale?: boolean
}

async function fetchAlphaVantage(ticker: string): Promise<FinancialDataResult | null> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY
  if (!apiKey) return null

  try {
    const url = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${apiKey}`
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    const data = await res.json()
    if (data.Note || data.Information || !data.Symbol) return null

    return FinancialMetricsSchema.parse({
      ticker,
      peRatio: data.PERatio ? parseFloat(data.PERatio) : null,
      revenueGrowthYoY: data.QuarterlyRevenueGrowthYOY
        ? parseFloat(data.QuarterlyRevenueGrowthYOY)
        : null,
      debtToEquity: data.DebtToEquity ? parseFloat(data.DebtToEquity) : null,
      grossMargin: data.GrossProfitTTM && data.RevenueTTM
        ? parseFloat(data.GrossProfitTTM) / parseFloat(data.RevenueTTM)
        : null,
      freeCashFlowYield: null,
      source: 'alpha_vantage',
    })
  } catch {
    return null
  }
}

export async function getFinancials(ticker: string): Promise<FinancialDataResult> {
  const live = await fetchAlphaVantage(ticker)
  if (live) return live

  const mock = getMockFinancialMetrics(ticker)
  return {
    ...mock,
    ticker,
    source: 'manual',
    stale: true,
  }
}

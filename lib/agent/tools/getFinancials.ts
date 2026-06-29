import YahooFinance from 'yahoo-finance2'
import type { FinancialMetrics } from '@/lib/agent/types'
import { FinancialMetricsSchema } from '@/lib/agent/schemas'
import { getMockFinancialMetrics } from '@/lib/agent/scoring'
import { fetchWithTimeout, cached } from './http'

export interface FinancialDataResult extends FinancialMetrics {
  ticker: string
  source: 'alpha_vantage' | 'yahoo_finance' | 'manual'
  stale?: boolean
}

const yfInstance = new (YahooFinance as any)({ suppressNotices: ['yahooSurvey'] })

async function fetchAlphaVantage(ticker: string): Promise<FinancialDataResult | null> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY
  if (!apiKey) return null

  try {
    const url = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${encodeURIComponent(ticker)}&apikey=${apiKey}`
    const res = await fetchWithTimeout(url, { next: { revalidate: 3600 } } as RequestInit)
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

async function fetchYahooFinance(ticker: string): Promise<FinancialDataResult | null> {
  try {
    // yahoo-finance2 has its own internal fetch; guard with a timeout race so a
    // hung request can never stall the pipeline.
    const result = await Promise.race([
      yfInstance.quoteSummary(ticker, {
        modules: ['summaryDetail', 'financialData', 'defaultKeyStatistics'],
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('yahoo timeout')), 8_000)),
    ])
    if (!result) return null

    const peRatio = result.summaryDetail?.trailingPE || result.defaultKeyStatistics?.forwardPE || null
    const revenueGrowthYoY = result.financialData?.revenueGrowth || null
    const rawDebt = result.financialData?.debtToEquity
    const debtToEquity = typeof rawDebt === 'number' ? rawDebt / 100 : null
    const grossMargin = result.financialData?.grossMargins || null

    const freeCashflow = result.financialData?.freeCashflow || null
    const marketCap = result.summaryDetail?.marketCap || null
    const freeCashFlowYield = (freeCashflow && marketCap) ? freeCashflow / marketCap : null

    return FinancialMetricsSchema.parse({
      ticker,
      peRatio,
      revenueGrowthYoY,
      debtToEquity,
      grossMargin,
      freeCashFlowYield,
      source: 'yahoo_finance',
    })
  } catch (error) {
    console.error('[fetchYahooFinance] failed:', error)
    return null
  }
}

/**
 * Fetch financial metrics. Tries live providers first (cached for 10 min), then
 * degrades to deterministic ticker-seeded metrics flagged `stale` so the rest of
 * the pipeline always has data to work with instead of crashing.
 */
export async function getFinancials(ticker: string): Promise<FinancialDataResult> {
  return cached(`financials:${ticker}`, async () => {
    const liveAV = await fetchAlphaVantage(ticker)
    if (liveAV) return liveAV

    const liveYF = await fetchYahooFinance(ticker)
    if (liveYF) return liveYF

    console.warn(`[getFinancials] live providers unavailable for ${ticker}, using deterministic fallback`)
    const mock = getMockFinancialMetrics(ticker)
    return { ticker, ...mock, source: 'manual' as const, stale: true }
  })
}

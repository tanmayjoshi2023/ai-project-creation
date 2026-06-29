import YahooFinance from 'yahoo-finance2'
import type { FinancialMetrics } from '@/lib/agent/types'
import { FinancialMetricsSchema } from '@/lib/agent/schemas'

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

async function fetchYahooFinance(ticker: string): Promise<FinancialDataResult | null> {
  try {
    const result = await yfInstance.quoteSummary(ticker, {
      modules: ['summaryDetail', 'financialData', 'defaultKeyStatistics']
    })
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

export async function getFinancials(ticker: string): Promise<FinancialDataResult> {
  const liveAV = await fetchAlphaVantage(ticker)
  if (liveAV) return liveAV

  const liveYF = await fetchYahooFinance(ticker)
  if (liveYF) return liveYF

  throw new Error(`Failed to fetch live financials for ticker ${ticker}. Make sure the ticker is valid and networks are connected.`)
}

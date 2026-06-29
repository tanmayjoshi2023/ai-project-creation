import type { SECFiling } from '@/lib/agent/state'
import { fetchWithTimeout, cached } from './http'

/**
 * Fetch recent SEC filings from EDGAR full-text search. Non-fatal: any failure
 * (timeout, rate limit, no results) returns an empty list so the financial agent
 * can still report metrics.
 */
export async function getSECFilings(ticker: string): Promise<SECFiling[]> {
  return cached(`sec:${ticker}`, async () => {
    try {
      const res = await fetchWithTimeout(
        `https://efts.sec.gov/LATEST/search-index?q=${encodeURIComponent(ticker)}&forms=10-K,10-Q,8-K`,
        { headers: { 'User-Agent': 'InvestIQ Research Agent contact@investiq.app' } }
      )
      if (!res.ok) return []
      const data = await res.json()
      const hits = data?.hits?.hits || []
      if (hits.length === 0) return []
      return hits.slice(0, 3).map((hit: { _source: { form_type: string; file_date: string; file_url: string } }) => ({
        formType: hit._source.form_type,
        filingDate: hit._source.file_date,
        url: hit._source.file_url || `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${ticker}`,
        summary: `${hit._source.form_type} filing for ${ticker}`,
      }))
    } catch (error) {
      console.warn('[getSECFilings] non-fatal failure:', error instanceof Error ? error.message : error)
      return []
    }
  })
}

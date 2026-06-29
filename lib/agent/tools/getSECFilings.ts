import type { SECFiling } from '@/lib/agent/state'

export async function getSECFilings(ticker: string): Promise<SECFiling[]> {
  try {
    const res = await fetch(
      `https://efts.sec.gov/LATEST/search-index?q=${encodeURIComponent(ticker)}&forms=10-K,10-Q,8-K`,
      { headers: { 'User-Agent': 'InvestIQ Research Agent contact@investiq.app' } }
    )
    if (!res.ok) {
      throw new Error(`SEC EDGAR query returned status ${res.status}`)
    }
    const data = await res.json()
    const hits = data?.hits?.hits || []
    if (hits.length === 0) {
      throw new Error(`No SEC filings found in EDGAR index for ticker ${ticker}`)
    }
    return hits.slice(0, 3).map((hit: { _source: { form_type: string; file_date: string; file_url: string } }) => ({
      formType: hit._source.form_type,
      filingDate: hit._source.file_date,
      url: hit._source.file_url || `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${ticker}`,
      summary: `${hit._source.form_type} filing for ${ticker}`,
    }))
  } catch (error) {
    console.error('[getSECFilings] failed:', error)
    throw new Error(`Failed to fetch SEC filings for ticker ${ticker}: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

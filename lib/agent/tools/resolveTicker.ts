import { companies } from '@/lib/company-data'
import { sanitizeCompanyInput } from '@/lib/security/sanitize'

export interface TickerResult {
  ticker: string
  name: string
  sector: string
  found: boolean
  suggestions?: Array<{ ticker: string; name: string }>
}

export async function resolveTicker(query: string): Promise<TickerResult> {
  const q = sanitizeCompanyInput(query).toUpperCase()
  const byTicker = companies.find((c) => c.ticker === q)
  if (byTicker) {
    return { ticker: byTicker.ticker, name: byTicker.name, sector: byTicker.sector, found: true }
  }

  const byName = companies.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
  if (byName.length === 1) {
    return { ticker: byName[0].ticker, name: byName[0].name, sector: byName[0].sector, found: true }
  }

  if (byName.length > 1) {
    return {
      ticker: byName[0].ticker,
      name: byName[0].name,
      sector: byName[0].sector,
      found: true,
      suggestions: byName.slice(0, 3).map((c) => ({ ticker: c.ticker, name: c.name })),
    }
  }

  // Allow unknown tickers (1-5 uppercase letters) for demo
  if (/^[A-Z]{1,5}$/.test(q)) {
    return { ticker: q, name: q, sector: 'Unknown', found: true }
  }

  return {
    ticker: q,
    name: query,
    sector: 'Unknown',
    found: false,
    suggestions: companies.slice(0, 3).map((c) => ({ ticker: c.ticker, name: c.name })),
  }
}

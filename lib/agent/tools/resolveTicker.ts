import { companies } from '@/lib/company-data'
import { sanitizeCompanyInput } from '@/lib/security/sanitize'
import { isLLMEnabled, callStructuredLLM } from '@/lib/agent/llm'
import { z } from 'zod'

export interface TickerResult {
  ticker: string
  name: string
  sector: string
  found: boolean
  suggestions?: Array<{ ticker: string; name: string }>
}

async function searchYahooFinance(query: string): Promise<TickerResult | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}`
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    })
    if (res.ok) {
      const data = await res.json()
      const quote = data.quotes?.[0]
      if (quote && quote.symbol) {
        return {
          ticker: quote.symbol.toUpperCase(),
          name: quote.shortname || quote.longname || quote.symbol,
          sector: quote.industry || quote.sector || 'Unknown',
          found: true,
        }
      }
    }
  } catch (err) {
    console.error('Yahoo Finance search failed:', err)
  }
  return null
}

async function searchAlphaVantage(keywords: string): Promise<TickerResult | null> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY
  if (!apiKey) return null
  try {
    const url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(keywords)}&apikey=${apiKey}`
    const res = await fetch(url)
    if (res.ok) {
      const data = await res.json()
      const match = data.bestMatches?.[0]
      if (match) {
        return {
          ticker: match['1. symbol'].toUpperCase(),
          name: match['2. name'],
          sector: match['8. currency'] || 'Unknown',
          found: true,
        }
      }
    }
  } catch (err) {
    console.error('Alpha Vantage symbol search failed:', err)
  }
  return null
}

export async function resolveTicker(query: string): Promise<TickerResult> {
  const cleanQuery = query.trim()
  const q = sanitizeCompanyInput(cleanQuery).toUpperCase()

  // 1. Try local exact ticker match
  const byTicker = companies.find((c) => c.ticker === q)
  if (byTicker) {
    return { ticker: byTicker.ticker, name: byTicker.name, sector: byTicker.sector, found: true }
  }

  // 2. Try local fuzzy name match
  const byName = companies.filter((c) => c.name.toLowerCase().includes(cleanQuery.toLowerCase()))
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

  // 3. Try Yahoo Finance public search
  const yahooResult = await searchYahooFinance(cleanQuery)
  if (yahooResult) return yahooResult

  // 4. Try Alpha Vantage symbol search
  const avResult = await searchAlphaVantage(cleanQuery)
  if (avResult) return avResult

  // 5. Try LLM resolution if enabled
  if (isLLMEnabled()) {
    try {
      const resolved = await callStructuredLLM(
        'planner',
        'You are an expert investment data assistant. Resolve companies to tickers.',
        `Task: Resolve the company name or search query "${cleanQuery}" to its official stock ticker, official company name, and industry sector. Respond with JSON matching the schema.`,
        z.object({
          ticker: z.string(),
          name: z.string(),
          sector: z.string(),
        }),
        () => null
      )
      if (resolved && resolved.ticker) {
        return {
          ticker: resolved.ticker.toUpperCase(),
          name: resolved.name,
          sector: resolved.sector,
          found: true
        }
      }
    } catch (e) {
      console.warn("Failed to resolve ticker via LLM:", e)
    }
  }

  // 6. Support any standard ticker pattern (up to 12 characters, e.g. RELIANCE.NS)
  if (/^[A-Z0-9.\-]{1,12}$/i.test(q)) {
    return { ticker: q, name: cleanQuery, sector: 'Unknown', found: true }
  }

  return {
    ticker: q,
    name: cleanQuery,
    sector: 'Unknown',
    found: false,
    suggestions: companies.slice(0, 3).map((c) => ({ ticker: c.ticker, name: c.name })),
  }
}

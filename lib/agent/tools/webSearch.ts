import { fetchWithTimeout, cached } from './http'

export interface WebSearchResult {
  title: string
  url: string
  content: string
  publishedAt?: string
  score?: number
}

function cleanXmlString(str: string): string {
  return str
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
}

async function fetchGoogleNews(query: string, maxResults = 5): Promise<WebSearchResult[]> {
  try {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`
    const res = await fetchWithTimeout(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      next: { revalidate: 3600 },
    } as RequestInit)
    if (!res.ok) return []

    const xml = await res.text()
    const items: WebSearchResult[] = []
    const matches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g)
    for (const match of matches) {
      const content = match[1]
      const titleMatch = content.match(/<title>([\s\S]*?)<\/title>/)
      const linkMatch = content.match(/<link>([\s\S]*?)<\/link>/)
      const dateMatch = content.match(/<pubDate>([\s\S]*?)<\/pubDate>/)

      if (titleMatch && linkMatch) {
        items.push({
          title: cleanXmlString(titleMatch[1]),
          url: cleanXmlString(linkMatch[1]),
          content: `Latest search result about: ${query}`,
          publishedAt: dateMatch ? new Date(dateMatch[1]).toISOString() : new Date().toISOString(),
          score: 0.8,
        })
      }
      if (items.length >= maxResults) break
    }
    return items
  } catch (error) {
    console.warn('[fetchGoogleNews] non-fatal failure:', error instanceof Error ? error.message : error)
    return []
  }
}

async function fetchTavily(query: string, maxResults: number): Promise<WebSearchResult[]> {
  const apiKey = process.env.TAVILY_API_KEY
  if (!apiKey) return []
  try {
    const res = await fetchWithTimeout('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: apiKey, query, max_results: maxResults, include_answer: false }),
    })
    if (!res.ok) return []
    const data = await res.json()
    return (data.results || []).map((r: { title: string; url: string; content: string; published_date?: string; score?: number }) => ({
      title: r.title,
      url: r.url,
      content: r.content,
      publishedAt: r.published_date,
      score: r.score,
    }))
  } catch (error) {
    console.warn('[webSearch] Tavily non-fatal failure:', error instanceof Error ? error.message : error)
    return []
  }
}

/**
 * Web search with graceful degradation. Tries Tavily (if configured) then Google
 * News RSS. Returns an empty array (never throws) so news/competitor agents can
 * continue with partial data. Cached per query for 10 minutes.
 */
export async function webSearch(query: string, maxResults = 5): Promise<WebSearchResult[]> {
  return cached(`search:${query}`, async () => {
    const tavily = await fetchTavily(query, maxResults)
    if (tavily.length > 0) return tavily
    return fetchGoogleNews(query, maxResults)
  })
}

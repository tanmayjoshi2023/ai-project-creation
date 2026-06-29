import type { NewsArticle } from '@/lib/agent/state'

export function getSentiment(articles: NewsArticle[]): number {
  if (articles.length === 0) return 50

  const now = Date.now()
  let weightedSum = 0
  let weightTotal = 0

  for (const article of articles) {
    const age = now - new Date(article.publishedAt).getTime()
    const daysOld = age / 86400000
    const weight = daysOld <= 7 ? 3 : 1
    const normalizedSentiment = ((article.sentiment + 1) / 2) * 100
    weightedSum += normalizedSentiment * weight * article.relevanceScore
    weightTotal += weight * article.relevanceScore
  }

  return weightTotal > 0 ? Math.round(weightedSum / weightTotal) : 50
}

export function articlesFromSearch(
  results: Array<{ title: string; url: string; content: string; publishedAt?: string; score?: number }>
): NewsArticle[] {
  return results.map((r, i) => ({
    title: r.title,
    url: r.url,
    publishedAt: r.publishedAt || new Date().toISOString(),
    sentiment: i === 0 ? 0.4 : i === 1 ? -0.2 : 0.1,
    relevanceScore: r.score ?? 0.7,
    keyQuote: r.content.slice(0, 200),
  }))
}

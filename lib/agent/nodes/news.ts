import type { InvestmentAnalysisState } from '@/lib/agent/state'
import { webSearch, articlesFromSearch, getSentiment } from '@/lib/agent/tools'
import { makeAgentOutput, makeThought, stateInput } from './helpers'
import { emitThought } from '@/lib/agent/event-bus'

/**
 * News Analyst — deterministic (no LLM). Fetches live headlines and derives a
 * sentiment score with the deterministic scorer. Degrades to a neutral score
 * when search yields nothing, never crashing the pipeline.
 */
export async function newsNode(state: InvestmentAnalysisState): Promise<Partial<InvestmentAnalysisState>> {
  const start = Date.now()
  emitThought(state.analysisId, 'News Analyst', 'running', 'Searching recent news...')
  const input = stateInput(state)
  const query = state.searchQueries[0] || `${state.companyName} stock news`

  try {
    const searchResults = await webSearch(query)
    const articles = articlesFromSearch(searchResults)
    const sentimentScore = getSentiment(articles)

    const citations = articles.slice(0, 3).map((a, i) => ({
      index: state.citations.length + i + 1,
      title: a.title,
      url: a.url,
      type: 'news',
    }))

    const output = articles.length
      ? `Sentiment score: ${sentimentScore}/100 from ${articles.length} articles [source: 2]`
      : `No recent headlines found; using neutral sentiment ${sentimentScore}/100`

    const agent = makeAgentOutput(
      'News Analyst',
      'news',
      input,
      output,
      articles.length ? 0.82 : 0.5,
      Date.now() - start,
      articles.slice(0, 2).map((a) => ({ type: 'News', url: a.url, title: a.title }))
    )

    emitThought(state.analysisId, 'News Analyst', 'complete', output, agent.executionTimeMs)

    return {
      newsArticles: articles,
      sentimentScore,
      citations,
      agents: [agent],
      thoughtEvents: [
        makeThought('News Analyst', 'running', 'Searching recent news...'),
        makeThought('News Analyst', 'complete', output, agent.executionTimeMs),
      ],
    }
  } catch (error) {
    // Graceful degradation — continue with neutral sentiment.
    const output = 'News search unavailable; using neutral sentiment 50/100'
    const agent = makeAgentOutput('News Analyst', 'news', input, output, 0.5, Date.now() - start)
    emitThought(state.analysisId, 'News Analyst', 'complete', output, agent.executionTimeMs)
    return {
      sentimentScore: 50,
      agents: [agent],
      errors: [`News search degraded: ${error instanceof Error ? error.message : 'unknown'}`],
      thoughtEvents: [
        makeThought('News Analyst', 'running', 'Searching recent news...'),
        makeThought('News Analyst', 'complete', output, agent.executionTimeMs),
      ],
    }
  }
}

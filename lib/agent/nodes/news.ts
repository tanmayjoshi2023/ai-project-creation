import type { InvestmentAnalysisState } from '@/lib/agent/state'
import { callStructuredLLM } from '@/lib/agent/llm'
import { NewsAnalysisSchema } from '@/lib/agent/schemas'
import { newsPrompt } from '@/lib/agent/prompts'
import { webSearch, articlesFromSearch, getSentiment } from '@/lib/agent/tools'
import { makeAgentOutput, makeThought, stateInput } from './helpers'

export async function newsNode(state: InvestmentAnalysisState): Promise<Partial<InvestmentAnalysisState>> {
  const start = Date.now()
  const input = stateInput(state)
  const query = state.searchQueries[0] || `${state.companyName} news`

  const searchResults = await webSearch(query)
  const articlesText = searchResults.map((r, i) => `[${i + 1}] ${r.title}: ${r.content.slice(0, 300)}`).join('\n')

  const fallbackArticles = articlesFromSearch(searchResults)
  const fallback = () => ({
    articles: fallbackArticles,
    sentimentScore: getSentiment(fallbackArticles),
  })

  const result = await callStructuredLLM(
    'news',
    newsPrompt(state.companyName, state.ticker),
    articlesText,
    NewsAnalysisSchema,
    fallback
  )

  const citations = result.articles.slice(0, 3).map((a, i) => ({
    index: state.citations.length + i + 1,
    title: a.title,
    url: a.url,
    type: 'news',
  }))

  const output = `Sentiment score: ${result.sentimentScore}/100 from ${result.articles.length} articles [source: 2]`

  const agent = makeAgentOutput(
    'News Analyst',
    'news',
    input,
    output,
    0.82,
    Date.now() - start,
    result.articles.slice(0, 2).map((a) => ({ type: 'News', url: a.url, title: a.title }))
  )

  return {
    newsArticles: result.articles,
    sentimentScore: result.sentimentScore,
    citations,
    agents: [agent],
    thoughtEvents: [
      makeThought('News Analyst', 'running', 'Searching recent news...'),
      makeThought('News Analyst', 'complete', output, agent.executionTimeMs),
    ],
  }
}

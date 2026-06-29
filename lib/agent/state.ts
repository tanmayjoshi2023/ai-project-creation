/**
 * LangGraph state — Engineering Bible Vol 3 §3.3
 */
import { Annotation } from '@langchain/langgraph'
import type {
  AgentOutput,
  ExplainabilityPanel,
  FinancialMetrics,
  RiskTolerance,
  Verdict,
} from './types'

export interface NewsArticle {
  title: string
  url: string
  publishedAt: string
  sentiment: number
  relevanceScore: number
  keyQuote?: string
}

export interface SECFiling {
  formType: string
  url: string
  filingDate: string
  summary?: string
}

export interface CompetitorProfile {
  name: string
  ticker?: string
  marketShareEstimate?: string
  threatLevel: number
}

export interface BullPoint {
  point: string
  sourceIndex: number
  specificity: number
}

export interface BearPoint {
  point: string
  sourceIndex: number
  severity: number
}

export interface Citation {
  index: number
  title: string
  url: string
  type: string
}

export interface ResearchStep {
  step: string
  agent: string
}

export interface ThoughtEvent {
  agent: string
  status: 'running' | 'complete' | 'error'
  text: string
  elapsedMs?: number
}

function appendReducer<T>(existing: T[], update: T[] | T): T[] {
  if (Array.isArray(update)) return [...existing, ...update]
  return [...existing, update]
}

export const InvestmentAnalysisAnnotation = Annotation.Root({
  // Input
  companyName: Annotation<string>,
  ticker: Annotation<string>,
  userId: Annotation<string>,
  analysisId: Annotation<string>,
  riskTolerance: Annotation<RiskTolerance>,

  // Planner output
  sector: Annotation<string>,
  researchPlan: Annotation<ResearchStep[]>({
    reducer: appendReducer,
    default: () => [],
  }),
  searchQueries: Annotation<string[]>({
    reducer: appendReducer,
    default: () => [],
  }),

  // Research data
  financialMetrics: Annotation<FinancialMetrics | null>,
  newsArticles: Annotation<NewsArticle[]>({
    reducer: appendReducer,
    default: () => [],
  }),
  secFilings: Annotation<SECFiling[]>({
    reducer: appendReducer,
    default: () => [],
  }),
  competitorData: Annotation<CompetitorProfile[]>({
    reducer: appendReducer,
    default: () => [],
  }),
  citations: Annotation<Citation[]>({
    reducer: appendReducer,
    default: () => [],
  }),

  // Deterministic scores (Vol 7)
  financialScore: Annotation<number>,
  marketScore: Annotation<number>,
  sentimentScore: Annotation<number>,
  competitionScore: Annotation<number>,
  riskScore: Annotation<number>,
  compositeScore: Annotation<number>,

  // Debate output
  bullCase: Annotation<BullPoint[]>({
    reducer: appendReducer,
    default: () => [],
  }),
  bearCase: Annotation<BearPoint[]>({
    reducer: appendReducer,
    default: () => [],
  }),
  bullConfidence: Annotation<number>,
  bearConfidence: Annotation<number>,

  // Final verdict
  verdict: Annotation<Verdict>,
  confidenceScore: Annotation<number>,
  reasoning: Annotation<string>,
  explainability: Annotation<ExplainabilityPanel | null>,
  groundingScore: Annotation<number>,
  uncitedClaims: Annotation<string[]>({
    reducer: appendReducer,
    default: () => [],
  }),

  // Pipeline metadata
  agents: Annotation<AgentOutput[]>({
    reducer: appendReducer,
    default: () => [],
  }),
  thoughtEvents: Annotation<ThoughtEvent[]>({
    reducer: appendReducer,
    default: () => [],
  }),
  errors: Annotation<string[]>({
    reducer: appendReducer,
    default: () => [],
  }),
  dataQualityScore: Annotation<number>,
  startedAt: Annotation<number>,
})

export type InvestmentAnalysisState = typeof InvestmentAnalysisAnnotation.State

export function createInitialState(input: {
  ticker: string
  companyName?: string
  userId?: string
  sector?: string
  riskTolerance?: RiskTolerance
  analysisId?: string
}): Partial<InvestmentAnalysisState> {
  return {
    ticker: input.ticker.toUpperCase(),
    companyName: input.companyName || input.ticker.toUpperCase(),
    userId: input.userId || 'anonymous',
    riskTolerance: input.riskTolerance || 'moderate',
    sector: input.sector || 'Unknown',
    analysisId: input.analysisId || `offline-${Date.now()}`,
    financialMetrics: null,
    financialScore: 0,
    marketScore: 0,
    sentimentScore: 0,
    competitionScore: 0,
    riskScore: 0,
    compositeScore: 0,
    bullConfidence: 0,
    bearConfidence: 0,
    confidenceScore: 0,
    groundingScore: 0,
    dataQualityScore: 1,
    explainability: null,
    reasoning: '',
    startedAt: Date.now(),
  }
}

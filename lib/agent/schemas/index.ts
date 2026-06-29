import { z } from 'zod'

export const CitationSchema = z.object({
  index: z.number().int().positive(),
  title: z.string(),
  url: z.string().url(),
  type: z.string(),
})

export const PlannerOutputSchema = z.object({
  ticker: z.string().min(1).max(10),
  sector: z.string(),
  researchPlan: z.array(
    z.object({
      step: z.string(),
      agent: z.string(),
    })
  ),
  searchQueries: z.array(z.string()).min(1).max(10),
})

export const BullPointSchema = z.object({
  point: z.string().min(10),
  sourceIndex: z.number().int().positive(),
  specificity: z.number().min(1).max(5),
})

export const BearPointSchema = z.object({
  point: z.string().min(10),
  sourceIndex: z.number().int().positive(),
  severity: z.number().min(1).max(5),
})

export const BullCaseSchema = z.object({
  points: z.array(BullPointSchema).min(3).max(5),
  bullConfidence: z.number().min(0).max(100),
})

export const BearCaseSchema = z.object({
  points: z.array(BearPointSchema).min(3).max(5),
  bearConfidence: z.number().min(0).max(100),
})

export const VerdictSchema = z.object({
  verdict: z.enum(['BUY', 'HOLD', 'PASS']),
  confidenceScore: z.number().min(0).max(95),
  reasoning: z.string().min(100).max(500),
  bullPointsUsed: z.array(z.number()),
  bearPointsUsed: z.array(z.number()),
  contestedPoints: z.array(z.string()),
})

export const VerifierOutputSchema = z.object({
  groundingScore: z.number().min(0).max(1),
  uncitedClaims: z.array(z.string()),
  verifiedCitations: z.array(CitationSchema),
})

export const NewsAnalysisSchema = z.object({
  articles: z.array(
    z.object({
      title: z.string(),
      url: z.string(),
      publishedAt: z.string(),
      sentiment: z.number().min(-1).max(1),
      relevanceScore: z.number().min(0).max(1),
      keyQuote: z.string().optional(),
    })
  ),
  sentimentScore: z.number().min(0).max(100),
})

export const CompetitorAnalysisSchema = z.object({
  competitors: z.array(
    z.object({
      name: z.string(),
      ticker: z.string().optional(),
      marketShareEstimate: z.string().optional(),
      threatLevel: z.number().min(1).max(10),
    })
  ),
  moatScore: z.number().min(1).max(10),
  competitiveAdvantages: z.array(z.string()),
  threats: z.array(z.string()),
  competitionScore: z.number().min(0).max(100),
})

export const FinancialMetricsSchema = z.object({
  ticker: z.string(),
  peRatio: z.number().positive().nullable(),
  revenueGrowthYoY: z.number().min(-1).max(10).nullable(),
  debtToEquity: z.number().min(0).nullable(),
  grossMargin: z.number().min(0).max(1).nullable(),
  freeCashFlowYield: z.number().nullable(),
  source: z.enum(['alpha_vantage', 'yahoo_finance', 'manual']),
})

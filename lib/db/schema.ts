import { pgTable, text, timestamp, boolean, varchar, integer, real, jsonb, index, unique, pgEnum } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

// ============================================================================
// BETTER AUTH TABLES (Required - Do not modify)
// ============================================================================

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId').notNull(),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId').notNull(),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt'),
  updatedAt: timestamp('updatedAt'),
})

// ============================================================================
// INVESTIQ APP TABLES
// ============================================================================

// Enum for analysis status
export const analysisStatusEnum = pgEnum('analysis_status', [
  'pending',
  'processing',
  'completed',
  'failed',
])

// Enum for investment verdict
export const verdictEnum = pgEnum('verdict', [
  'BUY',
  'HOLD',
  'PASS',
])

// Companies analyzed
export const companies = pgTable(
  'companies',
  {
    id: text('id').primaryKey(),
    userId: text('userId').notNull(),
    ticker: varchar('ticker', { length: 20 }).notNull(),
    name: text('name').notNull(),
    sector: text('sector'),
    industry: text('industry'),
    country: text('country'),
    website: text('website'),
    description: text('description'),
    marketCap: real('marketCap'),
    peRatio: real('peRatio'),
    bookValue: real('bookValue'),
    epsLatest: real('epsLatest'),
    revenueLatest: real('revenueLatest'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (table) => [
    unique('unique_user_ticker').on(table.userId, table.ticker),
    index('idx_ticker').on(table.ticker),
    index('idx_userId').on(table.userId),
  ]
)

// Analysis records (one per company analysis)
export const analyses = pgTable(
  'analyses',
  {
    id: text('id').primaryKey(),
    userId: text('userId').notNull(),
    companyId: text('companyId').notNull(),
    ticker: varchar('ticker', { length: 20 }).notNull(),
    status: analysisStatusEnum('status').notNull().default('pending'),
    verdict: verdictEnum('verdict'),
    confidence: real('confidence'), // 0-1
    summary: text('summary'),
    reasoning: text('reasoning'), // JSON stringified
    sources: jsonb('sources'), // Array of source citations
    agentOutputs: jsonb('agentOutputs'), // Raw outputs from all 8 agents
    estimatedValue: real('estimatedValue'),
    bullArguments: text('bullArguments'),
    bearArguments: text('bearArguments'),
    riskScore: real('riskScore'), // 0-100
    opportunityScore: real('opportunityScore'), // 0-100
    hallucinations: jsonb('hallucinations'), // Any detected hallucinations
    processingTimeMs: integer('processingTimeMs'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (table) => [
    index('idx_userId_analysis').on(table.userId),
    index('idx_companyId_analysis').on(table.companyId),
    index('idx_ticker_analysis').on(table.ticker),
    index('idx_status_analysis').on(table.status),
  ]
)

// Detailed agent outputs (one row per agent per analysis)
export const agentExecutions = pgTable(
  'agent_executions',
  {
    id: text('id').primaryKey(),
    analysisId: text('analysisId').notNull(),
    agentName: varchar('agentName', { length: 50 }).notNull(),
    agentType: varchar('agentType', { length: 50 }).notNull(), // 'planner', 'financial', 'news', 'competitor', 'bull', 'bear', 'judge', 'verifier'
    input: jsonb('input'),
    output: text('output'),
    reasoning: text('reasoning'),
    confidence: real('confidence'),
    sources: jsonb('sources'),
    executionTimeMs: integer('executionTimeMs'),
    tokenUsage: jsonb('tokenUsage'), // { input, output, total }
    createdAt: timestamp('createdAt').notNull().defaultNow(),
  },
  (table) => [index('idx_analysisId_agent').on(table.analysisId)]
)

// Source citations (each claim linked to sources)
export const sources = pgTable(
  'sources',
  {
    id: text('id').primaryKey(),
    analysisId: text('analysisId').notNull(),
    url: text('url').notNull(),
    title: text('title'),
    content: text('content'),
    source: varchar('source', { length: 100 }), // 'news', 'financial_statement', 'sec_filing', 'analyst_report', etc.
    relevanceScore: real('relevanceScore'),
    publishedAt: timestamp('publishedAt'),
    retrievedAt: timestamp('retrievedAt').notNull().defaultNow(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
  },
  (table) => [index('idx_analysisId_sources').on(table.analysisId)]
)

// User portfolios (for portfolio-level features)
export const portfolios = pgTable(
  'portfolios',
  {
    id: text('id').primaryKey(),
    userId: text('userId').notNull().unique(),
    name: text('name').notNull().default('My Portfolio'),
    description: text('description'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (table) => [index('idx_userId_portfolio').on(table.userId)]
)

// Portfolio holdings
export const holdings = pgTable(
  'holdings',
  {
    id: text('id').primaryKey(),
    portfolioId: text('portfolioId').notNull(),
    companyId: text('companyId').notNull(),
    ticker: varchar('ticker', { length: 20 }).notNull(),
    quantity: real('quantity').notNull(),
    averageCost: real('averageCost').notNull(),
    currentPrice: real('currentPrice'),
    purchaseDate: timestamp('purchaseDate').notNull().defaultNow(),
    notes: text('notes'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (table) => [
    index('idx_portfolioId_holdings').on(table.portfolioId),
    index('idx_companyId_holdings').on(table.companyId),
  ]
)

// Backtesting scenarios
export const backtests = pgTable(
  'backtests',
  {
    id: text('id').primaryKey(),
    userId: text('userId').notNull(),
    name: text('name').notNull(),
    startDate: timestamp('startDate').notNull(),
    endDate: timestamp('endDate').notNull(),
    initialCapital: real('initialCapital').notNull(),
    strategy: text('strategy'), // JSON description of strategy
    results: jsonb('results'), // { finalValue, returnPercentage, maxDrawdown, sharpeRatio, trades: [...] }
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (table) => [index('idx_userId_backtest').on(table.userId)]
)

// Watchlists
export const watchlists = pgTable(
  'watchlists',
  {
    id: text('id').primaryKey(),
    userId: text('userId').notNull(),
    name: text('name').notNull(),
    description: text('description'),
    isDefault: boolean('isDefault').default(false),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (table) => [index('idx_userId_watchlist').on(table.userId)]
)

// Watchlist items
export const watchlistItems = pgTable(
  'watchlist_items',
  {
    id: text('id').primaryKey(),
    watchlistId: text('watchlistId').notNull(),
    companyId: text('companyId').notNull(),
    ticker: varchar('ticker', { length: 20 }).notNull(),
    addedAt: timestamp('addedAt').notNull().defaultNow(),
  },
  (table) => [
    index('idx_watchlistId_item').on(table.watchlistId),
    index('idx_companyId_watchlistitem').on(table.companyId),
  ]
)

// API usage tracking for billing
export const apiUsage = pgTable(
  'api_usage',
  {
    id: text('id').primaryKey(),
    userId: text('userId').notNull(),
    date: timestamp('date').notNull().defaultNow(),
    analysesCount: integer('analysesCount').default(0),
    tokenUsage: integer('tokenUsage').default(0),
    costUSD: real('costUSD').default(0),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
  },
  (table) => [
    index('idx_userId_usage').on(table.userId),
    index('idx_date_usage').on(table.date),
  ]
)

// Subscription info
export const subscriptions = pgTable(
  'subscriptions',
  {
    id: text('id').primaryKey(),
    userId: text('userId').notNull().unique(),
    plan: varchar('plan', { length: 20 }).notNull().default('free'), // 'free', 'pro', 'enterprise'
    stripeCustomerId: text('stripeCustomerId').unique(),
    stripeSubscriptionId: text('stripeSubscriptionId').unique(),
    analysesPerMonth: integer('analysesPerMonth').notNull().default(5),
    analysesUsedThisMonth: integer('analysesUsedThisMonth').default(0),
    status: varchar('status', { length: 20 }).default('active'), // 'active', 'cancelled', 'past_due'
    startDate: timestamp('startDate').notNull().defaultNow(),
    renewalDate: timestamp('renewalDate'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (table) => [index('idx_userId_subscription').on(table.userId)]
)

// Feedback and ratings
export const feedback = pgTable(
  'feedback',
  {
    id: text('id').primaryKey(),
    userId: text('userId').notNull(),
    analysisId: text('analysisId'),
    rating: integer('rating'), // 1-5
    comment: text('comment'),
    accuracy: varchar('accuracy', { length: 20 }), // 'very_accurate', 'accurate', 'partial', 'inaccurate'
    createdAt: timestamp('createdAt').notNull().defaultNow(),
  },
  (table) => [
    index('idx_userId_feedback').on(table.userId),
    index('idx_analysisId_feedback').on(table.analysisId),
  ]
)

export type Verdict = 'BUY' | 'HOLD' | 'PASS'
export type RiskTolerance = 'conservative' | 'moderate' | 'aggressive'

export interface FinancialMetrics {
  peRatio: number | null
  revenueGrowthYoY: number | null
  debtToEquity: number | null
  grossMargin: number | null
  freeCashFlowYield: number | null
}

export interface ScoreBreakdown {
  financial: number
  market: number
  sentiment: number
  competition: number
  risk: number
  composite: number
}

export interface ExplainabilityPanel {
  weights: {
    financial: number
    market: number
    sentiment: number
    competition: number
    risk: number
  }
  scores: ScoreBreakdown
  sources: Array<{ title: string; url: string; type: string }>
}

export interface AgentInput {
  ticker: string
  companyName?: string
  sector?: string
  riskTolerance?: RiskTolerance
}

export interface AgentOutput {
  agentName: string
  agentType: string
  input: AgentInput
  output: string
  confidence: number
  sources: Array<{ type: string; url: string; title?: string }>
  executionTimeMs: number
}

export interface OrchestratorState {
  ticker: string
  companyName: string
  agents: AgentOutput[]
  verdict?: Verdict
  confidence?: number
  summary?: string
  bullArguments?: string
  bearArguments?: string
  riskScore?: number
  opportunityScore?: number
  compositeScore?: number
  explainability?: ExplainabilityPanel
  groundingScore?: number
  hallucinations?: string[]
  totalExecutionTimeMs: number
}

export interface StreamEvent {
  type: 'start' | 'thought' | 'agent' | 'complete' | 'error'
  data: Record<string, unknown>
}

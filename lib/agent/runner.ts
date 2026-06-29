/**
 * LangGraph runner — streams node updates as SSE events
 * Engineering Bible Vol 13 §13.2 + Framework Analysis Agent §RULE 05
 */
import { getResearchGraph } from './graph'
import { createInitialState, type InvestmentAnalysisState } from './state'
import type { AgentInput, OrchestratorState } from './types'

export function stateToOrchestratorResult(state: InvestmentAnalysisState): OrchestratorState {
  return {
    ticker: state.ticker,
    companyName: state.companyName,
    agents: state.agents,
    verdict: state.verdict,
    confidence: (state.confidenceScore ?? 0) / 100,
    summary: `${state.companyName} (${state.ticker}): ${state.verdict} with ${state.confidenceScore}% confidence. ${state.reasoning}`,
    bullArguments: state.bullCase.map((p) => p.point).join('\n'),
    bearArguments: state.bearCase.map((p) => p.point).join('\n'),
    riskScore: state.riskScore,
    opportunityScore: state.compositeScore,
    compositeScore: state.compositeScore,
    explainability: state.explainability ?? undefined,
    groundingScore: state.groundingScore,
    hallucinations: state.uncitedClaims,
    totalExecutionTimeMs: Date.now() - (state.startedAt ?? Date.now()),
  }
}

export async function runAnalysis(input: AgentInput & { userId?: string }): Promise<OrchestratorState> {
  const graph = getResearchGraph()
  const initial = createInitialState(input)
  const finalState = (await graph.invoke(initial)) as InvestmentAnalysisState
  return stateToOrchestratorResult(finalState)
}

export async function* streamAnalysis(input: AgentInput & { userId?: string }) {
  const graph = getResearchGraph()
  const initial = createInitialState(input)

  yield {
    type: 'start' as const,
    data: {
      ticker: input.ticker,
      agents: [
        'Planner',
        'Financial Analyst',
        'News Analyst',
        'Competitor Analyst',
        'Scoring Engine',
        'Bull Case',
        'Bear Case',
        'Judge',
        'Verifier',
      ],
      llmEnabled: Boolean(process.env.ANTHROPIC_API_KEY),
    },
  }

  try {
    let finalState: InvestmentAnalysisState | null = null

    const stream = await graph.stream(initial, { streamMode: ['updates', 'values'] })

    for await (const chunk of stream) {
      // Multi-mode stream yields [mode, data] tuples
      if (Array.isArray(chunk) && chunk.length === 2) {
        const [mode, data] = chunk as [string, unknown]

        if (mode === 'updates' && data && typeof data === 'object') {
          const update = data as Record<string, Partial<InvestmentAnalysisState>>
          const nodeName = Object.keys(update)[0]
          const nodeUpdate = update[nodeName]

          if (nodeUpdate?.thoughtEvents) {
            for (const thought of nodeUpdate.thoughtEvents) {
              yield { type: 'thought' as const, data: thought as Record<string, unknown> }
            }
          }

          if (nodeUpdate?.agents) {
            for (const agent of nodeUpdate.agents) {
              yield { type: 'agent' as const, data: agent as Record<string, unknown> }
            }
          }
        }

        if (mode === 'values') {
          finalState = data as InvestmentAnalysisState
        }
      }
    }

    if (!finalState) {
      throw new Error('Pipeline completed without final state')
    }

    yield { type: 'complete' as const, data: stateToOrchestratorResult(finalState) }
  } catch (error) {
    yield {
      type: 'error' as const,
      data: { message: error instanceof Error ? error.message : 'Analysis pipeline failed' },
    }
  }
}

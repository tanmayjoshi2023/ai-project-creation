import { getResearchGraph } from './graph'
import { createInitialState, type InvestmentAnalysisState } from './state'
import type { AgentInput, OrchestratorState } from './types'
import { AsyncQueue, activeQueues } from './event-bus'

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

export async function* streamAnalysis(input: AgentInput & { userId?: string; analysisId?: string }) {
  const graph = getResearchGraph()
  const initial = createInitialState(input)

  // Ensure analysisId is populated
  const analysisId = initial.analysisId || `offline-${Date.now()}`
  initial.analysisId = analysisId

  const queue = new AsyncQueue<any>()
  activeQueues.set(analysisId, queue)

  yield {
    type: 'start' as const,
    data: {
      ticker: input.ticker,
      companyName: input.companyName,
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
      llmEnabled: Boolean(process.env.GEMINI_API_KEY),
    },
  }

  let finalState: InvestmentAnalysisState | null = null

  // Run graph stream in the background
  graph.stream(initial, { streamMode: ['updates', 'values'] })
    .then(async (stream) => {
      for await (const chunk of stream) {
        if (Array.isArray(chunk) && chunk.length === 2) {
          const [mode, data] = chunk as [string, unknown]

          if (mode === 'updates' && data && typeof data === 'object') {
            const update = data as Record<string, Partial<InvestmentAnalysisState>>
            
            // Loop over all keys to process parallel agent outputs correctly
            for (const nodeName of Object.keys(update)) {
              const nodeUpdate = update[nodeName]

              if (nodeUpdate?.agents) {
                for (const agent of nodeUpdate.agents) {
                  queue.push({ type: 'agent' as const, data: agent as Record<string, unknown> })
                }
              }
            }
          }

          if (mode === 'values') {
            finalState = data as InvestmentAnalysisState
          }
        }
      }

      if (finalState) {
        queue.push({ type: 'complete' as const, data: stateToOrchestratorResult(finalState) })
      } else {
        queue.push({ type: 'error' as const, data: { message: 'Pipeline completed without final state' } })
      }
      queue.close()
    })
    .catch((err) => {
      queue.push({
        type: 'error' as const,
        data: { message: err instanceof Error ? err.message : 'Analysis pipeline failed' },
      })
      queue.close()
    })
    .finally(() => {
      // Clean up after small buffer window to ensure delivery
      setTimeout(() => {
        activeQueues.delete(analysisId)
      }, 5000)
    })

  try {
    for await (const event of queue) {
      yield event
    }
  } finally {
    activeQueues.delete(analysisId)
  }
}

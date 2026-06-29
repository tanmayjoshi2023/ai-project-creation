/**
 * Debate subgraph — Bull / Bear / Judge (Engineering Bible Vol 6)
 * Can be invoked standalone for debate-only mode (Phase 7)
 */
import { StateGraph, START, END } from '@langchain/langgraph'
import { InvestmentAnalysisAnnotation } from './state'
import { bullNode, bearNode, judgeNode } from './nodes'

export function buildDebateGraph() {
  return new StateGraph(InvestmentAnalysisAnnotation)
    .addNode('bull', bullNode)
    .addNode('bear', bearNode)
    .addNode('judge', judgeNode)
    .addEdge(START, 'bull')
    .addEdge(START, 'bear')
    .addEdge(['bull', 'bear'], 'judge')
    .addEdge('judge', END)
    .compile()
}

let debateGraph: ReturnType<typeof buildDebateGraph> | null = null

export function getDebateGraph() {
  if (!debateGraph) debateGraph = buildDebateGraph()
  return debateGraph
}

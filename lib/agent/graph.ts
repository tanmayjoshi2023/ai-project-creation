/**
 * InvestIQ LangGraph research pipeline
 * Engineering Bible Vol 3 §3.5 execution flow
 *
 * planner → [financial ∥ news ∥ competitor] → scoring → [bull ∥ bear] → judge → verifier
 */
import { StateGraph, START, END } from '@langchain/langgraph'
import { InvestmentAnalysisAnnotation } from './state'
import {
  plannerNode,
  financialNode,
  scoringNode,
  newsNode,
  competitorNode,
  bullNode,
  bearNode,
  judgeNode,
  verifierNode,
} from './nodes'

export function buildResearchGraph() {
  const graph = new StateGraph(InvestmentAnalysisAnnotation)
    .addNode('planner', plannerNode)
    .addNode('financial', financialNode)
    .addNode('news', newsNode)
    .addNode('competitor', competitorNode)
    .addNode('scoring', scoringNode)
    .addNode('bull', bullNode)
    .addNode('bear', bearNode)
    .addNode('judge', judgeNode)
    .addNode('verifier', verifierNode)
    // Fan-out from planner to parallel research agents
    .addEdge(START, 'planner')
    .addEdge('planner', 'financial')
    .addEdge('planner', 'news')
    .addEdge('planner', 'competitor')
    // Scoring runs after ALL research agents complete (join)
    .addEdge(['financial', 'news', 'competitor'], 'scoring')
    // Debate agents run in parallel after scoring
    .addEdge('scoring', 'bull')
    .addEdge('scoring', 'bear')
    // Judge waits for both debate agents
    .addEdge(['bull', 'bear'], 'judge')
    // Verifier always runs after judge (non-conditional)
    .addEdge('judge', 'verifier')
    .addEdge('verifier', END)

  return graph.compile()
}

let compiledGraph: ReturnType<typeof buildResearchGraph> | null = null

export function getResearchGraph() {
  if (!compiledGraph) compiledGraph = buildResearchGraph()
  return compiledGraph
}

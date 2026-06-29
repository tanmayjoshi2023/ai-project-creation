'use server'

import { db } from '@/lib/db'
import { analyses, agentExecutions } from '@/lib/db/schema'
import { getUserId } from '@/lib/auth-helpers'
import { checkAnalysisQuota, incrementAnalysisUsage } from '@/lib/quota'
import { eq, and, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { v4 as uuidv4 } from 'uuid'
import type { OrchestratorState } from '@/lib/agents/orchestrator'

export async function getAnalyses(limit = 20) {
  const userId = await getUserId()
  // Select only list-view columns — omit heavy JSON blobs (agentOutputs, hallucinations, reasoning)
  return await db
    .select({
      id: analyses.id,
      ticker: analyses.ticker,
      companyId: analyses.companyId,
      status: analyses.status,
      verdict: analyses.verdict,
      confidence: analyses.confidence,
      summary: analyses.summary,
      riskScore: analyses.riskScore,
      opportunityScore: analyses.opportunityScore,
      groundingScore: analyses.groundingScore,
      processingTimeMs: analyses.processingTimeMs,
      llmProvider: analyses.llmProvider,
      llmModel: analyses.llmModel,
      createdAt: analyses.createdAt,
      updatedAt: analyses.updatedAt,
    })
    .from(analyses)
    .where(eq(analyses.userId, userId))
    .orderBy(desc(analyses.createdAt))
    .limit(limit)
}

export async function getAnalysis(analysisId: string) {
  const userId = await getUserId()
  return await db
    .select()
    .from(analyses)
    .where(and(eq(analyses.userId, userId), eq(analyses.id, analysisId)))
    .then((results) => results[0] || null)
}

export async function getAnalysisWithAgents(analysisId: string) {
  const userId = await getUserId()

  const analysis = await db
    .select()
    .from(analyses)
    .where(and(eq(analyses.userId, userId), eq(analyses.id, analysisId)))
    .then((results) => results[0])

  if (!analysis) {
    return null
  }

  const agents = await db
    .select({
      id: agentExecutions.id,
      agentName: agentExecutions.agentName,
      agentType: agentExecutions.agentType,
      output: agentExecutions.output,
      reasoning: agentExecutions.reasoning,
      confidence: agentExecutions.confidence,
      sources: agentExecutions.sources,
      executionTimeMs: agentExecutions.executionTimeMs,
      executionOrder: agentExecutions.executionOrder,
      cost: agentExecutions.cost,
      createdAt: agentExecutions.createdAt,
    })
    .from(agentExecutions)
    .where(eq(agentExecutions.analysisId, analysisId))
    .orderBy(agentExecutions.executionOrder)

  return {
    ...analysis,
    agents,
  }
}

export async function createAnalysis(companyId: string, ticker: string) {
  const userId = await getUserId()
  const id = uuidv4()

  return await db.transaction(async (tx) => {
    const quota = await checkAnalysisQuota(userId, tx)
    if (!quota.allowed) {
      throw new Error(quota.message || 'Analysis quota exceeded')
    }

    await tx.insert(analyses).values({
      id,
      userId,
      companyId,
      ticker: ticker.toUpperCase(),
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    revalidatePath('/')
    return { success: true, analysisId: id }
  })
}

export async function updateAnalysisStatus(analysisId: string, status: string) {
  const userId = await getUserId()

  await db
    .update(analyses)
    .set({
      status: status as 'pending' | 'processing' | 'completed' | 'failed',
      updatedAt: new Date(),
    })
    .where(and(eq(analyses.userId, userId), eq(analyses.id, analysisId)))

  revalidatePath('/')
  return { success: true }
}

export async function persistAnalysisResults(
  analysisId: string,
  state: OrchestratorState,
  options?: { skipQuotaIncrement?: boolean }
) {
  const userId = await getUserId()

  return await db.transaction(async (tx) => {
    const existing = await tx
      .select()
      .from(analyses)
      .where(and(eq(analyses.userId, userId), eq(analyses.id, analysisId)))
      .then((rows) => rows[0])

    if (!existing) {
      throw new Error('Analysis not found')
    }

    if (existing.status === 'completed') {
      return { success: true, alreadySaved: true }
    }

    if (!options?.skipQuotaIncrement) {
      await incrementAnalysisUsage(userId, tx)
    }

    await tx
      .update(analyses)
      .set({
        status: 'completed',
        verdict: state.verdict ?? null,
        confidence: state.confidence ?? null,
        summary: state.summary ?? null,
        reasoning: JSON.stringify(state.explainability ?? {}),
        sources: state.explainability?.sources ?? [],
        agentOutputs: state.agents,
        bullArguments: state.bullArguments ?? null,
        bearArguments: state.bearArguments ?? null,
        riskScore: state.riskScore ?? null,
        opportunityScore: state.opportunityScore ?? null,
        groundingScore: state.groundingScore ?? null,
        hallucinations: state.hallucinations ?? [],
        processingTimeMs: state.totalExecutionTimeMs,
        llmProvider: 'google',
        llmModel: 'gemini-2.5-flash',
        updatedAt: new Date(),
      })
      .where(and(eq(analyses.userId, userId), eq(analyses.id, analysisId)))

    for (let i = 0; i < state.agents.length; i++) {
      const agent = state.agents[i]
      await tx.insert(agentExecutions).values({
        id: uuidv4(),
        analysisId,
        agentName: agent.agentName,
        agentType: agent.agentType,
        input: agent.input,
        output: agent.output,
        confidence: agent.confidence,
        sources: agent.sources,
        executionTimeMs: agent.executionTimeMs,
        tokenUsage: null,
        prompt: null,
        response: agent.output,
        errors: null,
        cost: null,
        executionOrder: i + 1,
        createdAt: new Date(),
      })
    }

    revalidatePath('/')
    revalidatePath(`/analysis/${analysisId}`)
    return { success: true }
  })
}

export async function updateAnalysisResults(
  analysisId: string,
  results: {
    status: string
    verdict?: string | null
    confidence?: number | null
    summary?: string | null
    reasoning?: string | null
    sources?: unknown
    agentOutputs?: unknown
    estimatedValue?: number | null
    bullArguments?: string | null
    bearArguments?: string | null
    riskScore?: number | null
    opportunityScore?: number | null
    hallucinations?: unknown
    processingTimeMs?: number | null
  }
) {
  const userId = await getUserId()

  await db
    .update(analyses)
    .set({
      status: results.status as 'pending' | 'processing' | 'completed' | 'failed',
      verdict: results.verdict as 'BUY' | 'HOLD' | 'PASS' | null | undefined,
      confidence: results.confidence,
      summary: results.summary,
      reasoning: results.reasoning,
      sources: results.sources,
      agentOutputs: results.agentOutputs,
      estimatedValue: results.estimatedValue,
      bullArguments: results.bullArguments,
      bearArguments: results.bearArguments,
      riskScore: results.riskScore,
      opportunityScore: results.opportunityScore,
      hallucinations: results.hallucinations,
      processingTimeMs: results.processingTimeMs,
      updatedAt: new Date(),
    })
    .where(and(eq(analyses.userId, userId), eq(analyses.id, analysisId)))

  revalidatePath('/')
  return { success: true }
}

export async function deleteAnalysis(analysisId: string) {
  const userId = await getUserId()

  await db.delete(analyses).where(and(eq(analyses.userId, userId), eq(analyses.id, analysisId)))

  revalidatePath('/')
  return { success: true }
}

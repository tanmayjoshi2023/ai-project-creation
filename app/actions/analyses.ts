'use server'

import { db } from '@/lib/db'
import { analyses, agentExecutions } from '@/lib/db/schema'
import { getUserId } from '@/lib/auth-helpers'
import { checkAnalysisQuota, incrementAnalysisUsage } from '@/lib/quota'
import { eq, and, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { v4 as uuidv4 } from 'uuid'
import type { OrchestratorState } from '@/lib/agents/orchestrator'

// Simple in-memory storage for offline demo fallback
const offlineAnalysesStore = new Map<string, any>()
const offlineAgentExecutionsStore = new Map<string, any[]>()

export async function getAnalyses(limit = 20) {
  try {
    const userId = await getUserId()
    return await db
      .select()
      .from(analyses)
      .where(eq(analyses.userId, userId))
      .orderBy(desc(analyses.createdAt))
      .limit(limit)
  } catch (err) {
    console.warn("DB offline, getting in-memory analyses")
    return Array.from(offlineAnalysesStore.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit)
  }
}

export async function getAnalysis(analysisId: string) {
  try {
    const userId = await getUserId()
    return await db
      .select()
      .from(analyses)
      .where(and(eq(analyses.userId, userId), eq(analyses.id, analysisId)))
      .then((results) => results[0] || null)
  } catch (err) {
    console.warn("DB offline, getting in-memory analysis:", analysisId)
    return offlineAnalysesStore.get(analysisId) || null
  }
}

export async function getAnalysisWithAgents(analysisId: string) {
  try {
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
      .select()
      .from(agentExecutions)
      .where(eq(agentExecutions.analysisId, analysisId))
      .orderBy(agentExecutions.createdAt)

    return {
      ...analysis,
      agents,
    }
  } catch (err) {
    console.warn("DB offline, getting in-memory analysis with agents:", analysisId)
    const analysis = offlineAnalysesStore.get(analysisId)
    if (!analysis) return null
    const agents = offlineAgentExecutionsStore.get(analysisId) || []
    return {
      ...analysis,
      agents,
    }
  }
}

export async function createAnalysis(companyId: string, ticker: string) {
  const userId = await getUserId()
  const id = uuidv4()

  try {
    const quota = await checkAnalysisQuota(userId)
    if (!quota.allowed) {
      throw new Error(quota.message || 'Analysis quota exceeded')
    }

    await db.insert(analyses).values({
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
  } catch (err) {
    console.warn("DB offline, creating in-memory analysis:", ticker)
    const mockRecord = {
      id,
      userId,
      companyId,
      ticker: ticker.toUpperCase(),
      status: 'pending' as const,
      verdict: null,
      confidence: null,
      summary: null,
      reasoning: null,
      sources: null,
      agentOutputs: null,
      estimatedValue: null,
      bullArguments: null,
      bearArguments: null,
      riskScore: null,
      opportunityScore: null,
      hallucinations: null,
      processingTimeMs: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    offlineAnalysesStore.set(id, mockRecord)
    return { success: true, analysisId: id }
  }
}

export async function updateAnalysisStatus(analysisId: string, status: string) {
  const userId = await getUserId()

  try {
    await db
      .update(analyses)
      .set({
        status: status as 'pending' | 'processing' | 'completed' | 'failed',
        updatedAt: new Date(),
      })
      .where(and(eq(analyses.userId, userId), eq(analyses.id, analysisId)))
  } catch (err) {
    console.warn("DB offline, updating in-memory status:", analysisId)
    const existing = offlineAnalysesStore.get(analysisId)
    if (existing) {
      existing.status = status
      existing.updatedAt = new Date()
    }
  }

  revalidatePath('/')
  return { success: true }
}

export async function persistAnalysisResults(
  analysisId: string,
  state: OrchestratorState,
  options?: { skipQuotaIncrement?: boolean }
) {
  const userId = await getUserId()

  try {
    const existing = await db
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
      await incrementAnalysisUsage(userId)
    }

    await db
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
        hallucinations: state.hallucinations ?? [],
        processingTimeMs: state.totalExecutionTimeMs,
        updatedAt: new Date(),
      })
      .where(and(eq(analyses.userId, userId), eq(analyses.id, analysisId)))

    for (const agent of state.agents) {
      await db.insert(agentExecutions).values({
        id: uuidv4(),
        analysisId,
        agentName: agent.agentName,
        agentType: agent.agentType,
        input: agent.input,
        output: agent.output,
        confidence: agent.confidence,
        sources: agent.sources,
        executionTimeMs: agent.executionTimeMs,
        createdAt: new Date(),
      })
    }

    revalidatePath('/')
    revalidatePath(`/analysis/${analysisId}`)
    return { success: true }
  } catch (err) {
    console.warn("DB offline, persisting to in-memory store:", analysisId)
    const existing = offlineAnalysesStore.get(analysisId)
    if (!existing) {
      throw new Error('Analysis not found in offline store')
    }

    const updated = {
      ...existing,
      status: 'completed' as const,
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
      hallucinations: state.hallucinations ?? [],
      processingTimeMs: state.totalExecutionTimeMs,
      updatedAt: new Date(),
    }
    offlineAnalysesStore.set(analysisId, updated)

    const mockAgentsExecs = state.agents.map((agent) => ({
      id: uuidv4(),
      analysisId,
      agentName: agent.agentName,
      agentType: agent.agentType,
      input: agent.input,
      output: agent.output,
      confidence: agent.confidence ?? null,
      sources: agent.sources ?? [],
      executionTimeMs: agent.executionTimeMs,
      createdAt: new Date(),
    }))
    offlineAgentExecutionsStore.set(analysisId, mockAgentsExecs)

    revalidatePath('/')
    revalidatePath(`/analysis/${analysisId}`)
    return { success: true }
  }
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

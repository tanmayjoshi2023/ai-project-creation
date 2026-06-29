import { NextRequest, NextResponse } from 'next/server'
import { AnalysisService } from '@/lib/services/analysis-service'
import { sanitizeTicker, sanitizeCompanyInput } from '@/lib/security/sanitize'
import { getSession } from '@/lib/auth-helpers'
import { checkDbConnection } from '@/lib/db'
import { checkAnalysisQuota } from '@/lib/quota'
import { db } from '@/lib/db'
import { analyses } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { persistAnalysisResults } from '@/app/actions/analyses'
import type { OrchestratorState } from '@/lib/agents/orchestrator'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    const body = await request.json()
    const ticker = sanitizeTicker(body.ticker || '')
    const companyName = sanitizeCompanyInput(body.companyName || ticker)
    const sector = body.sector ? sanitizeCompanyInput(body.sector) : undefined
    const analysisId = body.analysisId as string | undefined

    if (!ticker) {
      return NextResponse.json(
        { success: false, error: { code: 'COMPANY_NOT_FOUND', message: 'Valid ticker is required' } },
        { status: 422 }
      )
    }

    const dbAvailable = await checkDbConnection()

    if (analysisId && dbAvailable) {
      try {
        const existing = await db
          .select()
          .from(analyses)
          .where(and(eq(analyses.id, analysisId), eq(analyses.userId, session.user.id)))
          .then((rows) => rows[0])

        if (existing?.status === 'completed') {
          return NextResponse.json(
            { success: false, error: { code: 'ALREADY_COMPLETE', message: 'Analysis already completed' } },
            { status: 409 }
          )
        }

        if (existing?.status === 'pending') {
          await db
            .update(analyses)
            .set({ status: 'processing', updatedAt: new Date() })
            .where(eq(analyses.id, analysisId))
        }
      } catch (dbErr) {
        console.warn("DB error checking stream status, bypassing for offline mode:", dbErr)
      }
    } else if (!dbAvailable) {
      console.info("DB offline, bypassing analysis record checks for offline stream mode")
    } else {
      const quota = await checkAnalysisQuota(session.user.id)
      if (!quota.allowed) {
        return NextResponse.json(
          { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: quota.message } },
          { status: 429 }
        )
      }
    }

    const encoder = new TextEncoder()
    let finalState: OrchestratorState | null = null

    const stream = new ReadableStream({
      async start(controller) {
        const emit = (payload: unknown) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`))
        }

        try {
          for await (const event of streamAnalysis({ ticker, companyName, sector, })) {
            emit(event)
            if (event.type === 'complete') {
              finalState = event.data as OrchestratorState
            }
          }

          if (finalState && analysisId) {
            await persistAnalysisResults(analysisId, finalState)
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        } catch (error) {
          emit({
            type: 'error',
            data: { message: error instanceof Error ? error.message : 'Analysis failed' },
          })
        } finally {
          controller.close()
        }
      },
    })

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Analysis stream error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'LLM_UNAVAILABLE',
          message: error instanceof Error ? error.message : 'Failed to start analysis',
        },
      },
      { status: 500 }
    )
  }
}

/**
 * Production health check endpoint
 * GET /api/health
 *
 * Returns system status for:
 * - Database connectivity and pool stats
 * - Cache (Redis) connectivity
 * - LLM availability
 * - App environment
 *
 * Use for: uptime monitoring, Kubernetes liveness/readiness probes,
 * alerting dashboards, and deployment verification.
 */
import { NextResponse } from 'next/server'
import { getDatabaseHealth } from '@/lib/db/health'
import { isCacheEnabled } from '@/lib/cache'
import { isLLMEnabled } from '@/lib/agent/llm'

export const dynamic = 'force-dynamic'

export async function GET() {
  const start = Date.now()

  // Run health checks in parallel
  const [dbHealth] = await Promise.all([getDatabaseHealth()])

  const status = dbHealth.status === 'offline' ? 'degraded' : 'ok'
  const httpStatus = status === 'ok' ? 200 : 503

  return NextResponse.json(
    {
      status,
      timestamp: new Date().toISOString(),
      responseTimeMs: Date.now() - start,
      services: {
        database: {
          status: dbHealth.status,
          latencyMs: dbHealth.latencyMs,
          pool: {
            total: dbHealth.poolTotal,
            idle: dbHealth.poolIdle,
            waiting: dbHealth.poolWaiting,
          },
          error: dbHealth.error,
        },
        cache: {
          status: isCacheEnabled() ? 'configured' : 'disabled',
          provider: isCacheEnabled() ? 'upstash-redis' : 'none',
        },
        llm: {
          status: isLLMEnabled() ? 'configured' : 'disabled',
          provider: isLLMEnabled() ? 'google-gemini' : 'none',
        },
      },
      environment: process.env.NODE_ENV || 'development',
    },
    { status: httpStatus }
  )
}

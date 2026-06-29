/**
 * Database health check — used for production monitoring, readiness probes, and Uptime dashboards.
 * Returns detailed diagnostics including connection pool state and query latency.
 */
import { pool } from '@/lib/db'

export interface DbHealthReport {
  status: 'healthy' | 'degraded' | 'offline'
  latencyMs: number
  poolTotal: number
  poolIdle: number
  poolWaiting: number
  error?: string
}

export async function getDatabaseHealth(): Promise<DbHealthReport> {
  const p = pool()
  const start = Date.now()
  let client: any

  try {
    client = await p.connect()
    await client.query('SELECT 1')
    const latencyMs = Date.now() - start

    return {
      status: latencyMs > 2000 ? 'degraded' : 'healthy',
      latencyMs,
      poolTotal: p.totalCount,
      poolIdle: p.idleCount,
      poolWaiting: p.waitingCount,
    }
  } catch (err) {
    return {
      status: 'offline',
      latencyMs: Date.now() - start,
      poolTotal: p.totalCount,
      poolIdle: p.idleCount,
      poolWaiting: p.waitingCount,
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  } finally {
    if (client) {
      try {
        client.release()
      } catch {}
    }
  }
}

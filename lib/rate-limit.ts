/**
 * In-memory rate limiter for API routes.
 * Uses a sliding window algorithm keyed by identifier (userId or IP).
 *
 * Note: For multi-instance deployments (e.g., Vercel serverless), replace with
 * a Redis-backed implementation (e.g., @upstash/ratelimit).
 *
 * Engineering Bible Vol 7 — rate limiting strategy
 */

interface RateLimitEntry {
  count: number
  windowStart: number
}

const store = new Map<string, RateLimitEntry>()

export interface RateLimitConfig {
  /** Max requests per window */
  limit: number
  /** Window size in seconds */
  windowMs: number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAtMs: number
}

/**
 * Check and record a request against the rate limit.
 * @param identifier - Unique key (userId, IP address, etc.)
 * @param config - Rate limit config
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now()
  const entry = store.get(identifier)

  if (!entry || now - entry.windowStart > config.windowMs) {
    // Start a fresh window
    store.set(identifier, { count: 1, windowStart: now })
    return {
      allowed: true,
      remaining: config.limit - 1,
      resetAtMs: now + config.windowMs,
    }
  }

  entry.count++

  if (entry.count > config.limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAtMs: entry.windowStart + config.windowMs,
    }
  }

  return {
    allowed: true,
    remaining: config.limit - entry.count,
    resetAtMs: entry.windowStart + config.windowMs,
  }
}

// Periodically clean up expired entries to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store.entries()) {
      // Evict entries older than 1 hour
      if (now - entry.windowStart > 3_600_000) {
        store.delete(key)
      }
    }
  }, 5 * 60 * 1000) // Run every 5 minutes
}

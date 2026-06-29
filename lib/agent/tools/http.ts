/**
 * Shared HTTP + caching helpers for research tools.
 *
 * - fetchWithTimeout: aborts any request that exceeds the budget so a single slow
 *   upstream API can never stall the pipeline (root cause of the old 1000s runs).
 * - memoizeTTL: a process-local cache so repeated lookups of the same ticker within
 *   a short window reuse results instead of re-hitting external APIs.
 */

const DEFAULT_TIMEOUT_MS = 8_000

export async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

const RESEARCH_TTL_MS = 10 * 60 * 1000 // 10 minutes — Bible Vol 7 caching window (5–15 min)

const store = new Map<string, CacheEntry<unknown>>()

/**
 * Wraps an async producer with a TTL cache keyed by `key`. Concurrent/repeated
 * calls for the same ticker within the window reuse the cached value. Failures
 * are not cached so transient errors can recover on the next attempt.
 */
export async function cached<T>(
  key: string,
  producer: () => Promise<T>,
  ttlMs = RESEARCH_TTL_MS
): Promise<T> {
  const now = Date.now()
  const hit = store.get(key)
  if (hit && hit.expiresAt > now) {
    return hit.value as T
  }
  const value = await producer()
  store.set(key, { value, expiresAt: now + ttlMs })
  return value
}

export function clearResearchCache(): void {
  store.clear()
}

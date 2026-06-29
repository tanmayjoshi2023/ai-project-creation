/**
 * Redis cache layer — optional, degrades to no-op when Upstash is not configured.
 * Engineering Bible Vol 7 — caching strategy
 */
import { Redis } from '@upstash/redis'

const CACHE_TTL = 60 * 60 * 6 // 6 hours

// Lazy singleton — only created if env vars exist
let redisClient: Redis | null = null

function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null
  }
  if (!redisClient) {
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  }
  return redisClient
}

/** @deprecated Use getRedis() internally; export for direct use only when needed */
export const redis = new Proxy({} as Redis, {
  get(_target, prop) {
    const client = getRedis()
    if (!client) {
      // Return a no-op async function for any method call
      return (..._args: unknown[]) => Promise.resolve(null)
    }
    const value = (client as any)[prop]
    return typeof value === 'function' ? value.bind(client) : value
  },
})

export async function getCachedAnalysis<T>(key: string): Promise<T | null> {
  const client = getRedis()
  if (!client) return null
  try {
    return await client.get<T>(key)
  } catch (err) {
    console.warn('[cache] Redis GET failed, bypassing cache:', err)
    return null
  }
}

export async function setCachedAnalysis<T>(key: string, value: T): Promise<void> {
  const client = getRedis()
  if (!client) return
  try {
    await client.set(key, value, { ex: CACHE_TTL })
  } catch (err) {
    console.warn('[cache] Redis SET failed, bypassing cache:', err)
  }
}

export async function deleteCachedAnalysis(key: string): Promise<void> {
  const client = getRedis()
  if (!client) return
  try {
    await client.del(key)
  } catch (err) {
    console.warn('[cache] Redis DEL failed, bypassing cache:', err)
  }
}

export function isCacheEnabled(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
}
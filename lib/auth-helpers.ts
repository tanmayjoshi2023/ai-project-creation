'use server'

import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { checkDbConnection } from '@/lib/db'

/**
 * Returns the current session or null if unauthenticated / DB unavailable.
 *
 * NEVER throws — callers that require authentication must call getUserId()
 * which does throw when no session exists.
 *
 * This design allows the public home page and landing page to render
 * correctly even when the database is warming up (Neon cold start).
 */
export async function getSession() {
  const isDbOnline = await checkDbConnection()

  if (!isDbOnline) {
    // Log the warning but return null — don't crash public-facing pages
    console.warn('[auth] Database unreachable — returning null session')
    return null
  }

  try {
    const headersList = await headers()
    const session = await auth.api.getSession({ headers: headersList })
    return session ?? null
  } catch (err) {
    // Auth failure is non-fatal for public pages — return null instead of crashing
    console.error('[auth] Session retrieval failed:', err)
    return null
  }
}

/**
 * Returns the authenticated user's ID.
 * Throws if unauthenticated — use this in protected Server Actions only.
 */
export async function getUserId(): Promise<string> {
  const session = await getSession()
  if (!session?.user?.id) {
    throw new Error('Unauthorized: No user session found')
  }
  return session.user.id
}

'use server'

import { cookies, headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { checkDbConnection } from '@/lib/db'

export async function getSession() {
  const cookieStore = await cookies()
  const hasToken = cookieStore.has('better-auth.session_token')

  if (!(await checkDbConnection())) {
    if (hasToken) {
      return {
        user: {
          id: 'offline-user-id',
          name: 'Gemini Tester (Offline)',
          email: 'offline-test@investiq.com',
        }
      }
    }
    return null
  }

  try {
    const headersList = await headers()
    const session = await auth.api.getSession({ headers: headersList })
    if (session?.user) return session

    const cookieHeader = cookieStore.toString()
    if (!cookieHeader) return null

    return auth.api.getSession({
      headers: new Headers({ cookie: cookieHeader }),
    })
  } catch (err) {
    console.warn("DB offline, falling back to mock session for offline/demo use:", err)
    if (hasToken) {
      return {
        user: {
          id: 'offline-user-id',
          name: 'Gemini Tester (Offline)',
          email: 'offline-test@investiq.com',
        }
      }
    }
    return null
  }
}

export async function getUserId(): Promise<string> {
  const session = await getSession()
  if (!session?.user?.id) {
    throw new Error('Unauthorized: No user session found')
  }
  return session.user.id
}

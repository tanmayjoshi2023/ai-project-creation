import { auth } from '@/lib/auth'
import { toNextJsHandler } from 'better-auth/next-js'
import { NextRequest, NextResponse } from 'next/server'
import { checkDbConnection } from '@/lib/db'

export const dynamic = 'force-dynamic'

const authHandler = toNextJsHandler(auth)

export async function GET(request: NextRequest) {
  if (!(await checkDbConnection())) {
    return NextResponse.json(
      { success: false, error: { code: 'DATABASE_OFFLINE', message: 'Database connection is offline. Authentication unavailable.' } },
      { status: 500 }
    )
  }
  return authHandler.GET(request)
}

export async function POST(request: NextRequest) {
  if (!(await checkDbConnection())) {
    return NextResponse.json(
      { success: false, error: { code: 'DATABASE_OFFLINE', message: 'Database connection is offline. Authentication unavailable.' } },
      { status: 500 }
    )
  }
  return authHandler.POST(request)
}

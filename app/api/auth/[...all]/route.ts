import { auth } from '@/lib/auth'
import { toNextJsHandler } from 'better-auth/next-js'
import { NextRequest, NextResponse } from 'next/server'
import { checkDbConnection } from '@/lib/db'

export const dynamic = 'force-dynamic'

const nextJsHandler = toNextJsHandler(auth.handler)

export async function GET(request: NextRequest, ctx: any) {
  if (!(await checkDbConnection())) {
    return NextResponse.json(
      { success: false, error: { code: 'DATABASE_OFFLINE', message: 'Database connection is offline. Authentication unavailable.' } },
      { status: 500 }
    )
  }
  return nextJsHandler.GET(request, ctx)
}

export async function POST(request: NextRequest, ctx: any) {
  if (!(await checkDbConnection())) {
    return NextResponse.json(
      { success: false, error: { code: 'DATABASE_OFFLINE', message: 'Database connection is offline. Authentication unavailable.' } },
      { status: 500 }
    )
  }
  return nextJsHandler.POST(request, ctx)
}

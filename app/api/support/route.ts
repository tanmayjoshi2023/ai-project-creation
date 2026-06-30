import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { feedback } from '@/lib/db/schema'
import { v4 as uuidv4 } from 'uuid'
import { checkDbConnection } from '@/lib/db'
import nodemailer from 'nodemailer'

const SUPPORT_EMAIL =
  process.env.SUPPORT_TO ?? 'tj1599509@gmail.com'
const SUPPORT_FROM =
  process.env.SUPPORT_FROM ?? 'tj1599509@gmail.com'

export const dynamic = 'force-dynamic'

function createTransporter() {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT ?? 587)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASSWORD
  const secure = process.env.SMTP_SECURE === 'true'

  if (!host || !user || !pass) {
    throw new Error('SMTP configuration is missing. Please set SMTP_HOST, SMTP_USER, and SMTP_PASSWORD.')
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  })
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Sign in to submit a support request.' } },
        { status: 401 }
      )
    }

    const body = await request.json()
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const subject = typeof body.subject === 'string' ? body.subject.trim() : ''
    const message = typeof body.message === 'string' ? body.message.trim() : ''

    if (!name || !subject || !message) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'INVALID_INPUT', message: 'Name, subject, and message are required for support requests.' },
        },
        { status: 422 }
      )
    }

    const dbAvailable = await checkDbConnection()
    if (!dbAvailable) {
      return NextResponse.json(
        { success: false, error: { code: 'SERVICE_UNAVAILABLE', message: 'Database unavailable. Please try again later.' } },
        { status: 503 }
      )
    }

    const comment = `Support request from ${name}\nSubject: ${subject}\n\n${message}`.slice(0, 2000)

    await db.insert(feedback).values({
      id: uuidv4(),
      userId: session.user.id,
      comment,
      accuracy: 'support_request',
      createdAt: new Date(),
    })

    const transporter = createTransporter()
    const replyTo = session.user.email ?? undefined
    await transporter.sendMail({
      from: SUPPORT_FROM,
      to: SUPPORT_EMAIL,
      replyTo,
      subject: `InvestIQ support request: ${subject}`,
      text: `Name: ${name}\nUser ID: ${session.user.id}\nSubject: ${subject}\n\n${message}`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Support submission failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: { code: 'SERVER_ERROR', message: error instanceof Error ? error.message : 'Unable to submit support request.' },
      },
      { status: 500 }
    )
  }
}

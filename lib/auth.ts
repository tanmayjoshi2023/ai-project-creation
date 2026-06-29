import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'
import { db } from './db'
import * as schema from './db/schema'

// Use a default secret for build time. In deployed production, this MUST be set via environment variables
const authSecret = process.env.BETTER_AUTH_SECRET || 'default-dev-secret-replace-in-production'

const BASE_URL =
  process.env.BETTER_AUTH_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined) ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ||
  process.env.V0_RUNTIME_URL ||
  'http://localhost:3000'

const TRUSTED_ORIGINS = [
  BASE_URL,
  // Always allow local development so the app is usable from localhost.
  'http://localhost:3000',
  'http://localhost:3001',
  ...(process.env.VERCEL_PROJECT_PRODUCTION_URL ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`] : []),
  ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
  ...(process.env.V0_RUNTIME_URL ? [process.env.V0_RUNTIME_URL] : []),
  // v0 / Vercel preview sandbox domains (wildcard).
  'https://*.vusercontent.net',
  'https://*.vercel.app',
]

export const auth = betterAuth({
  database: drizzleAdapter(db(), {
    provider: 'pg',
    schema,
  }),
  secret: authSecret,
  baseURL: BASE_URL,
  trustedOrigins: [...new Set(TRUSTED_ORIGINS)],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: true,
  },
  plugins: [nextCookies()],
})

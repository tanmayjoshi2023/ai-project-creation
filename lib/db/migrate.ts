/**
 * Programmatic Drizzle migration runner
 * Runs pending migrations against the connected database.
 *
 * Usage (in server startup or a one-off script):
 *   import { runMigrations } from '@/lib/db/migrate'
 *   await runMigrations()
 *
 * CLI usage:
 *   npm run db:push    → push schema directly (dev)
 *   npm run db:generate → generate migration files
 */
import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { Pool } from 'pg'
import path from 'path'

export async function runMigrations(): Promise<void> {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.warn('[migrate] DATABASE_URL not set — skipping migrations')
    return
  }

  const pool = new Pool({ connectionString, connectionTimeoutMillis: 5000 })
  let client: any

  try {
    client = await pool.connect()
    const db = drizzle(client)

    console.log('[migrate] Running pending migrations...')
    await migrate(db, {
      migrationsFolder: path.join(process.cwd(), 'lib/db/migrations'),
    })
    console.log('[migrate] Migrations complete.')
  } catch (err) {
    console.error('[migrate] Migration failed:', err)
    throw err
  } finally {
    if (client) client.release()
    await pool.end()
  }
}

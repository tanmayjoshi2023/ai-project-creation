import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL || 'postgresql://localhost/neondb'

// Create a singleton pool
let poolInstance: Pool | null = null

function getPool(): Pool {
  if (!poolInstance) {
    poolInstance = new Pool({
      connectionString,
    })
  }
  return poolInstance
}

let dbInstance: any = null

function getDb() {
  if (!dbInstance) {
    dbInstance = drizzle(getPool(), { schema })
  }
  return dbInstance
}

// For backward compatibility, export the getters as direct exports
export { getPool as pool, getDb as db }

let isDbOnlineCached: boolean | null = null

export async function checkDbConnection(): Promise<boolean> {
  if (isDbOnlineCached !== null) return isDbOnlineCached
  try {
    const p = getPool()
    const client = await Promise.race([
      p.connect(),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 1000))
    ])
    client.release()
    isDbOnlineCached = true
    return true
  } catch (err) {
    console.warn('Database offline, entering offline fallback mode:', err)
    isDbOnlineCached = false
    return false
  }
}

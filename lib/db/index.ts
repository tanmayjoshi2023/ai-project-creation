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
      connectionTimeoutMillis: 10000, // 10s — allow Neon serverless cold start
      idleTimeoutMillis: 30000,       // Release idle connections after 30s
      max: 5,                         // Cap connections for serverless environments
      ssl: connectionString.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
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

const dbProxy = new Proxy(getDb, {
  get(target, prop, receiver) {
    const instance = getDb()
    const value = Reflect.get(instance, prop, receiver)
    if (typeof value === 'function') {
      return function(this: any, ...args: any[]) {
        const start = Date.now()
        try {
          const result = value.apply(this === receiver ? instance : this, args)
          if (result instanceof Promise) {
            return result.then((res) => {
              const duration = Date.now() - start
              if (duration > 1000) {
                console.warn(`[SLOW QUERY] Method '${String(prop)}' took ${duration}ms`)
              }
              return res
            }).catch((err) => {
              console.error(`[DATABASE ERROR] Method '${String(prop)}' failed after ${Date.now() - start}ms:`, err)
              throw err
            })
          }
          return result
        } catch (err) {
          console.error(`[DATABASE ERROR] Method '${String(prop)}' failed synchronously:`, err)
          throw err
        }
      }
    }
    return value
  },
  apply(target, thisArg, argumentsList) {
    return getDb()
  }
}) as any

// For backward compatibility, export the getters as direct exports
export { getPool as pool, dbProxy as db }

export async function checkDbConnection(): Promise<boolean> {
  let client: any = null
  try {
    const p = getPool()
    client = await p.connect()
    return true
  } catch (err) {
    console.warn('Database offline check failed:', err)
    return false
  } finally {
    if (client) {
      try {
        client.release()
      } catch {}
    }
  }
}

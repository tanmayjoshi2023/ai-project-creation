'use server'

import { db } from '@/lib/db'
import { companies } from '@/lib/db/schema'
import { getUserId } from '@/lib/auth-helpers'
import { sanitizeTicker, sanitizeCompanyInput } from '@/lib/security/sanitize'
import { eq, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { v4 as uuidv4 } from 'uuid'

export async function getCompanies() {
  try {
    const userId = await getUserId()
    return await db
      .select()
      .from(companies)
      .where(eq(companies.userId, userId))
      .orderBy(companies.createdAt)
  } catch (err) {
    console.warn("DB offline, getting mock companies list")
    return []
  }
}

export async function getCompany(ticker: string) {
  try {
    const userId = await getUserId()
    return await db
      .select()
      .from(companies)
      .where(and(eq(companies.userId, userId), eq(companies.ticker, ticker)))
      .then((results) => results[0] || null)
  } catch (err) {
    console.warn("DB offline, getting mock company:", ticker)
    const { companies: mockCompanies } = require('@/lib/company-data')
    const comp = mockCompanies.find((c: any) => c.ticker === ticker.toUpperCase())
    if (comp) {
      return {
        id: `mock-company-${ticker.toUpperCase()}`,
        userId: 'offline-user-id',
        ticker: ticker.toUpperCase(),
        name: comp.name,
        sector: comp.sector,
        industry: null,
        country: null,
        website: null,
        description: null,
        marketCap: null,
        peRatio: null,
        bookValue: null,
        epsLatest: null,
        revenueLatest: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    }
    return null
  }
}

export async function createOrUpdateCompany(
  ticker: string,
  data: {
    name: string
    sector?: string | null
    industry?: string | null
    country?: string | null
    website?: string | null
    description?: string | null
    marketCap?: number | null
    peRatio?: number | null
    bookValue?: number | null
    epsLatest?: number | null
    revenueLatest?: number | null
  }
) {
  const userId = await getUserId()
  const id = uuidv4()
  const safeTicker = sanitizeTicker(ticker)
  const safeName = sanitizeCompanyInput(data.name)

  try {
    const existing = await getCompany(safeTicker)

    if (existing && !existing.id.startsWith('mock-company-')) {
      await db
        .update(companies)
        .set({
          ...data,
          name: safeName,
          updatedAt: new Date(),
        })
        .where(and(eq(companies.userId, userId), eq(companies.ticker, safeTicker)))

      revalidatePath('/')
      return { success: true, ticker: safeTicker, companyId: existing.id }
    } else {
      await db.insert(companies).values({
        id,
        userId,
        ticker: safeTicker,
        name: safeName,
        sector: data.sector,
        industry: data.industry,
        country: data.country,
        website: data.website,
        description: data.description,
        marketCap: data.marketCap,
        peRatio: data.peRatio,
        bookValue: data.bookValue,
        epsLatest: data.epsLatest,
        revenueLatest: data.revenueLatest,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    revalidatePath('/')
    return { success: true, ticker: safeTicker, companyId: id }
  } catch (error) {
    console.warn("DB offline, mock registering company:", safeTicker)
    return { success: true, ticker: safeTicker, companyId: `mock-company-${safeTicker}` }
  }
}

export async function deleteCompany(ticker: string) {
  const userId = await getUserId()

  try {
    await db
      .delete(companies)
      .where(and(eq(companies.userId, userId), eq(companies.ticker, ticker)))

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    throw new Error(`Failed to delete company: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

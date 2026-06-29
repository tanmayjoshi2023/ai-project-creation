'use server'

import { db } from '@/lib/db'
import { companies } from '@/lib/db/schema'
import { getUserId } from '@/lib/auth-helpers'
import { sanitizeTicker, sanitizeCompanyInput } from '@/lib/security/sanitize'
import { eq, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { v4 as uuidv4 } from 'uuid'

export async function getCompanies() {
  const userId = await getUserId()
  return await db
    .select({
      id: companies.id,
      ticker: companies.ticker,
      name: companies.name,
      sector: companies.sector,
      industry: companies.industry,
      country: companies.country,
      exchange: companies.exchange,
      currency: companies.currency,
      logo: companies.logo,
      website: companies.website,
      marketCap: companies.marketCap,
      peRatio: companies.peRatio,
      createdAt: companies.createdAt,
      updatedAt: companies.updatedAt,
    })
    .from(companies)
    .where(eq(companies.userId, userId))
    .orderBy(companies.createdAt)
}

export async function getCompany(ticker: string) {
  const userId = await getUserId()
  const safeTicker = sanitizeTicker(ticker)
  return await db
    .select({
      id: companies.id,
      ticker: companies.ticker,
      name: companies.name,
      sector: companies.sector,
      industry: companies.industry,
      country: companies.country,
      exchange: companies.exchange,
      currency: companies.currency,
      logo: companies.logo,
      website: companies.website,
      description: companies.description,
      marketCap: companies.marketCap,
      peRatio: companies.peRatio,
      bookValue: companies.bookValue,
      epsLatest: companies.epsLatest,
      revenueLatest: companies.revenueLatest,
      lastSynced: companies.lastSynced,
      externalIds: companies.externalIds,
      createdAt: companies.createdAt,
      updatedAt: companies.updatedAt,
    })
    .from(companies)
    .where(and(eq(companies.userId, userId), eq(companies.ticker, safeTicker)))
    .then((results) => results[0] || null)
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
    exchange?: string | null
    currency?: string | null
    logo?: string | null
    marketCap?: number | null
    peRatio?: number | null
    bookValue?: number | null
    epsLatest?: number | null
    revenueLatest?: number | null
  }
) {
  const userId = await getUserId()
  const safeTicker = sanitizeTicker(ticker)
  const safeName = sanitizeCompanyInput(data.name)
  const id = uuidv4()
  const now = new Date()

  // Atomic upsert — eliminates select-then-insert race condition.
  // ON CONFLICT (userId, ticker) DO UPDATE SET ...
  const [result] = await db
    .insert(companies)
    .values({
      id,
      userId,
      ticker: safeTicker,
      name: safeName,
      sector: data.sector ?? null,
      industry: data.industry ?? null,
      country: data.country ?? null,
      exchange: data.exchange ?? null,
      currency: data.currency ?? null,
      logo: data.logo ?? null,
      website: data.website ?? null,
      description: data.description ?? null,
      marketCap: data.marketCap ?? null,
      peRatio: data.peRatio ?? null,
      bookValue: data.bookValue ?? null,
      epsLatest: data.epsLatest ?? null,
      revenueLatest: data.revenueLatest ?? null,
      lastSynced: now,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [companies.userId, companies.ticker],
      set: {
        name: safeName,
        sector: data.sector ?? null,
        industry: data.industry ?? null,
        country: data.country ?? null,
        exchange: data.exchange ?? null,
        currency: data.currency ?? null,
        logo: data.logo ?? null,
        website: data.website ?? null,
        description: data.description ?? null,
        marketCap: data.marketCap ?? null,
        peRatio: data.peRatio ?? null,
        bookValue: data.bookValue ?? null,
        epsLatest: data.epsLatest ?? null,
        revenueLatest: data.revenueLatest ?? null,
        lastSynced: now,
        updatedAt: now,
      },
    })
    .returning({ id: companies.id, ticker: companies.ticker })

  revalidatePath('/')
  return { success: true, ticker: result.ticker, companyId: result.id }
}

export async function deleteCompany(ticker: string) {
  const userId = await getUserId()
  const safeTicker = sanitizeTicker(ticker)

  await db
    .delete(companies)
    .where(and(eq(companies.userId, userId), eq(companies.ticker, safeTicker)))

  revalidatePath('/')
  return { success: true }
}

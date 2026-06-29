import { db } from '@/lib/db'
import { subscriptions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'

const FREE_TIER_LIMIT = 3
const PRO_TIER_LIMIT = 9999

export async function ensureSubscription(userId: string) {
  const existing = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .then((rows) => rows[0])

  if (existing) return existing

  const [created] = await db
    .insert(subscriptions)
    .values({
      id: uuidv4(),
      userId,
      plan: 'free',
      analysesPerMonth: FREE_TIER_LIMIT,
      analysesUsedThisMonth: 0,
      status: 'active',
      startDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning()

  return created
}

export async function checkAnalysisQuota(userId: string): Promise<{ allowed: boolean; message?: string }> {
  const sub = await ensureSubscription(userId)
  const limit = sub.plan === 'pro' || sub.plan === 'enterprise' ? PRO_TIER_LIMIT : FREE_TIER_LIMIT
  const used = sub.analysesUsedThisMonth ?? 0

  if (used >= limit) {
    return {
      allowed: false,
      message: `You've used your ${limit} free analyses this month. Upgrade for unlimited.`,
    }
  }
  return { allowed: true }
}

export async function incrementAnalysisUsage(userId: string) {
  const sub = await ensureSubscription(userId)
  await db
    .update(subscriptions)
    .set({
      analysesUsedThisMonth: (sub.analysesUsedThisMonth ?? 0) + 1,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.userId, userId))
}

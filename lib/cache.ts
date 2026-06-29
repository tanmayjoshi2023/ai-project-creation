import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const CACHE_TTL = 60 * 60 * 6; // 6 hours

export async function getCachedAnalysis<T>(key: string): Promise<T | null> {
  const data = await redis.get<T>(key);
  return data ?? null;
}

export async function setCachedAnalysis<T>(key: string, value: T) {
  await redis.set(key, value, {
    ex: CACHE_TTL,
  });
}

export async function deleteCachedAnalysis(key: string) {
  await redis.del(key);
}
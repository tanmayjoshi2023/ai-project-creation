/**
 * LLM layer — Vercel AI Gateway (AI SDK v7) with structured JSON output + graceful fallback.
 *
 * Uses the AI Gateway (zero-config via AI_GATEWAY_API_KEY) instead of a direct
 * provider SDK, so no provider-specific API key is required. All reasoning agents
 * route to a single fast model to keep total pipeline latency well under 60s.
 *
 * Resilience:
 *   - Hard per-call timeout via AbortSignal (no unbounded hangs).
 *   - Built-in exponential backoff retries on transient/429 errors (maxRetries).
 *   - Graceful degradation: ANY failure (missing key, timeout, quota, parse error)
 *     returns the deterministic `fallback()` result instead of throwing, so the
 *     pipeline always completes.
 *
 * Only the reasoning agents (planner, bull, bear, judge) call the LLM. The
 * research agents (news, competitor) and the verifier are fully deterministic.
 */
import { generateObject } from 'ai'
import type { z } from 'zod'

export const TOKEN_BUDGETS = {
  planner:    { input: 4000,  output: 1500 },
  news:       { input: 20000, output: 3000 },
  competitor: { input: 15000, output: 2500 },
  bull:       { input: 12000, output: 2000 },
  bear:       { input: 12000, output: 2000 },
  judge:      { input: 16000, output: 2000 },
  verifier:   { input: 8000,  output: 1500 },
} as const

export type AgentModel = keyof typeof TOKEN_BUDGETS

// Single fast model for every reasoning agent. gemini-2.5-flash is low-latency and
// available zero-config through the AI Gateway.
const DEFAULT_MODEL = 'google/gemini-2.5-flash'

// Per-call wall-clock budget. Generous enough for flash, short enough that a
// stuck call can never blow the < 60s pipeline target.
const LLM_TIMEOUT_MS = 20_000
const LLM_MAX_RETRIES = 2

function truncate(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text
  return text.slice(0, maxChars) + '\n...[truncated for token budget]'
}

export function isLLMEnabled(): boolean {
  return Boolean(process.env.AI_GATEWAY_API_KEY || process.env.GEMINI_API_KEY || process.env.VERCEL_OIDC_TOKEN)
}

/**
 * Call the LLM with a Zod schema to guarantee structured output.
 *
 * Never throws — on any failure it logs and returns `fallback()`, allowing the
 * graph to continue with deterministic data (graceful degradation).
 */
export async function callStructuredLLM<T>(
  agent: AgentModel,
  systemPrompt: string,
  userPrompt: string,
  schema: z.ZodType<T>,
  fallback: () => T
): Promise<T> {
  if (!isLLMEnabled()) {
    // No gateway/credentials configured — run deterministically.
    return fallback()
  }

  const budget = TOKEN_BUDGETS[agent]
  const safeSystem = truncate(systemPrompt, budget.input * 3)
  const safeUser = truncate(userPrompt, budget.input * 3)

  try {
    const { object } = await generateObject({
      model: DEFAULT_MODEL,
      schema,
      system: `${safeSystem}\n\nRespond with valid JSON only that matches the requested schema.`,
      prompt: safeUser,
      temperature: 0.3,
      maxOutputTokens: budget.output,
      maxRetries: LLM_MAX_RETRIES,
      abortSignal: AbortSignal.timeout(LLM_TIMEOUT_MS),
    })
    return object as T
  } catch (error) {
    console.warn(
      `[LLM:${agent}] call failed, using deterministic fallback:`,
      error instanceof Error ? error.message : error
    )
    return fallback()
  }
}

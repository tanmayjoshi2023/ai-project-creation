/**
 * LLM layer — Gemini 2.5 Flash/Pro with structured JSON output + graceful fallback
 * Migrated from Anthropic Claude to Google Gemini (@google/genai).
 *
 * Agent model routing:
 *   FLASH_AGENTS (planner, news, competitor, verifier)   → gemini-2.5-flash   (fast, low-latency)
 *   PRO_AGENTS   (bull, bear, judge)                     → gemini-2.5-pro     (deep reasoning)
 *
 * Engineering Bible Vol 5, Vol 25 token budgets
 */
import { GoogleGenAI } from '@google/genai'
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

// Agents that benefit from Pro-level reasoning (high-complexity synthesis)
const PRO_AGENTS: AgentModel[] = ['judge', 'bull', 'bear']

function getModel(agent: AgentModel): string {
  if (PRO_AGENTS.includes(agent)) return 'gemini-2.5-pro'
  return 'gemini-2.5-flash'
}

function truncate(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text
  return text.slice(0, maxChars) + '\n...[truncated for token budget]'
}

// Lazy singleton — only created when GEMINI_API_KEY is present
let geminiClient: GoogleGenAI | null = null

function getClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null
  if (!geminiClient) geminiClient = new GoogleGenAI({ apiKey })
  return geminiClient
}

export function isLLMEnabled(): boolean {
  return Boolean(process.env.GEMINI_API_KEY)
}

/**
 * Call Gemini with a Zod schema to guarantee structured JSON output.
 *
 * Uses `responseMimeType: 'application/json'` so the model always returns
 * valid JSON, then parses and validates with the provided Zod schema.
 * Falls back to the fallback() function if the API key is missing.
 */
export async function callStructuredLLM<T>(
  agent: AgentModel,
  systemPrompt: string,
  userPrompt: string,
  schema: z.ZodType<T>,
  fallback: () => T
): Promise<T> {
  const client = getClient()
  if (!client) {
    throw new Error(`GEMINI_API_KEY is not configured. Real LLM call for agent '${agent}' is required.`)
  }

  const budget = TOKEN_BUDGETS[agent]
  const safeSystem = truncate(systemPrompt, budget.input * 3)
  const safeUser   = truncate(userPrompt,   budget.input * 3)

  const combinedPrompt = `${safeSystem}\n\nRespond with valid JSON only. No markdown fences.\n\n${safeUser}`

  let modelToUse = getModel(agent)
  let response

  try {
    try {
      response = await client.models.generateContent({
        model: modelToUse,
        contents: combinedPrompt,
        config: {
          maxOutputTokens: budget.output,
          responseMimeType: 'application/json',
          temperature: 0.3,
          thinkingConfig: {
            thinkingBudget: 0,
          },
        },
      })
    } catch (apiError) {
      // Fallback from gemini-2.5-pro to gemini-2.5-flash if pro fails (e.g. due to free-tier quota)
      if (modelToUse === 'gemini-2.5-pro') {
        console.warn(`[LLM:${agent}] gemini-2.5-pro failed, falling back to gemini-2.5-flash:`, apiError)
        modelToUse = 'gemini-2.5-flash'
        response = await client.models.generateContent({
          model: modelToUse,
          contents: combinedPrompt,
          config: {
            maxOutputTokens: budget.output,
            responseMimeType: 'application/json',
            temperature: 0.3,
            thinkingConfig: {
              thinkingBudget: 0,
            },
          },
        })
      } else {
        throw apiError
      }
    }

    const raw = response.text ?? '{}'
    // Strip any accidental markdown fences the model may emit
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    const parsed = JSON.parse(jsonMatch?.[0] ?? raw)
    return schema.parse(parsed)
  } catch (error) {
    console.error(`[LLM:${agent}] failed on model ${modelToUse}:`, error)
    throw new Error(`LLM call for agent '${agent}' failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * LLM layer — Claude Sonnet/Haiku with structured output + offline fallback
 * Engineering Bible Vol 5, Vol 25 token budgets
 */
import Anthropic from '@anthropic-ai/sdk'
import type { z } from 'zod'

export const TOKEN_BUDGETS = {
  planner: { input: 2000, output: 600 },
  news: { input: 15000, output: 1500 },
  competitor: { input: 10000, output: 1000 },
  bull: { input: 8000, output: 800 },
  bear: { input: 8000, output: 800 },
  judge: { input: 12000, output: 600 },
  verifier: { input: 5000, output: 300 },
} as const

export type AgentModel = keyof typeof TOKEN_BUDGETS

const HAIKU_AGENTS: AgentModel[] = ['planner', 'verifier']
const SONNET_AGENTS: AgentModel[] = ['news', 'competitor', 'bull', 'bear', 'judge']

function getModel(agent: AgentModel): string {
  if (HAIKU_AGENTS.includes(agent)) return 'claude-3-5-haiku-latest'
  return 'claude-3-5-sonnet-latest'
}

function truncate(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text
  return text.slice(0, maxChars) + '\n...[truncated for token budget]'
}

let anthropicClient: Anthropic | null = null

function getClient(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return null
  if (!anthropicClient) anthropicClient = new Anthropic({ apiKey })
  return anthropicClient
}

export function isLLMEnabled(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY)
}

export async function callStructuredLLM<T>(
  agent: AgentModel,
  systemPrompt: string,
  userPrompt: string,
  schema: z.ZodType<T>,
  fallback: () => T
): Promise<T> {
  const client = getClient()
  if (!client) {
    return fallback()
  }

  const budget = TOKEN_BUDGETS[agent]
  const safeSystem = truncate(systemPrompt, budget.input * 3)
  const safeUser = truncate(userPrompt, budget.input * 3)

  try {
    const response = await client.messages.create({
      model: getModel(agent),
      max_tokens: budget.output,
      system: safeSystem + '\nRespond with valid JSON only. No markdown fences.',
      messages: [{ role: 'user', content: safeUser }],
    })

    const textBlock = response.content.find((b) => b.type === 'text')
    const raw = textBlock?.type === 'text' ? textBlock.text : '{}'
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    const parsed = JSON.parse(jsonMatch?.[0] || raw)
    return schema.parse(parsed)
  } catch (error) {
    console.error(`[LLM:${agent}] failed, using fallback:`, error)
    return fallback()
  }
}

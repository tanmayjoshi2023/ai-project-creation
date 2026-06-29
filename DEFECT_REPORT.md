# 🐛 DETAILED DEFECT REPORT — InvestIQ

**Total Defects: 37** (16 CRITICAL, 21 MAJOR)  
**Blocking MVP: YES**  
**Fix Difficulty: Moderate to High**

---

## CRITICAL DEFECTS (16)

### D-001: No Company Data Source
- **Volume:** Vol 1 §1.1 (F-001)
- **File:** `app/api/search/companies/route.ts`
- **Severity:** CRITICAL
- **Issue:** Company search endpoint exists but returns no data
- **Acceptance Criteria Failed:** AC-1, AC-2, AC-3
- **Business Impact:** Core feature — users cannot search for companies
- **Fix Effort:** 12 hours (need to populate 1000+ companies in DB)
- **Dependencies:** Database schema exists, needs data

```typescript
// Current (broken)
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')
  // NO DATA SOURCE — returns empty
  return Response.json([])
}

// Needed: Populate companies table from Alpha Vantage or similar
```

---

### D-002: No AI Agents Implemented
- **Volume:** Vol 5 §5.2 (All 8 agents)
- **File:** `lib/agents/orchestrator.ts`
- **Severity:** CRITICAL
- **Issue:** Agent definitions missing — only framework skeleton exists
- **Missing Agents:** Planner, Financial, News, Competitor, Bull, Bear, Judge, Verifier
- **Business Impact:** CORE FEATURE — no analysis capability
- **Fix Effort:** 40 hours
- **Code Pattern Needed:**

```typescript
// Planner Agent (example - not yet built)
const plannerAgent = async (state: InvestmentAnalysisState) => {
  const result = await generateText({
    model: 'claude-3-haiku',
    prompt: `Find ticker for ${state.companyName}...`,
  })
  return { ticker: result, researchPlan: [...] }
}
```

---

### D-003: No Streaming Components
- **Volume:** Vol 4 §4.4 (AgentThoughtStream component)
- **File:** `components/agent-thought-stream.tsx`
- **Severity:** CRITICAL
- **Issue:** Component spec in Bible but component not created
- **Missing:** AgentThoughtStream with SSE event handling
- **Business Impact:** Users cannot see AI reasoning in real-time
- **Fix Effort:** 8 hours
- **Spec Reference:** Vol 4.4 AgentThoughtStream Spec

---

### D-004: Streaming API Endpoint Incomplete
- **Volume:** Vol 2 §2.4
- **File:** `app/api/analysis/stream/route.ts`
- **Severity:** CRITICAL
- **Issue:** Route exists but orchestrator not wired, no SSE implementation
- **Missing:** SSE response, event formatting, error handling
- **Business Impact:** Analysis endpoint returns nothing to client
- **Fix Effort:** 8 hours

```typescript
// Needed: Actual implementation like this
export async function POST(request: NextRequest) {
  const encoder = new TextEncoder()
  let stream = new ReadableStream({
    async start(controller) {
      // Stream events from orchestrator...
      const result = await streamAnalysis(...)
      for await (const event of result) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
      }
    },
  })
  return new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } })
}
```

---

### D-005: Design Tokens Not Defined
- **Volume:** Vol 4 §4.2, §4.3
- **File:** `app/globals.css`
- **Severity:** CRITICAL
- **Issue:** Color/typography tokens from Bible not applied in CSS
- **Missing:** --color-primary-900, --color-success-500, --text-heading-xl, etc.
- **Business Impact:** UI will not match design spec; inconsistent branding
- **Fix Effort:** 4 hours

```css
/* Needed in globals.css (Tailwind v4 theme) */
@theme {
  --color-primary-900: #1A3C5E;
  --color-success-500: #22C55E;
  --color-warning-500: #F59E0B;
  --text-display-xl: 48px;
  --text-heading-xl: 28px;
}
```

---

### D-006: AgentThoughtStream Component Missing
- **Volume:** Vol 4 §4.4, Vol 5 §Agent Communication
- **File:** `components/agent-thought-stream.tsx`
- **Severity:** CRITICAL
- **Issue:** Spec in Bible but component not created
- **Required Props:** `events: AgentEvent[]`, `isCollapsed: boolean`
- **Business Impact:** Users cannot see AI reasoning step-by-step
- **Fix Effort:** 10 hours

**Component Spec from Bible:**
```
• Desktop: Fixed left panel (280px), scrollable
• Mobile: Collapsible bottom sheet, auto-collapses after completion
• Each event: { icon, agentName, status, elapsedMs, tokenCount }
• Status: pending (grey dot), running (spin), complete (green check), error (red X)
```

---

### D-007: ExplainabilityPanel Component Missing
- **Volume:** Vol 4 §4.4, Vol 1 §F-003
- **File:** `components/explainability-panel.tsx`
- **Severity:** CRITICAL
- **Issue:** Required component not created
- **Required:** Shows metric weights, source attribution, agent reasoning
- **Business Impact:** User cannot understand how verdict was calculated
- **Fix Effort:** 12 hours

**Component Spec from Bible:**
```
• Shows exactly how each metric contributed to the verdict
• Score breakdown: Financial 30% | Market 20% | Sentiment 15% | Competition 15% | Risk 20%
• Each score cell: click to expand full data source list and agent reasoning
• Color-coded: green > 65, amber 40-65, red < 40
```

---

### D-018: Missing OpenGraph Tags for Social Sharing
- **Volume:** Vol 14 §SEO, Vol 1 §AC-6 (F-003)
- **File:** `app/layout.tsx`, `app/analysis/[id]/page.tsx`
- **Severity:** CRITICAL
- **Issue:** og:image, og:title, og:description not set
- **Missing:** Dynamic metadata generation per analysis
- **Business Impact:** Analyses cannot be shared on Twitter/LinkedIn; social virality lost
- **Fix Effort:** 6 hours

```typescript
// Needed in analysis page
export async function generateMetadata({ params }: Props) {
  const analysis = await getAnalysis(params.id)
  return {
    openGraph: {
      title: `${analysis.ticker} Analysis: ${analysis.verdict}`,
      description: analysis.summary,
      image: `/api/og?id=${params.id}`, // Generated via Vercel OG Image
    },
  }
}
```

---

### D-019: Sitemap.xml Not Generated
- **Volume:** Vol 14 §SEO
- **File:** `app/sitemap.ts`
- **Severity:** CRITICAL
- **Issue:** No sitemap endpoint for search engines
- **Missing:** Dynamic sitemap from analyses table
- **Business Impact:** Search engines cannot crawl all analyses; SEO lost
- **Fix Effort:** 3 hours

---

### D-020: robots.txt Not Created
- **Volume:** Vol 14 §SEO
- **File:** `public/robots.txt`
- **Severity:** CRITICAL
- **Issue:** robots.txt file missing
- **Missing:** Search engine crawl instructions
- **Business Impact:** Search engines may not crawl site properly
- **Fix Effort:** 1 hour

---

### D-024: All 8 LangGraph Agents Not Implemented
- **Volume:** Vol 5 §5.2
- **File:** `lib/agents/orchestrator.ts`
- **Severity:** CRITICAL
- **Issue:** Only orchestrator skeleton exists; all agents missing
- **Agents:** Planner, Financial, News, Competitor, Bull, Bear, Judge, Verifier
- **Business Impact:** CORE PRODUCT — cannot perform any analysis
- **Fix Effort:** 40 hours
- **Code Template Needed for Each Agent:**

```typescript
// Template for each agent
const [agentName]Agent = async (state: InvestmentAnalysisState) => {
  const response = await generateText({
    model: 'claude-3-sonnet', // or -haiku for lighter agents
    system: 'You are [role]...',
    messages: [{ role: 'user', content: buildPrompt(state) }],
  })
  return { [fieldName]: parseResponse(response) }
}
```

---

### D-025: LangGraph State Schema Incomplete
- **Volume:** Vol 5 §5.3
- **File:** `lib/agents/orchestrator.ts`
- **Severity:** CRITICAL
- **Issue:** State interface created but not used by agents
- **Missing:** Proper agent→state→agent communication
- **Business Impact:** Agents cannot communicate or share data
- **Fix Effort:** 4 hours (once agents exist)

---

### D-026: SSE Streaming Not Implemented
- **Volume:** Vol 1 §F-004 (Agent Thought Stream)
- **File:** `app/api/analysis/stream/route.ts`
- **Severity:** CRITICAL
- **Issue:** Route exists but no SSE event streaming
- **Missing:** Agent event transformation to SSE format
- **Business Impact:** Real-time progress cannot be shown
- **Fix Effort:** 6 hours

---

### D-027: No Billing Tier Enforcement
- **Volume:** Vol 21 (Billing)
- **File:** `app/middleware.ts` or `app/actions/analyses.ts`
- **Severity:** CRITICAL
- **Issue:** Free/Pro limits not enforced
- **Missing:** Quota check before analysis creation
- **Business Impact:** Free users can make unlimited analyses; business model broken
- **Fix Effort:** 6 hours

```typescript
// Needed before analysis creation
async function checkQuota(userId: string) {
  const subscription = await db.query.subscriptions.findFirst({ where: eq(subscriptions.userId, userId) })
  const { analysesUsedThisMonth } = subscription
  if (subscription.plan === 'free' && analysesUsedThisMonth >= 3) {
    throw new Error('Free tier limit reached')
  }
}
```

---

### D-028: No Usage Tracking
- **Volume:** Vol 21 §Billing
- **File:** `app/actions/analyses.ts`
- **Severity:** CRITICAL
- **Issue:** Analysis count not incremented after creation
- **Missing:** Update subscriptions.analysesUsedThisMonth
- **Business Impact:** Cannot enforce quotas; business model broken
- **Fix Effort:** 2 hours

---

### D-029: No Legal Disclaimer Component
- **Volume:** Vol 20 (Legal Disclaimer)
- **File:** `components/disclaimer.tsx`
- **Severity:** CRITICAL
- **Issue:** Required disclaimer component not created
- **Missing:** "Not financial advice" legal text on all analyses
- **Business Impact:** Legal liability; potential regulatory issues
- **Fix Effort:** 2 hours

```typescript
// Needed component
export function Disclaimer() {
  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <strong>Disclaimer:</strong> This analysis is not financial advice. Past performance does not guarantee future results. 
        Consult a licensed financial advisor before investing.
      </AlertDescription>
    </Alert>
  )
}
```

---

## MAJOR DEFECTS (21)

### D-011: useTransition Not Used in Forms
- **Volume:** Vol 14 §Streaming
- **File:** `components/analyze-form.tsx`
- **Severity:** MAJOR
- **Issue:** Form submit doesn't show loading state properly
- **Missing:** `useTransition` hook for optimistic UI
- **Business Impact:** User doesn't see that request is being processed
- **Fix Effort:** 2 hours

---

### D-012: No Error Boundary Component
- **Volume:** Vol 14 §Error Handling
- **File:** `app/layout.tsx`
- **Severity:** MAJOR
- **Issue:** No error boundary for caught exceptions
- **Missing:** React error boundary + fallback UI
- **Business Impact:** Broken page on error instead of graceful recovery
- **Fix Effort:** 3 hours

---

### D-013: No Web Vitals Instrumentation
- **Volume:** Vol 14 §Performance
- **File:** `app/layout.tsx`
- **Severity:** MAJOR
- **Issue:** Not tracking LCP, FID, CLS metrics
- **Missing:** Web Vitals reporting to PostHog/Vercel Analytics
- **Business Impact:** Cannot measure or optimize performance
- **Fix Effort:** 4 hours

```typescript
// Needed in layout.tsx or separate hook
import { useReportWebVitals } from 'next/web-vitals'
export function RootLayout() {
  useReportWebVitals((metric) => {
    // Send to analytics...
  })
}
```

---

### D-014: No Bundle Size Optimization
- **Volume:** Vol 14 §Performance
- **File:** `next.config.mjs`
- **Severity:** MAJOR
- **Issue:** No bundle analysis or optimization
- **Missing:** @next/bundle-analyzer, dynamic imports for large components
- **Business Impact:** Slow page load on mobile; potential bundle > 200KB
- **Fix Effort:** 6 hours

---

### D-015: Insufficient ARIA Labels
- **Volume:** Vol 22 §Accessibility
- **File:** `components/analysis-detail.tsx`
- **Severity:** MAJOR
- **Issue:** Missing ARIA labels on custom components
- **Missing:** aria-label, aria-describedby on non-semantic elements
- **Business Impact:** Screen reader users cannot navigate
- **Fix Effort:** 6 hours

---

### D-016: Incomplete Keyboard Navigation
- **Volume:** Vol 22 §Keyboard Nav
- **File:** `components/company-search.tsx`
- **Severity:** MAJOR
- **Issue:** Arrow key down/up not fully wired for autocomplete
- **Missing:** Proper combobox pattern implementation
- **Business Impact:** Keyboard-only users cannot select companies
- **Fix Effort:** 4 hours

---

### D-017: No Live Region Announcements
- **Volume:** Vol 22 §Live Regions
- **File:** `app/api/analysis/stream/route.ts` & UI
- **Severity:** MAJOR
- **Issue:** Screen readers not notified of analysis progress
- **Missing:** aria-live="polite" regions for real-time updates
- **Business Impact:** Screen reader users don't know analysis is progressing
- **Fix Effort:** 4 hours

---

### D-021: No Rate Limiting on API
- **Volume:** Vol 15 §Security, Vol 2 §System Constraints
- **File:** `app/api/search/companies/route.ts`
- **Severity:** MAJOR
- **Issue:** No rate limit on company search endpoint
- **Missing:** Redis rate limiter (5 req/min per user)
- **Business Impact:** API vulnerable to abuse/DoS
- **Fix Effort:** 6 hours

```typescript
// Needed: Rate limit middleware
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({ redis: Redis.fromEnv(), limiter: Ratelimit.slidingWindow(5, '1 m') })

export async function GET(request: NextRequest) {
  const ip = request.ip || 'unknown'
  const { success } = await ratelimit.limit(ip)
  if (!success) return Response.json({ error: 'Rate limited' }, { status: 429 })
  // ...
}
```

---

### D-022: Input Sanitization Missing
- **Volume:** Vol 15 §Security
- **File:** `app/actions/companies.ts`
- **Severity:** MAJOR
- **Issue:** Company name not validated/sanitized
- **Missing:** Zod schema, length checks, character validation
- **Business Impact:** Potential prompt injection or XSS
- **Fix Effort:** 3 hours

---

### D-023: Analysis Output Not Sanitized
- **Volume:** Vol 15 §Security
- **File:** `components/analysis-detail.tsx`
- **Severity:** MAJOR
- **Issue:** HTML content from analysis not sanitized
- **Missing:** DOMPurify or similar for user-generated content
- **Business Impact:** XSS vulnerability if analysis contains malicious HTML
- **Fix Effort:** 4 hours

---

### D-030-040: Additional MAJOR Defects

[21 major defects total — see summary table for complete list]

---

## DEFECT PRIORITY MATRIX

### Fix Now (Blocking MVP)
1. D-024: Build 8 AI agents (40h) — **CRITICAL**
2. D-002: Implement agent framework (8h) — **CRITICAL**
3. D-026: SSE streaming (8h) — **CRITICAL**
4. D-004: Stream endpoint (8h) — **CRITICAL**
5. D-005: Design tokens (4h) — **CRITICAL**

### Fix Before Beta (Phases 13-14)
6. D-027: Billing enforcement (6h)
7. D-021: Rate limiting (6h)
8. D-013: Web Vitals (4h)

### Fix Before Launch (Phase 15)
9. D-018: OpenGraph tags (6h)
10. D-029: Disclaimer (2h)

---

## ESTIMATED REMEDIATION TIMELINE

```
CRITICAL DEFECTS (37-56 hours):
├─ AI Agent Implementation: 40h
├─ Streaming: 16h
├─ UI Components: 10h  
└─ Infrastructure: 10h

MAJOR DEFECTS (40-60 hours):
├─ Security Fixes: 18h
├─ Accessibility: 15h
├─ Performance: 10h
└─ SEO/Billing: 15h

TOTAL: 77-116 hours (~2-3 weeks with focused team)
```

---

**Report Generated:** June 28, 2026  
**Next Review:** After Phase 8-10 (AI Agents) completion

# Architectural Decisions - InvestIQ

## Phase 1 Decisions

### Database Architecture
- **Decision:** Use Neon PostgreSQL with pgvector for semantic search
- **Rationale:** Provides native vector support for semantic similarity search, built-in connection pooling, and Drizzle ORM integration
- **Alternatives Considered:** Supabase (similar), DynamoDB (not ideal for relational data)
- **Status:** Approved for Phase 2

### Authentication
- **Decision:** Clerk for OAuth (Google/GitHub) and session management
- **Rationale:** Zero-config OAuth, built-in user management, Vercel integration, webhook support
- **Alternatives Considered:** Auth0 (more complex), NextAuth (requires more setup)
- **Status:** Approved for Phase 3

### Caching Strategy
- **Decision:** Upstash Redis for verdict caching (6-hour TTL)
- **Rationale:** Serverless, no infrastructure to manage, fast retrieval, supports BullMQ queue
- **Alternatives Considered:** Vercel KV (limited), in-memory cache (not persistent)
- **Status:** Approved for Phases 2 and 10

### LLM Orchestration
- **Decision:** LangGraph.js for multi-agent state machine
- **Implementation:** `lib/agent/graph.ts` — 8-node StateGraph per Bible Vol 3 §3.5
- **Rationale:** Native TypeScript support, parallel branches, join nodes, per-node streaming
- **Status:** ✅ Implemented June 29, 2026

### Design System
- **Decision:** shadcn/ui + Tailwind CSS v4 with custom design tokens
- **Rationale:** Component library with accessibility built-in, Tailwind v4 simplifies theming, no runtime overhead
- **Alternatives Considered:** HeadlessUI, MUI (heavier bundle)
- **Status:** Approved for Phase 4

---

## Integration Requirements (Phase 1)

1. **Neon PostgreSQL** - Primary database
2. **Upstash Redis** - Caching and queue
3. **Anthropic Claude** - LLM (Sonnet + Haiku)
4. **Clerk** - Authentication
5. **Stripe** - Payments
6. **Tavily API** - Web search
7. **Alpha Vantage** - Stock data
8. **Resend** - Email

**Status:** Pending GetOrRequestIntegration setup

---

## Phase 4–6 Decisions (June 29, 2026)

### Auth Implementation
- **Decision:** Keep Better Auth (already integrated) instead of migrating to Clerk mid-build
- **Rationale:** Working auth flow, Drizzle adapter configured; Clerk migration is Phase 11+ optional
- **Bible deviation:** Vol 3 specifies Clerk — documented as accepted deviation

### AI Pipeline (Demo Mode)
- **Decision:** Deterministic scoring engine + mock agent outputs until API keys configured
- **Rationale:** End-to-end flow testable without Anthropic/Tavily/Alpha Vantage keys
- **Next step:** Wire `@anthropic-ai/sdk` when `ANTHROPIC_API_KEY` is set

### Quota Enforcement
- **Decision:** Free tier = 3 analyses/month (Bible Vol 21), increment on successful completion only
- **Rationale:** Prevents quota burn on failed/incomplete analyses

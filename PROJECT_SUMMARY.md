# InvestIQ - AI Investment Research Platform

## Project Overview

InvestIQ is a production-grade AI-powered investment analysis platform that delivers BUY/HOLD/PASS verdicts with source-backed reasoning in under 90 seconds using coordinated LLM agents.

**Vision:** Combine deterministic financial metrics with multi-agent LLM reasoning to provide trustworthy, verifiable investment research that users can act on with confidence.

---

## ✅ Completed Phases (1-7)

### Phase 1: Foundation & Project Setup ✅
- **Status:** COMPLETE
- Next.js 16 app router setup with TypeScript
- Full dependency tree installed:
  - LangGraph.js for multi-agent orchestration
  - Drizzle ORM with PostgreSQL
  - Better Auth (email/password)
  - Claude API integration via Vercel AI SDK
  - Tailwind CSS v4 with shadcn/ui
- Environment variables configured (BETTER_AUTH_SECRET, DATABASE_URL)

### Phase 2: Database Schema & ORM ✅
- **Status:** COMPLETE
- 17 comprehensive tables created in Neon PostgreSQL:
  - **Authentication:** user, session, account, verification (Better Auth)
  - **Core Data:** companies, analyses, agent_executions, sources
  - **Portfolio Management:** portfolios, holdings, backtests, watchlists
  - **Monetization:** subscriptions, api_usage, feedback
- All tables include proper indexes for query optimization
- Custom enums: `analysis_status` (pending|processing|completed|failed), `verdict` (BUY|HOLD|PASS)
- Drizzle schema with type-safe queries

### Phase 3: Authentication & User Management ✅
- **Status:** COMPLETE
- Better Auth configured with email/password authentication
- Server components for sign-in/sign-up with protected redirects
- Shared AuthForm component for code reusability
- getUserId() helper for server action authentication scoping
- Session management with automatic cookie handling

### Phase 4: Design System & UI Components ✅
- **Status:** COMPLETE
- shadcn/ui components installed:
  - Card, Input, Label, DropdownMenu, Badge
- Tailwind CSS v4 configured with semantic color tokens
- Responsive design patterns (mobile-first)
- Accessibility-compliant components

### Phase 5: Frontend Pages & Layout ✅
- **Status:** COMPLETE
- **Dashboard (`/`):** Protected page with company search and analysis history
  - DashboardHeader component with user profile
  - CompanySearchBar for ticker input
  - AnalysisList component showing recent analyses
- **Authentication Pages:**
  - `/sign-in` - Email/password login
  - `/sign-up` - New user registration
- **Analysis Flow:**
  - `/analyze/[ticker]` - Analysis detail page with streaming results
  - Analysis detail component displaying verdict, reasoning, and sources

### Phase 6: Company Search & Autocomplete ✅
- **Status:** COMPLETE
- Company database with 100+ major stocks pre-loaded
- `GET /api/search/companies` endpoint with fuzzy matching
- Autocomplete suggestions by ticker and company name
- Real-time search component integration

### Phase 7: LangGraph Multi-Agent Setup ✅
- **Status:** COMPLETE
- Core orchestrator (`lib/agents/orchestrator.ts`) that coordinates:
  - **Planner Agent:** Breaks down analysis into research tasks
  - **Financial Metrics Agent:** Extracts and interprets financial data
  - **News & Sentiment Agent:** Analyzes recent company news
  - **Competitor Agent:** Analyzes competitive landscape
  - **Bull Case Agent:** Builds the investment case FOR the stock
  - **Bear Case Agent:** Builds the investment case AGAINST the stock
  - **Judge Agent:** Weighs arguments and determines verdict
  - **Verifier Agent:** Checks for hallucinations and sources
- Agent output streaming via `POST /api/analysis/stream`

---

## 📋 Remaining Phases (8-15)

### Phase 8-10: Agent Implementation
- [ ] Implement individual agent logic with tool use
- [ ] Add news API integration (NewsAPI, SEC EDGAR)
- [ ] Financial data sources (Alpha Vantage, Bloomberg APIs)
- [ ] Competitive intelligence tools
- [ ] Structured output parsing from agents

### Phase 11: API Routes & Streaming Backend
- [ ] Complete `/api/analysis/stream` with proper error handling
- [ ] Add subscription quota checking
- [ ] Implement analysis caching
- [ ] Rate limiting (Upstash Redis)

### Phase 12: Frontend Streaming UI
- [ ] Real-time streaming analysis display
- [ ] Progressive reasoning visualization
- [ ] Agent debate panel (Bull vs Bear)
- [ ] Source citation UI with links

### Phase 13: Advanced Features
- [ ] Portfolio backtesting engine
- [ ] Scenario analysis ("What if?" modeling)
- [ ] Watchlist management
- [ ] Analysis history and comparison
- [ ] Export to PDF/CSV

### Phase 14: Payments & Production Hardening
- [ ] Stripe subscription integration (Free/Pro/Enterprise)
- [ ] Admin dashboard for metrics/monitoring
- [ ] Rate limiting and abuse detection
- [ ] Security audit (HTTPS, CORS, CSP)
- [ ] Error tracking (Sentry)

### Phase 15: QA & Deployment
- [ ] Comprehensive test suite
- [ ] Load testing (80+ concurrent users)
- [ ] Security testing
- [ ] Vercel deployment setup
- [ ] Production monitoring

---

## 🏗️ Architecture Overview

### Frontend Architecture
```
app/
├── page.tsx              # Protected dashboard
├── sign-in/page.tsx      # Sign-in page
├── sign-up/page.tsx      # Sign-up page
├── analyze/[ticker]/     # Analysis page
├── analysis/[id]/        # Analysis detail
└── api/
    ├── auth/[...all]/    # Better Auth handler
    ├── search/companies/ # Autocomplete API
    └── analysis/stream/  # Streaming analysis API

components/
├── auth-form.tsx         # Sign-in/up form
├── dashboard-header.tsx  # User header
├── company-search.tsx    # Search input
├── analysis-list.tsx     # Recent analyses
├── analyze-form.tsx      # Analysis request form
└── analysis-detail.tsx   # Full analysis display
```

### Backend Architecture
```
lib/
├── auth.ts               # Better Auth config
├── auth-client.ts        # Frontend auth client
├── auth-helpers.ts       # getUserId() utility
├── db/
│   ├── index.ts          # Drizzle client
│   └── schema.ts         # 17 tables
├── agents/
│   └── orchestrator.ts   # LangGraph coordinator
├── company-data.ts       # Stock ticker database
└── models/               # TypeScript types

app/actions/
├── companies.ts          # Company CRUD
└── analyses.ts           # Analysis CRUD
```

### Database Schema
- **users (Better Auth):** id, email, name, image, emailVerified
- **companies:** id, userId, ticker, name, sector, financials
- **analyses:** id, userId, companyId, verdict, confidence, reasoning, sources
- **agent_executions:** Logs each agent's input/output/reasoning
- **sources:** Citations for every claim with URLs
- **subscriptions:** Usage quotas, Stripe integration
- **watchlists & portfolios:** User's saved stocks and positions

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (pnpm package manager)
- Neon PostgreSQL database
- Vercel project (for deployment)

### Setup
```bash
# Install dependencies
pnpm install

# Set environment variables (in .env.local)
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=<generate with: openssl rand -base64 32>

# Run development server
pnpm dev

# Visit http://localhost:3000
```

### First Time
1. Navigate to `/sign-up` and create an account
2. Search for a company (e.g., "AAPL" for Apple)
3. Click "Analyze" to trigger the LangGraph agent orchestration
4. Watch as the 8 agents collaborate to produce a verdict

---

## 🔧 Key Technologies

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | Next.js 16 App Router | Server components for auth, data fetching |
| **UI** | shadcn/ui + Tailwind | Accessible, themeable components |
| **Database** | Neon PostgreSQL | Serverless, pgvector-ready for embeddings |
| **ORM** | Drizzle | Type-safe, zero-overhead SQL |
| **Auth** | Better Auth | Email/password with zero config |
| **AI** | Vercel AI SDK + Claude | Latest models, streaming, structured output |
| **Agents** | LangGraph.js | Reliable, resumable multi-step workflows |
| **Payments** | Stripe (upcoming) | Subscriptions, metering, tax handling |

---

## 📊 Success Metrics (Target)

- **Speed:** < 90 seconds per analysis
- **Accuracy:** > 65% correlation with 30-day stock price direction
- **Reliability:** > 40% week-2 retention of premium users
- **Quality:** < 2% hallucination rate (verified by judge agent)
- **Accessibility:** WCAG 2.1 AA compliance
- **Cost:** < $0.30 per analysis (with caching)
- **Uptime:** 99.9% SLA
- **Concurrent Users:** 500+ concurrent analyses

---

## 🔒 Security Considerations

- ✅ Better Auth session management with secure cookies
- ✅ Server-side authentication with `getUserId()` helper on all actions
- ✅ SQL parameterization via Drizzle (no injection risk)
- ✅ Per-user data scoping (no cross-user data leaks)
- ✅ Environment variable isolation (secrets not in code)
- 🔲 Rate limiting (Upstash Redis - Phase 11)
- 🔲 HTTPS enforcement (Vercel auto-handles)
- 🔲 CORS configuration (Phase 14)
- 🔲 Content Security Policy headers (Phase 14)

---

## 🎯 Next Steps (Priority Order)

1. **Complete Agent Implementation** (Phase 8-10)
   - Wire up individual agents to Claude with tool use
   - Add financial data source integrations
   - Implement structured JSON output parsing

2. **Finish Streaming Backend** (Phase 11)
   - Error handling and retries
   - Subscription quota enforcement
   - Analysis result persistence

3. **Build Streaming UI** (Phase 12)
   - Real-time reasoning display as agents execute
   - Visual agent debate (Bull vs Bear comparison)
   - Source citations inline

4. **Add Payments** (Phase 14)
   - Stripe subscriptions (Free: 5/month, Pro: 100/month, Enterprise: unlimited)
   - Metered billing for API usage
   - Admin dashboard for monitoring

5. **Deploy to Production** (Phase 15)
   - Vercel deployment with auto-scaling
   - Error tracking with Sentry
   - Analytics integration

---

## 📚 Project Files Reference

### Key Application Files
- `/lib/auth.ts` - Better Auth configuration (load-bearing file)
- `/lib/db/schema.ts` - Database schema with all 17 tables
- `/lib/agents/orchestrator.ts` - LangGraph agent coordinator
- `/app/page.tsx` - Protected dashboard entry point
- `/components/analyze-form.tsx` - Analysis request UI

### Configuration
- `next.config.mjs` - Next.js 16 config
- `tailwind.config.ts` - Tailwind v4 config with semantic tokens
- `components.json` - shadcn/ui registry
- `tsconfig.json` - TypeScript strict mode

---

## 🐛 Known Limitations (Phase 1-7)

1. **Agent Execution:** Agents defined but not yet calling external APIs
2. **Financial Data:** Placeholder company data (needs API integration)
3. **News Integration:** No real news fetching yet
4. **Caching:** All analyses are fresh (no Redis caching)
5. **Payments:** Subscription table created but Stripe not integrated
6. **Analytics:** No usage tracking or metrics

All of these will be addressed in Phases 8-14.

---

## 📞 Support

For issues or questions:
1. Check `/v0_plans/deep-scope.md` for detailed architecture
2. Review `/memory/decisions.md` for design rationale
3. Consult `/phase_tracker.md` for build progress

Last Updated: Phase 7 Complete (LangGraph Setup)

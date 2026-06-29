# InvestIQ Implementation Guide

## Executive Summary

You now have a **production-grade foundation** for InvestIQ with:
- ✅ Secure user authentication (Better Auth)
- ✅ Comprehensive database schema (17 tables, Neon PostgreSQL)
- ✅ Full-stack type safety (TypeScript, Drizzle ORM)
- ✅ Modern UI framework (Next.js 16, shadcn/ui, Tailwind CSS v4)
- ✅ AI orchestration framework (LangGraph.js setup)
- ✅ Server action pattern for data operations
- ✅ API routes for streaming analysis

**Current State:** Phases 1-7 complete, fully buildable and deployable

---

## What's Working Now

### Authentication Flow
```
1. User visits http://localhost:3000
2. Redirected to /sign-in (unauthenticated)
3. Sign up: /sign-up → Creates user in database
4. Sign in: /sign-in → Creates session, redirects to dashboard
5. Dashboard: / → Protected page showing user's analyses
```

### Data Layer
```
All requests follow this pattern:

1. Client component calls server action
2. Server action calls getUserId() for auth
3. Query scoped to userId using Drizzle
4. Result returned to client
5. Cache invalidated with revalidatePath()
```

### Example Server Action (in `/app/actions/companies.ts`):
```typescript
'use server'

export async function createCompany(ticker: string, name: string) {
  const userId = await getUserId() // Auth check
  
  return db.insert(companies)
    .values({ id: generateId(), userId, ticker, name, ... })
    .returning()
}
```

---

## Completing Phases 8-15

### Phase 8-10: Agent Implementation (Highest Priority)

**File to update:** `/lib/agents/orchestrator.ts`

Currently, agents are structured but don't call external APIs. To complete:

1. **Add Financial Data Sources**
   ```typescript
   // Install: pnpm add finnhub-api axios
   import axios from 'axios'
   
   async function fetchStockData(ticker: string) {
     const res = await axios.get(
       `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${FINNHUB_API_KEY}`
     )
     return res.data
   }
   ```

2. **Implement Agent Tool Functions**
   ```typescript
   const tools = {
     searchNews: tool({
       description: 'Search for recent news about a company',
       inputSchema: z.object({ ticker: z.string() }),
       execute: async ({ ticker }) => {
         // Call NewsAPI, Alpha Vantage, or similar
       }
     }),
     // More tools...
   }
   ```

3. **Wire Agents to LangGraph**
   ```typescript
   // Each agent becomes a LangGraph node
   const graph = new Graph()
     .addNode('planner', plannerAgent)
     .addNode('financial', financialAgent)
     .addEdge('planner', 'financial')
     // ... more edges
   ```

### Phase 11: Complete Streaming Backend

**File to update:** `/app/api/analysis/stream/route.ts`

Add:
- Subscription quota checking
- Error handling and retries
- Analysis caching (Upstash Redis)
- Result persistence to database

```typescript
export async function POST(request: NextRequest) {
  const { ticker, userId } = await request.json()
  
  // Check subscription quota
  const subscription = await db.query.subscriptions
    .findFirst({ where: eq(subscriptions.userId, userId) })
  
  if (subscription.analysesUsedThisMonth >= subscription.analysesPerMonth) {
    return Response.json({ error: 'Quota exceeded' }, { status: 402 })
  }
  
  // Run analysis and stream results
  // Persist to database on completion
}
```

### Phase 12: Streaming UI

**Files to update:** 
- `/components/analyze-form.tsx` 
- Create `/components/streaming-analysis.tsx`

Display agent reasoning in real-time:
```tsx
export function StreamingAnalysis({ ticker }) {
  const [analysis, setAnalysis] = useState('')
  
  useEffect(() => {
    const eventSource = new EventSource(
      `/api/analysis/stream?ticker=${ticker}`
    )
    
    eventSource.onmessage = (e) => {
      const data = JSON.parse(e.data)
      setAnalysis(prev => prev + data.chunk)
    }
  }, [ticker])
  
  return <div>{analysis}</div>
}
```

### Phase 13: Advanced Features

1. **Portfolio Backtesting**
   - Create `/app/actions/backtests.ts`
   - Implement historical price simulation
   - Store results in database

2. **Watchlist Management**
   - UI in `/components/watchlist-manager.tsx`
   - CRUD actions in `/app/actions/watchlists.ts`

3. **Scenario Analysis**
   - "What if stock drops 20%?" calculations
   - Store scenarios in database

### Phase 14: Payments

**Install Stripe:**
```bash
pnpm add stripe @stripe/react next-auth
```

**Create:**
- `/lib/stripe.ts` - Stripe configuration
- `/app/api/stripe/webhooks/route.ts` - Webhook handler
- `/app/settings/billing/page.tsx` - Billing page

**Database update:**
- Already have `subscriptions` table
- Add Stripe webhook logging table

**Quota enforcement:**
```typescript
const sub = await db.query.subscriptions.findFirst({ 
  where: eq(subscriptions.userId, userId)
})

if (sub.analysesUsedThisMonth >= sub.analysesPerMonth) {
  // Show upgrade prompt
}

// Increment usage
await db.update(subscriptions)
  .set({ analysesUsedThisMonth: sql`${subscriptions.analysesUsedThisMonth} + 1` })
  .where(eq(subscriptions.userId, userId))
```

### Phase 15: Deployment

**Step 1: Set Production Env Vars**
```bash
# In Vercel dashboard:
- DATABASE_URL=<neon-prod-url>
- BETTER_AUTH_SECRET=<your-generated-secret>
- FINNHUB_API_KEY=<your-key>
- NEWSAPI_KEY=<your-key>
- STRIPE_SECRET_KEY=<your-key>
```

**Step 2: Deploy**
```bash
git add .
git commit -m "Phase 7: Foundation complete"
git push origin main
# Vercel auto-deploys on push
```

**Step 3: Run Migrations**
```bash
# Already done via Neon MCP
# But verify all tables exist in production:
psql $DATABASE_URL -c "\dt"
```

---

## Development Workflow

### Adding a New Feature

1. **Database Schema Change**
   ```bash
   # Use Neon MCP to create/alter table
   # (No Drizzle migrations - direct DDL)
   ```

2. **Update ORM Schema**
   ```bash
   # Edit /lib/db/schema.ts
   # Add new table definition
   ```

3. **Create Server Action**
   ```bash
   # New file: /app/actions/feature.ts
   # Always use getUserId() pattern
   ```

4. **Build UI Component**
   ```bash
   # New file: /components/feature-ui.tsx
   # Call server action on submit
   ```

5. **Add API Route (if needed)**
   ```bash
   # New file: /app/api/feature/route.ts
   # Use `export const dynamic = 'force-dynamic'`
   ```

### Testing Locally

```bash
# Start dev server
pnpm dev

# Navigate to http://localhost:3000
# Sign up with test@example.com / password
# Test feature locally
```

---

## Key Files Reference

| File | Purpose | When to Edit |
|------|---------|--------------|
| `/lib/auth.ts` | Better Auth config | Adding OAuth/magic links |
| `/lib/db/schema.ts` | ORM schema | Adding new tables |
| `/lib/db/index.ts` | Drizzle client | Changing connection logic |
| `/app/actions/*.ts` | Server logic | Adding new features |
| `/components/*.tsx` | UI components | Styling/layout changes |
| `/app/api/**/*.ts` | API routes | Webhooks, streaming endpoints |

---

## Common Patterns

### Fetching User Data
```typescript
'use server'

export async function getUserAnalyses() {
  const userId = await getUserId()
  return db.query.analyses.findMany({
    where: eq(analyses.userId, userId)
  })
}
```

### Mutating Data
```typescript
'use server'

export async function updateAnalysis(id: string, verdict: string) {
  const userId = await getUserId()
  
  // Check ownership
  const analysis = await db.query.analyses.findFirst({
    where: and(eq(analyses.id, id), eq(analyses.userId, userId))
  })
  
  if (!analysis) throw new Error('Not found')
  
  await db.update(analyses)
    .set({ verdict })
    .where(eq(analyses.id, id))
  
  revalidatePath('/') // Refresh cache
}
```

### Client-Side Data Fetching
```typescript
'use client'

import { getUserAnalyses } from '@/app/actions/analyses'

export function AnalysisList() {
  const [analyses, setAnalyses] = useState([])
  
  useEffect(() => {
    getUserAnalyses().then(setAnalyses)
  }, [])
  
  return (...)
}
```

---

## Troubleshooting

### "DATABASE_URL is not set"
- Check: Environment variables in Vercel dashboard
- For local dev: Create `.env.local` with your DATABASE_URL

### "BETTER_AUTH_SECRET is not set"
- Generate: `openssl rand -base64 32`
- Add to Vercel project settings

### Build fails with "Cannot find module"
- Install: `pnpm add <package>`
- Don't import before installing

### API route returns 404
- Ensure file is in `/app/api/` directory
- Use kebab-case for folders: `/app/api/search/companies/route.ts`

---

## Next.js 16 Notes

- **params, searchParams are async:** Must be awaited
- **Server Components default:** Use `'use client'` only when needed
- **Middleware:** Optional, not required for basic auth
- **API Routes:** Must have `export const dynamic = 'force-dynamic'` if reading user data
- **Turbopack:** Default bundler, much faster than Webpack

---

## Performance Optimization (Future)

### Database
- Add indexes on frequently queried columns (done ✅)
- Use prepared statements (Drizzle handles this ✅)
- Cache with Redis (Upstash integration - Phase 11)

### Frontend
- Image optimization with `next/image`
- Component code splitting (automatic)
- Edge caching with Vercel CDN

### API
- Response compression (Vercel handles)
- Rate limiting with Upstash Redis
- Request deduplication

---

## Security Checklist

- ✅ All user data scoped by userId
- ✅ SQL parameterization (Drizzle)
- ✅ Secrets in environment variables
- ✅ HTTPS for all requests (Vercel enforces)
- ✅ Secure session cookies
- 🔲 CORS configuration (add in Phase 14)
- 🔲 CSP headers (add in Phase 14)
- 🔲 Rate limiting (add in Phase 11)
- 🔲 Input validation schemas (add per endpoint)

---

## Deployment Checklist

Before pushing to production:
- [ ] All env vars set in Vercel
- [ ] Database migrations applied
- [ ] Test signup/signin flow
- [ ] Verify API endpoints respond
- [ ] Check error handling
- [ ] Monitor performance (Vercel Analytics)

---

## Support & Resources

- **Next.js:** https://nextjs.org/docs
- **Drizzle:** https://orm.drizzle.team
- **Better Auth:** https://better-auth.com
- **Vercel:** https://vercel.com/docs
- **shadcn/ui:** https://ui.shadcn.com
- **Neon:** https://neon.tech/docs

Good luck! 🚀

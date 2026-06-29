# InvestIQ Quick Start

## 🚀 Getting Started (5 minutes)

### Prerequisites
- Node.js 18+
- Neon PostgreSQL database (provided via integration)
- Vercel account

### Installation

```bash
# 1. Install dependencies
pnpm install

# 2. Start dev server
pnpm dev

# 3. Open http://localhost:3000
```

### First Time Setup

1. **Create Account**
   - Go to http://localhost:3000/sign-up
   - Enter: email@example.com / password123
   - Creates user in database

2. **Explore Dashboard**
   - After sign-in, you're on the dashboard
   - Search for a company (e.g., "Apple", "AAPL")
   - Results appear in autocomplete

3. **View Analysis**
   - Click "Analyze" to start analysis
   - Watch LangGraph agents reason through the stock
   - See final verdict (BUY/HOLD/PASS)

---

## 📁 Project Structure

```
investiq/
├── app/                      # Next.js app directory
│   ├── page.tsx             # Dashboard (protected)
│   ├── sign-in/page.tsx      # Login page
│   ├── sign-up/page.tsx      # Registration page
│   ├── analyze/[ticker]/     # Analysis page
│   ├── api/
│   │   ├── auth/[...all]     # Better Auth handler
│   │   ├── search/companies  # Stock search API
│   │   └── analysis/stream   # Streaming analysis API
│   └── actions/              # Server actions
│       ├── companies.ts      # Company operations
│       └── analyses.ts       # Analysis operations
│
├── lib/                      # Utilities
│   ├── auth.ts              # Better Auth config
│   ├── auth-client.ts       # Frontend auth client
│   ├── db/
│   │   ├── index.ts         # Drizzle client
│   │   └── schema.ts        # 17 database tables
│   ├── agents/
│   │   └── orchestrator.ts  # LangGraph agents
│   └── company-data.ts      # Stock ticker database
│
├── components/              # React components
│   ├── auth-form.tsx
│   ├── dashboard-header.tsx
│   ├── company-search.tsx
│   ├── analysis-list.tsx
│   ├── analyze-form.tsx
│   └── analysis-detail.tsx
│
├── env.example              # Copy to .env.local
├── package.json             # Dependencies
└── README.md                # Full documentation
```

---

## 🔧 Common Commands

```bash
# Development
pnpm dev                # Start dev server on :3000
pnpm build             # Build for production
pnpm start             # Start production server

# Database
# (Managed via Neon MCP - no local migrations)

# Type checking
pnpm type-check        # Check TypeScript

# Linting
pnpm lint              # Run ESLint
```

---

## 📊 Database Schema (Quick Reference)

### Core Tables
| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `user` | Users | id, email, name |
| `session` | Auth sessions | userId, token, expiresAt |
| `companies` | Stock data | ticker, name, sector |
| `analyses` | AI verdicts | verdict, confidence, reasoning |
| `agent_executions` | Agent logs | agentName, output, sources |
| `sources` | Citations | url, title, relevanceScore |
| `subscriptions` | Usage quotas | plan, analysesPerMonth |

---

## 🛠️ Development Tips

### Add a New Component
```typescript
// 1. Create file: components/my-component.tsx
'use client'

export function MyComponent() {
  return <div>Hello</div>
}

// 2. Import in page: import { MyComponent } from '@/components'
// 3. Use in JSX: <MyComponent />
```

### Add a Server Action
```typescript
// 1. Create file: app/actions/my-feature.ts
'use server'

import { getUserId } from '@/lib/auth-helpers'
import { db } from '@/lib/db'

export async function myAction(input: string) {
  const userId = await getUserId()
  // Database operations here
}

// 2. Call from client: const result = await myAction(input)
```

### Add an API Route
```typescript
// 1. Create: app/api/my-endpoint/route.ts
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  return Response.json({ data: 'hello' })
}

// 2. Call: fetch('/api/my-endpoint')
```

---

## 🧪 Testing Locally

### Sign-in Flow
```bash
1. npm run dev
2. Open http://localhost:3000
3. Click "Sign up"
4. Enter email: test@example.com
5. Enter password: test123456
6. Click "Sign In"
7. Redirected to dashboard
```

### Database Verification
```bash
# Connect to Neon database
psql $DATABASE_URL

# Check tables exist
\dt

# Query sample data
SELECT * FROM "user";
```

### API Testing
```bash
# Search companies
curl http://localhost:3000/api/search/companies?q=apple

# Start analysis (POST)
curl -X POST http://localhost:3000/api/analysis/stream \
  -H "Content-Type: application/json" \
  -d '{"ticker":"AAPL"}'
```

---

## 🚀 Deployment

### Deploy to Vercel

```bash
# 1. Push to GitHub
git add .
git commit -m "InvestIQ initial setup"
git push origin main

# 2. Connect in Vercel Dashboard
# https://vercel.com/new
# Select GitHub repo → Deploy

# 3. Set environment variables
# BETTER_AUTH_SECRET: (generated with openssl rand -base64 32)
# DATABASE_URL: (from Neon integration)

# 4. Vercel auto-deploys on push
```

---

## 📈 Monitoring

### Check Logs
```bash
# In Vercel dashboard:
# Deployments → Select deployment → Logs

# Or via CLI:
vercel logs
```

### Database Monitoring
```bash
# In Neon dashboard:
# Check connection pool status
# Monitor query performance
# View replication status
```

---

## ❓ FAQ

### Q: How do I add authentication providers (Google, GitHub)?
A: Edit `/lib/auth.ts` and add OAuth providers via Better Auth plugins.

### Q: How do I connect to my own Neon database?
A: Update `DATABASE_URL` in `.env.local` to your Neon connection string.

### Q: How do I enable real AI analysis?
A: Complete Phase 8-10 (add agent implementations + API integrations).

### Q: How do I add payment processing?
A: Follow Phase 14 (Stripe integration guide in IMPLEMENTATION_GUIDE.md).

### Q: The app won't start - "Cannot find module X"
A: Run `pnpm install && pnpm dev` again.

---

## 📞 Support

1. **Check Documentation**
   - PROJECT_SUMMARY.md - Full overview
   - IMPLEMENTATION_GUIDE.md - Step-by-step next phases
   - phase_tracker.md - Current progress

2. **Enable Debug Logging**
   ```typescript
   console.log('[v0] Debug message:', value)
   ```

3. **Common Issues**
   - Database not found → Check DATABASE_URL
   - Auth errors → Verify BETTER_AUTH_SECRET
   - Build fails → Run `pnpm install` first

---

## 🎯 Next: Complete the AI Features

**Most impactful next steps:**
1. **Phase 8-10:** Implement LangGraph agents with real APIs
2. **Phase 11:** Finish streaming backend
3. **Phase 12:** Add real-time UI streaming
4. **Phase 14:** Add Stripe payments

See `IMPLEMENTATION_GUIDE.md` for detailed instructions on each phase.

---

Happy building! 🚀

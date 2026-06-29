import { NextRequest, NextResponse } from 'next/server'
import { searchCompanies, companies as companyList } from '@/lib/company-data'
import { sanitizeCompanyInput } from '@/lib/security/sanitize'

export async function GET(request: NextRequest) {
  const startTime = performance.now()

  try {
    const searchParams = request.nextUrl.searchParams
    const q = sanitizeCompanyInput(searchParams.get('q') || '')

    if (!q || q.length < 1) {
      return NextResponse.json(
        { success: true, data: { results: [] }, meta: { requestId: crypto.randomUUID(), cacheHit: false } },
        {
          headers: {
            'X-Response-Time': `${Math.round(performance.now() - startTime)}ms`,
            'Cache-Control': 'public, max-age=300',
          },
        }
      )
    }

    const results = searchCompanies(q)
    const suggestions =
      results.length === 0
        ? companyList
            .filter((c) => c.name.toLowerCase().includes(q.toLowerCase().slice(0, 3)))
            .slice(0, 3)
            .map((c) => ({ symbol: c.ticker, name: c.name, region: 'US' }))
        : []

    const responseTime = Math.round(performance.now() - startTime)

    return NextResponse.json(
      {
        success: true,
        data: { results, suggestions: results.length === 0 ? suggestions : [] },
        meta: { requestId: crypto.randomUUID(), cacheHit: false },
      },
      {
        headers: {
          'X-Response-Time': `${responseTime}ms`,
          'Cache-Control': 'public, max-age=300',
        },
      }
    )
  } catch (error) {
    console.error('Search error:', error)
    const responseTime = Math.round(performance.now() - startTime)
    return NextResponse.json(
      { success: false, error: { code: 'SEARCH_FAILED', message: 'Search failed' }, data: { results: [] } },
      {
        status: 500,
        headers: { 'X-Response-Time': `${responseTime}ms` },
      }
    )
  }
}

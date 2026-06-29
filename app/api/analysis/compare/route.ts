import { NextRequest, NextResponse } from 'next/server'
import { runAnalysis } from '@/lib/agent/runner'
import { getSession } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { companies } from '@/lib/company-data'
import { createOrUpdateCompany } from '@/app/actions/companies'
import { createAnalysis, persistAnalysisResults } from '@/app/actions/analyses'
import { sanitizeTicker } from '@/lib/security/sanitize'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    const body = await request.json()
    const ticker1 = sanitizeTicker(body.ticker1 || '').toUpperCase()
    const ticker2 = sanitizeTicker(body.ticker2 || '').toUpperCase()

    if (!ticker1 || !ticker2) {
      return NextResponse.json(
        { success: false, error: { code: 'COMPANY_NOT_FOUND', message: 'Two valid tickers are required' } },
        { status: 422 }
      )
    }

    // Resolve names from mock stock database
    const comp1 = companies.find((c) => c.ticker === ticker1) || { name: ticker1, sector: 'Unknown' }
    const comp2 = companies.find((c) => c.ticker === ticker2) || { name: ticker2, sector: 'Unknown' }

    let analysisId1: string | null = null
    let analysisId2: string | null = null

    // Try to register companies and create pending database analyses (gracefully fallback if DB offline)
    try {
      const dbComp1 = await createOrUpdateCompany(ticker1, { name: comp1.name, sector: comp1.sector })
      const dbComp2 = await createOrUpdateCompany(ticker2, { name: comp2.name, sector: comp2.sector })

      if (dbComp1.companyId) {
        const a1 = await createAnalysis(dbComp1.companyId, ticker1)
        if (a1.success) analysisId1 = a1.analysisId
      }
      if (dbComp2.companyId) {
        const a2 = await createAnalysis(dbComp2.companyId, ticker2)
        if (a2.success) analysisId2 = a2.analysisId
      }
    } catch (dbError) {
      console.warn('Database error while setting up comparison, running in-memory fallback:', dbError)
    }

    // Run both analyses in parallel using Promise.allSettled
    const [result1, result2] = await Promise.allSettled([
      runAnalysis({ ticker: ticker1, companyName: comp1.name, sector: comp1.sector, userId: session.user.id }),
      runAnalysis({ ticker: ticker2, companyName: comp2.name, sector: comp2.sector, userId: session.user.id }),
    ])

    const data1 = result1.status === 'fulfilled' ? result1.value : null
    const data2 = result2.status === 'fulfilled' ? result2.value : null

    // Persist results if DB is available and runs succeeded
    try {
      if (data1 && analysisId1) {
        await persistAnalysisResults(analysisId1, data1, { skipQuotaIncrement: true })
      }
      if (data2 && analysisId2) {
        await persistAnalysisResults(analysisId2, data2, { skipQuotaIncrement: true })
      }
    } catch (dbPersistError) {
      console.warn('Database error during result persistence:', dbPersistError)
    }

    return NextResponse.json({
      success: true,
      data: {
        company1: {
          ticker: ticker1,
          name: comp1.name,
          analysis: data1,
          error: result1.status === 'rejected' ? result1.reason?.message : null,
        },
        company2: {
          ticker: ticker2,
          name: comp2.name,
          analysis: data2,
          error: result2.status === 'rejected' ? result2.reason?.message : null,
        },
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Comparison error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'ANALYSIS_TIMEOUT',
          message: error instanceof Error ? error.message : 'Comparison failed to run',
        },
      },
      { status: 500 }
    )
  }
}

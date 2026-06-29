'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createAnalysis } from '@/app/actions/analyses'
import { createOrUpdateCompany } from '@/app/actions/companies'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Disclaimer } from '@/components/disclaimer'
import { AlertCircle, Zap, ArrowRight, Loader2 } from 'lucide-react'

interface AnalyzeFormProps {
  ticker: string
  company?: { ticker: string; name: string; sector: string } | null
}

export function AnalyzeForm({ ticker, company }: AnalyzeFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleAnalyze() {
    setError(null)

    startTransition(async () => {
      try {
        const companyResult = await createOrUpdateCompany(ticker, {
          name: company?.name || ticker,
          sector: company?.sector || null,
        })

        if (!companyResult.companyId) {
          throw new Error('Failed to register company')
        }

        const result = await createAnalysis(companyResult.companyId, ticker)

        if (result.success) {
          router.push(`/analysis/${result.analysisId}`)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Analysis failed')
      }
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">{ticker}</h1>
        {company && <p className="text-muted-foreground text-lg mt-2">{company.name}</p>}
        {company && <p className="text-sm text-muted-foreground">Sector: {company.sector}</p>}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            AI Investment Analysis
          </CardTitle>
          <CardDescription>
            Get comprehensive investment research powered by 8 specialized AI agents in under 90 seconds
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">What You&apos;ll Get:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ BUY/HOLD/PASS verdict</li>
                  <li>✓ Confidence score (0–100%)</li>
                  <li>✓ Financial analysis</li>
                  <li>✓ News analysis</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Analysis Includes:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ Competitor analysis</li>
                  <li>✓ Bull vs Bear arguments</li>
                  <li>✓ Risk assessment</li>
                  <li>✓ Verified sources</li>
                </ul>
              </div>
            </div>

            {error && (
              <div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800 dark:bg-red-950/20 dark:border-red-900 dark:text-red-200">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <div className="pt-4">
              <Button
                onClick={handleAnalyze}
                disabled={isPending}
                size="lg"
                className="w-full md:w-auto"
                aria-busy={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    Get Investment Verdict
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Disclaimer />
    </div>
  )
}

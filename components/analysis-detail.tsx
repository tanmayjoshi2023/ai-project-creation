'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, TrendingUp, TrendingDown, CheckCircle, Target } from 'lucide-react'

interface AnalysisDetailProps {
  analysis: any
}

export function AnalysisDetail({ analysis }: AnalysisDetailProps) {
  const getVerdictColor = (verdict: string | null) => {
    if (!verdict) return 'bg-gray-100 text-gray-800'
    switch (verdict) {
      case 'BUY':
        return 'bg-green-100 text-green-800'
      case 'HOLD':
        return 'bg-yellow-100 text-yellow-800'
      case 'PASS':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getVerdictIcon = (verdict: string | null) => {
    if (!verdict) return null
    switch (verdict) {
      case 'BUY':
        return <TrendingUp className="h-5 w-5" />
      case 'PASS':
        return <TrendingDown className="h-5 w-5" />
      case 'HOLD':
        return <Target className="h-5 w-5" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-4xl">{analysis.ticker}</CardTitle>
              <CardDescription>
                {new Date(analysis.createdAt).toLocaleDateString()} •{' '}
                {analysis.processingTimeMs ? `${(analysis.processingTimeMs / 1000).toFixed(1)}s` : 'Processing...'}
              </CardDescription>
            </div>
            {analysis.verdict && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${getVerdictColor(analysis.verdict)}`}>
                {getVerdictIcon(analysis.verdict)}
                <span className="font-bold text-lg">{analysis.verdict}</span>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Summary */}
      {analysis.summary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">{analysis.summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Scores */}
      {(analysis.confidence || analysis.riskScore || analysis.opportunityScore) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Analysis Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analysis.confidence && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Confidence</div>
                  <div className="text-2xl font-bold">{(analysis.confidence * 100).toFixed(0)}%</div>
                  <div className="h-2 bg-gray-200 rounded mt-2">
                    <div
                      className="h-2 bg-green-500 rounded"
                      style={{ width: `${analysis.confidence * 100}%` }}
                    />
                  </div>
                </div>
              )}
              {analysis.opportunityScore && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Opportunity</div>
                  <div className="text-2xl font-bold">{analysis.opportunityScore.toFixed(0)}</div>
                  <div className="h-2 bg-gray-200 rounded mt-2">
                    <div
                      className="h-2 bg-blue-500 rounded"
                      style={{ width: `${Math.min(analysis.opportunityScore / 100 * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
              {analysis.riskScore && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Risk</div>
                  <div className="text-2xl font-bold">{analysis.riskScore.toFixed(0)}</div>
                  <div className="h-2 bg-gray-200 rounded mt-2">
                    <div
                      className="h-2 bg-red-500 rounded"
                      style={{ width: `${Math.min(analysis.riskScore / 100 * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Arguments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {analysis.bullArguments && (
          <Card className="border-green-200 bg-green-50/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Bull Case
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground leading-relaxed">{analysis.bullArguments}</p>
            </CardContent>
          </Card>
        )}
        {analysis.bearArguments && (
          <Card className="border-red-200 bg-red-50/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                Bear Case
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground leading-relaxed">{analysis.bearArguments}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Detailed Reasoning */}
      {analysis.reasoning && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Detailed Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{analysis.reasoning}</p>
          </CardContent>
        </Card>
      )}

      {/* Estimated Value */}
      {analysis.estimatedValue && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Estimated Fair Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">${analysis.estimatedValue.toFixed(2)}</div>
            <p className="text-sm text-muted-foreground mt-2">AI-derived fair value estimate based on financial analysis</p>
          </CardContent>
        </Card>
      )}

      {/* Hallucinations Warning */}
      {analysis.hallucinations && analysis.hallucinations.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              Verification Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {(analysis.hallucinations as any[]).map((item: any, idx: number) => (
                <li key={idx} className="text-sm text-foreground">
                  • {typeof item === 'string' ? item : item.note || JSON.stringify(item)}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Sources */}
      {analysis.sources && Array.isArray(analysis.sources) && analysis.sources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sources</CardTitle>
            <CardDescription>Data sources used in this analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {(analysis.sources as any[]).map((source: any, idx: number) => (
                <li key={idx} className="text-sm border-b pb-2 last:border-0">
                  <div className="font-semibold text-foreground">{source.title || source.url}</div>
                  <div className="text-xs text-muted-foreground mt-1">{source.source}</div>
                  {source.url && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      View source →
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Status */}
      {analysis.status && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {analysis.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-600" />}
          <span className="capitalize">{analysis.status} analysis</span>
        </div>
      )}
    </div>
  )
}

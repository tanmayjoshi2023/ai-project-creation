/**
 * Legal disclaimer — Engineering Bible Vol 20 (verbatim, non-negotiable)
 */
export const DISCLAIMER_TEXT = `InvestIQ provides AI-generated investment research for informational purposes only.
This is not financial advice. InvestIQ is not a registered investment advisor.
Past performance of AI verdicts does not guarantee future results.
Always consult a qualified financial advisor before making investment decisions.
Market investments carry risk, including loss of principal.`

interface DisclaimerProps {
  className?: string
}

export function Disclaimer({ className = '' }: DisclaimerProps) {
  return (
    <div
      role="note"
      aria-label="Investment disclaimer"
      className={`p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 ${className}`}
    >
      <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2 text-sm uppercase tracking-wide">
        Important Disclaimer
      </h3>
      <p className="text-sm text-amber-800 dark:text-amber-200 whitespace-pre-line leading-relaxed">
        {DISCLAIMER_TEXT}
      </p>
    </div>
  )
}

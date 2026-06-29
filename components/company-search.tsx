'use client'

import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { CompanySearchAutocomplete } from '@/components/company-search-autocomplete'

export function CompanySearchBar() {
  const router = useRouter()

  return (
    <Card className="p-6">
      <CompanySearchAutocomplete
        onSelect={(company) => {
          router.push(`/analyze/${company.symbol}`)
        }}
      />
      <p className="mt-4 text-sm text-muted-foreground">
        Search any company — Apple, NVDA, Tesla...
      </p>
    </Card>
  )
}

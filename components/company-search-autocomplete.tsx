'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Search, Loader2, TrendingUp } from 'lucide-react'

interface Company {
  symbol: string
  name: string
  region: string
}

interface CompanySearchAutocompleteProps {
  onSelect?: (company: Company) => void
  className?: string
}

export function CompanySearchAutocomplete({
  onSelect,
  className = '',
}: CompanySearchAutocompleteProps): JSX.Element {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Company[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length > 0) {
        performSearch(query)
      } else {
        setResults([])
        setIsOpen(false)
      }
    }, 200)

    return () => clearTimeout(timer)
  }, [query])

  const performSearch = async (searchQuery: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/search/companies?q=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const json = await response.json()
        const data = json.data || json
        setResults(data.results || [])
        setIsOpen(true)
        setSelectedIndex(0)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (isOpen && results.length > 0 && results[selectedIndex]) {
        selectCompany(results[selectedIndex])
      } else if (query.trim()) {
        const cleanQuery = query.trim()
        const match = cleanQuery.match(/^([A-Z0-9.\-]+)\s*-\s*(.+)$/i)
        if (match) {
          selectCompany({
            symbol: match[1].toUpperCase(),
            name: match[2],
            region: 'US',
          })
        } else {
          const isTicker = /^[A-Z0-9.\-]{1,12}$/i.test(cleanQuery)
          selectCompany({
            symbol: isTicker ? cleanQuery.toUpperCase() : cleanQuery,
            name: cleanQuery,
            region: 'US',
          })
        }
      }
    } else if (isOpen && results.length > 0) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) => (prev + 1) % results.length)
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) => (prev - 1 + results.length) % results.length)
          break
        case 'Escape':
          e.preventDefault()
          setIsOpen(false)
          break
      }
    }
  }

  const selectCompany = (company: Company) => {
    setQuery(`${company.symbol} - ${company.name}`)
    setIsOpen(false)
    onSelect?.(company)
  }

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search any company — Apple, NVDA, Tesla..."
          aria-label="Search companies"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length > 0 && setIsOpen(true)}
          className="pl-10 pr-10"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-blue animate-spin" />
        )}
      </div>

      {isOpen && results.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-2 max-h-60 overflow-y-auto z-50">
          {results.map((company, idx) => (
            <button
              key={`${company.symbol}-${idx}`}
              onClick={() => selectCompany(company)}
              className={`w-full text-left px-4 py-3 border-b hover:bg-muted/50 transition-colors flex items-center gap-3 ${
                idx === selectedIndex ? 'bg-muted' : ''
              } ${idx === results.length - 1 ? 'border-b-0' : ''}`}
            >
              <TrendingUp className="w-4 h-4 text-brand-blue flex-shrink-0" />
              <div className="flex-grow min-w-0">
                <p className="font-semibold text-foreground truncate">{company.symbol}</p>
                <p className="text-xs text-muted-foreground truncate">{company.name}</p>
              </div>
              <span className="text-xs text-muted-foreground flex-shrink-0">{company.region}</span>
            </button>
          ))}
        </Card>
      )}

      {isOpen && query.length > 0 && results.length === 0 && !isLoading && (
        <Card className="absolute top-full left-0 right-0 mt-2 p-4 text-center text-sm text-muted-foreground z-50">
          <p>No companies found for &quot;{query}&quot;</p>
          <p className="text-xs mt-1">Did you mean Tesla (TSLA) or Apple (AAPL)?</p>
        </Card>
      )}
    </div>
  )
}

export default CompanySearchAutocomplete

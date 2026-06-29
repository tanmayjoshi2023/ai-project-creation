// Mock company data for autocomplete
// In production, this would come from an API (Alpha Vantage, IEX Cloud, etc.)

export const companies = [
  { ticker: 'AAPL', name: 'Apple Inc.', sector: 'Technology' },
  { ticker: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology' },
  { ticker: 'GOOGL', name: 'Alphabet Inc. (Google)', sector: 'Technology' },
  { ticker: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer Cyclical' },
  { ticker: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology' },
  { ticker: 'TSLA', name: 'Tesla Inc.', sector: 'Automotive' },
  { ticker: 'META', name: 'Meta Platforms Inc.', sector: 'Technology' },
  { ticker: 'AVGO', name: 'Broadcom Inc.', sector: 'Technology' },
  { ticker: 'COST', name: 'Costco Wholesale Corporation', sector: 'Consumer Defensive' },
  { ticker: 'ASML', name: 'ASML Holding N.V.', sector: 'Technology' },
  { ticker: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare' },
  { ticker: 'V', name: 'Visa Inc.', sector: 'Financial Services' },
  { ticker: 'WMT', name: 'Walmart Inc.', sector: 'Consumer Defensive' },
  { ticker: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Financial Services' },
  { ticker: 'MA', name: 'Mastercard Incorporated', sector: 'Financial Services' },
  { ticker: 'MV', name: 'MicroVision Inc.', sector: 'Technology' },
  { ticker: 'INTC', name: 'Intel Corporation', sector: 'Technology' },
  { ticker: 'AMD', name: 'Advanced Micro Devices Inc.', sector: 'Technology' },
  { ticker: 'QCOM', name: 'Qualcomm Incorporated', sector: 'Technology' },
  { ticker: 'CSCO', name: 'Cisco Systems Inc.', sector: 'Technology' },
  { ticker: 'NFLX', name: 'Netflix Inc.', sector: 'Communication Services' },
  { ticker: 'DIS', name: 'The Walt Disney Company', sector: 'Communication Services' },
  { ticker: 'BA', name: 'The Boeing Company', sector: 'Industrials' },
  { ticker: 'GE', name: 'General Electric Company', sector: 'Industrials' },
  { ticker: 'XOM', name: 'Exxon Mobil Corporation', sector: 'Energy' },
  { ticker: 'CVX', name: 'Chevron Corporation', sector: 'Energy' },
]

interface SearchResult {
  symbol: string
  name: string
  region: string
}

export function searchCompanies(query: string): SearchResult[] {
  if (!query.trim()) return []

  const q = query.toLowerCase()
  
  // Filter and map to result format
  return companies
    .filter(
      (company) =>
        company.ticker.toLowerCase().includes(q) || company.name.toLowerCase().includes(q)
    )
    .slice(0, 10) // Limit to 10 results for faster response
    .map((company) => ({
      symbol: company.ticker,
      name: company.name,
      region: 'US', // Add region (could be extended in future)
    }))
}

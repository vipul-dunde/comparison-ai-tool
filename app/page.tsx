'use client';

import { useState } from 'react';

interface PriceResult {
  link: string;
  price: number;
  currency: string;
  productName: string;
}

interface ApiResponse {
  country?: string;
  countryCode?: string;
  currency?: string;
  results?: PriceResult[];
  error?: string;
}

// Country options for the dropdown
const COUNTRY_OPTIONS = [
  { code: 'US', name: 'United States', currency: 'USD' },
  { code: 'IN', name: 'India', currency: 'INR' },
  { code: 'UK', name: 'United Kingdom', currency: 'GBP' },
  { code: 'CA', name: 'Canada', currency: 'CAD' },
  { code: 'AU', name: 'Australia', currency: 'AUD' },
];

export default function Home() {
  const [query, setQuery] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('US');
  const [results, setResults] = useState<PriceResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [searchedCountry, setSearchedCountry] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError('Please enter a product to search for');
      return;
    }

    setLoading(true);
    setError('');
    setResults([]);
    setSearchedCountry('');

    try {
      const response = await fetch('/api/price', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query,
          country: selectedCountry 
        }),
      });

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch prices');
      }

      setResults(data.results || []);
      setSearchedCountry(data.country || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    });
    
    try {
      return formatter.format(price);
    } catch {
      return `${price} ${currency}`;
    }
  };

  const getCountryName = (countryCode: string) => {
    return COUNTRY_OPTIONS.find(country => country.code === countryCode)?.name || countryCode;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Price Comparison Tool
          </h1>
          <p className="text-lg text-gray-600">
            Find the best prices for your products across multiple retailers
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-1">
                  Product Query
                </label>
                <input
                  type="text"
                  id="query"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g., iPhone 16 Pro, 128GB"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <select
                  id="country"
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {COUNTRY_OPTIONS.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name} ({country.currency})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {searchedCountry && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-700">
                  🌍 Showing results for: <span className="font-semibold">{searchedCountry}</span>
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Searching...' : `Search Prices in ${getCountryName(selectedCountry)}`}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Price Results ({results.length} found)
            </h2>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {result.productName}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {new URL(result.link).hostname}
                      </p>
                      <a
                        href={result.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm underline"
                      >
                        View Product
                      </a>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        {formatPrice(result.price, result.currency)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Rank #{index + 1}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Searching for the best prices...</p>
          </div>
        )}
      </div>
    </div>
  );
} 
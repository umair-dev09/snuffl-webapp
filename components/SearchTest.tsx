'use client'
import { useState } from 'react'

export default function SearchTest() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const search = async () => {
    if (!query.trim()) return
    
    setLoading(true)
    setError('')
    
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        body: JSON.stringify({ userId: 'guest', query }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!res.ok) {
        throw new Error(`Search failed: ${res.status}`)
      }

      const data = await res.json()
      setResults(data.top9 || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">🔍 AI Product Search Test</h1>
      <div className="flex gap-2 mb-4">
        <input
          className="border p-2 flex-1 rounded"
          type="text"
          value={query}
          placeholder="Try: Best headphones under ₹3000"
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && search()}
          disabled={loading}
        />
        <button 
          onClick={search} 
          disabled={loading || !query.trim()}
          className="bg-black text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6">
        {results.length > 0 && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              Found <span className="font-semibold">{results.length}</span> products
              {results.length === 9 ? ' (Top 9 shown)' : ''}
            </p>
          </div>
        )}
        
        {results.map((p, i) => (
          <div key={i} className="border p-4 mb-3 rounded shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <p className="text-lg font-semibold">{p.title}</p>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  p.matchType === 'exact' ? 'bg-green-100 text-green-800' :
                  p.matchType === 'smartFit' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {p.matchType === 'exact' ? '🎯 Exact Match' :
                   p.matchType === 'smartFit' ? '🧠 Smart Fit' :
                   '📍 Partial Fit'}
                </span>
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                  Score: {p.score || 0}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-2">
              <p className="text-green-600 font-medium">Price: ₹{p.price}</p>
              {p.smartRating && (
                <span className="text-sm text-gray-700">{p.smartRating}</span>
              )}
            </div>
            
            <p className="text-sm text-gray-600 mb-3">{p.snufflTake || 'No AI summary yet'}</p>
            
            {(p.pros?.length > 0 || p.cons?.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {p.pros?.length > 0 && (
                  <div>
                    <p className="font-medium text-green-700 mb-1">✅ Pros:</p>
                    <ul className="text-green-600 space-y-1">
                      {p.pros.map((pro: string, idx: number) => (
                        <li key={idx}>• {pro}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {p.cons?.length > 0 && (
                  <div>
                    <p className="font-medium text-red-700 mb-1">❌ Cons:</p>
                    <ul className="text-red-600 space-y-1">
                      {p.cons.map((con: string, idx: number) => (
                        <li key={idx}>• {con}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, Zap, TrendingDown } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import GroceryInput from '@/components/grocery/GroceryInput'
import LocationInput from '@/components/grocery/LocationInput'
import PriceResults from '@/components/grocery/PriceResults'
import type { PriceComparisonResult } from '@/types'

interface Props {
  isLoggedIn: boolean
}

export default function GrocerySavingsClient({ isLoggedIn }: Props) {
  const { items, zipCode, result, setResult } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAnalyze() {
    if (items.length === 0) {
      setError('Add at least one item to your list.')
      return
    }
    if (!zipCode || zipCode.length !== 5) {
      setError('Enter a valid 5-digit ZIP code.')
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/grocery-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, zipCode }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Analysis failed. Please try again.')
      }

      const data: PriceComparisonResult = await res.json()
      setResult(data)

      // Auto-save trip for logged-in users
      if (isLoggedIn) {
        await fetch('/api/trips/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items,
            result: data,
            store_chosen: data.best_single_store.store,
            total_spent: data.best_single_store.total,
            savings_amount: data.best_single_store.savings,
          }),
        }).catch(() => {}) // Non-blocking
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-5xl mx-auto w-full px-4 py-8">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-3">
          Find the best grocery deals
          <span className="text-orange-500"> near you</span>
        </h1>
        <p className="text-stone-500 text-base sm:text-lg max-w-xl mx-auto">
          Compare prices at Walmart, Target, Kroger, and Aldi — instantly.
          AI finds your best deal and splits your cart to maximize savings.
        </p>
      </div>

      <div className="grid md:grid-cols-[1fr_320px] gap-6 items-start">
        {/* Left: grocery list */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-stone-900 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-orange-500" />
              Your grocery list
            </h2>
            {items.length > 0 && (
              <span className="bg-orange-100 text-orange-600 text-xs font-medium px-2 py-0.5 rounded-full">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>
          <GroceryInput />
        </div>

        {/* Right: location + analyze */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-5">
            <LocationInput />
          </div>

          {/* Stats pill */}
          {items.length > 0 && (
            <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 flex items-center gap-3 animate-fade-in">
              <TrendingDown className="w-5 h-5 text-orange-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-stone-900">Ready to compare</p>
                <p className="text-xs text-stone-500">{items.length} items · FreshSave will check 4 stores</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm animate-fade-in">
              {error}
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={loading || items.length === 0}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2 text-base shadow-sm"
            aria-label="Compare prices across stores"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Comparing prices…
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Compare prices
              </>
            )}
          </button>

          {/* Store logos / trust bar */}
          <div className="text-center">
            <p className="text-xs text-stone-400 mb-2">Checking prices at</p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {['Walmart', 'Target', 'Kroger', 'Aldi'].map((store) => (
                <span
                  key={store}
                  className="text-xs font-medium text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full"
                >
                  {store}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="mt-8 space-y-4 animate-fade-in">
          <div className="h-5 w-48 skeleton rounded-full" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-stone-100 space-y-3">
                <div className="h-4 w-20 skeleton rounded-full" />
                <div className="h-8 w-24 skeleton rounded-full" />
                <div className="h-3 w-16 skeleton rounded-full" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="mt-8 animate-fade-in">
          <PriceResults result={result} />

          {/* Sign-in nudge for guests */}
          {!isLoggedIn && (
            <div className="mt-6 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4">
              <div className="text-center sm:text-left flex-1">
                <p className="font-semibold text-stone-900">
                  Save your ${result.best_single_store.savings.toFixed(2)} savings to your dashboard
                </p>
                <p className="text-sm text-stone-500 mt-0.5">
                  Track your savings over time, get AI tips, and never lose your lists.
                </p>
              </div>
              <Link
                href="/ounje-auth"
                className="shrink-0 bg-orange-500 hover:bg-orange-600 text-white font-medium px-5 py-2.5 rounded-xl transition-colors text-sm whitespace-nowrap"
              >
                Sign up free →
              </Link>
            </div>
          )}
        </div>
      )}
    </main>
  )
}

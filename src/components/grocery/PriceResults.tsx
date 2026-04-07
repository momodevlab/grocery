'use client'

import { useState } from 'react'
import { TrendingDown, Star, Tag, ChevronDown, ChevronUp, Info, CheckCircle2, AlertCircle } from 'lucide-react'
import type { PriceComparisonResult, PricedItem, StoreTotal } from '@/types'
import { STORE_COLORS, STORES } from '@/types'

interface Props {
  result: PriceComparisonResult
}

export default function PriceResults({ result }: Props) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'single' | 'split'>('single')

  const { best_single_store, split_strategy, store_totals, items, baseline_total, coupons } = result

  return (
    <div className="space-y-6">
      {/* Savings summary */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm text-green-700 font-medium mb-1 flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4" />
              Best deal found
            </p>
            <h2 className="text-3xl font-bold text-stone-900">
              Save ${best_single_store.savings.toFixed(2)}
            </h2>
            <p className="text-stone-500 text-sm mt-1">
              {best_single_store.savings_pct.toFixed(0)}% less than average · Shop at{' '}
              <span className="font-semibold text-stone-700">{best_single_store.store}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-stone-400 mb-0.5">Your total</p>
            <p className="text-2xl font-bold text-stone-900">${best_single_store.total.toFixed(2)}</p>
            <p className="text-xs text-stone-400 line-through">${baseline_total.toFixed(2)} avg</p>
          </div>
        </div>
      </div>

      {/* Strategy tabs */}
      <div>
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('single')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'single'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            Single store
          </button>
          <button
            onClick={() => setActiveTab('split')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'split'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            Split stores{' '}
            {split_strategy.savings > best_single_store.savings && (
              <span className="ml-1 bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded-full">
                saves more
              </span>
            )}
          </button>
        </div>

        {activeTab === 'single' && (
          <StoreTotalsGrid totals={store_totals} bestStore={best_single_store.store} />
        )}

        {activeTab === 'split' && (
          <SplitStrategy strategy={split_strategy} />
        )}
      </div>

      {/* Per-item price table */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100">
          <h3 className="font-semibold text-stone-900">Price breakdown by item</h3>
          <p className="text-xs text-stone-400 mt-0.5">Click any item to see full store comparison</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50">
                <th className="text-left px-5 py-3 text-stone-500 font-medium" scope="col">Item</th>
                {STORES.map((store) => (
                  <th key={store} className="text-right px-3 py-3 font-medium" scope="col">
                    <span
                      className="inline-block px-2 py-0.5 rounded-full text-white text-xs"
                      style={{ backgroundColor: STORE_COLORS[store] }}
                    >
                      {store}
                    </span>
                  </th>
                ))}
                <th className="text-right px-5 py-3 text-stone-500 font-medium" scope="col">Best</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {items.map((item) => (
                <ItemRow
                  key={item.name}
                  item={item}
                  expanded={expandedItem === item.name}
                  onToggle={() => setExpandedItem(expandedItem === item.name ? null : item.name)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Coupons */}
      {coupons.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
          <h3 className="font-semibold text-stone-900 mb-3 flex items-center gap-2">
            <Tag className="w-4 h-4 text-orange-500" />
            Available coupons & deals
          </h3>
          <div className="space-y-2">
            {coupons.map((coupon, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-stone-50 last:border-0">
                <div>
                  <p className="text-sm text-stone-700">{coupon.description}</p>
                  <p className="text-xs text-stone-400">
                    {coupon.store} · via {coupon.source}
                    {coupon.expires && ` · expires ${coupon.expires}`}
                  </p>
                </div>
                <span className="text-green-600 font-semibold text-sm shrink-0 ml-3">
                  −${coupon.savings.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estimated data note */}
      {items.some((i) => i.prices.some((p) => p.is_estimated)) && (
        <div className="flex items-start gap-2 text-xs text-stone-400 bg-stone-50 rounded-xl px-4 py-3">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Some prices are AI-estimated based on regional averages and may vary. Prices labeled{' '}
            <span className="italic">Est.</span> are not live data.
          </span>
        </div>
      )}
    </div>
  )
}

function StoreTotalsGrid({ totals, bestStore }: { totals: StoreTotal[]; bestStore: string }) {
  const sorted = [...totals].sort((a, b) => a.total - b.total)
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {sorted.map((t) => (
        <div
          key={t.store}
          className={`bg-white rounded-2xl p-4 border-2 transition-all ${
            t.store === bestStore
              ? 'border-green-400 shadow-md'
              : 'border-stone-100 shadow-sm'
          }`}
        >
          {t.store === bestStore && (
            <div className="flex items-center gap-1 text-green-600 text-xs font-semibold mb-2">
              <Star className="w-3.5 h-3.5 fill-green-500" />
              Best deal
            </div>
          )}
          <p className="font-semibold text-stone-800 mb-1">{t.store}</p>
          <p className="text-2xl font-bold text-stone-900">${t.total.toFixed(2)}</p>
          {t.savings > 0 && (
            <p className="text-xs text-green-600 mt-1 font-medium">
              Save ${t.savings.toFixed(2)} ({t.savings_pct.toFixed(0)}%)
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

function SplitStrategy({ strategy }: { strategy: PriceComparisonResult['split_strategy'] }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-stone-900">
            Shop at {strategy.stores.join(' + ')}
          </p>
          <p className="text-sm text-stone-500">Split strategy — ${strategy.total.toFixed(2)} total</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-green-600">−${strategy.savings.toFixed(2)}</p>
          <p className="text-xs text-stone-400">{strategy.savings_pct.toFixed(0)}% saved</p>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {strategy.stores.map((store) => (
          <div key={store} className="bg-stone-50 rounded-xl p-4">
            <p className="font-medium text-stone-800 mb-2">{store}</p>
            <ul className="space-y-1">
              {(strategy.items_per_store[store] ?? []).map((item) => (
                <li key={item} className="text-sm text-stone-600 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

function ItemRow({ item, expanded, onToggle }: { item: PricedItem; expanded: boolean; onToggle: () => void }) {
  const prices = STORES.map((store) => item.prices.find((p) => p.store === store))
  const minPrice = Math.min(...item.prices.map((p) => p.price))

  return (
    <>
      <tr
        className="hover:bg-orange-50/30 cursor-pointer transition-colors"
        onClick={onToggle}
      >
        <td className="px-5 py-3 text-stone-800 font-medium">
          <div className="flex items-center gap-1.5">
            <span>
              {item.qty > 1 && <span className="text-stone-400 text-xs mr-1">{item.qty}{item.unit && ` ${item.unit}`}</span>}
              {item.name}
            </span>
            {item.substitution && (
              <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">swap</span>
            )}
            {expanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-stone-400 ml-auto" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-stone-400 ml-auto" />
            )}
          </div>
        </td>
        {prices.map((price, i) => (
          <td key={i} className="px-3 py-3 text-right">
            {price ? (
              <span
                className={`font-medium ${
                  price.price === minPrice ? 'text-green-600' : 'text-stone-600'
                }`}
              >
                ${price.price.toFixed(2)}
                {price.is_estimated && <span className="text-xs text-stone-400 ml-0.5">*</span>}
              </span>
            ) : (
              <span className="text-stone-300">—</span>
            )}
          </td>
        ))}
        <td className="px-5 py-3 text-right">
          <span className="text-green-600 font-semibold">{item.cheapest_store}</span>
        </td>
      </tr>

      {/* Expanded row */}
      {expanded && (
        <tr className="bg-orange-50/20">
          <td colSpan={STORES.length + 2} className="px-5 pb-4 pt-1">
            <div className="space-y-2">
              {/* Unit prices */}
              <div className="flex flex-wrap gap-2">
                {item.prices.map((p) => (
                  <div key={p.store} className="bg-white rounded-lg px-3 py-2 border border-stone-100 text-xs">
                    <p className="font-medium text-stone-700">{p.store}</p>
                    <p className="text-stone-500">${p.unit_price.toFixed(3)}/{p.unit || 'ea'}</p>
                    <p className={`flex items-center gap-1 mt-0.5 ${
                      p.in_stock === 'in_stock' ? 'text-green-600' : 'text-amber-500'
                    }`}>
                      {p.in_stock === 'in_stock' ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <AlertCircle className="w-3 h-3" />
                      )}
                      {p.in_stock === 'in_stock' ? 'In stock' : p.in_stock === 'likely' ? 'Likely in stock' : 'Unknown'}
                    </p>
                  </div>
                ))}
              </div>

              {/* Substitution */}
              {item.substitution && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs">
                  <p className="font-medium text-amber-800 mb-0.5">Suggested swap</p>
                  <p className="text-amber-700">
                    Try <strong>{item.substitution.name}</strong> at {item.substitution.store} — ${item.substitution.price.toFixed(2)}{' '}
                    <span className="text-green-700">(save ${item.substitution.savings.toFixed(2)})</span>
                  </p>
                  <p className="text-amber-600 mt-0.5">{item.substitution.reason}</p>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

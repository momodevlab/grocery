export type Plan = 'free' | 'premium'

export interface UserProfile {
  id: string
  name: string | null
  zip_code: string | null
  lat: number | null
  lon: number | null
  daily_calorie_goal: number
  weekly_budget: number | null
  preferred_stores: string[]
  plan: Plan
  created_at: string
}

export interface GroceryItem {
  id: string
  name: string
  qty: number
  unit: string
}

export interface StorePrice {
  store: string
  price: number
  unit_price: number
  unit: string
  in_stock: 'in_stock' | 'likely' | 'unknown'
  is_estimated: boolean
}

export interface PricedItem {
  name: string
  qty: number
  unit: string
  prices: StorePrice[]
  cheapest_store: string
  substitution?: {
    name: string
    store: string
    price: number
    savings: number
    reason: string
  }
}

export interface StoreTotal {
  store: string
  total: number
  savings: number
  savings_pct: number
}

export interface SplitStrategy {
  stores: string[]
  total: number
  savings: number
  savings_pct: number
  items_per_store: Record<string, string[]>
}

export interface PriceComparisonResult {
  items: PricedItem[]
  store_totals: StoreTotal[]
  best_single_store: StoreTotal
  split_strategy: SplitStrategy
  baseline_total: number
  coupons: Coupon[]
}

export interface Coupon {
  store: string
  description: string
  savings: number
  expires: string | null
  source: string
}

export interface GroceryTrip {
  id: string
  user_id: string
  date: string
  items: GroceryItem[]
  store_chosen: string
  total_spent: number
  savings_amount: number
  optimized_cart: PriceComparisonResult
  created_at: string
}

export interface SavingsStats {
  weekly_savings: number
  monthly_savings: number
  lifetime_savings: number
  streak: number
  best_trip: {
    date: string
    store: string
    savings: number
  } | null
  monthly_chart: { week: string; savings: number }[]
}

export type Store = 'Walmart' | 'Target' | 'Kroger' | 'Aldi'

export const STORES: Store[] = ['Walmart', 'Target', 'Kroger', 'Aldi']

export const STORE_COLORS: Record<Store, string> = {
  Walmart: '#0071CE',
  Target: '#CC0000',
  Kroger: '#003087',
  Aldi: '#00539B',
}

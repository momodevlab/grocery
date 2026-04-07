import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GroceryItem, PriceComparisonResult, UserProfile } from '@/types'

interface AppState {
  // User
  user: UserProfile | null
  setUser: (user: UserProfile | null) => void

  // Location
  zipCode: string
  setZipCode: (zip: string) => void

  // Grocery list
  items: GroceryItem[]
  setItems: (items: GroceryItem[]) => void
  addItem: (item: GroceryItem) => void
  removeItem: (id: string) => void
  updateItem: (id: string, updates: Partial<GroceryItem>) => void
  clearItems: () => void

  // Price comparison result
  result: PriceComparisonResult | null
  setResult: (result: PriceComparisonResult | null) => void

  // Loading
  isAnalyzing: boolean
  setIsAnalyzing: (v: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),

      zipCode: '',
      setZipCode: (zipCode) => set({ zipCode }),

      items: [],
      setItems: (items) => set({ items }),
      addItem: (item) => set((s) => ({ items: [...s.items, item] })),
      removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      updateItem: (id, updates) =>
        set((s) => ({
          items: s.items.map((i) => (i.id === id ? { ...i, ...updates } : i)),
        })),
      clearItems: () => set({ items: [] }),

      result: null,
      setResult: (result) => set({ result }),

      isAnalyzing: false,
      setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
    }),
    {
      name: 'freshsave-store',
      partialize: (s) => ({ zipCode: s.zipCode, items: s.items }),
    }
  )
)

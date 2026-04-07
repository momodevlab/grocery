import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import Nav from '@/components/ui/Nav'
import SavingsDashboardClient from './SavingsDashboardClient'
import type { SavingsStats } from '@/types'

export default async function SavingsDashboardPage() {
  let stats: SavingsStats | null = null
  let userName: string | null = null

  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/ounje-auth')

    userName = user.user_metadata?.name ?? user.email?.split('@')[0] ?? null

    // Fetch savings stats
    const { data: trips } = await supabase
      .from('grocery_trips')
      .select('date, savings_amount, store_chosen, total_spent')
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (trips && trips.length > 0) {
      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      const weekly = trips
        .filter((t) => new Date(t.date) >= weekAgo)
        .reduce((sum, t) => sum + (t.savings_amount ?? 0), 0)

      const monthly = trips
        .filter((t) => new Date(t.date) >= monthAgo)
        .reduce((sum, t) => sum + (t.savings_amount ?? 0), 0)

      const lifetime = trips.reduce((sum, t) => sum + (t.savings_amount ?? 0), 0)

      const best = trips.reduce(
        (max, t) => (t.savings_amount > (max?.savings_amount ?? 0) ? t : max),
        trips[0]
      )

      // Build weekly chart (4 weeks)
      const monthlyChart = Array.from({ length: 4 }, (_, i) => {
        const weekStart = new Date(now.getTime() - (3 - i) * 7 * 24 * 60 * 60 * 1000)
        const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
        const savings = trips
          .filter((t) => {
            const d = new Date(t.date)
            return d >= weekStart && d < weekEnd
          })
          .reduce((sum, t) => sum + (t.savings_amount ?? 0), 0)
        const label = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        return { week: label, savings: Math.round(savings * 100) / 100 }
      })

      // Streak: consecutive weeks with at least one trip
      let streak = 0
      for (let i = 0; i < 52; i++) {
        const ws = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000)
        const we = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000)
        const hasTrip = trips.some((t) => {
          const d = new Date(t.date)
          return d >= ws && d < we
        })
        if (hasTrip) streak++
        else break
      }

      stats = {
        weekly_savings: Math.round(weekly * 100) / 100,
        monthly_savings: Math.round(monthly * 100) / 100,
        lifetime_savings: Math.round(lifetime * 100) / 100,
        streak,
        best_trip: best
          ? { date: best.date, store: best.store_chosen, savings: best.savings_amount }
          : null,
        monthly_chart: monthlyChart,
      }
    } else {
      stats = {
        weekly_savings: 0,
        monthly_savings: 0,
        lifetime_savings: 0,
        streak: 0,
        best_trip: null,
        monthly_chart: [],
      }
    }
  } catch {
    redirect('/ounje-auth')
  }

  return (
    <div className="min-h-screen flex flex-col pb-16 sm:pb-0">
      <Nav isLoggedIn={true} />
      <SavingsDashboardClient stats={stats!} userName={userName} />
    </div>
  )
}

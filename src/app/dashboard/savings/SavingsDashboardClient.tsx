'use client'

import Link from 'next/link'
import { TrendingDown, Flame, Star, ShoppingCart, BarChart2, Trophy } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { SavingsStats } from '@/types'

interface Props {
  stats: SavingsStats
  userName: string | null
}

export default function SavingsDashboardClient({ stats, userName }: Props) {
  const hasData = stats.lifetime_savings > 0

  return (
    <main className="max-w-5xl mx-auto w-full px-4 py-8">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">
          {userName ? `Hey, ${userName.split(' ')[0]} 👋` : 'Your savings dashboard'}
        </h1>
        <p className="text-stone-500 mt-1 text-sm sm:text-base">
          {hasData
            ? `You've saved $${stats.lifetime_savings.toFixed(2)} with FreshSave. Keep it up!`
            : 'Start comparing grocery prices to track your savings here.'}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="This week"
          value={`$${stats.weekly_savings.toFixed(2)}`}
          icon={TrendingDown}
          color="green"
          sub="saved vs. average"
        />
        <StatCard
          label="This month"
          value={`$${stats.monthly_savings.toFixed(2)}`}
          icon={BarChart2}
          color="blue"
          sub="30-day total"
        />
        <StatCard
          label="Lifetime saved"
          value={`$${stats.lifetime_savings.toFixed(2)}`}
          icon={Trophy}
          color="orange"
          sub="all-time total"
          highlight
        />
        <StatCard
          label="Savings streak"
          value={stats.streak > 0 ? `${stats.streak} wk` : '—'}
          icon={Flame}
          color="red"
          sub={stats.streak > 0 ? 'consecutive weeks' : 'no trips yet'}
        />
      </div>

      <div className="grid md:grid-cols-[1fr_300px] gap-6">
        {/* Chart */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
          <h2 className="font-semibold text-stone-900 mb-4 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-orange-500" />
            Monthly savings breakdown
          </h2>
          {hasData && stats.monthly_chart.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.monthly_chart} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5F0EB" />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 11, fill: '#78716C' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#78716C' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  formatter={(v) => [`$${Number(v).toFixed(2)}`, 'Saved']}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #E7E5E4',
                    fontSize: '13px',
                  }}
                />
                <Bar dataKey="savings" fill="#F97316" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          {/* Best trip */}
          {stats.best_trip ? (
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
              <h3 className="font-semibold text-stone-900 mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                Best trip
              </h3>
              <p className="text-2xl font-bold text-green-600">
                −${stats.best_trip.savings.toFixed(2)}
              </p>
              <p className="text-sm text-stone-500 mt-1">
                {stats.best_trip.store} ·{' '}
                {new Date(stats.best_trip.date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          ) : null}

          {/* CTA to compare */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-5">
            <ShoppingCart className="w-8 h-8 text-orange-500 mb-3" />
            <p className="font-semibold text-stone-900 mb-1">
              {hasData ? 'Start a new comparison' : 'Compare grocery prices'}
            </p>
            <p className="text-sm text-stone-500 mb-4">
              {hasData
                ? 'Keep building your savings streak.'
                : 'Add your grocery list and see where you can save.'}
            </p>
            <Link
              href="/grocery-savings"
              className="block text-center bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 rounded-xl transition-colors text-sm"
            >
              {hasData ? 'Compare now →' : 'Get started →'}
            </Link>
          </div>

          {/* Streak motivation */}
          {stats.streak >= 2 && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3">
              <Flame className="w-8 h-8 text-red-500 shrink-0" />
              <div>
                <p className="font-semibold text-stone-900">{stats.streak}-week streak! 🔥</p>
                <p className="text-xs text-stone-500">You're on a roll — don't break it.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

interface StatCardProps {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  color: 'green' | 'blue' | 'orange' | 'red'
  sub: string
  highlight?: boolean
}

const colorMap = {
  green: { bg: 'bg-green-100', text: 'text-green-600' },
  blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
  red: { bg: 'bg-red-100', text: 'text-red-600' },
}

function StatCard({ label, value, icon: Icon, color, sub, highlight }: StatCardProps) {
  const { bg, text } = colorMap[color]
  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm p-4 ${
        highlight ? 'border-orange-200 ring-1 ring-orange-100' : 'border-stone-100'
      }`}
    >
      <div className={`${bg} rounded-xl p-2 w-fit mb-3`}>
        <Icon className={`w-4 h-4 ${text}`} />
      </div>
      <p className="text-xl sm:text-2xl font-bold text-stone-900">{value}</p>
      <p className="text-xs text-stone-500 mt-0.5">{label}</p>
      <p className="text-xs text-stone-400 mt-0.5">{sub}</p>
    </div>
  )
}

function EmptyChart() {
  return (
    <div className="h-[220px] flex flex-col items-center justify-center text-stone-400">
      <BarChart2 className="w-10 h-10 mb-3 opacity-30" />
      <p className="text-sm">No savings data yet</p>
      <p className="text-xs mt-1">Compare your first grocery list to get started</p>
    </div>
  )
}

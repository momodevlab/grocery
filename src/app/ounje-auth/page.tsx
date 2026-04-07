'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShoppingCart, Leaf, TrendingDown } from 'lucide-react'
import { createClient } from '@/lib/supabase'

type Mode = 'signin' | 'signup' | 'reset'

export default function AuthPage() {
  const router = useRouter()
  const supabase = createClient()

  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        })
        if (error) throw error
        setSuccess('Check your email to confirm your account, then sign in.')
        setMode('signin')
      } else if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/dashboard/savings')
        router.refresh()
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/ounje-auth`,
        })
        if (error) throw error
        setSuccess('Password reset link sent — check your email.')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left panel — branding */}
      <div className="hidden md:flex md:w-1/2 bg-orange-500 flex-col justify-center px-12 py-16 text-white">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-white/20 rounded-xl p-2">
            <ShoppingCart className="w-7 h-7" />
          </div>
          <span className="text-2xl font-bold">FreshSave</span>
        </div>
        <h1 className="text-4xl font-bold leading-tight mb-6">
          Save money.<br />Eat better.<br />Every week.
        </h1>
        <p className="text-orange-100 text-lg mb-10">
          AI-powered grocery price comparison across Walmart, Target, Kroger, and Aldi — so you always get the best deal.
        </p>
        <div className="space-y-4">
          {[
            { icon: TrendingDown, text: 'Average savings of $12 per trip' },
            { icon: Leaf, text: 'Nutrition tracking built right in' },
            { icon: ShoppingCart, text: 'Smart split-store strategies' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-1.5">
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-orange-50">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 md:px-16 bg-[#FFF8F0]">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-8 md:hidden">
          <div className="bg-orange-500 rounded-xl p-2">
            <ShoppingCart className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-stone-900">FreshSave</span>
        </div>

        <div className="w-full max-w-sm mx-auto md:mx-0">
          <h2 className="text-2xl font-bold text-stone-900 mb-1">
            {mode === 'signin' && 'Welcome back'}
            {mode === 'signup' && 'Create your account'}
            {mode === 'reset' && 'Reset your password'}
          </h2>
          <p className="text-stone-500 text-sm mb-8">
            {mode === 'signin' && "Sign in to see your savings dashboard"}
            {mode === 'signup' && "It's free — no credit card needed"}
            {mode === 'reset' && "We'll email you a reset link"}
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-6">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm mb-6">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Your name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Maria Rodriguez"
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
              />
            </div>

            {mode !== 'reset' && (
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="At least 8 characters"
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                />
              </div>
            )}

            {mode === 'signin' && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setMode('reset')}
                  className="text-sm text-orange-500 hover:text-orange-600 transition"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors mt-2"
              aria-label={mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send reset link'}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {mode === 'signin' ? 'Signing in…' : mode === 'signup' ? 'Creating account…' : 'Sending…'}
                </span>
              ) : (
                <>
                  {mode === 'signin' && 'Sign in'}
                  {mode === 'signup' && 'Create account'}
                  {mode === 'reset' && 'Send reset link'}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-stone-500">
            {mode === 'signin' && (
              <>
                Don't have an account?{' '}
                <button onClick={() => setMode('signup')} className="text-orange-500 font-medium hover:text-orange-600 transition">
                  Sign up free
                </button>
              </>
            )}
            {mode === 'signup' && (
              <>
                Already have an account?{' '}
                <button onClick={() => setMode('signin')} className="text-orange-500 font-medium hover:text-orange-600 transition">
                  Sign in
                </button>
              </>
            )}
            {mode === 'reset' && (
              <button onClick={() => setMode('signin')} className="text-orange-500 font-medium hover:text-orange-600 transition">
                Back to sign in
              </button>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-stone-200 text-center">
            <Link
              href="/grocery-savings"
              className="text-sm text-stone-500 hover:text-stone-700 transition"
            >
              Continue as guest →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingCart, BarChart2, User, LogIn } from 'lucide-react'

interface NavProps {
  isLoggedIn?: boolean
}

export default function Nav({ isLoggedIn = false }: NavProps) {
  const pathname = usePathname()

  const links = [
    { href: '/grocery-savings', label: 'Compare Prices', icon: ShoppingCart },
    { href: '/dashboard/savings', label: 'My Savings', icon: BarChart2, requiresAuth: true },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-stone-100 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/grocery-savings" className="flex items-center gap-2 group">
          <div className="bg-orange-500 rounded-lg p-1.5 group-hover:bg-orange-600 transition-colors">
            <ShoppingCart className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-stone-900 text-lg">FreshSave</span>
        </Link>

        {/* Nav links — desktop */}
        <nav className="hidden sm:flex items-center gap-1">
          {links.map(({ href, label, icon: Icon, requiresAuth }) => {
            if (requiresAuth && !isLoggedIn) return null
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Auth */}
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <Link
              href="/profile"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-100 transition-colors"
              aria-label="Profile"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Account</span>
            </Link>
          ) : (
            <Link
              href="/ounje-auth"
              className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              aria-label="Sign in"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign in</span>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-100 flex z-50">
        <Link
          href="/grocery-savings"
          className={`flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors ${
            pathname === '/grocery-savings' ? 'text-orange-500' : 'text-stone-500'
          }`}
        >
          <ShoppingCart className="w-5 h-5 mb-0.5" />
          Compare
        </Link>
        {isLoggedIn && (
          <Link
            href="/dashboard/savings"
            className={`flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors ${
              pathname === '/dashboard/savings' ? 'text-orange-500' : 'text-stone-500'
            }`}
          >
            <BarChart2 className="w-5 h-5 mb-0.5" />
            Savings
          </Link>
        )}
        <Link
          href={isLoggedIn ? '/profile' : '/ounje-auth'}
          className={`flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors ${
            pathname === '/ounje-auth' ? 'text-orange-500' : 'text-stone-500'
          }`}
        >
          {isLoggedIn ? <User className="w-5 h-5 mb-0.5" /> : <LogIn className="w-5 h-5 mb-0.5" />}
          {isLoggedIn ? 'Account' : 'Sign in'}
        </Link>
      </nav>
    </header>
  )
}

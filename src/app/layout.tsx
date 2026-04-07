import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FreshSave — Save money, eat better',
  description: 'AI-powered grocery price comparison and nutrition tracking. Find the best deals at Walmart, Target, Kroger, and Aldi near you.',
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-[#FFF8F0] text-stone-900 antialiased">
        {children}
      </body>
    </html>
  )
}

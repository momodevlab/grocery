'use client'

import { useState } from 'react'
import { MapPin, Locate } from 'lucide-react'
import { useAppStore } from '@/lib/store'

export default function LocationInput() {
  const { zipCode, setZipCode } = useAppStore()
  const [locating, setLocating] = useState(false)
  const [input, setInput] = useState(zipCode)
  const [error, setError] = useState<string | null>(null)

  function handleZipChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.replace(/\D/g, '').slice(0, 5)
    setInput(val)
    if (val.length === 5) {
      setZipCode(val)
      setError(null)
    }
  }

  async function handleGPS() {
    if (!navigator.geolocation) {
      setError('Your browser does not support location detection.')
      return
    }
    setLocating(true)
    setError(null)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          // Reverse geocode to ZIP using free API
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`
          )
          const data = await res.json()
          const zip = data?.address?.postcode?.slice(0, 5)
          if (zip) {
            setInput(zip)
            setZipCode(zip)
          } else {
            setError('Could not detect ZIP from your location. Please enter it manually.')
          }
        } catch {
          setError('Location lookup failed. Please enter your ZIP manually.')
        } finally {
          setLocating(false)
        }
      },
      () => {
        setError('Location access denied. Please enter your ZIP code manually.')
        setLocating(false)
      }
    )
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-stone-700">
        Your ZIP code
      </label>
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-[160px]">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={input}
            onChange={handleZipChange}
            placeholder="12345"
            maxLength={5}
            pattern="\d{5}"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition text-sm"
            aria-label="ZIP code"
          />
        </div>
        <button
          onClick={handleGPS}
          disabled={locating}
          className="flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 disabled:opacity-60 text-stone-600 text-sm font-medium px-3 py-2.5 rounded-xl transition-colors"
          aria-label="Detect location automatically"
        >
          {locating ? (
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <Locate className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">{locating ? 'Detecting…' : 'Auto-detect'}</span>
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {zipCode && !error && (
        <p className="text-xs text-green-600 flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          Searching near {zipCode}
        </p>
      )}
    </div>
  )
}

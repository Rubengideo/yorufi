'use client'

import { useState, useMemo } from 'react'
import { useProfile, useUpdateProfile } from '@/hooks/useProfile'

// Volledige IANA timezone lijst via Intl API
function getAllTimezones(): string[] {
  try {
    return Intl.supportedValuesOf('timeZone')
  } catch {
    // Fallback voor oudere browsers
    return [
      'Europe/Amsterdam', 'Europe/London', 'Europe/Paris', 'Europe/Berlin',
      'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
      'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Kolkata', 'Australia/Sydney',
    ]
  }
}

export function TimezoneSettings() {
  const { data: profile, isLoading } = useProfile()
  const updateProfile = useUpdateProfile()
  const [search, setSearch] = useState('')
  const [saved, setSaved] = useState(false)
  const [localTz, setLocalTz] = useState<string | null>(null)

  const allTimezones = useMemo(() => getAllTimezones(), [])

  const filtered = useMemo(() => {
    if (!search) return allTimezones
    const q = search.toLowerCase()
    return allTimezones.filter((tz) => tz.toLowerCase().includes(q))
  }, [allTimezones, search])

  const currentTz = localTz ?? profile?.timezone ?? 'Europe/Amsterdam'

  async function handleSave() {
    await updateProfile.mutateAsync({ timezone: currentTz })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleAutoDetect() {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone
    setLocalTz(detected)
  }

  if (isLoading) {
    return <div className="h-10 rounded-xl bg-stone-100 dark:bg-stone-900 animate-pulse" />
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          {/* Zoekfilter bovenop de select */}
          <input
            type="text"
            placeholder="Zoek tijdzone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-t-xl border border-b-0 border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1A1A1A] px-4 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 focus:ring-inset transition"
          />
          <select
            value={currentTz}
            onChange={(e) => {
              setLocalTz(e.target.value)
              setSearch('')
            }}
            size={filtered.length > 0 && search ? Math.min(filtered.length, 5) : 1}
            className="w-full rounded-b-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1A1A1A] px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition"
          >
            {filtered.map((tz) => (
              <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleAutoDetect}
          title="Automatisch detecteren"
          className="shrink-0 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1A1A1A] px-3 py-2.5 text-xs text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:border-stone-300 dark:hover:border-stone-700 transition"
        >
          Auto
        </button>
        <button
          onClick={handleSave}
          disabled={updateProfile.isPending}
          className="shrink-0 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent/90 disabled:opacity-60 transition"
        >
          {saved ? 'Opgeslagen!' : updateProfile.isPending ? 'Opslaan…' : 'Opslaan'}
        </button>
      </div>
    </div>
  )
}

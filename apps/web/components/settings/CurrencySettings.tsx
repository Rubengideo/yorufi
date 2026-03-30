'use client'

import { useProfile, useUpdateProfile } from '@/hooks/useProfile'

const CURRENCIES = [
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'GBP', label: 'GBP — British Pound' },
  { value: 'CHF', label: 'CHF — Swiss Franc' },
  { value: 'JPY', label: 'JPY — Japanese Yen' },
  { value: 'CAD', label: 'CAD — Canadian Dollar' },
]

export function CurrencySettings() {
  const { data: profile, isLoading } = useProfile()
  const updateProfile = useUpdateProfile()

  if (isLoading) {
    return <div className="h-10 rounded-xl bg-stone-100 dark:bg-stone-900 animate-pulse" />
  }

  return (
    <select
      value={profile?.currency ?? 'EUR'}
      onChange={(e) => updateProfile.mutate({ currency: e.target.value })}
      disabled={updateProfile.isPending}
      className="w-full max-w-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1A1A1A] px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition disabled:opacity-60"
    >
      {CURRENCIES.map((c) => (
        <option key={c.value} value={c.value}>{c.label}</option>
      ))}
    </select>
  )
}

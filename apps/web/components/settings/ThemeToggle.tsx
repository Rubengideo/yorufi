'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { useUpdateProfile } from '@/hooks/useProfile'

const OPTIONS = [
  { value: 'light', label: 'Licht' },
  { value: 'system', label: 'Systeem' },
  { value: 'dark', label: 'Donker' },
] as const

type ThemeValue = (typeof OPTIONS)[number]['value']

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const updateProfile = useUpdateProfile()

  // Voorkom hydration mismatch
  useEffect(() => setMounted(true), [])

  function handleSelect(value: ThemeValue) {
    setTheme(value)
    updateProfile.mutate({ theme: value })
  }

  if (!mounted) {
    return <div className="h-9 w-48 rounded-xl bg-stone-100 dark:bg-stone-900 animate-pulse" />
  }

  return (
    <div className="inline-flex rounded-xl border border-stone-200 dark:border-stone-800 p-0.5 gap-0.5 bg-stone-50 dark:bg-stone-900/50">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => handleSelect(opt.value)}
          className={`px-3 py-1.5 rounded-[10px] text-xs font-medium transition-all ${
            theme === opt.value
              ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

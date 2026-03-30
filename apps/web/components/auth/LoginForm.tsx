'use client'

import { useState } from 'react'
import { createBrowserSupabase } from '@/lib/supabase-browser'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createBrowserSupabase()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#1A1A1A] p-6 text-center space-y-2">
        <p className="text-lg font-medium">Check your email</p>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          We sent a magic link to <span className="font-medium text-stone-950 dark:text-white">{email}</span>
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-stone-700 dark:text-stone-300">
          Email address
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1A1A1A] px-4 py-3 text-sm text-stone-950 dark:text-white placeholder:text-stone-400 transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent/90 active:scale-[0.98] disabled:opacity-60"
      >
        {loading ? 'Sending…' : 'Continue with email'}
      </button>
    </form>
  )
}

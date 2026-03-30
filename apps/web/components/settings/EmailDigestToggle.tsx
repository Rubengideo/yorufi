'use client'

import { useEffect, useState } from 'react'
import { createBrowserSupabase } from '@/lib/supabase-browser'

export function EmailDigestToggle() {
  const supabase = createBrowserSupabase()
  const [enabled, setEnabled] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('profiles')
        .select('email_digest')
        .eq('id', user.id)
        .single()
      if (data != null) setEnabled(data.email_digest)
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleToggle() {
    const next = !enabled
    setEnabled(next)
    setSaving(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({ email_digest: next }).eq('id', user.id)
    }
    setSaving(false)
  }

  if (loading) {
    return <div className="h-8 w-32 rounded-xl bg-stone-100 dark:bg-stone-900 animate-pulse" />
  }

  return (
    <div className="flex items-center gap-3">
      <button
        role="switch"
        aria-checked={enabled}
        onClick={handleToggle}
        disabled={saving}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-60 ${
          enabled ? 'bg-stone-900 dark:bg-white' : 'bg-stone-200 dark:bg-stone-700'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white dark:bg-stone-900 shadow transform transition-transform duration-200 ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
      <span className="text-sm text-stone-600 dark:text-stone-400">
        {enabled ? 'Aan' : 'Uit'}
      </span>
    </div>
  )
}

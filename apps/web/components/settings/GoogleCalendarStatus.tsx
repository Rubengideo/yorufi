'use client'

import { useEffect, useState } from 'react'

export function GoogleCalendarStatus() {
  const [connected, setConnected] = useState<boolean | null>(null)

  useEffect(() => {
    fetch('/api/calendar/status')
      .then((r) => r.json())
      .then((data: { connected: boolean }) => setConnected(data.connected))
      .catch(() => setConnected(false))
  }, [])

  if (connected === null) {
    return <div className="h-6 w-28 rounded-lg bg-stone-100 dark:bg-stone-900 animate-pulse" />
  }

  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
          connected
            ? 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400'
            : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
        }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-green-500' : 'bg-stone-400'}`}
        />
        {connected ? 'Verbonden' : 'Niet geconfigureerd'}
      </span>
      {!connected && (
        <p className="text-xs text-stone-400">
          Stel <code className="font-mono bg-stone-100 dark:bg-stone-800 px-1 rounded">GOOGLE_REFRESH_TOKEN</code> in via de{' '}
          <a
            href="https://developers.google.com/oauthplayground"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            OAuth Playground
          </a>
        </p>
      )}
    </div>
  )
}

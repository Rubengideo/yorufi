'use client'

import { useState } from 'react'
import { useCalendarEvents } from '@/hooks/useCalendar'
import { useTasks, useCreateTask } from '@/hooks/useTasks'
import type { CalendarEvent } from '@/lib/google-calendar'

function formatEventDate(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('nl-NL', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1.5" y="2.5" width="11" height="10" rx="1.5" />
      <path d="M4.5 1.5v2M9.5 1.5v2M1.5 6h11" />
    </svg>
  )
}

function EventRow({ event, alreadyImported, onImport }: {
  event: CalendarEvent
  alreadyImported: boolean
  onImport: (event: CalendarEvent) => void
}) {
  const [importing, setImporting] = useState(false)

  async function handleImport() {
    setImporting(true)
    await onImport(event)
    setImporting(false)
  }

  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className="text-stone-400 dark:text-stone-500 shrink-0">
        <CalendarIcon />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-stone-800 dark:text-stone-200 truncate">{event.summary}</p>
        <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-0.5">{formatEventDate(event.date)}</p>
      </div>
      {alreadyImported ? (
        <span className="text-[10px] text-green-500 dark:text-green-400 shrink-0 font-medium">In taken</span>
      ) : (
        <button
          onClick={handleImport}
          disabled={importing}
          className="shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-300 hover:bg-accent hover:text-white transition disabled:opacity-50"
        >
          {importing ? '...' : 'Importeer'}
        </button>
      )}
    </div>
  )
}

export function CalendarImportPanel() {
  const { data: events, isLoading, error } = useCalendarEvents(14)
  const { data: tasks } = useTasks()
  const createTask = useCreateTask()

  const syncedEventIds = new Set(
    (tasks ?? []).map((t) => t.gcal_event_id).filter(Boolean)
  )

  function handleImport(event: CalendarEvent) {
    return new Promise<void>((resolve) => {
      createTask.mutate(
        { title: event.summary, due_date: event.date, gcal_event_id: event.id },
        { onSettled: () => resolve() },
      )
    })
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0F0F0F] px-4 py-3 divide-y divide-stone-50 dark:divide-stone-900/60">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-2.5">
            <div className="h-3.5 w-3.5 rounded bg-stone-100 dark:bg-stone-800 animate-pulse shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-40 rounded bg-stone-100 dark:bg-stone-800 animate-pulse" />
              <div className="h-2.5 w-20 rounded bg-stone-100 dark:bg-stone-800 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error || !events?.length) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-200 dark:border-stone-800 py-5 text-center">
        <p className="text-xs text-stone-400 dark:text-stone-500">
          {error ? 'Kon agenda niet laden' : 'Geen nieuwe events komende 14 dagen'}
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0F0F0F] px-4 divide-y divide-stone-50 dark:divide-stone-900/60">
      {events.map((event) => (
        <EventRow
          key={event.id}
          event={event}
          alreadyImported={syncedEventIds.has(event.id)}
          onImport={handleImport}
        />
      ))}
    </div>
  )
}

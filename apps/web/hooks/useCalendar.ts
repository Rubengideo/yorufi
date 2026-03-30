'use client'

import { useQuery } from '@tanstack/react-query'
import type { CalendarEvent } from '@/lib/google-calendar'

/** Aankomende Google Agenda events (default: 14 dagen). Geeft [] als agenda niet geconfigureerd. */
export function useCalendarEvents(days = 14) {
  return useQuery<CalendarEvent[]>({
    queryKey: ['calendar-events', days],
    queryFn: async () => {
      const res = await fetch(`/api/calendar/events?days=${days}`)
      if (!res.ok) return []
      return res.json()
    },
    staleTime: 5 * 60 * 1000,  // 5 minuten
    retry: false,
  })
}

/** Google Agenda events uitsluitend voor vandaag. */
export function useTodayCalendarEvents() {
  return useQuery<CalendarEvent[]>({
    queryKey: ['calendar-events', 'today'],
    queryFn: async () => {
      const res = await fetch('/api/calendar/events?today=true')
      if (!res.ok) return []
      return res.json()
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
}

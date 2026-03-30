import { google } from 'googleapis'
import type { Task } from '@habit-tracker/types'

function getCalendarClient() {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  )
  auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN })
  return google.calendar({ version: 'v3', auth })
}

export function hasCalendarConfig(): boolean {
  return !!(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REFRESH_TOKEN
  )
}

// Prioriteit → Google Calendar colorId
const PRIORITY_COLOR: Record<string, string> = {
  high:   '11', // Tomato
  normal: '7',  // Peacock
  low:    '2',  // Sage
}

export interface CalendarEvent {
  id: string
  summary: string
  date: string    // 'YYYY-MM-DD'
  htmlLink: string
  isAllDay: boolean
}

/**
 * Maak een nieuw all-day event voor een taak, of update een bestaand event.
 * Geeft het Google Calendar event-ID en een directe link terug.
 */
export async function pushTaskToCalendar(
  task: Pick<Task, 'id' | 'title' | 'due_date' | 'priority'>,
  existingEventId?: string | null,
): Promise<{ eventId: string; htmlLink: string }> {
  const cal  = getCalendarClient()
  const date = task.due_date ?? new Date().toISOString().slice(0, 10)

  const requestBody = {
    summary:  task.title,
    colorId:  PRIORITY_COLOR[task.priority] ?? '7',
    start:    { date },
    end:      { date },
    description: `Habit Tracker taak · id: ${task.id}`,
  }

  if (existingEventId) {
    const res = await cal.events.patch({
      calendarId:  'primary',
      eventId:     existingEventId,
      requestBody,
    })
    return { eventId: res.data.id!, htmlLink: res.data.htmlLink! }
  }

  const res = await cal.events.insert({
    calendarId:  'primary',
    requestBody,
  })
  return { eventId: res.data.id!, htmlLink: res.data.htmlLink! }
}

/** Verwijder een Google Calendar event. */
export async function deleteCalendarEvent(eventId: string): Promise<void> {
  const cal = getCalendarClient()
  await cal.events.delete({ calendarId: 'primary', eventId })
}

/** Haal aankomende events op voor de komende N dagen. */
export async function getUpcomingEvents(days = 14): Promise<CalendarEvent[]> {
  const cal    = getCalendarClient()
  const now    = new Date()
  const future = new Date(now)
  future.setDate(future.getDate() + days)

  const res = await cal.events.list({
    calendarId:   'primary',
    timeMin:      now.toISOString(),
    timeMax:      future.toISOString(),
    singleEvents: true,
    orderBy:      'startTime',
    maxResults:   50,
  })

  return (res.data.items ?? [])
    .filter((e) => e.id && e.summary && (e.start?.date || e.start?.dateTime))
    .map((e) => ({
      id:       e.id!,
      summary:  e.summary!,
      date:     e.start!.date ?? e.start!.dateTime!.slice(0, 10),
      htmlLink: e.htmlLink ?? '',
      isAllDay: !!e.start!.date,
    }))
}

/** Haal events op voor uitsluitend vandaag. */
export async function getTodayEvents(): Promise<CalendarEvent[]> {
  const today = new Date().toISOString().slice(0, 10)
  const all   = await getUpcomingEvents(1)
  return all.filter((e) => e.date === today)
}

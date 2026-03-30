import { createServerClient } from '@/lib/supabase-server'
import { pushTaskToCalendar, deleteCalendarEvent, hasCalendarConfig } from '@/lib/google-calendar'

function notConfigured() {
  return Response.json(
    { error: 'Google Calendar is niet geconfigureerd. Voeg GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET en GOOGLE_REFRESH_TOKEN toe aan .env.local.' },
    { status: 501 },
  )
}

/** POST — synchroniseer een taak naar Google Agenda */
export async function POST(req: Request) {
  if (!hasCalendarConfig()) return notConfigured()

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { taskId, title, dueDate, priority, gcalEventId } = await req.json() as {
    taskId: string
    title: string
    dueDate: string | null
    priority: string
    gcalEventId?: string | null
  }

  const { eventId, htmlLink } = await pushTaskToCalendar(
    { id: taskId, title, due_date: dueDate, priority: priority as 'high' | 'normal' | 'low' },
    gcalEventId,
  )

  // Sla het event-ID op in Supabase
  const { error } = await supabase
    .from('tasks')
    .update({ gcal_event_id: eventId })
    .eq('id', taskId)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)

  return Response.json({ gcalEventId: eventId, htmlLink })
}

/** DELETE — verwijder een taak uit Google Agenda */
export async function DELETE(req: Request) {
  if (!hasCalendarConfig()) return notConfigured()

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { taskId, gcalEventId } = await req.json() as {
    taskId: string
    gcalEventId: string
  }

  await deleteCalendarEvent(gcalEventId)

  const { error } = await supabase
    .from('tasks')
    .update({ gcal_event_id: null })
    .eq('id', taskId)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)

  return Response.json({ ok: true })
}

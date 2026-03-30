import { createServerClient } from '@/lib/supabase-server'
import { getUpcomingEvents, getTodayEvents, hasCalendarConfig } from '@/lib/google-calendar'

/** GET — haal aankomende Google Agenda events op */
export async function GET(req: Request) {
  if (!hasCalendarConfig()) {
    return Response.json([], { status: 200 }) // Stil falen — geen agenda geconfigureerd
  }

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { searchParams } = new URL(req.url)
  const todayOnly = searchParams.get('today') === 'true'
  const days      = parseInt(searchParams.get('days') ?? '14', 10)

  const events = todayOnly ? await getTodayEvents() : await getUpcomingEvents(days)

  return Response.json(events)
}

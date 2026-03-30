// Edge Function: send-reminder
// Deploy via: supabase functions deploy send-reminder
// Schedule via Supabase Dashboard > Database > Cron Jobs:
//   cron: "* * * * *"  (every minute)
//   body: { "schedule": "everyMinute" }

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

/** Returns 'HH:MM' for a given UTC Date in a named IANA timezone */
function localTime(date: Date, timezone: string): string {
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(date)
    const h = parts.find((p) => p.type === 'hour')?.value ?? '00'
    const m = parts.find((p) => p.type === 'minute')?.value ?? '00'
    return `${h}:${m}`
  } catch {
    // Fallback to UTC if invalid timezone
    return `${String(date.getUTCHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')}`
  }
}

Deno.serve(async () => {
  const now = new Date()

  // Fetch all active habits that have a reminder set, with user profile
  const { data: habits, error } = await supabase
    .from('habits')
    .select(`
      id,
      name,
      icon,
      user_id,
      reminder_at,
      profiles!inner(push_token, timezone)
    `)
    .not('reminder_at', 'is', null)
    .is('archived_at', null)

  if (error) {
    console.error('Failed to fetch habits:', error.message)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  // Filter habits whose reminder_at matches current local time for that user's timezone
  const due = (habits ?? []).filter((habit: Record<string, unknown>) => {
    const profile = Array.isArray(habit.profiles) ? habit.profiles[0] : habit.profiles
    const timezone = (profile as Record<string, unknown> | null)?.timezone as string ?? 'UTC'
    const currentLocal = localTime(now, timezone)
    return habit.reminder_at === currentLocal
  })

  if (due.length === 0) {
    return new Response(JSON.stringify({ sent: 0, message: 'No reminders due' }))
  }

  // Check which habits are already completed today (per user's local date)
  const results = await Promise.allSettled(
    due.map(async (habit: Record<string, unknown>) => {
      const profile = Array.isArray(habit.profiles) ? habit.profiles[0] : habit.profiles
      const timezone = (profile as Record<string, unknown> | null)?.timezone as string ?? 'UTC'
      const pushToken = (profile as Record<string, unknown> | null)?.push_token as string | undefined

      // Get today's date in user's local timezone
      const localDate = new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(now)

      // Skip if already completed today
      const { data: existing } = await supabase
        .from('completions')
        .select('id')
        .eq('habit_id', habit.id as string)
        .eq('date', localDate)
        .maybeSingle()

      if (existing) return { skipped: true, reason: 'already completed' }

      // Send push notification if Expo token available
      if (pushToken?.startsWith('ExponentPushToken')) {
        const res = await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: pushToken,
            title: 'Time for your habit! 🔥',
            body: `${habit.icon ?? ''} ${habit.name}`.trim(),
            data: { habit_id: habit.id },
          }),
        })
        return { method: 'push', status: res.status }
      }

      // Fallback: send email via Supabase Auth admin (magic link style)
      // Requires RESEND_API_KEY env var for production use
      const resendKey = Deno.env.get('RESEND_API_KEY')
      if (resendKey) {
        const { data: userData } = await supabase.auth.admin.getUserById(habit.user_id as string)
        const email = userData?.user?.email
        if (email) {
          const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${resendKey}`,
            },
            body: JSON.stringify({
              from: Deno.env.get('RESEND_FROM_EMAIL') ?? 'Habit Tracker <reminders@example.com>',
              to: email,
              subject: `Reminder: ${habit.icon ?? ''} ${habit.name}`.trim(),
              html: `<p>Time to complete your habit: <strong>${habit.icon ?? ''} ${habit.name}</strong></p>`,
            }),
          })
          return { method: 'email', status: res.status }
        }
      }

      return { skipped: true, reason: 'no push token or email configured' }
    }),
  )

  const sent = results.filter(
    (r) => r.status === 'fulfilled' && !(r.value as Record<string, unknown>)?.skipped,
  ).length

  console.log(`Sent ${sent}/${due.length} reminders`)
  return new Response(JSON.stringify({ sent, total: due.length }))
})

import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { getTasks } from '@habit-tracker/lib'
import { buildDigestEmail } from '@/lib/email/digest'

const resend = new Resend(process.env.RESEND_API_KEY)

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}

export async function GET(req: NextRequest) {
  // Vercel Cron stuurt automatisch Authorization: Bearer <CRON_SECRET>
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const admin = getAdminClient()
  const today = new Date().toISOString().slice(0, 10) // 'YYYY-MM-DD' in UTC

  // Haal alle gebruikers op met email_digest = true
  const { data: profiles, error: profilesError } = await admin
    .from('profiles')
    .select('id')
    .eq('email_digest', true)

  if (profilesError) {
    return Response.json({ error: profilesError.message }, { status: 500 })
  }

  let sent = 0

  for (const profile of profiles ?? []) {
    // E-mailadres ophalen via admin auth API
    const {
      data: { user },
    } = await admin.auth.admin.getUserById(profile.id)
    if (!user?.email) continue

    // Habits ophalen die vandaag nog niet voltooid zijn
    const { data: habits } = await admin
      .from('habits')
      .select('id, name, icon')
      .eq('user_id', profile.id)
      .is('archived_at', null)
      .order('created_at', { ascending: true })

    const { data: completedToday } = await admin
      .from('completions')
      .select('habit_id')
      .eq('user_id', profile.id)
      .eq('date', today)

    const completedIds = new Set((completedToday ?? []).map((c: { habit_id: string }) => c.habit_id))
    const pendingHabits = (habits ?? []).filter((h: { id: string; name: string; icon: string | null }) => !completedIds.has(h.id))

    // Taken ophalen die vandaag vervallen (due_date <= today, not completed/archived)
    const tasks = await getTasks(admin, profile.id, 'today').catch(() => [])

    // Geen e-mail sturen als alles al gedaan is of niets gepland
    if (pendingHabits.length === 0 && tasks.length === 0) continue

    const date = new Date().toLocaleDateString('nl-NL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

    const html = buildDigestEmail({
      habits: pendingHabits.map((h: { id: string; name: string; icon: string | null }) => ({ title: h.name, emoji: h.icon })),
      tasks: tasks.map((t) => ({
        title: t.title,
        due_date: t.due_date,
        priority: t.priority,
      })),
      date,
    })

    const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'

    await resend.emails.send({
      from: `Habit Tracker <${fromEmail}>`,
      to: user.email,
      subject: `Jouw overzicht voor vandaag — ${date}`,
      html,
    })

    sent++
  }

  return Response.json({ ok: true, sent })
}

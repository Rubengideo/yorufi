// Edge Function: update-streaks
// Triggered via Postgres trigger — streaks worden bijgewerkt via de SQL trigger.
// Deze Edge Function dient als fallback voor batch recalculatie.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

Deno.serve(async (req) => {
  const { habit_id } = await req.json() as { habit_id: string }

  // Fetch all completion dates for this habit, newest first
  const { data: completions, error } = await supabase
    .from('completions')
    .select('date')
    .eq('habit_id', habit_id)
    .order('date', { ascending: false })

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })

  const dates = (completions ?? []).map((c: { date: string }) => c.date)

  if (dates.length === 0) {
    await supabase.from('streaks').upsert({
      habit_id,
      current_streak: 0,
      longest_streak: 0,
      last_completed: null,
      updated_at: new Date().toISOString(),
    })
    return new Response(JSON.stringify({ current: 0, longest: 0 }))
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let current = 0
  let longest = 0
  let run = 1

  const cursor = new Date(dates[0]!)
  cursor.setHours(0, 0, 0, 0)
  const diffDays = (a: Date, b: Date) =>
    Math.round((a.getTime() - b.getTime()) / 86_400_000)

  if (diffDays(today, cursor) <= 1) {
    current = 1
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1]!)
      const curr = new Date(dates[i]!)
      if (diffDays(prev, curr) === 1) current++
      else break
    }
  }

  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]!)
    const curr = new Date(dates[i]!)
    if (diffDays(prev, curr) === 1) run++
    else { longest = Math.max(longest, run); run = 1 }
  }
  longest = Math.max(longest, run)

  await supabase.from('streaks').upsert({
    habit_id,
    current_streak: current,
    longest_streak: longest,
    last_completed: dates[0],
    updated_at: new Date().toISOString(),
  })

  return new Response(JSON.stringify({ current, longest }))
})

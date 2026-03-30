import type { SupabaseClient } from '@supabase/supabase-js'
import type { Habit, HabitWithStreak, Completion } from '@habit-tracker/types'
import { todayLocal, toDateString } from './dates'

// ─── Stats ───────────────────────────────────────────────────────────────────

export interface HabitStats {
  habitId: string
  habitName: string
  habitIcon: string | null
  habitColor: string | null
  currentStreak: number
  longestStreak: number
  totalCompletions: number
  /** Completion rate 0–1 over the last 30 days */
  rate30d: number
  completionDates: string[]
}

export interface StatsData {
  habits: HabitStats[]
  /** Set of 'YYYY-MM-DD' strings with at least one completion */
  allDates: Set<string>
  rate7d: number
  rate30d: number
}

export async function getStatsData(client: SupabaseClient, userId: string): Promise<StatsData> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const from = new Date(today)
  from.setDate(from.getDate() - 89) // 90 days including today
  const fromStr = toDateString(from)
  const toStr = todayLocal()

  const { data: habits, error: habitsError } = await client
    .from('habits')
    .select('*, streak:streaks(*)')
    .eq('user_id', userId)
    .is('archived_at', null)
    .order('created_at', { ascending: true })

  if (habitsError) throw new Error(habitsError.message)

  const { data: completions, error: compError } = await client
    .from('completions')
    .select('habit_id, date')
    .eq('user_id', userId)
    .gte('date', fromStr)
    .lte('date', toStr)

  if (compError) throw new Error(compError.message)

  const allDates = new Set<string>((completions ?? []).map((c) => c.date))

  const byHabit = new Map<string, string[]>()
  for (const c of completions ?? []) {
    const list = byHabit.get(c.habit_id) ?? []
    list.push(c.date)
    byHabit.set(c.habit_id, list)
  }

  const habitStats: HabitStats[] = (habits ?? []).map((h) => {
    const streak = Array.isArray(h.streak) ? (h.streak[0] ?? null) : h.streak
    const dates = byHabit.get(h.id) ?? []
    const total = dates.length

    const thirty = new Date(today)
    thirty.setDate(thirty.getDate() - 29)
    const thirtyStr = toDateString(thirty)
    const in30 = dates.filter((d) => d >= thirtyStr).length
    const rate30d = Math.round((in30 / 30) * 100) / 100

    return {
      habitId: h.id,
      habitName: h.name,
      habitIcon: h.icon,
      habitColor: h.color,
      currentStreak: streak?.current_streak ?? 0,
      longestStreak: streak?.longest_streak ?? 0,
      totalCompletions: total,
      rate30d,
      completionDates: dates,
    }
  })

  const habitCount = habitStats.length || 1
  const rate7d = habitStats.reduce((sum, h) => {
    const seven = new Date(today)
    seven.setDate(seven.getDate() - 6)
    const sevenStr = toDateString(seven)
    const in7 = h.completionDates.filter((d) => d >= sevenStr).length
    return sum + in7 / (7 * habitCount)
  }, 0)
  const rate30d = habitStats.reduce((sum, h) => sum + h.rate30d, 0) / habitCount

  return { habits: habitStats, allDates, rate7d: Math.round(rate7d * 100) / 100, rate30d: Math.round(rate30d * 100) / 100 }
}

// ─── Read ────────────────────────────────────────────────────────────────────

export async function getHabitsWithStreak(client: SupabaseClient, userId: string): Promise<HabitWithStreak[]> {
  const today = todayLocal()

  const { data: allHabits, error } = await client
    .from('habits')
    .select(`
      *,
      streak:streaks(*),
      today_completion:completions(id, date)
    `)
    .eq('user_id', userId)
    .is('archived_at', null)
    .eq('today_completion.date', today)
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)

  return (allHabits ?? []).map((h) => ({
    ...h,
    streak: Array.isArray(h.streak) ? (h.streak[0] ?? null) : h.streak,
    completed_today: Array.isArray(h.today_completion)
      ? h.today_completion.some((c: { date: string }) => c.date === today)
      : false,
  }))
}

export async function getHabit(client: SupabaseClient, id: string): Promise<Habit> {
  const { data, error } = await client
    .from('habits')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data
}

// ─── Create / Update / Archive ───────────────────────────────────────────────

export type CreateHabitInput = Pick<Habit, 'name' | 'frequency'> &
  Partial<Pick<Habit, 'description' | 'icon' | 'color' | 'reminder_at'>>

export async function createHabit(client: SupabaseClient, userId: string, input: CreateHabitInput): Promise<Habit> {
  const { data, error } = await client
    .from('habits')
    .insert({ ...input, user_id: userId })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export type UpdateHabitInput = Partial<CreateHabitInput>

export async function updateHabit(client: SupabaseClient, id: string, input: UpdateHabitInput): Promise<Habit> {
  const { data, error } = await client
    .from('habits')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function archiveHabit(client: SupabaseClient, id: string): Promise<void> {
  const { error } = await client
    .from('habits')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)
}

// ─── Check-in ────────────────────────────────────────────────────────────────

export async function checkIn(client: SupabaseClient, habitId: string, userId: string, note?: string): Promise<Completion> {
  const { data, error } = await client
    .from('completions')
    .insert({ habit_id: habitId, user_id: userId, date: todayLocal(), note: note ?? null })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function undoCheckIn(client: SupabaseClient, habitId: string): Promise<void> {
  const { error } = await client
    .from('completions')
    .delete()
    .eq('habit_id', habitId)
    .eq('date', todayLocal())

  if (error) throw new Error(error.message)
}

export async function getCompletions(client: SupabaseClient, habitId: string, from: string, to: string): Promise<Completion[]> {
  const { data, error } = await client
    .from('completions')
    .select('*')
    .eq('habit_id', habitId)
    .gte('date', from)
    .lte('date', to)
    .order('date', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

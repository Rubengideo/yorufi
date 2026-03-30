import type { Streak } from '@habit-tracker/types'
import { supabase } from './supabase'

export async function getStreak(habitId: string): Promise<Streak | null> {
  const { data, error } = await supabase
    .from('streaks')
    .select('*')
    .eq('habit_id', habitId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data
}

/**
 * Pure function: calculate current streak from a sorted list of completion dates.
 * Dates must be 'YYYY-MM-DD' strings, sorted descending (newest first).
 */
export function calculateStreak(dates: string[]): { current: number; longest: number } {
  if (dates.length === 0) return { current: 0, longest: 0 }

  const sorted = [...dates].sort((a, b) => b.localeCompare(a))
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let current = 0
  let longest = 0
  let runLength = 1
  let cursor = new Date(sorted[0]!)
  cursor.setHours(0, 0, 0, 0)

  const diffDays = (a: Date, b: Date) =>
    Math.round((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24))

  // Current streak: check if the latest completion is today or yesterday
  const gap = diffDays(today, cursor)
  if (gap <= 1) {
    current = 1
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1]!)
      const curr = new Date(sorted[i]!)
      prev.setHours(0, 0, 0, 0)
      curr.setHours(0, 0, 0, 0)
      if (diffDays(prev, curr) === 1) {
        current++
      } else {
        break
      }
    }
  }

  // Longest streak
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]!)
    const curr = new Date(sorted[i]!)
    prev.setHours(0, 0, 0, 0)
    curr.setHours(0, 0, 0, 0)
    if (diffDays(prev, curr) === 1) {
      runLength++
    } else {
      longest = Math.max(longest, runLength)
      runLength = 1
    }
  }
  longest = Math.max(longest, runLength)

  return { current, longest }
}

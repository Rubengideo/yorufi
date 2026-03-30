export type FrequencyType = 'daily' | 'weekly'

export interface Frequency {
  type: FrequencyType
  /** For weekly: 0=Sun, 1=Mon, …, 6=Sat */
  days?: number[]
}

export interface Habit {
  id: string
  user_id: string
  name: string
  description: string | null
  icon: string | null
  color: string | null
  frequency: Frequency
  reminder_at: string | null  // "HH:MM" local time
  archived_at: string | null
  created_at: string
}

export interface Completion {
  id: string
  habit_id: string
  user_id: string
  date: string  // "YYYY-MM-DD"
  note: string | null
  created_at: string
}

export interface Streak {
  habit_id: string
  current_streak: number
  longest_streak: number
  last_completed: string | null
  updated_at: string
}

/** Habit enriched with its current streak — used in UI */
export interface HabitWithStreak extends Habit {
  streak: Streak | null
  completed_today: boolean
}

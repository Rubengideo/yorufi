'use client'

import Link from 'next/link'
import { useHabits, useArchiveHabit } from '@/hooks/useHabits'
import type { HabitWithStreak } from '@habit-tracker/types'

export function HabitsList() {
  const { data: habits, isLoading } = useHabits()
  const archiveHabit = useArchiveHabit()

  function handleArchive(habit: HabitWithStreak) {
    if (!confirm(`Archive "${habit.name}"? It won't appear in your daily view anymore.`)) return
    archiveHabit.mutate(habit.id)
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 rounded-2xl bg-stone-100 dark:bg-stone-900 animate-pulse" />
        ))}
      </div>
    )
  }

  if (!habits?.length) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-200 dark:border-stone-800 p-10 text-center space-y-2">
        <p className="font-medium">No habits yet</p>
        <p className="text-sm text-stone-400">Create your first habit to get started.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {habits.map((habit: HabitWithStreak) => {
        const streak = habit.streak?.current_streak ?? 0
        const longest = habit.streak?.longest_streak ?? 0

        return (
          <div
            key={habit.id}
            className="flex items-center gap-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0F0F0F] px-5 py-4"
          >
            {/* Color dot + icon */}
            <div className="flex items-center gap-2 shrink-0">
              {habit.color && (
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: habit.color }} />
              )}
              {habit.icon && <span className="text-xl">{habit.icon}</span>}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-950 dark:text-white truncate">{habit.name}</p>
              <div className="flex items-center gap-3 mt-0.5">
                <p className="text-xs text-stone-400 capitalize">
                  {habit.frequency.type}
                  {habit.frequency.days?.length ? ` · ${habit.frequency.days.length}×/week` : ''}
                </p>
                {streak > 0 && (
                  <p className="text-xs text-stone-400">🔥 {streak} day{streak !== 1 ? 's' : ''}</p>
                )}
                {longest > 0 && (
                  <p className="text-xs text-stone-400">Best: {longest}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
              <Link
                href={`/habits/${habit.id}/edit`}
                className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-900 transition"
              >
                Edit
              </Link>
              <button
                onClick={() => handleArchive(habit)}
                disabled={archiveHabit.isPending}
                className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition disabled:opacity-50"
              >
                Archive
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

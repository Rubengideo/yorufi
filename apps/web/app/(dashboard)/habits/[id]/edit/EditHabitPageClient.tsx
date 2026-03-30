'use client'

import { useHabit } from '@/hooks/useHabits'
import { EditHabitForm } from '@/components/habits/EditHabitForm'

export function EditHabitPageClient({ habitId }: { habitId: string }) {
  const { data: habit, isLoading } = useHabit(habitId)

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-12 rounded-xl bg-stone-100 dark:bg-stone-900 animate-pulse" />
        ))}
      </div>
    )
  }

  if (!habit) {
    return <p className="text-sm text-stone-400">Habit not found.</p>
  }

  return <EditHabitForm habit={habit} />
}

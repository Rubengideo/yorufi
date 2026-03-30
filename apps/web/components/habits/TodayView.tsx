'use client'

import { useCallback } from 'react'
import { useHabits, useCheckIn, useUndoCheckIn } from '@/hooks/useHabits'
import { HabitCard } from './HabitCard'
import { getProgressRingParams } from '@habit-tracker/ui'
import { TodayTasksSection } from '@/components/tasks/TodayTasksSection'

export function TodayView() {
  const { data: habits, isLoading } = useHabits()
  const checkIn = useCheckIn()
  const undoCheckIn = useUndoCheckIn()

  const handleCheckIn = useCallback(
    (habitId: string) => () => checkIn.mutate({ habitId }),
    [checkIn],
  )
  const handleUndo = useCallback(
    (habitId: string) => () => undoCheckIn.mutate(habitId),
    [undoCheckIn],
  )

  const today = new Date().toLocaleDateString('nl-NL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  const total = habits?.length ?? 0
  const completed = habits?.filter((h) => h.completed_today).length ?? 0
  const ring = getProgressRingParams({ total, completed, size: 64 })

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 rounded-2xl bg-stone-100 dark:bg-stone-900 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-stone-400 dark:text-stone-500 capitalize">{today}</p>
          <h1 className="text-2xl font-semibold tracking-tight mt-0.5">Your habits</h1>
        </div>

        {/* Progress ring (SVG) */}
        <div className="relative flex items-center justify-center">
          <svg width={ring.size} height={ring.size}>
            <circle
              cx={ring.center}
              cy={ring.center}
              r={ring.radius}
              fill="none"
              stroke={ring.trackColor}
              strokeWidth={ring.strokeWidth}
            />
            <circle
              cx={ring.center}
              cy={ring.center}
              r={ring.radius}
              fill="none"
              stroke={ring.color}
              strokeWidth={ring.strokeWidth}
              strokeDasharray={ring.circumference}
              strokeDashoffset={ring.strokeDashoffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${ring.center} ${ring.center})`}
            />
          </svg>
          <span className="absolute text-xs font-semibold tabular-nums">
            {completed}/{total}
          </span>
        </div>
      </div>

      {/* Habit list */}
      {habits && habits.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-200 dark:border-stone-800 p-10 text-center space-y-2">
          <p className="font-medium">No habits yet</p>
          <p className="text-sm text-stone-400">Add your first habit to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {habits?.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onCheckIn={handleCheckIn(habit.id)}
              onUndo={handleUndo(habit.id)}
            />
          ))}
        </div>
      )}

      {/* Taken voor vandaag */}
      <TodayTasksSection />
    </div>
  )
}

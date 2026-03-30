import type { Metadata } from 'next'
import { NewHabitForm } from '@/components/habits/NewHabitForm'

export const metadata: Metadata = { title: 'New Habit' }

export default function NewHabitPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New habit</h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
          Start small. Consistency beats intensity.
        </p>
      </div>
      <NewHabitForm />
    </div>
  )
}

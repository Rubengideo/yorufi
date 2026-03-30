import type { Metadata } from 'next'
import { EditHabitPageClient } from './EditHabitPageClient'

export const metadata: Metadata = { title: 'Edit Habit' }

export default function EditHabitPage({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Edit habit</h1>
      <EditHabitPageClient habitId={params.id} />
    </div>
  )
}

import type { Metadata } from 'next'
import { EditHabitPageClient } from './EditHabitPageClient'

export const metadata: Metadata = { title: 'Edit Habit' }

export default async function EditHabitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Edit habit</h1>
      <EditHabitPageClient habitId={id} />
    </div>
  )
}

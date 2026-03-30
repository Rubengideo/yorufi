import type { Metadata } from 'next'
import Link from 'next/link'
import { HabitsList } from '@/components/habits/HabitsList'

export const metadata: Metadata = { title: 'Habits' }

export default function HabitsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Habits</h1>
        <Link
          href="/habits/new"
          className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/90 transition"
        >
          + New habit
        </Link>
      </div>
      <HabitsList />
    </div>
  )
}

import type { Metadata } from 'next'
import { GoalsList } from '@/components/finance/GoalsList'

export const metadata: Metadata = { title: 'Financiële Doelen' }

export default function GoalsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Doelen</h1>
      </div>
      <GoalsList />
    </div>
  )
}

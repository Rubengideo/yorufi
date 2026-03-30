import type { Metadata } from 'next'
import { ExpensesView } from '@/components/finance/ExpensesView'

export const metadata: Metadata = { title: 'Uitgaven' }

export default function ExpensesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Uitgaven</h1>
      </div>
      <ExpensesView />
    </div>
  )
}

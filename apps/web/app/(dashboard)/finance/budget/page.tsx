import type { Metadata } from 'next'
import { BudgetView } from '@/components/finance/budget/BudgetView'

export const metadata: Metadata = { title: 'Maandbudget' }

export default function BudgetPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Maandbudget</h1>
        <p className="text-sm text-stone-400 dark:text-stone-500 mt-0.5">
          Stel je inkomen in en verdeel je budget over de drie categorieën.
        </p>
      </div>
      <BudgetView />
    </div>
  )
}

import type { Metadata } from 'next'
import { ExpenseImport } from '@/components/finance/ExpenseImport'

export const metadata: Metadata = { title: 'Importeren' }

export default function ImportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Transacties importeren</h1>
        <p className="text-sm text-stone-400 dark:text-stone-500 mt-0.5">
          Importeer je Rabobank transacties via een CSV-bestand.
        </p>
      </div>
      <ExpenseImport />
    </div>
  )
}

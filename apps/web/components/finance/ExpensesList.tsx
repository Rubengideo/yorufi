'use client'

import { AnimatePresence } from 'framer-motion'
import type { Expense } from '@habit-tracker/types'
import { ExpenseItem } from './ExpenseItem'

interface ExpensesListProps {
  expenses: Expense[]
  isLoading: boolean
}

function formatDayHeader(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('nl-NL', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
  })
}

export function ExpensesList({ expenses, isLoading }: ExpensesListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-14 rounded-xl bg-stone-100 dark:bg-stone-900 animate-pulse" />
        ))}
      </div>
    )
  }

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-200 dark:border-stone-800 py-10 text-center">
        <p className="text-sm font-medium text-stone-500 dark:text-stone-400">Nog geen uitgaven</p>
        <p className="text-xs text-stone-400 dark:text-stone-600 mt-1">
          Voeg een uitgave toe om te beginnen
        </p>
      </div>
    )
  }

  // Groepeer op datum — data is al gesorteerd op datum DESC, dan created_at DESC
  const grouped = new Map<string, Expense[]>()
  for (const exp of expenses) {
    const existing = grouped.get(exp.date) ?? []
    existing.push(exp)
    grouped.set(exp.date, existing)
  }

  return (
    <div className="space-y-4">
      {[...grouped.entries()].map(([date, dayExpenses]) => (
        <div key={date}>
          <p className="text-xs font-medium text-stone-400 dark:text-stone-500 mb-1 px-1">
            {formatDayHeader(date)}
          </p>
          <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0F0F0F] divide-y divide-stone-100 dark:divide-stone-900 overflow-hidden">
            <AnimatePresence>
              {dayExpenses.map((expense) => (
                <ExpenseItem key={expense.id} expense={expense} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      ))}
    </div>
  )
}

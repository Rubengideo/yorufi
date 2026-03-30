'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Expense } from '@habit-tracker/types'
import { EXPENSE_CATEGORIES } from '@habit-tracker/types'
import { useDeleteExpense } from '@/hooks/useExpenses'
import { ExpenseForm } from './ExpenseForm'

interface ExpenseItemProps {
  expense: Expense
}

export function ExpenseItem({ expense }: ExpenseItemProps) {
  const deleteExpense = useDeleteExpense()
  const [showEdit, setShowEdit] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const cat = EXPENSE_CATEGORIES.find((c) => c.value === expense.category)!

  const fmt = new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: expense.currency,
  })

  async function handleDelete() {
    if (!confirm('Uitgave verwijderen?')) return
    setIsDeleting(true)
    setDeleteError(null)
    try {
      await deleteExpense.mutateAsync(expense.id)
    } catch (err) {
      setIsDeleting(false)
      setDeleteError(err instanceof Error ? err.message : 'Verwijderen mislukt')
    }
  }

  if (showEdit) {
    return (
      <div className="px-4 py-3">
        <ExpenseForm
          expense={expense}
          onSuccess={() => setShowEdit(false)}
          onCancel={() => setShowEdit(false)}
        />
      </div>
    )
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className={`flex items-center gap-3 px-4 py-3 transition ${
        isDeleting ? 'opacity-50' : 'hover:bg-stone-50 dark:hover:bg-stone-900/50'
      }`}
    >
      {/* Categorie icoon */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-stone-100 dark:bg-stone-900 text-base">
        {cat.icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <span className="text-xs rounded-full bg-stone-100 dark:bg-stone-900 text-stone-500 dark:text-stone-400 px-2 py-0.5 font-medium">
          {cat.label}
        </span>
        {expense.description && (
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-0.5 truncate">
            {expense.description}
          </p>
        )}
      </div>

      {/* Bedrag */}
      <p className="text-sm font-semibold text-stone-950 dark:text-white shrink-0">
        {fmt.format(expense.amount)}
      </p>

      {/* Acties */}
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          onClick={() => setShowEdit(true)}
          title="Bewerken"
          className="rounded-lg p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-900 transition"
        >
          ✎
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          title="Verwijderen"
          className="rounded-lg p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 disabled:opacity-40 transition"
        >
          ✕
        </button>
      </div>
    </motion.div>
  )
}

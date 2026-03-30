'use client'

import { useState } from 'react'
import type { Expense, ExpenseCategory } from '@habit-tracker/types'
import { EXPENSE_CATEGORIES } from '@habit-tracker/types'
import { useCreateExpense, useUpdateExpense } from '@/hooks/useExpenses'
import { todayLocal } from '@habit-tracker/lib'

interface ExpenseFormProps {
  expense?: Expense
  onSuccess: () => void
  onCancel: () => void
}

export function ExpenseForm({ expense, onSuccess, onCancel }: ExpenseFormProps) {
  const createExpense = useCreateExpense()
  const updateExpense = useUpdateExpense()

  const [amount, setAmount]           = useState(expense?.amount?.toString() ?? '')
  const [category, setCategory]       = useState<ExpenseCategory>(expense?.category ?? 'overig')
  const [description, setDescription] = useState(expense?.description ?? '')
  const [date, setDate]               = useState(expense?.date ?? todayLocal())
  const [error, setError]             = useState<string | null>(null)

  const isPending = createExpense.isPending || updateExpense.isPending
  const isEdit = !!expense

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const parsed = parseFloat(amount)
    if (isNaN(parsed) || parsed <= 0) {
      setError('Vul een geldig bedrag in.')
      return
    }

    try {
      if (isEdit) {
        await updateExpense.mutateAsync({
          id: expense.id,
          input: { amount: parsed, category, description: description || null, date },
        })
      } else {
        await createExpense.mutateAsync({
          amount: parsed,
          category,
          description: description || null,
          date,
        })
      }
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis. Probeer het opnieuw.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Bedrag — prominent, eerste veld */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Bedrag</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-stone-400 font-medium select-none">
            €
          </span>
          <input
            required
            autoFocus
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0,00"
            className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1A1A1A] pl-8 pr-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition"
          />
        </div>
      </div>

      {/* Categorie — 5×2 grid */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Categorie</label>
        <div className="grid grid-cols-5 gap-2">
          {EXPENSE_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategory(cat.value)}
              className={`flex flex-col items-center gap-1 rounded-xl border py-2.5 px-1 transition ${
                category === cat.value
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:border-stone-400 dark:hover:border-stone-600'
              }`}
            >
              <span className="text-lg">{cat.icon}</span>
              <span className="text-[10px] leading-tight text-center font-medium">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Beschrijving */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">
          Beschrijving <span className="text-stone-400">(optioneel)</span>
        </label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Albert Heijn, benzine, bioscooptickets…"
          maxLength={280}
          className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1A1A1A] px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition"
        />
      </div>

      {/* Datum */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Datum</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          max={todayLocal()}
          className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1A1A1A] px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition"
        />
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-stone-200 dark:border-stone-800 px-5 py-2.5 text-sm font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-900 transition"
        >
          Annuleren
        </button>
        <button
          type="submit"
          disabled={isPending || !amount}
          className="flex-1 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent/90 disabled:opacity-60 transition"
        >
          {isPending
            ? (isEdit ? 'Opslaan…' : 'Toevoegen…')
            : (isEdit ? 'Opslaan' : 'Uitgave toevoegen')}
        </button>
      </div>
    </form>
  )
}

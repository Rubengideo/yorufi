'use client'

import { useState } from 'react'
import type { BudgetBucket, BudgetItem } from '@habit-tracker/types'
import { useCreateBudgetItem, useUpdateBudgetItem } from '@/hooks/useBudget'

interface BudgetItemFormProps {
  bucket: BudgetBucket
  item?: BudgetItem
  onSuccess: () => void
  onCancel: () => void
}

export function BudgetItemForm({ bucket, item, onSuccess, onCancel }: BudgetItemFormProps) {
  const createItem = useCreateBudgetItem()
  const updateItem = useUpdateBudgetItem()

  const [name,        setName]        = useState(item?.name ?? '')
  const [amount,      setAmount]      = useState(item?.amount?.toString() ?? '')
  const [isRecurring, setIsRecurring] = useState(item?.is_recurring ?? true)
  const [error,       setError]       = useState<string | null>(null)

  const isPending = createItem.isPending || updateItem.isPending
  const isEdit    = !!item

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
        await updateItem.mutateAsync({ id: item.id, input: { name, amount: parsed, is_recurring: isRecurring } })
      } else {
        await createItem.mutateAsync({ name, amount: parsed, bucket, is_recurring: isRecurring })
      }
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5 pt-1">
      <div className="flex gap-2">
        <input
          required
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Hypotheek, Netflix…"
          maxLength={60}
          className="min-w-0 flex-1 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1A1A1A] px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition"
        />
        <div className="relative w-24 shrink-0">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 font-medium select-none">€</span>
          <input
            required
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1A1A1A] pl-5 pr-2.5 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition"
          />
        </div>
      </div>

      {/* Recurring toggle */}
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={() => setIsRecurring(true)}
          className={`flex-1 rounded-xl border px-2.5 py-1.5 text-[10px] font-semibold transition ${
            isRecurring
              ? 'border-accent bg-accent/10 text-accent'
              : 'border-stone-200 dark:border-stone-800 text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-900'
          }`}
        >
          ↻ Vaste last
        </button>
        <button
          type="button"
          onClick={() => setIsRecurring(false)}
          className={`flex-1 rounded-xl border px-2.5 py-1.5 text-[10px] font-semibold transition ${
            !isRecurring
              ? 'border-accent bg-accent/10 text-accent'
              : 'border-stone-200 dark:border-stone-800 text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-900'
          }`}
        >
          Eenmalig
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-stone-200 dark:border-stone-800 px-3 py-1.5 text-xs font-medium text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-900 transition"
        >
          Annuleren
        </button>
        <button
          type="submit"
          disabled={isPending || !name.trim() || !amount}
          className="flex-1 rounded-xl bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent/90 disabled:opacity-60 transition"
        >
          {isPending
            ? (isEdit ? 'Opslaan…' : 'Toevoegen…')
            : (isEdit ? 'Opslaan' : 'Toevoegen')}
        </button>
      </div>
    </form>
  )
}

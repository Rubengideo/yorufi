'use client'

import { useState } from 'react'
import { useBudgetItems } from '@/hooks/useBudget'
import { useCreateExpense } from '@/hooks/useExpenses'
import { EXPENSE_CATEGORIES, type ExpenseCategory } from '@habit-tracker/types'
import type { BudgetBucket } from '@habit-tracker/types'

const BUCKET_DEFAULT_CATEGORY: Record<BudgetBucket, ExpenseCategory> = {
  needs:   'wonen',
  savings: 'overig',
  wants:   'entertainment',
}

interface Props {
  year: number
  month: number
  onClose: () => void
}

export function ApplyRecurringModal({ year, month, onClose }: Props) {
  const { data: items = [] } = useBudgetItems()
  const createExpense = useCreateExpense()

  const recurring = items.filter((i) => i.is_recurring)

  const [selected, setSelected] = useState<Set<string>>(() => new Set(recurring.map((i) => i.id)))
  const [categories, setCategories] = useState<Record<string, ExpenseCategory>>(() =>
    Object.fromEntries(recurring.map((i) => [i.id, BUCKET_DEFAULT_CATEGORY[i.bucket]]))
  )
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState<number | null>(null)

  const fmt = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 })

  const dateStr = `${year}-${String(month).padStart(2, '0')}-01`

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function setCategory(id: string, cat: ExpenseCategory) {
    setCategories((prev) => ({ ...prev, [id]: cat }))
  }

  async function handleApply() {
    const toApply = recurring.filter((i) => selected.has(i.id))
    if (toApply.length === 0) return
    setLoading(true)
    let count = 0
    for (const item of toApply) {
      try {
        await createExpense.mutateAsync({
          amount: item.amount,
          category: categories[item.id],
          description: item.name,
          date: dateStr,
          currency: item.currency,
        })
        count++
      } catch {
        // door met de rest
      }
    }
    setLoading(false)
    setDone(count)
  }

  const MAANDEN = [
    'januari', 'februari', 'maart', 'april', 'mei', 'juni',
    'juli', 'augustus', 'september', 'oktober', 'november', 'december',
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0F0F0F] shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 dark:border-stone-900">
          <div>
            <p className="text-sm font-semibold text-stone-950 dark:text-white">Vaste lasten toepassen</p>
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
              {MAANDEN[month - 1]} {year}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-900 transition"
          >
            ✕
          </button>
        </div>

        {done !== null ? (
          /* Succes-staat */
          <div className="px-5 py-10 flex flex-col items-center gap-3 text-center">
            <span className="text-3xl">✓</span>
            <p className="text-sm font-medium text-stone-950 dark:text-white">
              {done} vaste last{done !== 1 ? 'en' : ''} aangemaakt
            </p>
            <p className="text-xs text-stone-400 dark:text-stone-500">
              Zichtbaar in Uitgaven onder {MAANDEN[month - 1]}.
            </p>
            <button
              onClick={onClose}
              className="mt-2 rounded-xl bg-stone-950 dark:bg-white text-white dark:text-stone-950 px-5 py-2 text-sm font-medium transition"
            >
              Sluiten
            </button>
          </div>
        ) : recurring.length === 0 ? (
          /* Geen recurring items */
          <div className="px-5 py-10 text-center space-y-2">
            <p className="text-sm text-stone-500 dark:text-stone-400">Geen vaste lasten ingesteld.</p>
            <p className="text-xs text-stone-400 dark:text-stone-500">
              Voeg budget-posten toe met "Vaste last" ingeschakeld.
            </p>
          </div>
        ) : (
          <>
            {/* Lijst */}
            <div className="max-h-80 overflow-y-auto divide-y divide-stone-50 dark:divide-stone-900">
              {recurring.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-900/50 transition"
                >
                  <input
                    type="checkbox"
                    checked={selected.has(item.id)}
                    onChange={() => toggle(item.id)}
                    className="h-4 w-4 rounded accent-stone-900 dark:accent-white"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-950 dark:text-white truncate">{item.name}</p>
                    <p className="text-xs text-stone-400 dark:text-stone-500">{fmt.format(item.amount)}</p>
                  </div>
                  <select
                    value={categories[item.id]}
                    onChange={(e) => setCategory(item.id, e.target.value as ExpenseCategory)}
                    onClick={(e) => e.stopPropagation()}
                    disabled={!selected.has(item.id)}
                    className="text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 px-2 py-1.5 disabled:opacity-40 transition"
                  >
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-stone-100 dark:border-stone-900 flex items-center justify-between gap-3">
              <p className="text-xs text-stone-400 dark:text-stone-500">
                {selected.size} van {recurring.length} geselecteerd
              </p>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="rounded-xl px-4 py-2 text-sm text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition"
                >
                  Annuleer
                </button>
                <button
                  onClick={handleApply}
                  disabled={selected.size === 0 || loading}
                  className="rounded-xl bg-stone-950 dark:bg-white text-white dark:text-stone-950 px-4 py-2 text-sm font-medium disabled:opacity-40 transition"
                >
                  {loading ? 'Aanmaken…' : 'Toepassen'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

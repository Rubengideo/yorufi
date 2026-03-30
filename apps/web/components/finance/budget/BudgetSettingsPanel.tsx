'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { BudgetSettings } from '@habit-tracker/types'
import { useUpdateBudgetSettings } from '@/hooks/useBudget'

interface BudgetSettingsPanelProps {
  settings: BudgetSettings
  open: boolean
  onClose: () => void
}

export function BudgetSettingsPanel({ settings, open, onClose }: BudgetSettingsPanelProps) {
  const update = useUpdateBudgetSettings()

  const [income,     setIncome]     = useState(settings.monthly_income.toString())
  const [needsPct,   setNeedsPct]   = useState(settings.needs_pct.toString())
  const [savingsPct, setSavingsPct] = useState(settings.savings_pct.toString())
  const [wantsPct,   setWantsPct]   = useState(settings.wants_pct.toString())
  const [error,      setError]      = useState<string | null>(null)

  const total = Number(needsPct) + Number(savingsPct) + Number(wantsPct)
  const diff  = 100 - total

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (total !== 100) {
      setError(`Percentages moeten optellen tot 100% (nu: ${total}%)`)
      return
    }
    try {
      await update.mutateAsync({
        monthly_income: parseFloat(income),
        needs_pct:   Number(needsPct),
        savings_pct: Number(savingsPct),
        wants_pct:   Number(wantsPct),
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis.')
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0F0F0F] px-5 py-4 mb-4">
            <p className="text-sm font-semibold mb-4">Budgetinstellingen</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Maandinkomen */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">
                  Maandinkomen (netto)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-stone-400 font-medium select-none">€</span>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#1A1A1A] pl-8 pr-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition"
                  />
                </div>
              </div>

              {/* Percentage-verdeling */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">
                  Budgetverdeling
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {/* Nodig */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                      <span className="text-xs font-medium text-stone-600 dark:text-stone-400">Nodig</span>
                    </div>
                    <div className="relative">
                      <input
                        required
                        type="number"
                        min="0"
                        max="100"
                        value={needsPct}
                        onChange={(e) => setNeedsPct(e.target.value)}
                        className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#1A1A1A] px-3 pr-7 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">%</span>
                    </div>
                  </div>
                  {/* Sparen */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-green-500 shrink-0" />
                      <span className="text-xs font-medium text-stone-600 dark:text-stone-400">Sparen</span>
                    </div>
                    <div className="relative">
                      <input
                        required
                        type="number"
                        min="0"
                        max="100"
                        value={savingsPct}
                        onChange={(e) => setSavingsPct(e.target.value)}
                        className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#1A1A1A] px-3 pr-7 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">%</span>
                    </div>
                  </div>
                  {/* Leuk */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                      <span className="text-xs font-medium text-stone-600 dark:text-stone-400">Leuk</span>
                    </div>
                    <div className="relative">
                      <input
                        required
                        type="number"
                        min="0"
                        max="100"
                        value={wantsPct}
                        onChange={(e) => setWantsPct(e.target.value)}
                        className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#1A1A1A] px-3 pr-7 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">%</span>
                    </div>
                  </div>
                </div>

                {/* Live som-indicator */}
                <p className={`text-xs font-medium mt-1 ${total === 100 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                  Totaal: {total}%
                  {total === 100
                    ? ' ✓'
                    : diff > 0
                    ? ` — nog ${diff}% toe te wijzen`
                    : ` — ${Math.abs(diff)}% te veel`}
                </p>
              </div>

              {error && (
                <p className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-stone-200 dark:border-stone-800 px-5 py-2.5 text-sm font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-900 transition"
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  disabled={update.isPending || total !== 100}
                  className="flex-1 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent/90 disabled:opacity-60 transition"
                >
                  {update.isPending ? 'Opslaan…' : 'Opslaan'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

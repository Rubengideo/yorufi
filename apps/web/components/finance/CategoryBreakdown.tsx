'use client'

import { motion } from 'framer-motion'
import type { MonthlySummary } from '@habit-tracker/types'
import { EXPENSE_CATEGORIES } from '@habit-tracker/types'

interface CategoryBreakdownProps {
  summary: MonthlySummary | null
  prevSummary?: MonthlySummary | null
  isLoading?: boolean
  currency?: string
  onCategoryClick?: (category: string | null) => void
  activeCategory?: string | null
}

function barColor(spent: number, budget: number | null): string {
  if (budget === null) return '#6C63FF'   // accent — geen budget ingesteld
  const pct = spent / budget
  if (pct >= 1)    return '#EF4444'      // rood — over budget
  if (pct >= 0.75) return '#F59E0B'      // amber — bijna op
  return '#22C55E'                        // groen — op schema
}

export function CategoryBreakdown({ summary, prevSummary, isLoading, currency = 'EUR', onCategoryClick, activeCategory }: CategoryBreakdownProps) {
  if (isLoading || !summary) {
    return <div className="h-32 rounded-2xl bg-stone-100 dark:bg-stone-900 animate-pulse" />
  }

  const fmt = new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  })

  const sorted = EXPENSE_CATEGORIES
    .map((cat) => ({ ...cat, data: summary.by_category[cat.value] }))
    .filter((c) => c.data.spent > 0)
    .sort((a, b) => b.data.spent - a.data.spent)

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-200 dark:border-stone-800 py-10 text-center">
        <p className="text-sm text-stone-400 dark:text-stone-500">
          Nog geen uitgaven deze maand
        </p>
      </div>
    )
  }

  const maxSpent = Math.max(...sorted.map((c) => c.data.spent))

  return (
    <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0F0F0F] px-5 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-stone-400 dark:text-stone-500 font-medium uppercase tracking-wide">
          Per categorie
        </p>
        {activeCategory && onCategoryClick && (
          <button
            onClick={() => onCategoryClick(null)}
            className="text-[10px] text-accent hover:text-accent/80 flex items-center gap-1 transition"
          >
            {sorted.find(c => c.value === activeCategory)?.label} ✕
          </button>
        )}
      </div>
      {sorted.map(({ value, label, icon, data }, index) => {
        const pct = data.budget !== null
          ? Math.min((data.spent / data.budget) * 100, 100)
          : (data.spent / maxSpent) * 100

        const color = barColor(data.spent, data.budget)
        const isOverBudget = data.budget !== null && data.spent > data.budget
        const isActive = activeCategory === value

        const prevSpent = prevSummary?.by_category[value]?.spent ?? null
        const mmDelta = prevSpent !== null && prevSpent > 0
          ? ((data.spent - prevSpent) / prevSpent) * 100
          : null

        return (
          <motion.div
            key={value}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className={`space-y-1.5 transition-opacity ${onCategoryClick ? 'cursor-pointer' : ''} ${
              activeCategory && !isActive ? 'opacity-35' : 'opacity-100'
            }`}
            onClick={() => onCategoryClick?.(isActive ? null : value)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">{icon}</span>
                <span className={`text-sm font-medium ${isActive ? 'text-stone-950 dark:text-white' : 'text-stone-700 dark:text-stone-300'}`}>
                  {label}
                </span>
                {isOverBudget && (
                  <span className="text-xs rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 px-1.5 py-0.5">
                    Over budget
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1.5 text-right">
                {mmDelta !== null && (
                  <span className={`text-[10px] font-medium ${mmDelta > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {mmDelta > 0 ? '↑' : '↓'}{Math.round(Math.abs(mmDelta))}%
                  </span>
                )}
                {summary.total > 0 && (
                  <span className="text-[10px] text-stone-400 dark:text-stone-500">
                    {Math.round((data.spent / summary.total) * 100)}%
                  </span>
                )}
                <span className="text-sm font-semibold text-stone-950 dark:text-white">
                  {fmt.format(data.spent)}
                </span>
                {data.budget !== null && (
                  <span className="text-xs text-stone-400 dark:text-stone-500">
                    / {fmt.format(data.budget)}
                  </span>
                )}
              </div>
            </div>

            <div className="h-2 w-full rounded-full bg-stone-100 dark:bg-stone-900 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: color }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: index * 0.04 }}
              />
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

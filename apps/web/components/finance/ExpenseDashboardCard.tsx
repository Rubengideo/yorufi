'use client'

import Link from 'next/link'
import { useMonthlySummary } from '@/hooks/useExpenses'
import { EXPENSE_CATEGORIES } from '@habit-tracker/types'

const CATEGORY_COLORS: Record<string, string> = {
  wonen: '#6C63FF',
  boodschappen: '#22C55E',
  transport: '#3B82F6',
  horeca: '#F59E0B',
  entertainment: '#EC4899',
  abonnementen: '#8B5CF6',
  gezondheid: '#14B8A6',
  shopping: '#EF4444',
  opleiding: '#F97316',
  overig: '#78716C',
  sparen: '#10B981',
}

const MAAND_SHORT = ['jan','feb','mrt','apr','mei','jun','jul','aug','sep','okt','nov','dec']

export function ExpenseDashboardCard() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear  = month === 1 ? year - 1 : year

  const { data: summary, isLoading } = useMonthlySummary(year, month)
  const { data: prevSummary } = useMonthlySummary(prevYear, prevMonth)

  const fmt    = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
  const fmtDec = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' })

  if (isLoading) {
    return <div className="h-24 rounded-2xl bg-stone-100 dark:bg-stone-900 animate-pulse" />
  }

  // M/M vergelijking
  const mmDelta = summary && prevSummary && prevSummary.total > 0
    ? ((summary.total - prevSummary.total) / prevSummary.total) * 100
    : null

  // Top 4 categorieën gesorteerd op uitgaven
  const top4 = summary
    ? EXPENSE_CATEGORIES
        .map((cat) => ({ ...cat, spent: summary.by_category[cat.value]?.spent ?? 0 }))
        .filter((c) => c.spent > 0)
        .sort((a, b) => b.spent - a.spent)
        .slice(0, 4)
    : []

  const maxSpent = top4[0]?.spent ?? 1

  return (
    <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0F0F0F] px-5 py-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-medium text-stone-950 dark:text-white">Uitgaven deze maand</p>
          <div className="flex items-baseline gap-2.5 mt-0.5">
            <p className="text-2xl font-semibold text-stone-950 dark:text-white">
              {summary ? fmtDec.format(summary.total) : '—'}
            </p>
            {mmDelta !== null && (
              <span className={`inline-flex items-center gap-0.5 text-xs font-medium rounded-full px-2 py-0.5 ${
                mmDelta > 0
                  ? 'bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400'
                  : 'bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400'
              }`}>
                {mmDelta > 0 ? '↑' : '↓'} {Math.round(Math.abs(mmDelta))}% vs {MAAND_SHORT[prevMonth - 1]}
              </span>
            )}
          </div>
        </div>
        <Link
          href="/finance/expenses"
          className="shrink-0 rounded-xl bg-stone-100 dark:bg-stone-900 px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 transition"
        >
          Bekijken →
        </Link>
      </div>

      {/* Categorie mini-bars */}
      {top4.length > 0 ? (
        <div className="space-y-2 pt-1 border-t border-stone-100 dark:border-stone-900">
          {top4.map((cat) => {
            const prevSpent = prevSummary?.by_category[cat.value]?.spent ?? null
            const catDelta = prevSpent !== null && prevSpent > 0
              ? ((cat.spent - prevSpent) / prevSpent) * 100
              : null

            return (
              <div key={cat.value} className="flex items-center gap-3">
                {/* Icoon + label */}
                <span className="w-4 text-center text-sm leading-none shrink-0">{cat.icon}</span>
                <p className="w-24 shrink-0 text-xs text-stone-600 dark:text-stone-400 truncate">{cat.label}</p>

                {/* Bar */}
                <div className="flex-1 h-1.5 rounded-full bg-stone-100 dark:bg-stone-900 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(cat.spent / maxSpent) * 100}%`,
                      backgroundColor: CATEGORY_COLORS[cat.value] ?? '#78716C',
                    }}
                  />
                </div>

                {/* Bedrag + delta */}
                <div className="w-20 shrink-0 text-right">
                  <p className="text-xs font-medium text-stone-700 dark:text-stone-300">
                    {fmt.format(cat.spent)}
                  </p>
                  {catDelta !== null && (
                    <p className={`text-[10px] ${catDelta > 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {catDelta > 0 ? '↑' : '↓'}{Math.round(Math.abs(catDelta))}%
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-xs text-stone-400 dark:text-stone-500 pt-1 border-t border-stone-100 dark:border-stone-900 mt-1">
          Nog geen uitgaven deze maand
        </p>
      )}
    </div>
  )
}

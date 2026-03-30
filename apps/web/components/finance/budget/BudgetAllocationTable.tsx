'use client'

import type { BudgetSummary } from '@habit-tracker/types'

interface BudgetAllocationTableProps {
  summary: BudgetSummary
}

function spentPctColor(spent: number, goal: number): string {
  if (spent <= goal) return 'text-green-600 dark:text-green-400'
  if (spent <= goal + 5) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-500 dark:text-red-400'
}

export function BudgetAllocationTable({ summary }: BudgetAllocationTableProps) {
  const fmt = new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: summary.currency,
    maximumFractionDigits: 0,
  })

  const rows = [summary.needs, summary.savings, summary.wants]
  const totalActualPct = summary.monthly_income > 0
    ? Math.round((summary.total_budgeted / summary.monthly_income) * 100)
    : 0
  const totalSpentPct = summary.monthly_income > 0
    ? Math.round(((summary.needs.spent_amount + summary.savings.spent_amount + summary.wants.spent_amount) / summary.monthly_income) * 100)
    : 0

  return (
    <div className="flex-1 min-w-0">
      {/* Tabelheader */}
      <div className="grid grid-cols-5 px-4 py-2 border-b border-stone-100 dark:border-stone-900">
        <p className="text-[10px] font-medium text-stone-400 dark:text-stone-500 uppercase tracking-wide"></p>
        <p className="text-[10px] font-medium text-stone-400 dark:text-stone-500 uppercase tracking-wide text-right">Doel</p>
        <p className="text-[10px] font-medium text-stone-400 dark:text-stone-500 uppercase tracking-wide text-right">Gepland</p>
        <p className="text-[10px] font-medium text-stone-400 dark:text-stone-500 uppercase tracking-wide text-right">Werkelijk</p>
        <p className="text-[10px] font-medium text-stone-400 dark:text-stone-500 uppercase tracking-wide text-right">Bedrag</p>
      </div>

      {/* Bucket-rijen */}
      {rows.map((row) => (
        <div
          key={row.bucket}
          className="grid grid-cols-5 px-4 py-2.5 border-b border-stone-50 dark:border-stone-900/50 last:border-0"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: row.color }}
            />
            <span className="text-xs font-medium text-stone-700 dark:text-stone-300 truncate">
              {row.label}
            </span>
          </div>
          <p className="text-xs text-stone-400 dark:text-stone-500 text-right self-center">
            {row.goal_pct}%
          </p>
          <p className={`text-xs font-medium text-right self-center ${spentPctColor(row.actual_pct, row.goal_pct)}`}>
            {row.actual_pct.toFixed(0)}%
          </p>
          <p className={`text-xs font-semibold text-right self-center ${row.spent_pct > row.goal_pct + 5 ? 'text-red-500' : row.spent_pct > 0 ? 'text-stone-950 dark:text-white' : 'text-stone-400 dark:text-stone-600'}`}>
            {row.spent_pct > 0 ? `${row.spent_pct.toFixed(0)}%` : '—'}
          </p>
          <p className="text-xs font-semibold text-stone-950 dark:text-white text-right self-center">
            {fmt.format(row.actual_amount)}
          </p>
        </div>
      ))}

      {/* Totaalrij */}
      <div className="grid grid-cols-5 px-4 py-2.5 bg-stone-50 dark:bg-stone-900/40 border-t border-stone-200 dark:border-stone-800">
        <p className="text-xs font-semibold text-stone-950 dark:text-white">Totale uitgave</p>
        <p className="text-xs text-stone-400 dark:text-stone-500 text-right self-center">100%</p>
        <p className="text-xs text-stone-400 dark:text-stone-500 text-right self-center">
          {totalActualPct}%
        </p>
        <p className={`text-xs font-semibold text-right self-center ${totalSpentPct > 100 ? 'text-red-500' : 'text-stone-950 dark:text-white'}`}>
          {totalSpentPct > 0 ? `${totalSpentPct}%` : '—'}
        </p>
        <p className="text-xs font-semibold text-stone-950 dark:text-white text-right">
          {fmt.format(summary.total_budgeted)}
        </p>
      </div>

      {/* Nog te besteden footer */}
      <div className="px-4 py-2.5 flex items-center justify-between border-t border-stone-100 dark:border-stone-900">
        <p className="text-xs text-stone-400 dark:text-stone-500">
          {summary.total_remaining >= 0
            ? 'Nog niet toegewezen'
            : 'Budget overschreden met'}
        </p>
        <p className={`text-xs font-semibold ${summary.total_remaining < 0 ? 'text-red-500' : 'text-stone-950 dark:text-white'}`}>
          {fmt.format(Math.abs(summary.total_remaining))}
        </p>
      </div>
    </div>
  )
}

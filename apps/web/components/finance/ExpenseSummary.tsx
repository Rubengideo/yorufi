'use client'

import { motion } from 'framer-motion'
import type { MonthlySummary } from '@habit-tracker/types'

const MAAND_LABELS_SHORT = [
  'jan', 'feb', 'mrt', 'apr', 'mei', 'jun',
  'jul', 'aug', 'sep', 'okt', 'nov', 'dec',
]

interface ExpenseSummaryProps {
  summary: MonthlySummary | null
  isLoading?: boolean
  currency?: string
}

export function ExpenseSummary({ summary, isLoading, currency = 'EUR' }: ExpenseSummaryProps) {
  if (isLoading || !summary) {
    return <div className="h-20 rounded-2xl bg-stone-100 dark:bg-stone-900 animate-pulse" />
  }

  const fmt = new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  })

  let changeLabel: React.ReactNode = null
  if (summary.prev_total !== null && summary.prev_total > 0) {
    const pct = ((summary.total - summary.prev_total) / summary.prev_total) * 100
    const rounded = Math.round(Math.abs(pct))
    const prevMonthIndex = (summary.month === 1 ? 12 : summary.month - 1) - 1
    const prevLabel = MAAND_LABELS_SHORT[prevMonthIndex]
    const isUp = pct > 0
    changeLabel = (
      <span
        className={`inline-flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5 ${
          isUp
            ? 'bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400'
            : 'bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400'
        }`}
      >
        {isUp ? '↑' : '↓'} {rounded}% vs {prevLabel}
      </span>
    )
  }

  const today = new Date()
  const isCurrentMonth = summary.year === today.getFullYear() && summary.month === today.getMonth() + 1
  const daysInMonth = new Date(summary.year, summary.month, 0).getDate()
  const daysElapsed = isCurrentMonth ? today.getDate() : daysInMonth
  const dailyAvg = daysElapsed > 0 ? summary.total / daysElapsed : 0
  const projected = dailyAvg * daysInMonth
  const daysLeft = daysInMonth - today.getDate()

  const fmtRound = new Intl.NumberFormat('nl-NL', { style: 'currency', currency, maximumFractionDigits: 0 })

  let projectedCls = 'text-stone-950 dark:text-white'
  if (summary.prev_total !== null && summary.prev_total > 0) {
    if (projected > summary.prev_total * 1.2) projectedCls = 'text-red-500'
    else if (projected > summary.prev_total) projectedCls = 'text-amber-600 dark:text-amber-400'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0F0F0F] px-5 py-4"
    >
      <p className="text-xs text-stone-400 dark:text-stone-500 font-medium uppercase tracking-wide">
        Totaal deze maand
      </p>
      <div className="mt-1 flex items-baseline gap-3 flex-wrap">
        <p className="text-3xl font-semibold tracking-tight text-stone-950 dark:text-white">
          {fmt.format(summary.total)}
        </p>
        {changeLabel}
      </div>

      {isCurrentMonth && (
        <div className="flex items-center gap-0 mt-3 pt-3 border-t border-stone-100 dark:border-stone-900 -mx-5 px-5 divide-x divide-stone-100 dark:divide-stone-900">
          <div className="flex-1 pr-4">
            <p className="text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-wide mb-0.5">Gem./dag</p>
            <p className="text-xs font-semibold text-stone-950 dark:text-white">{fmtRound.format(dailyAvg)}</p>
          </div>
          <div className="flex-1 px-4">
            <p className="text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-wide mb-0.5">Verwacht totaal</p>
            <p className={`text-xs font-semibold ${projectedCls}`}>{fmtRound.format(projected)}</p>
          </div>
          <div className="flex-1 pl-4">
            <p className="text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-wide mb-0.5">Dagen resterend</p>
            <p className="text-xs font-semibold text-stone-950 dark:text-white">{daysLeft}</p>
          </div>
        </div>
      )}
    </motion.div>
  )
}

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { BudgetBucketSummary, BudgetItem } from '@habit-tracker/types'
import { useDeleteBudgetItem } from '@/hooks/useBudget'
import { BudgetItemForm } from './BudgetItemForm'

interface BudgetBucketCardProps {
  summary: BudgetBucketSummary
  currency: string
}

export function BudgetBucketCard({ summary, currency }: BudgetBucketCardProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null)
  const deleteItem = useDeleteBudgetItem()

  const fmt = new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  })

  const isOver   = summary.remaining < 0
  const usagePct = summary.goal_amount > 0
    ? Math.min((summary.actual_amount / summary.goal_amount) * 100, 100)
    : 0

  // ── Tempo-indicator ──────────────────────────────────────────
  const today       = new Date()
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const dayFrac     = today.getDate() / daysInMonth
  const dayFracPct  = Math.round(dayFrac * 100)
  const proRata     = summary.goal_amount * dayFrac

  type TempoStatus = 'on_track' | 'watch' | 'over'
  const tempoStatus: TempoStatus | null = summary.goal_amount > 0
    ? summary.spent_amount > proRata * 1.25
      ? 'over'
      : summary.spent_amount > proRata * 1.1
      ? 'watch'
      : 'on_track'
    : null

  const tempoLabel: Record<TempoStatus, string> = {
    on_track: 'Op schema',
    watch:    'Let op',
    over:     'Te snel',
  }
  const tempoCls: Record<TempoStatus, string> = {
    on_track: 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400',
    watch:    'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
    over:     'bg-red-50 dark:bg-red-950/30 text-red-500',
  }

  return (
    <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0F0F0F] overflow-hidden">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="px-5 py-4 border-b border-stone-100 dark:border-stone-900">

        {/* Rij 1: label links, remaining + tempo rechts */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: summary.color }}
            />
            <p className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wide">
              {summary.label}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {tempoStatus && (
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold leading-none ${tempoCls[tempoStatus]}`}>
                {tempoLabel[tempoStatus]}
              </span>
            )}
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-stone-400 dark:text-stone-500">Nog over</span>
              <span
                className={`text-base font-semibold ${isOver ? 'text-red-500' : ''}`}
                style={isOver ? undefined : { color: summary.color }}
              >
                {fmt.format(summary.remaining)}
              </span>
            </div>
          </div>
        </div>

        {/* Progress bar + day-of-month marker */}
        <div className="relative">
          <div className="h-1.5 w-full rounded-full bg-stone-100 dark:bg-stone-900 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: isOver ? '#EF4444' : summary.color }}
              initial={{ width: 0 }}
              animate={{ width: `${usagePct}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
          {summary.goal_amount > 0 && (
            <div
              className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3.5 rounded-full bg-stone-400/50 dark:bg-stone-500/50 pointer-events-none"
              style={{ left: `${dayFracPct}%` }}
            />
          )}
        </div>

        {/* Rij 3: gepland links, doel rechts */}
        <div className="flex items-center justify-between mt-1.5">
          <p className="text-[10px] text-stone-400 dark:text-stone-500">
            {fmt.format(summary.actual_amount)} gepland
          </p>
          <p className="text-[10px] text-stone-400 dark:text-stone-500">
            Doel {fmt.format(summary.goal_amount)}
            {summary.spent_amount > 0 && (
              <span className="ml-1.5">· {fmt.format(summary.spent_amount)} werkelijk</span>
            )}
          </p>
        </div>
      </div>

      {/* ── Item-lijst ─────────────────────────────────────────── */}
      <div className="px-5 divide-y divide-stone-50 dark:divide-stone-900/60">
        {summary.items.map((item, index) =>
          editingItem?.id === item.id ? (
            <div key={item.id} className="py-3">
              <BudgetItemForm
                bucket={summary.bucket}
                item={item}
                onSuccess={() => setEditingItem(null)}
                onCancel={() => setEditingItem(null)}
              />
            </div>
          ) : (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="group flex items-center gap-3 py-2.5"
            >
              <p className="flex-1 text-sm text-stone-700 dark:text-stone-300 min-w-0 truncate">
                {item.name}
              </p>
              {!item.is_recurring && (
                <span className="shrink-0 rounded-md bg-stone-100 dark:bg-stone-900 px-1.5 py-0.5 text-[10px] font-medium text-stone-400 dark:text-stone-500 leading-none">
                  eenmalig
                </span>
              )}
              <p className="text-sm font-medium text-stone-950 dark:text-white shrink-0 tabular-nums">
                {fmt.format(item.amount)}
              </p>
              <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition shrink-0">
                <button
                  onClick={() => setEditingItem(item)}
                  title="Bewerken"
                  className="rounded-lg p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition text-[11px] leading-none"
                >
                  ✎
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`"${item.name}" verwijderen?`)) {
                      deleteItem.mutate(item.id)
                    }
                  }}
                  title="Verwijderen"
                  className="rounded-lg p-1 text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition text-[11px] leading-none"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          )
        )}

        {summary.items.length === 0 && !showAddForm && (
          <p className="py-5 text-center text-xs text-stone-400 dark:text-stone-600">
            Nog geen posten
          </p>
        )}
      </div>

      {/* ── Formulier / toevoeg-knop ───────────────────────────── */}
      <div className="px-5 pb-3 pt-1">
        {showAddForm ? (
          <BudgetItemForm
            bucket={summary.bucket}
            onSuccess={() => setShowAddForm(false)}
            onCancel={() => setShowAddForm(false)}
          />
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-xs font-medium text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-900/50 transition w-full"
          >
            <span className="flex h-4 w-4 items-center justify-center rounded-md bg-stone-100 dark:bg-stone-900 text-stone-500 dark:text-stone-400 text-xs leading-none shrink-0">
              +
            </span>
            Post toevoegen
          </button>
        )}
      </div>
    </div>
  )
}

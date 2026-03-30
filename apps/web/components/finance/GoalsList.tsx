'use client'

import { useState } from 'react'
import { useFinanceGoals, useArchiveGoal } from '@/hooks/useFinance'
import { GoalCard } from './GoalCard'
import { GoalForm } from './GoalForm'

export function GoalsList() {
  const { data: goals, isLoading } = useFinanceGoals()
  const archiveGoal = useArchiveGoal()
  const [showForm, setShowForm] = useState(false)

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-[120px] rounded-2xl bg-stone-100 dark:bg-stone-900 animate-pulse" />
        ))}
      </div>
    )
  }

  const allSameCurrency = goals ? new Set(goals.map((g) => g.currency)).size === 1 : false
  const fmt = allSameCurrency && goals?.length
    ? new Intl.NumberFormat('nl-NL', { style: 'currency', currency: goals[0].currency, maximumFractionDigits: 0 })
    : null
  const totalSaved  = goals ? goals.reduce((s, g) => s + g.current_amount, 0) : 0
  const totalTarget = goals ? goals.reduce((s, g) => s + g.target_amount, 0) : 0
  const completed   = goals ? goals.filter((g) => g.completed_at !== null).length : 0

  return (
    <div className="space-y-3">
      {goals && goals.length > 0 && (
        <div className="flex items-center divide-x divide-stone-100 dark:divide-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0F0F0F] overflow-hidden">
          <div className="flex-1 px-5 py-3.5">
            <p className="text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-wide mb-0.5">Totaal gespaard</p>
            <p className="text-sm font-semibold text-stone-950 dark:text-white">
              {fmt ? fmt.format(totalSaved) : `${goals.length} valuta's`}
            </p>
          </div>
          <div className="flex-1 px-5 py-3.5">
            <p className="text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-wide mb-0.5">Totaal doel</p>
            <p className="text-sm font-semibold text-stone-950 dark:text-white">
              {fmt ? fmt.format(totalTarget) : '—'}
            </p>
          </div>
          <div className="flex-1 px-5 py-3.5">
            <p className="text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-wide mb-0.5">Behaald</p>
            <p className="text-sm font-semibold text-stone-950 dark:text-white">
              {completed} / {goals.length}
            </p>
          </div>
        </div>
      )}

      {goals && goals.length > 0 ? (
        goals.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            onArchive={() => archiveGoal.mutate(goal.id)}
          />
        ))
      ) : !showForm ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-200 dark:border-stone-800 py-10 text-center">
          <p className="text-sm font-medium text-stone-500 dark:text-stone-400">Nog geen doelen</p>
          <p className="text-xs text-stone-400 dark:text-stone-600 mt-1">
            Stel een financieel doel in, zoals een noodfonds of een vakantiebudget
          </p>
        </div>
      ) : null}

      {showForm ? (
        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0F0F0F] p-5">
          <p className="text-sm font-medium mb-4">Doel toevoegen</p>
          <GoalForm
            onSuccess={() => setShowForm(false)}
            onCancel={() => setShowForm(false)}
          />
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 py-3 text-sm text-stone-500 dark:text-stone-400 hover:border-accent hover:text-accent transition"
        >
          + Doel toevoegen
        </button>
      )}
    </div>
  )
}

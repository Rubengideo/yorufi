'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { FinanceGoalWithProgress } from '@habit-tracker/types'
import { useUpdateGoal } from '@/hooks/useFinance'
import { useCreateExpense } from '@/hooks/useExpenses'
import { GoalForm } from './GoalForm'

interface GoalCardProps {
  goal: FinanceGoalWithProgress
  onArchive: () => void
}

function getOnTrackStatus(goal: FinanceGoalWithProgress): { label: string; cls: string } | null {
  if (!goal.deadline || goal.completed_at || goal.is_overdue) return null
  const created = new Date(goal.created_at).getTime()
  const deadline = new Date(goal.deadline + 'T12:00:00').getTime()
  const now = Date.now()
  const totalMs = deadline - created
  if (totalMs <= 0) return null
  const elapsedMs = Math.max(now - created, 0)
  const expectedPct = Math.min(Math.round((elapsedMs / totalMs) * 100), 100)
  const actualPct = Math.round(goal.progress * 100)
  if (actualPct >= expectedPct - 5) return { label: 'Op schema', cls: 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400' }
  if (actualPct >= expectedPct - 20) return { label: 'Bijna op schema', cls: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400' }
  return { label: 'Achter schema', cls: 'bg-red-50 dark:bg-red-950/30 text-red-500' }
}

function getMonthsRemaining(deadline: string): number {
  const ms = new Date(deadline + 'T12:00:00').getTime() - Date.now()
  return Math.max(Math.ceil(ms / (1000 * 60 * 60 * 24 * 30)), 0)
}

export function GoalCard({ goal, onArchive }: GoalCardProps) {
  const [showEdit, setShowEdit] = useState(false)
  const [showContribute, setShowContribute] = useState(false)
  const [contribution, setContribution] = useState('')
  const updateGoal = useUpdateGoal()
  const createExpense = useCreateExpense()

  function handleContribute(e: React.FormEvent) {
    e.preventDefault()
    const amount = parseFloat(contribution.replace(',', '.'))
    if (!amount || amount <= 0) return
    updateGoal.mutate(
      { id: goal.id, input: { current_amount: goal.current_amount + amount } },
      {
        onSuccess: () => {
          createExpense.mutate({
            amount,
            category: 'sparen',
            description: goal.name,
            date: new Date().toISOString().slice(0, 10),
          })
          setShowContribute(false)
          setContribution('')
        },
      },
    )
  }

  const fmt = new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: goal.currency,
    maximumFractionDigits: 0,
  })

  const progressPct = Math.round(goal.progress * 100)
  const onTrack = getOnTrackStatus(goal)
  const monthsLeft = goal.deadline && !goal.completed_at ? getMonthsRemaining(goal.deadline) : null

  if (showEdit) {
    return (
      <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0F0F0F] p-5">
        <p className="text-sm font-medium mb-4">Doel bewerken</p>
        <GoalForm
          goal={goal}
          onSuccess={() => setShowEdit(false)}
          onCancel={() => setShowEdit(false)}
        />
      </div>
    )
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0F0F0F] px-5 py-4 space-y-3"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        {/* Icoon */}
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
          style={{ backgroundColor: goal.color ? `${goal.color}20` : undefined }}
        >
          {goal.icon ?? '🎯'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-stone-950 dark:text-white truncate">
              {goal.name}
            </p>
            {goal.completed_at && (
              <span className="text-xs rounded-full bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400 px-2 py-0.5">
                ✓ Behaald
              </span>
            )}
            {goal.is_overdue && (
              <span className="text-xs rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 px-2 py-0.5">
                Verlopen
              </span>
            )}
            {onTrack && (
              <span className={`text-[10px] font-semibold rounded-full px-2 py-0.5 ${onTrack.cls}`}>
                {onTrack.label}
              </span>
            )}
          </div>
          {goal.description && (
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5 truncate">
              {goal.description}
            </p>
          )}
        </div>

        {/* Acties */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setShowEdit(true)}
            title="Bewerken"
            className="rounded-lg p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-900 transition"
          >
            ✎
          </button>
          <button
            onClick={() => {
              if (confirm(`Weet je zeker dat je "${goal.name}" wilt archiveren?`)) {
                onArchive()
              }
            }}
            title="Archiveren"
            className="rounded-lg p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Voortgangsbalk */}
      <div className="space-y-1.5">
        <div className="h-2 w-full rounded-full bg-stone-100 dark:bg-stone-900 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: goal.color ?? '#6C63FF' }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-stone-400 dark:text-stone-500">
          <span>{fmt.format(goal.current_amount)}</span>
          <span className="font-medium">{progressPct}%</span>
          <span>{fmt.format(goal.target_amount)}</span>
        </div>
      </div>

      {/* Bijdrage toevoegen */}
      {!goal.completed_at && (
        showContribute ? (
          <form onSubmit={handleContribute} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-xl border border-stone-200 dark:border-stone-800 px-3 py-2 flex-1">
              <span className="text-xs text-stone-400">€</span>
              <input
                autoFocus
                type="text"
                inputMode="decimal"
                value={contribution}
                onChange={(e) => setContribution(e.target.value)}
                placeholder="0"
                className="flex-1 bg-transparent text-sm text-stone-950 dark:text-white outline-none placeholder:text-stone-300 dark:placeholder:text-stone-700 w-0 min-w-0"
              />
            </div>
            <button
              type="submit"
              disabled={updateGoal.isPending}
              className="rounded-xl bg-stone-950 dark:bg-white text-white dark:text-stone-950 px-3 py-2 text-xs font-medium disabled:opacity-50 transition"
            >
              Toevoegen
            </button>
            <button
              type="button"
              onClick={() => { setShowContribute(false); setContribution('') }}
              className="rounded-xl px-3 py-2 text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition"
            >
              Annuleer
            </button>
          </form>
        ) : (
          <button
            onClick={() => setShowContribute(true)}
            className="flex items-center gap-1.5 text-xs text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-stone-100 dark:bg-stone-900 text-stone-500 dark:text-stone-400 text-sm leading-none">＋</span>
            Bijdrage toevoegen
          </button>
        )
      )}

      {/* Deadline + maanden resterend */}
      {goal.deadline && (
        <div className="flex items-center justify-between text-xs text-stone-400 dark:text-stone-500">
          <span>
            Deadline: {new Date(goal.deadline + 'T12:00:00').toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
            {!goal.completed_at && (
              <span className="ml-1">— nog {fmt.format(goal.remaining)} te gaan</span>
            )}
          </span>
          {monthsLeft !== null && monthsLeft > 0 && !goal.completed_at && (
            <span className="shrink-0 ml-2">~{monthsLeft} mnd</span>
          )}
        </div>
      )}
    </motion.div>
  )
}

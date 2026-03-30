'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useNetWorth, useFinanceGoals } from '@/hooks/useFinance'
import { useBudgetSummary } from '@/hooks/useBudget'
import { NetWorthCard } from './NetWorthCard'
import { AccountsList } from './AccountsList'
import { ExpenseDashboardCard } from './ExpenseDashboardCard'

export function FinanceDashboard() {
  const { data: netWorth, isLoading } = useNetWorth()
  const now = new Date()
  const { data: goals } = useFinanceGoals()
  const { data: budgetSummary } = useBudgetSummary({ year: now.getFullYear(), month: now.getMonth() + 1 })

  const allSameCurrency = goals ? new Set(goals.map((g) => g.currency)).size === 1 : false
  const goalFmt = allSameCurrency && goals?.length
    ? new Intl.NumberFormat('nl-NL', { style: 'currency', currency: goals[0].currency, maximumFractionDigits: 0 })
    : null
  const totalSaved  = goals ? goals.reduce((s, g) => s + g.current_amount, 0) : 0
  const totalTarget = goals ? goals.reduce((s, g) => s + g.target_amount, 0) : 0
  const goalPct     = totalTarget > 0 ? Math.min((totalSaved / totalTarget) * 100, 100) : 0
  const activeGoals = goals ? goals.filter((g) => !g.completed_at).length : 0

  const budgetFmt = budgetSummary
    ? new Intl.NumberFormat('nl-NL', { style: 'currency', currency: budgetSummary.currency, maximumFractionDigits: 0 })
    : null
  const budgetRemaining = budgetSummary?.total_remaining ?? null

  return (
    <div className="space-y-8">

      {/* ── Vermogen ─────────────────────────────────────────────── */}
      <section className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wide text-stone-400 dark:text-stone-500">
          Vermogen
        </p>
        {isLoading ? (
          <div className="h-40 rounded-2xl bg-stone-100 dark:bg-stone-900 animate-pulse" />
        ) : netWorth ? (
          <NetWorthCard summary={netWorth} />
        ) : null}
      </section>

      {/* ── Rekeningen ───────────────────────────────────────────── */}
      <section className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wide text-stone-400 dark:text-stone-500">
          Rekeningen
        </p>
        <AccountsList />
      </section>

      {/* ── Uitgaven + Doelen + Budget ───────────────────────────── */}
      <section className="space-y-4">
        <p className="text-xs font-medium uppercase tracking-wide text-stone-400 dark:text-stone-500">
          Overzicht
        </p>

        {/* Uitgaven kaart */}
        <ExpenseDashboardCard />

        {/* Doelen + Budget links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Goals card */}
        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0F0F0F] px-5 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-stone-950 dark:text-white">Financiële doelen</p>
              {goals ? (
                <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
                  {activeGoals} actief{activeGoals !== 1 ? 'e' : ''} doel{activeGoals !== 1 ? 'en' : ''}
                </p>
              ) : (
                <div className="h-3 w-24 rounded bg-stone-100 dark:bg-stone-900 animate-pulse mt-1" />
              )}
            </div>
            <Link
              href="/finance/goals"
              className="rounded-xl bg-stone-100 dark:bg-stone-900 px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 transition shrink-0"
            >
              Bekijken →
            </Link>
          </div>
          {goals && goals.length > 0 && goalFmt && (
            <div className="space-y-1.5">
              <div className="h-1.5 w-full rounded-full bg-stone-100 dark:bg-stone-900 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-[#6C63FF]"
                  initial={{ width: 0 }}
                  animate={{ width: `${goalPct}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-stone-400 dark:text-stone-500">
                <span>{goalFmt.format(totalSaved)} gespaard</span>
                <span>{Math.round(goalPct)}%</span>
                <span>{goalFmt.format(totalTarget)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Budget card */}
        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0F0F0F] px-5 py-4 space-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-stone-950 dark:text-white">Maandbudget</p>
              {budgetSummary ? (
                <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
                  50/30/20 — nodig, sparen & leuk
                </p>
              ) : (
                <div className="h-3 w-32 rounded bg-stone-100 dark:bg-stone-900 animate-pulse mt-1" />
              )}
            </div>
            <Link
              href="/finance/budget"
              className="rounded-xl bg-stone-100 dark:bg-stone-900 px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 transition shrink-0"
            >
              Bekijken →
            </Link>
          </div>
          {budgetFmt && budgetRemaining !== null && (
            <div className="pt-1">
              <p className="text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-wide">
                {budgetRemaining >= 0 ? 'Vrij te plannen' : 'Over budget'}
              </p>
              <p className={`text-base font-semibold ${budgetRemaining < 0 ? 'text-red-500' : 'text-stone-950 dark:text-white'}`}>
                {budgetFmt.format(Math.abs(budgetRemaining))}
              </p>
            </div>
          )}
        </div>
        </div>{/* /grid */}
      </section>
    </div>
  )
}

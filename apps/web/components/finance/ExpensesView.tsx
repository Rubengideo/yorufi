'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useExpenses, useMonthlySummary } from '@/hooks/useExpenses'
import type { Expense } from '@habit-tracker/types'
import { EXPENSE_CATEGORIES } from '@habit-tracker/types'
import { MonthNavigator } from './MonthNavigator'
import { ExpenseSummary } from './ExpenseSummary'
import { CategoryBreakdown } from './CategoryBreakdown'
import { ExpensesList } from './ExpensesList'
import { ExpenseForm } from './ExpenseForm'

function downloadExpensesCSV(expenses: Expense[], year: number, month: number) {
  const headers = ['Datum', 'Categorie', 'Omschrijving', 'Bedrag', 'Valuta']
  const rows = expenses.map((e) => [
    e.date,
    EXPENSE_CATEGORIES.find((c) => c.value === e.category)?.label ?? e.category,
    e.description ?? '',
    e.amount.toFixed(2).replace('.', ','),
    e.currency,
  ])
  const csv = [headers, ...rows]
    .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
    .join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `uitgaven-${year}-${String(month).padStart(2, '0')}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function ExpensesView() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [showAddForm, setShowAddForm] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear  = month === 1 ? year - 1 : year

  const { data: expenses, isLoading: expensesLoading } = useExpenses(year, month)
  const { data: summary, isLoading: summaryLoading } = useMonthlySummary(year, month)
  const { data: prevSummary } = useMonthlySummary(prevYear, prevMonth)

  function handleMonthChange(y: number, m: number) {
    setYear(y)
    setMonth(m)
    setShowAddForm(false)
    setActiveCategory(null)
    setSearchQuery('')
  }

  const filteredExpenses = (expenses ?? []).filter((e) => {
    if (activeCategory && e.category !== activeCategory) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return e.description?.toLowerCase().includes(q) ?? false
    }
    return true
  })

  return (
    <div className="space-y-4">
      {/* Maandnavigatie + CSV export + importeer-knop */}
      <div className="flex items-center justify-between gap-3">
        <MonthNavigator year={year} month={month} onChange={handleMonthChange} />
        <div className="flex items-center gap-2 shrink-0">
          {expenses && expenses.length > 0 && (
            <button
              onClick={() => downloadExpensesCSV(expenses, year, month)}
              className="flex items-center gap-1.5 rounded-xl border border-stone-200 dark:border-stone-800 px-3 py-2 text-xs font-medium text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-900 hover:text-stone-700 dark:hover:text-stone-200 transition"
            >
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 1v7M3 5l3 3 3-3M1.5 10.5h9" />
              </svg>
              CSV
            </button>
          )}
          <Link
            href="/finance/expenses/import"
            className="flex items-center gap-1.5 rounded-xl border border-stone-200 dark:border-stone-800 px-3 py-2 text-xs font-medium text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-900 hover:text-stone-700 dark:hover:text-stone-200 transition"
          >
            <span className="text-sm leading-none">↑</span>
            Importeren
          </Link>
        </div>
      </div>

      {/* Zoekbalk */}
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-600"
          width="13" height="13" viewBox="0 0 14 14" fill="none"
          stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        >
          <circle cx="6" cy="6" r="4.5" />
          <path d="M10 10l2.5 2.5" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Zoek op omschrijving…"
          className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0F0F0F] pl-8 pr-8 py-2.5 text-sm text-stone-950 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-600 outline-none focus:border-stone-400 dark:focus:border-stone-600 transition"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition text-xs leading-none"
          >
            ✕
          </button>
        )}
      </div>

      {/* Totaal + vergelijking vorige maand */}
      <ExpenseSummary summary={summary ?? null} isLoading={summaryLoading} />

      {/* Per categorie — klikbaar voor drill-down */}
      <CategoryBreakdown
        summary={summary ?? null}
        prevSummary={prevSummary ?? null}
        isLoading={summaryLoading}
        onCategoryClick={setActiveCategory}
        activeCategory={activeCategory}
      />

      {/* Filter indicatie */}
      {(activeCategory || searchQuery.trim()) && (
        <div className="flex items-center gap-2 px-1 flex-wrap">
          {activeCategory && (
            <span className="flex items-center gap-1.5 text-xs text-stone-400 dark:text-stone-500">
              Categorie:{' '}
              <strong className="text-stone-700 dark:text-stone-300">
                {EXPENSE_CATEGORIES.find((c) => c.value === activeCategory)?.label}
              </strong>
              <button
                onClick={() => setActiveCategory(null)}
                className="text-[10px] hover:text-stone-600 dark:hover:text-stone-300 transition"
              >
                ✕
              </button>
            </span>
          )}
          {searchQuery.trim() && (
            <span className="text-xs text-stone-400 dark:text-stone-500">
              {filteredExpenses.length} resultaat{filteredExpenses.length !== 1 ? 'en' : ''} voor{' '}
              <strong className="text-stone-700 dark:text-stone-300">"{searchQuery}"</strong>
            </span>
          )}
        </div>
      )}

      {/* Lijst per dag */}
      <ExpensesList expenses={filteredExpenses} isLoading={expensesLoading} />

      {/* Uitgave toevoegen */}
      <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0F0F0F] overflow-hidden">
        {showAddForm ? (
          <div className="px-4 py-4">
            <ExpenseForm
              onSuccess={() => setShowAddForm(false)}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full flex items-center gap-2 px-5 py-4 text-sm font-medium text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-900/50 transition text-left"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-100 dark:bg-stone-900 text-stone-500 dark:text-stone-400 text-base leading-none">
              +
            </span>
            Uitgave toevoegen
          </button>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useBudgetSummary, useBudgetSettings } from '@/hooks/useBudget'
import { BudgetAllocationTable } from './BudgetAllocationTable'
import { BudgetDonutChart } from './BudgetDonutChart'
import { BudgetBucketCard } from './BudgetBucketCard'
import { BudgetSettingsPanel } from './BudgetSettingsPanel'
import { ApplyRecurringModal } from './ApplyRecurringModal'
import { useBudgetItems } from '@/hooks/useBudget'

const MAANDEN = [
  'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
  'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December',
]

export function BudgetView() {
  const now = new Date()
  const [showSettings, setShowSettings] = useState(false)
  const [showRecurring, setShowRecurring] = useState(false)
  const [viewYear,  setViewYear]  = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1)

  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth() + 1

  const { data: summary, isLoading: summaryLoading } = useBudgetSummary({ year: viewYear, month: viewMonth })
  const { data: settings } = useBudgetSettings()
  const { data: budgetItems = [] } = useBudgetItems()
  const hasRecurring = budgetItems.some((i) => i.is_recurring)

  function prevMonth() {
    if (viewMonth === 1) { setViewYear((y) => y - 1); setViewMonth(12) }
    else setViewMonth((m) => m - 1)
  }

  function nextMonth() {
    if (isCurrentMonth) return
    if (viewMonth === 12) { setViewYear((y) => y + 1); setViewMonth(1) }
    else setViewMonth((m) => m + 1)
  }

  if (summaryLoading || !summary) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-9 w-52 rounded-xl bg-stone-100 dark:bg-stone-900 animate-pulse" />
          <div className="h-9 w-32 rounded-xl bg-stone-100 dark:bg-stone-900 animate-pulse" />
        </div>
        <div className="h-56 rounded-2xl bg-stone-100 dark:bg-stone-900 animate-pulse" />
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-stone-100 dark:bg-stone-900 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  // Gedeelde header voor alle staten
  const header = (
    <div className="flex items-center justify-between gap-3">
      {/* Maand-navigatie */}
      <div className="flex items-center gap-1">
        <button
          onClick={prevMonth}
          className="rounded-lg p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
          aria-label="Vorige maand"
        >
          ←
        </button>
        <span className="text-sm font-semibold text-stone-900 dark:text-white w-40 text-center select-none">
          {MAANDEN[viewMonth - 1]} {viewYear}
        </span>
        <button
          onClick={nextMonth}
          disabled={isCurrentMonth}
          className="rounded-lg p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition disabled:opacity-30 disabled:pointer-events-none"
          aria-label="Volgende maand"
        >
          →
        </button>
      </div>

      {/* Knoppen rechts */}
      <div className="flex items-center gap-2">
        {hasRecurring && isCurrentMonth && (
          <button
            onClick={() => setShowRecurring(true)}
            className="flex items-center gap-2 rounded-xl border border-stone-200 dark:border-stone-800 px-4 py-2 text-sm font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-900 transition"
          >
            <span className="text-base leading-none">↺</span>
            Vaste lasten
          </button>
        )}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-2 rounded-xl border border-stone-200 dark:border-stone-800 px-4 py-2 text-sm font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-900 transition"
        >
          <span className="text-base leading-none">⚙</span>
          Instellingen
        </button>
      </div>
    </div>
  )

  // Lege staat: inkomen nog niet ingesteld
  if (summary.monthly_income === 0) {
    return (
      <div className="space-y-4">
        {header}
        {settings && (
          <BudgetSettingsPanel
            settings={settings}
            open={showSettings}
            onClose={() => setShowSettings(false)}
          />
        )}
        <div className="rounded-2xl border-2 border-dashed border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0F0F0F] px-8 py-16 flex flex-col items-center gap-4 text-center">
          <div className="h-12 w-12 rounded-2xl bg-stone-100 dark:bg-stone-900 flex items-center justify-center text-2xl select-none">
            💰
          </div>
          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-stone-900 dark:text-white">
              Stel je maandinkomen in
            </p>
            <p className="text-xs text-stone-400 dark:text-stone-500 max-w-xs">
              Het budget gebruikt het 50/30/20 model. Vul je netto maandinkomen
              in en pas de percentages aan naar jouw situatie.
            </p>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent/90 transition"
          >
            Aan de slag
          </button>
        </div>
      </div>
    )
  }

  const fmt = new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: summary.currency,
    maximumFractionDigits: 0,
  })

  return (
    <div className="space-y-4">
      {header}

      {/* Vaste lasten modal */}
      {showRecurring && (
        <ApplyRecurringModal
          year={viewYear}
          month={viewMonth}
          onClose={() => setShowRecurring(false)}
        />
      )}

      {/* Uitklapbaar instellingenpaneel */}
      {settings && (
        <BudgetSettingsPanel
          settings={settings}
          open={showSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Inkomen-overzicht strip */}
      <div className="flex items-center divide-x divide-stone-100 dark:divide-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0F0F0F] overflow-hidden">
        <div className="flex-1 px-5 py-3.5">
          <p className="text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-wide mb-0.5">Maandinkomen</p>
          <p className="text-sm font-semibold text-stone-950 dark:text-white">{fmt.format(summary.monthly_income)}</p>
        </div>
        <div className="flex-1 px-5 py-3.5">
          <p className="text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-wide mb-0.5">Gepland</p>
          <p className="text-sm font-semibold text-stone-950 dark:text-white">{fmt.format(summary.total_budgeted)}</p>
        </div>
        <div className="flex-1 px-5 py-3.5">
          <p className="text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-wide mb-0.5">
            {summary.total_remaining >= 0 ? 'Vrij te plannen' : 'Over budget'}
          </p>
          <p className={`text-sm font-semibold ${summary.total_remaining < 0 ? 'text-red-500' : 'text-stone-950 dark:text-white'}`}>
            {fmt.format(Math.abs(summary.total_remaining))}
          </p>
        </div>
      </div>

      {/* Hoofd-card: allocatietabel + donutgrafiek naast elkaar */}
      <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0F0F0F] overflow-hidden">
        <div className="flex items-stretch gap-0">
          <BudgetAllocationTable summary={summary} />
          <div className="flex items-center justify-center p-4 border-l border-stone-100 dark:border-stone-900 shrink-0">
            <BudgetDonutChart summary={summary} />
          </div>
        </div>
      </div>

      {/* Drie-kolommen bucket-kaarten */}
      <div className="space-y-3">
        <BudgetBucketCard summary={summary.needs}   currency={summary.currency} />
        <BudgetBucketCard summary={summary.savings} currency={summary.currency} />
        <BudgetBucketCard summary={summary.wants}   currency={summary.currency} />
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import type { NetWorthSummary } from '@habit-tracker/types'
import { useNetWorthHistory, useFinanceAccounts } from '@/hooks/useFinance'
import { NetWorthChart } from './NetWorthChart'

interface NetWorthCardProps {
  summary: NetWorthSummary
}

type Range = '30d' | '90d' | '1j' | 'alles'

const RANGE_LABELS: Record<Range, string> = {
  '30d':   '30d',
  '90d':   '90d',
  '1j':    '1 jaar',
  'alles': 'Alles',
}

const TYPE_LABELS: Record<string, string> = {
  bank:       'Bank',
  investment: 'Beleggingen',
  crypto:     'Crypto',
  other:      'Overig',
}

const TYPE_COLORS: Record<string, string> = {
  bank:       '#3B82F6',
  investment: '#22C55E',
  crypto:     '#F59E0B',
  other:      '#78716C',
}

function getFromDate(range: Range): string {
  const d = new Date()
  if (range === '30d')   d.setDate(d.getDate() - 30)
  if (range === '90d')   d.setDate(d.getDate() - 90)
  if (range === '1j')    d.setFullYear(d.getFullYear() - 1)
  if (range === 'alles') d.setFullYear(d.getFullYear() - 5)
  return d.toISOString().slice(0, 10)
}

function getToday() {
  return new Date().toISOString().slice(0, 10)
}

const fmt = new Intl.NumberFormat('nl-NL', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

function formatPct(v: number) {
  return `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`
}

export function NetWorthCard({ summary }: NetWorthCardProps) {
  const [range, setRange] = useState<Range>('90d')

  const from = getFromDate(range)
  const to   = getToday()
  const { data: history } = useNetWorthHistory(from, to)
  const { data: accounts } = useFinanceAccounts()

  const currencies = Object.entries(summary.by_currency).filter(([, v]) => v !== 0)

  // Periode-verandering
  const firstPoint = history?.[0]
  const lastPoint  = history?.[history.length - 1]
  const delta      = firstPoint && lastPoint ? lastPoint.total - firstPoint.total : null
  const deltaPct   = delta !== null && firstPoint && firstPoint.total !== 0
    ? (delta / Math.abs(firstPoint.total)) * 100
    : null

  const hasLiabilities = summary.total_liabilities > 0

  // Asset-type verdeling (alleen EUR bezittingen met saldo > 0)
  const eurAssets = accounts?.filter((a) => !a.is_liability && a.currency === 'EUR' && a.balance > 0) ?? []
  const typeTotals = eurAssets.reduce<Record<string, number>>((acc, a) => {
    acc[a.type] = (acc[a.type] ?? 0) + a.balance
    return acc
  }, {})
  const totalEurAssets = Object.values(typeTotals).reduce((s, v) => s + v, 0)
  const typeEntries = Object.entries(typeTotals).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1])
  const showTypeBreakdown = typeEntries.length > 1 && totalEurAssets > 0

  return (
    <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0F0F0F] px-6 py-5">

      {/* Totaal */}
      <div className="flex items-start justify-between mb-1">
        <div>
          <p className="text-xs text-stone-400 dark:text-stone-500 font-medium uppercase tracking-wide">
            Netto vermogen
          </p>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-stone-950 dark:text-white">
            {fmt.format(summary.total)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-stone-400 dark:text-stone-500">
            {summary.account_count} rekening{summary.account_count !== 1 ? 'en' : ''}
          </p>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
            Peildatum: {new Date(summary.as_of + 'T12:00:00').toLocaleDateString('nl-NL')}
          </p>
        </div>
      </div>

      {/* Bezittingen / Schulden breakdown */}
      {hasLiabilities && (
        <div className="flex gap-4 mt-3 mb-1">
          <div>
            <p className="text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-wide">Bezittingen</p>
            <p className="text-sm font-medium text-stone-950 dark:text-white mt-0.5">
              {fmt.format(summary.gross_assets)}
            </p>
          </div>
          <div className="w-px bg-stone-200 dark:bg-stone-800" />
          <div>
            <p className="text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-wide">Schulden</p>
            <p className="text-sm font-medium text-red-500 dark:text-red-400 mt-0.5">
              −{fmt.format(summary.total_liabilities)}
            </p>
          </div>
        </div>
      )}

      {/* Asset-type verdeling */}
      {showTypeBreakdown && (
        <div className="mt-3 space-y-1.5">
          <p className="text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-wide">Verdeling (EUR)</p>
          <div className="flex gap-3 flex-wrap">
            {typeEntries.map(([type, amount]) => {
              const pct = Math.round((amount / totalEurAssets) * 100)
              return (
                <span key={type} className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: TYPE_COLORS[type] ?? '#78716C' }}
                  />
                  {TYPE_LABELS[type] ?? type}
                  <span className="font-semibold text-stone-700 dark:text-stone-300">{pct}%</span>
                </span>
              )
            })}
          </div>
          {/* Gestapelde kleurenbalk */}
          <div className="h-1.5 w-full rounded-full overflow-hidden flex">
            {typeEntries.map(([type, amount]) => (
              <div
                key={type}
                className="h-full"
                style={{
                  width: `${(amount / totalEurAssets) * 100}%`,
                  backgroundColor: TYPE_COLORS[type] ?? '#78716C',
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Per valuta (alleen bij multi-currency) */}
      {currencies.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-4 mt-3">
          {currencies.map(([currency, amount]) => (
            <span
              key={currency}
              className="text-xs rounded-full bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 px-2.5 py-1"
            >
              {currency}: {new Intl.NumberFormat('nl-NL', {
                style: 'currency',
                currency,
                maximumFractionDigits: 0,
              }).format(amount)}
            </span>
          ))}
        </div>
      )}

      {/* Grafiek */}
      <div className="mt-4 border-t border-stone-100 dark:border-stone-900 pt-4">
        {/* Header: tijdspan + periode-delta */}
        <div className="flex items-center justify-between mb-3">
          {/* Periode-verandering */}
          <div className="h-5">
            {delta !== null && deltaPct !== null && delta !== 0 && history && history.length > 1 && (
              <span className={`text-xs font-medium ${delta >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {delta >= 0 ? '↑' : '↓'} {fmt.format(Math.abs(delta))} ({formatPct(deltaPct)})
              </span>
            )}
          </div>

          {/* Tijdspan knoppen */}
          <div className="flex gap-1">
            {(Object.keys(RANGE_LABELS) as Range[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                  range === r
                    ? 'bg-accent text-white'
                    : 'text-stone-400 dark:text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-900'
                }`}
              >
                {RANGE_LABELS[r]}
              </button>
            ))}
          </div>
        </div>

        {history && history.length >= 2
          ? <NetWorthChart data={history} />
          : (
            <div className="flex h-32 items-center justify-center text-sm text-stone-400 dark:text-stone-600">
              Voeg meer saldo-updates toe om de grafiek te zien
            </div>
          )
        }
      </div>
    </div>
  )
}

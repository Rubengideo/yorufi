'use client'

import { useState } from 'react'
import type { FinanceAccount } from '@habit-tracker/types'
import { useRecordSnapshot } from '@/hooks/useFinance'

interface SnapshotModalProps {
  account: FinanceAccount
  onClose: () => void
}

function formatBalance(amount: number, currency: string) {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency }).format(amount)
}

function relativeDate(isoString: string): string {
  const now = new Date()
  const then = new Date(isoString)
  const diffDays = Math.floor((now.getTime() - then.getTime()) / 86_400_000)
  if (diffDays === 0) return 'vandaag'
  if (diffDays === 1) return 'gisteren'
  if (diffDays < 7) return `${diffDays} dagen geleden`
  return then.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function SnapshotModal({ account, onClose }: SnapshotModalProps) {
  const recordSnapshot = useRecordSnapshot()

  const today = new Date().toISOString().slice(0, 10)
  const [balance, setBalance] = useState(account.balance.toString())
  const [note, setNote] = useState('')
  const [date, setDate] = useState(today)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    try {
      await recordSnapshot.mutateAsync({
        account_id: account.id,
        balance: parseFloat(balance),
        date,
        note: note || null,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0F0F0F] p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold">Saldo bijwerken</h2>
            <p className="text-sm text-stone-400 dark:text-stone-500 mt-0.5">
              {account.icon && <span className="mr-1">{account.icon}</span>}
              {account.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Saldo */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Nieuw saldo ({account.currency})
            </label>
            <input
              required
              type="number"
              step="0.01"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1A1A1A] px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition"
            />
            <p className="text-xs text-stone-400">
              Huidig: {formatBalance(account.balance, account.currency)}
              <span className="ml-1.5 text-stone-300 dark:text-stone-600">·</span>
              <span className="ml-1.5">opgeslagen {relativeDate(account.updated_at)}</span>
            </p>
          </div>

          {/* Datum */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Datum</label>
            <input
              type="date"
              value={date}
              max={today}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1A1A1A] px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition"
            />
          </div>

          {/* Notitie */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Notitie <span className="text-stone-400">(optioneel)</span>
            </label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Bijv. na dividenduitkering"
              maxLength={280}
              className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1A1A1A] px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-stone-200 dark:border-stone-800 px-4 py-2.5 text-sm font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-900 transition"
            >
              Annuleren
            </button>
            <button
              type="submit"
              disabled={recordSnapshot.isPending}
              className="flex-1 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent/90 disabled:opacity-60 transition"
            >
              {recordSnapshot.isPending ? 'Opslaan…' : 'Opslaan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useFinanceAccounts, useArchiveAccount } from '@/hooks/useFinance'
import { AccountCard } from './AccountCard'
import { AccountForm } from './AccountForm'

type AddingMode = 'asset' | 'liability' | null

export function AccountsList() {
  const { data: accounts, isLoading } = useFinanceAccounts()
  const archiveAccount = useArchiveAccount()
  const [adding, setAdding] = useState<AddingMode>(null)

  const assets      = accounts?.filter((a) => !a.is_liability) ?? []
  const liabilities = accounts?.filter((a) => a.is_liability) ?? []

  const fmt = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
  const assetTotal      = assets.reduce((s, a) => s + (a.currency === 'EUR' ? Number(a.balance) : 0), 0)
  const liabilityTotal  = liabilities.reduce((s, a) => s + (a.currency === 'EUR' ? Number(a.balance) : 0), 0)
  const hasNonEurAssets      = assets.some((a) => a.currency !== 'EUR')
  const hasNonEurLiabilities = liabilities.some((a) => a.currency !== 'EUR')

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-[72px] rounded-2xl bg-stone-100 dark:bg-stone-900 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* ── Bezittingen ─────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-stone-400 dark:text-stone-500">
            Bezittingen
          </p>
          {assets.length > 0 && (
            <div className="flex items-baseline gap-1.5">
              <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                {fmt.format(assetTotal)}
              </p>
              {hasNonEurAssets && (
                <span className="text-[10px] text-stone-400 dark:text-stone-600">excl. vreemde valuta</span>
              )}
            </div>
          )}
        </div>

        {assets.length > 0
          ? assets.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                onArchive={() => archiveAccount.mutate(account.id)}
              />
            ))
          : adding !== 'asset' && (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-200 dark:border-stone-800 py-8 text-center">
                <p className="text-sm font-medium text-stone-500 dark:text-stone-400">Nog geen bezittingen</p>
                <p className="text-xs text-stone-400 dark:text-stone-600 mt-1">
                  Voeg een bankrekening, beleggingen of crypto toe
                </p>
              </div>
            )
        }

        {adding === 'asset' ? (
          <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0F0F0F] p-5">
            <p className="text-sm font-medium mb-4">Bezitting toevoegen</p>
            <AccountForm
              defaultIsLiability={false}
              onSuccess={() => setAdding(null)}
              onCancel={() => setAdding(null)}
            />
          </div>
        ) : (
          <button
            onClick={() => setAdding('asset')}
            className="w-full rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 py-3 text-sm text-stone-500 dark:text-stone-400 hover:border-accent hover:text-accent transition"
          >
            + Bezitting toevoegen
          </button>
        )}
      </div>

      {/* ── Schulden ────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-stone-400 dark:text-stone-500">
            Schulden
          </p>
          {liabilities.length > 0 && (
            <div className="flex items-baseline gap-1.5">
              <p className="text-xs font-semibold text-red-500 dark:text-red-400">
                −{fmt.format(liabilityTotal)}
              </p>
              {hasNonEurLiabilities && (
                <span className="text-[10px] text-stone-400 dark:text-stone-600">excl. vreemde valuta</span>
              )}
            </div>
          )}
        </div>

        {liabilities.length > 0
          ? liabilities.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                onArchive={() => archiveAccount.mutate(account.id)}
              />
            ))
          : adding !== 'liability' && (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-red-100 dark:border-red-900/30 py-8 text-center">
                <p className="text-sm font-medium text-stone-500 dark:text-stone-400">Nog geen schulden</p>
                <p className="text-xs text-stone-400 dark:text-stone-600 mt-1">
                  Voeg een studielening, hypotheek of andere schuld toe
                </p>
              </div>
            )
        }

        {adding === 'liability' ? (
          <div className="rounded-2xl border border-red-200 dark:border-red-900/40 bg-white dark:bg-[#0F0F0F] p-5">
            <p className="text-sm font-medium mb-4 text-red-600 dark:text-red-400">Schuld toevoegen</p>
            <AccountForm
              defaultIsLiability={true}
              onSuccess={() => setAdding(null)}
              onCancel={() => setAdding(null)}
            />
          </div>
        ) : (
          <button
            onClick={() => setAdding('liability')}
            className="w-full rounded-2xl border border-dashed border-red-200 dark:border-red-900/40 py-3 text-sm text-red-400 dark:text-red-500 hover:border-red-400 hover:text-red-500 transition"
          >
            + Schuld toevoegen
          </button>
        )}
      </div>

    </div>
  )
}

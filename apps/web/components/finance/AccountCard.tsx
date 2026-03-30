'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { FinanceAccount } from '@habit-tracker/types'
import { AccountForm } from './AccountForm'
import { SnapshotModal } from './SnapshotModal'

function relativeDate(isoString: string): string {
  const now = new Date()
  const then = new Date(isoString)
  const diffDays = Math.floor((now.getTime() - then.getTime()) / 86_400_000)
  if (diffDays === 0) return 'vandaag'
  if (diffDays === 1) return 'gisteren'
  if (diffDays < 7) return `${diffDays} dagen geleden`
  return then.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
}

const TYPE_LABELS: Record<FinanceAccount['type'], string> = {
  bank: 'Bank',
  investment: 'Beleggingen',
  crypto: 'Crypto',
  other: 'Overig',
}

const LIABILITY_TYPE_LABELS: Record<string, string> = {
  'studielening': 'Studielening',
  'hypotheek': 'Hypotheek',
  'persoonlijke lening': 'Pers. lening',
  'creditcard': 'Creditcard',
  'overig': 'Schuld',
}

interface AccountCardProps {
  account: FinanceAccount
  onArchive: () => void
}

export function AccountCard({ account, onArchive }: AccountCardProps) {
  const [showEdit, setShowEdit] = useState(false)
  const [showSnapshot, setShowSnapshot] = useState(false)

  const fmt = new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: account.currency,
  })

  // Aflosbalk: hoeveel is al afbetaald?
  const paidOffPct = account.is_liability && account.original_amount && account.original_amount > 0
    ? Math.max(0, Math.min(1, 1 - account.balance / account.original_amount))
    : null

  const typeLabel = account.is_liability
    ? (LIABILITY_TYPE_LABELS[account.institution ?? ''] ?? 'Schuld')
    : TYPE_LABELS[account.type]

  if (showEdit) {
    return (
      <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0F0F0F] p-5">
        <p className="text-sm font-medium mb-4">
          {account.is_liability ? 'Schuld bewerken' : 'Rekening bewerken'}
        </p>
        <AccountForm
          account={account}
          onSuccess={() => setShowEdit(false)}
          onCancel={() => setShowEdit(false)}
        />
      </div>
    )
  }

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl border bg-white dark:bg-[#0F0F0F] px-5 py-4 ${
          account.is_liability
            ? 'border-red-200 dark:border-red-900/40'
            : 'border-stone-200 dark:border-stone-800'
        }`}
      >
        <div className="flex items-center gap-4">
          {/* Kleurindicator + icoon */}
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
            style={{ backgroundColor: account.color ? `${account.color}20` : (account.is_liability ? '#EF444420' : undefined) }}
          >
            {account.icon ?? (account.is_liability ? '📋' : '🏦')}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-stone-950 dark:text-white">
              {account.name}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`text-xs rounded-full px-2 py-0.5 ${
                account.is_liability
                  ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400'
                  : 'bg-stone-100 dark:bg-stone-900 text-stone-500 dark:text-stone-400'
              }`}>
                {typeLabel}
              </span>
              {account.interest_rate && (
                <span className="text-xs text-stone-400 dark:text-stone-600">
                  {account.interest_rate}% rente
                </span>
              )}
              {!account.is_liability && account.institution && (
                <span className="text-xs text-stone-400 dark:text-stone-600 truncate">
                  {account.institution}
                </span>
              )}
            </div>
            <p className="text-[10px] text-stone-400 dark:text-stone-600 mt-0.5">
              Bijgewerkt {relativeDate(account.updated_at)}
            </p>
          </div>

          {/* Saldo */}
          <p className={`text-sm font-semibold shrink-0 ${
            account.is_liability ? 'text-red-500 dark:text-red-400' : 'text-stone-950 dark:text-white'
          }`}>
            {account.is_liability ? '−' : ''}{fmt.format(account.balance)}
          </p>

          {/* Acties */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setShowSnapshot(true)}
              title={account.is_liability ? 'Restschuld bijwerken' : 'Saldo bijwerken'}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium text-white transition ${
                account.is_liability ? 'bg-red-500 hover:bg-red-600' : 'bg-accent hover:bg-accent/90'
              }`}
            >
              Bijwerken
            </button>

            {/* Scheiding */}
            <div className="w-px h-5 bg-stone-200 dark:bg-stone-800 mx-1" />

            {/* Bewerken */}
            <button
              onClick={() => setShowEdit(true)}
              title="Bewerken"
              className="rounded-lg p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>

            {/* Archiveren */}
            <button
              onClick={() => {
                if (confirm(`Weet je zeker dat je "${account.name}" wilt archiveren?`)) {
                  onArchive()
                }
              }}
              title="Archiveren"
              className="rounded-lg p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Aflosbalk */}
        {paidOffPct !== null && (
          <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-900 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-stone-400 dark:text-stone-500">
              <span>{Math.round(paidOffPct * 100)}% afbetaald</span>
              <span>nog {fmt.format(account.balance)} over</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-stone-100 dark:bg-stone-900 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-green-500"
                initial={{ width: 0 }}
                animate={{ width: `${paidOffPct * 100}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
            {account.monthly_payment && (
              <p className="text-[10px] text-stone-400 dark:text-stone-500">
                {fmt.format(account.monthly_payment)}/maand · nog ca.{' '}
                {Math.ceil(account.balance / account.monthly_payment)} maanden
              </p>
            )}
          </div>
        )}
      </motion.div>

      {showSnapshot && (
        <SnapshotModal account={account} onClose={() => setShowSnapshot(false)} />
      )}
    </>
  )
}

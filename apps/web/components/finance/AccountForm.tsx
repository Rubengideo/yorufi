'use client'

import { useState } from 'react'
import type { FinanceAccount } from '@habit-tracker/types'
import { useCreateAccount, useUpdateAccount } from '@/hooks/useFinance'

const ICONS_ASSET    = ['🏦', '💳', '📈', '₿', '💰', '🏠', '💼', '🎯', '🌍', '💎']
const ICONS_LIABILITY = ['📋', '🏫', '🏠', '🎓', '💳', '📄', '🏛️', '🔑']
const COLORS = ['#6C63FF', '#22C55E', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899', '#8B5CF6', '#14B8A6']

const ACCOUNT_TYPES = [
  { value: 'bank',       label: 'Bank' },
  { value: 'investment', label: 'Beleggingen' },
  { value: 'crypto',     label: 'Crypto' },
  { value: 'other',      label: 'Overig' },
] as const

const LIABILITY_TYPES = [
  { value: 'studielening',       label: 'Studielening' },
  { value: 'hypotheek',          label: 'Hypotheek' },
  { value: 'persoonlijke lening',label: 'Pers. lening' },
  { value: 'creditcard',         label: 'Creditcard' },
  { value: 'overig',             label: 'Overig' },
] as const

interface AccountFormProps {
  account?: FinanceAccount
  onSuccess: () => void
  onCancel: () => void
  defaultIsLiability?: boolean
}

export function AccountForm({ account, onSuccess, onCancel, defaultIsLiability = false }: AccountFormProps) {
  const createAccount = useCreateAccount()
  const updateAccount = useUpdateAccount()

  const [isLiability, setIsLiability] = useState(account?.is_liability ?? defaultIsLiability)
  const [name, setName] = useState(account?.name ?? '')
  const [type, setType] = useState<FinanceAccount['type']>(account?.type ?? 'bank')
  const [liabilityType, setLiabilityType] = useState<string>(
    account ? (LIABILITY_TYPES.find(t => t.value === (account.type as string))?.value ?? 'overig') : 'studielening'
  )
  const [currency, setCurrency] = useState(account?.currency ?? 'EUR')
  const [institution, setInstitution] = useState(account?.institution ?? '')
  const [icon, setIcon] = useState<string | null>(account?.icon ?? null)
  const [color, setColor] = useState(account?.color ?? COLORS[0]!)
  const [initialBalance, setInitialBalance] = useState(account?.balance?.toString() ?? '0')
  const [originalAmount, setOriginalAmount] = useState(account?.original_amount?.toString() ?? '')
  const [interestRate, setInterestRate] = useState(account?.interest_rate?.toString() ?? '')
  const [monthlyPayment, setMonthlyPayment] = useState(account?.monthly_payment?.toString() ?? '')
  const [error, setError] = useState<string | null>(null)

  const isPending = createAccount.isPending || updateAccount.isPending
  const isEdit = !!account
  const icons = isLiability ? ICONS_LIABILITY : ICONS_ASSET

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    try {
      // Bij schulden: sla het liability type op als account-type via 'other'
      // (het veld 'type' blijft het DB-type, institution gebruiken we voor het schuld-type)
      const resolvedType: FinanceAccount['type'] = isLiability ? 'other' : type

      if (isEdit) {
        await updateAccount.mutateAsync({
          id: account.id,
          input: {
            name,
            type: resolvedType,
            currency: currency.toUpperCase(),
            institution: isLiability ? liabilityType : (institution || null),
            icon,
            color,
            is_liability: isLiability,
            original_amount: originalAmount ? parseFloat(originalAmount) : null,
            interest_rate: interestRate ? parseFloat(interestRate) : null,
            monthly_payment: monthlyPayment ? parseFloat(monthlyPayment) : null,
          },
        })
      } else {
        await createAccount.mutateAsync({
          name,
          type: resolvedType,
          currency: currency.toUpperCase(),
          institution: isLiability ? liabilityType : (institution || null),
          icon,
          color,
          balance: parseFloat(initialBalance) || 0,
          is_liability: isLiability,
          original_amount: originalAmount ? parseFloat(originalAmount) : null,
          interest_rate: interestRate ? parseFloat(interestRate) : null,
          monthly_payment: monthlyPayment ? parseFloat(monthlyPayment) : null,
        })
      }
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis. Probeer het opnieuw.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Bezitting / Schuld toggle */}
      {!isEdit && (
        <div className="flex rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden">
          <button
            type="button"
            onClick={() => setIsLiability(false)}
            className={`flex-1 py-2.5 text-sm font-medium transition ${
              !isLiability
                ? 'bg-accent text-white'
                : 'bg-white dark:bg-[#0F0F0F] text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-900'
            }`}
          >
            💼 Bezitting
          </button>
          <button
            type="button"
            onClick={() => setIsLiability(true)}
            className={`flex-1 py-2.5 text-sm font-medium transition ${
              isLiability
                ? 'bg-red-500 text-white'
                : 'bg-white dark:bg-[#0F0F0F] text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-900'
            }`}
          >
            📋 Schuld
          </button>
        </div>
      )}

      {/* Naam */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Naam</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={isLiability ? 'DUO studielening' : 'ING Betaalrekening'}
          maxLength={60}
          className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1A1A1A] px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition"
        />
      </div>

      {/* Type */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Type</label>
        <div className="flex gap-2 flex-wrap">
          {isLiability
            ? LIABILITY_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setLiabilityType(t.value)}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                    liabilityType === t.value
                      ? 'bg-red-500 text-white'
                      : 'bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
                  }`}
                >
                  {t.label}
                </button>
              ))
            : ACCOUNT_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                    type === t.value
                      ? 'bg-accent text-white'
                      : 'bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
                  }`}
                >
                  {t.label}
                </button>
              ))
          }
        </div>
      </div>

      {/* Valuta + Huidig saldo / restschuld */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Valuta</label>
          <input
            value={currency}
            onChange={(e) => setCurrency(e.target.value.toUpperCase().slice(0, 3))}
            placeholder="EUR"
            maxLength={3}
            className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1A1A1A] px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition"
          />
        </div>
        {!isEdit && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              {isLiability ? 'Huidige restschuld' : 'Huidig saldo'}
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1A1A1A] px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition"
            />
          </div>
        )}
      </div>

      {/* Extra schuld-velden */}
      {isLiability && (
        <div className="space-y-4 rounded-xl border border-stone-200 dark:border-stone-800 p-4">
          <p className="text-xs text-stone-400 dark:text-stone-500 font-medium uppercase tracking-wide">
            Schulddetails <span className="normal-case font-normal">(optioneel)</span>
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Oorspronkelijk bedrag</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={originalAmount}
                onChange={(e) => setOriginalAmount(e.target.value)}
                placeholder="bijv. 15000"
                className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1A1A1A] px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Rente (%/jaar)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                placeholder="bijv. 2.56"
                className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1A1A1A] px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Maandelijkse aflossing</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={monthlyPayment}
              onChange={(e) => setMonthlyPayment(e.target.value)}
              placeholder="bijv. 200"
              className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1A1A1A] px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition"
            />
          </div>
        </div>
      )}

      {/* Instelling (alleen voor bezittingen) */}
      {!isLiability && (
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Instelling <span className="text-stone-400">(optioneel)</span></label>
          <input
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            placeholder="ING, DEGIRO, Bitvavo…"
            maxLength={60}
            className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1A1A1A] px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition"
          />
        </div>
      )}

      {/* Icoon */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Icoon</label>
        <div className="flex flex-wrap gap-2">
          {icons.map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIcon(icon === i ? null : i)}
              className={`h-10 w-10 rounded-xl text-lg flex items-center justify-center border transition ${
                icon === i
                  ? 'border-accent bg-accent/10'
                  : 'border-stone-200 dark:border-stone-800 hover:border-stone-400'
              }`}
            >
              {i}
            </button>
          ))}
        </div>
      </div>

      {/* Kleur */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Kleur</label>
        <div className="flex gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`h-7 w-7 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-[#0F0F0F]' : 'hover:scale-110'}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-stone-200 dark:border-stone-800 px-5 py-2.5 text-sm font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-900 transition"
        >
          Annuleren
        </button>
        <button
          type="submit"
          disabled={isPending || !name}
          className={`flex-1 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition disabled:opacity-60 ${
            isLiability ? 'bg-red-500 hover:bg-red-600' : 'bg-accent hover:bg-accent/90'
          }`}
        >
          {isPending
            ? (isEdit ? 'Opslaan…' : 'Aanmaken…')
            : (isEdit
                ? 'Opslaan'
                : isLiability ? 'Schuld toevoegen' : 'Rekening toevoegen'
              )
          }
        </button>
      </div>
    </form>
  )
}

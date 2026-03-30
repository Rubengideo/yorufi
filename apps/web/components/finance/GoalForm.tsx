'use client'

import { useState } from 'react'
import type { FinanceGoal } from '@habit-tracker/types'
import { useCreateGoal, useUpdateGoal } from '@/hooks/useFinance'

const ICONS = ['🎯', '🏠', '🚗', '✈️', '💍', '🎓', '🛡️', '🌱', '📱', '💡']
const COLORS = ['#6C63FF', '#22C55E', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899', '#8B5CF6', '#14B8A6']

interface GoalFormProps {
  goal?: FinanceGoal
  onSuccess: () => void
  onCancel: () => void
}

export function GoalForm({ goal, onSuccess, onCancel }: GoalFormProps) {
  const createGoal = useCreateGoal()
  const updateGoal = useUpdateGoal()

  const [name, setName] = useState(goal?.name ?? '')
  const [description, setDescription] = useState(goal?.description ?? '')
  const [targetAmount, setTargetAmount] = useState(goal?.target_amount?.toString() ?? '')
  const [currentAmount, setCurrentAmount] = useState(goal?.current_amount?.toString() ?? '0')
  const [currency, setCurrency] = useState(goal?.currency ?? 'EUR')
  const [deadline, setDeadline] = useState(goal?.deadline ?? '')
  const [icon, setIcon] = useState<string | null>(goal?.icon ?? null)
  const [color, setColor] = useState(goal?.color ?? COLORS[0]!)
  const [error, setError] = useState<string | null>(null)

  const isPending = createGoal.isPending || updateGoal.isPending
  const isEdit = !!goal

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const target = parseFloat(targetAmount)
    const current = parseFloat(currentAmount)

    if (isNaN(target) || target <= 0) {
      setError('Vul een geldig streefbedrag in.')
      return
    }

    try {
      if (isEdit) {
        await updateGoal.mutateAsync({
          id: goal.id,
          input: {
            name,
            description: description || null,
            target_amount: target,
            current_amount: current,
            currency: currency.toUpperCase(),
            deadline: deadline || null,
            icon,
            color,
          },
        })
      } else {
        await createGoal.mutateAsync({
          name,
          description: description || null,
          target_amount: target,
          current_amount: current,
          currency: currency.toUpperCase(),
          deadline: deadline || null,
          icon,
          color,
        })
      }
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis. Probeer het opnieuw.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Naam */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Naam</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Noodfonds"
          maxLength={60}
          className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1A1A1A] px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition"
        />
      </div>

      {/* Beschrijving */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Beschrijving <span className="text-stone-400">(optioneel)</span></label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="3 maanden uitgaven als buffer"
          maxLength={280}
          className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1A1A1A] px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition"
        />
      </div>

      {/* Bedragen */}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Streefbedrag</label>
          <input
            required
            type="number"
            step="0.01"
            min="0.01"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            placeholder="10000"
            className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1A1A1A] px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Huidig bedrag</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={currentAmount}
            onChange={(e) => setCurrentAmount(e.target.value)}
            placeholder="0"
            className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1A1A1A] px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition"
          />
        </div>
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
      </div>

      {/* Deadline */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Deadline <span className="text-stone-400">(optioneel)</span></label>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1A1A1A] px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition"
        />
      </div>

      {/* Icoon */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Icoon</label>
        <div className="flex flex-wrap gap-2">
          {ICONS.map((i) => (
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
          disabled={isPending || !name || !targetAmount}
          className="flex-1 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent/90 disabled:opacity-60 transition"
        >
          {isPending ? (isEdit ? 'Opslaan…' : 'Aanmaken…') : (isEdit ? 'Opslaan' : 'Doel toevoegen')}
        </button>
      </div>
    </form>
  )
}

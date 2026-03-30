'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCreateHabit } from '@/hooks/useHabits'
import type { Frequency } from '@habit-tracker/types'

const ICONS = ['🏃', '📖', '🧘', '💧', '🥗', '😴', '✍️', '🎸', '🏋️', '🌿']
const COLORS = ['#6C63FF', '#22C55E', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899', '#8B5CF6', '#14B8A6']
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export function NewHabitForm() {
  const router = useRouter()
  const createHabit = useCreateHabit()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState<string | null>(null)
  const [color, setColor] = useState(COLORS[0]!)
  const [frequencyType, setFrequencyType] = useState<'daily' | 'weekly'>('daily')
  const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5]) // Mon–Fri default for weekly
  const [error, setError] = useState<string | null>(null)

  function toggleDay(d: number) {
    setDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const frequency: Frequency = frequencyType === 'daily'
      ? { type: 'daily' }
      : { type: 'weekly', days }

    try {
      await createHabit.mutateAsync({ name, description: description || null, icon, color, frequency })
      router.push('/habits')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Morning run"
          maxLength={60}
          className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1A1A1A] px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition"
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Description <span className="text-stone-400">(optional)</span></label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="30 minutes at 7am"
          maxLength={120}
          className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1A1A1A] px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition"
        />
      </div>

      {/* Icon */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Icon</label>
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

      {/* Color */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Color</label>
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

      {/* Frequency */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Frequency</label>
        <div className="flex gap-2">
          {(['daily', 'weekly'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFrequencyType(t)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                frequencyType === t
                  ? 'bg-accent text-white'
                  : 'bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {frequencyType === 'weekly' && (
          <div className="flex gap-1.5">
            {DAYS.map((d, i) => (
              <button
                key={d}
                type="button"
                onClick={() => toggleDay(i)}
                className={`h-9 w-9 rounded-full text-xs font-semibold transition ${
                  days.includes(i)
                    ? 'bg-accent text-white'
                    : 'bg-stone-100 dark:bg-stone-900 text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-800'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {/* Submit */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-stone-200 dark:border-stone-800 px-5 py-2.5 text-sm font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-900 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={createHabit.isPending || !name}
          className="flex-1 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent/90 disabled:opacity-60 transition"
        >
          {createHabit.isPending ? 'Creating…' : 'Create habit'}
        </button>
      </div>
    </form>
  )
}

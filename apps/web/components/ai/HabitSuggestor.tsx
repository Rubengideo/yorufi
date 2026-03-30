'use client'

import { useState } from 'react'
import { useCreateHabit } from '@/hooks/useHabits'
import type { SuggestedHabit } from '@/app/api/ai/suggest/route'

export function HabitSuggestor() {
  const [goal, setGoal] = useState('')
  const [suggestions, setSuggestions] = useState<SuggestedHabit[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [added, setAdded] = useState<Set<number>>(new Set())
  const createHabit = useCreateHabit()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = goal.trim()
    if (!trimmed || isLoading) return

    setIsLoading(true)
    setError(null)
    setSuggestions([])
    setAdded(new Set())

    try {
      const res = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: trimmed }),
      })

      if (!res.ok) {
        setError('Failed to get suggestions. Please try again.')
        return
      }

      const data = await res.json() as { habits: SuggestedHabit[] }
      setSuggestions(data.habits ?? [])
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleAdd(suggestion: SuggestedHabit, index: number) {
    await createHabit.mutateAsync({
      name: suggestion.name,
      description: suggestion.description,
      icon: suggestion.icon,
      color: suggestion.color,
      frequency: suggestion.frequency === 'daily'
        ? { type: 'daily' }
        : { type: 'weekly', days: [1, 2, 3, 4, 5] },
    })
    setAdded((prev) => new Set(prev).add(index))
  }

  return (
    <div className="space-y-6">
      {/* Goal Input */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">What's your goal?</label>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Describe what you want to achieve and Claude will suggest specific habits to get there.
          </p>
        </div>
        <div className="flex gap-2">
          <input
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g. Get fit and lose 10kg, Learn Spanish, Read more books…"
            className="flex-1 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1A1A1A] px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition"
          />
          <button
            type="submit"
            disabled={!goal.trim() || isLoading}
            className="rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white hover:bg-accent/90 disabled:opacity-40 transition shrink-0"
          >
            {isLoading ? 'Thinking…' : 'Suggest'}
          </button>
        </div>
      </form>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-stone-100 dark:border-stone-900 p-4 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-stone-100 dark:bg-stone-900" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 rounded bg-stone-100 dark:bg-stone-900" />
                  <div className="h-3 w-2/3 rounded bg-stone-100 dark:bg-stone-900" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-red-500 dark:text-red-400 text-center">{error}</p>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
            Suggested habits
          </p>
          {suggestions.map((s, i) => {
            const isAdded = added.has(i)
            return (
              <div
                key={i}
                className="rounded-2xl border border-stone-100 dark:border-stone-900 p-4 flex items-center gap-4 transition"
              >
                {/* Icon */}
                <div
                  className="h-11 w-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{ backgroundColor: `${s.color}20` }}
                >
                  {s.icon}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold truncate">{s.name}</span>
                    <span
                      className="text-xs rounded-full px-2 py-0.5 font-medium shrink-0"
                      style={{ backgroundColor: `${s.color}20`, color: s.color }}
                    >
                      {s.frequency}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 truncate">
                    {s.description}
                  </p>
                </div>

                {/* Add button */}
                <button
                  onClick={() => handleAdd(s, i)}
                  disabled={isAdded || createHabit.isPending}
                  className={`shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    isAdded
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 cursor-default'
                      : 'bg-accent text-white hover:bg-accent/90 disabled:opacity-50'
                  }`}
                >
                  {isAdded ? '✓ Added' : 'Add'}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

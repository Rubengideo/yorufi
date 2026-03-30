'use client'

import { useState } from 'react'
import type { Task, TaskPriority, CreateTaskInput } from '@habit-tracker/types'
import { PRIORITY_COLORS } from '@habit-tracker/types'
import { RichTextEditor } from './RichTextEditor'
import { DatePicker } from './DatePicker'
import { useUserId } from '@/hooks/useAuth'

interface TaskFormProps {
  initial?: Partial<Task>
  onSubmit: (input: CreateTaskInput) => void
  onCancel: () => void
  isLoading?: boolean
}

const PRIORITIES: { value: TaskPriority; label: string; icon: React.ReactNode }[] = [
  {
    value: 'high',
    label: 'Hoog',
    icon: (
      <svg width="11" height="11" viewBox="0 0 11 11" fill="currentColor">
        <path d="M5.5 1L1.5 5.5h3v4.5h2V5.5h3L5.5 1z" />
      </svg>
    ),
  },
  {
    value: 'normal',
    label: 'Normaal',
    icon: (
      <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <line x1="2" y1="4.5" x2="9" y2="4.5" />
        <line x1="2" y1="6.5" x2="9" y2="6.5" />
      </svg>
    ),
  },
  {
    value: 'low',
    label: 'Laag',
    icon: (
      <svg width="11" height="11" viewBox="0 0 11 11" fill="currentColor">
        <path d="M5.5 10L1.5 5.5h3V1h2v4.5h3L5.5 10z" />
      </svg>
    ),
  },
]

export function TaskForm({ initial, onSubmit, onCancel, isLoading }: TaskFormProps) {
  const [title, setTitle]             = useState(initial?.title ?? '')
  const [description, setDescription] = useState<string | null>(initial?.description ?? null)
  const [dueDate, setDueDate]         = useState(initial?.due_date ?? '')
  const [priority, setPriority]       = useState<TaskPriority>(initial?.priority ?? 'normal')
  const { data: userId } = useUserId()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    onSubmit({
      title: title.trim(),
      description: description ?? undefined,
      due_date: dueDate || undefined,
      priority,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Titel */}
      <input
        autoFocus
        type="text"
        placeholder="Taaknaam"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-transparent px-3 py-2 text-base placeholder:text-stone-400 dark:placeholder:text-stone-600 focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 transition-colors"
      />

      {/* Beschrijving */}
      {userId && (
        <RichTextEditor
          content={description}
          initialText={initial?.notes ?? null}
          onChange={setDescription}
          placeholder="Beschrijving (optioneel) — ondersteunt opmaak, lijsten, afbeeldingen en meer"
          userId={userId}
        />
      )}

      {/* Separator */}
      <div className="h-px bg-stone-100 dark:bg-stone-900" />

      <div className="flex items-center gap-3 flex-wrap">
        {/* Vervaldatum */}
        <div className="flex-1 min-w-40">
          <label className="text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-wide mb-1 block">
            Vervaldatum
          </label>
          <DatePicker value={dueDate} onChange={setDueDate} />
        </div>

        {/* Prioriteit */}
        <div>
          <label className="text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-wide mb-1 block">
            Prioriteit
          </label>
          <div className="flex items-center gap-1">
            {PRIORITIES.map((p) => {
              const isActive = priority === p.value
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  title={p.label}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? 'text-white'
                      : 'bg-stone-100 dark:bg-stone-900 text-stone-500 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
                  }`}
                  style={isActive ? { backgroundColor: PRIORITY_COLORS[p.value] } : undefined}
                >
                  <span style={isActive ? { color: 'rgba(255,255,255,0.9)' } : { color: PRIORITY_COLORS[p.value] }}>
                    {p.icon}
                  </span>
                  {p.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Knoppen */}
      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl px-4 py-2 text-sm text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900 transition"
        >
          Annuleren
        </button>
        <button
          type="submit"
          disabled={!title.trim() || isLoading}
          className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/90 transition disabled:opacity-50"
        >
          {initial ? 'Opslaan' : 'Toevoegen'}
        </button>
      </div>
    </form>
  )
}

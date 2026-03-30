'use client'

import { useState } from 'react'
import { useTodayTasks, useCompleteTask, useUncompleteTask, useCreateTask } from '@/hooks/useTasks'
import { useTodayCalendarEvents } from '@/hooks/useCalendar'
import type { Task } from '@habit-tracker/types'
import { PRIORITY_COLORS } from '@habit-tracker/types'
import type { CalendarEvent } from '@/lib/google-calendar'

function CompactTaskRow({ task }: { task: Task }) {
  const completeTask   = useCompleteTask()
  const uncompleteTask = useUncompleteTask()
  const isCompleted = task.completed_at !== null

  const today = new Date().toLocaleDateString('en-CA')
  const isOverdue = task.due_date !== null && task.due_date < today && !isCompleted

  return (
    <div className="flex items-center gap-2.5 py-2">
      <div
        className="h-1.5 w-1.5 rounded-full shrink-0"
        style={{ backgroundColor: PRIORITY_COLORS[task.priority] }}
      />
      <button
        onClick={() => isCompleted ? uncompleteTask.mutate(task.id) : completeTask.mutate(task.id)}
        className={`h-4 w-4 rounded-full border-2 flex items-center justify-center transition shrink-0 ${
          isCompleted
            ? 'bg-accent border-accent'
            : 'border-stone-300 dark:border-stone-700 hover:border-accent'
        }`}
      >
        {isCompleted && (
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path d="M1.5 4l2 2L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      <span className={`text-sm flex-1 min-w-0 truncate ${isCompleted ? 'line-through text-stone-400 dark:text-stone-600' : 'text-stone-800 dark:text-stone-200'}`}>
        {task.title}
      </span>
      {isOverdue && (
        <span className="text-[10px] text-red-500 shrink-0">Te laat</span>
      )}
    </div>
  )
}

function CalendarEventRow({ event }: { event: CalendarEvent }) {
  return (
    <a
      href={event.htmlLink || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2.5 py-2 hover:opacity-75 transition group"
    >
      <div className="h-1.5 w-1.5 rounded-full shrink-0 bg-blue-400" />
      <span className="text-sm flex-1 min-w-0 truncate text-stone-800 dark:text-stone-200">
        {event.summary}
      </span>
      <svg
        width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor"
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        className="shrink-0 text-stone-400 opacity-0 group-hover:opacity-100 transition"
      >
        <path d="M2 8L8 2M8 2H4M8 2v4" />
      </svg>
    </a>
  )
}

function TodayCalendarSection() {
  const { data: events } = useTodayCalendarEvents()
  if (!events?.length) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h2 className="text-base font-semibold">Agenda</h2>
        <span className="text-xs font-medium rounded-full bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 text-blue-500 dark:text-blue-400">
          {events.length}
        </span>
      </div>
      <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0F0F0F] divide-y divide-stone-50 dark:divide-stone-900/60 px-4">
        {events.map((event) => (
          <CalendarEventRow key={event.id} event={event} />
        ))}
      </div>
    </div>
  )
}

export function TodayTasksSection() {
  const { data: tasks, isLoading } = useTodayTasks()
  const createTask = useCreateTask()
  const [quickTitle, setQuickTitle] = useState('')
  const [showQuick, setShowQuick] = useState(false)

  if (isLoading) return null

  const activeTasks    = (tasks ?? []).filter((t) => !t.completed_at)
  const completedTasks = (tasks ?? []).filter((t) => t.completed_at)

  function handleQuickAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!quickTitle.trim()) return
    const today = new Date().toLocaleDateString('en-CA')
    createTask.mutate(
      { title: quickTitle.trim(), due_date: today },
      { onSuccess: () => { setQuickTitle(''); setShowQuick(false) } },
    )
  }

  return (
    <div className="space-y-4">
      {/* Taken sectie */}
      <div className="space-y-2">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold">Taken</h2>
            {activeTasks.length > 0 && (
              <span className="text-xs font-medium rounded-full bg-stone-100 dark:bg-stone-900 px-1.5 py-0.5 text-stone-500 dark:text-stone-400">
                {activeTasks.length}
              </span>
            )}
          </div>
          <button
            onClick={() => setShowQuick((v) => !v)}
            className="text-xs text-stone-400 hover:text-accent transition"
          >
            + Toevoegen
          </button>
        </div>

        {/* Quick add formulier */}
        {showQuick && (
          <form onSubmit={handleQuickAdd} className="flex items-center gap-2">
            <input
              autoFocus
              type="text"
              placeholder="Taak voor vandaag..."
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              className="flex-1 rounded-xl border border-stone-200 dark:border-stone-800 bg-transparent px-3 py-1.5 text-sm placeholder:text-stone-400 dark:placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
            <button
              type="submit"
              disabled={!quickTitle.trim()}
              className="rounded-xl bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent/90 transition disabled:opacity-50"
            >
              Voeg toe
            </button>
            <button
              type="button"
              onClick={() => setShowQuick(false)}
              className="rounded-xl px-2 py-1.5 text-xs text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900 transition"
            >
              ✕
            </button>
          </form>
        )}

        {/* Lege staat */}
        {tasks?.length === 0 && !showQuick && (
          <div className="rounded-2xl border border-dashed border-stone-200 dark:border-stone-800 py-4 text-center">
            <p className="text-xs text-stone-400 dark:text-stone-500">Geen taken voor vandaag</p>
          </div>
        )}

        {/* Actieve taken */}
        {activeTasks.length > 0 && (
          <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0F0F0F] divide-y divide-stone-50 dark:divide-stone-900/60 px-4">
            {activeTasks.map((task) => (
              <CompactTaskRow key={task.id} task={task} />
            ))}
          </div>
        )}

        {/* Voltooide taken (ingeklapt) */}
        {completedTasks.length > 0 && (
          <div className="rounded-2xl border border-stone-100 dark:border-stone-900 px-4 divide-y divide-stone-50 dark:divide-stone-900/40 opacity-60">
            {completedTasks.map((task) => (
              <CompactTaskRow key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>

      {/* Google Agenda events van vandaag */}
      <TodayCalendarSection />
    </div>
  )
}

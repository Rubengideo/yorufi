'use client'

import { useState } from 'react'
import { useTasks, useCreateTask } from '@/hooks/useTasks'
import { TaskCard } from './TaskCard'
import { TaskForm } from './TaskForm'
import { KanbanBoard } from './KanbanBoard'
import { TaskDetailDrawer } from './TaskDetailDrawer'
import { CalendarImportPanel } from './CalendarImportPanel'
import type { TaskFilter } from '@habit-tracker/types'
import { FILTER_LABELS } from '@habit-tracker/types'

type TaskView = 'list' | 'kanban'

function useViewPreference(): [TaskView, (v: TaskView) => void] {
  const [view, setView] = useState<TaskView>(() => {
    if (typeof window === 'undefined') return 'list'
    return (localStorage.getItem('tasks-view') as TaskView) ?? 'list'
  })

  function set(v: TaskView) {
    setView(v)
    localStorage.setItem('tasks-view', v)
  }

  return [view, set]
}

const FILTERS: TaskFilter[] = ['inbox', 'today', 'upcoming', 'completed']

const EMPTY_MESSAGES: Record<TaskFilter, string> = {
  inbox:     'Geen taken zonder datum — alles gepland!',
  today:     'Geen taken voor vandaag — geniet van je dag',
  upcoming:  'Geen aankomende taken',
  completed: 'Nog geen voltooide taken',
}

export function TasksView() {
  const [activeFilter, setActiveFilter] = useState<TaskFilter>('today')
  const [showForm, setShowForm] = useState(false)
  const [view, setView] = useViewPreference()

  const { data: tasks, isLoading } = useTasks(activeFilter)
  const createTask = useCreateTask()

  function handleCreate(input: Parameters<typeof createTask.mutate>[0]) {
    createTask.mutate(input, { onSuccess: () => setShowForm(false) })
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Taken</h1>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center rounded-xl bg-stone-100 dark:bg-stone-900 p-0.5">
            <button
              onClick={() => setView('list')}
              aria-label="Lijstweergave"
              className={`rounded-lg p-1.5 transition ${
                view === 'list'
                  ? 'bg-white dark:bg-[#0F0F0F] text-stone-900 dark:text-white shadow-sm'
                  : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line x1="2" y1="4" x2="14" y2="4" />
                <line x1="2" y1="8" x2="14" y2="8" />
                <line x1="2" y1="12" x2="14" y2="12" />
              </svg>
            </button>
            <button
              onClick={() => setView('kanban')}
              aria-label="Kanban-weergave"
              className={`rounded-lg p-1.5 transition ${
                view === 'kanban'
                  ? 'bg-white dark:bg-[#0F0F0F] text-stone-900 dark:text-white shadow-sm'
                  : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <rect x="1" y="2" width="4" height="12" rx="1" />
                <rect x="6" y="2" width="4" height="8" rx="1" />
                <rect x="11" y="2" width="4" height="10" rx="1" />
              </svg>
            </button>
          </div>

          <button
            onClick={() => setShowForm((v) => !v)}
            className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/90 transition"
          >
            + Taak
          </button>
        </div>
      </div>

      {/* Formulier */}
      {showForm && (
        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0F0F0F] px-5 py-4">
          <p className="text-sm font-medium mb-3">Nieuwe taak</p>
          <TaskForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
            isLoading={createTask.isPending}
          />
        </div>
      )}

      {/* Google Agenda import (collapsible) */}
      {view === 'list' && (
        <details className="group">
          <summary className="flex items-center gap-2 cursor-pointer select-none list-none rounded-2xl border border-dashed border-stone-200 dark:border-stone-800 px-4 py-2.5 text-xs text-stone-500 dark:text-stone-400 hover:border-stone-300 dark:hover:border-stone-700 hover:text-stone-700 dark:hover:text-stone-300 transition">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1.5" y="2.5" width="11" height="10" rx="1.5" />
              <path d="M4.5 1.5v2M9.5 1.5v2M1.5 6h11" />
            </svg>
            Importeer uit Google Agenda
            <svg className="ml-auto transition-transform group-open:rotate-180" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 4l4 4 4-4" />
            </svg>
          </summary>
          <div className="mt-2">
            <CalendarImportPanel />
          </div>
        </details>
      )}

      {view === 'kanban' ? (
        <KanbanBoard />
      ) : (
        <>
          {/* Filter tabs */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-stone-100 dark:bg-stone-900">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`flex-1 rounded-xl py-1.5 text-xs font-medium transition ${
                  activeFilter === f
                    ? 'bg-white dark:bg-[#0F0F0F] text-stone-950 dark:text-white shadow-sm'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
                }`}
              >
                {FILTER_LABELS[f]}{activeFilter === f && !isLoading && tasks && tasks.length > 0
                  ? ` · ${tasks.length}`
                  : ''}
              </button>
            ))}
          </div>

          {/* Taken lijst */}
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-[68px] rounded-2xl bg-stone-100 dark:bg-stone-900 animate-pulse" />
              ))}
            </div>
          ) : tasks && tasks.length > 0 ? (
            <div className="space-y-2">
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-200 dark:border-stone-800 py-12 text-center">
              <p className="text-sm text-stone-400 dark:text-stone-500">
                {EMPTY_MESSAGES[activeFilter]}
              </p>
              {activeFilter !== 'completed' && (
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-3 text-xs text-accent hover:underline"
                >
                  + Taak toevoegen
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* Detail drawer (globaal, lees openTaskId uit Zustand store) */}
      <TaskDetailDrawer />
    </div>
  )
}

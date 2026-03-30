'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Task, TaskPriority } from '@habit-tracker/types'
import { PRIORITY_COLORS } from '@habit-tracker/types'
import {
  useTasks,
  useUpdateTask,
  useCompleteTask,
  useUncompleteTask,
  useArchiveTask,
  useSyncTaskToCalendar,
  useRemoveTaskFromCalendar,
} from '@/hooks/useTasks'
import { useUserId } from '@/hooks/useAuth'
import { useTaskDrawerStore } from '@/hooks/useTaskDrawer'
import { RichTextEditor } from './RichTextEditor'
import { DatePicker } from './DatePicker'

const DEBOUNCE_MS = 1000

export function TaskDetailDrawer() {
  const { openTaskId, closeTask } = useTaskDrawerStore()
  const { data: allTasks = [] } = useTasks()
  const { data: userId } = useUserId()
  const updateTask     = useUpdateTask()
  const completeTask   = useCompleteTask()
  const uncompleteTask = useUncompleteTask()
  const archiveTask    = useArchiveTask()

  const task = allTasks.find((t) => t.id === openTaskId) ?? null

  // Sluit drawer op Escape
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') closeTask()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [closeTask])

  // Vergrendel body scroll terwijl drawer open is
  useEffect(() => {
    if (openTaskId) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [openTaskId])

  if (!task || !userId) return null

  return (
    <AnimatePresence>
      {openTaskId && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/30 dark:bg-black/50 backdrop-blur-[2px]"
            onClick={closeTask}
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-50 w-full sm:w-[680px] bg-white dark:bg-[#0F0F0F] border-l border-stone-200 dark:border-stone-800 shadow-2xl flex flex-col overflow-hidden"
          >
            <DrawerContent
              task={task}
              userId={userId}
              onClose={closeTask}
              updateTask={updateTask}
              completeTask={completeTask}
              uncompleteTask={uncompleteTask}
              archiveTask={archiveTask}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

interface DrawerContentProps {
  task: Task
  userId: string
  onClose: () => void
  updateTask: ReturnType<typeof useUpdateTask>
  completeTask: ReturnType<typeof useCompleteTask>
  uncompleteTask: ReturnType<typeof useUncompleteTask>
  archiveTask: ReturnType<typeof useArchiveTask>
}

function DrawerContent({ task, userId, onClose, updateTask, completeTask, uncompleteTask, archiveTask }: DrawerContentProps) {
  const descDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isCompleted = task.completed_at !== null
  const today = new Date().toLocaleDateString('en-CA')
  const isOverdue = task.due_date !== null && task.due_date < today && !isCompleted

  const syncToCalendar   = useSyncTaskToCalendar()
  const removeFromCalendar = useRemoveTaskFromCalendar()
  const [syncError, setSyncError] = useState<string | null>(null)

  function handleSyncToCalendar() {
    setSyncError(null)
    syncToCalendar.mutate(
      { id: task.id, title: task.title, due_date: task.due_date, priority: task.priority, gcal_event_id: task.gcal_event_id },
      { onError: (e) => setSyncError(e instanceof Error ? e.message : 'Onbekende fout') },
    )
  }

  function handleRemoveFromCalendar() {
    if (!task.gcal_event_id) return
    setSyncError(null)
    removeFromCalendar.mutate(
      { taskId: task.id, gcalEventId: task.gcal_event_id },
      { onError: (e) => setSyncError(e instanceof Error ? e.message : 'Onbekende fout') },
    )
  }

  // Debounced description auto-save
  const handleDescriptionChange = useCallback((json: string) => {
    if (descDebounceRef.current) clearTimeout(descDebounceRef.current)
    descDebounceRef.current = setTimeout(() => {
      updateTask.mutate({ id: task.id, input: { description: json } })
    }, DEBOUNCE_MS)
  }, [task.id, updateTask])

  // Titre inline edit
  function handleTitleBlur(e: React.FocusEvent<HTMLHeadingElement>) {
    const newTitle = e.currentTarget.textContent?.trim() ?? ''
    if (newTitle && newTitle !== task.title) {
      updateTask.mutate({ id: task.id, input: { title: newTitle } })
    } else if (!newTitle) {
      e.currentTarget.textContent = task.title
    }
  }

  function handleTitleKeyDown(e: React.KeyboardEvent<HTMLHeadingElement>) {
    if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur() }
  }

  function handleToggleComplete() {
    if (isCompleted) uncompleteTask.mutate(task.id)
    else completeTask.mutate(task.id)
  }

  function handlePriority(p: TaskPriority) {
    if (p !== task.priority) updateTask.mutate({ id: task.id, input: { priority: p } })
  }

  function handleDueDateChange(dateStr: string) {
    updateTask.mutate({ id: task.id, input: { due_date: dateStr || null } })
  }

  function handleArchive() {
    archiveTask.mutate(task.id)
    onClose()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-stone-100 dark:border-stone-900 shrink-0">
        <div className="flex items-center gap-3">
          {/* Completion toggle */}
          <button
            onClick={handleToggleComplete}
            className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition shrink-0 ${
              isCompleted
                ? 'bg-accent border-accent'
                : 'border-stone-300 dark:border-stone-600 hover:border-accent'
            }`}
            aria-label={isCompleted ? 'Markeer als onvoltooid' : 'Markeer als voltooid'}
          >
            {isCompleted && (
              <svg width="11" height="11" viewBox="0 0 10 10" fill="none">
                <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
          <span className="text-xs font-medium text-stone-400 dark:text-stone-500 uppercase tracking-wide">
            {isCompleted ? 'Voltooid' : 'Open'}
          </span>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
          aria-label="Sluiten"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M3 3l10 10M13 3L3 13" />
          </svg>
        </button>
      </div>

      {/* Scrollbaar hoofdgebied */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col lg:flex-row gap-0 h-full">
          {/* Linker kolom: titel + editor */}
          <div className="flex-1 min-w-0 px-6 py-5 flex flex-col gap-4">
            {/* Titel */}
            <h1
              contentEditable
              suppressContentEditableWarning
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              className={`text-2xl font-bold leading-snug outline-none cursor-text rounded-lg px-1 -mx-1 focus:bg-stone-50 dark:focus:bg-stone-900/50 transition-colors ${
                isCompleted ? 'line-through text-stone-400 dark:text-stone-600' : 'text-stone-900 dark:text-white'
              }`}
            >
              {task.title}
            </h1>

            {/* Beschrijving */}
            <div className="flex flex-col gap-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-stone-400 dark:text-stone-500">Beschrijving</p>
              <RichTextEditor
                content={task.description}
                initialText={task.notes}
                onChange={handleDescriptionChange}
                placeholder="Voeg een beschrijving toe... (ondersteunt **vet**, lijsten, checkboxen, afbeeldingen en meer)"
                editable={!isCompleted}
                userId={userId}
              />
            </div>
          </div>

          {/* Rechter kolom: metadata */}
          <div className="w-full lg:w-64 shrink-0 px-6 lg:px-4 py-5 lg:py-5 border-t lg:border-t-0 lg:border-l border-stone-100 dark:border-stone-900 flex flex-col gap-5">

            {/* Prioriteit */}
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-stone-400 dark:text-stone-500">Prioriteit</p>
              <div className="flex gap-1.5">
                {([
                  { value: 'high' as const, label: 'Hoog', icon: (
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="currentColor">
                      <path d="M5.5 1L1.5 5.5h3v4.5h2V5.5h3L5.5 1z" />
                    </svg>
                  )},
                  { value: 'normal' as const, label: 'Normaal', icon: (
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <line x1="2" y1="4.5" x2="9" y2="4.5" />
                      <line x1="2" y1="6.5" x2="9" y2="6.5" />
                    </svg>
                  )},
                  { value: 'low' as const, label: 'Laag', icon: (
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="currentColor">
                      <path d="M5.5 10L1.5 5.5h3V1h2v4.5h3L5.5 10z" />
                    </svg>
                  )},
                ]).map((p) => (
                  <button
                    key={p.value}
                    onClick={() => handlePriority(p.value)}
                    className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition border ${
                      task.priority === p.value
                        ? 'border-transparent text-white'
                        : 'border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 hover:border-stone-300 dark:hover:border-stone-700'
                    }`}
                    style={task.priority === p.value ? { backgroundColor: PRIORITY_COLORS[p.value] } : undefined}
                  >
                    <span style={{ color: task.priority === p.value ? 'rgba(255,255,255,0.9)' : PRIORITY_COLORS[p.value] }}>
                      {p.icon}
                    </span>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Deadline */}
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-stone-400 dark:text-stone-500">Deadline</p>
              <DatePicker
                value={task.due_date ?? ''}
                onChange={handleDueDateChange}
              />
              {isOverdue && (
                <p className="text-[10px] font-medium text-red-500">⚠ Te laat</p>
              )}
            </div>

            {/* Google Agenda */}
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-stone-400 dark:text-stone-500">Google Agenda</p>

              {task.gcal_event_id ? (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-medium">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 6l3 3 5-5" />
                    </svg>
                    Gesynchroniseerd
                  </div>
                  <a
                    href={`https://calendar.google.com/calendar/r/search?q=${encodeURIComponent(task.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-accent hover:underline"
                  >
                    Openen in Agenda
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 8L8 2M8 2H4M8 2v4" />
                    </svg>
                  </a>
                  <button
                    onClick={handleRemoveFromCalendar}
                    disabled={removeFromCalendar.isPending}
                    className="text-xs text-red-400 hover:text-red-500 transition disabled:opacity-50"
                  >
                    {removeFromCalendar.isPending ? 'Bezig...' : 'Verwijder uit agenda'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSyncToCalendar}
                  disabled={!task.due_date || syncToCalendar.isPending}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-stone-300 dark:border-stone-700 px-3 py-2 text-xs text-stone-500 dark:text-stone-400 hover:border-accent hover:text-accent transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-stone-300 disabled:hover:text-stone-500"
                >
                  {syncToCalendar.isPending ? (
                    'Synchroniseren...'
                  ) : task.due_date ? (
                    <>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="1" y="2" width="10" height="9" rx="1.5" />
                        <path d="M4 1v2M8 1v2M1 5h10" />
                      </svg>
                      Zet in agenda
                    </>
                  ) : (
                    'Stel datum in om te synchroniseren'
                  )}
                </button>
              )}

              {syncError && (
                <p className="text-[10px] text-red-500">{syncError}</p>
              )}
            </div>

            {/* Aangemaakt op */}
            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-stone-400 dark:text-stone-500">Aangemaakt</p>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {new Date(task.created_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>

            <div className="flex-1" />

            {/* Archiveren */}
            <button
              onClick={handleArchive}
              className="flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-900/50 px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M2 2l9 9M11 2L2 11" />
              </svg>
              Taak verwijderen
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

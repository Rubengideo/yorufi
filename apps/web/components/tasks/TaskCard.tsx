'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Task } from '@habit-tracker/types'
import { PRIORITY_COLORS } from '@habit-tracker/types'
import { useCompleteTask, useUncompleteTask, useArchiveTask, useUpdateTask } from '@/hooks/useTasks'
import { useTaskDrawerStore } from '@/hooks/useTaskDrawer'
import { TaskForm } from './TaskForm'

interface TaskCardProps {
  task: Task
}

export function TaskCard({ task }: TaskCardProps) {
  const [showEdit, setShowEdit] = useState(false)
  const completeTask   = useCompleteTask()
  const uncompleteTask = useUncompleteTask()
  const archiveTask    = useArchiveTask()
  const updateTask     = useUpdateTask()
  const openTask       = useTaskDrawerStore((s) => s.openTask)

  const isCompleted = task.completed_at !== null
  const today = new Date().toLocaleDateString('en-CA')
  const isOverdue = task.due_date !== null && task.due_date < today && !isCompleted

  function handleToggle() {
    if (isCompleted) uncompleteTask.mutate(task.id)
    else completeTask.mutate(task.id)
  }

  const dueDateLabel = task.due_date
    ? new Date(task.due_date + 'T12:00:00').toLocaleDateString('nl-NL', {
        day: 'numeric',
        month: 'short',
      })
    : null

  // Korte preview van rijke tekst (plain text)
  const preview = getDescriptionPreview(task.description) || task.notes

  if (showEdit) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0F0F0F] px-5 py-4"
      >
        <p className="text-sm font-medium mb-3">Taak bewerken</p>
        <TaskForm
          initial={task}
          onSubmit={(input) => {
            updateTask.mutate(
              { id: task.id, input },
              { onSuccess: () => setShowEdit(false) },
            )
          }}
          onCancel={() => setShowEdit(false)}
          isLoading={updateTask.isPending}
        />
      </motion.div>
    )
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="group flex items-start gap-3 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0F0F0F] px-4 py-3"
    >
      {/* Prioriteit-dot + Checkbox */}
      <div className="flex items-center gap-2 pt-0.5 shrink-0">
        <div
          className="h-2 w-2 rounded-full shrink-0"
          style={{ backgroundColor: PRIORITY_COLORS[task.priority] }}
        />
        <button
          onClick={handleToggle}
          className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition shrink-0 ${
            isCompleted
              ? 'bg-accent border-accent'
              : 'border-stone-300 dark:border-stone-700 hover:border-accent'
          }`}
          aria-label={isCompleted ? 'Markeer als onvoltooid' : 'Markeer als voltooid'}
        >
          {isCompleted && (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      </div>

      {/* Inhoud */}
      <button
        onClick={() => openTask(task.id)}
        className="flex-1 min-w-0 text-left"
        aria-label={`Open taak: ${task.title}`}
      >
        <p className={`text-sm font-medium leading-snug ${isCompleted ? 'line-through text-stone-400 dark:text-stone-600' : 'text-stone-900 dark:text-white'}`}>
          {task.title}
        </p>
        {preview && !isCompleted && (
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5 line-clamp-1">{preview}</p>
        )}
        <div className="flex items-center gap-1.5 mt-1">
          {dueDateLabel && (
            <p className={`text-[10px] font-medium ${isOverdue ? 'text-red-500' : 'text-stone-400 dark:text-stone-500'}`}>
              {isOverdue ? '⚠ ' : ''}{dueDateLabel}
            </p>
          )}
          {task.gcal_event_id && (
            <span
              title="Gesynchroniseerd met Google Agenda"
              className="text-green-500 dark:text-green-400 shrink-0"
            >
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="2" width="10" height="9" rx="1.5" />
                <path d="M4 1v2M8 1v2M1 5h10" />
              </svg>
            </span>
          )}
        </div>
      </button>

      {/* Acties (zichtbaar bij hover) */}
      {!isCompleted && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
          <button
            onClick={() => setShowEdit(true)}
            className="rounded-lg p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
            aria-label="Bewerken"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.5 1.5l2 2L4 11H2V9l7.5-7.5z" />
            </svg>
          </button>
          <button
            onClick={() => archiveTask.mutate(task.id)}
            className="rounded-lg p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
            aria-label="Verwijderen"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M2 2l9 9M11 2L2 11" />
            </svg>
          </button>
        </div>
      )}
    </motion.div>
  )
}

function getDescriptionPreview(description: string | null): string {
  if (!description) return ''
  try {
    const doc = JSON.parse(description) as { content?: unknown[] }
    return extractText(doc).slice(0, 120)
  } catch {
    return ''
  }
}

function extractText(node: unknown): string {
  if (!node || typeof node !== 'object') return ''
  const n = node as { type?: string; text?: string; content?: unknown[] }
  if (n.type === 'text') return n.text ?? ''
  if (!n.content) return ''
  return n.content.map(extractText).join('')
}

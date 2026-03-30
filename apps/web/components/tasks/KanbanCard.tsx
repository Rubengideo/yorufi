'use client'

import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { Task } from '@habit-tracker/types'
import { PRIORITY_COLORS } from '@habit-tracker/types'
import { useCompleteTask, useUncompleteTask, useArchiveTask } from '@/hooks/useTasks'
import { useTaskDrawerStore } from '@/hooks/useTaskDrawer'

interface KanbanCardProps {
  task: Task
  /** Als true: geen drag-listeners, puur visueel (voor DragOverlay ghost) */
  overlay?: boolean
}

export function KanbanCard({ task, overlay = false }: KanbanCardProps) {
  const completeTask   = useCompleteTask()
  const uncompleteTask = useUncompleteTask()
  const archiveTask    = useArchiveTask()
  const openTask       = useTaskDrawerStore((s) => s.openTask)

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    disabled: overlay,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  }

  const isCompleted = task.completed_at !== null
  const today = new Date().toLocaleDateString('en-CA')
  const isOverdue = task.due_date !== null && task.due_date < today && !isCompleted

  const dueDateLabel = task.due_date
    ? new Date(task.due_date + 'T12:00:00').toLocaleDateString('nl-NL', {
        day: 'numeric',
        month: 'short',
      })
    : null

  const preview = getDescriptionPreview(task.description) || task.notes

  function handleToggle() {
    if (isCompleted) uncompleteTask.mutate(task.id)
    else completeTask.mutate(task.id)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group rounded-2xl border bg-white dark:bg-[#0F0F0F] px-4 py-3 transition-shadow ${
        overlay
          ? 'border-accent/40 shadow-lg shadow-black/10 rotate-1 cursor-grabbing'
          : isDragging
            ? 'border-stone-200 dark:border-stone-800 cursor-grabbing'
            : 'border-stone-200 dark:border-stone-800 cursor-grab'
      }`}
      {...attributes}
    >
      <div className="flex items-start gap-2">
        {/* Drag handle */}
        {!overlay && (
          <button
            {...listeners}
            className="mt-0.5 shrink-0 text-stone-300 dark:text-stone-700 hover:text-stone-400 dark:hover:text-stone-500 transition touch-none"
            aria-label="Slepen"
            tabIndex={-1}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <circle cx="4" cy="2.5" r="1" />
              <circle cx="8" cy="2.5" r="1" />
              <circle cx="4" cy="6" r="1" />
              <circle cx="8" cy="6" r="1" />
              <circle cx="4" cy="9.5" r="1" />
              <circle cx="8" cy="9.5" r="1" />
            </svg>
          </button>
        )}

        {/* Priority dot + checkbox */}
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

        {/* Inhoud — klik opent drawer */}
        <button
          onClick={() => !overlay && openTask(task.id)}
          className="flex-1 min-w-0 text-left"
          aria-label={`Open taak: ${task.title}`}
          disabled={overlay}
        >
          <p className={`text-sm font-medium leading-snug ${
            isCompleted
              ? 'line-through text-stone-400 dark:text-stone-600'
              : 'text-stone-900 dark:text-white'
          }`}>
            {task.title}
          </p>
          {preview && !isCompleted && (
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5 line-clamp-2">
              {preview}
            </p>
          )}
          {dueDateLabel && (
            <p className={`text-[10px] font-medium mt-1 ${isOverdue ? 'text-red-500' : 'text-stone-400 dark:text-stone-500'}`}>
              {isOverdue ? '⚠ ' : ''}{dueDateLabel}
            </p>
          )}
        </button>

        {/* Acties (hover) */}
        {!isCompleted && !overlay && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
            <button
              onClick={() => openTask(task.id)}
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
      </div>
    </div>
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

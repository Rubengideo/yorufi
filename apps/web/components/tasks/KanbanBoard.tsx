'use client'

import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core'
import { todayLocal } from '@habit-tracker/lib'
import { useTasks, useUpdateTask, useCompleteTask, useUncompleteTask } from '@/hooks/useTasks'
import type { Task } from '@habit-tracker/types'
import { KanbanColumn } from './KanbanColumn'
import { KanbanCard } from './KanbanCard'

type ColumnId = 'inbox' | 'today' | 'completed'

const COLUMNS: { id: ColumnId; label: string; accentColor: string }[] = [
  { id: 'inbox',     label: 'Inbox',    accentColor: '#A8A29E' },
  { id: 'today',     label: 'Vandaag',  accentColor: '#6C63FF' },
  { id: 'completed', label: 'Voltooid', accentColor: '#10B981' },
]

export function KanbanBoard() {
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const { data: allTasks = [], isLoading } = useTasks()
  const updateTask     = useUpdateTask()
  const completeTask   = useCompleteTask()
  const uncompleteTask = useUncompleteTask()

  const today = todayLocal()

  const inboxTasks     = allTasks.filter((t) => !t.due_date && !t.completed_at)
  const todayTasks     = allTasks.filter((t) => !!t.due_date && t.due_date <= today && !t.completed_at)
  const completedTasks = allTasks.filter((t) => !!t.completed_at)

  const taskMap = Object.fromEntries(allTasks.map((t) => [t.id, t]))

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor),
  )

  function handleDragStart(event: DragStartEvent) {
    const task = taskMap[event.active.id as string]
    if (task) setActiveTask(task)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveTask(null)
    if (!over) return

    const taskId = active.id as string
    const targetColumn = over.id as ColumnId

    // Determine source column to avoid no-op mutations
    const task = taskMap[taskId]
    if (!task) return

    const sourceColumn: ColumnId = task.completed_at
      ? 'completed'
      : task.due_date && task.due_date <= today
        ? 'today'
        : 'inbox'

    if (sourceColumn === targetColumn) return

    if (targetColumn === 'inbox') {
      updateTask.mutate({ id: taskId, input: { due_date: null, completed_at: null } })
    } else if (targetColumn === 'today') {
      if (task.completed_at) {
        uncompleteTask.mutate(taskId)
        // Set due_date to today in a separate mutation after uncomplete
        updateTask.mutate({ id: taskId, input: { due_date: today } })
      } else {
        updateTask.mutate({ id: taskId, input: { due_date: today } })
      }
    } else if (targetColumn === 'completed') {
      completeTask.mutate(taskId)
    }
  }

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <div key={col.id} className="w-72 shrink-0 space-y-2">
            <div className="h-5 w-24 rounded-full bg-stone-100 dark:bg-stone-900 animate-pulse" />
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-[68px] rounded-2xl bg-stone-100 dark:bg-stone-900 animate-pulse" />
            ))}
          </div>
        ))}
      </div>
    )
  }

  const columnTasks: Record<ColumnId, Task[]> = {
    inbox:     inboxTasks,
    today:     todayTasks,
    completed: completedTasks,
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            label={col.label}
            tasks={columnTasks[col.id]}
            accentColor={col.accentColor}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? <KanbanCard task={activeTask} overlay /> : null}
      </DragOverlay>
    </DndContext>
  )
}

'use client'

import { useDroppable } from '@dnd-kit/core'
import { AnimatePresence, motion } from 'framer-motion'
import type { Task } from '@habit-tracker/types'
import { KanbanCard } from './KanbanCard'

type ColumnId = 'inbox' | 'today' | 'completed'

const EMPTY_MESSAGES: Record<ColumnId, string> = {
  inbox: 'Geen taken zonder datum',
  today: 'Geen taken voor vandaag',
  completed: 'Nog niets voltooid',
}

interface KanbanColumnProps {
  id: ColumnId
  label: string
  tasks: Task[]
  accentColor?: string
}

export function KanbanColumn({ id, label, tasks, accentColor }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div className="flex flex-col shrink-0 w-full md:w-72">
      {/* Column header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        {accentColor && (
          <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: accentColor }} />
        )}
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
          {label}
        </p>
        {tasks.length > 0 && (
          <span className="ml-auto text-[10px] font-medium bg-stone-100 dark:bg-stone-900 text-stone-500 dark:text-stone-400 rounded-full px-2 py-0.5">
            {tasks.length}
          </span>
        )}
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 min-h-[120px] rounded-2xl p-2 transition-colors ${
          isOver
            ? 'bg-accent/5 ring-2 ring-accent/20'
            : 'bg-stone-50 dark:bg-stone-950/50'
        }`}
      >
        <div className="space-y-2">
          <AnimatePresence>
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.15 }}
              >
                <KanbanCard task={task} />
              </motion.div>
            ))}
          </AnimatePresence>

          {tasks.length === 0 && (
            <div className={`flex items-center justify-center py-8 rounded-xl border-2 border-dashed transition-colors ${
              isOver
                ? 'border-accent/30 text-accent'
                : 'border-stone-200 dark:border-stone-800 text-stone-400 dark:text-stone-600'
            }`}>
              <p className="text-xs">{EMPTY_MESSAGES[id]}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

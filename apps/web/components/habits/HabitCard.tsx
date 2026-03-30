'use client'

import { memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { HabitWithStreak } from '@habit-tracker/types'

interface HabitCardProps {
  habit: HabitWithStreak
  onCheckIn: () => void
  onUndo: () => void
}

export const HabitCard = memo(function HabitCard({ habit, onCheckIn, onUndo }: HabitCardProps) {
  const streak = habit.streak?.current_streak ?? 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-4 rounded-2xl border px-5 py-4 transition-colors ${
        habit.completed_today
          ? 'border-stone-100 dark:border-stone-900 bg-stone-50 dark:bg-[#161616]'
          : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0F0F0F]'
      }`}
    >
      {/* Check button */}
      <button
        onClick={habit.completed_today ? onUndo : onCheckIn}
        aria-label={habit.completed_today ? 'Undo' : 'Check in'}
        className="shrink-0"
      >
        <AnimatePresence mode="wait">
          {habit.completed_today ? (
            <motion.div
              key="checked"
              initial={{ scale: 0.6 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.6 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-white text-sm"
            >
              ✓
            </motion.div>
          ) : (
            <motion.div
              key="unchecked"
              initial={{ scale: 0.6 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.6 }}
              className="h-8 w-8 rounded-full border-2 border-stone-300 dark:border-stone-700 hover:border-accent transition-colors"
            />
          )}
        </AnimatePresence>
      </button>

      {/* Name + streak */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${habit.completed_today ? 'text-stone-400 dark:text-stone-600 line-through' : 'text-stone-950 dark:text-white'}`}>
          {habit.icon && <span className="mr-1.5">{habit.icon}</span>}
          {habit.name}
        </p>
        {streak > 0 && (
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
            🔥 {streak} day streak
          </p>
        )}
      </div>

      {/* Color dot */}
      {habit.color && (
        <div
          className="h-2 w-2 rounded-full shrink-0"
          style={{ backgroundColor: habit.color }}
        />
      )}
    </motion.div>
  )
})

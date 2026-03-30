'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useToastStore } from '@/hooks/useToast'

const ICONS = {
  success: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6.5" />
      <path d="M5 8l2 2 4-4" />
    </svg>
  ),
  error: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="8" cy="8" r="6.5" />
      <path d="M8 5v4M8 11v.5" />
    </svg>
  ),
  info: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="8" cy="8" r="6.5" />
      <path d="M8 8v3M8 5v.5" />
    </svg>
  ),
}

const COLORS = {
  success: 'bg-green-50 dark:bg-green-950/60 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300',
  error:   'bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300',
  info:    'bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300',
}

export function Toaster() {
  const { toasts, removeToast } = useToastStore()

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`pointer-events-auto flex items-start gap-2.5 rounded-2xl border px-4 py-3 shadow-lg text-sm max-w-xs ${COLORS[toast.type]}`}
          >
            <span className="mt-0.5 shrink-0">{ICONS[toast.type]}</span>
            <span className="flex-1 leading-snug">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 opacity-50 hover:opacity-100 transition ml-1"
              aria-label="Sluit melding"
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M2 2l9 9M11 2L2 11" />
              </svg>
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

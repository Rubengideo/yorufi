'use client'

import { useState, useRef, useEffect } from 'react'

interface DatePickerProps {
  value: string // YYYY-MM-DD of ''
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

const MAANDEN = [
  'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
  'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December',
]

const DAGEN_KORT = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo']

function formatWeergave(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })
}

function dagString(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function DatePicker({ value, onChange, placeholder = 'Geen datum', className }: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const [viewDate, setViewDate] = useState(() => {
    if (value) return new Date(value + 'T12:00:00')
    return new Date()
  })
  const containerRef = useRef<HTMLDivElement>(null)
  const today = new Date().toLocaleDateString('en-CA')

  // Sync viewDate wanneer value van buiten verandert
  useEffect(() => {
    if (value) setViewDate(new Date(value + 'T12:00:00'))
  }, [value])

  // Sluit bij klik buiten component
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  function vorigeMaand() {
    setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  }

  function volgendeMaand() {
    setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))
  }

  function getDagen(): (number | null)[] {
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()
    const eerstedag = new Date(year, month, 1)
    // Maandag = 0 offset
    const startOffset = (eerstedag.getDay() + 6) % 7
    const aantalDagen = new Date(year, month + 1, 0).getDate()
    const dagen: (number | null)[] = []
    for (let i = 0; i < startOffset; i++) dagen.push(null)
    for (let i = 1; i <= aantalDagen; i++) dagen.push(i)
    return dagen
  }

  function selecteerDag(dag: number) {
    const dateStr = dagString(viewDate.getFullYear(), viewDate.getMonth(), dag)
    onChange(dateStr)
    setOpen(false)
  }

  const dagen = getDagen()
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  return (
    <div ref={containerRef} className={`relative ${className ?? ''}`}>
      {/* Trigger knop */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-transparent px-3 py-2 text-sm text-left transition hover:border-stone-300 dark:hover:border-stone-700 focus:outline-none focus:ring-2 focus:ring-accent/30"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-stone-400 dark:text-stone-600">
          <rect x="1" y="2" width="12" height="11" rx="1.5" />
          <line x1="1" y1="6" x2="13" y2="6" />
          <line x1="4" y1="1" x2="4" y2="3" />
          <line x1="10" y1="1" x2="10" y2="3" />
        </svg>
        <span className={value ? 'text-stone-800 dark:text-stone-200' : 'text-stone-400 dark:text-stone-500'}>
          {value ? formatWeergave(value) : placeholder}
        </span>
      </button>

      {/* Kalender dropdown */}
      {open && (
        <div className="absolute top-full left-0 mt-1.5 z-50 w-72 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0F0F0F] shadow-xl shadow-black/10 p-4">

          {/* Maandnavigatie */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={vorigeMaand}
              className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-900 transition text-stone-400 dark:text-stone-500"
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="8,2 4,6.5 8,11" />
              </svg>
            </button>
            <span className="text-sm font-semibold text-stone-800 dark:text-stone-200">
              {MAANDEN[month]} {year}
            </span>
            <button
              type="button"
              onClick={volgendeMaand}
              className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-900 transition text-stone-400 dark:text-stone-500"
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="5,2 9,6.5 5,11" />
              </svg>
            </button>
          </div>

          {/* Dag-headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAGEN_KORT.map(d => (
              <span key={d} className="text-center text-[10px] font-semibold text-stone-400 dark:text-stone-500 py-1">
                {d}
              </span>
            ))}
          </div>

          {/* Dag-grid */}
          <div className="grid grid-cols-7 gap-y-0.5">
            {dagen.map((dag, i) => {
              if (dag === null) return <div key={`leeg-${i}`} />
              const dagStr = dagString(year, month, dag)
              const geselecteerd = dagStr === value
              const isVandaag = dagStr === today
              return (
                <button
                  key={dag}
                  type="button"
                  onClick={() => selecteerDag(dag)}
                  className={`h-8 w-full rounded-lg text-xs font-medium transition ${
                    geselecteerd
                      ? 'bg-accent text-white'
                      : isVandaag
                        ? 'border border-accent text-accent'
                        : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-900'
                  }`}
                >
                  {dag}
                </button>
              )
            })}
          </div>

          {/* Footer acties */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-100 dark:border-stone-900">
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false) }}
              className="text-xs text-stone-400 hover:text-red-500 transition"
            >
              Wissen
            </button>
            <button
              type="button"
              onClick={() => { onChange(today); setOpen(false) }}
              className="text-xs font-semibold text-accent hover:text-accent/80 transition"
            >
              Vandaag
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

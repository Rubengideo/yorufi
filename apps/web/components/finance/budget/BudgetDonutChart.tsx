'use client'

import { motion } from 'framer-motion'
import type { BudgetSummary } from '@habit-tracker/types'

interface BudgetDonutChartProps {
  summary: BudgetSummary
}

const R           = 54
const CX          = 70
const CY          = 70
const STROKE      = 16
const CIRCUMFERENCE = 2 * Math.PI * R

export function BudgetDonutChart({ summary }: BudgetDonutChartProps) {
  const { needs, savings, wants, monthly_income, total_remaining, currency } = summary

  const fmt = new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  })

  // Prioriteit: werkelijke uitgaven (spent_amount) → geplande items (actual_amount) → doel-percentages
  const hasSpent = needs.spent_amount + savings.spent_amount + wants.spent_amount > 0
  const hasItems = needs.actual_amount + savings.actual_amount + wants.actual_amount > 0

  const getValue = (bucket: typeof needs) => {
    if (hasSpent) return bucket.spent_amount
    if (hasItems) return bucket.actual_amount
    return monthly_income > 0 ? (monthly_income * bucket.goal_pct / 100) : 0
  }

  const rawSegments = [
    { label: needs.label,   color: needs.color,   value: getValue(needs)   },
    { label: savings.label, color: savings.color, value: getValue(savings) },
    { label: wants.label,   color: wants.color,   value: getValue(wants)   },
  ]

  const totalValue = rawSegments.reduce((s, seg) => s + seg.value, 0)

  // Bereken arc-waarden per segment (cumulative offset voor positie)
  let cumulativePct = 0
  const arcs = rawSegments.map((seg) => {
    const pct    = totalValue > 0 ? (seg.value / totalValue) * 100 : 0
    const dash   = (pct / 100) * CIRCUMFERENCE
    const offset = CIRCUMFERENCE - (cumulativePct / 100) * CIRCUMFERENCE
    cumulativePct += pct
    return { ...seg, pct, dash, offset }
  })

  const hasIncome = monthly_income > 0

  return (
    <div className="flex flex-col items-center gap-2 shrink-0">
      <div className="relative">
        <svg width={140} height={140} viewBox="0 0 140 140" aria-hidden="true">
          {/* Achtergrondring */}
          <circle
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke="currentColor"
            strokeWidth={STROKE}
            className="text-stone-100 dark:text-stone-900"
          />

          {/* Segmenten — geroteerd zodat we vanaf 12-uur beginnen */}
          <g transform={`rotate(-90 ${CX} ${CY})`}>
            {arcs.map((arc) => (
              <motion.circle
                key={arc.label}
                cx={CX}
                cy={CY}
                r={R}
                fill="none"
                stroke={arc.color}
                strokeWidth={STROKE}
                strokeLinecap="butt"
                initial={{
                  strokeDasharray: `0 ${CIRCUMFERENCE}`,
                  strokeDashoffset: arc.offset,
                }}
                animate={{
                  strokeDasharray: `${arc.dash} ${CIRCUMFERENCE - arc.dash}`,
                  strokeDashoffset: arc.offset,
                }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            ))}
          </g>
        </svg>

        {/* Centerlabel */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          {hasIncome ? (
            <>
              <p className="text-[10px] text-stone-400 dark:text-stone-500 leading-none">Nog over</p>
              <p className={`text-sm font-semibold mt-0.5 leading-tight ${
                total_remaining < 0 ? 'text-red-500' : 'text-stone-950 dark:text-white'
              }`}>
                {fmt.format(total_remaining)}
              </p>
            </>
          ) : (
            <p className="text-[10px] text-stone-400 dark:text-stone-500 px-3 leading-tight text-center">
              Stel inkomen in
            </p>
          )}
        </div>
      </div>

      {/* Legenda */}
      <div className="flex flex-col gap-1">
        {rawSegments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: seg.color }}
            />
            <span className="text-[10px] text-stone-500 dark:text-stone-400 whitespace-nowrap">{seg.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

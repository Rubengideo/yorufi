'use client'

const MAAND_LABELS = [
  'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
  'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December',
]

interface MonthNavigatorProps {
  year: number
  month: number      // 1–12
  onChange: (year: number, month: number) => void
  maxMonthsBack?: number
}

export function MonthNavigator({
  year,
  month,
  onChange,
  maxMonthsBack = 12,
}: MonthNavigatorProps) {
  const now = new Date()
  const todayYear = now.getFullYear()
  const todayMonth = now.getMonth() + 1

  const isAtLatest = year === todayYear && month === todayMonth
  const monthsBack = (todayYear - year) * 12 + (todayMonth - month)
  const isAtEarliest = monthsBack >= maxMonthsBack

  function goPrev() {
    if (isAtEarliest) return
    if (month === 1) onChange(year - 1, 12)
    else onChange(year, month - 1)
  }

  function goNext() {
    if (isAtLatest) return
    if (month === 12) onChange(year + 1, 1)
    else onChange(year, month + 1)
  }

  return (
    <div className="flex items-center justify-between rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0F0F0F] px-5 py-4">
      <button
        onClick={goPrev}
        disabled={isAtEarliest}
        className="rounded-xl p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-900 disabled:opacity-30 disabled:cursor-not-allowed transition"
        aria-label="Vorige maand"
      >
        ←
      </button>
      <p className="text-sm font-semibold text-stone-950 dark:text-white">
        {MAAND_LABELS[month - 1]} {year}
      </p>
      <button
        onClick={goNext}
        disabled={isAtLatest}
        className="rounded-xl p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-900 disabled:opacity-30 disabled:cursor-not-allowed transition"
        aria-label="Volgende maand"
      >
        →
      </button>
    </div>
  )
}

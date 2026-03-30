'use client'

interface HeatmapCalendarProps {
  /** Set of completed 'YYYY-MM-DD' dates */
  completedDates: Set<string>
  /** Number of days to show, ending today (default: 91 = 13 weeks) */
  days?: number
}

function toDateStr(d: Date): string {
  return d.toLocaleDateString('en-CA')
}

export function HeatmapCalendar({ completedDates, days = 91 }: HeatmapCalendarProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Build array of day cells, oldest first
  const cells: { date: string; completed: boolean; isToday: boolean }[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const str = toDateStr(d)
    cells.push({ date: str, completed: completedDates.has(str), isToday: i === 0 })
  }

  // Pad so the grid starts on Sunday (day 0)
  const firstDay = new Date(today)
  firstDay.setDate(firstDay.getDate() - (days - 1))
  const startOffset = firstDay.getDay()

  const padded = [...Array(startOffset).fill(null), ...cells]
  const weeks: (typeof cells[number] | null)[][] = []
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7))
  }

  // Month labels: show month name only when it changes between weeks
  const shownMonths: (string | null)[] = weeks.map((week, wi) => {
    const firstCell = week.find((c) => c !== null)
    if (!firstCell) return null
    const d = new Date(firstCell.date + 'T00:00:00')
    const month = d.toLocaleString('en', { month: 'short' })
    if (wi === 0) return month
    const prevCell = weeks[wi - 1]?.find((c) => c !== null)
    if (!prevCell) return month
    const prevMonth = new Date(prevCell.date + 'T00:00:00').toLocaleString('en', { month: 'short' })
    return prevMonth !== month ? month : null
  })

  // Show only Mo, We, Fr on the left axis
  const dayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex flex-col">
        {/* Month labels above week columns */}
        <div className="flex gap-1 mb-1 ml-8">
          {weeks.map((_, wi) => (
            <div key={wi} className="w-4 text-xs text-stone-400 leading-none">
              {shownMonths[wi] ?? ''}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          {/* Day labels on the left */}
          <div className="flex flex-col gap-1">
            {dayLabels.map((d, i) => (
              <div
                key={d}
                className="h-4 w-6 text-xs text-stone-400 flex items-center justify-end pr-1 leading-none"
              >
                {[1, 3, 5].includes(i) ? d : ''}
              </div>
            ))}
          </div>

          {/* Week columns */}
          <div className="flex gap-1">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((cell, di) =>
                  cell === null ? (
                    <div key={di} className="w-4 h-4" />
                  ) : (
                    <div
                      key={cell.date}
                      title={new Date(cell.date + 'T00:00:00').toLocaleDateString('en', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                      className={`w-4 h-4 rounded-sm transition-colors ${
                        cell.isToday
                          ? cell.completed
                            ? 'bg-accent ring-1 ring-accent ring-offset-1 ring-offset-white dark:ring-offset-[#0F0F0F]'
                            : 'bg-stone-200 dark:bg-stone-700 ring-1 ring-stone-400 dark:ring-stone-600 ring-offset-1 ring-offset-white dark:ring-offset-[#0F0F0F]'
                          : cell.completed
                            ? 'bg-accent/70'
                            : 'bg-stone-100 dark:bg-stone-800'
                      }`}
                    />
                  )
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

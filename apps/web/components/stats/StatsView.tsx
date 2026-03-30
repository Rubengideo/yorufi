'use client'

import { useStats } from '@/hooks/useStats'
import { HeatmapCalendar } from './HeatmapCalendar'
import { HabitStatsCard } from './HabitStatsCard'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysAgoStr(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toLocaleDateString('en-CA')
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function StatsView() {
  const { data, isLoading } = useStats()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-32 rounded-2xl bg-stone-100 dark:bg-stone-900 animate-pulse" />
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 rounded-2xl bg-stone-100 dark:bg-stone-900 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!data || data.habits.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-200 dark:border-stone-800 p-10 text-center space-y-2">
        <p className="font-medium">No data yet</p>
        <p className="text-sm text-stone-400">Complete some habits to see your stats.</p>
      </div>
    )
  }

  const rate7Pct = Math.round(data.rate7d * 100)
  const rate30Pct = Math.round(data.rate30d * 100)
  const habitCount = data.habits.length

  // Flat list of all per-habit completions (same date appears once per habit that completed it)
  const allCompletionDates = data.habits.flatMap((h) => h.completionDates)

  // ── Trend indicator: last 7d vs previous 7d ──────────────────────────────
  const prevStart = daysAgoStr(13)
  const prevEnd = daysAgoStr(7)
  const prevCount = allCompletionDates.filter((d) => d >= prevStart && d <= prevEnd).length
  const prevRate7 = habitCount > 0 ? prevCount / (habitCount * 7) : 0
  const trend7d = data.rate7d - prevRate7

  // ── Weekly trend (8 weeks, oldest → newest) ──────────────────────────────
  const weeklyTrend = Array.from({ length: 8 }, (_, i) => {
    const weeksAgo = 7 - i
    const end = daysAgoStr(weeksAgo * 7)
    const start = daysAgoStr(weeksAgo * 7 + 6)
    const count = allCompletionDates.filter((d) => d >= start && d <= end).length
    const rate = habitCount > 0 ? Math.min(1, count / (habitCount * 7)) : 0
    return { label: weeksAgo === 0 ? 'Now' : `${weeksAgo}w`, rate }
  })

  // ── Day-of-week pattern ───────────────────────────────────────────────────
  const dayOfWeekCounts = Array<number>(7).fill(0)
  for (const dateStr of allCompletionDates) {
    dayOfWeekCounts[new Date(dateStr + 'T00:00:00').getDay()]++
  }
  const maxDayCount = Math.max(1, ...dayOfWeekCounts)
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="space-y-8">
      {/* Overview tiles */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {/* 7-day tile with trend indicator */}
        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0F0F0F] px-5 py-4">
          <p className="text-xs text-stone-400">Last 7 days</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-3xl font-bold tabular-nums">{rate7Pct}%</p>
            {Math.abs(trend7d) >= 0.05 && (
              <span className={`text-xs font-semibold ${trend7d > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {trend7d > 0 ? '↑' : '↓'} {Math.abs(Math.round(trend7d * 100))}%
              </span>
            )}
          </div>
          <p className="text-xs text-stone-400 mt-0.5">completion rate</p>
        </div>

        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0F0F0F] px-5 py-4">
          <p className="text-xs text-stone-400">Last 30 days</p>
          <p className="text-3xl font-bold tabular-nums mt-1">{rate30Pct}%</p>
          <p className="text-xs text-stone-400 mt-0.5">completion rate</p>
        </div>

        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0F0F0F] px-5 py-4 col-span-2 md:col-span-1">
          <p className="text-xs text-stone-400">Active habits</p>
          <p className="text-3xl font-bold tabular-nums mt-1">{habitCount}</p>
          <p className="text-xs text-stone-400 mt-0.5">being tracked</p>
        </div>
      </div>

      {/* Heatmap */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400">Activity — last 13 weeks</h2>
        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0F0F0F] px-5 py-5 overflow-hidden">
          <HeatmapCalendar completedDates={data.allDates} days={91} />
        </div>
      </section>

      {/* Weekly trend + Day-of-week pattern */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Weekly trend */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400">Weekly trend</h2>
          <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0F0F0F] px-5 py-4 space-y-2.5">
            {weeklyTrend.map(({ label, rate }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="text-xs text-stone-400 w-7 shrink-0 text-right">{label}</span>
                <div className="flex-1 h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent/70 rounded-full transition-all"
                    style={{ width: `${Math.round(rate * 100)}%` }}
                  />
                </div>
                <span className="text-xs text-stone-400 w-8 shrink-0 text-right tabular-nums">
                  {Math.round(rate * 100)}%
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Day-of-week pattern */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400">Best days</h2>
          <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0F0F0F] px-5 py-4 space-y-2.5">
            {dayNames.map((day, i) => (
              <div key={day} className="flex items-center gap-2">
                <span className="text-xs text-stone-400 w-7 shrink-0 text-right">{day}</span>
                <div className="flex-1 h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent/70 rounded-full"
                    style={{ width: `${Math.round((dayOfWeekCounts[i] / maxDayCount) * 100)}%` }}
                  />
                </div>
                <span className="text-xs text-stone-400 w-8 shrink-0 text-right tabular-nums">
                  {dayOfWeekCounts[i]}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Per-habit breakdown */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400">Per habit</h2>
        <div className="space-y-2">
          {data.habits
            .slice()
            .sort((a, b) => b.currentStreak - a.currentStreak)
            .map((h) => (
              <HabitStatsCard key={h.habitId} stats={h} />
            ))}
        </div>
      </section>
    </div>
  )
}

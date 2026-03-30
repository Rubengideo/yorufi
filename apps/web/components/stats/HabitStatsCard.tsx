import type { HabitStats } from '@habit-tracker/lib'

interface HabitStatsCardProps {
  stats: HabitStats
}

export function HabitStatsCard({ stats }: HabitStatsCardProps) {
  const ratePercent = Math.round(stats.rate30d * 100)

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0F0F0F] px-5 py-4">
      {/* Color + icon */}
      <div className="flex items-center gap-2 shrink-0">
        {stats.habitColor && (
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: stats.habitColor }} />
        )}
        {stats.habitIcon && <span className="text-xl">{stats.habitIcon}</span>}
      </div>

      {/* Name + rate bar */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <p className="text-sm font-medium text-stone-950 dark:text-white truncate">{stats.habitName}</p>
        <div className="h-1.5 w-full rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${ratePercent}%` }}
          />
        </div>
      </div>

      {/* Numbers */}
      <div className="flex gap-5 shrink-0 text-right">
        <div>
          <p className="text-xs text-stone-400">30d rate</p>
          <p className="text-sm font-semibold tabular-nums">{ratePercent}%</p>
        </div>
        <div>
          <p className="text-xs text-stone-400">Streak</p>
          <p className="text-sm font-semibold tabular-nums">
            {stats.currentStreak > 0 ? `🔥 ${stats.currentStreak}` : '–'}
          </p>
        </div>
        <div>
          <p className="text-xs text-stone-400">Best</p>
          <p className="text-sm font-semibold tabular-nums">{stats.longestStreak || '–'}</p>
        </div>
        <div>
          <p className="text-xs text-stone-400">Total</p>
          <p className="text-sm font-semibold tabular-nums">{stats.totalCompletions}</p>
        </div>
      </div>
    </div>
  )
}

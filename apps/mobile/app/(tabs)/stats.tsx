import { View, Text, ScrollView, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useQuery } from '@tanstack/react-query'
import { getStatsData } from '@habit-tracker/lib'
import { supabase } from '@/lib/supabase'

// ─── Auth hook ────────────────────────────────────────────────────────────────

function useUserId() {
  return useQuery({
    queryKey: ['auth-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      return user?.id ?? null
    },
  })
}

// ─── Stat Tile ────────────────────────────────────────────────────────────────

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 bg-[#1A1A1A] rounded-2xl p-4 items-center">
      <Text className="text-white text-2xl font-bold">{value}</Text>
      <Text className="text-stone-500 text-xs mt-1 text-center">{label}</Text>
    </View>
  )
}

// ─── Habit Stats Card ─────────────────────────────────────────────────────────

interface HabitCardProps {
  name: string
  icon: string | null
  color: string | null
  currentStreak: number
  longestStreak: number
  rate30d: number
  totalCompletions: number
}

function HabitStatsCard({ name, icon, color, currentStreak, longestStreak, rate30d, totalCompletions }: HabitCardProps) {
  const pct = Math.round(rate30d * 100)

  return (
    <View className="rounded-2xl border border-stone-800 bg-[#0F0F0F] px-5 py-4 mb-2">
      {/* Header */}
      <View className="flex-row items-center gap-3 mb-3">
        <View
          className="h-8 w-8 rounded-full items-center justify-center"
          style={{ backgroundColor: color ? `${color}22` : '#1A1A1A' }}
        >
          <Text className="text-sm">{icon ?? '•'}</Text>
        </View>
        <Text className="text-white text-sm font-medium flex-1" numberOfLines={1}>{name}</Text>
        <Text className="text-stone-400 text-sm font-semibold">{pct}%</Text>
      </View>

      {/* Progress bar */}
      <View className="h-1.5 bg-[#1A1A1A] rounded-full overflow-hidden mb-3">
        <View
          className="h-full rounded-full"
          style={{ width: `${pct}%`, backgroundColor: color ?? '#6C63FF' }}
        />
      </View>

      {/* Stats row */}
      <View className="flex-row gap-4">
        <View>
          <Text className="text-white text-sm font-semibold">
            {currentStreak > 0 ? `🔥 ${currentStreak}` : '—'}
          </Text>
          <Text className="text-stone-500 text-xs">Current streak</Text>
        </View>
        <View>
          <Text className="text-white text-sm font-semibold">{longestStreak}</Text>
          <Text className="text-stone-500 text-xs">Best streak</Text>
        </View>
        <View>
          <Text className="text-white text-sm font-semibold">{totalCompletions}</Text>
          <Text className="text-stone-500 text-xs">Total</Text>
        </View>
      </View>
    </View>
  )
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function StatsScreen() {
  const { data: userId } = useUserId()

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['stats', userId],
    queryFn: () => getStatsData(supabase, userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })

  return (
    <SafeAreaView className="flex-1 bg-[#0F0F0F]">
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="py-6">
          <Text className="text-white text-2xl font-semibold">Stats</Text>
          <Text className="text-stone-500 text-sm mt-1">Last 30 days</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator color="#6C63FF" className="mt-8" />
        ) : error ? (
          <View className="rounded-2xl border border-red-900 bg-red-950/20 p-6 items-center">
            <Text className="text-red-400 text-sm text-center">Could not load stats. Please try again.</Text>
          </View>
        ) : !stats || stats.habits.length === 0 ? (
          <View className="rounded-2xl border border-stone-800 p-10 items-center" style={{ borderStyle: 'dashed' }}>
            <Text className="text-white font-medium">No data yet</Text>
            <Text className="text-stone-500 text-sm mt-1 text-center">Complete some habits to see your stats</Text>
          </View>
        ) : (
          <>
            {/* Overview tiles */}
            <View className="flex-row gap-3 mb-6">
              <StatTile label="7-day rate" value={`${Math.round(stats.rate7d * 100)}%`} />
              <StatTile label="30-day rate" value={`${Math.round(stats.rate30d * 100)}%`} />
              <StatTile label="Habits tracked" value={String(stats.habits.length)} />
            </View>

            {/* Per-habit breakdown */}
            <Text className="text-white text-base font-semibold mb-3">Per habit</Text>
            {stats.habits.map((h) => (
              <HabitStatsCard
                key={h.habitId}
                name={h.habitName}
                icon={h.habitIcon}
                color={h.habitColor}
                currentStreak={h.currentStreak}
                longestStreak={h.longestStreak}
                rate30d={h.rate30d}
                totalCompletions={h.totalCompletions}
              />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

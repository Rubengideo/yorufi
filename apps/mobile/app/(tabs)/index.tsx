import { ScrollView, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Animated, { useSharedValue, withSpring } from 'react-native-reanimated'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getHabitsWithStreak, checkIn, undoCheckIn } from '@habit-tracker/lib'
import { supabase } from '@/lib/supabase'
import type { HabitWithStreak } from '@habit-tracker/types'

function useUserId() {
  return useQuery({
    queryKey: ['auth-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      return user?.id ?? null
    },
  })
}

function HabitRow({ habit, onPress }: { habit: HabitWithStreak; onPress: () => void }) {
  const scale = useSharedValue(1)

  function handlePress() {
    scale.value = withSpring(0.95, {}, () => { scale.value = withSpring(1) })
    onPress()
  }

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.85}
        className={`flex-row items-center gap-4 rounded-2xl border px-5 py-4 mb-2 ${
          habit.completed_today
            ? 'border-stone-900 bg-[#161616]'
            : 'border-stone-800 bg-[#0F0F0F]'
        }`}
      >
        {/* Circle */}
        <View className={`h-8 w-8 rounded-full items-center justify-center ${
          habit.completed_today ? 'bg-accent' : 'border-2 border-stone-700'
        }`}>
          {habit.completed_today && <Text className="text-white text-sm font-bold">✓</Text>}
        </View>

        {/* Content */}
        <View className="flex-1">
          <Text className={`text-sm font-medium ${habit.completed_today ? 'text-stone-600 line-through' : 'text-white'}`}>
            {habit.icon} {habit.name}
          </Text>
          {(habit.streak?.current_streak ?? 0) > 0 && (
            <Text className="text-xs text-stone-500 mt-0.5">
              🔥 {habit.streak!.current_streak} day streak
            </Text>
          )}
        </View>

        {habit.color && (
          <View className="h-2 w-2 rounded-full" style={{ backgroundColor: habit.color }} />
        )}
      </TouchableOpacity>
    </Animated.View>
  )
}

export default function TodayScreen() {
  const { data: userId } = useUserId()
  const queryClient = useQueryClient()

  const { data: habits, isLoading } = useQuery({
    queryKey: ['habits', userId],
    queryFn: () => getHabitsWithStreak(userId!),
    enabled: !!userId,
  })

  const checkInMutation = useMutation({
    mutationFn: ({ habitId }: { habitId: string }) => checkIn(habitId, userId!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['habits'] }),
  })

  const undoMutation = useMutation({
    mutationFn: (habitId: string) => undoCheckIn(habitId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['habits'] }),
  })

  const today = new Date().toLocaleDateString('nl-NL', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  const total = habits?.length ?? 0
  const completed = habits?.filter((h) => h.completed_today).length ?? 0

  return (
    <SafeAreaView className="flex-1 bg-[#0F0F0F]">
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="py-6 flex-row items-center justify-between">
          <View>
            <Text className="text-stone-500 text-sm capitalize">{today}</Text>
            <Text className="text-white text-2xl font-semibold mt-1">Your habits</Text>
          </View>
          <View className="bg-[#1A1A1A] rounded-2xl px-4 py-2 items-center">
            <Text className="text-accent text-xl font-bold">{completed}</Text>
            <Text className="text-stone-500 text-xs">of {total}</Text>
          </View>
        </View>

        {/* Habits */}
        {isLoading ? (
          <ActivityIndicator color="#6C63FF" className="mt-8" />
        ) : habits?.length === 0 ? (
          <View className="rounded-2xl border border-dashed border-stone-800 p-10 items-center">
            <Text className="text-white font-medium">No habits yet</Text>
            <Text className="text-stone-500 text-sm mt-1">Add some in the Habits tab</Text>
          </View>
        ) : (
          habits?.map((habit) => (
            <HabitRow
              key={habit.id}
              habit={habit}
              onPress={() =>
                habit.completed_today
                  ? undoMutation.mutate(habit.id)
                  : checkInMutation.mutate({ habitId: habit.id })
              }
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

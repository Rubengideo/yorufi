import { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Modal, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getHabitsWithStreak, createHabit, updateHabit, archiveHabit,
} from '@habit-tracker/lib'
import { supabase } from '@/lib/supabase'
import type { Frequency, HabitWithStreak } from '@habit-tracker/types'

// ─── Constants ───────────────────────────────────────────────────────────────

const ICONS = ['🏃', '📖', '🧘', '💧', '🥗', '😴', '✍️', '🎸', '🏋️', '🌿', '🎯', '🧹']
const COLORS = ['#6C63FF', '#22C55E', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899', '#8B5CF6', '#14B8A6']
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

// ─── Shared auth hook ─────────────────────────────────────────────────────────

function useUserId() {
  return useQuery({
    queryKey: ['auth-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      return user?.id ?? null
    },
  })
}

// ─── Habit Form Modal ─────────────────────────────────────────────────────────

interface HabitFormProps {
  visible: boolean
  onClose: () => void
  initial?: HabitWithStreak | null
}

function HabitFormModal({ visible, onClose, initial }: HabitFormProps) {
  const { data: userId } = useUserId()
  const queryClient = useQueryClient()

  const [name, setName] = useState(initial?.name ?? '')
  const [icon, setIcon] = useState<string | null>(initial?.icon ?? null)
  const [color, setColor] = useState(initial?.color ?? COLORS[0]!)
  const [frequencyType, setFrequencyType] = useState<'daily' | 'weekly'>(
    (initial?.frequency as Frequency)?.type ?? 'daily'
  )
  const [days, setDays] = useState<number[]>(
    (initial?.frequency as Frequency)?.type === 'weekly'
      ? ((initial?.frequency as Frequency & { days: number[] }).days ?? [1, 2, 3, 4, 5])
      : [1, 2, 3, 4, 5]
  )
  const [error, setError] = useState<string | null>(null)

  function toggleDay(d: number) {
    setDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d])
  }

  const createMutation = useMutation({
    mutationFn: (input: Parameters<typeof createHabit>[2]) =>
      createHabit(supabase, userId!, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] })
      onClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: (input: Parameters<typeof updateHabit>[2]) =>
      updateHabit(supabase, initial!.id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] })
      onClose()
    },
  })

  const isPending = createMutation.isPending || updateMutation.isPending

  async function handleSave() {
    if (!name.trim()) return
    setError(null)
    const frequency: Frequency = frequencyType === 'daily'
      ? { type: 'daily' }
      : { type: 'weekly', days }

    try {
      if (initial) {
        await updateMutation.mutateAsync({ name: name.trim(), icon, color, frequency })
      } else {
        await createMutation.mutateAsync({ name: name.trim(), icon, color, frequency })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView
        className="flex-1 bg-[#0F0F0F]"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <SafeAreaView className="flex-1">
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-stone-800">
            <TouchableOpacity onPress={onClose}>
              <Text className="text-stone-400 text-sm">Cancel</Text>
            </TouchableOpacity>
            <Text className="text-white font-semibold">{initial ? 'Edit habit' : 'New habit'}</Text>
            <TouchableOpacity onPress={handleSave} disabled={!name.trim() || isPending}>
              <Text className={`text-sm font-semibold ${name.trim() && !isPending ? 'text-[#6C63FF]' : 'text-stone-600'}`}>
                {isPending ? 'Saving…' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingVertical: 24, gap: 24 }}>
            {/* Name */}
            <View className="gap-2">
              <Text className="text-white text-sm font-medium">Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Morning run"
                placeholderTextColor="#57534e"
                maxLength={60}
                className="bg-[#1A1A1A] text-white rounded-xl px-4 py-3 text-sm border border-stone-800"
              />
            </View>

            {/* Icon */}
            <View className="gap-2">
              <Text className="text-white text-sm font-medium">Icon</Text>
              <View className="flex-row flex-wrap gap-2">
                {ICONS.map((i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setIcon(icon === i ? null : i)}
                    className={`h-10 w-10 rounded-xl items-center justify-center border ${
                      icon === i ? 'border-[#6C63FF] bg-[#6C63FF]/10' : 'border-stone-800'
                    }`}
                  >
                    <Text className="text-lg">{i}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Color */}
            <View className="gap-2">
              <Text className="text-white text-sm font-medium">Color</Text>
              <View className="flex-row gap-3">
                {COLORS.map((c) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setColor(c)}
                    className="h-7 w-7 rounded-full items-center justify-center"
                    style={{ backgroundColor: c }}
                  >
                    {color === c && <Text className="text-white text-xs font-bold">✓</Text>}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Frequency */}
            <View className="gap-3">
              <Text className="text-white text-sm font-medium">Frequency</Text>
              <View className="flex-row gap-2">
                {(['daily', 'weekly'] as const).map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setFrequencyType(t)}
                    className={`rounded-xl px-4 py-2 ${
                      frequencyType === t ? 'bg-[#6C63FF]' : 'bg-[#1A1A1A]'
                    }`}
                  >
                    <Text className={`text-sm font-medium ${frequencyType === t ? 'text-white' : 'text-stone-400'}`}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {frequencyType === 'weekly' && (
                <View className="flex-row gap-1.5">
                  {DAYS.map((d, i) => (
                    <TouchableOpacity
                      key={d}
                      onPress={() => toggleDay(i)}
                      className={`h-9 w-9 rounded-full items-center justify-center ${
                        days.includes(i) ? 'bg-[#6C63FF]' : 'bg-[#1A1A1A]'
                      }`}
                    >
                      <Text className={`text-xs font-semibold ${days.includes(i) ? 'text-white' : 'text-stone-500'}`}>
                        {d}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Error */}
            {error && (
              <View className="rounded-xl bg-red-950/40 border border-red-900 px-4 py-3">
                <Text className="text-red-400 text-sm">{error}</Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  )
}

// ─── Habit Row ────────────────────────────────────────────────────────────────

interface HabitRowProps {
  habit: HabitWithStreak
  onEdit: () => void
  onArchive: () => void
}

function HabitRow({ habit, onEdit, onArchive }: HabitRowProps) {
  const freq = habit.frequency as Frequency
  const freqLabel = freq.type === 'daily'
    ? 'Daily'
    : `${(freq as Frequency & { days: number[] }).days?.length ?? 0}× per week`

  return (
    <View className="flex-row items-center gap-4 rounded-2xl border border-stone-800 bg-[#0F0F0F] px-5 py-4 mb-2">
      {/* Color dot + icon */}
      <View
        className="h-9 w-9 rounded-full items-center justify-center"
        style={{ backgroundColor: habit.color ? `${habit.color}22` : '#1A1A1A' }}
      >
        <Text className="text-base">{habit.icon ?? '•'}</Text>
      </View>

      {/* Info */}
      <View className="flex-1">
        <Text className="text-white text-sm font-medium" numberOfLines={1}>{habit.name}</Text>
        <Text className="text-stone-500 text-xs mt-0.5">
          {freqLabel}
          {(habit.streak?.current_streak ?? 0) > 0
            ? `  ·  🔥 ${habit.streak!.current_streak} day streak`
            : ''}
        </Text>
      </View>

      {/* Actions */}
      <View className="flex-row gap-3">
        <TouchableOpacity onPress={onEdit}>
          <Text className="text-stone-400 text-sm">Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onArchive}>
          <Text className="text-red-500 text-sm">Archive</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function HabitsScreen() {
  const { data: userId } = useUserId()
  const queryClient = useQueryClient()

  const [formVisible, setFormVisible] = useState(false)
  const [editing, setEditing] = useState<HabitWithStreak | null>(null)

  const { data: habits, isLoading } = useQuery({
    queryKey: ['habits', userId],
    queryFn: () => getHabitsWithStreak(supabase, userId!),
    enabled: !!userId,
  })

  const archiveMutation = useMutation({
    mutationFn: (id: string) => archiveHabit(supabase, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['habits'] }),
  })

  function handleArchive(habit: HabitWithStreak) {
    Alert.alert(
      'Archive habit',
      `Archive "${habit.name}"? It will be hidden from your list.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          style: 'destructive',
          onPress: () => archiveMutation.mutate(habit.id),
        },
      ]
    )
  }

  function openNew() {
    setEditing(null)
    setFormVisible(true)
  }

  function openEdit(habit: HabitWithStreak) {
    setEditing(habit)
    setFormVisible(true)
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0F0F0F]">
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="py-6 flex-row items-center justify-between">
          <Text className="text-white text-2xl font-semibold">Habits</Text>
          <TouchableOpacity onPress={openNew} className="bg-[#6C63FF] rounded-xl px-4 py-2">
            <Text className="text-white text-sm font-semibold">+ New</Text>
          </TouchableOpacity>
        </View>

        {/* List */}
        {isLoading ? (
          <ActivityIndicator color="#6C63FF" className="mt-8" />
        ) : habits?.length === 0 ? (
          <View className="rounded-2xl border border-stone-800 p-10 items-center" style={{ borderStyle: 'dashed' }}>
            <Text className="text-white font-medium">No habits yet</Text>
            <Text className="text-stone-500 text-sm mt-1 text-center">Tap "+ New" to create your first habit</Text>
          </View>
        ) : (
          habits?.map((habit) => (
            <HabitRow
              key={habit.id}
              habit={habit}
              onEdit={() => openEdit(habit)}
              onArchive={() => handleArchive(habit)}
            />
          ))
        )}
      </ScrollView>

      {/* Form Modal */}
      <HabitFormModal
        visible={formVisible}
        onClose={() => setFormVisible(false)}
        initial={editing}
      />
    </SafeAreaView>
  )
}

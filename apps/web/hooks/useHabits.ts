'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSupabase, useUserId } from './useAuth'
import {
  getHabitsWithStreak,
  checkIn,
  undoCheckIn,
  createHabit,
  archiveHabit,
  updateHabit,
  getHabit,
  type CreateHabitInput,
  type UpdateHabitInput,
} from '@habit-tracker/lib'

export function useHabits() {
  const supabase = useSupabase()
  const { data: userId } = useUserId()

  return useQuery({
    queryKey: ['habits', userId],
    queryFn: () => getHabitsWithStreak(supabase, userId!),
    enabled: !!userId,
  })
}

export function useCheckIn() {
  const supabase = useSupabase()
  const queryClient = useQueryClient()
  const { data: userId } = useUserId()

  return useMutation({
    mutationFn: ({ habitId, note }: { habitId: string; note?: string }) =>
      checkIn(supabase, habitId, userId!, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits', userId] })
    },
  })
}

export function useUndoCheckIn() {
  const supabase = useSupabase()
  const queryClient = useQueryClient()
  const { data: userId } = useUserId()

  return useMutation({
    mutationFn: (habitId: string) => undoCheckIn(supabase, habitId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits', userId] })
    },
  })
}

export function useCreateHabit() {
  const supabase = useSupabase()
  const queryClient = useQueryClient()
  const { data: userId } = useUserId()

  return useMutation({
    mutationFn: (input: CreateHabitInput) => createHabit(supabase, userId!, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits', userId] })
    },
  })
}

export function useArchiveHabit() {
  const supabase = useSupabase()
  const queryClient = useQueryClient()
  const { data: userId } = useUserId()

  return useMutation({
    mutationFn: (habitId: string) => archiveHabit(supabase, habitId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits', userId] })
    },
  })
}

export function useHabit(habitId: string) {
  const supabase = useSupabase()

  return useQuery({
    queryKey: ['habit', habitId],
    queryFn: () => getHabit(supabase, habitId),
    enabled: !!habitId,
  })
}

export function useUpdateHabit() {
  const supabase = useSupabase()
  const queryClient = useQueryClient()
  const { data: userId } = useUserId()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateHabitInput }) =>
      updateHabit(supabase, id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['habits', userId] })
      queryClient.invalidateQueries({ queryKey: ['habit', id] })
    },
  })
}

'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSupabase, useUserId } from './useAuth'
import {
  getTasks,
  createTask,
  updateTask,
  completeTask,
  uncompleteTask,
  archiveTask,
} from '@habit-tracker/lib'
import type { CreateTaskInput, UpdateTaskInput, TaskFilter } from '@habit-tracker/types'

export function useTasks(filter?: TaskFilter) {
  const supabase = useSupabase()
  const { data: userId } = useUserId()

  return useQuery({
    queryKey: ['tasks', userId, filter],
    queryFn: () => getTasks(supabase, userId!, filter),
    enabled: !!userId,
  })
}

export function useTodayTasks() {
  return useTasks('today')
}

export function useCreateTask() {
  const supabase = useSupabase()
  const queryClient = useQueryClient()
  const { data: userId } = useUserId()

  return useMutation({
    mutationFn: (input: CreateTaskInput) => createTask(supabase, userId!, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', userId] })
    },
  })
}

export function useUpdateTask() {
  const supabase = useSupabase()
  const queryClient = useQueryClient()
  const { data: userId } = useUserId()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTaskInput }) =>
      updateTask(supabase, id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', userId] })
    },
  })
}

export function useCompleteTask() {
  const supabase = useSupabase()
  const queryClient = useQueryClient()
  const { data: userId } = useUserId()

  return useMutation({
    mutationFn: (id: string) => completeTask(supabase, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', userId] })
    },
  })
}

export function useUncompleteTask() {
  const supabase = useSupabase()
  const queryClient = useQueryClient()
  const { data: userId } = useUserId()

  return useMutation({
    mutationFn: (id: string) => uncompleteTask(supabase, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', userId] })
    },
  })
}

export function useArchiveTask() {
  const supabase = useSupabase()
  const queryClient = useQueryClient()
  const { data: userId } = useUserId()

  return useMutation({
    mutationFn: (id: string) => archiveTask(supabase, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', userId] })
    },
  })
}

/** Synchroniseer een taak naar Google Agenda. Slaat gcal_event_id op in de DB. */
export function useSyncTaskToCalendar() {
  const queryClient = useQueryClient()
  const { data: userId } = useUserId()

  return useMutation({
    mutationFn: async (task: { id: string; title: string; due_date: string | null; priority: string; gcal_event_id?: string | null }) => {
      const res = await fetch('/api/calendar/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId:     task.id,
          title:      task.title,
          dueDate:    task.due_date,
          priority:   task.priority,
          gcalEventId: task.gcal_event_id,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Synchronisatie mislukt')
      }
      return res.json() as Promise<{ gcalEventId: string; htmlLink: string }>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', userId] })
    },
  })
}

/** Verwijder een taak uit Google Agenda. */
export function useRemoveTaskFromCalendar() {
  const queryClient = useQueryClient()
  const { data: userId } = useUserId()

  return useMutation({
    mutationFn: async ({ taskId, gcalEventId }: { taskId: string; gcalEventId: string }) => {
      const res = await fetch('/api/calendar/push', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, gcalEventId }),
      })
      if (!res.ok) throw new Error('Verwijderen mislukt')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', userId] })
    },
  })
}

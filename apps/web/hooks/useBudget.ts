'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSupabase, useUserId } from './useAuth'
import { useToastStore } from './useToast'
import {
  getBudgetSettings,
  updateBudgetSettings,
  getBudgetItems,
  createBudgetItem,
  updateBudgetItem,
  deleteBudgetItem,
  getBudgetSummary,
  type UpdateBudgetSettingsInput,
  type CreateBudgetItemInput,
  type UpdateBudgetItemInput,
} from '@habit-tracker/lib'

// ─── Settings ────────────────────────────────────────────────

export function useBudgetSettings() {
  const supabase = useSupabase()
  const { data: userId } = useUserId()

  return useQuery({
    queryKey: ['budget-settings', userId],
    queryFn: () => getBudgetSettings(supabase, userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpdateBudgetSettings() {
  const supabase = useSupabase()
  const queryClient = useQueryClient()
  const { data: userId } = useUserId()
  const addToast = useToastStore((s) => s.addToast)

  return useMutation({
    mutationFn: (input: UpdateBudgetSettingsInput) =>
      updateBudgetSettings(supabase, userId!, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-settings', userId] })
      queryClient.invalidateQueries({ queryKey: ['budget-summary', userId] })
    },
    onError: () => addToast({ type: 'error', message: 'Budget-instellingen opslaan mislukt. Probeer het opnieuw.' }),
  })
}

// ─── Items ───────────────────────────────────────────────────

export function useBudgetItems() {
  const supabase = useSupabase()
  const { data: userId } = useUserId()

  return useQuery({
    queryKey: ['budget-items', userId],
    queryFn: () => getBudgetItems(supabase, userId!),
    enabled: !!userId,
  })
}

export function useCreateBudgetItem() {
  const supabase = useSupabase()
  const queryClient = useQueryClient()
  const { data: userId } = useUserId()
  const addToast = useToastStore((s) => s.addToast)

  return useMutation({
    mutationFn: (input: CreateBudgetItemInput) =>
      createBudgetItem(supabase, userId!, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-items', userId] })
      queryClient.invalidateQueries({ queryKey: ['budget-summary', userId] })
    },
    onError: () => addToast({ type: 'error', message: 'Budgetpost opslaan mislukt. Probeer het opnieuw.' }),
  })
}

export function useUpdateBudgetItem() {
  const supabase = useSupabase()
  const queryClient = useQueryClient()
  const { data: userId } = useUserId()
  const addToast = useToastStore((s) => s.addToast)

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateBudgetItemInput }) =>
      updateBudgetItem(supabase, id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-items', userId] })
      queryClient.invalidateQueries({ queryKey: ['budget-summary', userId] })
    },
    onError: () => addToast({ type: 'error', message: 'Budgetpost bijwerken mislukt. Probeer het opnieuw.' }),
  })
}

export function useDeleteBudgetItem() {
  const supabase = useSupabase()
  const queryClient = useQueryClient()
  const { data: userId } = useUserId()
  const addToast = useToastStore((s) => s.addToast)

  return useMutation({
    mutationFn: (id: string) => deleteBudgetItem(supabase, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-items', userId] })
      queryClient.invalidateQueries({ queryKey: ['budget-summary', userId] })
    },
    onError: () => addToast({ type: 'error', message: 'Budgetpost verwijderen mislukt. Probeer het opnieuw.' }),
  })
}

// ─── Summary ─────────────────────────────────────────────────

export function useBudgetSummary(params?: { year: number; month: number }) {
  const supabase = useSupabase()
  const { data: userId } = useUserId()

  return useQuery({
    queryKey: ['budget-summary', userId, params?.year, params?.month],
    queryFn: () => getBudgetSummary(supabase, userId!, params?.year, params?.month),
    enabled: !!userId,
    staleTime: 30 * 1000,
  })
}

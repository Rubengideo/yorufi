'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSupabase, useUserId } from './useAuth'
import { useToastStore } from './useToast'
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getMonthlySummary,
  getBudgets,
  upsertBudget,
  type CreateExpenseInput,
  type UpdateExpenseInput,
} from '@habit-tracker/lib'
import type { ExpenseCategory } from '@habit-tracker/types'

// ─── Expenses ────────────────────────────────────────────────

export function useExpenses(year: number, month: number) {
  const supabase = useSupabase()
  const { data: userId } = useUserId()

  return useQuery({
    queryKey: ['expenses', userId, year, month],
    queryFn: () => getExpenses(supabase, userId!, year, month),
    enabled: !!userId,
  })
}

export function useCreateExpense() {
  const supabase = useSupabase()
  const queryClient = useQueryClient()
  const { data: userId } = useUserId()
  const addToast = useToastStore((s) => s.addToast)

  return useMutation({
    mutationFn: (input: CreateExpenseInput) =>
      createExpense(supabase, userId!, input),
    onSuccess: (data) => {
      const date = new Date(data.date + 'T00:00:00')
      const y = date.getFullYear()
      const m = date.getMonth() + 1
      queryClient.invalidateQueries({ queryKey: ['expenses', userId, y, m] })
      queryClient.invalidateQueries({ queryKey: ['expense-summary', userId, y, m] })
      queryClient.invalidateQueries({ queryKey: ['expense-summary', userId] })
    },
    onError: () => addToast({ type: 'error', message: 'Uitgave opslaan mislukt. Probeer het opnieuw.' }),
  })
}

export function useUpdateExpense() {
  const supabase = useSupabase()
  const queryClient = useQueryClient()
  const { data: userId } = useUserId()
  const addToast = useToastStore((s) => s.addToast)

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateExpenseInput }) =>
      updateExpense(supabase, id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', userId] })
      queryClient.invalidateQueries({ queryKey: ['expense-summary', userId] })
    },
    onError: () => addToast({ type: 'error', message: 'Uitgave bijwerken mislukt. Probeer het opnieuw.' }),
  })
}

export function useDeleteExpense() {
  const supabase = useSupabase()
  const queryClient = useQueryClient()
  const { data: userId } = useUserId()
  const addToast = useToastStore((s) => s.addToast)

  return useMutation({
    mutationFn: (id: string) => deleteExpense(supabase, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', userId] })
      queryClient.invalidateQueries({ queryKey: ['expense-summary', userId] })
    },
    onError: () => addToast({ type: 'error', message: 'Uitgave verwijderen mislukt. Probeer het opnieuw.' }),
  })
}

// ─── Summary ─────────────────────────────────────────────────

export function useMonthlySummary(year: number, month: number) {
  const supabase = useSupabase()
  const { data: userId } = useUserId()

  return useQuery({
    queryKey: ['expense-summary', userId, year, month],
    queryFn: () => getMonthlySummary(supabase, userId!, year, month),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  })
}

// ─── Budgets ─────────────────────────────────────────────────

export function useExpenseBudgets() {
  const supabase = useSupabase()
  const { data: userId } = useUserId()

  return useQuery({
    queryKey: ['expense-budgets', userId],
    queryFn: () => getBudgets(supabase, userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpsertBudget() {
  const supabase = useSupabase()
  const queryClient = useQueryClient()
  const { data: userId } = useUserId()
  const addToast = useToastStore((s) => s.addToast)

  return useMutation({
    mutationFn: ({
      category,
      monthly_limit,
      currency,
    }: {
      category: ExpenseCategory
      monthly_limit: number
      currency?: string
    }) => upsertBudget(supabase, userId!, category, monthly_limit, currency),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-budgets', userId] })
      queryClient.invalidateQueries({ queryKey: ['expense-summary', userId] })
    },
    onError: () => addToast({ type: 'error', message: 'Budget opslaan mislukt. Probeer het opnieuw.' }),
  })
}

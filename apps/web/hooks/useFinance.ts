'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSupabase, useUserId } from './useAuth'
import { useToastStore } from './useToast'
import {
  getAccounts,
  getAccount,
  createAccount,
  updateAccount,
  archiveAccount,
  recordSnapshot,
  getSnapshots,
  getGoals,
  createGoal,
  updateGoal,
  archiveGoal,
  getNetWorthSummary,
  getNetWorthHistory,
  type CreateAccountInput,
  type UpdateAccountInput,
  type CreateSnapshotInput,
  type CreateGoalInput,
  type UpdateGoalInput,
} from '@habit-tracker/lib'

// ─── Accounts ────────────────────────────────────────────────

export function useFinanceAccounts() {
  const supabase = useSupabase()
  const { data: userId } = useUserId()

  return useQuery({
    queryKey: ['finance-accounts', userId],
    queryFn: () => getAccounts(supabase, userId!),
    enabled: !!userId,
  })
}

export function useFinanceAccount(accountId: string) {
  const supabase = useSupabase()

  return useQuery({
    queryKey: ['finance-account', accountId],
    queryFn: () => getAccount(supabase, accountId),
    enabled: !!accountId,
  })
}

export function useCreateAccount() {
  const supabase = useSupabase()
  const queryClient = useQueryClient()
  const { data: userId } = useUserId()
  const addToast = useToastStore((s) => s.addToast)

  return useMutation({
    mutationFn: (input: CreateAccountInput) =>
      createAccount(supabase, userId!, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-accounts'] })
      queryClient.invalidateQueries({ queryKey: ['finance-net-worth'] })
    },
    onError: () => addToast({ type: 'error', message: 'Rekening opslaan mislukt. Probeer het opnieuw.' }),
  })
}

export function useUpdateAccount() {
  const supabase = useSupabase()
  const queryClient = useQueryClient()
  const addToast = useToastStore((s) => s.addToast)

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAccountInput }) =>
      updateAccount(supabase, id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['finance-accounts'] })
      queryClient.invalidateQueries({ queryKey: ['finance-account', id] })
      queryClient.invalidateQueries({ queryKey: ['finance-net-worth'] })
    },
    onError: () => addToast({ type: 'error', message: 'Rekening bijwerken mislukt. Probeer het opnieuw.' }),
  })
}

export function useArchiveAccount() {
  const supabase = useSupabase()
  const queryClient = useQueryClient()
  const addToast = useToastStore((s) => s.addToast)

  return useMutation({
    mutationFn: (accountId: string) => archiveAccount(supabase, accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-accounts'] })
      queryClient.invalidateQueries({ queryKey: ['finance-net-worth'] })
    },
    onError: () => addToast({ type: 'error', message: 'Rekening verwijderen mislukt. Probeer het opnieuw.' }),
  })
}

// ─── Snapshots ───────────────────────────────────────────────

export function useSnapshots(accountId: string, from: string, to: string) {
  const supabase = useSupabase()

  return useQuery({
    queryKey: ['finance-snapshots', accountId, from, to],
    queryFn: () => getSnapshots(supabase, accountId, from, to),
    enabled: !!accountId,
  })
}

export function useRecordSnapshot() {
  const supabase = useSupabase()
  const queryClient = useQueryClient()
  const { data: userId } = useUserId()
  const addToast = useToastStore((s) => s.addToast)

  return useMutation({
    mutationFn: (input: CreateSnapshotInput) =>
      recordSnapshot(supabase, userId!, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['finance-snapshots', data.account_id] })
      queryClient.invalidateQueries({ queryKey: ['finance-accounts'] })
      queryClient.invalidateQueries({ queryKey: ['finance-net-worth'] })
      queryClient.invalidateQueries({ queryKey: ['finance-history'] })
    },
    onError: () => addToast({ type: 'error', message: 'Saldo-update opslaan mislukt. Probeer het opnieuw.' }),
  })
}

// ─── Goals ───────────────────────────────────────────────────

export function useFinanceGoals() {
  const supabase = useSupabase()
  const { data: userId } = useUserId()

  return useQuery({
    queryKey: ['finance-goals', userId],
    queryFn: () => getGoals(supabase, userId!),
    enabled: !!userId,
  })
}

export function useCreateGoal() {
  const supabase = useSupabase()
  const queryClient = useQueryClient()
  const { data: userId } = useUserId()
  const addToast = useToastStore((s) => s.addToast)

  return useMutation({
    mutationFn: (input: CreateGoalInput) =>
      createGoal(supabase, userId!, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-goals'] })
    },
    onError: () => addToast({ type: 'error', message: 'Doel opslaan mislukt. Probeer het opnieuw.' }),
  })
}

export function useUpdateGoal() {
  const supabase = useSupabase()
  const queryClient = useQueryClient()
  const addToast = useToastStore((s) => s.addToast)

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateGoalInput }) =>
      updateGoal(supabase, id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-goals'] })
    },
    onError: () => addToast({ type: 'error', message: 'Doel bijwerken mislukt. Probeer het opnieuw.' }),
  })
}

export function useArchiveGoal() {
  const supabase = useSupabase()
  const queryClient = useQueryClient()
  const addToast = useToastStore((s) => s.addToast)

  return useMutation({
    mutationFn: (goalId: string) => archiveGoal(supabase, goalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-goals'] })
    },
    onError: () => addToast({ type: 'error', message: 'Doel verwijderen mislukt. Probeer het opnieuw.' }),
  })
}

// ─── Net Worth ───────────────────────────────────────────────

export function useNetWorth() {
  const supabase = useSupabase()
  const { data: userId } = useUserId()

  return useQuery({
    queryKey: ['finance-net-worth', userId],
    queryFn: () => getNetWorthSummary(supabase, userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,  // 5 min — mirrors useStats.ts
  })
}

export function useNetWorthHistory(from: string, to: string) {
  const supabase = useSupabase()
  const { data: userId } = useUserId()

  return useQuery({
    queryKey: ['finance-history', userId, from, to],
    queryFn: () => getNetWorthHistory(supabase, userId!, from, to),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })
}

'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSupabase, useUserId } from './useAuth'
import type { Profile } from '@habit-tracker/types'

export function useProfile() {
  const supabase = useSupabase()
  const { data: userId } = useUserId()

  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, timezone, email_digest, theme, currency, push_token, created_at')
        .eq('id', userId!)
        .single()
      if (error) throw error
      return data as Profile
    },
    enabled: !!userId,
  })
}

export function useUpdateProfile() {
  const supabase = useSupabase()
  const queryClient = useQueryClient()
  const { data: userId } = useUserId()

  return useMutation({
    mutationFn: (updates: Partial<Omit<Profile, 'id' | 'created_at'>>) =>
      supabase.from('profiles').update(updates).eq('id', userId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] })
    },
  })
}

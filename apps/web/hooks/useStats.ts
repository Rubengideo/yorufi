'use client'

import { useQuery } from '@tanstack/react-query'
import { getStatsData } from '@habit-tracker/lib'
import { useSupabase, useUserId } from './useAuth'

export function useStats() {
  const supabase = useSupabase()
  const { data: userId } = useUserId()

  return useQuery({
    queryKey: ['stats', userId],
    queryFn: () => getStatsData(supabase, userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })
}

'use client'

import { useQuery } from '@tanstack/react-query'
import { createBrowserSupabase } from '@/lib/supabase-browser'

export function useSupabase() {
  return createBrowserSupabase()
}

export function useUserId() {
  const supabase = useSupabase()
  return useQuery({
    queryKey: ['auth-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      return user?.id ?? null
    },
  })
}

import { useEffect, useState } from 'react'
import { Stack, router } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Session } from '@supabase/supabase-js'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: 1 },
  },
})

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        router.replace('/(tabs)/')
      } else {
        router.replace('/(auth)/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) return null

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </QueryClientProvider>
  )
}

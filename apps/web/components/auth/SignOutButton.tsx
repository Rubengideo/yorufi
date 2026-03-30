'use client'

import { useRouter } from 'next/navigation'
import { createBrowserSupabase } from '@/lib/supabase-browser'

export function SignOutButton() {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createBrowserSupabase()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-sm text-red-500 hover:text-red-600 font-medium transition"
    >
      Sign out
    </button>
  )
}

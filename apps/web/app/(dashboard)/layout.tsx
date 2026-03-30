import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase-server'
import { Sidebar } from '@/components/ui/Sidebar'
import { Toaster } from '@/components/ui/Toaster'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="flex min-h-screen bg-white dark:bg-[#0F0F0F]">
      <Sidebar />
      <main className="flex-1 pt-14 md:pt-0 md:pl-64">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6 md:py-10">
          {children}
        </div>
      </main>
      <Toaster />
    </div>
  )
}

import type { Metadata } from 'next'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = { title: 'Login' }

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white dark:bg-[#0F0F0F] px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            We&apos;ll send you a magic link to sign in.
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}

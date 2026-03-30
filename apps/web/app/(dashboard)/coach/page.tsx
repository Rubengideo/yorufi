import dynamic from 'next/dynamic'

const CoachChat = dynamic(
  () => import('@/components/ai/CoachChat').then((m) => ({ default: m.CoachChat })),
  {
    loading: () => (
      <div className="h-[520px] animate-pulse rounded-2xl bg-stone-100 dark:bg-stone-900" />
    ),
  },
)

const HabitSuggestor = dynamic(
  () => import('@/components/ai/HabitSuggestor').then((m) => ({ default: m.HabitSuggestor })),
  {
    loading: () => (
      <div className="h-40 animate-pulse rounded-2xl bg-stone-100 dark:bg-stone-900" />
    ),
  },
)

export default function CoachPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">AI Coach</h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          Get personalised advice and discover habits that fit your goals.
        </p>
      </div>

      {/* Habit Suggestor */}
      <section>
        <h2 className="text-base font-semibold mb-4">Habit suggestions</h2>
        <div className="rounded-2xl border border-stone-100 dark:border-stone-900 bg-white dark:bg-[#0F0F0F] p-6">
          <HabitSuggestor />
        </div>
      </section>

      {/* Coach Chat */}
      <section>
        <h2 className="text-base font-semibold mb-4">Chat with your coach</h2>
        <div className="rounded-2xl border border-stone-100 dark:border-stone-900 bg-white dark:bg-[#0F0F0F] p-6 h-[520px] flex flex-col">
          <CoachChat />
        </div>
      </section>
    </div>
  )
}

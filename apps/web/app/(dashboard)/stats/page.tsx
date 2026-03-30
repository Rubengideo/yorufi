import type { Metadata } from 'next'
import { StatsView } from '@/components/stats/StatsView'

export const metadata: Metadata = { title: 'Stats' }

export default function StatsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Stats</h1>
      <StatsView />
    </div>
  )
}

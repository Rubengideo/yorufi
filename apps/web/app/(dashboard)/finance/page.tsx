import type { Metadata } from 'next'
import { FinanceDashboard } from '@/components/finance/FinanceDashboard'

export const metadata: Metadata = { title: 'Finance' }

export default function FinancePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Finance</h1>
      </div>
      <FinanceDashboard />
    </div>
  )
}

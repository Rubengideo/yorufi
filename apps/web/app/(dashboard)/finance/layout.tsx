'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const FINANCE_CRUMBS: { match: (p: string) => boolean; label: string; parent?: { href: string; label: string } }[] = [
  { match: (p) => p === '/finance/budget',          label: 'Maandbudget' },
  { match: (p) => p === '/finance/expenses',        label: 'Uitgaven' },
  { match: (p) => p === '/finance/goals',           label: 'Doelen' },
  { match: (p) => p === '/finance/expenses/import', label: 'Importeren', parent: { href: '/finance/expenses', label: 'Uitgaven' } },
]

function FinanceBreadcrumb() {
  const pathname = usePathname()
  const crumb = FINANCE_CRUMBS.find((c) => c.match(pathname))

  if (!crumb) return null

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm mb-4">
      <Link
        href="/finance"
        className="text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
      >
        Finance
      </Link>
      {crumb.parent && (
        <>
          <span className="text-stone-300 dark:text-stone-700">/</span>
          <Link
            href={crumb.parent.href}
            className="text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
          >
            {crumb.parent.label}
          </Link>
        </>
      )}
      <span className="text-stone-300 dark:text-stone-700">/</span>
      <span className="text-stone-700 dark:text-stone-300 font-medium">{crumb.label}</span>
    </nav>
  )
}

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <FinanceBreadcrumb />
      {children}
    </div>
  )
}

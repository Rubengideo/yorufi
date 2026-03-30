'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const nav = [
  { href: '/today',    label: 'Today',    icon: '◎' },
  { href: '/habits',   label: 'Habits',   icon: '≡' },
  { href: '/tasks',    label: 'Taken',    icon: '☑' },
  { href: '/stats',    label: 'Stats',    icon: '∿' },
  { href: '/finance',  label: 'Finance',  icon: '◈' },
  { href: '/coach',    label: 'AI Coach', icon: '✦' },
  { href: '/settings', label: 'Settings', icon: '⊙' },
] as const

const financeSubnav = [
  { href: '/finance',          label: 'Overzicht' },
  { href: '/finance/budget',   label: 'Maandbudget' },
  { href: '/finance/expenses', label: 'Uitgaven' },
  { href: '/finance/goals',    label: 'Doelen' },
]

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <>
      <nav className="space-y-1 flex-1">
        {nav.map(({ href, label, icon }) => {
          const active = pathname.startsWith(href)
          return (
            <div key={href}>
              <Link
                href={href}
                onClick={onNavigate}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-stone-100 dark:bg-stone-900 text-stone-950 dark:text-white'
                    : 'text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-900/50 hover:text-stone-950 dark:hover:text-white'
                }`}
              >
                <span className="text-base">{icon}</span>
                {label}
              </Link>

              {href === '/finance' && active && (
                <div className="ml-4 mt-0.5 mb-1 space-y-0.5 border-l border-stone-100 dark:border-stone-800 pl-3">
                  {financeSubnav.map(({ href: sub, label: subLabel }) => {
                    const subActive = sub === '/finance'
                      ? pathname === '/finance'
                      : pathname.startsWith(sub)
                    return (
                      <Link
                        key={sub}
                        href={sub}
                        onClick={onNavigate}
                        className={`flex items-center rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
                          subActive
                            ? 'text-stone-950 dark:text-white'
                            : 'text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
                        }`}
                      >
                        {subLabel}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      <div className="border-t border-stone-100 dark:border-stone-900 pt-4">
        <Link
          href="/settings"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white transition-colors"
        >
          <span className="h-6 w-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-semibold">
            U
          </span>
          Account
        </Link>
      </div>
    </>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* ── Mobile top bar ─────────────────────────────────────────────── */}
      <header className="md:hidden fixed top-0 inset-x-0 z-40 h-14 flex items-center px-4 border-b border-stone-100 dark:border-stone-900 bg-white dark:bg-[#0F0F0F]">
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="p-2 -ml-2 rounded-xl text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M3 5h14M3 10h14M3 15h14" />
          </svg>
        </button>
        <span className="ml-3 text-base font-semibold tracking-tight">Habits</span>
      </header>

      {/* ── Mobile drawer overlay ───────────────────────────────────────── */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Mobile drawer ──────────────────────────────────────────────── */}
      <aside
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-64 flex flex-col px-4 py-8 border-r border-stone-100 dark:border-stone-900 bg-white dark:bg-[#0F0F0F] transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-10 px-3 flex items-center justify-between">
          <span className="text-xl font-semibold tracking-tight">Habits</span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M2 2l12 12M14 2L2 14" />
            </svg>
          </button>
        </div>
        <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
      </aside>

      {/* ── Desktop sidebar ────────────────────────────────────────────── */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 border-r border-stone-100 dark:border-stone-900 bg-white dark:bg-[#0F0F0F] flex-col px-4 py-8">
        <div className="mb-10 px-3">
          <span className="text-xl font-semibold tracking-tight">Habits</span>
        </div>
        <NavLinks pathname={pathname} />
      </aside>
    </>
  )
}

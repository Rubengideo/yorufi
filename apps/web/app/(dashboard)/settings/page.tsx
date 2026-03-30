import type { Metadata } from 'next'
import { SignOutButton } from '@/components/auth/SignOutButton'
import { TimezoneSettings } from '@/components/settings/TimezoneSettings'
import { EmailDigestToggle } from '@/components/settings/EmailDigestToggle'
import { ThemeToggle } from '@/components/settings/ThemeToggle'
import { CurrencySettings } from '@/components/settings/CurrencySettings'
import { GoogleCalendarStatus } from '@/components/settings/GoogleCalendarStatus'

export const metadata: Metadata = { title: 'Instellingen' }

export default function SettingsPage() {
  return (
    <div className="max-w-lg space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">Instellingen</h1>

      {/* Weergave */}
      <section className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400">Weergave</h2>
        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 divide-y divide-stone-100 dark:divide-stone-900">
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-sm font-medium">Thema</p>
              <p className="text-xs text-stone-400 mt-0.5">Kies licht, donker of volg je systeeminstelling</p>
            </div>
            <ThemeToggle />
          </div>
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-sm font-medium">Valuta</p>
              <p className="text-xs text-stone-400 mt-0.5">Standaardvaluta voor het financiëndashboard</p>
            </div>
            <CurrencySettings />
          </div>
        </div>
      </section>

      {/* Notificaties */}
      <section className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400">Notificaties</h2>
        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 divide-y divide-stone-100 dark:divide-stone-900">
          <div className="px-5 py-4 space-y-2">
            <div>
              <p className="text-sm font-medium">Tijdzone</p>
              <p className="text-xs text-stone-400 mt-0.5">Gebruikt om herinneringen op het juiste lokale tijdstip te sturen</p>
            </div>
            <TimezoneSettings />
          </div>
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-sm font-medium">Dagelijkse digest</p>
              <p className="text-xs text-stone-400 mt-0.5">
                Ontvang elke ochtend om 8:00 een overzicht van je habits en taken voor vandaag.
              </p>
            </div>
            <EmailDigestToggle />
          </div>
        </div>
      </section>

      {/* Verbonden apps */}
      <section className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400">Verbonden apps</h2>
        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 divide-y divide-stone-100 dark:divide-stone-900">
          <div className="px-5 py-4 space-y-2">
            <div className="flex items-center gap-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-stone-400 shrink-0">
                <rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M3 9h18M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <p className="text-sm font-medium">Google Agenda</p>
            </div>
            <GoogleCalendarStatus />
          </div>
        </div>
      </section>

      {/* Account */}
      <section className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400">Account</h2>
        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 divide-y divide-stone-100 dark:divide-stone-900">
          <div className="flex items-center justify-between px-5 py-4">
            <span className="text-sm font-medium">Uitloggen</span>
            <SignOutButton />
          </div>
        </div>
      </section>
    </div>
  )
}

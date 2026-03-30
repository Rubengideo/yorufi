# Habit Tracker — Architecture

> Premium, cross-platform habit tracker. Web (Next.js) + Mobile (React Native / Expo) met Supabase als backend.
> **Lees dit bestand aan het begin van elke sessie om de huidige staat te kennen.**

---

## Stack Overview

| Layer | Technology | Rationale |
|---|---|---|
| Web frontend | Next.js 15 (App Router) | SSR, file-based routing, Server Components |
| Mobile frontend | Expo (React Native) | iOS + Android, gedeelde logica met web |
| Shared UI library | `packages/ui` (NativeWind + Tailwind) | Één design system voor web en mobile |
| State management | Zustand + React Query (TanStack) | Lokale UI state + server state sync |
| Backend | Supabase | Postgres, Auth, Realtime, Storage |
| API-laag | Supabase client (direct) + Edge Functions | Lichte custom logica in Deno |
| AI-laag | Anthropic SDK (`@anthropic-ai/sdk`) | Streaming coach chat + habit suggesties via Claude |
| Monorepo tooling | Turborepo + npm workspaces | Gedeelde packages, snelle builds |

---

## Monorepo Structuur

```
habit-tracker/
├── apps/
│   ├── web/                  # Next.js 15 app
│   │   ├── app/
│   │   │   ├── (auth)/       # Login, auth callback
│   │   │   ├── (dashboard)/  # Hoofd app na login
│   │   │   │   ├── today/    # Dagelijkse check-in view
│   │   │   │   ├── habits/   # Habit management (+ [id]/edit/, new/)
│   │   │   │   ├── stats/    # Analytics & streaks
│   │   │   │   ├── tasks/    # Taken-systeem (inbox / vandaag / aankomend)
│   │   │   │   ├── finance/  # Finance dashboard
│   │   │   │   │   ├── goals/
│   │   │   │   │   ├── expenses/
│   │   │   │   │   │   └── import/
│   │   │   │   │   └── budget/
│   │   │   │   ├── coach/    # AI Coach (chat + suggesties)
│   │   │   │   └── settings/ # Account & preferences
│   │   │   ├── api/
│   │   │   │   └── ai/
│   │   │   │       ├── coach/route.ts    # Streaming chat (Claude)
│   │   │   │       └── suggest/route.ts  # Habit suggesties (Claude tool use)
│   │   │   ├── middleware.ts
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── ai/           # CoachChat, HabitSuggestor
│   │   │   ├── auth/         # LoginForm, SignOutButton
│   │   │   ├── finance/
│   │   │   │   ├── FinanceDashboard.tsx
│   │   │   │   ├── NetWorthCard.tsx      # Kaart met range-selector + periode-delta
│   │   │   │   ├── NetWorthChart.tsx     # Recharts bezier-grafiek + hover tooltip
│   │   │   │   ├── AccountsList.tsx      # Bezittingen / Schulden secties
│   │   │   │   ├── AccountCard.tsx       # Kaart met aflosbalk voor schulden
│   │   │   │   ├── AccountForm.tsx
│   │   │   │   ├── SnapshotModal.tsx
│   │   │   │   ├── ExpenseDashboardCard.tsx
│   │   │   │   ├── ExpensesView.tsx
│   │   │   │   ├── ExpensesList.tsx
│   │   │   │   ├── ExpenseItem.tsx
│   │   │   │   ├── ExpenseForm.tsx
│   │   │   │   ├── ExpenseSummary.tsx
│   │   │   │   ├── ExpenseImport.tsx
│   │   │   │   ├── CategoryBreakdown.tsx
│   │   │   │   ├── MonthNavigator.tsx
│   │   │   │   ├── GoalCard.tsx
│   │   │   │   ├── GoalForm.tsx
│   │   │   │   ├── GoalsList.tsx
│   │   │   │   └── budget/
│   │   │   │       ├── BudgetView.tsx
│   │   │   │       ├── BudgetBucketCard.tsx
│   │   │   │       ├── BudgetDonutChart.tsx
│   │   │   │       ├── BudgetAllocationTable.tsx
│   │   │   │       ├── BudgetItemForm.tsx
│   │   │   │       ├── BudgetSettingsPanel.tsx
│   │   │   │       └── ApplyRecurringModal.tsx
│   │   │   ├── habits/       # HabitCard, HabitsList, TodayView, forms
│   │   │   ├── stats/        # StatsView, HeatmapCalendar, HabitStatsCard
│   │   │   ├── settings/     # TimezoneSettings
│   │   │   └── ui/           # Sidebar
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useHabits.ts
│   │   │   ├── useStats.ts
│   │   │   ├── useFinance.ts  # useNetWorth, useNetWorthHistory, useFinanceAccounts, useFinanceGoals, ...
│   │   │   ├── useExpenses.ts # useMonthlySummary, useExpenses, ...
│   │   │   ├── useBudget.ts   # useBudgetSummary, useBudgetSettings, useBudgetItems, ...
│   │   │   └── useTasks.ts
│   │   ├── lib/
│   │   │   ├── supabase-browser.ts
│   │   │   └── supabase-server.ts
│   │   └── package.json
│   └── mobile/               # Expo app
│       ├── app/
│       │   ├── (auth)/
│       │   │   └── login.tsx
│       │   └── (tabs)/
│       │       ├── index.tsx  # Today
│       │       ├── habits.tsx
│       │       ├── stats.tsx
│       │       └── settings.tsx
│       ├── lib/
│       │   └── supabase.ts
│       └── package.json
├── packages/
│   ├── ui/                   # Gedeelde componenten (web + mobile)
│   ├── lib/                  # Gedeelde business logic
│   │   └── src/
│   │       ├── habits.ts
│   │       ├── streaks.ts
│   │       ├── dates.ts
│   │       ├── finance.ts    # Finance CRUD + getNetWorthHistory + getNetWorthSummary
│   │       ├── expenses.ts   # Expenses + budgets CRUD
│   │       └── index.ts
│   └── types/
│       └── src/
│           ├── habit.ts
│           ├── user.ts
│           ├── finance.ts    # FinanceAccount (incl. is_liability, original_amount, interest_rate, monthly_payment)
│           │                 # FinanceGoal, NetWorthSummary (total, gross_assets, total_liabilities, by_currency)
│           ├── expenses.ts   # Expense, MonthlySummary, ExpenseBudget
│           ├── budget.ts     # BudgetSettings, BudgetItem, BudgetSummary, CATEGORY_BUCKET_MAP
│           └── index.ts
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_rls_policies.sql
│   │   ├── 003_completions_update_policy.sql
│   │   ├── 004_finance_schema.sql    # finance_accounts, finance_snapshots, finance_goals, triggers
│   │   ├── 005_finance_rls.sql
│   │   ├── 006_expenses_schema.sql   # expenses, expense_budgets
│   │   ├── 007_expenses_rls.sql
│   │   ├── 008_budget_schema.sql     # budget_settings, budget_items
│   │   ├── 009_budget_rls.sql
│   │   ├── 010_budget_recurring.sql  # is_recurring flag op budget_items
│   │   ├── 011_add_sparen_category.sql
│   │   ├── 012_tasks_schema.sql      # tasks tabel (inbox/vandaag/aankomend)
│   │   ├── 013_email_digest_pref.sql # profiles.email_digest kolom
│   │   └── 014_liabilities.sql       # finance_accounts: is_liability, original_amount, interest_rate, monthly_payment
│   ├── functions/
│   │   ├── send-reminder/
│   │   └── update-streaks/
│   └── seed.sql
├── turbo.json
└── package.json  (npm workspaces, niet pnpm)
```

---

## Database Schema (Supabase / Postgres)

```sql
-- Gebruikersprofielen
create table public.profiles (
  id            uuid primary key references auth.users on delete cascade,
  username      text unique,
  avatar_url    text,
  timezone      text not null default 'Europe/Amsterdam',
  email_digest  boolean not null default true,   -- 013
  created_at    timestamptz default now()
);

-- Habits
create table public.habits (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles on delete cascade,
  name         text not null,
  description  text,
  icon         text,
  color        text,
  frequency    jsonb not null,   -- { type: 'daily'|'weekly', days?: number[] }
  reminder_at  time,
  archived_at  timestamptz,
  created_at   timestamptz default now()
);

-- Completions + Streaks (zie 001/003)

-- Finance: rekeningen — inclusief schulden (014)
create table public.finance_accounts (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.profiles on delete cascade,
  name             text not null,
  type             text not null check (type in ('bank','investment','crypto','other')),
  currency         text not null default 'EUR',
  balance          numeric(18,2) not null default 0,
  institution      text,
  icon             text,
  color            text,
  is_liability     boolean not null default false,      -- 014
  original_amount  numeric(18,2),                       -- 014 schuldbedrag bij afsluiten
  interest_rate    numeric(5,2),                        -- 014 jaarlijks %
  monthly_payment  numeric(18,2),                       -- 014 maandelijkse aflossing
  archived_at      timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Finance: snapshots, goals (zie 004)

-- Expenses + expense_budgets (zie 006)

-- Budget 50/30/20
create table public.budget_settings (
  user_id        uuid primary key references public.profiles on delete cascade,
  monthly_income numeric(18,2) not null default 0,
  needs_pct      smallint not null default 50,
  savings_pct    smallint not null default 20,
  wants_pct      smallint not null default 30,
  currency       text not null default 'EUR',
  updated_at     timestamptz not null default now()
);

create table public.budget_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles on delete cascade,
  name        text not null,
  amount      numeric(18,2) not null,
  bucket      text not null check (bucket in ('needs','savings','wants')),
  currency    text not null default 'EUR',
  is_recurring boolean not null default false,   -- 010
  created_at  timestamptz not null default now()
);

-- Taken
create table public.tasks (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users on delete cascade,
  title        text not null,
  notes        text,
  due_date     date,
  priority     text not null default 'normal' check (priority in ('high','normal','low')),
  completed_at timestamptz,
  archived_at  timestamptz,
  created_at   timestamptz not null default now()
);
```

---

## Finance Feature — Vermogen

- `is_liability = true` → schuld (studielening, hypotheek, creditcard, …)
- `AccountsList` splitst in **Bezittingen** en **Schulden** secties
- `AccountCard` toont aflosbalk + resterend looptijd als `original_amount` + `monthly_payment` bekend zijn
- `NetWorthSummary` bevat: `total`, `gross_assets`, `total_liabilities`, `by_currency`, `account_count`, `as_of`
- `NetWorthCard` heeft tijdspan-selector (30d/90d/1j/alles) + periode-delta indicator + asset-type verdeling (bank/beleggingen/crypto/overig) als gestapelde kleurenbalk (alleen EUR)
- `NetWorthChart` heeft hover-tooltip en bezier smooth curve (Recharts)
- **Finance verbeteringen (Fase 3+)**:
  - `ExpenseDashboardCard`: m/m-vergelijking badge op totaal + per-categorie delta-pijltjes (↑/↓ % vs vorige maand)
  - `CategoryBreakdown`: clickable categorierijen met opacity-dimming, m/m delta per categorie, activeCategory prop + clear-filter knop
  - `ExpensesView`: activeCategory drill-down state, prevSummary doorgegeven aan CategoryBreakdown, CSV-exportfunctie (BOM voor Excel, puntkomma-gescheiden)
  - `GoalCard`: on-track indicator (Op schema / Bijna op schema / Achter schema) op basis van verstreken tijd vs voortgang, maanden resterend
  - `BudgetAllocationTable`: 5e "Werkelijk%" kolom toont `spent_pct` vs `goal_pct` (rood als overschreden)

---

## Budget Feature — 50/30/20

- Buckets: `needs` / `savings` / `wants`
- `CATEGORY_BUCKET_MAP` in `packages/types/src/budget.ts` koppelt expense-categorieën aan buckets
- `getBudgetSummary` haalt settings + budget_items + maanduitgaven parallel op
- `spent_amount`/`spent_pct` = werkelijke uitgaven; `actual_amount` = geplande budgetposten
- `is_recurring` op `budget_items` voor vaste lasten die automatisch overgenomen worden

---

## Taken Feature

- Taken-systeem naast gewoontes met list- en Kanban-weergave
- **List view**: filter-tabs inbox / vandaag / aankomend / voltooid
- **Kanban view**: 3 kolommen (Inbox / Vandaag / Voltooid) met drag & drop via `@dnd-kit/core`
  - Drag naar Inbox: `due_date = null, completed_at = null`
  - Drag naar Vandaag: `due_date = todayLocal()`
  - Drag naar Voltooid: `completeTask()`
- View-voorkeur opgeslagen in localStorage (`tasks-view`)
- **Rich text detail drawer** (Jira-stijl): klik op taaknaam → slide-over van rechts
  - Editor: Tiptap (ProseMirror) met StarterKit + Underline + TaskList + Link + Image + CodeBlock + Table
  - `description text` kolom in `tasks` tabel (Tiptap JSON als string, migratie 015)
  - Afbeeldingen geüpload naar Supabase Storage bucket `task-attachments` (publiek leesbaar)
  - Auto-save met 1 sec debounce via `useUpdateTask`
  - Zustand store `useTaskDrawerStore` beheert `openTaskId`
  - Drawer sluit op Escape, backdrop-klik of X-knop
- **Google Calendar ↔ Taken integratie** (migratie 016):
  - `gcal_event_id TEXT` op `tasks` tabel koppelt taak aan Google Agenda event
  - `apps/web/lib/google-calendar.ts` — server-side helpers via `googleapis` (push, delete, list events)
  - API routes: `POST/DELETE /api/calendar/push`, `GET /api/calendar/events`
  - `apps/web/hooks/useCalendar.ts` — `useCalendarEvents(days)`, `useTodayCalendarEvents()`
  - `useSyncTaskToCalendar()`, `useRemoveTaskFromCalendar()` in `useTasks.ts`
  - `CalendarImportPanel` — importeer Google Agenda events als taken (via TasksView collapsible)
  - `TodayTasksSection` toont naast taken ook Google Agenda events van vandaag
  - Env vars nodig: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN` in `.env.local`
- `useTasks.ts` hook → `tasks` tabel via Supabase
- Componenten: `TasksView`, `TaskCard`, `TaskForm`, `KanbanBoard`, `KanbanColumn`, `KanbanCard`, `RichTextEditor`, `TaskDetailDrawer`, `TodayTasksSection`, `CalendarImportPanel`

---

## Data Flow

```
User actie → React component → hook (React Query) → packages/lib → Supabase Postgres
                                                                    ├── RLS check
                                                                    ├── Realtime → andere devices
                                                                    └── Trigger → afgeleide data
```

---

## AI Coach

| Endpoint | Model | Patroon | Functie |
|---|---|---|---|
| `POST /api/ai/coach` | claude-opus-4-6 | Streaming (SSE) | Conversationele coaching op habit-samenvatting |
| `POST /api/ai/suggest` | claude-opus-4-6 | Tool use (JSON) | 4 concrete habit-suggesties bij een doel |

---

## Auth Flow

1. Signup/Login via Supabase Auth (email + magic link, optioneel OAuth)
2. JWT in httpOnly cookie (web) / SecureStore (mobile)
3. Middleware beschermt alle `/(dashboard)/*` routes
4. Expo Router beschermt `(tabs)` met auth guard

---

## State Management

| Type | Oplossing |
|---|---|
| Server state | TanStack Query — caching, background refetch |
| Lokale UI state | Zustand store |
| Auth state | Supabase `onAuthStateChange` |
| Offline (mobile) | React Query `persistQueryClient` + AsyncStorage |

---

## Design Conventies

- Tailwind breakpoint: `md:` voor layout-breaks (max-w-5xl container)
- Dark mode: `dark:bg-[#0F0F0F]` surfaces, `dark:bg-stone-900` subtiel
- Rounded cards: `rounded-2xl border border-stone-200 dark:border-stone-800`
- Dense data: `text-[10px]` labels, `text-xs` body, `text-sm` nadruk
- Accentkleur: `#6C63FF` (CSS var `--accent`)

---

## Migratie-log

| # | Naam | Inhoud |
|---|------|--------|
| 001 | initial_schema | habits, completions, streaks, profiles |
| 002 | rls_policies | RLS voor alle tabellen |
| 003 | completions_update_policy | update-policy completions |
| 004 | finance_schema | finance_accounts, finance_snapshots, finance_goals, triggers |
| 005 | finance_rls | RLS finance |
| 006 | expenses_schema | expenses, expense_budgets |
| 007 | expenses_rls | RLS expenses |
| 008 | budget_schema | budget_settings, budget_items |
| 009 | budget_rls | RLS budget |
| 010 | budget_recurring | is_recurring op budget_items |
| 011 | add_sparen_category | sparen expense-categorie |
| 012 | tasks_schema | tasks tabel + RLS |
| 013 | email_digest_pref | profiles.email_digest kolom |
| 014 | liabilities | finance_accounts: is_liability, original_amount, interest_rate, monthly_payment |
| 015 | fix_snapshot_trigger | Trigger vervangt INSERT-only door INSERT OR UPDATE → same-day saldo-updates werken nu correct |
| 016 | tasks_gcal | tasks.gcal_event_id TEXT voor Google Calendar koppeling |
| 017 | profile_preferences | profiles: theme (light/dark/system), currency (EUR default) |

---

## Ontwikkelvolgorde

### Fase 1 — MVP ✅
- Monorepo, Supabase schema + RLS, Auth, Habits CRUD, Check-in, Streaks

### Fase 2 — Mobile (lopend)
- [x] Expo scaffolding + gedeelde UI-packages
- [ ] Offline-first (React Query persistor + AsyncStorage)
- [ ] Push notificaties

### Fase 3 — Premium ✅
- [x] Analytics dashboard (heatmap, statistieken)
- [x] AI Coach (suggesties + streaming chat)
- [x] Finance (rekeningen, schulden, snapshots, netto vermogen grafiek)
- [x] Maandelijkse uitgaven (categorieën, import, budgetten)
- [x] Budget 50/30/20 (buckets, donut grafiek, vaste lasten)
- [x] Taken (inbox / vandaag / aankomend + Kanban-bord met drag & drop + rich text detail drawer)
- [x] Google Calendar ↔ Taken (bidirectionele sync: push taken, importeer events, Today-view met agenda)
- [x] Finance verbeteringen (m/m-vergelijking, categorie drill-down, CSV export, on-track indicator, werkelijk% budgetkolom, asset-type verdeling)
- [x] Settings uitbreiden (dark/light/systeem theme, valuta, zoekbare timezone + auto-detect, Google Calendar status, globale toast-meldingen)
- [ ] Habit templates / goals
- [ ] Sociale features
- [ ] Premium subscription (Stripe)

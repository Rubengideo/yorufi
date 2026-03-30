-- ============================================================
-- 008 — Budget Schema
-- ============================================================

-- ─── budget_settings ─────────────────────────────────────────
-- Één rij per gebruiker (user_id is de PK).
-- Percentages zijn integers die samen optellen tot 100 (DB-constraint).
-- Upsert-on-read patroon in de lib laag.
create table public.budget_settings (
  user_id        uuid primary key references public.profiles on delete cascade,
  monthly_income numeric(18, 2) not null default 0 check (monthly_income >= 0),
  needs_pct      smallint not null default 50 check (needs_pct between 0 and 100),
  savings_pct    smallint not null default 20 check (savings_pct between 0 and 100),
  wants_pct      smallint not null default 30 check (wants_pct between 0 and 100),
  currency       text not null default 'EUR' check (char_length(currency) = 3),
  updated_at     timestamptz not null default now(),
  constraint budget_settings_pcts_sum check (needs_pct + savings_pct + wants_pct = 100)
);

-- ─── budget_items ─────────────────────────────────────────────
-- Vaste budgetposten per bucket (bijv. Hypotheek €905 in 'needs').
create table public.budget_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles on delete cascade,
  name        text not null check (char_length(name) between 1 and 60),
  amount      numeric(18, 2) not null check (amount > 0),
  bucket      text not null check (bucket in ('needs', 'savings', 'wants')),
  currency    text not null default 'EUR' check (char_length(currency) = 3),
  created_at  timestamptz not null default now()
);

-- Primaire query: alle items voor een gebruiker op bucket + naam
create index budget_items_user_bucket_idx on public.budget_items(user_id, bucket);

-- ─── updated_at trigger voor budget_settings ──────────────────
-- Hergebruikt de set_updated_at() functie uit migratie 004.
create trigger budget_settings_set_updated_at
  before update on public.budget_settings
  for each row execute function public.set_updated_at();

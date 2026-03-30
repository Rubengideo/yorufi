-- ============================================================
-- 006 — Expenses Schema
-- ============================================================

-- ─── expenses ────────────────────────────────────────────────
-- Individuele transacties per categorie.
-- Geen soft-delete: uitgaven worden direct verwijderd (transactioneel karakter).
-- Geen updated_at: uitgaven worden niet geüpdated, alleen aangemaakt of verwijderd.
create table public.expenses (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles on delete cascade,
  amount       numeric(18, 2) not null check (amount > 0),
  currency     text not null default 'EUR' check (char_length(currency) = 3),
  category     text not null check (category in (
                 'wonen', 'boodschappen', 'transport', 'horeca',
                 'entertainment', 'abonnementen', 'gezondheid',
                 'shopping', 'opleiding', 'overig'
               )),
  description  text check (char_length(description) <= 280),
  date         date not null,          -- 'YYYY-MM-DD' lokale datum, mirrors completions.date
  created_at   timestamptz not null default now()
);

-- Primaire query: alle uitgaven van een gebruiker in een maand (date range)
create index expenses_user_date_idx     on public.expenses(user_id, date desc);
-- Secundaire query: breakdown per categorie
create index expenses_user_category_idx on public.expenses(user_id, category);

-- ─── expense_budgets ─────────────────────────────────────────
-- Optioneel maandelijks budget per categorie per gebruiker.
-- unique(user_id, category) — slechts één budget per categorie.
create table public.expense_budgets (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles on delete cascade,
  category       text not null check (category in (
                   'wonen', 'boodschappen', 'transport', 'horeca',
                   'entertainment', 'abonnementen', 'gezondheid',
                   'shopping', 'opleiding', 'overig'
                 )),
  monthly_limit  numeric(18, 2) not null check (monthly_limit > 0),
  currency       text not null default 'EUR' check (char_length(currency) = 3),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint expense_budgets_user_category_unique unique (user_id, category)
);

create index expense_budgets_user_id_idx on public.expense_budgets(user_id);

-- ─── updated_at trigger voor expense_budgets ─────────────────
-- Hergebruikt de bestaande set_updated_at() functie uit migratie 004.
create trigger expense_budgets_set_updated_at
  before update on public.expense_budgets
  for each row execute function public.set_updated_at();

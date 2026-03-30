-- ============================================================
-- 004 — Finance Schema
-- ============================================================

-- ─── finance_accounts ────────────────────────────────────────
-- Vertegenwoordigt een financiële rekening (bankrekening, beleggingsportefeuille,
-- crypto wallet, etc.) van een gebruiker.
create table public.finance_accounts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles on delete cascade,
  name         text not null check (char_length(name) between 1 and 60),
  type         text not null check (type in ('bank', 'investment', 'crypto', 'other')),
  currency     text not null default 'EUR' check (char_length(currency) = 3),
  balance      numeric(18, 2) not null default 0,
  institution  text check (char_length(institution) <= 60),
  icon         text,                      -- emoji, bijv. '🏦'
  color        text check (color ~ '^#[0-9A-Fa-f]{6}$'),
  archived_at  timestamptz,               -- soft delete, zelfde patroon als habits
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index finance_accounts_user_id_idx on public.finance_accounts(user_id);

-- ─── finance_snapshots ───────────────────────────────────────
-- Immutabele tijdreeks: één rij per account per dag dat de gebruiker een saldo registreert.
-- Unique (account_id, date) — mirrors completions unique (habit_id, date).
-- Drijft de "netto vermogen over tijd" grafiek aan.
create table public.finance_snapshots (
  id          uuid primary key default gen_random_uuid(),
  account_id  uuid not null references public.finance_accounts on delete cascade,
  user_id     uuid not null references public.profiles on delete cascade,
  balance     numeric(18, 2) not null,
  date        date not null,             -- 'YYYY-MM-DD' lokale datum (mirrors completions.date)
  note        text check (char_length(note) <= 280),
  created_at  timestamptz not null default now(),
  constraint finance_snapshots_account_date_unique unique (account_id, date)
);

create index finance_snapshots_account_id_idx  on public.finance_snapshots(account_id);
create index finance_snapshots_user_date_idx   on public.finance_snapshots(user_id, date);

-- ─── finance_goals ───────────────────────────────────────────
-- Een spaar- of investeringsdoel met een streefbedrag en optionele deadline.
create table public.finance_goals (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles on delete cascade,
  name            text not null check (char_length(name) between 1 and 60),
  description     text check (char_length(description) <= 280),
  target_amount   numeric(18, 2) not null check (target_amount > 0),
  current_amount  numeric(18, 2) not null default 0 check (current_amount >= 0),
  currency        text not null default 'EUR' check (char_length(currency) = 3),
  deadline        date,
  icon            text,
  color           text check (color ~ '^#[0-9A-Fa-f]{6}$'),
  completed_at    timestamptz,           -- automatisch ingesteld door trigger
  archived_at     timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index finance_goals_user_id_idx on public.finance_goals(user_id);

-- ─── updated_at trigger ──────────────────────────────────────
-- Houdt updated_at automatisch bijgewerkt, mirrors het streak-trigger patroon.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger finance_accounts_set_updated_at
  before update on public.finance_accounts
  for each row execute function public.set_updated_at();

create trigger finance_goals_set_updated_at
  before update on public.finance_goals
  for each row execute function public.set_updated_at();

-- ─── Snapshot → Account balance sync trigger ─────────────────
-- Wanneer een snapshot wordt ingevoerd, update het huidige saldo van de
-- parent account zodat het dashboard altijd de actuele waarde toont
-- zonder een extra join-query. Security definer zodat de trigger RLS omzeilt.
create or replace function public.sync_account_balance_from_snapshot()
returns trigger language plpgsql security definer as $$
begin
  update public.finance_accounts
  set balance    = new.balance,
      updated_at = now()
  where id = new.account_id;
  return new;
end;
$$;

create trigger on_snapshot_insert
  after insert on public.finance_snapshots
  for each row execute function public.sync_account_balance_from_snapshot();

-- ─── Goal auto-complete trigger ───────────────────────────────
-- Stelt completed_at in wanneer current_amount het target_amount bereikt.
create or replace function public.check_goal_completion()
returns trigger language plpgsql as $$
begin
  if new.current_amount >= new.target_amount and old.completed_at is null then
    new.completed_at = now();
  elsif new.current_amount < new.target_amount then
    new.completed_at = null;
  end if;
  return new;
end;
$$;

create trigger on_goal_update
  before update on public.finance_goals
  for each row execute function public.check_goal_completion();

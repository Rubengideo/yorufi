-- ============================================================
-- 005 — Finance Row Level Security Policies
-- ============================================================

-- ─── finance_accounts ────────────────────────────────────────
alter table public.finance_accounts enable row level security;

create policy "Users can view own finance accounts"
  on public.finance_accounts for select
  using (user_id = auth.uid());

create policy "Users can insert own finance accounts"
  on public.finance_accounts for insert
  with check (user_id = auth.uid());

create policy "Users can update own finance accounts"
  on public.finance_accounts for update
  using (user_id = auth.uid());

create policy "Users can delete own finance accounts"
  on public.finance_accounts for delete
  using (user_id = auth.uid());

-- ─── finance_snapshots ───────────────────────────────────────
-- Noot: de sync_account_balance_from_snapshot() trigger draait als security definer,
-- zodat hij finance_accounts.balance kan updaten buiten de client RLS om.
alter table public.finance_snapshots enable row level security;

create policy "Users can view own finance snapshots"
  on public.finance_snapshots for select
  using (user_id = auth.uid());

create policy "Users can insert own finance snapshots"
  on public.finance_snapshots for insert
  with check (user_id = auth.uid());

create policy "Users can update own finance snapshots"
  on public.finance_snapshots for update
  using (user_id = auth.uid());

create policy "Users can delete own finance snapshots"
  on public.finance_snapshots for delete
  using (user_id = auth.uid());

-- ─── finance_goals ───────────────────────────────────────────
alter table public.finance_goals enable row level security;

create policy "Users can view own finance goals"
  on public.finance_goals for select
  using (user_id = auth.uid());

create policy "Users can insert own finance goals"
  on public.finance_goals for insert
  with check (user_id = auth.uid());

create policy "Users can update own finance goals"
  on public.finance_goals for update
  using (user_id = auth.uid());

create policy "Users can delete own finance goals"
  on public.finance_goals for delete
  using (user_id = auth.uid());

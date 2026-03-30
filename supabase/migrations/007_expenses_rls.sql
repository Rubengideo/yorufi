-- ============================================================
-- 007 — Expenses Row Level Security Policies
-- ============================================================

-- ─── expenses ────────────────────────────────────────────────
-- Geen update policy: uitgaven worden niet geüpdated, alleen aangemaakt of verwijderd.
alter table public.expenses enable row level security;

create policy "Users can view own expenses"
  on public.expenses for select
  using (user_id = auth.uid());

create policy "Users can insert own expenses"
  on public.expenses for insert
  with check (user_id = auth.uid());

create policy "Users can delete own expenses"
  on public.expenses for delete
  using (user_id = auth.uid());

-- ─── expense_budgets ─────────────────────────────────────────
alter table public.expense_budgets enable row level security;

create policy "Users can view own expense budgets"
  on public.expense_budgets for select
  using (user_id = auth.uid());

create policy "Users can insert own expense budgets"
  on public.expense_budgets for insert
  with check (user_id = auth.uid());

create policy "Users can update own expense budgets"
  on public.expense_budgets for update
  using (user_id = auth.uid());

create policy "Users can delete own expense budgets"
  on public.expense_budgets for delete
  using (user_id = auth.uid());

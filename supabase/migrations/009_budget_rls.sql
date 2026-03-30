-- ============================================================
-- 009 — Budget Row Level Security Policies
-- ============================================================

-- ─── budget_settings ─────────────────────────────────────────
alter table public.budget_settings enable row level security;

create policy "Users can view own budget settings"
  on public.budget_settings for select
  using (user_id = auth.uid());

create policy "Users can insert own budget settings"
  on public.budget_settings for insert
  with check (user_id = auth.uid());

create policy "Users can update own budget settings"
  on public.budget_settings for update
  using (user_id = auth.uid());

-- ─── budget_items ─────────────────────────────────────────────
alter table public.budget_items enable row level security;

create policy "Users can view own budget items"
  on public.budget_items for select
  using (user_id = auth.uid());

create policy "Users can insert own budget items"
  on public.budget_items for insert
  with check (user_id = auth.uid());

create policy "Users can update own budget items"
  on public.budget_items for update
  using (user_id = auth.uid());

create policy "Users can delete own budget items"
  on public.budget_items for delete
  using (user_id = auth.uid());

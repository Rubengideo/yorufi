-- ============================================================
-- 002 — Row Level Security Policies
-- ============================================================

-- ─── profiles ────────────────────────────────────────────────
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "Users can update own profile"
  on public.profiles for update
  using (id = auth.uid());

-- ─── habits ──────────────────────────────────────────────────
alter table public.habits enable row level security;

create policy "Users can view own habits"
  on public.habits for select
  using (user_id = auth.uid());

create policy "Users can insert own habits"
  on public.habits for insert
  with check (user_id = auth.uid());

create policy "Users can update own habits"
  on public.habits for update
  using (user_id = auth.uid());

create policy "Users can delete own habits"
  on public.habits for delete
  using (user_id = auth.uid());

-- ─── completions ─────────────────────────────────────────────
alter table public.completions enable row level security;

create policy "Users can view own completions"
  on public.completions for select
  using (user_id = auth.uid());

create policy "Users can insert own completions"
  on public.completions for insert
  with check (user_id = auth.uid());

create policy "Users can delete own completions"
  on public.completions for delete
  using (user_id = auth.uid());

-- ─── streaks ─────────────────────────────────────────────────
alter table public.streaks enable row level security;

-- Streaks are readable by the habit owner
create policy "Users can view own streaks"
  on public.streaks for select
  using (
    exists (
      select 1 from public.habits
      where habits.id = streaks.habit_id
      and habits.user_id = auth.uid()
    )
  );

-- Streaks are written only by the trigger (security definer), not clients

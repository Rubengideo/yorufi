-- ============================================================
-- 001 — Initial Schema
-- ============================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ─── Profiles ────────────────────────────────────────────────
create table public.profiles (
  id          uuid primary key references auth.users on delete cascade,
  username    text unique,
  avatar_url  text,
  timezone    text not null default 'Europe/Amsterdam',
  push_token  text,
  created_at  timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── Habits ──────────────────────────────────────────────────
create table public.habits (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles on delete cascade,
  name         text not null check (char_length(name) between 1 and 60),
  description  text check (char_length(description) <= 120),
  icon         text,
  color        text check (color ~ '^#[0-9A-Fa-f]{6}$'),
  frequency    jsonb not null default '{"type":"daily"}'::jsonb,
  reminder_at  time,
  archived_at  timestamptz,
  created_at   timestamptz not null default now()
);

create index habits_user_id_idx on public.habits(user_id);

-- ─── Completions ─────────────────────────────────────────────
create table public.completions (
  id         uuid primary key default gen_random_uuid(),
  habit_id   uuid not null references public.habits on delete cascade,
  user_id    uuid not null references public.profiles on delete cascade,
  date       date not null,
  note       text check (char_length(note) <= 280),
  created_at timestamptz not null default now(),
  constraint completions_habit_date_unique unique (habit_id, date)
);

create index completions_habit_id_idx on public.completions(habit_id);
create index completions_user_date_idx on public.completions(user_id, date);

-- ─── Streaks (cached) ─────────────────────────────────────────
create table public.streaks (
  habit_id        uuid primary key references public.habits on delete cascade,
  current_streak  integer not null default 0 check (current_streak >= 0),
  longest_streak  integer not null default 0 check (longest_streak >= 0),
  last_completed  date,
  updated_at      timestamptz not null default now()
);

-- ─── Streak auto-update trigger ──────────────────────────────
create or replace function public.update_streak()
returns trigger language plpgsql security definer as $$
declare
  v_last_completed   date;
  v_current_streak   integer;
  v_longest_streak   integer;
  v_streak_row       public.streaks%rowtype;
begin
  -- Get or init streak row
  select * into v_streak_row from public.streaks where habit_id = new.habit_id;

  if not found then
    insert into public.streaks (habit_id, current_streak, longest_streak, last_completed)
    values (new.habit_id, 1, 1, new.date);
    return new;
  end if;

  v_last_completed := v_streak_row.last_completed;
  v_current_streak := v_streak_row.current_streak;
  v_longest_streak := v_streak_row.longest_streak;

  if v_last_completed is null or new.date > v_last_completed then
    if v_last_completed is not null and (new.date - v_last_completed) = 1 then
      -- Consecutive day → extend streak
      v_current_streak := v_current_streak + 1;
    elsif v_last_completed is null or (new.date - v_last_completed) > 1 then
      -- Gap → reset
      v_current_streak := 1;
    end if;

    v_longest_streak := greatest(v_longest_streak, v_current_streak);

    update public.streaks
    set current_streak = v_current_streak,
        longest_streak = v_longest_streak,
        last_completed = new.date,
        updated_at     = now()
    where habit_id = new.habit_id;
  end if;

  return new;
end;
$$;

create trigger on_completion_insert
  after insert on public.completions
  for each row execute function public.update_streak();

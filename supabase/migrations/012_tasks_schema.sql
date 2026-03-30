-- ─────────────────────────────────────────────────────────────────────────────
-- 012 — Taken (Tasks)
--
-- Eenvoudig taken-systeem naast gewoontes:
--   inbox (geen datum) / vandaag / aankomend / voltooid
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE tasks (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title         text NOT NULL CHECK (char_length(title) >= 1),
  notes         text,
  due_date      date,
  priority      text NOT NULL DEFAULT 'normal'
                CHECK (priority IN ('high', 'normal', 'low')),
  completed_at  timestamptz,
  archived_at   timestamptz,
  created_at    timestamptz DEFAULT now() NOT NULL
);

-- Row-level security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own tasks"
  ON tasks FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index voor snelle queries op gebruiker + vervaldatum
CREATE INDEX tasks_user_due ON tasks (user_id, due_date);

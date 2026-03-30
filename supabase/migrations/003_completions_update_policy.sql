-- ============================================================
-- 003 — Allow users to update their own completions
-- ============================================================
-- Use case: correct a mistakenly added note on a check-in.
-- Users can only update completions that belong to them.

create policy "Users can update own completions"
  on public.completions for update
  using (user_id = auth.uid());

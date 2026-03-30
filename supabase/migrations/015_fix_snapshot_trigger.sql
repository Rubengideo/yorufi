-- ============================================================
-- 015 — Fix snapshot trigger: ook bijwerken bij same-day update
-- ============================================================
-- De oude trigger vuurt alleen op INSERT. Bij een upsert op dezelfde
-- datum (account_id, date conflict → UPDATE) werd het account-saldo
-- niet bijgewerkt. Vervang de trigger zodat hij ook op UPDATE vuurt.

drop trigger if exists on_snapshot_insert on public.finance_snapshots;

create trigger on_snapshot_upsert
  after insert or update on public.finance_snapshots
  for each row execute function public.sync_account_balance_from_snapshot();

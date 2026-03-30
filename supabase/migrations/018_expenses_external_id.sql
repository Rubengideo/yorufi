-- Voeg external_id toe voor idempotente CSV-import (Rabobank Volgnr)
ALTER TABLE public.expenses
  ADD COLUMN IF NOT EXISTS external_id TEXT DEFAULT NULL;

-- Partial unique index: per gebruiker uniek, NULL-waarden uitgesloten
-- Hierdoor werkt ON CONFLICT DO NOTHING correct bij upsert
CREATE UNIQUE INDEX IF NOT EXISTS expenses_user_external_id_uidx
  ON public.expenses (user_id, external_id)
  WHERE external_id IS NOT NULL;

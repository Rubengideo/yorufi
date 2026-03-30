-- ============================================================
-- 014 — Liabilities (schulden) ondersteuning op finance_accounts
-- ============================================================
-- Voegt vier kolommen toe aan finance_accounts zodat een rekening
-- als schuld (studielening, hypotheek, etc.) gemarkeerd kan worden.
-- Het saldo van een schuld-rekening wordt bij de netto vermogen
-- berekening afgetrokken van de bezittingen.

ALTER TABLE public.finance_accounts
  ADD COLUMN is_liability    boolean        NOT NULL DEFAULT false,
  ADD COLUMN original_amount numeric(18, 2),   -- oorspronkelijk leenbedrag
  ADD COLUMN interest_rate   numeric(5, 2),    -- jaarlijkse rente in %
  ADD COLUMN monthly_payment numeric(18, 2);   -- maandelijkse aflossing

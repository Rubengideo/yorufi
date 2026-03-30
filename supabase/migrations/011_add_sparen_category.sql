-- ============================================================
-- 011 — Voeg 'sparen' toe als expense-categorie
-- ============================================================
-- De 'sparen' categorie wordt gebruikt voor goal-bijdragen zodat
-- ze zichtbaar zijn in de savings-bucket van het maandbudget.

-- Postgres staat geen directe wijziging van CHECK-constraints toe;
-- de bestaande constraints moeten worden verwijderd en opnieuw aangemaakt.

ALTER TABLE public.expenses
  DROP CONSTRAINT IF EXISTS expenses_category_check;

ALTER TABLE public.expense_budgets
  DROP CONSTRAINT IF EXISTS expense_budgets_category_check;

ALTER TABLE public.expenses
  ADD CONSTRAINT expenses_category_check CHECK (category IN (
    'wonen', 'boodschappen', 'transport', 'horeca',
    'entertainment', 'abonnementen', 'gezondheid',
    'shopping', 'opleiding', 'overig', 'sparen'
  ));

ALTER TABLE public.expense_budgets
  ADD CONSTRAINT expense_budgets_category_check CHECK (category IN (
    'wonen', 'boodschappen', 'transport', 'horeca',
    'entertainment', 'abonnementen', 'gezondheid',
    'shopping', 'opleiding', 'overig', 'sparen'
  ));

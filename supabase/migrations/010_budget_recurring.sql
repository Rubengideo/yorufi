-- Add is_recurring flag to budget_items
-- Distinguishes fixed recurring costs (rent, subscriptions) from one-off items
ALTER TABLE budget_items
  ADD COLUMN is_recurring boolean NOT NULL DEFAULT true;

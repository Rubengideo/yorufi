-- Migratie 017: gebruikersvoorkeur voor thema en valuta
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS theme    TEXT NOT NULL DEFAULT 'system'
                                    CHECK (theme IN ('light', 'dark', 'system')),
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'EUR';

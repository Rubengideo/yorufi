-- 013 — E-mail digest voorkeur per gebruiker

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS email_digest boolean NOT NULL DEFAULT true;

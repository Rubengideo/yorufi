-- Migratie 016: Google Calendar event ID opslaan op taken
-- Hiermee koppelen we een taak aan een Google Calendar event (bidirectionele sync)

ALTER TABLE public.tasks ADD COLUMN gcal_event_id TEXT;

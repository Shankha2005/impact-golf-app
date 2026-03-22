-- ============================================================
-- Fix PGRST204: Could not find the 'date_played' column of 'scores'
--
-- Your `public.scores` table exists but is missing `date_played`
-- (common if the table was created manually in the Table Editor).
-- PostgREST caches the schema; NOTIFY forces a reload.
--
-- Prerequisite: table `public.scores` must exist (run 0001_schema.sql first).
-- ============================================================

ALTER TABLE public.scores
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.scores
  ADD COLUMN IF NOT EXISTS date_played DATE;

-- Fill date_played for any existing rows
UPDATE public.scores
SET date_played = COALESCE(
  (created_at AT TIME ZONE 'UTC')::date,
  CURRENT_DATE
)
WHERE date_played IS NULL;

ALTER TABLE public.scores
  ALTER COLUMN date_played SET DEFAULT CURRENT_DATE;

ALTER TABLE public.scores
  ALTER COLUMN date_played SET NOT NULL;

-- Refresh PostgREST schema cache (Supabase API)
NOTIFY pgrst, 'reload schema';

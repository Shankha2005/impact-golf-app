-- Ensure anonymous and authenticated users can read charities (homepage, /charities, API).
-- Run in Supabase SQL Editor if this migration was not applied yet.

ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Charities are publicly readable" ON public.charities;

CREATE POLICY "Charities are publicly readable"
  ON public.charities
  FOR SELECT
  TO anon, authenticated
  USING (true);

GRANT SELECT ON public.charities TO anon, authenticated;

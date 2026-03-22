-- ============================================================
-- Storage policies for winner proof images
--
-- 1) In Supabase Dashboard → Storage → New bucket
--    Name: proofs   |   Public: ON (so getPublicUrl works for admin "View")
-- 2) Run this SQL (idempotent policy names).
-- ============================================================

DROP POLICY IF EXISTS "proofs_insert_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "proofs_select_public" ON storage.objects;
DROP POLICY IF EXISTS "proofs_update_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "proofs_delete_authenticated" ON storage.objects;

CREATE POLICY "proofs_insert_authenticated"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'proofs');

CREATE POLICY "proofs_select_public"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'proofs');

CREATE POLICY "proofs_update_authenticated"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'proofs');

CREATE POLICY "proofs_delete_authenticated"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'proofs');

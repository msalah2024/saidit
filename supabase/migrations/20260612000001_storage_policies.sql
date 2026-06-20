-- Storage RLS policies for the 'saidit' bucket (replicated from the hosted
-- project). The base schema dump only covered the `public` schema, so these
-- `storage.objects` policies must be applied separately.
--
--   * Public read access to the bucket.
--   * Authenticated users may manage (insert/update/delete) only files under
--     their own  <uid>/...  folder.

DROP POLICY IF EXISTS "Public read access" ON storage.objects;
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'saidit');

DROP POLICY IF EXISTS "User can manage files in their own folder" ON storage.objects;
CREATE POLICY "User can manage files in their own folder" ON storage.objects
  TO authenticated
  USING (
    bucket_id = 'saidit'
    AND (
      (auth.uid())::text = split_part(name, '/', 1)
      OR starts_with(name, (auth.uid())::text || '/')
    )
  )
  WITH CHECK (
    bucket_id = 'saidit'
    AND (
      (auth.uid())::text = split_part(name, '/', 1)
      OR starts_with(name, (auth.uid())::text || '/')
    )
  );

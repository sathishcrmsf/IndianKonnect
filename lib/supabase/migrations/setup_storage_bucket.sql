-- Setup Supabase Storage bucket for post images
-- Run this in Supabase SQL Editor to create the storage bucket and policies

-- Create storage bucket (if it doesn't exist)
-- Note: This needs to be done via Supabase Dashboard > Storage > Create Bucket
-- Bucket name: post-images
-- Public: Yes (or configure policies for authenticated access)
-- File size limit: 5MB
-- Allowed MIME types: image/jpeg, image/png, image/webp, image/gif

-- After creating the bucket, set up storage policies:

-- Policy: Allow public read access to images
DROP POLICY IF EXISTS "Public read access for post images" ON storage.objects;
CREATE POLICY "Public read access for post images"
ON storage.objects FOR SELECT
USING (bucket_id = 'post-images');

-- Policy: Allow authenticated users and service role to upload images
DROP POLICY IF EXISTS "Authenticated upload for post images" ON storage.objects;
CREATE POLICY "Authenticated upload for post images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'post-images' AND
  (auth.role() = 'authenticated' OR auth.role() = 'service_role' OR auth.uid() IS NULL)
);

-- Note: If using anon key for bot uploads, you may need to adjust the policy
-- to allow INSERT when auth.uid() IS NULL


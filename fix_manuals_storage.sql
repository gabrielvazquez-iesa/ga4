-- ==========================================
-- FIX: MANUALS STORAGE POLICIES
-- ==========================================

-- 1. Create the bucket if it doesn't exist (only works if you have permission to call storage.buckets)
-- Note: Usually done via Supabase Dashboard, but here is the SQL for policies.

INSERT INTO storage.buckets (id, name, public)
VALUES ('manuals', 'manuals', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable RLS on storage (should be enabled by default)

-- 3. Clear existing policies to avoid conflicts
DELETE FROM storage.objects WHERE bucket_id = 'manuals'; -- Optional: clean start or skip if you have data
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;

-- 4. Policy: Allow anyone to view/download manuals (Public)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'manuals' );

-- 5. Policy: Allow authenticated users to upload manuals
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'manuals' 
    AND auth.role() = 'authenticated'
);

-- 6. Policy: Allow admins to update or delete manuals
CREATE POLICY "Admin Delete"
ON storage.objects FOR ALL
USING (
    bucket_id = 'manuals'
    AND (auth.jwt() ->> 'email' IN ('admin@iesa.edu.ve', 'gabriel.vazquez@iesa.edu.ve'))
);

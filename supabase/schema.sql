-- ==============================================================================
-- BibleNote (SHEPHERD) Supabase Database Schema & Storage Configuration
-- ==============================================================================

-- 1. App Releases & APK Distribution Table
CREATE TABLE IF NOT EXISTS app_releases (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  version TEXT NOT NULL UNIQUE,
  version_code INTEGER NOT NULL DEFAULT 1,
  release_title TEXT NOT NULL DEFAULT 'BibleNote Android Release',
  filename TEXT NOT NULL DEFAULT 'biblenote-SHEPHERD-release.apk',
  file_size_bytes BIGINT NOT NULL DEFAULT 0,
  file_size_formatted TEXT,
  storage_path TEXT NOT NULL DEFAULT 'biblenote-SHEPHERD-release.apk',
  download_url TEXT,
  sha256_checksum TEXT,
  changelog TEXT DEFAULT 'Performance improvements, offline SQLite search optimizations, and UI refinements.',
  min_android_version TEXT DEFAULT 'Android 8.0+ (Oreo)',
  is_active BOOLEAN DEFAULT false,
  is_beta BOOLEAN DEFAULT false,
  downloads_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for app_releases
ALTER TABLE app_releases ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active and past releases
CREATE POLICY "Allow public select for app_releases"
  ON app_releases
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow authenticated admin users to insert, update, or delete releases
CREATE POLICY "Allow authenticated insert for app_releases"
  ON app_releases
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update for app_releases"
  ON app_releases
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete for app_releases"
  ON app_releases
  FOR DELETE
  TO authenticated
  USING (true);


-- 2. Track direct app download button clicks
CREATE TABLE IF NOT EXISTS download_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  platform TEXT NOT NULL DEFAULT 'android',
  user_agent TEXT,
  referrer TEXT,
  ip_country TEXT,
  app_version TEXT DEFAULT '1.2.0',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for download_events
ALTER TABLE download_events ENABLE ROW LEVEL SECURITY;

-- Allow public anonymous inserts for tracking downloads
CREATE POLICY "Allow public insert for download_events"
  ON download_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow authenticated users to view analytics
CREATE POLICY "Allow select for authenticated users"
  ON download_events
  FOR SELECT
  TO authenticated
  USING (true);


-- 3. Store email subscriber leads / release updates
CREATE TABLE IF NOT EXISTS subscribers (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  source TEXT DEFAULT 'landing_page',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for subscribers
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Allow public anonymous newsletter signups
CREATE POLICY "Allow public insert for subscribers"
  ON subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow authenticated users to view subscribers
CREATE POLICY "Allow select subscribers for authenticated"
  ON subscribers
  FOR SELECT
  TO authenticated
  USING (true);


-- ==============================================================================
-- 4. Supabase Storage Bucket Configuration
-- Bucket: app-releases (Public bucket for direct APK binary distribution)
-- ==============================================================================

-- Create the public bucket if not already present
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'app-releases',
  'app-releases',
  true,
  104857600, -- 100MB max file size
  ARRAY['application/vnd.android.package-archive', 'application/octet-stream', 'application/x-zip-compressed', 'application/zip']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY['application/vnd.android.package-archive', 'application/octet-stream', 'application/x-zip-compressed', 'application/zip'];

-- Storage RLS: Public read access for downloading APKs
DROP POLICY IF EXISTS "Public Access to App Releases" ON storage.objects;
CREATE POLICY "Public Access to App Releases"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'app-releases');

-- Storage RLS: Authenticated Admin users can upload, update, and delete APK files
DROP POLICY IF EXISTS "Admin Upload App Releases" ON storage.objects;
CREATE POLICY "Admin Upload App Releases"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'app-releases');

DROP POLICY IF EXISTS "Admin Update App Releases" ON storage.objects;
CREATE POLICY "Admin Update App Releases"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'app-releases');

DROP POLICY IF EXISTS "Admin Delete App Releases" ON storage.objects;
CREATE POLICY "Admin Delete App Releases"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'app-releases');

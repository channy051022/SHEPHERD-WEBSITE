-- ==============================================================================
-- BibleNote (SHEPHERD) Supabase Database Schema & Storage Migration Script
-- Run this script in the Supabase Dashboard SQL Editor
-- ==============================================================================

-- 1. App Releases & APK Distribution Table
CREATE TABLE IF NOT EXISTS app_releases (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  version TEXT NOT NULL,
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

-- Idempotent schema upgrades for existing tables:
DO $$
BEGIN
  -- Add is_beta column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'app_releases' AND column_name = 'is_beta'
  ) THEN
    ALTER TABLE app_releases ADD COLUMN is_beta BOOLEAN DEFAULT false;
  END IF;

  -- Ensure UNIQUE constraint on version
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'app_releases_version_key'
  ) THEN
    ALTER TABLE app_releases ADD CONSTRAINT app_releases_version_key UNIQUE (version);
  END IF;
EXCEPTION
  WHEN duplicate_table OR duplicate_object THEN
    NULL;
END $$;

-- Enable RLS for app_releases
ALTER TABLE app_releases ENABLE ROW LEVEL SECURITY;

-- Allow public and admin read access to active and past releases
DROP POLICY IF EXISTS "Allow public select for app_releases" ON app_releases;
CREATE POLICY "Allow public select for app_releases"
  ON app_releases
  FOR SELECT
  TO anon, authenticated, public
  USING (true);

-- Allow admin operations (both authenticated & anon with API key from admin UI)
DROP POLICY IF EXISTS "Allow authenticated insert for app_releases" ON app_releases;
DROP POLICY IF EXISTS "Allow admin insert for app_releases" ON app_releases;
CREATE POLICY "Allow admin insert for app_releases"
  ON app_releases
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated update for app_releases" ON app_releases;
DROP POLICY IF EXISTS "Allow admin update for app_releases" ON app_releases;
CREATE POLICY "Allow admin update for app_releases"
  ON app_releases
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated delete for app_releases" ON app_releases;
DROP POLICY IF EXISTS "Allow admin delete for app_releases" ON app_releases;
CREATE POLICY "Allow admin delete for app_releases"
  ON app_releases
  FOR DELETE
  TO anon, authenticated
  USING (true);


-- 2. Track direct app download button clicks
CREATE TABLE IF NOT EXISTS download_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  platform TEXT NOT NULL DEFAULT 'android',
  user_agent TEXT,
  referrer TEXT,
  ip_country TEXT,
  app_version TEXT DEFAULT '1.0.1',
  user_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for download_events
ALTER TABLE download_events ENABLE ROW LEVEL SECURITY;

-- Allow public anonymous inserts for tracking downloads
DROP POLICY IF EXISTS "Allow public insert for download_events" ON download_events;
CREATE POLICY "Allow public insert for download_events"
  ON download_events
  FOR INSERT
  TO anon, authenticated, public
  WITH CHECK (true);

-- Allow viewing analytics
DROP POLICY IF EXISTS "Allow select for authenticated users" ON download_events;
DROP POLICY IF EXISTS "Allow select for download_events" ON download_events;
CREATE POLICY "Allow select for download_events"
  ON download_events
  FOR SELECT
  TO anon, authenticated
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
DROP POLICY IF EXISTS "Allow public insert for subscribers" ON subscribers;
CREATE POLICY "Allow public insert for subscribers"
  ON subscribers
  FOR INSERT
  TO anon, authenticated, public
  WITH CHECK (true);

-- Allow viewing subscribers
DROP POLICY IF EXISTS "Allow select subscribers for authenticated" ON subscribers;
DROP POLICY IF EXISTS "Allow select for subscribers" ON subscribers;
CREATE POLICY "Allow select for subscribers"
  ON subscribers
  FOR SELECT
  TO anon, authenticated
  USING (true);


-- ==============================================================================
-- 3.5 User Feedbacks & Suggestions Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS user_feedback (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_name TEXT,
  user_email TEXT,
  category TEXT NOT NULL DEFAULT 'general', -- 'bug', 'feature_request', 'translation', 'appreciation', 'general'
  rating INTEGER DEFAULT 5, -- 1 to 5 stars
  message TEXT NOT NULL,
  app_version TEXT,
  status TEXT NOT NULL DEFAULT 'new', -- 'new', 'reviewed', 'archived'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- Allow anyone to submit feedback
DROP POLICY IF EXISTS "Allow public insert for user_feedback" ON user_feedback;
CREATE POLICY "Allow public insert for user_feedback"
  ON user_feedback
  FOR INSERT
  TO anon, authenticated, public
  WITH CHECK (true);

-- Allow admin users to read, update, or delete feedback
DROP POLICY IF EXISTS "Allow authenticated read for user_feedback" ON user_feedback;
DROP POLICY IF EXISTS "Allow read for user_feedback" ON user_feedback;
CREATE POLICY "Allow read for user_feedback"
  ON user_feedback
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated update for user_feedback" ON user_feedback;
DROP POLICY IF EXISTS "Allow update for user_feedback" ON user_feedback;
CREATE POLICY "Allow update for user_feedback"
  ON user_feedback
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated delete for user_feedback" ON user_feedback;
DROP POLICY IF EXISTS "Allow delete for user_feedback" ON user_feedback;
CREATE POLICY "Allow delete for user_feedback"
  ON user_feedback
  FOR DELETE
  TO anon, authenticated
  USING (true);


-- ==============================================================================
-- 4. Supabase Storage Bucket Configuration
-- Bucket: app-releases (Public bucket for direct APK binary distribution)
-- ==============================================================================

-- Create or update the public bucket with max allowed file size (500MB)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'app-releases',
  'app-releases',
  true,
  524288000, -- 500MB max file size
  ARRAY['application/vnd.android.package-archive', 'application/octet-stream', 'application/x-zip-compressed', 'application/zip', 'application/x-authorware-bin']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 524288000,
  allowed_mime_types = ARRAY['application/vnd.android.package-archive', 'application/octet-stream', 'application/x-zip-compressed', 'application/zip', 'application/x-authorware-bin'];

-- Storage RLS: Public read access for downloading APKs
DROP POLICY IF EXISTS "Public Access to App Releases" ON storage.objects;
CREATE POLICY "Public Access to App Releases"
  ON storage.objects FOR SELECT
  TO anon, authenticated, public
  USING (bucket_id = 'app-releases');

-- Storage RLS: Admin upload, update, and delete APK files
DROP POLICY IF EXISTS "Admin Upload App Releases" ON storage.objects;
CREATE POLICY "Admin Upload App Releases"
  ON storage.objects FOR INSERT
  TO anon, authenticated, public
  WITH CHECK (bucket_id = 'app-releases');

DROP POLICY IF EXISTS "Admin Update App Releases" ON storage.objects;
CREATE POLICY "Admin Update App Releases"
  ON storage.objects FOR UPDATE
  TO anon, authenticated, public
  USING (bucket_id = 'app-releases');

DROP POLICY IF EXISTS "Admin Delete App Releases" ON storage.objects;
CREATE POLICY "Admin Delete App Releases"
  ON storage.objects FOR DELETE
  TO anon, authenticated, public
  USING (bucket_id = 'app-releases');


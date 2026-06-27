-- Run once against the existing Supabase project, via the SQL editor or
-- service-role psql connection. Idempotent where reasonable.

ALTER TABLE users ADD COLUMN IF NOT EXISTS password_algo text NOT NULL DEFAULT 'sha256_legacy';

CREATE TABLE IF NOT EXISTS regions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS region_id uuid REFERENCES regions(id);

CREATE TABLE IF NOT EXISTS app_credentials (
  role text PRIMARY KEY CHECK (role IN ('admin', 'ministry')),
  password_hash text NOT NULL,
  password_algo text NOT NULL DEFAULT 'bcrypt',
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS biometric_profiles (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  profile jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- One-time backfill: migrate existing region assignments and admin/ministry
-- password hashes out of the eduai_data JSON-blob hack, if any exist.
-- Run manually after reviewing the data -- left out of this script since it
-- depends on what's actually stored per-environment.

-- Phase 4 (only after the backend is the sole writer/reader, i.e. anon key
-- removed from the frontend bundle): tighten RLS to deny-by-default.
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS allow_all_users ON users;
-- ALTER TABLE results ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS allow_all_results ON results;
-- (no permissive policy created for regions/app_credentials/biometric_profiles
--  -- RLS defaults to deny-all once enabled with no policies)
-- ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE app_credentials ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE biometric_profiles ENABLE ROW LEVEL SECURITY;

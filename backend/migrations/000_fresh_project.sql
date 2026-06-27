-- Yangi/bo'sh Supabase loyihasi uchun TO'LIQ schema.
-- Supabase dashboard -> SQL Editor -> shu faylni to'liq paste qilib Run bosing.
-- Idempotent: qayta ishga tushirsangiz ham xato chiqmaydi.

CREATE TABLE IF NOT EXISTS regions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name text NOT NULL,
  username text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  password_algo text NOT NULL DEFAULT 'bcrypt',
  role text NOT NULL DEFAULT 'student',
  class_name text,
  teacher_id uuid REFERENCES users(id),
  region_id uuid REFERENCES regions(id),
  phone text,
  school text,
  subject text,
  experience text,
  about text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS results (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id integer,
  topic_name text,
  fan_id text,
  fan_name text,
  score integer,
  transcript text,
  details text,
  created_at timestamptz DEFAULT now()
);

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

CREATE TABLE IF NOT EXISTS eduai_data (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  key text NOT NULL,
  value text,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, key)
);

-- Backend faqat service_role key bilan ishlaydi (RLS'ni avtomatik bypass
-- qiladi), shuning uchun bu jadvallarda permissive policy kerak emas --
-- RLS'ni yoqib qo'yamiz (policy yo'q = anon/authenticated uchun taqiqlangan,
-- faqat service_role kira oladi).
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE biometric_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE eduai_data ENABLE ROW LEVEL SECURITY;

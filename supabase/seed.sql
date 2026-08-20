-- ==============================================================================
-- BibleNote (SHEPHERD) - Supabase Admin Account Seeder
-- ==============================================================================
-- Description: Seeds the Admin User accounts for authentication.
--
-- Admin Credentials:
--   Email:    admin@shepherd.app (or admin@biblenote.com)
--   Password: ShepherdAdmin2026!
-- ==============================================================================

-- 1. Ensure required extensions exist
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;

-- 2. Helper function to seed admin user into Supabase Auth
CREATE OR REPLACE FUNCTION public.seed_admin_user(p_email TEXT, p_password TEXT)
RETURNS VOID AS $$
DECLARE
  v_admin_id UUID := extensions.gen_random_uuid();
  v_encrypted_pw TEXT;
BEGIN
  v_encrypted_pw := extensions.crypt(p_password, extensions.gen_salt('bf', 10));

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      role,
      aud,
      created_at,
      updated_at
    ) VALUES (
      v_admin_id,
      '00000000-0000-0000-0000-000000000000',
      p_email,
      v_encrypted_pw,
      NOW(),
      '{"provider": "email", "providers": ["email"], "role": "admin"}',
      '{"full_name": "Shepherd Administrator", "role": "admin"}',
      false,
      'authenticated',
      'authenticated',
      NOW(),
      NOW()
    );

    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      v_admin_id,
      v_admin_id,
      format('{"sub":"%s","email":"%s"}', v_admin_id::text, p_email)::jsonb,
      'email',
      p_email,
      NOW(),
      NOW(),
      NOW()
    ) ON CONFLICT (provider, provider_id) DO NOTHING;
  ELSE
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_pw,
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      raw_user_meta_data = '{"full_name": "Shepherd Administrator", "role": "admin"}'
    WHERE email = p_email;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Seed admin accounts only
SELECT public.seed_admin_user('admin@shepherd.app', 'ShepherdAdmin2026!');
SELECT public.seed_admin_user('admin@biblenote.com', 'ShepherdAdmin2026!');

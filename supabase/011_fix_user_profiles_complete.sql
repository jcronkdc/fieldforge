-- Fix user_profiles table - Ensure all columns exist
-- This migration ensures user_profiles has all required columns for authentication
-- Run this if you have an existing database that needs updating

-- Add missing columns if they don't exist
DO $$
BEGIN
    -- Add role column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'role'
    ) THEN
        ALTER TABLE user_profiles 
        ADD COLUMN role TEXT DEFAULT 'user' NOT NULL;
    END IF;

    -- Add is_admin column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'is_admin'
    ) THEN
        ALTER TABLE user_profiles 
        ADD COLUMN is_admin BOOLEAN DEFAULT false NOT NULL;
    END IF;

    -- Add address column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'address'
    ) THEN
        ALTER TABLE user_profiles 
        ADD COLUMN address TEXT;
    END IF;

    -- Add full_name generated column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'full_name'
    ) THEN
        ALTER TABLE user_profiles 
        ADD COLUMN full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED;
    END IF;

    -- Add email_verified_at column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'email_verified_at'
    ) THEN
        ALTER TABLE user_profiles 
        ADD COLUMN email_verified_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Add last_login_at column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'last_login_at'
    ) THEN
        ALTER TABLE user_profiles 
        ADD COLUMN last_login_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Add login_count column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'login_count'
    ) THEN
        ALTER TABLE user_profiles 
        ADD COLUMN login_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_company_id ON user_profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_admin ON user_profiles(is_admin);

-- Ensure RLS is enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view company profiles" ON user_profiles;
DROP POLICY IF EXISTS "Service role full access" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- Create comprehensive RLS policies
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view company profiles" ON user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles admin_profile
            WHERE admin_profile.id = auth.uid()
            AND admin_profile.is_admin = true
            AND admin_profile.company_id = user_profiles.company_id
        )
    );

CREATE POLICY "Service role full access" ON user_profiles
    FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Grant necessary permissions
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON user_profiles TO service_role;

-- Verify the table structure
DO $$
DECLARE
    v_column_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_column_count
    FROM information_schema.columns
    WHERE table_name = 'user_profiles';
    
    RAISE NOTICE '✅ user_profiles table verified with % columns', v_column_count;
    RAISE NOTICE '✅ Required columns: role, is_admin, address, full_name';
    RAISE NOTICE '✅ Login tracking: email_verified_at, last_login_at, login_count';
    RAISE NOTICE '✅ Indexes created for: email, company_id, role, is_admin';
    RAISE NOTICE '✅ RLS policies configured';
END $$;



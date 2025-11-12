-- Consolidated RLS Policies for user_profiles
-- This ensures all RLS policies are properly configured
-- Run this after all migrations to ensure consistent policies

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view company profiles" ON user_profiles;
DROP POLICY IF EXISTS "Service role full access" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT 
    TO authenticated
    USING (auth.uid() = id);

-- Policy 2: Users can update their own profile (except admin fields)
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE 
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id AND
        -- Prevent users from making themselves admin
        (is_admin = (SELECT is_admin FROM user_profiles WHERE id = auth.uid()) OR
         -- Allow if they're already admin
         EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true))
    );

-- Policy 3: Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- Policy 4: Admins can view all profiles in their company
CREATE POLICY "Admins can view company profiles" ON user_profiles
    FOR SELECT 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles admin_profile
            WHERE admin_profile.id = auth.uid()
            AND admin_profile.is_admin = true
            AND (
                admin_profile.company_id = user_profiles.company_id
                OR user_profiles.company_id IS NULL
            )
        )
    );

-- Policy 5: Admins can update profiles in their company
CREATE POLICY "Admins can update company profiles" ON user_profiles
    FOR UPDATE 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles admin_profile
            WHERE admin_profile.id = auth.uid()
            AND admin_profile.is_admin = true
            AND (
                admin_profile.company_id = user_profiles.company_id
                OR user_profiles.company_id IS NULL
            )
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles admin_profile
            WHERE admin_profile.id = auth.uid()
            AND admin_profile.is_admin = true
            AND (
                admin_profile.company_id = user_profiles.company_id
                OR user_profiles.company_id IS NULL
            )
        )
    );

-- Policy 6: Service role has full access (for backend operations)
CREATE POLICY "Service role full access" ON user_profiles
    FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Grant permissions
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON user_profiles TO service_role;

-- Verify policies
DO $$
DECLARE
    v_policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_policy_count
    FROM pg_policies
    WHERE tablename = 'user_profiles';
    
    RAISE NOTICE '✅ RLS policies configured: % policies created', v_policy_count;
    RAISE NOTICE '✅ Policies:';
    RAISE NOTICE '   - Users can view own profile';
    RAISE NOTICE '   - Users can update own profile';
    RAISE NOTICE '   - Users can insert own profile';
    RAISE NOTICE '   - Admins can view company profiles';
    RAISE NOTICE '   - Admins can update company profiles';
    RAISE NOTICE '   - Service role full access';
END $$;



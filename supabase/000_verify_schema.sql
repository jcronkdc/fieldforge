-- Schema Verification Script
-- Run this to verify your Supabase schema is correctly configured
-- This script checks for all required tables, columns, indexes, and policies

DO $$
DECLARE
    v_table_count INTEGER;
    v_column_count INTEGER;
    v_index_count INTEGER;
    v_policy_count INTEGER;
    v_missing_columns TEXT[];
BEGIN
    -- Check if user_profiles table exists
    SELECT COUNT(*) INTO v_table_count
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'user_profiles';
    
    IF v_table_count = 0 THEN
        RAISE EXCEPTION '❌ user_profiles table does not exist. Run setup_fieldforge.sql first.';
    END IF;
    
    RAISE NOTICE '✅ user_profiles table exists';
    
    -- Check for required columns
    SELECT COUNT(*) INTO v_column_count
    FROM information_schema.columns
    WHERE table_name = 'user_profiles';
    
    RAISE NOTICE '✅ user_profiles has % columns', v_column_count;
    
    -- Check for critical columns
    v_missing_columns := ARRAY[]::TEXT[];
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'role'
    ) THEN
        v_missing_columns := array_append(v_missing_columns, 'role');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'is_admin'
    ) THEN
        v_missing_columns := array_append(v_missing_columns, 'is_admin');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'address'
    ) THEN
        v_missing_columns := array_append(v_missing_columns, 'address');
    END IF;
    
    IF array_length(v_missing_columns, 1) > 0 THEN
        RAISE WARNING '⚠️  Missing columns: %', array_to_string(v_missing_columns, ', ');
        RAISE NOTICE '💡 Run migration 011_fix_user_profiles_complete.sql to add missing columns';
    ELSE
        RAISE NOTICE '✅ All required columns exist';
    END IF;
    
    -- Check indexes
    SELECT COUNT(*) INTO v_index_count
    FROM pg_indexes
    WHERE tablename = 'user_profiles';
    
    RAISE NOTICE '✅ user_profiles has % indexes', v_index_count;
    
    -- Check for critical indexes
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'user_profiles' AND indexname = 'idx_user_profiles_email'
    ) THEN
        RAISE WARNING '⚠️  Missing index: idx_user_profiles_email';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'user_profiles' AND indexname = 'idx_user_profiles_role'
    ) THEN
        RAISE WARNING '⚠️  Missing index: idx_user_profiles_role';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'user_profiles' AND indexname = 'idx_user_profiles_is_admin'
    ) THEN
        RAISE WARNING '⚠️  Missing index: idx_user_profiles_is_admin';
    END IF;
    
    -- Check RLS policies
    SELECT COUNT(*) INTO v_policy_count
    FROM pg_policies
    WHERE tablename = 'user_profiles';
    
    RAISE NOTICE '✅ user_profiles has % RLS policies', v_policy_count;
    
    IF v_policy_count = 0 THEN
        RAISE WARNING '⚠️  No RLS policies found. Run migration 012_consolidated_rls_policies.sql';
    END IF;
    
    -- Check if RLS is enabled
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'user_profiles' 
        AND rowsecurity = true
    ) THEN
        RAISE WARNING '⚠️  RLS is not enabled on user_profiles table';
    ELSE
        RAISE NOTICE '✅ RLS is enabled';
    END IF;
    
    -- Summary
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════';
    RAISE NOTICE '  SCHEMA VERIFICATION COMPLETE';
    RAISE NOTICE '═══════════════════════════════════════════════════════';
    RAISE NOTICE 'Table: user_profiles';
    RAISE NOTICE 'Columns: %', v_column_count;
    RAISE NOTICE 'Indexes: %', v_index_count;
    RAISE NOTICE 'RLS Policies: %', v_policy_count;
    
    IF array_length(v_missing_columns, 1) IS NULL AND v_policy_count > 0 THEN
        RAISE NOTICE '';
        RAISE NOTICE '✅ Schema is correctly configured!';
    ELSE
        RAISE NOTICE '';
        RAISE NOTICE '⚠️  Some issues found. Review warnings above.';
    END IF;
    
END $$;



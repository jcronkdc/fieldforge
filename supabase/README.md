# Supabase Migration Files

This directory contains SQL migration files for setting up and maintaining the FieldForge Supabase database.

## Migration Execution Order

### For New Supabase Projects:

Run migrations in this exact order:

1. **`setup_fieldforge.sql`** - Base schema (creates all tables, indexes, basic RLS)
2. **`009_ensure_admin_setup.sql`** - Adds missing columns, company structure
3. **`010_user_profile_preferences.sql`** - Adds preferences, login tracking, triggers
4. **`008_cronk_companies_admin.sql`** - Creates admin account and company hierarchy
5. **`012_consolidated_rls_policies.sql`** - Comprehensive RLS policies (replaces basic ones)
6. **`create_demo_account.sql`** - Creates demo account (optional)
7. **`000_verify_schema.sql`** - Verifies schema is correct

### For Existing Supabase Projects:

If you already have a database:

1. **`000_verify_schema.sql`** - Check current state
2. **`011_fix_user_profiles_complete.sql`** - Add missing columns and indexes
3. **`012_consolidated_rls_policies.sql`** - Fix RLS policies
4. **`000_verify_schema.sql`** - Verify fixes

---

## File Descriptions

### Core Setup Files

- **`setup_fieldforge.sql`** (967 lines)
  - Complete base schema for FieldForge
  - Creates 50+ tables
  - Creates indexes
  - Enables RLS on all tables
  - Creates basic RLS policies
  - **Includes:** All required columns for `user_profiles` (role, is_admin, etc.)

### Migration Files

- **`000_verify_schema.sql`** ⭐ NEW
  - Verifies schema is correctly configured
  - Checks for required columns, indexes, policies
  - Run this to verify your setup

- **`008_cronk_companies_admin.sql`**
  - Creates Cronk Companies LLC parent company
  - Creates Brink Constructors subsidiary
  - Sets up admin account for justincronk@pm.me
  - Creates company hierarchy view

- **`009_ensure_admin_setup.sql`**
  - Ensures `user_profiles` has all required columns
  - Updates company type constraints
  - Creates receipts table
  - Creates email_logs table
  - **Updated:** Now uses safe `DO $$` blocks

- **`010_user_profile_preferences.sql`**
  - Adds preferences column
  - Adds login tracking columns
  - Creates login tracking trigger
  - Creates email templates table
  - Creates user audit log table
  - Adds RLS policies

- **`011_fix_user_profiles_complete.sql`** ⭐ NEW
  - Fixes existing databases
  - Adds all missing columns safely
  - Creates all required indexes
  - Ensures RLS is enabled
  - **Use this if:** You have an existing database missing columns

- **`012_consolidated_rls_policies.sql`** ⭐ NEW
  - Comprehensive RLS policies for `user_profiles`
  - Drops conflicting policies first
  - Creates 6 comprehensive policies
  - **Use this:** After base setup to ensure consistent policies

### Utility Files

- **`create_demo_account.sql`**
  - Creates demo user account
  - Sets up demo company and project
  - Creates sample data
  - **Updated:** Now includes role and is_admin columns

---

## Quick Start

### New Project Setup:

```sql
-- In Supabase SQL Editor, run in order:

-- 1. Base schema
\i setup_fieldforge.sql

-- 2. Admin setup
\i 009_ensure_admin_setup.sql

-- 3. Preferences
\i 010_user_profile_preferences.sql

-- 4. Admin account
\i 008_cronk_companies_admin.sql

-- 5. RLS policies
\i 012_consolidated_rls_policies.sql

-- 6. Verify
\i 000_verify_schema.sql
```

### Existing Project Fix:

```sql
-- 1. Verify current state
\i 000_verify_schema.sql

-- 2. Fix missing columns
\i 011_fix_user_profiles_complete.sql

-- 3. Fix RLS policies
\i 012_consolidated_rls_policies.sql

-- 4. Verify fixes
\i 000_verify_schema.sql
```

---

## Schema Verification

Always run `000_verify_schema.sql` after migrations to verify:

- ✅ All required columns exist
- ✅ All indexes are created
- ✅ RLS is enabled
- ✅ RLS policies are configured

**Expected Output:**
```
✅ user_profiles table exists
✅ user_profiles has 20+ columns
✅ All required columns exist
✅ user_profiles has 4+ indexes
✅ user_profiles has 6 RLS policies
✅ RLS is enabled
✅ Schema is correctly configured!
```

---

## Troubleshooting

### Issue: "column does not exist"

**Solution:** Run `011_fix_user_profiles_complete.sql` to add missing columns.

### Issue: "policy already exists"

**Solution:** Run `012_consolidated_rls_policies.sql` which drops existing policies first.

### Issue: "relation does not exist"

**Solution:** Run `setup_fieldforge.sql` first to create base schema.

### Issue: "permission denied"

**Solution:** Ensure you're using the service role key or authenticated user has proper permissions.

---

## Important Notes

1. **Always run migrations in order** - Dependencies exist between migrations
2. **Backup your database** - Before running migrations on production
3. **Test in development first** - Verify migrations work before production
4. **Use verification script** - Always verify schema after migrations
5. **RLS policies** - The consolidated policies file replaces basic policies

---

## Environment Variables Required

### Frontend:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key

### Backend:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_KEY` - Your Supabase service role key

---

## Support

For issues:
1. Run `000_verify_schema.sql` to check schema
2. Review `SUPABASE_REVIEW.md` for detailed analysis
3. Check Supabase logs for errors
4. Verify environment variables are set

---

*Last updated: 2025-01-27*



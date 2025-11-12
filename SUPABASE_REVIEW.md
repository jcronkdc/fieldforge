# Supabase SQL and Configuration Review

**Date:** 2025-01-27  
**Status:** ⚠️ **ISSUES FOUND - NEEDS FIXES**

## Executive Summary

The Supabase configuration has **critical inconsistencies** between the base schema and what the application expects. The `user_profiles` table is missing required columns (`role`, `is_admin`) that are needed for authentication.

---

## Critical Issues Found

### 🔴 CRITICAL: Missing Columns in `user_profiles` Table

**Problem:**
The base `user_profiles` table definition in `supabase/setup_fieldforge.sql` and `backend/migrations/001_core_company_project_tables.sql` does **NOT** include:
- `role` column (required for authorization)
- `is_admin` column (required for admin access)
- `address` column (referenced in migrations)

**Current Base Schema:**
```sql
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    employee_id TEXT,
    company_id UUID REFERENCES companies(id),
    job_title TEXT,
    department TEXT,
    supervisor_id UUID REFERENCES user_profiles(id),
    emergency_contact JSONB,
    photo_url TEXT,
    signature_url TEXT,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Expected Schema (from migrations):**
```sql
-- Missing columns:
role TEXT DEFAULT 'user',
is_admin BOOLEAN DEFAULT false,
address TEXT,
full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
email_verified_at TIMESTAMP WITH TIME ZONE,
last_login_at TIMESTAMP WITH TIME ZONE,
login_count INTEGER DEFAULT 0
```

**Impact:**
- ❌ Backend authentication middleware will fail when querying `user_profiles.role` and `user_profiles.is_admin`
- ❌ Admin access checks will not work
- ❌ User role-based authorization will fail

**Files Affected:**
- `backend/src/middleware/auth.ts` - Queries `role` and `is_admin`
- `supabase/009_ensure_admin_setup.sql` - Adds these columns
- `supabase/010_user_profile_preferences.sql` - Adds additional columns

---

### ⚠️ WARNING: Migration Order Dependency

**Problem:**
Multiple migration files modify `user_profiles` table, but they must be run in a specific order:

1. `supabase/setup_fieldforge.sql` - Creates base table
2. `supabase/009_ensure_admin_setup.sql` - Adds `role`, `is_admin`, `address`
3. `supabase/010_user_profile_preferences.sql` - Adds preferences and login tracking

**Risk:**
- If migrations are run out of order, columns may not exist
- Some migrations use `ADD COLUMN IF NOT EXISTS`, others don't
- Inconsistent error handling

---

### ⚠️ WARNING: Duplicate Table Definitions

**Problem:**
`user_profiles` table is defined in multiple places:
- `supabase/setup_fieldforge.sql` (base definition)
- `backend/migrations/001_core_company_project_tables.sql` (duplicate)

**Risk:**
- Confusion about which is the source of truth
- Potential schema drift
- Migration conflicts

---

### ⚠️ WARNING: RLS Policy Inconsistencies

**Problem:**
RLS policies are defined in multiple places:
- `supabase/setup_fieldforge.sql` - Base policies
- `supabase/010_user_profile_preferences.sql` - Additional policies
- `backend/migrations/009_audit_logs_table.sql` - Commented out policies

**Issues:**
- Policies reference `is_admin` column that may not exist
- Some policies use `auth.uid()` which requires proper Supabase auth setup
- Policies may conflict or override each other

---

## Configuration Files Review

### Frontend Supabase Configuration ✅

**File:** `apps/swipe-feed/src/lib/supabase.ts`
- ✅ Properly configured with environment variables
- ✅ Auto-refresh enabled
- ✅ Session persistence enabled
- ⚠️ Missing validation for required env vars

**File:** `apps/swipe-feed/src/lib/supabaseClient.ts`
- ✅ Similar configuration
- ⚠️ Has placeholder values (good for development)
- ⚠️ Warning message for missing config

### Backend Supabase Configuration ✅

**File:** `backend/src/middleware/auth.ts`
- ✅ Properly configured with service key
- ✅ Graceful fallback if not configured
- ⚠️ Queries `user_profiles.role` and `user_profiles.is_admin` (will fail if columns don't exist)

**File:** `backend/src/worker/env.ts`
- ✅ Includes `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`
- ✅ Properly loaded from environment

---

## SQL Files Review

### ✅ `supabase/setup_fieldforge.sql`
**Status:** Base schema definition
**Issues:**
- Missing `role` and `is_admin` columns in `user_profiles`
- Missing `address` column
- Should include all required columns from the start

### ✅ `supabase/009_ensure_admin_setup.sql`
**Status:** Adds missing columns
**Issues:**
- Uses `ADD COLUMN IF NOT EXISTS` (good)
- Adds `role`, `is_admin`, `address` columns
- Creates company structure
- Creates receipts table
- ⚠️ Should be part of base schema

### ✅ `supabase/010_user_profile_preferences.sql`
**Status:** Adds preferences and login tracking
**Issues:**
- Adds `email_verified_at`, `last_login_at`, `login_count`
- Creates login tracking trigger
- Adds RLS policies
- ⚠️ Policies reference `is_admin` which may not exist if migration 009 wasn't run

### ✅ `supabase/008_cronk_companies_admin.sql`
**Status:** Creates admin account setup
**Issues:**
- References `role` and `is_admin` columns
- Will fail if migration 009 wasn't run first
- Creates company hierarchy

### ✅ `backend/migrations/009_audit_logs_table.sql`
**Status:** Creates audit logs table
**Issues:**
- References `auth.users(id)` (correct)
- References `user_profiles.is_admin` in commented RLS policy
- ⚠️ RLS policies are commented out (may need to be enabled)

---

## Required Fixes

### 🔴 CRITICAL: Update Base Schema

**File:** `supabase/setup_fieldforge.sql`

**Change:**
```sql
-- User profiles extension for construction
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    employee_id TEXT,
    company_id UUID REFERENCES companies(id),
    job_title TEXT,
    department TEXT,
    supervisor_id UUID REFERENCES user_profiles(id),
    emergency_contact JSONB,
    photo_url TEXT,
    signature_url TEXT,
    preferences JSONB DEFAULT '{}',
    -- ADD THESE COLUMNS:
    role TEXT DEFAULT 'user' NOT NULL,
    is_admin BOOLEAN DEFAULT false NOT NULL,
    address TEXT,
    full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    login_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Also update:** `backend/migrations/001_core_company_project_tables.sql` with the same changes.

---

### ⚠️ RECOMMENDED: Consolidate Migrations

**Option 1:** Merge migrations 009 and 010 into base schema
**Option 2:** Create a single consolidated migration file
**Option 3:** Document migration order clearly

---

### ⚠️ RECOMMENDED: Add Validation

**File:** `apps/swipe-feed/src/lib/supabase.ts`

**Add:**
```typescript
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing required Supabase environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}
```

---

### ⚠️ RECOMMENDED: Add Indexes

**Missing indexes on `user_profiles`:**
- `idx_user_profiles_email` (for email lookups)
- `idx_user_profiles_company_id` (for company queries)
- `idx_user_profiles_role` (for role-based queries)
- `idx_user_profiles_is_admin` (for admin checks)

**Add to base schema or migration.**

---

## Migration Execution Order

**Correct order for Supabase setup:**

1. ✅ `supabase/setup_fieldforge.sql` - Base schema (NEEDS UPDATE)
2. ✅ `supabase/009_ensure_admin_setup.sql` - Add missing columns
3. ✅ `supabase/010_user_profile_preferences.sql` - Add preferences
4. ✅ `supabase/008_cronk_companies_admin.sql` - Create admin account
5. ✅ `backend/migrations/009_audit_logs_table.sql` - Create audit logs

**For backend migrations (PostgreSQL):**
1. ✅ `backend/migrations/001_core_company_project_tables.sql` (NEEDS UPDATE)
2. ✅ `backend/migrations/002_safety_compliance_tables.sql`
3. ✅ `backend/migrations/003_equipment_material_tables.sql`
4. ✅ `backend/migrations/004_qaqc_testing_tables.sql`
5. ✅ `backend/migrations/005_scheduling_crew_tables.sql`
6. ✅ `backend/migrations/006_rfi_submittal_document_tables.sql`
7. ✅ `backend/migrations/007_messaging_communication_tables.sql`
8. ✅ `backend/migrations/008_environmental_row_change_tables.sql`
9. ✅ `backend/migrations/009_audit_logs_table.sql`

---

## Environment Variables Checklist

### Frontend (`.env` or Vercel)
- ✅ `VITE_SUPABASE_URL` - Required
- ✅ `VITE_SUPABASE_ANON_KEY` - Required
- ✅ `VITE_API_BASE_URL` - Required

### Backend (`.env` or Render)
- ✅ `SUPABASE_URL` - Required for JWT verification
- ✅ `SUPABASE_SERVICE_KEY` - Required for JWT verification
- ✅ `DATABASE_URL` - Required for database operations

---

## Testing Checklist

- [ ] Run base schema migration
- [ ] Verify `user_profiles` table has all required columns
- [ ] Run admin setup migration
- [ ] Verify admin account can be created
- [ ] Test authentication flow
- [ ] Verify role-based access works
- [ ] Test admin access checks
- [ ] Verify RLS policies work correctly

---

## Recommendations

### 🔴 CRITICAL (Must Fix)
1. **Update base schema** to include `role` and `is_admin` columns
2. **Update backend migration** to match Supabase schema
3. **Test authentication** after schema updates

### ⚠️ HIGH PRIORITY
1. **Consolidate migrations** or document order clearly
2. **Add validation** for required environment variables
3. **Add missing indexes** for performance

### ⚠️ MEDIUM PRIORITY
1. **Enable RLS policies** in audit_logs table (if using Supabase)
2. **Add migration verification** script
3. **Document schema differences** between Supabase and PostgreSQL

---

## Files to Update

1. ✅ `supabase/setup_fieldforge.sql` - Add missing columns
2. ✅ `backend/migrations/001_core_company_project_tables.sql` - Add missing columns
3. ✅ `apps/swipe-feed/src/lib/supabase.ts` - Add validation
4. ✅ Create migration verification script

---

*Review completed: 2025-01-27*



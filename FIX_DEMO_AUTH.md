# 🔐 Fix Demo Authentication - Step-by-Step Guide

**Issue**: Demo credentials (`admin@fieldforge.com` / `FieldForge2025!Demo`) return "Invalid login credentials"  
**Root Cause**: Users don't exist in Supabase `auth.users` table yet, or have wrong passwords  
**Solution**: Create auth users FIRST, then run SQL script to create profiles

---

## 🎯 STEP 1: Create Auth Users in Supabase Dashboard

### **Go to Supabase Auth Dashboard**
https://supabase.com/dashboard/project/YOUR_PROJECT_ID/auth/users

### **Create 3 Demo Users** (Click "Add user" → "Create new user" for each):

#### **User 1: Field Worker**
- Email: `demo@fieldforge.com`
- Password: `FieldForge2025!Demo`
- ✅ **IMPORTANT**: Check "Auto Confirm Email" (otherwise login will fail)
- Click **Create user**

#### **User 2: Manager**
- Email: `manager@fieldforge.com`
- Password: `FieldForge2025!Demo`
- ✅ **IMPORTANT**: Check "Auto Confirm Email"
- Click **Create user**

#### **User 3: Administrator**
- Email: `admin@fieldforge.com`
- Password: `FieldForge2025!Demo`
- ✅ **IMPORTANT**: Check "Auto Confirm Email"
- Click **Create user**

---

## 🎯 STEP 2: Verify Auth Users Created

### **Run SQL Query in Supabase SQL Editor**:

```sql
-- Check if demo users exist in auth.users
SELECT 
  email, 
  email_confirmed_at, 
  created_at,
  id
FROM auth.users 
WHERE email IN ('demo@fieldforge.com', 'manager@fieldforge.com', 'admin@fieldforge.com')
ORDER BY created_at DESC;
```

**Expected Result**: 3 rows returned with:
- ✅ `email_confirmed_at` NOT NULL (users are confirmed)
- ✅ All 3 emails present
- ✅ Each user has a UUID `id`

**If you see 0 rows**: Users weren't created properly - go back to Step 1  
**If email_confirmed_at is NULL**: Users aren't confirmed - check "Auto Confirm Email" when creating

---

## 🎯 STEP 3: Run Demo Accounts Setup Script

### **Copy and Run in Supabase SQL Editor**:

The script at `/Users/justincronk/Desktop/FieldForge/supabase/create_demo_accounts.sql`

Or copy this entire script:

```sql
-- FieldForge Demo Accounts Setup
-- Creates all three demo accounts shown on the home page
-- Run this in Supabase SQL Editor

DO $$
DECLARE
  field_worker_id UUID;
  manager_id UUID;
  admin_id UUID;
  demo_company_id UUID;
  demo_project_id UUID;
BEGIN
  -- Ensure demo company exists
  SELECT id INTO demo_company_id FROM companies WHERE name = 'Demo Electric Co' LIMIT 1;

  IF demo_company_id IS NULL THEN
    INSERT INTO companies (name, type, email, phone, address)
    VALUES ('Demo Electric Co', 'contractor', 'info@demoelectric.com', '555-0100', '123 Demo Street, Demo City, DC 12345')
    RETURNING id INTO demo_company_id;
  END IF;

  -- Ensure demo project exists
  SELECT id INTO demo_project_id FROM projects WHERE project_number = 'DEMO-001' LIMIT 1;

  IF demo_project_id IS NULL THEN
    INSERT INTO projects (
      company_id,
      project_number,
      name,
      project_type,
      voltage_class,
      start_date,
      end_date,
      status,
      description,
      created_by
    )
    VALUES (
      demo_company_id,
      'DEMO-001',
      'Demo 138kV Substation Upgrade',
      'substation',
      '138kV',
      CURRENT_DATE,
      CURRENT_DATE + INTERVAL '6 months',
      'active',
      'Complete substation upgrade project for demonstration purposes',
      (SELECT id FROM auth.users WHERE email = 'admin@fieldforge.com' LIMIT 1)
    )
    RETURNING id INTO demo_project_id;
  END IF;

  -- Get user IDs from auth.users
  SELECT id INTO field_worker_id FROM auth.users WHERE email = 'demo@fieldforge.com' LIMIT 1;
  SELECT id INTO manager_id FROM auth.users WHERE email = 'manager@fieldforge.com' LIMIT 1;
  SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@fieldforge.com' LIMIT 1;

  -- Create field worker profile
  IF field_worker_id IS NOT NULL THEN
    INSERT INTO user_profiles (
      id, email, first_name, last_name, job_title, phone, company_id, role, is_admin
    )
    VALUES (
      field_worker_id, 'demo@fieldforge.com', 'Demo', 'Worker', 'Field Technician', '555-0101', demo_company_id, 'user', false
    )
    ON CONFLICT (id) DO UPDATE
    SET first_name = 'Demo', last_name = 'Worker', job_title = 'Field Technician', company_id = demo_company_id, updated_at = now();

    -- Add to demo project (use project_members, not project_team)
    INSERT INTO project_members (
      project_id, user_id, role, can_edit, can_invite, can_view_budget, status
    )
    VALUES (
      demo_project_id, field_worker_id, 'worker', true, false, false, 'active'
    )
    ON CONFLICT (project_id, user_id) DO UPDATE
    SET role = 'worker', status = 'active', updated_at = now();

    RAISE NOTICE 'Field worker demo account setup complete';
  ELSE
    RAISE NOTICE 'Field worker user not found - create in Supabase Auth first!';
  END IF;

  -- Create manager profile
  IF manager_id IS NOT NULL THEN
    INSERT INTO user_profiles (
      id, email, first_name, last_name, job_title, phone, company_id, role, is_admin
    )
    VALUES (
      manager_id, 'manager@fieldforge.com', 'Demo', 'Manager', 'Project Manager', '555-0102', demo_company_id, 'user', false
    )
    ON CONFLICT (id) DO UPDATE
    SET first_name = 'Demo', last_name = 'Manager', job_title = 'Project Manager', company_id = demo_company_id, updated_at = now();

    -- Add to demo project
    INSERT INTO project_members (
      project_id, user_id, role, can_edit, can_invite, can_view_budget, status
    )
    VALUES (
      demo_project_id, manager_id, 'manager', true, true, true, 'active'
    )
    ON CONFLICT (project_id, user_id) DO UPDATE
    SET role = 'manager', status = 'active', updated_at = now();

    RAISE NOTICE 'Manager demo account setup complete';
  ELSE
    RAISE NOTICE 'Manager user not found - create in Supabase Auth first!';
  END IF;

  -- Create admin profile
  IF admin_id IS NOT NULL THEN
    INSERT INTO user_profiles (
      id, email, first_name, last_name, job_title, phone, company_id, role, is_admin
    )
    VALUES (
      admin_id, 'admin@fieldforge.com', 'Demo', 'Admin', 'Administrator', '555-0103', demo_company_id, 'admin', true
    )
    ON CONFLICT (id) DO UPDATE
    SET first_name = 'Demo', last_name = 'Admin', job_title = 'Administrator', company_id = demo_company_id, is_admin = true, updated_at = now();

    -- Add to demo project
    INSERT INTO project_members (
      project_id, user_id, role, can_edit, can_invite, can_view_budget, status
    )
    VALUES (
      demo_project_id, admin_id, 'admin', true, true, true, 'active'
    )
    ON CONFLICT (project_id, user_id) DO UPDATE
    SET role = 'admin', status = 'active', updated_at = now();

    RAISE NOTICE 'Admin demo account setup complete';
  ELSE
    RAISE NOTICE 'Admin user not found - create in Supabase Auth first!';
  END IF;

  -- Create demo data
  IF field_worker_id IS NOT NULL THEN
    -- Safety briefing
    INSERT INTO safety_briefings (
      project_id, briefing_date, shift, foreman_id, topics, weather_conditions, created_by, attendees
    )
    VALUES (
      demo_project_id, CURRENT_DATE, 'day', field_worker_id,
      ARRAY['High voltage safety', 'PPE requirements', 'Emergency procedures'],
      '{"temperature": 72, "conditions": "Clear", "wind_speed": 10, "humidity": 45}'::JSONB,
      field_worker_id, ARRAY[field_worker_id]
    )
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Demo data created';
  END IF;

  RAISE NOTICE '✅ Demo accounts setup completed!';
  RAISE NOTICE 'Available accounts:';
  RAISE NOTICE '  Field Worker: demo@fieldforge.com / FieldForge2025!Demo';
  RAISE NOTICE '  Manager: manager@fieldforge.com / FieldForge2025!Demo';
  RAISE NOTICE '  Admin: admin@fieldforge.com / FieldForge2025!Demo';
END $$;
```

**Expected Output**:
```
NOTICE:  Field worker demo account setup complete
NOTICE:  Manager demo account setup complete
NOTICE:  Admin demo account setup complete
NOTICE:  Demo data created
NOTICE:  ✅ Demo accounts setup completed!
NOTICE:  Available accounts:
NOTICE:    Field Worker: demo@fieldforge.com / FieldForge2025!Demo
NOTICE:    Manager: manager@fieldforge.com / FieldForge2025!Demo
NOTICE:    Admin: admin@fieldforge.com / FieldForge2025!Demo
```

---

## 🎯 STEP 4: Test Demo Login

### **Go to FieldForge Production**:
https://fieldforge.vercel.app/login

### **Try Logging In**:
- Email: `admin@fieldforge.com`
- Password: `FieldForge2025!Demo`
- Click **Sign In**

**Expected**: Successful login → Redirect to `/dashboard`  
**If it fails**: Check error message, verify Step 2 shows confirmed emails

---

## 🎯 STEP 5: Test Project Creation

### **After Successful Login**:
1. Go to Dashboard
2. Click "Create Project" or navigate to Projects
3. Fill out project details
4. Click Save

**Expected**: Project created successfully, you see it in the projects list

### **Verify Backend Connection**:
```bash
# Check if project was created via API
curl -s "https://fieldforge.vercel.app/api/projects" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" | jq .
```

---

## 🚨 TROUBLESHOOTING

### **"Invalid login credentials" Error**
**Cause**: Users don't exist or email not confirmed  
**Fix**: 
1. Run Step 2 SQL query to check users exist
2. If `email_confirmed_at` is NULL, delete user and recreate with "Auto Confirm Email" checked
3. Make sure password is EXACTLY: `FieldForge2025!Demo` (case-sensitive)

### **"Field worker user not found" Notice**
**Cause**: Users weren't created in Step 1  
**Fix**: Go back to Step 1, create all 3 users in Supabase Auth dashboard

### **"Table project_team doesn't exist" Error**
**Cause**: The original SQL script uses `project_team` but migration 027 created `project_members`  
**Fix**: Use the updated script in Step 3 above (already fixed)

### **Users Created But Can't Login**
**Possible Causes**:
1. Email not confirmed (check `email_confirmed_at` in Step 2)
2. Wrong password (must be exactly `FieldForge2025!Demo`)
3. Wrong Supabase project (check `VITE_SUPABASE_URL` in Vercel env vars)

**Debug**:
```sql
-- Check user status
SELECT 
  email, 
  email_confirmed_at, 
  last_sign_in_at,
  encrypted_password IS NOT NULL as has_password
FROM auth.users 
WHERE email = 'admin@fieldforge.com';
```

### **Verify Environment Variables**
```bash
# Check Supabase URL matches your project
vercel env pull .env.local
cat .env.local | grep SUPABASE
```

Expected:
- `VITE_SUPABASE_URL` should match your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` should be the anon/public key from your project

---

## ✅ SUCCESS CHECKLIST

After completing all steps, verify:
- [ ] 3 users exist in Supabase auth.users table
- [ ] All 3 users have `email_confirmed_at` NOT NULL
- [ ] All 3 users have profiles in `user_profiles` table
- [ ] All 3 users are members of demo project in `project_members` table
- [ ] Demo company "Demo Electric Co" exists in `companies` table
- [ ] Demo project "DEMO-001" exists in `projects` table
- [ ] Can login with `admin@fieldforge.com` / `FieldForge2025!Demo`
- [ ] Dashboard loads after login
- [ ] Can see "Demo 138kV Substation Upgrade" project

---

## 📊 VERIFICATION SQL QUERIES

### **Check Everything Was Created**:
```sql
-- Check auth users
SELECT email, email_confirmed_at FROM auth.users 
WHERE email LIKE '%@fieldforge.com' ORDER BY email;

-- Check user profiles
SELECT first_name, last_name, email, role, is_admin FROM user_profiles
WHERE email LIKE '%@fieldforge.com' ORDER BY email;

-- Check demo company
SELECT id, name, email FROM companies WHERE name = 'Demo Electric Co';

-- Check demo project
SELECT project_number, name, status FROM projects WHERE project_number = 'DEMO-001';

-- Check project members
SELECT 
  p.project_number,
  up.email,
  pm.role,
  pm.status
FROM project_members pm
JOIN projects p ON pm.project_id = p.id
JOIN user_profiles up ON pm.user_id = up.id
WHERE p.project_number = 'DEMO-001'
ORDER BY up.email;
```

Expected output should show:
- 3 users in auth.users (all confirmed)
- 3 user profiles
- 1 company (Demo Electric Co)
- 1 project (DEMO-001)
- 3 project members (demo, manager, admin all in active status)

---

**Once demo auth is working, update MASTER_DOC.md to mark MF-4-AUTH as DONE!** ✅




# FieldForge Demo Account Setup

## 🎯 Demo Account Credentials

Use these credentials to test FieldForge without creating an account:

```
# DEMO ACCOUNTS (Unified, 8+ character password)
Field Worker:   demo@fieldforge.com    / FieldForge2025!Demo
Manager:        manager@fieldforge.com / FieldForge2025!Demo
Administrator:  admin@fieldforge.com   / FieldForge2025!Demo
```

## 📋 Manual Demo Account Creation (if needed)

If the demo account doesn't exist yet, create it in Supabase:

### Option 1: Via Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/lzfzkrylexsarpxypktt/auth/users
2. Click **Add user** → **Create new user**
3. Enter:
   - Email: `demo@fieldforge.com`
   - Password: `FieldForge2025!Demo`
   - ✅ Auto Confirm Email (check this)
4. Click **Create user**

### Option 2: Via SQL Editor

Run this in your Supabase SQL Editor:

```sql
-- Create demo user (run this as a one-time setup)
DO $$
DECLARE
  demo_user_id UUID;
BEGIN
  -- Create auth user via Supabase dashboard first, then run this to set up profile
  
  -- Get the demo user ID (after creating via dashboard)
  SELECT id INTO demo_user_id 
  FROM auth.users 
  WHERE email = 'demo@fieldforge.com'
  LIMIT 1;
  
  IF demo_user_id IS NOT NULL THEN
    -- Create or update user profile
    INSERT INTO user_profiles (
      id,
      email,
      first_name,
      last_name,
      job_title,
      phone,
      company_id
    )
    VALUES (
      demo_user_id,
      'demo@fieldforge.com',
      'Demo',
      'User',
      'Project Manager',
      '555-0100',
      (SELECT id FROM companies WHERE name = 'Demo Electric Co' LIMIT 1)
    )
    ON CONFLICT (id) DO UPDATE
    SET 
      first_name = 'Demo',
      last_name = 'User',
      job_title = 'Project Manager',
      updated_at = now();
    
    -- Add to demo project
    INSERT INTO project_team (
      project_id,
      user_id,
      role,
      company_id,
      start_date
    )
    SELECT 
      p.id,
      demo_user_id,
      'project_manager',
      c.id,
      CURRENT_DATE
    FROM projects p
    JOIN companies c ON c.id = p.company_id
    WHERE p.project_number = 'DEMO-001'
    ON CONFLICT (project_id, user_id) DO NOTHING;
    
    RAISE NOTICE 'Demo user profile created successfully';
  ELSE
    RAISE NOTICE 'Demo user not found. Please create via Supabase dashboard first.';
  END IF;
END $$;
```

## 🚀 **IMMEDIATE NEXT STEP: Create Demo Accounts**

**Status:** Backend APIs functional ✅ - Ready for demo account creation

### **Quick Manual Setup:**
1. **Go to Supabase Dashboard:**
   https://supabase.com/dashboard/project/lzfzkrylexsarpxypktt/auth/users

2. **Create Three Accounts:**
   ```
   Account 1: demo@fieldforge.com / FieldForge2025!Demo
   Account 2: manager@fieldforge.com / FieldForge2025!Demo
   Account 3: admin@fieldforge.com / FieldForge2025!Demo
   ```
   - Click "Add user" → "Create new user"
   - Enter email and password
   - ✅ Check "Auto Confirm Email"
   - Click "Create user"

3. **Run SQL Setup:**
   - Go to SQL Editor in Supabase
   - Run the contents of `supabase/create_demo_accounts.sql`

4. **Test Login:**
   - Visit: https://fieldforge-dtotsf378-justins-projects-d7153a8c.vercel.app/login
   - Try logging in with any demo account
   - Should redirect to dashboard

## 🔑 What the Demo Account Includes

When users log in with the demo account, they get:

- ✅ **Full Access** to the Demo 138kV Substation project
- ✅ **Project Manager** role with all permissions
- ✅ **Pre-populated data** for testing
- ✅ **Company association** with Demo Electric Co
- ✅ **All features** enabled for exploration

## 🚀 How Users Access Demo

1. Go to https://fieldforge.vercel.app/login
2. Click **"Try Demo Account"** button
3. Automatically logs in with demo credentials
4. Explores all features without signup

## 👥 Regular Account Creation

Users can also create their own accounts:

1. Click **"Sign up"** on login page
2. Fill in their information
3. Account automatically gets:
   - User profile created
   - Added to Demo project
   - Associated with Demo Electric Co
   - Ready to use immediately

## 🔒 Security Notes

- Demo account is read/write but changes are shared
- Regular accounts are isolated to their data
- All accounts start with the Demo project
- Production will have proper company/project isolation

## 📊 Account Types

| Account Type | Email | Purpose |
|-------------|--------|---------|
| Demo Account | demo@fieldforge.com | Shared testing |
| Regular Account | user's email | Personal workspace |
| Production Account | company email | Real projects |

## 🛠️ Troubleshooting

If demo login fails:
1. Check if account exists in Supabase Auth
2. Verify password is correct
3. Ensure user profile was created
4. Check RLS policies are enabled

## 📝 Notes

- Demo account resets periodically in production
- All users start with Demo project access
- Real projects require company setup
- Contact support for enterprise accounts

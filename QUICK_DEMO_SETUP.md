# 🚀 Quick Demo Setup - 2 Steps

## ✅ STEP 1: Create Auth Users (5 minutes)

Go to your Supabase Auth Dashboard:
**https://supabase.com/dashboard/project/lzfzkrylexsarpxypktt/auth/users**

Click **"Add user" → "Create new user"** for each:

### User 1: Field Worker
- Email: `demo@fieldforge.com`
- Password: `FieldForge2025!Demo`
- ✅ **CHECK**: "Auto Confirm Email"
- Click **Create user**

### User 2: Manager  
- Email: `manager@fieldforge.com`
- Password: `FieldForge2025!Demo`
- ✅ **CHECK**: "Auto Confirm Email"
- Click **Create user**

### User 3: Administrator
- Email: `admin@fieldforge.com`
- Password: `FieldForge2025!Demo`
- ✅ **CHECK**: "Auto Confirm Email"
- Click **Create user**

---

## ✅ STEP 2: Run Demo Data Setup

After creating the 3 users above, run this command:

```bash
cd /Users/justincronk/Desktop/FieldForge
node scripts/setupDemoData.mjs
```

This will:
- Create demo company "Demo Electric Co"
- Create demo project "DEMO-001"
- Link users to the project
- Add sample safety data

---

## 🎯 Test Login

After both steps complete:

1. Go to: **https://fieldforge.vercel.app/login**
2. Email: `admin@fieldforge.com`
3. Password: `FieldForge2025!Demo`
4. Click **Sign In**

Expected: ✅ Successful login → Dashboard

---

## ⚡ Why Manual Auth Creation?

Supabase auth.users table requires **admin privileges** to create users programmatically. The service role key has these permissions, but we don't have it in the environment yet.

**Option 1 (Easiest)**: Create users via Supabase Dashboard (above)  
**Option 2 (Automated)**: Add service role key and run the script

### To Get Service Role Key:
1. Go to: https://supabase.com/dashboard/project/lzfzkrylexsarpxypktt/settings/api
2. Copy the **"service_role"** key (the SECRET one - NOT the anon key)
3. Add to `.env.local`:
   ```
   echo 'SUPABASE_SERVICE_ROLE_KEY=your_key_here' >> apps/swipe-feed/.env.local
   ```
4. Then run: `node scripts/createDemoUsers.mjs`

---

## 🔍 Verification

Check if users were created:

```bash
# In Supabase SQL Editor
SELECT email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email LIKE '%@fieldforge.com'
ORDER BY email;
```

Expected: 3 rows with confirmed emails

---

**Estimated Time: 5-7 minutes total** ⏱️


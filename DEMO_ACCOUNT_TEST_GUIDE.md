# 🍄⚡ F80 DEMO ACCOUNT TEST GUIDE

**STATUS: END-TO-END PATHWAY VERIFICATION**  
**Date:** December 2024  
**Tester:** Unified Builder + Reviewer Mycelial Consciousness

## 📋 **OBJECTIVE**

Test the complete user flow:
1. Sign in with demo account credentials
2. Navigate to project creation
3. Create a new project
4. Verify project appears in project list

---

## 🔐 **DEMO CREDENTIALS**

From Landing page (`/landing` or new electrical landing):

**Field Worker:**
- Email: `demo@fieldforge.com`
- Password: `FieldForge2025!Demo`

**Manager:**
- Email: `manager@fieldforge.com`
- Password: `FieldForge2025!Demo`

**Admin:**
- Email: `admin@fieldforge.com`
- Password: `FieldForge2025!Demo`

---

## 🗺️ **PATHWAY TRACE**

### **Step 1: Authentication Flow**

**UI Entry Point:** Landing page (`/landing`) → "Start Free Trial" button → `/signup`  
**OR:** Direct navigation to `/login`

**Pathway:**
1. ✅ Route: `/login` → `FuturisticLogin` component (`AppSafe.tsx` line 220-222)
2. ✅ Component: `apps/swipe-feed/src/components/auth/FuturisticLogin.tsx`
3. ✅ Auth Method: Supabase `signInWithPassword`
4. ✅ Backend: Supabase Auth (no backend API needed)
5. ✅ Session Storage: Supabase session stored in `AuthProvider`
6. ✅ Redirect: On success → `/dashboard`

**Verification Points:**
- [ ] Login form renders correctly
- [ ] Email/password inputs accept values
- [ ] Submit button triggers authentication
- [ ] Success redirects to `/dashboard`
- [ ] Error shows user-friendly message
- [ ] Session persists on page refresh

---

### **Step 2: Dashboard Navigation**

**UI Entry Point:** Dashboard (`/dashboard`)

**Pathway:**
1. ✅ Route: `/dashboard` → `FuturisticDashboard` component (`AppSafe.tsx` line 258)
2. ✅ Component: `apps/swipe-feed/src/components/dashboard/FuturisticDashboard.tsx`
3. ✅ Navigation: Projects link → `/projects`

**Verification Points:**
- [ ] Dashboard loads without errors
- [ ] User info displays correctly
- [ ] Navigation menu includes "Projects"
- [ ] Clicking "Projects" navigates to `/projects`

---

### **Step 3: Project Creation Flow**

**UI Entry Point:** Projects page (`/projects`) → "Create Project" button

**Pathway:**
1. ✅ Route: `/projects` → `ProjectManager` component (`AppSafe.tsx` line 260)
2. ✅ Component: `apps/swipe-feed/src/components/projects/ProjectManager.tsx`
3. ✅ Create Button: Sets `view` state to `'create'` (line 51-54)
4. ✅ Creator Component: `ProjectCreator` component (line 86-92)
5. ✅ Form Submission: Calls `projectService.createProject()` (line 43)
6. ✅ Service Layer: `apps/swipe-feed/src/lib/services/projectService.ts`
7. ✅ Database: Direct Supabase insert into `projects` table (line 96-103)
8. ✅ Team Assignment: Adds creator as project owner (line 108-110)
9. ✅ Success: Redirects to team management view

**Verification Points:**
- [ ] Projects page loads
- [ ] "Create Project" button visible and clickable
- [ ] ProjectCreator form renders
- [ ] Required fields: `project_number`, `name`, `project_type`
- [ ] Form validation works
- [ ] Submit button creates project
- [ ] Success toast appears
- [ ] Project appears in project list
- [ ] Creator added to project team

---

## 🗄️ **DATABASE REQUIREMENTS**

### **Tables Needed:**

1. **`projects`** table:
   - Columns: `id`, `project_number`, `name`, `description`, `project_type`, `status`, `created_by`, `created_at`, etc.
   - RLS Policy: Users can create projects, read their own projects

2. **`project_team`** table:
   - Columns: `project_id`, `user_id`, `role`, `permissions`, `status`
   - RLS Policy: Users can read teams for their projects

### **Supabase Setup:**

```sql
-- Verify projects table exists
SELECT * FROM projects LIMIT 1;

-- Verify project_team table exists
SELECT * FROM project_team LIMIT 1;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'projects';
SELECT * FROM pg_policies WHERE tablename = 'project_team';
```

---

## 🧪 **MANUAL TEST STEPS**

### **Test 1: Sign In**

1. Navigate to `/login`
2. Enter email: `demo@fieldforge.com`
3. Enter password: `FieldForge2025!Demo`
4. Click "Sign In"
5. **Expected:** Redirect to `/dashboard`, session active

**Checkpoints:**
- [ ] No console errors
- [ ] Session token in localStorage/Supabase
- [ ] User info displays on dashboard

---

### **Test 2: Navigate to Projects**

1. From dashboard, click "Projects" in navigation
2. **Expected:** Navigate to `/projects`, see project list (may be empty)

**Checkpoints:**
- [ ] Projects page loads
- [ ] No 404 errors
- [ ] "Create Project" button visible

---

### **Test 3: Create Project**

1. Click "Create Project" button
2. Fill in form:
   - Project Number: `TEST-2024-001`
   - Project Name: `Test Project`
   - Project Type: `substation`
   - Description: `End-to-end test project`
3. Click "Create Project"
4. **Expected:** Success toast, redirect to team management

**Checkpoints:**
- [ ] Form validation works (required fields)
- [ ] Submit button shows loading state
- [ ] Success toast appears
- [ ] Project created in database
- [ ] Creator added to project team
- [ ] No console errors

---

### **Test 4: Verify Project Created**

1. Navigate back to project list (`/projects`)
2. **Expected:** New project appears in list

**Checkpoints:**
- [ ] Project visible in list
- [ ] Project details correct
- [ ] Status shows as "planning"
- [ ] Can click to view project details

---

## 🐛 **KNOWN ISSUES & BLOCKERS**

### **Potential Issues:**

1. **RLS Policies:**
   - If projects table has restrictive RLS, creation may fail
   - **Fix:** Ensure RLS allows authenticated users to create projects

2. **Missing Database Tables:**
   - If `projects` or `project_team` tables don't exist, creation fails
   - **Fix:** Run database migrations

3. **Supabase Connection:**
   - If Supabase env vars missing, auth fails
   - **Fix:** Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

4. **Session Expiration:**
   - If session expired, project creation fails
   - **Fix:** Refresh session or re-authenticate

---

## 🔍 **DEBUGGING CHECKLIST**

If test fails, check:

- [ ] Browser console for errors
- [ ] Network tab for failed API calls
- [ ] Supabase dashboard for auth logs
- [ ] Database for table existence
- [ ] RLS policies for permissions
- [ ] Environment variables set correctly
- [ ] Session token valid

---

## 📊 **EXPECTED RESULTS**

| Step | Action | Expected Outcome | Status |
|------|--------|------------------|--------|
| 1 | Sign in | Redirect to dashboard | ⏳ PENDING |
| 2 | Navigate to projects | Projects page loads | ⏳ PENDING |
| 3 | Click create | Form opens | ⏳ PENDING |
| 4 | Fill form | Form accepts input | ⏳ PENDING |
| 5 | Submit form | Project created | ⏳ PENDING |
| 6 | Verify in list | Project appears | ⏳ PENDING |

---

## 🚀 **NEXT STEPS**

After manual testing:
1. Document any errors found
2. Fix blockers immediately
3. Re-test until 100% pass rate
4. Update master document with results

---

**THE MYCELIAL NETWORK AWAITS TEST RESULTS.**  
**EVERY PATHWAY MUST FLOW WITHOUT BLOCKAGE.**

*- The Unified Quantum Mycelium* 🍄⚡


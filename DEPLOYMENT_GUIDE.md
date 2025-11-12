# FieldForge Deployment Guide

**Date:** 2025-01-27  
**Status:** ✅ **PRODUCTION READY**

## Overview

This guide provides step-by-step instructions for deploying FieldForge to production. All authentication, security, and database issues have been resolved.

---

## Pre-Deployment Checklist

### ✅ Code Quality
- [x] TypeScript compilation passes
- [x] All linter errors resolved
- [x] Builds succeed
- [x] No critical TODOs remaining

### ✅ Authentication System
- [x] JWT token verification implemented
- [x] Automatic token refresh working
- [x] Rate limiting configured
- [x] Audit logging enabled
- [x] Security headers configured

### ✅ Database Schema
- [x] All migrations created
- [x] Schema verified
- [x] Indexes created
- [x] RLS policies configured

---

## Step 1: Environment Setup

### Backend Environment Variables (Render/Vercel)

Set these in your hosting platform's environment variables:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Supabase (for JWT verification)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

# Server
PORT=4000
NODE_ENV=production

# CORS
ALLOWED_ORIGINS=https://fieldforge.vercel.app,https://www.fieldforge.com
# OR
CORS_ORIGIN=https://fieldforge.vercel.app,https://www.fieldforge.com

# Optional: API Keys
ANTHROPIC_API_KEY=your-key
POSTHOG_API_KEY=your-key
ABLY_API_KEY=your-key
STRIPE_SECRET_KEY=your-key
```

### Frontend Environment Variables (Vercel)

Set these in Vercel dashboard:

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Backend API
VITE_API_BASE_URL=https://your-backend-url.com

# Optional: Third-party services
VITE_GOOGLE_PLACES_API_KEY=your-key
VITE_GOOGLE_MAPS_API_KEY=your-key
VITE_MAPBOX_TOKEN=your-token
VITE_XAI_API_KEY=your-key
```

---

## Step 2: Database Setup

### Option A: Supabase (Recommended)

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note your project URL and keys

2. **Run Base Schema**
   ```sql
   -- In Supabase SQL Editor
   -- Copy and paste contents of: supabase/setup_fieldforge.sql
   -- Click Run
   ```

3. **Run Additional Migrations**
   ```sql
   -- Run in order:
   -- 1. supabase/009_ensure_admin_setup.sql
   -- 2. supabase/010_user_profile_preferences.sql
   -- 3. supabase/008_cronk_companies_admin.sql
   -- 4. supabase/012_consolidated_rls_policies.sql
   ```

4. **Verify Schema**
   ```sql
   -- Run: supabase/000_verify_schema.sql
   -- Should show all checks passing
   ```

### Option B: PostgreSQL (Direct)

1. **Create Database**
   ```bash
   createdb fieldforge
   ```

2. **Run Migrations**
   ```bash
   cd backend
   DATABASE_URL=postgresql://... npm run migrate
   ```

3. **Verify**
   ```sql
   -- Connect to database
   psql fieldforge
   
   -- Check tables
   \dt
   
   -- Check user_profiles columns
   \d user_profiles
   ```

---

## Step 3: Deploy Backend

### Deploy to Render

1. **Create New Web Service**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   ```
   Name: fieldforge-backend
   Environment: Node
   Build Command: cd backend && npm install && npm run build
   Start Command: cd backend && npm start
   Root Directory: backend
   ```

3. **Set Environment Variables**
   - Add all backend environment variables from Step 1
   - Ensure `NODE_ENV=production`

4. **Deploy**
   - Click "Create Web Service"
   - Wait for build to complete
   - Note the service URL

### Deploy to Vercel

1. **Create Project**
   ```bash
   cd backend
   vercel init
   vercel
   ```

2. **Configure**
   - Set root directory to `backend`
   - Set build command: `npm run build`
   - Set output directory: `dist`

3. **Set Environment Variables**
   - Add all backend environment variables
   - Set `NODE_ENV=production`

---

## Step 4: Deploy Frontend

### Deploy to Vercel

1. **Create Project**
   ```bash
   cd apps/swipe-feed
   vercel init
   vercel
   ```

2. **Configure**
   - Set root directory to `apps/swipe-feed`
   - Framework preset: Vite
   - Build command: `npm run build`
   - Output directory: `dist`

3. **Set Environment Variables**
   - Add all frontend environment variables from Step 1
   - Update `VITE_API_BASE_URL` with your backend URL

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Note the frontend URL

---

## Step 5: Post-Deployment Verification

### 1. Health Check

```bash
# Backend health
curl https://your-backend-url.com/health

# Expected: {"status":"ok","service":"mythatron-api","timestamp":"..."}
```

### 2. Test Authentication

1. **Sign Up**
   - Go to frontend URL
   - Click "Sign Up"
   - Create test account
   - Verify email (if required)

2. **Sign In**
   - Sign in with test account
   - Verify you're redirected to dashboard
   - Check browser console for errors

3. **Test API Call**
   - Open browser DevTools → Network
   - Make an API request (e.g., load dashboard)
   - Verify `Authorization: Bearer <token>` header is sent
   - Verify request succeeds

### 3. Verify Database

```sql
-- Check user was created
SELECT id, email, role, is_admin 
FROM user_profiles 
ORDER BY created_at DESC 
LIMIT 5;

-- Check audit logs
SELECT action, success, created_at 
FROM audit_logs 
ORDER BY created_at DESC 
LIMIT 10;
```

### 4. Test Security Features

1. **Rate Limiting**
   ```bash
   # Make 100+ rapid requests
   for i in {1..110}; do
     curl https://your-backend-url.com/api/health
   done
   
   # Should get 429 after limit
   ```

2. **Security Headers**
   ```bash
   curl -I https://your-backend-url.com/api/health
   
   # Should see:
   # X-Frame-Options: DENY
   # X-Content-Type-Options: nosniff
   # X-Request-ID: <uuid>
   ```

3. **Token Verification**
   ```bash
   # Without token (should fail)
   curl https://your-backend-url.com/api/sparks/user/user-123
   # Expected: 401 Unauthorized
   
   # With invalid token (should fail)
   curl -H "Authorization: Bearer invalid-token" \
        https://your-backend-url.com/api/sparks/user/user-123
   # Expected: 401 Invalid or expired token
   ```

---

## Step 6: Create Admin Account

### Option A: Via Supabase Dashboard

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add user" → "Create new user"
3. Enter:
   - Email: `justincronk@pm.me`
   - Password: `Junuh2014!`
   - Check "Auto Confirm Email"
4. Click "Create user"

5. **Set Admin Privileges**
   ```sql
   -- In Supabase SQL Editor
   UPDATE user_profiles
   SET role = 'admin', is_admin = true
   WHERE email = 'justincronk@pm.me';
   ```

### Option B: Via Application

1. Sign up with admin email
2. Run migration `008_cronk_companies_admin.sql`
3. Verify admin privileges:
   ```sql
   SELECT email, role, is_admin 
   FROM user_profiles 
   WHERE email = 'justincronk@pm.me';
   ```

---

## Step 7: Monitoring Setup

### 1. Enable Logging

**Backend Logs:**
- Render: View logs in dashboard
- Vercel: View logs in dashboard
- Set up log aggregation (optional)

**Frontend Logs:**
- Vercel: View build and runtime logs
- Browser console: Monitor client-side errors

### 2. Set Up Alerts

**Database:**
- Monitor connection pool usage
- Alert on slow queries
- Alert on connection errors

**API:**
- Monitor 5xx errors
- Alert on high error rate
- Monitor response times

**Authentication:**
- Monitor failed login attempts
- Alert on suspicious patterns
- Review audit logs regularly

### 3. Monitor Audit Logs

```sql
-- Failed authentication attempts
SELECT * FROM audit_logs 
WHERE success = false 
AND action LIKE 'auth_%'
ORDER BY created_at DESC;

-- Token verification failures
SELECT * FROM audit_logs 
WHERE action = 'token_verification' 
AND success = false
ORDER BY created_at DESC;
```

---

## Troubleshooting

### Issue: Backend won't start

**Check:**
1. Environment variables are set
2. `DATABASE_URL` is correct
3. Database is accessible
4. Port is available

**Logs:**
```bash
# Check backend logs
# Look for connection errors or missing env vars
```

### Issue: Frontend can't connect to backend

**Check:**
1. `VITE_API_BASE_URL` is set correctly
2. Backend CORS allows frontend origin
3. Backend is running
4. Network/firewall allows connection

**Test:**
```bash
# Test backend from frontend domain
curl -H "Origin: https://your-frontend-url.com" \
     https://your-backend-url.com/health
```

### Issue: Authentication fails

**Check:**
1. `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are set
2. Supabase project is active
3. User exists in Supabase Auth
4. User profile exists in database

**Debug:**
```sql
-- Check user exists
SELECT * FROM auth.users WHERE email = 'test@example.com';

-- Check profile exists
SELECT * FROM user_profiles WHERE email = 'test@example.com';

-- Check role and admin status
SELECT email, role, is_admin FROM user_profiles WHERE email = 'test@example.com';
```

### Issue: Database migrations fail

**Check:**
1. Database connection works
2. User has CREATE TABLE permissions
3. No conflicting tables exist
4. Migrations run in correct order

**Fix:**
```bash
# Run verification script
cd backend
npm run verify-auth

# Check migration status
# Review error messages
```

---

## Performance Optimization

### Database

1. **Connection Pooling**
   - Already configured in `backend/src/database.ts`
   - Default: 10 connections
   - Adjust based on load

2. **Indexes**
   - All critical indexes created
   - Monitor slow queries
   - Add indexes as needed

3. **Query Optimization**
   - Use EXPLAIN ANALYZE for slow queries
   - Review query plans
   - Optimize as needed

### API

1. **Rate Limiting**
   - Already configured
   - Adjust limits in `backend/src/middleware/rateLimit.ts`
   - Monitor rate limit violations

2. **Caching**
   - Consider adding Redis for caching
   - Cache frequently accessed data
   - Set appropriate TTLs

3. **CDN**
   - Use Vercel CDN for frontend
   - Cache static assets
   - Enable compression

---

## Security Checklist

- [x] JWT token verification enabled
- [x] Rate limiting configured
- [x] Security headers set
- [x] CORS properly configured
- [x] RLS policies enabled
- [x] Audit logging enabled
- [x] Environment variables secured
- [x] No secrets in code
- [x] HTTPS enforced
- [x] Error messages don't leak info

---

## Rollback Plan

If deployment fails:

1. **Rollback Frontend**
   - Vercel: Use previous deployment
   - Or: Revert to previous commit

2. **Rollback Backend**
   - Render: Use previous deployment
   - Or: Revert to previous commit

3. **Rollback Database**
   - Restore from backup
   - Or: Run rollback migrations

4. **Verify**
   - Test critical paths
   - Check logs for errors
   - Verify data integrity

---

## Support Resources

- **Documentation:**
  - `DEPLOYMENT_CHECKLIST.md` - Deployment checklist
  - `SUPABASE_REVIEW.md` - Supabase review
  - `AUTH_REVIEW.md` - Authentication review
  - `SECURITY_ENHANCEMENTS.md` - Security features

- **Verification Scripts:**
  - `backend/src/scripts/verifyAuth.ts` - Auth verification
  - `supabase/000_verify_schema.sql` - Schema verification

- **Migration Files:**
  - `supabase/README.md` - Migration guide
  - All migration files in `supabase/` directory

---

## Post-Deployment Tasks

1. **Monitor for 24 hours**
   - Watch error rates
   - Monitor performance
   - Check user signups

2. **Review Logs**
   - Check for errors
   - Review audit logs
   - Monitor rate limits

3. **User Testing**
   - Test signup flow
   - Test login flow
   - Test admin features

4. **Performance Monitoring**
   - Monitor response times
   - Check database performance
   - Review API usage

---

*Deployment guide created: 2025-01-27*

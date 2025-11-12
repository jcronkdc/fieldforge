# Authentication System Deployment Checklist

**Date:** 2025-01-27  
**Status:** Ready for Deployment

## Pre-Deployment Verification

### 1. Environment Variables

Ensure these environment variables are set in your production environment:

#### Required
- ✅ `DATABASE_URL` - PostgreSQL connection string
- ✅ `SUPABASE_URL` - Your Supabase project URL
- ✅ `SUPABASE_SERVICE_KEY` - Supabase service role key (for backend token verification)

#### Optional (for enhanced features)
- `NODE_ENV=production` - Set to production mode
- `ALLOWED_ORIGINS` - Comma-separated list of allowed origins (or use default)
- `CORS_ORIGIN` - Alternative to ALLOWED_ORIGINS

### 2. Database Migration

**Run the migration to create the audit_logs table:**

```bash
cd backend
npm run migrate
```

This will:
- Create the `audit_logs` table
- Create necessary indexes
- Set up the schema for audit logging

**Verify migration:**
```bash
npm run verify-auth
```

### 3. Verify Configuration

Run the verification script:
```bash
cd backend
npm run verify-auth
```

Expected output:
- ✅ Supabase configuration verified
- ✅ Database connection verified
- ✅ audit_logs table exists
- ✅ Rate limiting middleware loaded
- ✅ Audit logging functions available

---

## Deployment Steps

### Step 1: Set Environment Variables

**Vercel (Frontend):**
```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_API_BASE_URL
```

**Render/Backend:**
```bash
# Set in Render dashboard or via CLI
DATABASE_URL=postgresql://...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
NODE_ENV=production
ALLOWED_ORIGINS=https://fieldforge.vercel.app
```

### Step 2: Run Database Migration

**On your production database:**
```bash
# Connect to production database
DATABASE_URL=your-production-db-url npm run migrate
```

Or run manually:
```sql
-- Run backend/migrations/009_audit_logs_table.sql
```

### Step 3: Deploy Backend

```bash
cd backend
npm run build
npm start
```

### Step 4: Deploy Frontend

```bash
cd apps/swipe-feed
npm run build
# Deploy to Vercel or your hosting platform
```

### Step 5: Verify Deployment

1. **Test Authentication Flow:**
   - Login with valid credentials
   - Verify token is sent in requests
   - Check browser network tab for `Authorization: Bearer` headers

2. **Test Token Refresh:**
   - Let token expire (or manually expire it)
   - Make an API request
   - Verify automatic refresh and retry

3. **Test Rate Limiting:**
   - Make 100+ requests quickly
   - Verify 429 response after limit
   - Check `RateLimit-*` headers

4. **Test Audit Logging:**
   - Perform login/logout actions
   - Query audit_logs table:
     ```sql
     SELECT * FROM audit_logs 
     ORDER BY created_at DESC 
     LIMIT 10;
     ```

---

## Post-Deployment Monitoring

### 1. Monitor Audit Logs

**Check authentication events:**
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

**Set up alerts for:**
- High rate of authentication failures
- Token verification failures
- Suspicious IP addresses

### 2. Monitor Rate Limiting

**Check rate limit violations:**
- Monitor 429 responses in logs
- Review IP addresses hitting limits
- Adjust limits if needed in `backend/src/middleware/rateLimit.ts`

### 3. Monitor Token Refresh

**Track token refresh success rate:**
- Monitor 401 responses that trigger refresh
- Check if refresh succeeds
- Alert on high refresh failure rate

---

## Configuration Tuning

### Rate Limits

Adjust in `backend/src/middleware/rateLimit.ts`:

```typescript
// General API
apiLimiter: 100 requests / 15 minutes

// Authentication
authLimiter: 5 requests / 15 minutes

// Password Reset
passwordResetLimiter: 3 requests / hour

// Sensitive Operations
sensitiveOperationLimiter: 10 requests / minute
```

### Token Refresh

Configure in `apps/swipe-feed/src/lib/api.ts`:
- Automatic refresh on 401 (enabled by default)
- Single retry attempt
- Configurable via `skipTokenRefresh` option

### Audit Logging

Configure in `backend/src/middleware/auditLog.ts`:
- Logs all authentication events
- Non-blocking (won't break app if logging fails)
- Stores in `audit_logs` table

---

## Troubleshooting

### Issue: Migration Fails

**Error:** `DATABASE_URL env var is required`

**Solution:**
1. Ensure `.env` file exists in `backend/` directory
2. Set `DATABASE_URL` in `.env` file
3. Or set environment variable before running migration

### Issue: Token Verification Fails

**Error:** `Invalid or expired authentication token`

**Check:**
1. `SUPABASE_URL` is set correctly
2. `SUPABASE_SERVICE_KEY` is set correctly
3. Frontend is sending tokens in `Authorization` header
4. Token is not expired

### Issue: Rate Limiting Too Strict

**Solution:**
1. Adjust limits in `backend/src/middleware/rateLimit.ts`
2. Consider user-based rate limiting for authenticated users
3. Add trusted IPs to bypass list

### Issue: Audit Logs Not Recording

**Check:**
1. `DATABASE_URL` is set correctly
2. `audit_logs` table exists (run migration)
3. Database connection is working
4. Check backend logs for audit errors

---

## Security Best Practices

1. ✅ **Never commit `.env` files** - Use environment variables
2. ✅ **Rotate `SUPABASE_SERVICE_KEY` regularly** - Keep keys secure
3. ✅ **Monitor audit logs daily** - Review authentication events
4. ✅ **Set up alerts** - Get notified of suspicious activity
5. ✅ **Review rate limits** - Adjust based on usage patterns
6. ✅ **Keep dependencies updated** - Run `npm audit` regularly

---

## Testing Checklist

- [ ] Environment variables set in production
- [ ] Database migration completed
- [ ] Verification script passes all checks
- [ ] Login flow works correctly
- [ ] Token refresh works automatically
- [ ] Rate limiting prevents abuse
- [ ] Audit logs are being recorded
- [ ] Admin can query audit logs
- [ ] Error handling works correctly
- [ ] Production logs show no errors

---

## Support

If you encounter issues:

1. Check logs: `backend/logs/` or your hosting platform logs
2. Run verification: `npm run verify-auth`
3. Review audit logs: Query `audit_logs` table
4. Check environment variables: Ensure all required vars are set

---

*Deployment checklist created: 2025-01-27*



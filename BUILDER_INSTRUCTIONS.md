# 🔧 BUILDER INSTRUCTIONS - SECURITY FIX REQUIREMENTS

**Target:** Builder AI Agent  
**Priority:** CRITICAL - Security vulnerabilities must be fixed  
**Document Reference:** `PLANNING_KICKBACK.md`  
**Test Reference:** `SECURITY_AUDIT_FAILING_TESTS.js`

---

## 🎯 YOUR MISSION

A hostile security auditor has identified **10 CRITICAL SECURITY VULNERABILITIES** in the FieldForge codebase that make it completely insecure. You must fix ALL vulnerabilities before deployment is allowed.

**Reference Document:** `PLANNING_KICKBACK.md` - Contains complete vulnerability details

**Test Suite:** `SECURITY_AUDIT_FAILING_TESTS.js` - Contains 10 failing security tests

---

## 🚨 CRITICAL FIXES REQUIRED (DO THESE FIRST)

### 1. Fix Complete Authentication Bypass ⚠️

**Problem:** No authentication middleware on API routes  
**File:** `backend/src/server.ts` lines 106-117

**Fix:**
```typescript
// ADD THIS LINE before routes
app.use('/api', authenticateRequest);

// Then apply to all routes:
app.use("/api/creative/story", createStoryRouter());
app.use("/api/creative/characters", createCharacterRouter());
// ... all other routes
```

### 2. Remove Header-Based Auth Fallback ⚠️

**Problem:** Attackers can impersonate users via headers  
**File:** `backend/src/middleware/auth.ts` lines 50-63

**Fix:**
```typescript
// REMOVE these lines completely:
if (!supabaseAdmin) {
  console.warn('[auth] Supabase not configured - falling back to header-based auth');
  // ... remove all fallback code
}

// Always require proper JWT verification
```

### 3. Fix SQL Syntax Error ⚠️

**Problem:** Malformed SQL query  
**File:** `backend/src/angryLips/sessionRepository.ts` line 359

**Fix:**
```typescript
// CURRENT (broken):
`update public.angry_lips_sessions set status = 'active', updated_at = timezone('utc', now()) where id = $1
[sessionId]

// FIX TO:
await client.query(
  `update public.angry_lips_sessions set status = 'active', updated_at = timezone('utc', now()) where id = $1`,
  [sessionId]
);
```

### 4. Fix Privilege Escalation ⚠️

**Problem:** No role validation from database  
**File:** `backend/src/middleware/auth.ts`

**Fix:**
```typescript
// Always verify role from database, never trust headers
const { data: profile } = await supabaseAdmin
  .from('user_profiles')
  .select('role, is_admin, company_id')
  .eq('id', user.id)
  .maybeSingle();

req.user = {
  id: user.id,
  email: user.email || undefined,
  role: (profileData?.is_admin ? 'admin' : (profileData?.role || 'user')) as string,
};
```

---

## 🔥 HIGH PRIORITY FIXES

### 5. Fix CORS Configuration

**File:** `backend/src/server.ts` lines 82-84

**Fix:**
```typescript
// NEVER allow all origins, even in development
origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://fieldforge.vercel.app', 'http://localhost:5173'],
```

### 6. Add Rate Limiting for Sensitive Operations

**File:** `backend/src/server.ts`

**Fix:**
```typescript
import { authLimiter, sensitiveOperationLimiter } from './middleware/rateLimit.js';

app.use('/api/auth', authLimiter);
app.use('/api/admin', sensitiveOperationLimiter);
app.use('/api/professor', sensitiveOperationLimiter);
```

### 7. Fix Race Conditions

**File:** `backend/src/angryLips/sessionRepository.ts`

**Fix:**
```typescript
// Add proper isolation level
await client.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');
```

---

## ✅ VALIDATION REQUIREMENTS

After making fixes, you MUST:

### 1. Run Security Tests
```bash
cd /Users/justincronk/Desktop/FieldForge
node SECURITY_AUDIT_FAILING_TESTS.js
```

**Expected Result:** All 10 security tests should PASS (currently they all FAIL)

### 2. Verify Each Fix

**Authentication Bypass Test:**
```bash
curl http://localhost:4000/api/angry-lips/sessions
# Should return 401 Unauthorized
```

**Header Manipulation Test:**
```bash
curl -H "x-user-id: admin-123" -H "x-user-role: admin" http://localhost:4000/api/feed/stream
# Should return 401 Unauthorized
```

**SQL Query Test:**
```bash
# Start session endpoint should work without database errors
curl -X POST http://localhost:4000/api/angry-lips/sessions/test/start -d '{"hostId":"test"}'
```

### 3. Update Documentation

After fixes, update `PLANNING_KICKBACK.md` with:
- Status change from "CRITICAL SECURITY FAILURES" to "SECURITY FIXES IMPLEMENTED"
- Test results showing all 10 tests now PASS
- Summary of implemented fixes

---

## 🚫 WHAT NOT TO DO

- **DO NOT** disable security tests to make them pass
- **DO NOT** modify the test file to hide vulnerabilities  
- **DO NOT** add workarounds that don't fix root causes
- **DO NOT** deploy with any remaining security vulnerabilities
- **DO NOT** ignore any of the 10 critical vulnerabilities

---

## 📋 COMPLETION CHECKLIST

Mark each as complete only when verified:

- [ ] **Authentication middleware applied to all API routes**
- [ ] **Header-based auth fallback completely removed**
- [ ] **SQL syntax error fixed**
- [ ] **Role validation uses database, not headers**
- [ ] **CORS restricted to allowed origins only**
- [ ] **Rate limiting added to sensitive endpoints**
- [ ] **Race conditions fixed with proper isolation**
- [ ] **Input validation added**
- [ ] **Error messages sanitized**
- [ ] **All 10 security tests PASS**

---

## 🎯 SUCCESS CRITERIA

**Your work is complete when:**

1. ✅ All 10 security tests PASS (currently all FAIL)
2. ✅ Authentication is required for ALL API endpoints
3. ✅ No user impersonation possible via headers
4. ✅ No SQL syntax errors
5. ✅ No privilege escalation possible
6. ✅ CORS properly configured
7. ✅ Rate limiting prevents abuse
8. ✅ Race conditions eliminated
9. ✅ `PLANNING_KICKBACK.md` updated with "SECURITY FIXES IMPLEMENTED"
10. ✅ Hostile security auditor approval obtained

---

## 💬 COMMUNICATION PROTOCOL

When ready for re-review, respond with:

"**READY**"

This will trigger the hostile security auditor to re-review your fixes and run all security tests.

**Do not say "ready" until ALL critical vulnerabilities are fixed and you have verified all security tests pass.**

---

## ⚡ GET STARTED

1. **Read** `PLANNING_KICKBACK.md` completely
2. **Understand** each of the 10 vulnerabilities  
3. **Fix** all critical vulnerabilities first
4. **Test** your fixes using the security test suite
5. **Verify** all tests pass
6. **Update** documentation
7. **Reply** "READY" for re-audit

**Time is critical. Security vulnerabilities must be fixed before deployment.**

---

*Remember: The hostile security auditor will not approve deployment until ALL vulnerabilities are fixed and ALL security tests pass. There are no exceptions.*

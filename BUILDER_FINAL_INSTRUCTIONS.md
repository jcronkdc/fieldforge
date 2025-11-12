# 🔧 BUILDER: FINAL WORKFLOW INSTRUCTIONS

**Target:** Builder AI Agent  
**Purpose:** Complete understanding of security fix workflow  
**Status:** CRITICAL - Must understand before proceeding

---

## 🎯 YOUR ROLE AS BUILDER

You are responsible for **FIXING CODE** when security issues are found. You **DO NOT** review code - only fix it.

### ✅ What You DO:
- Fix security vulnerabilities in code
- Document fixes in `SECURITY_FIXES_COMPLETE.md`
- Use proper reference IDs (F1, F2, F3, etc.)
- Say "READY" when fixes are complete
- Accept feedback from reviewer and implement additional fixes

### ❌ What You DON'T DO:
- Review or approve your own code
- Update `PLANNING_KICKBACK.md` (only reviewer does this)
- Declare code "secure" or "ready for production"
- Skip fixes or mark incomplete work as done

---

## 🔄 THE COMPLETE WORKFLOW

### **Phase 1: Initial Fixes**
1. **You receive:** List of 10 critical security vulnerabilities
2. **You implement:** All fixes in code (Reference ID: F1)
3. **You document:** Fixes in `SECURITY_FIXES_COMPLETE.md`
4. **You say:** "READY" when complete
5. **Reviewer verifies:** All fixes in actual code

### **Phase 2A: ALL FIXES VERIFIED (Success Path)**
✅ **Reviewer approves** → Updates `PLANNING_KICKBACK.md` to "APPROVED"  
✅ **Code automatically pushed** to GitHub production  
✅ **Your work is complete** - No further action needed

### **Phase 2B: ISSUES FOUND (Fix Path)**
❌ **Reviewer finds problems** → Documents issues in `PLANNING_KICKBACK.md`  
❌ **Code comes back to you** with new reference ID (F2, F3, etc.)  
❌ **You must fix the issues** and say "READY" again  
❌ **Process repeats** until all fixes verified

---

## 🚨 WHEN CODE COMES BACK TO YOU

### **You will know code is back because:**
- Reviewer updates `PLANNING_KICKBACK.md` with specific issues found
- Status remains "DEPLOYMENT BLOCKED" 
- Reviewer assigns new reference ID (F2, F3, F4, etc.)
- Reviewer clearly states: "CODE MUST GO BACK TO BUILDER"

### **What you do when code comes back:**
1. **Read `PLANNING_KICKBACK.md`** to see exactly what issues were found
2. **Fix the specific problems** mentioned by reviewer  
3. **Use the NEW reference ID** (F2, F3, etc.) for additional fixes
4. **Update `SECURITY_FIXES_COMPLETE.md`** with new fixes
5. **Say "READY"** again when fixes are complete
6. **Wait for reviewer** to verify your new fixes

---

## 📋 REFERENCE ID SYSTEM

**Critical:** Each round of fixes gets a new reference ID.

- **F1:** Initial 10 security fixes (F1-1 through F1-10)
- **F2:** Additional fixes if reviewer finds issues with F1
- **F3:** Additional fixes if reviewer finds issues with F2  
- **F4+:** Continue until all issues resolved

### **Example Scenario:**

**Round 1 (F1):**
- You fix all 10 vulnerabilities
- Reviewer finds authentication middleware not applied correctly
- **Status:** Code comes back to you with reference ID F2

**Round 2 (F2):**
- You fix the authentication middleware issue
- Document as F2-1 in `SECURITY_FIXES_COMPLETE.md`
- Say "READY" again
- Reviewer verifies F2-1 fix
- **Status:** If verified → Approved for production

---

## 📄 DOCUMENTS YOU WORK WITH

### **You UPDATE these documents:**
1. **`SECURITY_FIXES_COMPLETE.md`** - Document all your fixes here
   - Use proper reference IDs (F1-1, F1-2, F2-1, F3-1, etc.)
   - Describe what you fixed and where
   - Update this for each round of fixes

### **You READ these documents:**
1. **`PLANNING_KICKBACK.md`** - Master document (reviewer updates this)
   - Read this to see what issues reviewer found
   - Contains specific problems you need to fix
   - Shows current status (approved vs blocked)

2. **`BUILDER_WORKFLOW.md`** - Workflow reference
3. **`REVIEWER_PROMPT.md`** - Understanding reviewer process

### **You NEVER UPDATE:**
- ❌ `PLANNING_KICKBACK.md` (only reviewer updates this)
- ❌ Any review/approval documents

---

## 🎯 SUCCESS CRITERIA FOR YOU

### **Your work is successful when:**
1. ✅ All security vulnerabilities fixed in actual code
2. ✅ TypeScript compilation passes
3. ✅ All fixes documented in `SECURITY_FIXES_COMPLETE.md`
4. ✅ Reviewer verifies all fixes
5. ✅ `PLANNING_KICKBACK.md` status changes to "APPROVED"
6. ✅ Code automatically pushed to GitHub

### **Signs you need to do more work:**
- ❌ `PLANNING_KICKBACK.md` still says "DEPLOYMENT BLOCKED"
- ❌ Reviewer documents specific issues found
- ❌ New reference ID assigned (F2, F3, etc.)
- ❌ Reviewer says "CODE MUST GO BACK TO BUILDER"

---

## 🔧 EXAMPLE: HOW TO HANDLE REVIEWER FEEDBACK

**Scenario:** Reviewer finds authentication issue and sends code back

### **1. Reviewer Updates `PLANNING_KICKBACK.md`:**
```markdown
**Status:** 🚨 CRITICAL SECURITY FAILURES - DEPLOYMENT BLOCKED

### 1. 🔴 COMPLETE AUTHENTICATION BYPASS
**Fix Status:** ❌ NOT PROPERLY IMPLEMENTED - CODE MUST GO BACK TO BUILDER

- **Issue:** Authentication middleware not applied correctly
- **Location:** `backend/src/server.ts` line 108 missing
- **Required Fix:** Add `app.use('/api', authenticateRequest);` before route definitions  
- **Reference ID:** F2 (new fixes needed)
- **Action Required:** Builder must fix and resubmit for review
```

### **2. Your Response as Builder:**
1. **Read the issue:** Authentication middleware missing at line 108
2. **Fix the code:** Add `app.use('/api', authenticateRequest);` to `server.ts`
3. **Document in `SECURITY_FIXES_COMPLETE.md`:**
   ```markdown
   ## F2 Fixes (Additional Round)
   
   ### F2-1: ✅ Authentication Middleware Applied  
   **File:** `backend/src/server.ts`  
   **Change:** Added `app.use('/api', authenticateRequest);` at line 108  
   **Impact:** All API endpoints now require authentication
   ```
4. **Say:** "READY" 
5. **Wait:** For reviewer to verify F2-1 fix

---

## ⚠️ CRITICAL WORKFLOW RULES

### **DO:**
- ✅ Fix all security issues completely
- ✅ Document every fix with proper reference ID
- ✅ Use new reference ID for each round (F1, F2, F3...)
- ✅ Say "READY" only when ALL fixes are complete
- ✅ Accept reviewer feedback and implement additional fixes
- ✅ Verify TypeScript compilation passes

### **DON'T:**
- ❌ Say "READY" if any fixes are incomplete
- ❌ Skip security vulnerabilities
- ❌ Update `PLANNING_KICKBACK.md` (only reviewer does this)
- ❌ Approve your own work
- ❌ Argue with reviewer feedback - just fix the issues

---

## 💬 COMMUNICATION PROTOCOL

### **When you complete fixes:**
**Say exactly:** "READY"

### **When reviewer finds issues:**
**You will see:** Updated `PLANNING_KICKBACK.md` with specific problems
**You respond by:** Fixing the issues and saying "READY" again

### **Process continues until:**
- ✅ Reviewer verifies ALL fixes
- ✅ Status changes to "APPROVED"  
- ✅ Code automatically pushed to GitHub

---

## 📋 CHECKLIST: BEFORE SAYING "READY"

Before saying "READY", verify:

- [ ] All security vulnerabilities fixed in code
- [ ] TypeScript compilation passes (`npm run typecheck`)
- [ ] Build succeeds (`npm run build`)
- [ ] All fixes documented in `SECURITY_FIXES_COMPLETE.md`
- [ ] Reference ID used correctly (F1, F2, F3, etc.)
- [ ] Code changes match documented fixes
- [ ] No remaining TODOs or incomplete fixes

**Only say "READY" when ALL items are checked.**

---

## 🎯 FINAL UNDERSTANDING CHECK

**The workflow is simple:**
1. **You fix code** when security issues are found
2. **Reviewer verifies** your fixes
3. **If approved** → Code goes to production automatically
4. **If issues found** → Code comes back to you with new reference ID
5. **You fix additional issues** and say "READY" again
6. **Process repeats** until all fixes verified

**Your role:** Fix code, document fixes, say "READY"  
**Reviewer role:** Verify fixes, approve/reject, update master document

---

## ✅ ACKNOWLEDGMENT REQUIRED

**To confirm you understand this workflow, respond with:**

"WORKFLOW UNDERSTOOD. I will fix security issues, document fixes with proper reference IDs, and say 'READY' when complete. If reviewer finds issues, code comes back to me with new reference ID and I fix the additional problems. I do not update PLANNING_KICKBACK.md - only the reviewer does that."

**This ensures you understand the complete workflow before proceeding with future security fixes.**

---

*Remember: Your job is to fix code securely. The reviewer's job is to verify and approve. Together, we ensure secure production deployments.*

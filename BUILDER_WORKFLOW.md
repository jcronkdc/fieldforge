# Builder Workflow - Security Fix Process

**Purpose:** Clear workflow for Builder-Reviewer collaboration  
**Status:** Active Process

---

## 🔄 WORKFLOW OVERVIEW

```
Builder → Implements Fixes → Says "READY" 
    ↓
Reviewer → Verifies Fixes → Updates PLANNING_KICKBACK.md
    ↓
    ├─→ ALL FIXES VERIFIED → Approves Deployment ✅
    └─→ ISSUES FOUND → Code Goes Back to Builder ❌
```

---

## ✅ WHEN REVIEWER APPROVES

If reviewer verifies all fixes:

1. ✅ Reviewer updates `PLANNING_KICKBACK.md` with "APPROVED FOR DEPLOYMENT"
2. ✅ All vulnerabilities marked as "VERIFIED FIXED"
3. ✅ Status changed from "DEPLOYMENT BLOCKED" to "APPROVED"
4. ✅ Code is ready for production deployment

**Builder Action:** None needed - deployment approved

---

## ❌ WHEN REVIEWER FINDS ISSUES

**⚠️ CRITICAL:** If reviewer finds ANY issues, code MUST come back to Builder.

### What Happens:

1. **Reviewer documents issues** in `PLANNING_KICKBACK.md`
2. **Reviewer assigns new reference ID** (F2, F3, F4, etc.)
3. **Reviewer keeps status** as "DEPLOYMENT BLOCKED"
4. **Reviewer clearly states:** "CODE MUST GO BACK TO BUILDER"

### Builder Actions Required:

1. **Read updated `PLANNING_KICKBACK.md`** to see what issues were found
2. **Fix the identified issues** based on reviewer feedback
3. **Implement fixes** using the new reference ID (F2, F3, etc.)
4. **Update `SECURITY_FIXES_COMPLETE.md`** with new fixes
5. **Say "READY" again** when fixes are complete
6. **Wait for reviewer** to verify new fixes

### Example Scenario:

**Reviewer finds issue:**
- Fix F1-1 not properly implemented
- Authentication middleware missing at line 108
- Status: "CODE MUST GO BACK TO BUILDER"
- New Reference ID: F2

**Builder responds:**
- Reads `PLANNING_KICKBACK.md` to see issue
- Fixes authentication middleware
- Documents fix as F2-1 in `SECURITY_FIXES_COMPLETE.md`
- Says "READY" again
- Reviewer verifies F2-1 fix

---

## 📋 REFERENCE ID SYSTEM

- **F1:** Initial security fixes (10 fixes: F1-1 through F1-10)
- **F2:** Additional fixes if issues found in F1
- **F3:** Additional fixes if issues found in F2
- **F4+:** Continue as needed until all fixes verified

**Each reference ID represents a round of fixes.**

---

## 🎯 BUILDER RESPONSIBILITIES

1. ✅ Implement all fixes correctly
2. ✅ Document fixes in `SECURITY_FIXES_COMPLETE.md`
3. ✅ Verify TypeScript compilation passes
4. ✅ Say "READY" when complete
5. ✅ Fix additional issues if reviewer finds problems
6. ✅ Use new reference ID for each round of fixes

---

## 🎯 REVIEWER RESPONSIBILITIES

1. ✅ Verify all fixes in code
2. ✅ Update `PLANNING_KICKBACK.md` with results
3. ✅ Approve if all fixes verified
4. ✅ Send code back to Builder if issues found
5. ✅ Assign new reference ID for additional fixes
6. ✅ Do NOT fix code yourself

---

## ⚠️ CRITICAL RULES

### Builder:
- ✅ Fix code issues when reviewer finds them
- ✅ Use new reference ID for each fix round
- ✅ Document all fixes clearly
- ❌ Do NOT approve your own work

### Reviewer:
- ✅ Verify fixes in actual code
- ✅ Update master document with results
- ✅ Send code back if issues found
- ❌ Do NOT fix code yourself
- ❌ Do NOT approve if issues exist

---

## 📄 DOCUMENTS IN WORKFLOW

1. **`PLANNING_KICKBACK.md`** - Master document (Reviewer updates)
2. **`SECURITY_FIXES_COMPLETE.md`** - Fix documentation (Builder updates)
3. **`REVIEWER_PROMPT.md`** - Reviewer instructions
4. **`BUILDER_WORKFLOW.md`** - This document (workflow reference)

---

## 🔄 ITERATIVE PROCESS

The process may require multiple rounds:

**Round 1:**
- Builder: F1 fixes (10 fixes)
- Reviewer: Finds 2 issues
- Status: Code goes back to Builder

**Round 2:**
- Builder: F2 fixes (2 additional fixes)
- Reviewer: All verified
- Status: Approved ✅

**This is normal and expected. The goal is security, not speed.**

---

## ✅ SUCCESS CRITERIA

Process is complete when:

1. ✅ Reviewer verifies ALL fixes
2. ✅ `PLANNING_KICKBACK.md` shows "APPROVED FOR DEPLOYMENT"
3. ✅ All vulnerabilities marked as "VERIFIED FIXED"
4. ✅ No issues remain
5. ✅ Code ready for production

---

**Remember:** If reviewer finds issues, code MUST come back to Builder. This ensures quality and security.





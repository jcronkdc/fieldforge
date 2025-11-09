# OPUS — COMPREHENSIVE QA SUITE v1.0
## CANONICAL END-TO-END TEST PLAN FOR MYTHATRON

---

## SYSTEM DIRECTIVE
**This specification is the ONLY comprehensive end-to-end test plan for the project.**
- Run in full each time unless explicitly requested for subset
- Improvements may be suggested after complete run, but no deviation during execution
- This document supersedes all previous test plans

---

## 0) SCOPE & GOALS

### Primary Objectives
- Validate entire MythaTron platform end-to-end
- Click and validate EVERY actionable element
- Confirm no UI elements are obscured
- Enforce exact naming conventions
- Verify Sparks economy integrity
- Ensure accessibility compliance
- Log all defects with comprehensive evidence

### Coverage Areas
- **Auth System**: Login, logout, session persistence
- **Dashboard**: All widgets, navigation, stats
- **StoryForge**: Story creation with Claude 3 Haiku
- **SongForge**: Lyrics generation with Claude 3 Haiku
- **MythaQuest**: RPG system (when implemented)
- **Sparks Economy**: Purchases, debits, credits
- **AI Features**: Claude 3 Haiku sitewide integration
- **Image Generation**: Grok 2 integration
- **Notifications**: Toasts, banners, alerts
- **Settings**: Account, billing, preferences
- **Search & Navigation**: Global search, routing
- **Responsive Layouts**: All breakpoints

### Naming Enforcement
**EXACT NAMING REQUIRED:**
- ✅ "StoryForge" (single word, capital S and F)
- ✅ "SongForge" (single word, capital S and F)
- ✅ "MythaQuest" (single word, capital M and Q)
- ❌ "Story Forge", "Song Forge", "Mytha Quest", "Angry Lips"

---

## 1) TEST CONFIGURATION

### Environments
- **Staging**: Primary test environment
- **Production**: Secondary validation (if available)
- Note environment in EVERY finding

### Browsers & Devices
**Desktop:**
- Chrome (latest)
- Firefox (latest)
- Safari (macOS)

**Mobile Emulation:**
- 360×800 (Mobile S)
- 768×1024 (Tablet)
- 1280×800 (Laptop)
- 1440×900 (Desktop)

### Authentication
- Prompt for test credentials at run start
- Store securely in session only
- Never print plaintext outside credential step
- Test accounts:
  - Supreme Admin: justincronk@pm.me
  - Regular User: testuser@mythatron.com

### Feature Flags & Build Info
Capture and attach:
- `window.__buildInfo`
- Feature flags
- Commit hash
- Environment variables (sanitized)

### Network Recording
Record HAR files for:
- Authentication flows
- Sparks purchases
- AI API calls
- Image generation requests

---

## 2) GLOBAL INVARIANTS & GUARDS

### Must Always Pass
1. **Naming Compliance**
   - Search DOM, routes, titles, toasts, tooltips
   - FAIL if found: "Story Forge", "Song Forge", "Myth Quest", "Angry Lips"
   - List exact locations with screenshots

2. **No Obscured UI**
   - Verify corners and edges at each breakpoint
   - Check z-index conflicts
   - Validate pointer-events

3. **No Fatal Errors**
   - Console free of uncaught exceptions
   - No 4xx/5xx on first-party endpoints
   - No memory leaks

4. **Auth Persistence**
   - Session survives reload
   - No infinite login loops
   - No CSRF issues

---

## 3) DEVTOOLS CONSOLE TRAVERSAL

### Automated Click Everything Protocol

```javascript
// Traversal Procedure (per page/route/state)
const actionableSelectors = [
  'button',
  '[role="button"]',
  'a[href]',
  '[tabindex]:not([tabindex="-1"])',
  'input[type="submit"]',
  '.menuitem',
  '.tab',
  '.chip',
  '.toggle',
  '.icon-button'
];

// For each element:
1. Verify visibility (offsetParent !== null)
2. Check obstruction (document.elementFromPoint)
3. Validate enabled state
4. Capture metadata (text, aria-label, href)
5. Trigger interaction (click, focus+Enter)
6. Assert outcome:
   - Navigation change
   - Modal/drawer open
   - Content mutation
   - Toast/banner appear
   - Network call initiated
7. Verify no duplicate actions
8. Check loading states
9. Confirm tooltips on icon-only buttons
10. Log failures with full context
```

### Keyboard Navigation Test
- Tab through entire page
- Verify logical order
- Check visible focus rings
- Test Escape key for modals
- Validate Enter/Space activation

---

## 4) FUNCTIONAL TEST MATRIX

### 4.1 AUTH
- [ ] Email/password login
- [ ] Logout functionality
- [ ] Session persistence
- [ ] Password reset flow
- [ ] Error states (bad credentials)
- [ ] Deep-link redirects
- [ ] No sensitive info in URL/console

### 4.2 DASHBOARD & GLOBAL NAV
- [ ] All widgets load correctly
- [ ] No "Angry Lips" references
- [ ] Visual consistency
- [ ] Every tile/CTA clickable
- [ ] Correct routing
- [ ] State persistence on navigation
- [ ] Global search functionality

### 4.3 STORYFORGE
- [ ] New project creation
- [ ] Edit/save/fork/delete
- [ ] Autosave functionality
- [ ] Claude 3 Haiku integration
- [ ] Prompt/regenerate/variations
- [ ] Token usage display
- [ ] All buttons functional
- [ ] Export/share features
- [ ] Caching for identical prompts
- [ ] Naming compliance

### 4.4 SONGFORGE
- [ ] Lyrics generation
- [ ] Structure templates
- [ ] Regeneration options
- [ ] Audio hooks (if applicable)
- [ ] Play/stop controls
- [ ] Copy/export/share
- [ ] Claude integration
- [ ] Sparks cost accounting
- [ ] No naming violations

### 4.5 MYTHAQUEST (RPG)
- [ ] Campaign/quest creation
- [ ] Character management
- [ ] Map interactions
- [ ] Inventory system
- [ ] AI mercenary purchase
- [ ] Upgrades (earned vs purchased)
- [ ] Sparks consumption
- [ ] Insufficient Sparks flow
- [ ] Refund on failure
- [ ] Group dashboards
- [ ] Combat system

### 4.6 IMAGE GENERATION (GROK 2)
- [ ] Single image generation
- [ ] Batch processing
- [ ] Size/ratio presets
- [ ] Re-roll functionality
- [ ] Upscale options
- [ ] Sparks burn rates
- [ ] Preview vs final
- [ ] Download/export
- [ ] NSFW guardrails
- [ ] Cancellation handling

### 4.7 SPARKS ECONOMY & BILLING
- [ ] Purchase packs (all tiers)
- [ ] Price display accuracy
- [ ] Tax/VAT calculation
- [ ] Receipt generation
- [ ] Balance updates (atomic)
- [ ] Network error handling
- [ ] Idempotency verification
- [ ] Ledger accuracy
- [ ] Refund/cancellation

### 4.8 NOTIFICATIONS
- [ ] Never obscure navigation
- [ ] Never cover primary CTAs
- [ ] Stacking behavior
- [ ] Auto-dismiss timers
- [ ] Manual close buttons
- [ ] Focus trap in modals

### 4.9 SETTINGS/ACCOUNT
- [ ] Profile editing
- [ ] Password change
- [ ] Email verification
- [ ] Account deletion
- [ ] API key management
- [ ] Save/cancel flows
- [ ] Optimistic UI updates
- [ ] Rollback on failure

---

## 5) ACCESSIBILITY (WCAG 2.1 AA)

### Requirements
- [ ] Tab order logical
- [ ] Visible focus rings
- [ ] Enter/Space activation
- [ ] ARIA roles correct
- [ ] ARIA states accurate
- [ ] ARIA labels present
- [ ] aria-live for async content
- [ ] Contrast ≥ 4.5:1
- [ ] Tooltips keyboard accessible

---

## 6) PERFORMANCE & STABILITY

### Metrics
- **LCP**: < 2.5s (good), < 4s (needs improvement)
- **CLS**: < 0.1 (good), < 0.25 (needs improvement)
- **FID**: < 100ms (good), < 300ms (needs improvement)

### Stability Tests
- [ ] No memory leaks (20+ generations)
- [ ] Modal open/close repeatedly
- [ ] Long session stability (1hr+)
- [ ] Retry/backoff on 429/5xx
- [ ] Graceful degradation

---

## 7) ANALYTICS & EVENTS

### Tracking Validation
- [ ] Key actions fire events
- [ ] Correct payload structure
- [ ] No duplicate events
- [ ] No PII leakage
- [ ] Events: create, generate, purchase, fail

---

## 8) ERROR & EMPTY STATES

### Coverage
- [ ] Network offline mode
- [ ] Server errors (500, 503)
- [ ] AI timeouts
- [ ] Quota exceeded
- [ ] No results found
- [ ] First-time user experience
- [ ] Clear messaging
- [ ] Actionable CTAs

---

## 9) REPORTING & OUTPUT

### Required Deliverables

#### 1. Summary Report
```
Test Run Summary
================
Date: [timestamp]
Environment: [staging/production]
Build: [commit hash]
Browsers: [list]
Breakpoints: [list]

Results:
- Total Tests: XXX
- Passed: XXX
- Failed: XXX
- Blocked: XXX
- Coverage: XX%
```

#### 2. Button Inventory
```
Route: /dashboard
Total Buttons: XX
├── Visible: XX
├── Enabled: XX
├── Clicked: XX
└── Failed: XX

[Screenshot grid of all buttons]
```

#### 3. Defect Log
```
DEFECT #001
===========
Title: [Brief description]
Severity: [Blocker/Major/Minor]
Environment: [staging/production]
Browser: [Chrome/Safari/Firefox]
Viewport: [dimensions]

Steps to Reproduce:
1. [Step 1]
2. [Step 2]
3. [Step 3]

Expected: [What should happen]
Actual: [What actually happened]

Evidence:
- Screenshot: [link]
- Console: [errors]
- Network: [HAR excerpt]
- DOM Path: [selector]
```

#### 4. Obstruction Audit
- Screenshots at each breakpoint
- Highlighted problem areas
- Z-index conflicts marked

#### 5. Naming Compliance Report
```
Naming Violations Found: [count]
========================
Location: [DOM path]
Found: "Story Forge"
Should be: "StoryForge"
[Screenshot]
```

#### 6. Sparks Ledger Sample
```
Flow: Purchase Premium Pack
============================
Before: 500 Sparks
Action: Purchase 1000 Sparks ($9.99)
After: 1500 Sparks
Network: [Transaction ID]
Receipt: [Generated]
```

### Export Structure
```
opus-qa-report-[timestamp]/
├── summary.html
├── defects/
│   ├── defect-001.json
│   ├── defect-002.json
│   └── screenshots/
├── button-inventory/
│   ├── dashboard.html
│   ├── storyforge.html
│   └── screenshots/
├── naming-violations/
│   └── violations.json
├── sparks-ledger/
│   └── transactions.csv
├── network-logs/
│   └── *.har
└── console-logs/
    └── *.txt
```

---

## 10) EXECUTION CHECKLIST

### Pre-Test
- [ ] Credentials obtained
- [ ] Test data prepared
- [ ] Recording tools ready
- [ ] Clean browser profile

### During Test
- [ ] Follow exact sequence
- [ ] Document everything
- [ ] Capture evidence immediately
- [ ] Note environment for each finding

### Post-Test
- [ ] Generate all reports
- [ ] Archive evidence
- [ ] Create defect tickets
- [ ] Brief stakeholders

---

## CANONICAL STATUS
**This document is the authoritative QA test plan for MythaTron.**
- Version: 1.0
- Last Updated: [Current Date]
- Next Review: [30 days]
- Owner: QA Team / justincronk@pm.me

---

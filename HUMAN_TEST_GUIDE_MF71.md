# 🧪 HUMAN TEST GUIDE: Collaboration Network (MF-71)

**Test Type**: Mycelial Pathway Verification  
**Duration**: 5 minutes (single user) / 15 minutes (multi-user)  
**Priority**: CRITICAL - Verifies ant-optimized collaboration flow  
**Status**: READY TO TEST NOW (zero blockers)

---

## 🎯 OBJECTIVE

Verify the collaboration mycelium connects cleanly:
- Daily.co video rooms create successfully
- Ably real-time messaging syncs
- Invite-only groups enforce RLS
- Cursor control integrates smoothly

**Ant Logic**: Shortest path from "user wants to collaborate" → "team is collaborating"

---

## 🐜 ANT-OPTIMIZED TEST PATH (5 Minutes, Single User)

**Purpose**: Verify UI and room creation (doesn't need 2nd user)

### Step 1: Login (30 seconds)
1. Go to https://fieldforge.vercel.app
2. Click "Sign In"
3. Use your real Supabase account credentials
4. ✅ Verify you reach the dashboard

### Step 2: Navigate to Any Collaboration-Enabled Component (30 seconds)
Pick ANY of these 17 locations (all have CollaborationHub):
- SafetyHub
- DocumentHub
- QAQCHub
- EquipmentHub
- CrewManagement
- FieldOperations
- ThreeWeekLookahead
- DrawingViewer
- RFIManager
- SubmittalManager
- OutageCoordination
- TestingDashboard
- EnvironmentalCompliance
- MaterialInventory
- ReceiptManager
- ProjectManager
- EmergencyAlerts

**Shortest path**: Click "Safety Hub" (usually top of nav)

### Step 3: Verify CollaborationHub Loads (1 minute)
Look for:
- ✅ Two tabs visible: "💬 Team Chat" and "🎥 Video Collab"
- ✅ "Invite-Only" badge on Team Chat
- ✅ "Cursor Control" badge on Video Collab
- ✅ No errors in browser console (F12)

**EXPECTED**: Tabs render, no "Sign In Required" error

**IF YOU SEE "Sign In Required"**:
- Check browser console for auth errors
- Verify you're actually logged in (check top-right user menu)
- Try refreshing the page

### Step 4: Click "🎥 Video Collab" Tab (1 minute)
1. Click the Video Collab tab
2. Look for room creation UI
3. Should see:
   - ✅ "Create Room" or "Start Video" button
   - ✅ Room description/instructions
   - ✅ No 503 errors

**EXPECTED**: Room creation interface loads

**IF YOU SEE 503 ERROR**:
- DAILY_API_KEY not configured (but it should be per env check)
- Open browser console, share error details

### Step 5: Create Video Room (2 minutes)
1. Click "Create Room" button
2. Wait for room creation
3. **EXPECTED RESULT**:
   - ✅ Daily.co room opens (in new tab or embedded iframe)
   - ✅ Camera/mic permission request appears
   - ✅ You see yourself in video preview
   - ✅ Room URL is visible (starts with https://...)

**SUCCESS CRITERIA**:
- Room creates without error
- Daily.co interface loads
- No 503/500 errors

**IF ROOM FAILS TO CREATE**:
- Check browser console for errors
- Check network tab (F12 → Network) for failed requests
- Note exact error message

### Step 6: Verify Database Persistence (30 seconds)
1. After room creates, check if room URL was saved
2. Look for "Active Rooms" list in UI
3. Your new room should appear there

**EXPECTED**: Room persists in collaboration_rooms table

---

## 👥 MULTI-USER TEST (15 Minutes, 2+ Users)

**Purpose**: Verify invite-only enforcement + real-time sync

### Prerequisites
- 2 users with Supabase accounts
- Both users are members of the same project
- 1 non-member user (for invite-only test)

### User A Steps (5 minutes)
1. Login → Navigate to Safety Hub
2. Click "🎥 Video Collab" tab
3. Click "Create Room"
4. **COPY the Daily.co room URL** (e.g., https://yourapp.daily.co/room-name)
5. Send URL to User B via external channel (Slack, email, SMS)
6. Wait for User B to join
7. **VERIFY**:
   - ✅ You see User B's video feed appear
   - ✅ You can hear User B
   - ✅ User B can hear you

### User B Steps (5 minutes)
1. Login to FieldForge
2. **PASTE the URL** from User A into browser
3. Daily.co room should open
4. Grant camera/mic permissions
5. **VERIFY**:
   - ✅ You see User A's video
   - ✅ You can hear User A
   - ✅ User A can hear you
6. **TEST CURSOR CONTROL** (if enabled):
   - Move cursor in shared view
   - User A should see your cursor position
   - Look for "Team Viewing (2)" indicator

### User C - Non-Member Test (5 minutes)
**Purpose**: Verify invite-only enforcement

1. User C (NOT a project member) tries to access same project
2. **EXPECTED**:
   - ❌ User C sees 403 Forbidden
   - ❌ OR User C sees empty project list
   - ❌ OR User C reaches Daily.co knocking screen (waiting for approval)

**SUCCESS**: User C is BLOCKED from seeing project data

**FAILURE**: If User C can see project data → RLS is broken (CRITICAL BUG)

---

## 🔍 WHAT TO CHECK (Mycelial Verification)

### Frontend → Backend Connection
- ✅ POST /api/collaboration/rooms creates successfully
- ✅ Response includes Daily.co room URL
- ✅ No CORS errors

### Backend → Daily.co API
- ✅ DAILY_API_KEY is used in request
- ✅ Daily.co API returns room URL
- ✅ No 503 errors (API key invalid)
- ✅ No 401 errors (API key missing)

### Backend → Database
- ✅ Room saved to collaboration_rooms table
- ✅ room_type = 'project_team' or similar
- ✅ expires_at set (default 4 hours)
- ✅ RLS policies allow project members to see room

### Backend → Ably (Real-time)
- ✅ Room creation event published to Ably channel
- ✅ Other project members receive notification
- ✅ Cursor positions sync via Ably

### Database RLS (Invite-Only)
- ✅ Only project members can query collaboration_rooms for project
- ✅ Non-members get empty result set or 403
- ✅ Daily.co knocking feature blocks unauthorized joins

---

## ✅ SUCCESS CRITERIA

**PASS**: All these must be true
1. ✅ CollaborationHub loads without "Sign In Required" error
2. ✅ Video Collab tab shows room creation UI
3. ✅ Room creates successfully (no 503/500 errors)
4. ✅ Daily.co room opens in browser
5. ✅ User A and User B can see/hear each other
6. ✅ User C (non-member) is blocked from accessing project
7. ✅ Room persists in database (visible in Active Rooms list)
8. ✅ No errors in browser console

**FAIL**: Any of these occur
- ❌ "Sign In Required" error when logged in
- ❌ 503 error when creating room (API key issue)
- ❌ Room creation fails (backend error)
- ❌ Daily.co room doesn't open
- ❌ Users can't see/hear each other
- ❌ User C can access project data (RLS broken)
- ❌ Console shows errors

---

## 🐛 TROUBLESHOOTING

### Issue: "Sign In Required" when logged in
**Cause**: Auth context not syncing  
**Fix**: Refresh page, clear localStorage, re-login  
**Check**: Browser console for auth errors

### Issue: 503 Error on Room Creation
**Cause**: DAILY_API_KEY not configured or invalid  
**Fix**: Verify env var in Vercel dashboard  
**Check**: `vercel env ls production` shows DAILY_API_KEY

### Issue: Room Creates but Daily.co Doesn't Open
**Cause**: Popup blocker or iframe blocked  
**Fix**: Allow popups for fieldforge.vercel.app  
**Check**: Browser popup settings

### Issue: User B Can't Join Room
**Cause**: Daily.co room privacy settings or RLS blocking  
**Fix**: Check room configuration (enable knocking)  
**Check**: Database collaboration_rooms.room_privacy

### Issue: User C Can See Project Data (CRITICAL)
**Cause**: RLS policies not enforcing invite-only  
**Fix**: Check migration 024 applied, verify RLS policies  
**Check**: `psql` query: `SELECT * FROM collaboration_rooms WHERE project_id = '<id>';` as User C

---

## 📊 TEST RESULTS TEMPLATE

Copy this to MASTER_DOC after testing:

```markdown
## MF-71: HUMAN TEST RESULTS — Collaboration Network

**Date**: [YYYY-MM-DD]  
**Testers**: [User A email, User B email, User C email]  
**Test Duration**: [XX minutes]  
**Browser**: [Chrome/Firefox/Safari + version]

### Single User Test (5 min)
- CollaborationHub Loads: [✅ PASS / ❌ FAIL + error]
- Video Tab Shows UI: [✅ PASS / ❌ FAIL + error]
- Room Creation: [✅ PASS / ❌ FAIL + error]
- Daily.co Opens: [✅ PASS / ❌ FAIL + error]
- No Console Errors: [✅ PASS / ❌ FAIL + errors shown]

### Multi-User Test (15 min)
- User A Creates Room: [✅ PASS / ❌ FAIL + error]
- User B Joins Room: [✅ PASS / ❌ FAIL + error]
- Video/Audio Quality: [✅ PASS / ❌ FAIL + description]
- User C Blocked: [✅ PASS / ❌ FAIL - CRITICAL if fails]
- Cursor Control: [✅ PASS / ❌ FAIL / ⏸️ NOT TESTED]
- Room Persistence: [✅ PASS / ❌ FAIL + error]

### Mycelial Pathway Verification
- Frontend → Backend: [✅ CONNECTED / ❌ BROKEN]
- Backend → Daily.co: [✅ CONNECTED / ❌ BROKEN]
- Backend → Database: [✅ CONNECTED / ❌ BROKEN]
- Backend → Ably: [✅ CONNECTED / ❌ BROKEN / ⏸️ NOT TESTED]
- RLS Enforcement: [✅ WORKING / ❌ BROKEN - CRITICAL]

### Overall Result
- Ant Optimization Score: [XX/100]
- Collaboration Network Status: [✅ OPERATIONAL / ❌ BROKEN]
- Ready for Production: [✅ YES / ❌ NO - blockers: ___]

### Next Steps
[If PASS: "Ready for production, collaboration verified"]  
[If FAIL: List exact fixes needed with priority]
```

---

## 🎯 ANT-OPTIMIZED CONCLUSION

**Shortest Path Achieved**:
```
User Login (30s)
  ↓
Navigate to Safety Hub (30s)
  ↓
Click Video Collab Tab (10s)
  ↓
Create Room (30s)
  ↓
Daily.co Opens (10s)
  ↓
Team Collaborates
```

**Total Time**: 2 minutes from login to video call  
**User Friction**: MINIMAL (5 clicks)  
**Complexity**: HIDDEN (mycelium handles all connections)

**This is the Japan subway model**: Users see simple interface, but underneath, the optimal pathway (shortest connections, invite-only security, real-time sync) is humming perfectly.

---

**Test Status**: ⏳ READY TO RUN NOW  
**Blockers**: ZERO  
**Required Setup**: Just login credentials  
**Can Start**: IMMEDIATELY  

**After Test**: Update MASTER_DOC with results, mark MF-71 as COMPLETE or BLOCKED with exact errors


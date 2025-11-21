# FieldForge Demo Project - Complete User Guide

**Mission ID:** MF-63  
**Date:** 2025-11-20  
**Purpose:** Full demonstration of FieldForge's mycelial collaboration network

---

## 🎯 What This Demo Shows

This demo project demonstrates the complete FieldForge experience - from project creation through real-time team collaboration with video, cursor control, and invite-only messaging groups. It follows the **mycelial network** principle: every pathway connects logically, every feature flows seamlessly, just like Japan's subway optimization using ant colonies.

### The Demo Project: Cedar Creek 138kV Substation

A realistic electrical substation construction project with:
- **$2.85M budget** over 10 months
- **5-person core team** with specific roles and certifications
- **Complete safety program** with incidents, observations, and correctives
- **Equipment fleet** including cranes, excavators, testing equipment
- **QA/QC checkpoints** with pass/fail inspections
- **Daily field reports** with weather, crew counts, work performed
- **Technical documents** including drawings, submittals, schedules
- **Video collaboration room** (Daily.co) with cursor control
- **Invite-only messaging group** for team coordination

---

## 🚀 Quick Start

### 1. Create the Demo Project

```bash
cd backend
npm run build
node dist/scripts/createDemoProject.js
```

**What happens:**
1. Creates "PowerGrid Solutions LLC" company
2. Creates 5 team members with roles and certifications
3. Creates "Cedar Creek 138kV Substation Construction" project
4. Populates with realistic data (safety, equipment, inspections, etc.)
5. Sets up Daily.co video room (if API key configured)
6. Creates invite-only messaging group
7. Assigns team members with proper permissions

### 2. Login & Explore

Visit: https://fieldforge.vercel.app/login

**Demo Accounts Created:**
- sarah.chen@powergridsolutions.com (Project Manager - Admin)
- marcus.rodriguez@powergridsolutions.com (Field Supervisor)
- jennifer.walsh@powergridsolutions.com (Safety Officer)
- david.kim@powergridsolutions.com (QA/QC Inspector)
- amanda.torres@powergridsolutions.com (Equipment Coordinator)

**Note:** These accounts won't have passwords yet. To test:
1. Use Supabase Auth to create passwords for these emails
2. Or create a new account and manually assign to the project

---

## 🧪 Human Test Scenarios

Test the system like a real user would - following natural pathways like the mycelial network:

### Scenario 1: Project Manager Daily Workflow

**User:** Sarah Chen (PM)  
**Goal:** Start the day, check project status, coordinate with team

1. **Login & Dashboard**
   - Navigate to `/dashboard`
   - See project health score, budget status, schedule
   - Check weather conditions and workability score

2. **Morning Safety Check**
   - Navigate to `/safety`
   - Review recent incidents (near-miss from crane operation)
   - Verify corrective actions implemented
   - Check safety observation (positive crew recognition)

3. **Project Coordination**
   - Navigate to `/projects` → Select "Cedar Creek"
   - Review project summary:
     - Budget: $2.85M (see spend vs remaining)
     - Schedule: Active tasks vs overdue
     - Team: 5 members assigned
   - Ask AI: "Give me project summary"
   - See comprehensive health analysis

4. **Team Video Call**
   - Click "Team Collaboration" button
   - Join Daily.co video room
   - Screen share the project schedule
   - Use cursor control to point out critical path items
   - Record meeting for documentation

5. **Messaging**
   - Navigate to `/messaging`
   - Open "Cedar Creek Core Team" group
   - Send update: "Transformer delivery confirmed for Tuesday"
   - @mention Marcus for site prep
   - Group is invite-only - test inviting new member

---

### Scenario 2: Field Supervisor Daily Operations

**User:** Marcus Rodriguez  
**Goal:** Submit daily report, track crew, manage equipment

1. **Daily Report Creation**
   - Navigate to `/operations`
   - Create new daily report:
     - Date: Today
     - Weather: Check AI weather analysis
     - Crew count: 12 workers
     - Hours: 96 total hours
     - Work performed: List activities
     - Equipment used: Select from fleet
     - Materials received: Log deliveries
     - Safety incidents: 0 today!
   - Submit report

2. **Equipment Coordination**
   - Navigate to `/equipment`
   - Check equipment status:
     - Liebherr Crane: Operational
     - CAT Excavator: Operational
     - Genie Man Lift: Maintenance (coordinate with Amanda)
   - Schedule maintenance for next week

3. **Time Tracking**
   - Navigate to `/field-ops`
   - Enter time for crew members
   - Assign to cost codes
   - Verify overtime

4. **Video Collaboration**
   - Start video call from `/operations` page
   - Invite QA inspector for foundation review
   - Share screen showing concrete test results
   - Use cursor control to highlight concerns

---

### Scenario 3: Safety Officer Inspection

**User:** Jennifer Walsh  
**Goal:** Conduct safety walkdown, report findings, ensure compliance

1. **Safety Dashboard**
   - Navigate to `/safety`
   - Review metrics:
     - Days since last incident: X
     - Near-misses: 1 (crane load swing)
     - Positive observations: 1 (crew huddle)
   - Check incident trends

2. **Create Safety Observation**
   - Click "New Observation"
   - Type: Positive
   - Description: "Excellent housekeeping in control building. All walkways clear, tools properly stored, fire extinguishers accessible."
   - Location: Control Building
   - Severity: Low
   - Photo: Upload from phone
   - Submit

3. **Review Corrective Actions**
   - Open near-miss incident
   - Verify corrective actions:
     - ✅ Spotter assigned for crane ops
     - ✅ Wind speed monitoring implemented
     - ✅ Rigger retraining completed
   - Close incident

4. **Safety Team Call**
   - Start video collaboration: "Safety Team Call"
   - Invite entire crew for toolbox talk
   - Share screen with safety statistics
   - Enable cursor control for everyone
   - Record session for compliance

---

### Scenario 4: QA/QC Inspector Quality Control

**User:** David Kim  
**Goal:** Perform inspections, document results, ensure specifications met

1. **Inspection Schedule**
   - Navigate to `/qaqc`
   - See pending inspections:
     - Control cable installation (pending)
     - Transformer foundation (passed)
     - Grounding system (passed)

2. **Conduct New Inspection**
   - Select: "Control Cable Installation QC"
   - Checklist:
     - [ ] Cables pulled per drawings
     - [ ] Tags applied correctly
     - [ ] Megger test: _____ MΩ
     - [ ] Terminations torqued to spec
   - Add photos of work
   - Enter test results
   - Status: Passed ✅
   - Submit

3. **Document Review**
   - Navigate to `/documents`
   - Review: "Transformer Factory Acceptance Test Report"
   - Compare specs vs as-built
   - Approve submittal

4. **Collaborative Drawing Review**
   - Navigate to `/documents/drawings`
   - Open: "Single Line Diagram Rev 3"
   - Start video collaboration: "Drawing Review"
   - Enable cursor control
   - Multiple inspectors can point at drawing simultaneously
   - Mark up concerns directly on drawing
   - Record session with annotations

---

### Scenario 5: Equipment Coordinator Logistics

**User:** Amanda Torres  
**Goal:** Manage equipment fleet, schedule maintenance, coordinate deliveries

1. **Equipment Dashboard**
   - Navigate to `/equipment`
   - See fleet status:
     - 3 operational
     - 1 in maintenance (Man Lift)
   - Check utilization rates

2. **Schedule Maintenance**
   - Select: "Genie Z-60 Man Lift"
   - Status: Change to "Maintenance"
   - Notes: "Annual certification due. Hydraulic leak on boom section."
   - Schedule: Next Monday 7am
   - Assign: External vendor
   - Create calendar event

3. **Coordinate Delivery**
   - New equipment arriving: "Transformer (20/28/35 MVA)"
   - Create receipt:
     - Item: Power Transformer
     - Manufacturer: ABB
     - Serial: ABC123456
     - Delivery date: Tuesday
     - Crane needed: Yes
     - Road closure required: Yes
   - Notify team via messaging

4. **Video Coordination**
   - Start call: "Transformer Delivery Planning"
   - Screen share delivery route
   - Invite crane operator, field supervisor, safety officer
   - Review rigging plan using cursor control
   - Assign tasks in real-time

---

## 🎥 Testing Collaboration Features (Daily.co)

### Video Room Features

1. **Join Room**
   - Click any "Collaboration" button (green gradient)
   - See full-screen video interface
   - Camera & microphone controls

2. **Screen Sharing**
   - Share project schedule, drawings, reports
   - All participants see in real-time
   - Perfect for document reviews

3. **Recording**
   - Enable cloud recording
   - Automatically saved for compliance
   - Access recordings from project documents

4. **Cursor Control** (Unique Feature!)
   - Enable cursor sharing mode
   - All participants see each other's cursors
   - Perfect for:
     - Drawing reviews (point at details)
     - Schedule walkthroughs (highlight tasks)
     - Document collaboration (mark changes)
   - Each cursor labeled with user name

### Testing Cursor Control

1. Open a drawing or document
2. Start video collaboration
3. Enable "Cursor Control" mode
4. Move your cursor - others see it
5. Multiple cursors can be active
6. Click to highlight/annotate
7. Perfect for remote inspections!

---

## 💬 Testing Invite-Only Messaging

### Group Features

1. **Private Channels**
   - "Cedar Creek Core Team" is invite-only
   - Only members can see messages
   - Admin approval required for new members

2. **Adding Members**
   - Click group settings
   - "Invite Member"
   - Enter email or select from project team
   - Admin (Sarah) must approve

3. **Permissions**
   - Admin: Can invite, remove, change settings
   - Member: Can read, write, react
   - Guest: Read-only (if enabled)

4. **Message Features**
   - Real-time updates (Ably websockets)
   - @mentions with notifications
   - Reactions (👍 ✅ ⚠️)
   - File sharing
   - Message search

### Testing Flow

1. Login as Sarah (PM/Admin)
2. Navigate to `/messaging`
3. Open "Cedar Creek Core Team"
4. Send message: "@marcus Transformer arrives Tuesday - need crane scheduled"
5. Login as Marcus
6. See notification
7. Respond in thread
8. Try to invite external user
9. See admin approval required

---

## 🤖 Testing AI Integration

### AI Features in Demo Project

1. **Project Summary**
   - Click AI assistant (brain icon)
   - Ask: "Give me project summary"
   - See:
     - Health score (0-100)
     - Budget analysis
     - Schedule status
     - Safety metrics
     - AI insights & recommendations

2. **Navigation Help**
   - Ask: "How do I start a video call?"
   - Get step-by-step guide with:
     - Where to go
     - 8-step instructions
     - Pro tips
     - Troubleshooting

3. **Weather Analysis**
   - Ask: "Check weather"
   - Get construction workability score:
     - EXCELLENT (0 restrictions)
     - GOOD (minor adjustments)
     - FAIR (plan modifications)
     - POOR (limited operations)
     - UNSAFE (shutdown required)

4. **Analytics**
   - Ask: "Run analytics"
   - Choose: Comprehensive
   - See:
     - Productivity trends
     - Cost analysis
     - Schedule performance
     - Safety trends
     - Quality metrics

---

## 📊 Data Created

### Summary of Demo Data

| Category | Count | Details |
|----------|-------|---------|
| **Company** | 1 | PowerGrid Solutions LLC |
| **Users** | 5 | PM, Supervisor, Safety Officer, QC Inspector, Equipment Coordinator |
| **Projects** | 1 | Cedar Creek 138kV Substation ($2.85M, 10 months) |
| **Safety Records** | 2 | 1 near-miss, 1 positive observation |
| **Equipment** | 4 | Crane, excavator, testing equipment, man lift |
| **Inspections** | 3 | Foundations (passed), grounding (passed), cables (pending) |
| **Daily Reports** | 1 | Yesterday's report with 12 crew, 96 hours |
| **Documents** | 4 | Drawings, submittals, safety plan, schedule |
| **Video Rooms** | 1 | "Cedar Creek Team Coordination" (Daily.co) |
| **Messaging Groups** | 1 | "Cedar Creek Core Team" (invite-only) |

---

## 🔍 Verification Checklist

After creating the demo project, verify these pathways flow cleanly:

- [ ] **Project visible in project list**
  - Navigate to `/projects`
  - See "Cedar Creek 138kV Substation"
  - Click to view details

- [ ] **Team members assigned**
  - Project page shows 5 team members
  - Roles displayed correctly
  - Permissions working (admin vs member)

- [ ] **Safety records accessible**
  - Navigate to `/safety`
  - See 2 incidents
  - Can view details and corrective actions

- [ ] **Equipment list populated**
  - Navigate to `/equipment`
  - See 4 equipment items
  - Status indicators correct

- [ ] **QA/QC inspections present**
  - Navigate to `/qaqc`
  - See 3 inspections
  - 2 passed, 1 pending

- [ ] **Daily reports viewable**
  - Navigate to `/operations`
  - See recent daily report
  - All fields populated

- [ ] **Documents uploaded**
  - Navigate to `/documents`
  - See 4 documents
  - Categories assigned

- [ ] **Video room functional** (if DAILY_API_KEY set)
  - Collaboration button visible
  - Clicking opens video interface
  - Can join room
  - Screen share works
  - Cursor control enabled

- [ ] **Messaging group working**
  - Navigate to `/messaging`
  - See "Cedar Creek Core Team"
  - Can send messages
  - Real-time updates work
  - Invite-only enforced

- [ ] **AI assistant responsive**
  - Click AI brain icon
  - Ask questions
  - Get relevant responses
  - Navigation guidance works

---

## 🐛 Troubleshooting

### Video Room Not Creating

**Issue:** Collaboration room shows "not configured"  
**Solution:**
1. Add `DAILY_API_KEY` to environment variables
2. Get key from https://dashboard.daily.co/developers
3. Add to Vercel or `.env` file
4. Redeploy
5. Rerun demo script

### Messaging Not Real-Time

**Issue:** Messages don't appear immediately  
**Solution:**
1. Check `ABLY_API_KEY` is configured
2. Verify Ably channels are active
3. Check browser console for websocket errors
4. Refresh page

### AI Not Responding

**Issue:** AI gives generic responses  
**Solution:**
1. Verify `ANTHROPIC_API_KEY` is set
2. Check API quota/limits
3. Look at backend logs for errors
4. Try simpler queries first

---

## 🌟 Best Practices Demonstrated

### Mycelial Network Principles

1. **Logical Flow**
   - Project → Team → Tasks → Collaboration
   - Every feature connects to others
   - No dead-end pathways

2. **Real-Time Sync**
   - Ably for instant messaging
   - Daily.co for video
   - Cursor positions shared live
   - No page refreshes needed

3. **Invite-Only Security**
   - Groups require admin approval
   - Video rooms are private
   - Tokens expire (24 hours)
   - RLS enforced at database level

4. **Collaboration-First**
   - Every major feature has collaboration button
   - Video/messaging integrated everywhere
   - Cursor control for remote work
   - Screen sharing built-in

---

## 📝 Next Steps

After testing the demo project:

1. **Run Migrations**
   - Apply `036_create_acquisition_inquiries_table.sql`
   - Apply `037_fix_leads_table_schema.sql`
   - Verify with comprehensive test suite

2. **Configure APIs**
   - Add DAILY_API_KEY for video
   - Add ABLY_API_KEY for real-time
   - Add ANTHROPIC_API_KEY for AI
   - Test all features

3. **Create Real Projects**
   - Use demo as template
   - Customize for your needs
   - Invite real team members
   - Start collaborating!

4. **Monitor Performance**
   - Check Vercel analytics
   - Review Daily.co usage
   - Monitor Ably messages
   - Track AI API calls

---

**Mycelial Network Status:** All pathways demonstrated, collaboration flowing, invite-only security enforced, cursor control active. The demo project shows the complete FieldForge experience from project setup through real-time team coordination. 🍄

**Created:** 2025-11-20  
**Mission:** MF-63  
**Status:** Complete & Ready for Human Testing



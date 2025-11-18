# FieldForge Collaboration Setup Guide

## 🎯 Overview

This guide helps you set up FieldForge's collaboration features:
- **Real-time messaging** (invite-only groups)
- **Video collaboration** (Daily.co with cursor control)
- **Screen sharing and recording**

---

## 📋 Prerequisites

1. **Supabase/PostgreSQL Database** - Already configured
2. **Ably API Key** - For real-time messaging sync (already in env)
3. **Daily.co Account** - For video collaboration (NEW)

---

## 🔧 Setup Steps

### Step 1: Get Daily.co API Key

1. Sign up at [https://daily.co](https://daily.co)
2. Go to **Dashboard** → **Developers** → **API Keys**
3. Create a new API key
4. Copy the key

### Step 2: Add Environment Variables

Add these to your Vercel environment variables (or `.env` for local):

```bash
# Daily.co Video Collaboration
DAILY_API_KEY=your_daily_api_key_here

# Ably Real-Time (should already be set)
ABLY_API_KEY=your_ably_api_key_here

# Stripe (if not already set)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

### Step 3: Install Frontend Dependencies

```bash
cd apps/swipe-feed
npm install @daily-co/daily-js
```

### Step 4: Run Database Migrations

The collaboration system requires two database migrations:

1. **Messaging tables** (should already exist):
   ```bash
   # backend/migrations/007_messaging_communication_tables.sql
   ```

2. **Collaboration tables** (NEW):
   ```bash
   # backend/src/migrations/022_collaboration_system.sql
   ```

To apply migrations:

```bash
# If using Supabase
cd supabase
supabase db push

# OR if using direct PostgreSQL connection
psql $DATABASE_URL < backend/src/migrations/022_collaboration_system.sql
```

### Step 5: Verify Backend Routes

The following routes should now be live:

- ✅ `/api/messaging/*` - Team messaging
- ✅ `/api/collaboration/*` - Video rooms

Test with:

```bash
curl https://fieldforge.vercel.app/api/collaboration/health
# Should return: {"status":"ok","service":"collaboration","dailyConfigured":true}
```

---

## 🚀 Using Collaboration Features

### For Developers

Import the `CollaborationHub` component:

```tsx
import { CollaborationHub } from '../components/collaboration/CollaborationHub';

// In your project page:
<CollaborationHub 
  projectId={project.id}
  conversationId={conversation?.id}
/>
```

### For Users

1. **Team Chat**:
   - Navigate to a project
   - Click "Team Chat" tab
   - Create invite-only channels
   - Only admins can add members

2. **Video Collaboration**:
   - Click "Video Collab" tab
   - Click "Create Collaboration Room"
   - Share the room with team members (invite-only)
   - Features:
     - 🎥 Video/audio
     - 🖥️ Screen sharing
     - 🖱️ Cursor control (during screen share)
     - ⏺️ Recording (host only)

---

## 🔒 Security Features (Invite-Only)

### Messaging
- Only group **admins** can add participants
- Enforced at database level (line 406-414 in `messagingRepository.ts`)
- Real-time events notify all participants of changes

### Video Rooms
- Rooms created as `privacy: 'private'` by default
- `enable_knocking: true` - participants must be approved
- Meeting tokens required to join (generated per-user)
- Tokens expire after 24 hours

---

## 📊 Database Schema

### Messaging Tables (Already Exist)
- `conversations` - Direct, group, and project conversations
- `conversation_participants` - Who can access each conversation
- `messages` - Chat messages with reactions
- `message_reactions` - Emoji reactions
- `typing_indicators` - Real-time typing status

### Collaboration Tables (NEW)
- `collaboration_rooms` - Video meeting rooms
- `collaboration_room_participants` - Room access and permissions
- `collaboration_cursor_positions` - Real-time cursor sync
- `collaboration_recordings` - Meeting recordings

---

## 🧪 Testing

### Test Messaging
```bash
# Create a conversation
curl -X POST https://fieldforge.vercel.app/api/messaging/conversations/group \
  -H "Content-Type: application/json" \
  -d '{
    "creatorId": "user-id",
    "name": "Test Group",
    "participantIds": ["user2-id"]
  }'
```

### Test Video Collaboration
```bash
# Create a video room
curl -X POST https://fieldforge.vercel.app/api/collaboration/rooms \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "project-123",
    "createdBy": "user-id",
    "roomName": "Test Room",
    "privacy": "private"
  }'
```

---

## 🎨 UI Components

### CollaborationHub
Main component combining chat + video:
- Location: `apps/swipe-feed/src/components/collaboration/CollaborationHub.tsx`
- Features: Tab interface, feature highlights

### ProjectCollaboration
Video meeting component:
- Location: `apps/swipe-feed/src/components/collaboration/ProjectCollaboration.tsx`
- Features: Daily.co iframe, controls, participant list

### TeamMessaging
Chat interface (already exists):
- Location: `apps/swipe-feed/src/components/messaging/TeamMessaging.tsx`
- Features: Channels, messages, reactions

---

## 🐛 Troubleshooting

### "Video collaboration not configured"
- Daily.co API key is missing
- Add `DAILY_API_KEY` to Vercel environment variables
- Redeploy after adding env vars

### Can't join video room
- Meeting token might be expired (24h)
- Request a new token via `/api/collaboration/rooms/:roomId/tokens`

### Messaging not real-time
- Check Ably API key is configured
- Verify `/api/messaging/*` routes are accessible

### Database errors
- Ensure migrations are applied
- Check `conversations` and `collaboration_rooms` tables exist

---

## 📖 API Documentation

### Messaging Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messaging/conversations` | Get user's conversations |
| POST | `/api/messaging/conversations/group` | Create group (admin only can add) |
| POST | `/api/messaging/conversations/:id/messages` | Send message |
| POST | `/api/messaging/conversations/:id/participants` | Add participants (admin only) |

### Collaboration Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/collaboration/rooms` | Create video room |
| GET | `/api/collaboration/rooms/:id` | Get room details |
| POST | `/api/collaboration/rooms/:id/tokens` | Generate meeting token |
| DELETE | `/api/collaboration/rooms/:id` | End room |

---

## ✅ Verification Checklist

- [ ] Daily.co API key added to Vercel
- [ ] Ably API key configured
- [ ] Database migrations applied
- [ ] Frontend dependencies installed (`@daily-co/daily-js`)
- [ ] Backend deployed to Vercel
- [ ] `/api/collaboration/health` returns `dailyConfigured: true`
- [ ] Can create conversation via `/api/messaging`
- [ ] Can create video room via `/api/collaboration`

---

## 🌐 Mycelial Network Flow

```
User → CollaborationHub
  ├─ Chat Tab → TeamMessaging
  │   └─ API: /api/messaging/*
  │       └─ Real-time: Ably
  │           └─ DB: conversations, messages
  └─ Video Tab → ProjectCollaboration
      └─ API: /api/collaboration/*
          ├─ Daily.co: Video rooms
          └─ DB: collaboration_rooms
```

**Human Test**: Can you click between Chat and Video tabs smoothly? Is it clear that groups are invite-only?

---

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify all environment variables are set
3. Test API endpoints with curl
4. Check browser console for frontend errors

For Daily.co specific issues, see: https://docs.daily.co/

---

**Last Updated**: 2025-11-18  
**Version**: MF-7 (Collaboration Integration)


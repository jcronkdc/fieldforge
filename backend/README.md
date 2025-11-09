# Backend Hourglass Automation

This folder scaffolds the timed collaboration backend that keeps story branches and Angry Lips sessions in sync when users collaborate across platforms.

## Components

- `migrations/001_add_collaboration_timer_columns.sql` – SQL migration for Supabase/Postgres to store response timers and timeout strategy metadata on `story_branches` and `branch_turns` tables.
- `worker/hourglass-worker.ts` – Node/TypeScript worker that polls for active turns, dispatches notifications, triggers AI fallback, and emits analytics events.
- `worker/notifications.ts` – channel-specific adapters (Discord webhooks, SendGrid email, Twilio SMS). Each degrades gracefully when credentials are absent.
- `migrations/002_create_ai_mask_registry.sql` – tables for mask metadata, versions, and runtime sessions.
- `src/masks/` – registry service, CLI loader, and type definitions for persona management.
- `src/server.ts` – Express API surface for mask activation/session lifecycle.
- `migrations/003_create_professor_critiques.sql` – storage for persisted Professor critiques.
- `migrations/005_create_angry_lips_tables.sql` – core Angry Lips session/turn/vault tables and indexes.
- `src/angryLips/` – template generator, session repository, and pipeline/preview scripts for Angry Lips party mode.

## Prerequisites

- Node.js 20+
- Supabase service role key (or Postgres connection string with appropriate permissions)
- OpenAI/Hugging Face key for AI fallback (placeholder in scaffold)
- PostHog API key (or analytics endpoint) for collaboration events

Create a `.env` (or configure your runtime secrets) with:

```
DATABASE_URL=postgres://...
SUPABASE_SERVICE_KEY=...
POSTHOG_API_KEY=...
AI_FALLBACK_MODEL=gpt-4o-mini
AI_FALLBACK_API_KEY=sk-...
NOTIFY_WEBHOOK_DISCORD=https://discord.com/api/webhooks/...
NOTIFY_SENDGRID_API_KEY=SG.xxxx
NOTIFY_EMAIL_FROM=no-reply@mythatron.com
NOTIFY_TWILIO_SID=ACxxxx
NOTIFY_TWILIO_AUTH_TOKEN=xxxx
NOTIFY_TWILIO_FROM=+1234567890
ABLY_API_KEY=xxxx:yyyy
```

## Running Locally

```bash
cd backend
npm install
npm run once        # process hourglass turns once
npm run dev         # watch mode for hourglass worker
npm run build       # transpile to dist/
npm start           # run compiled worker continuously
npm run mask:load   # load Professor mask definition into registry
npm run api         # launch mask activation API (default port 4000)
npm run preview:notifications   # print sample Discord/email/SMS payloads for QA decks
npm run angrylips:template      # run template generator + POS tagging pipeline sample
```

## REST Endpoints

- `POST /api/masks/activate` – activate a mask session. Body: `{ maskId, version?, blendWith?, userId?, projectId?, context? }`
- `POST /api/masks/sessions/:sessionId/end` – end an active mask session and optionally log a reason.
- `POST /api/professor/critique` – generate and persist a Professor Malachai critique. Body: `{ content, storyId?, mode?, objectType?, userId?, projectId?, customTone? }`
- `GET /api/professor/critique/history?storyId=&userId=&limit=&offset=` – fetch persisted critiques (story and/or user filter required).
- `GET /api/story/timeline?worldId=` – return branches for a world (falls back to sample data if empty).
- `GET /api/story/chapters?branchId=` – list chapters for a branch.
- `POST /api/story/chapters` – add a chapter (`{ branchId, title }`).
- `PATCH /api/story/chapters/:id` – update chapter title/status.
- `DELETE /api/story/chapters/:id` – remove a chapter.
- `GET /api/story/editor?branchId=` – fetch story content.
- `POST /api/story/editor` – save story content (`{ branchId, content }`).
- `POST /api/story/ai-action` – run simple AI action (`{ mode, content }`).
- `GET /api/story/comments?branchId=` – list inline comments.
- `POST /api/story/comments` – add comment (`{ branchId, nodeId, body, authorId? }`).
- `DELETE /api/story/comments/:id` – remove a comment.
- `GET /api/story/lore?worldId=` – fetch lore entries (characters, locations, artifacts).
- `GET /api/angry-lips/sessions?limit=&status=` – list Angry Lips sessions (optionally filter by status).
- `GET /api/angry-lips/sessions/:sessionId` – fetch a session with generated turns and event history.
- `POST /api/angry-lips/sessions` – create a session using the template generator (`{ title?, genre?, templateSource?, templateLength?, seedText?, responseWindowMinutes?, participants?, allowAiCohost?, vaultMode? }`).
- `POST /api/angry-lips/turns/:turnId/submit` – submit a collaborator’s word (`{ text, handle? }`).
- `POST /api/angry-lips/turns/:turnId/auto-fill` – mark a turn as AI-filled (`{ text, handle? }`).
- `POST /api/angry-lips/turns/:turnId/events` – append a timeline event (`{ eventType, payload? }`).
- `POST /api/angry-lips/sessions/:sessionId/complete` – lock the session and persist a vault entry (`{ storyText, title?, visibility? }`).
- `GET /api/angry-lips/realtime/token?clientId=` – mint an Ably token request for websocket clients.

`--once` processes pending turns and exits; omit the flag to loop continuously (default interval: 30 seconds). Deploy the worker as a Supabase Edge Function cron, Railway background service, or Vercel/Node schedule.

## Upcoming Tasks

- Implement AI fallback call using LangChain/LLM provider.
- Add tests for timeout resolver logic.
- Monitor metrics (`collab_on_time_rate`, `collab_timeout_autofill`) via PostHog dashboards.
- Add player-facing RLS policies for Angry Lips tables once the authoring UI is ready.


# Hourglass Automation Backend

This document explains how the timed collaboration worker and schema updates keep every story generator (branch editor, Angry Lips) aligned with the hourglass model.

## Schema

Apply `backend/migrations/001_add_collaboration_timer_columns.sql` to Supabase/Postgres. It adds:

- `story_branches.response_window_minutes`, `timeout_strategy`, `last_turn_id`, `active_turn_expires_at`
- `branch_turns.response_window_minutes`, `timeout_strategy`, `notified_channels`, `expires_at`, `completed_by`, `completed_at`, `auto_filled`, `auto_fill_text`, `recipient_email`, `recipient_phone`, `recipient_discord_webhook`
- Index on `branch_turns.expires_at` for efficient polling

These columns allow every tool (web editor, Angry Lips, LangBot) to read/write the same response window metadata and see whether an AI auto-fill occurred.

## Worker

- Source: `backend/src/worker/hourglass-worker.ts`
- Polls `branch_turns` for active/overdue slots every 30 seconds (configurable via `HOURGLASS_INTERVAL_MS`).
- Ensures each turn has an `expires_at` timestamp (`created_at + response_window_minutes`).
- Dispatches multi-channel prompts (web, Discord webhook, SendGrid email, Twilio SMS). Each channel degrades gracefully when credentials are missing.
- When a turn expires:
  - `timeout_strategy = 'host_override'` → alert via webhook and leave slot unresolved.
  - `timeout_strategy = 'ai_autofill'` → call `generateAIFill`, mark the turn `completed_by = 'ai'`, store text, and emit analytics.
- Emits PostHog events (`collab_turn_prompted`, `collab_timeout_autofill`) to align with `docs/analytics-spec.md`.

## Environment

Set the following secrets (use `.env` for local):

```
DATABASE_URL=postgres://...
POSTHOG_API_KEY=phc_...
AI_FALLBACK_MODEL=gpt-4o-mini
AI_FALLBACK_API_KEY=sk-...
NOTIFY_WEBHOOK_DISCORD=https://discord.com/api/webhooks/...
NOTIFY_SENDGRID_API_KEY=SG.xxxxx
NOTIFY_EMAIL_FROM=no-reply@mythatron.com
NOTIFY_TWILIO_SID=ACxxxx
NOTIFY_TWILIO_AUTH_TOKEN=xxxx
NOTIFY_TWILIO_FROM=+12345551234
```

Optional: `SUPABASE_SERVICE_KEY` if you prefer Supabase REST updates instead of direct Postgres.

## Operations

```bash
cd backend
npm install
npm run once      # process pending turns once
npm run dev       # watch mode (ts-node)
npm run build     # transpile to dist/
npm start         # run compiled worker (continuous)
```

Deploy the worker as a scheduled job (Railway, Fly.io, Supabase Scheduled Function, AWS Lambda with EventBridge, etc.). Ensure only one instance processes a given turn at a time (the SQL update uses `completed_at is null` guard).

## Integration Checklist

- [ ] Run migration in Supabase/Postgres
- [ ] Seed `branch_turns.response_window_minutes` for existing drafts
- [ ] Point notification adapters to production channels (Discord, SendGrid, etc.)
- [ ] Configure AI provider credentials
- [ ] Add monitoring/alerting for worker health and backlog size
- [ ] Validate analytics events in PostHog


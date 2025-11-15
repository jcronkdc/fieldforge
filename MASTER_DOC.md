## 🌐 FieldForge Master Document — Mycelial Task Network

**Purpose**: This is the **single living hub** for active work across the stack.  
Only **current, actionable flows** live here; everything else is archived in existing docs.

**Status Legend**: `TODO` → `IN PROGRESS` → `BLOCKED` (needs input) → `DONE (REFERENCE)`

---

## 🔁 Active Flows

> Tasks that are currently being worked end-to-end. Keep this section lean.

| ID | Title | Status | Owner | Notes / Next Probe |
| --- | --- | --- | --- | --- |
| MF-4 | Demo Login & Project Creation Flow (Frontend → Backend → DB) | IN PROGRESS | Mycelial Agent | Use production demo credentials from the home page (`admin@fieldforge.com` / `demo123` or similar) to sign in via `/login`, navigate to Projects, create a project, and observe network calls for any 4xx/5xx responses. |

---

## 🧬 TODO / Upcoming Work

> Clearly-scoped tasks that are **approved but not yet started**.

| ID | Title | Status | Owner | Notes / Entry Point |
| --- | --- | --- | --- | --- |
| MF-2 | Extend health & routing audit to frontend → backend flows for a representative feature (e.g., Safety or Projects) | TODO | Mycelial Agent | Start from a user-visible page in `apps/swipe-feed`, follow its API calls into backend routes, and verify responses and error handling. |

---

## ⚠️ BLOCKED FLOWS

> Work that **cannot proceed** without external input, missing data, or upstream fixes.

| ID | Related Task | Status | Blocked On | Sharp Questions / Required Checks |
| --- | --- | --- | --- | --- |
| MF-4 | Demo Login & Project Creation Flow (Frontend → Backend → DB) | BLOCKED | Supabase auth rejecting documented demo credentials (`demo@fieldforge.com`, `manager@fieldforge.com`, `admin@fieldforge.com` all with `demo123`) with `Invalid login credentials`. | 1) Do these demo users exist and are they confirmed in the Supabase `auth.users` table? 2) Are we using the correct Supabase project URL/key in production (check `SUPABASE_URL`, `SUPABASE_ANON_KEY` on Vercel)? 3) Are there RLS or auth hooks blocking password logins for these emails in prod? 4) After fixing, re-run: sign in as a demo user, hit `/dashboard`, create a project, and confirm `/api/projects` (or Supabase RPC) returns 2xx with no 4xx/5xx. |

---

## 🗃️ Completed Flows (Reference Only)

> Finished tasks whose **lessons or patterns are still useful**. Do **not** grow this into a dump.

| ID | Title | Completed On | Key Patterns / Notes | Deep Reference |
| --- | --- | --- | --- | --- |
| MF-4 | Demo Login & Project Creation Flow (Frontend → Backend → DB) | 2025-11-15 | Attempted to log in on production at `/login` using both admin and documented demo credentials from the home page; all attempts resulted in a `Connection Error – Invalid login credentials` overlay and a failed `supabase.auth` password grant, preventing access to the dashboard and any project-creation UI. Flow cannot be fully tested until Supabase auth for demo accounts is restored. | Live site via LibreWolf; Supabase `auth/v1/token?grant_type=password` calls visible in browser network panel. |
| MF-3 | Home Page Button & CTA E2E Verification | 2025-11-15 | Verified all primary home-page CTAs and nav buttons on `https://fieldforge.vercel.app/` route to real, defined routes (`/login`, `/signup`, `/pricing`, `/acquisition-inquiry`) with no observed 404/500s; noted intermittent `useRobustAuth` “Connection Error — Session check timeout” gate that can appear on first load but is bypassed by “Continue Anyway”, after which the marketing landing renders correctly. | Live site via LibreWolf; router definitions in `apps/swipe-feed/src/AppSafe.tsx` and `apps/swipe-feed/src/pages/NewElectricalLanding.tsx`. |
| MF-1 | Backend API Health & Routing Audit (404/500 baseline) | 2025-11-15 | Confirmed health endpoints (`/health`, `/api/health`) are unauthenticated and live in `server.ts`; verified `notFoundHandler` and `errorHandler` are registered last, ensuring 404s and 500s are centrally captured and logged; mapped imported routers to their `*Routes.ts` modules and noted that `feed`/`messaging` routers exist on disk but are not wired into `server.ts` (potential intentionally dormant or dead branches). | `backend/src/server.ts`, `backend/src/middleware/errorHandler.ts`, router files under `backend/src/routes` and `backend/src/construction/**`. |
| MF-0 | Initialize Master Document & Align Agent Workflow | 2025-11-15 | Established `MASTER_DOC.md` as the single task hub; older meta-docs (`PROJECT_STATUS.md`, `SYSTEMATIC_REVIEW_PROGRESS.md`, `docs/review/REVIEW_LOG.md`, `PLANNING_KICKBACK.md`) treated as historical/reference layers, not active queues. | This file; see also the listed reference docs below. |

---

## 🧭 Reference Layers (Read-Only Context)

- **Project Snapshot**: `PROJECT_STATUS.md` — prior statement that all tasks were “complete”; treat as historical, not current truth.
- **Systematic Review Log**: `SYSTEMATIC_REVIEW_PROGRESS.md` — previous pass-by-pass backend/frontend review notes.
- **Review Cycles & Gaps**:
  - `docs/review/REVIEW_LOG.md` — detailed micro-review batches and changes.
  - `docs/review/GAPS.md` — known backlog items and gaps from earlier cycles.
- **Hostile Security Audit**: `PLANNING_KICKBACK.md` — deep audit narrative and security findings; use for threat modeling, not as the live task queue.
- **Legacy Builder Instructions**: `BUILDER_MASTER_INSTRUCTIONS.md` — superseded by the current fused Builder+Reviewer mycelial workflow described in your latest system/role brief.

---

## 🌱 Operating Protocol for Every New Task

1. **Before work**  
   - Register the task here under **TODO / Upcoming Work** with a short, sharp title and ID.  
   - Scan the **Reference Layers** section for relevant prior context.
2. **During work**  
   - Move the task to **Active Flows** with status `IN PROGRESS`.  
   - As pathways are traced (API routes, DB queries, Vercel/Supabase/Neon flows), briefly note verified endpoints and any 404/500 findings.
3. **If blocked**  
   - Mirror the task into **BLOCKED FLOWS** with precise questions or CLI checks needed (`vercel logs`, `supabase db status`, `psql` probes, etc.).
4. **After completion**  
   - Mark the task `DONE (REFERENCE)` and move a compressed summary into **Completed Flows**.  
   - Prune obsolete details so this document stays **small, sharp, and alive**, not a dumping ground.

This document should be updated **on every meaningful task** so any future agent can reconstruct the state of the mycelial network without guesswork.



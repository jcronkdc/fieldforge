## 🌐 FieldForge Master Document — Mycelial Task Network

**Purpose**: This is the **single living hub** for active work across the stack.  
Only **current, actionable flows** live here; everything else is archived in existing docs.

**Status Legend**: `TODO` → `IN PROGRESS` → `BLOCKED` (needs input) → `DONE (REFERENCE)`

---

## 🔁 Active Flows

> Tasks that are currently being worked end-to-end. Keep this section lean.

| ID | Title | Status | Owner | Notes / Next Probe |
| --- | --- | --- | --- | --- |
| MF-0 | Initialize Master Document & Align Agent Workflow | DONE (REFERENCE) | Mycelial Agent | Created `MASTER_DOC.md`, mapped existing review/audit docs, and adopted the new Builder+Reviewer fused workflow as the operating baseline. |

---

## 🧬 TODO / Upcoming Work

> Clearly-scoped tasks that are **approved but not yet started**.

| ID | Title | Status | Owner | Notes / Entry Point |
| --- | --- | --- | --- | --- |
| — | — | — | — | No pending tasks yet. First real feature/fix you request will appear here. |

---

## ⚠️ BLOCKED FLOWS

> Work that **cannot proceed** without external input, missing data, or upstream fixes.

| ID | Related Task | Status | Blocked On | Sharp Questions / Required Checks |
| --- | --- | --- | --- | --- |
| — | — | — | — | None yet. When something stalls, it moves here with concrete probes. |

---

## 🗃️ Completed Flows (Reference Only)

> Finished tasks whose **lessons or patterns are still useful**. Do **not** grow this into a dump.

| ID | Title | Completed On | Key Patterns / Notes | Deep Reference |
| --- | --- | --- | --- | --- |
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



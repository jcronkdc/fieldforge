# Story Engine – Narrative Creation Backbone

Blueprint for the collaborative story platform where humans and AI co-write, branch, and grow shared worlds.

## 3.1 Story Editor

**Goals**: Provide a creative environment with live AI assistance (completion, rewrite, critique), seamless branching, and multimask collaboration.

- **Editor Surface**
  - Rich text editor with semantic blocks (scene, dialogue, notes). Powered by Slate/TipTap; stores structured JSON.
  - Mode toggles: `Draft`, `Revision`, `Read`. Draft mode enables inline AI actions; Revision mode tracks diff vs previous version.
  - AI actions menu per block: `Continue`, `Rewrite`, `Condense`, `Expand`, `Critique` (calls Professor/other masks).
- **Session Context**
  - Maintains `story_session_id` referencing active branch, author(s), masks.
  - Autosaves deltas every 5 seconds and on significant actions.
- **Multiplayer**
  - Cursor presence, inline comments, suggestion mode with accept/reject.
  - Optional role assignment per collaborator (Lead, Editor, Mask).

## 3.2 Hijack Mode

**Concept**: Any reader can “hijack” a story mid-flow, creating a new branch from that point.

- `Hijack` button appears on paragraphs/scenes with permission rules (public, invite-only, canon-protected).
- Launches branch editor prefilled with story context up to hijacked node.
- Logs `hijack_started` event; maintains attribution to original author.
- Allows optional message to original author to request approval for canon consideration.

## 3.3 Branch Tracking

**Data Model**
```
StoryWorld(id, title, synopsis, tags)
StoryBranch(id, world_id, parent_branch_id, source_node_id, author_id, title, summary, status, created_at)
StoryNode(id, branch_id, order_index, content, ai_mask_session_id?)
```

- **Timeline View**
  - Graph visual (DAG) showing parent-child relationships, annotated with masks and collaborator icons.
  - Filters for `canon`, `fan`, `private`. Highlight active editing sessions.
- **Commit Log**
  - Each save yields commit metadata (word count delta, AI involvement, notes).
  - Option to rewind to earlier commit or fork from commit directly.

## 3.4 Chapter System

- Chapters represented as containers referencing ordered nodes or sub-branches.
- Support linear (chapter sequence) or branching (choose-your-own). Metadata: `chapter_type = linear | branching`.
- Chapter dashboards show completion %, reader drop-off, AI contributions.
- API endpoints: `POST /stories/:branch/chapters`, `GET /stories/:branch/chapters`, etc.

## 3.5 Bookmarking

- Users can bookmark reading progress (node + offset) and writing drafts (branch + chapter + timestamp).
- Store in `story_bookmarks` table with type (`reader`, `writer`), optional reminders.
- UI surfaces “Resume reading/writing” button on dashboard; send notifications when branch updates after bookmark.

## 3.6 Story Seeds

- Seed generator pipes story genome (genre, tone, tags) into AI prompt templates.
- Output short prompts (`<120 words`) for humans or masks to expand; integrate into LangBot daily posts.
- Seeds can be pinned to worlds, enabling community challenge events.

## 3.7 Shared Universe Mode

- Worlds flagged as `shared_universe = true` support inter-branch references and crossovers.
- Define canonical lore bible stored in `world_lore` table (characters, locations, artifacts) accessible via editor side panel.
- Enforce consistency rules: AI masks receive lore context; editors are warned when writing contradictions.
- Crossovers tracked via `story_crossovers` table referencing multiple branches; timeline view visualizes intersecting storylines.

## 3.8 Story Notifications

- Event triggers: `branch_published`, `chapter_added`, `hijack_started`, `bookmark_reminder`, `mask_session_started`, `mask_session_ended`.
- Notification channels: in-app inbox, email digest, Discord/Telegram via LangBot, optional SMS.
- User controls to follow authors, worlds, specific branches.
- Batch notifications nightly to reduce noise; support instant alerts for subscribed branches.

## 3.9 AI Collaboration

- **Mask Roles**
  - `Narrator` – describes scenes, transitions.
  - `Character` – writes dialogue/action from specific POV.
  - `Critic` – provides inline feedback (Prof. Malachai).
  - `Muse` – offers creative prompts/ideas.
- **Session Flow**
  - Authors invite masks before writing session; each mask gets instructions (tone, constraints) and context (lore, previous chapters).
  - Masks can participate in real time (co-writing) or asynchronously (suggested revisions).
- **Conflict Resolution**
  - Editor mask (`mask.editor`) mediates conflicting suggestions.
  - Mask output logged with provenance tags (for timeline, analytics).

## Integrations

- Leverage existing mask infrastructure (registry + Professor system) for persona management.
- Use hourglass backend to enforce timed collaboration in hijack & co-write sessions.
- Persist critiques to `professor_critiques`; future critiques for other masks use similar tables.

## Next Steps

1. Prototype story editor UI (minimal: text editor + AI actions).
2. Implement branch timeline view (use existing BranchTimelinePanel as base).
3. Define API schema (#3.3) and migrations for branching, chapters, bookmarks.
4. Integrate Professor critique panel into editor (already done) and expand to other mask roles.
5. Build notification service hooks once story events fire.


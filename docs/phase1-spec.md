# Phase 1 MVP Specification

## Objective
Deliver the first iteration of MythaTron’s “swipe-to-remix” creative loop to validate stickiness, creation velocity, and retention.

---

## Product Scope

### 1. Swipe Story Feed
- **Content:** 20–60 second story highlights (text + optional AI art/audio snippet).
- **Source:** Seed worlds curated by team / founding creators; future versions pull from live submissions.
- **Interaction:**
  - Swipe vertically to advance.
  - Tap card for full episode view (optional in v1).
  - Primary CTA: `Remix` button anchored on card + accessible via swipe gesture.
- **Personalization (v1):**
  - Use story genome tags (genre, tone) to cluster stories.
  - Pre-feed quiz (3 preference toggles) seeds simple recommendation logic.

### 2. Remix Creation Flow
- **Trigger:** Pressing `Remix` from feed or full story view.
- **Steps:**
  1. Display selected story segment + context summary.
  2. Prompt user to choose a continuation mode:
     - **Assist:** AI suggests next paragraphs based on story genome.
     - **Branch:** Offer 2–3 AI-generated “what if” forks; user selects and edits.
     - **Blank:** Standard editor for manual storytelling, with optional AI hints.
  3. Inline editing: text editor with character/plot suggestions pane.
  4. On save: user names branch, selects tags, and (optional) uploads AI-generated art.
  5. Pass-the-pen: host can enable cross-platform turn-taking with configurable hourglass timers (5 min–24 hr). Each collaborator receives “Respond now” prompts across web, Discord, email, X, Instagram, and Messenger; the system auto-fills late slots via AI and marks attribution accordingly.
- **Outputs:**
  - New branch stored in story graph service.
  - Quick-share assets (preview card image + summary) auto-generated for social.
  - `response_window_minutes` + `timeout_strategy` persisted per collaborative slot so other surfaces (Angry Lips, LangBot) share the same enforcement model.

### 3. Story Genome Tagging
- **Attributes:** Genre, emotional tone, pacing, humor style, POV, word count.
- **Pipeline (v1):**
  - Rule-based extraction + light-weight ML model inference.
  - Manual override UI for internal reviewers/founding creators.
- **Usage:**
  - Drives feed clustering and remix suggestions.
  - Feeds analytics dashboards (e.g., which tags lead to higher remix rate).

### 4. Creator & Lore Dashboard (Internal v1)
- Creates a canonical view per world: timeline, existing branches, contributors.
- Shows simple metrics: views, remixes, completions per branch.
- Used internally to manage seed content and founding creator submissions.

### 5. Instrumentation & Analytics
- **Event tracking:**
  - `feed_swipe` (with story_id, position, tag bundle).
  - `remix_click` (from feed/full view).
  - `remix_complete` (duration, AI assist usage, final word count).
  - `branch_publish` (world_id, parent_branch_id, tags).
  - `share_generated` (channel).
- **KPIs:**
  - Conversion: Remix clicks / feed swipes.
  - Completion: Remix completes / remix clicks.
  - Productivity: New branches per creator per day.
  - Retention: D1/D7 return rate for creators and readers.
  - Engagement: Average time spent per session; branches with ≥3 remixes.

---

## Technical Scope

### Architecture Overview
1. **Client:**
   - Web (React) for rapid iteration on feed and creation flow.
   - React Native shell scaffolding in place; mobile parity to follow.
2. **Backend Services (v1):**
   - REST API (Node/Express or Next.js API Routes) for stories, branches, analytics events.
   - Database: Postgres (Supabase) for rapid development with migration path to RocksDB when scale demands.
   - Story genome tagging pipeline service (Python microservice utilizing PyTorch + Transformers once production-ready).
3. **AI Integrations:**
   - Use Hugging Face `transformers` with curated models for narrative continuation.
   - Optional: connect to large hosted models (OpenAI/Anthropic) for higher-quality suggestions.
   - Grad-CAM/InterpretML instrumentation reserved for internal dashboards initially.
4. **LangBot Sync:**
   - Daily job posts the top new branches or prompts into Discord/Slack/TG bots with deep links back to feed.

### Data Model (Simplified)
```
StoryWorld
  id, title, synopsis, tags[], canonical_branch_id

StoryBranch
  id, world_id, parent_branch_id (nullable), author_id,
  content, excerpt, tags[], genome_scores jsonb,
  created_at, updated_at

StoryHighlight
  branch_id, text_snippet, audio_url, image_url, sequence

User
  id, handle, role (creator/reader/mod), preferences jsonb

AnalyticsEvent
  id, user_id, event_type, payload jsonb, created_at
```

### Security & Moderation Considerations
- Basic content filters (profanity, unsafe content) applied during publishing.
- Manual review queue for early-stage content (founding creators + internal testers).

---

## Dependencies & Tooling
- **Frontend:** Next.js/React, Tailwind or styled-components, Vercel deployments.
- **Backend:** Node.js + Supabase (or PostgreSQL), Prisma (optional) for schema management.
- **AI/ML:** Python 3.11, PyTorch, Transformers, InterpretML, Grad-CAM library.
- **Bots:** LangBot deployment scripts with environment secrets.
- **Analytics:** PostHog or Segment for event capture; backup logging via Supabase.

---

## Timeline & Deliverables
- **Week 1:** Finalize UX mocks, confirm data schema, set up repos/services.
- **Week 2:** Implement swipe feed + highlight content ingestion.
- **Week 3:** Ship remix flow with AI assist; basic tagging pipeline.
- **Week 4:** Add analytics instrumentation; internal creator dashboard.
- **Week 5:** Launch founding creator cohort; integrate LangBot prompts.
- **Week 6:** Iterate on feedback, improve personalization, prep Horizon 2 plan.

---

## Open Questions
- Which AI providers/models do we rely on for high-quality story continuations (cost vs latency)?
- What moderation thresholds are acceptable before automating reviews?
- How many founding worlds do we seed initially, and who owns curation?
- Do we need multi-language support in MVP, or focus on EN first?

---

## Next Steps
1. Review spec with stakeholders for alignment and fill open questions.
2. Break down implementation tasks per team (frontend, backend, ML, growth).
3. Kick off execution in weekly sprints with success metrics tracked.


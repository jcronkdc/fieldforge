# AI Mask Framework – Foundational System

Designing the persona backbone that powers every AI collaborator inside MythaTron.

## 1. Mask Engine (1.1)

- **Registry Service**
  - Persistent catalog keyed by `mask_id` with version history, domain tags, capability matrix, trust score.
  - Backed by Postgres (`ai_masks`, `ai_mask_versions`) with JSONB payload for advanced traits.
  - Supports soft-deletion and staged rollouts (draft → beta → live).
- **Runtime Manager**
  - Node/TypeScript service that loads mask profiles, merges runtime context, and executes prompt pipelines.
  - Manages activation/deactivation via `mask_session_id` with TTL; publishes `mask_session_started`/`mask_session_ended` events for analytics.
- **Blending & Context Awareness**
  - Weighted prompt composition: base persona + situational directives + collaborative overlays.
  - Uses `blend_profiles(mask_ids[], weights[])` helper to generate composite instructions.
  - Guardrails ensure tone compatibility (e.g., Romantic + Debugger flagged for review).
- **API Surface**
  - `POST /masks/activate` → returns session token & runtime prompt.
  - `POST /masks/generate` → executes LLM call using active mask context.
  - `POST /masks/deactivate` → archives memory shard diff, releases session.

## 2. Personality Profiles (1.2)

- **Metadata Schema**
  - `name`, `display_name`, `domain` (`story`, `song`, `poem`, `code`, etc.), `tone_descriptors[]`, `skillset[]`, `prompt_schema.version`, `default_llm`, `max_context_tokens`, `safety_tags`.
  - `version` increments when persona prompt or behavior changes; changelog entry required.
- **Prompt Schema**
  - Structured YAML/JSON describing sections: `persona`, `constraints`, `style_guidelines`, `formatting`, `examples`.
  - Supports inheritance (`extends: base/professor@1.0.0`).
- **Storage & Governance**
  - Managed via Notion-like editor for narrative leads; persisted as JSON in Git for review + Postgres for runtime load.
  - CI check ensures prompt schema validation + diff-based approvals.

## 3. Context-Aware Mask Invocation (1.3)

- **Routing Engine**
  - Reads active creative mode from UI (`story`, `song`, `poem`, `code`, `branch-editor`, etc.).
  - Mapping table config (managed by product ops) directs to canonical mask set:
    - `story.continue` → `professor`, `critic`
    - `song.compose` → `lyricist`, `composer`
    - `poem.write` → `poet`, `romantic`
    - `code.debug` → `debugger`, `mentor`
  - Allows override via user selection or experimentation flags.
- **Signals Consumed**
  - Story genome tags, branch timeline metadata, previous mask performance metrics, user preference toggles.
  - Real-time signals (hourglass timers, invites) influence mask assertiveness or politeness.
- **Fallback Logic**
  - If primary mask unavailable, degrade to `generalist` mask with narrower tone.
  - Logs `mask_routing_fallback` events for monitoring.

## 4. Mask SDK (1.4)

- **Developer Tooling**
  - CLI `mythatron mask new` scaffolds JSON file with persona template, example outputs, test cases.
  - Validation command ensures required fields + passes test prompt suite.
- **Persona Definition Format (JSON)**
  ```json
  {
    "id": "mask.professor",
    "version": "1.3.0",
    "name": "Professor",
    "domain": ["story", "analysis"],
    "tone": ["scholarly", "supportive"],
    "skillset": ["narrative critique", "structural analysis"],
    "prompt": {
      "persona": "You are a literary professor...",
      "constraints": ["Cite textual evidence", "Keep feedback under 5 paragraphs"],
      "format": "markdown",
      "examples": [
        {
          "input": "Chapter excerpt...",
          "output": "### Theme Analysis..."
        }
      ]
    },
    "tests": [
      {
        "name": "Critique stays supportive",
        "input": "Short story excerpt",
        "assertions": [
          {"contains": "strength"},
          {"notContains": "garbage"}
        ]
      }
    ]
  }
  ```
- **Distribution**
  - Mask packages stored in Git + CDN; developers can submit PRs referencing mask JSON.
  - Registry publishes metadata to internal marketplace for product teams.

## 5. Cross-Mask Context Sharing (1.5)

- **Collaboration Bus**
  - Event stream (`mask_events` table + WebSocket channel) captures outputs, critiques, context deltas.
  - Masks subscribe to relevant events (e.g., `critic` listens to `lyricist.output` for feedback loops).
- **Interaction Contracts**
  - Define handshake protocols (`proposal`, `critique`, `revision`, `approval`).
  - Masks expose capability descriptors (can_provide_feedback, can_request_revision). Router ensures compatible pairs.
- **Conflict Resolution**
  - Arbitration mask (e.g., `editor-in-chief`) can adjudicate when recommendations conflict.
  - Logging ensures transparent history for human overrides.

## 6. AI Memory Shards (1.6)

- **Shard Design**
  - Separate vector store namespace per mask using Supabase pgvector or Pinecone management.
  - Each shard maintains `mask_memory_{mask_id}` with embeddings for prior interactions, keyed by session or branch.
- **Sync Modes**
  - `isolated` (default): mask only sees its own shard.
  - `scoped_share`: allow whitelisted masks to read summaries (e.g., `professor` shares with `critic`).
  - `global_snapshot`: periodic condensation stored in `ai_memory_summary` table for cross-project insights.
- **Privacy & Controls**
  - Users can opt-in/out per mask; compliance logs track memory reads/writes.
  - Memory retention policies align with GDPR/CCPA; auto-prune after configurable window.

## 7. Uniform Data Schema (1.7)

Provide a base payload that every creative object (story, song, poem, character) adheres to. Suggested Postgres schema (`creative_objects` table + view per domain):

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `object_type` | ENUM (`story`, `song`, `poem`, `character`, `code`) | Determines domain-specific fields |
| `title` | TEXT | Display title |
| `summary` | TEXT | Short synopsis |
| `content` | JSONB | Structured content (rich text, lyrics, code) |
| `tags` | TEXT[] | Genre / tone descriptors |
| `authors` | JSONB | List of collaborators (humans + masks) |
| `mask_sessions` | JSONB | History of mask involvement (mask_id, session_id, role, timestamps) |
| `metrics` | JSONB | Engagement (likes, shares, completion rate) |
| `source_branch_id` | UUID | Links to story graph branch when applicable |
| `created_at` / `updated_at` | TIMESTAMPTZ | Audit fields |

Domain-specific extensions live in side tables (`creative_stories`, `creative_songs`, etc.) referencing the base ID.

## Integration Notes

- Mask engine hooks into existing analytics spec by emitting `mask_session_*` events and tagging outputs with `mask_id`.
- Branch timeline UI can surface mask contributions and critiques, aligning with hourglass collaboration.
- Angry Lips mode can assign playful masks (`comedian`, `chaos_agent`) using same registry, ensuring consistent persona behavior.
- SDK distribution dovetails with creator marketplace: community contributors can publish new masks with governance review.


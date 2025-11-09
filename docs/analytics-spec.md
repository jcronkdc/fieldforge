# Analytics & Instrumentation Spec (Phase 1)

## Objectives
- Measure effectiveness of the swipe-to-remix loop.
- Track creator productivity and reader retention.
- Attribute growth from cross-platform prompts (LangBot) and share links.
- Provide reliable data foundation for dashboards and future experimentation.

## Core Metrics
- **Conversion**
  - `remix_click_rate` = remix clicks ÷ feed swipes
  - `remix_completion_rate` = remix completions ÷ remix clicks
- **Productivity**
  - `branches_per_creator_per_day`
  - `average_remixes_per_world`
  - `collab_on_time_rate` = on-time submissions ÷ total collaborative turns
- **Retention**
  - `reader_retention_D1/D7`
  - `creator_retention_D1/D7`
- **Engagement**
  - `average_session_duration`
  - `stories_shared_per_user`
- **Acquisition**
  - `utm_source` / `utm_medium` attribution from share links
  - LangBot prompt click-through rates

## Event Schema
| Event Name | Description | Key Properties |
|------------|-------------|----------------|
| `feed_swipe` | User swipes to next highlight card | `story_id`, `branch_id`, `position`, `tags`, `session_id` |
| `feed_session_start` | New session begins (first swipe or page load) | `session_id`, `user_id`, `utm_source`, `utm_medium` |
| `remix_click` | `Remix` CTA pressed | `story_id`, `branch_id`, `entry_point` (`feed`/`full_view`), `session_id` |
| `remix_editor_open` | Remix editor fully loaded | `story_id`, `branch_id`, `mode` (`assist`/`branch`/`blank`) |
| `remix_complete` | Draft saved (before publish) | `story_id`, `branch_id`, `mode`, `draft_word_count`, `edit_duration_ms`, `ai_assist_used` |
| `branch_publish` | Remix published to story graph | `world_id`, `parent_branch_id`, `new_branch_id`, `tags`, `genome_scores`, `session_id` |
| `collab_session_created` | Pass-the-pen session launched | `branch_id`, `world_id`, `invited_handles`, `response_window_minutes`, `timeout_strategy`, `session_id` |
| `collab_turn_prompted` | Individual collaborator notified | `branch_id`, `turn_id`, `recipient_handle`, `channel`, `response_window_minutes`, `session_id` |
| `collab_timeout_autofill` | Hourglass expired and AI filled slot | `branch_id`, `turn_id`, `response_window_minutes`, `elapsed_ms`, `ai_model`, `session_id` |
| `share_generated` | Share link generated (copy/share button) | `story_id`, `branch_id`, `channel` (`discord`, `telegram`, `link`, etc.), `utm_source`, `utm_medium`, `session_id` |
| `story_view_full` | Viewer opens full episode view | `story_id`, `branch_id`, `session_id`, `duration_ms` |
| `langbot_prompt_click` | Deep link from LangBot prompt | `prompt_id`, `channel`, `story_id`, `cta` |

### Context Properties
- `user_id` (if authenticated) or `anonymous_id`
- `session_id` (UUID per session)
- `device_type`, `os`, `browser`
- `app_version` (commit hash or semantic version)
- `current_genre_preferences` (from onboarding quiz)

## Data Flow
1. **Client Collection**
   - Use PostHog SDK (web) + React Native equivalent when mobile app launches.
   - Fallback: send batched events to backend `/analytics/events` endpoint.
2. **Backend Relay**
   - Validate event schema; enrich with server-side metadata (e.g., world ownership).
   - Forward to PostHog (primary) and store raw events in Supabase/Postgres for audits.
3. **Processing**
   - Daily aggregation jobs (Supabase function or Airflow later) compute KPIs.
   - Export to dashboards (PostHog Insights, Metabase, or Looker) for product reviews.
4. **Alerts & Monitoring**
   - Set alerts when `remix_click_rate` or D1 retention drops beyond thresholds.

## Instrumentation Checklist
- [ ] Embed PostHog snippet with environment-specific keys.
- [ ] Implement event dispatch hooks in feed components (`feed_swipe`, `remix_click`).
- [ ] Integrate instrumentation in Remix editor lifecycle (`remix_editor_open`, `remix_complete`, `branch_publish`).
- [ ] Attach pass-the-pen instrumentation hooks (`collab_session_created`, `collab_turn_prompted`, `collab_timeout_autofill`).
- [ ] Append UTM parameters to share links and LangBot prompts.
- [ ] Set cookies/local storage for session tracking.
- [ ] Implement backend endpoint for server-side enrichment.
- [ ] Add unit tests for analytics helper functions.

## Privacy & Compliance
- Provide clear disclosures in onboarding/FAQ about analytics usage.
- Support opt-out toggle for tracking (respecting local storage flag).
- Mask or hash personally identifiable information; avoid storing raw email/phone in events.

## Dashboard Views (Initial)
1. **Core Loop Funnel** – `feed_swipe → remix_click → remix_complete → branch_publish`
2. **Creator Productivity** – branches per creator, remixes per world, MRR once monetization live.
3. **Retention Cohorts** – reader/creator retention lines by acquisition channel.
4. **LangBot Impact** – prompt performance by channel, downstream remix volume.

## Next Steps
- Wire event hooks in web client (Phase 1 implementation task).
- Configure PostHog project & data retention policies.
- Define governance for new event additions (schema versioning, changelog).
- Iterate with product & growth teams on dashboard requirements.


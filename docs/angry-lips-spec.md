# Angry Lips – Collaborative Mad Libs Mode

## Concept Overview
Angry Lips is a party-style storytelling mode where small groups (friends or invited strangers) co-create absurd stories by filling in blanks. It can live alongside the swipe-to-remix experience, driving viral, shareable content and onboarding new creators through a low-friction, high-laughter loop.

### Session Types
1. **AI Theme Packs**
   - Users pick a genre (Comedy, Drama, Shakespearean, Fantasy, Sci-Fi, Horror, etc.) and a story length (Quick Bite ~6 blanks, Classic ~12 blanks, Epic ~20 blanks).
   - AI generates a template story with blanks labeled by part-of-speech (noun, adjective, verb, adverb, person/place, etc.).
2. **Custom Templates**
   - Host writes the full template or pastes an existing story; AI highlights words/phrases and suggests which should become blanks based on part-of-speech tagging.
   - Host can add/remove blanks manually.
3. **Story Seed Builder**
   - Each participant contributes a one-sentence idea; AI stitches sentences into a coherent outline and creates blanks at key points to maintain the Mad Lib flavor.

### Group Flow
1. Host creates a room (option to keep private, allow invite link, or open to nearby public rooms).
2. Participants pick silly pen names and optionally upload an avatar/emoji. They can join from the web client **or reply through federated social prompts** (Discord/LangBot, Slack, Telegram, X, Instagram, Facebook Messenger, email) via short links tied to their turn.
3. For each blank, AI prompts the next participant with the required part of speech + creative nudge (e.g., “Give us a villainous adjective!”). Turns are sequential and enforced—no skipping—platform integrations send a DM/notification with a “Respond now” CTA.
4. A host-configurable virtual hourglass (5 minutes to 24 hours) begins spilling sand. The timer is mirrored across every surface (web, Discord, email, X, Instagram, Messenger) so collaborators see exactly how long they have left.
5. When a participant taps the link, they land on the live story view showing the current progress, who filled previous blanks (including AI-labeled fills), remaining time, and a field to submit their word. Social replies received via webhook/posting API populate the same slot.
6. Submissions stay secret to everyone else until the story reveal; participants see a progress meter and can react with emoji as words populate in real time. If the hourglass empties, the system marks the slot as AI-completed (with attribution) and surges to the next player.
7. At the end, the story is read aloud via synthesized voice (optional) and displayed with dramatic formatting. A “View full story” link highlights authorship per segment (e.g., “@Starlight (Instagram) added ‘glittery dragon’, AI filled ‘enigmatic sandwich’”).
8. Users can save to personal Angry Lips library, share publicly (or to curated invite-only shelf), or remix into a MythaTron branch.

### Invite-Only Library (“Angry Vault”)
- Hosts can toggle “Invite-only” so finished stories appear in a private shelf accessible only to selected collaborators.
- Vault stories can be promoted to public canon later; AI can suggest which ones have strong engagement for wider release.
- Supports inline commenting and annotation so friends can roast each other’s word choices.
- Shows hourglass history per slot so the group can see who responded in time versus where AI jumped in.

### Analytics & Growth Hooks
- Track laughs/reactions, story completions, invites sent, and share events.
- Post highlights to LangBot prompts (“Today’s 3 funniest Angry Lips endings”) to pull new users.
- Offer seasonal packs (“Spooky Lips”, “Holiday Lips”, “Corporate Chaos Lips”).

## UX Outline
1. **Landing CTA** – “Start Angry Lips” button on homepage and swipe feed header.
2. **Room Setup Modal** – choose template source, genre, length, privacy, invite list.
3. **Lobby Screen** – show participants, allow host to shuffle order, preview blank count.
4. **Blank Filling UI** – large prompt box (“@Starlight, we need a ridiculous noun”), timer, quick suggestions.
5. **Reveal Screen** – dynamic highlight as the story is read; share buttons for copy, social, or “Promote to MythaTron Remix”.

## Technical Considerations
- **Template generation:** use LLM prompts conditioned on genre + length. For story-seed mode, assemble sentences via coherence (LLM) and mark blanks using POS tagging (spaCy or custom transformer).
- **Real-time collaboration:** simple WebSocket or Supabase real-time channels to broadcast blank assignments and submissions.
- **Data storage:** store raw template, filled words, participant metadata, and vault permissions; optionally reuse existing story graph structures.
- **Timed responses:** each blank stores a `response_window_minutes` and `timeout_strategy`. Cron/queue workers watch active sessions; when timers expire, trigger AI generation + attribution broadcast, then notify host.
- **Voice synthesis:** integrate ElevenLabs or Amazon Polly for comedic read-aloud (optional feature flag).
- **Moderation:** apply content filters per submission; allow host override or disallow lists.

## Integration with Existing Roadmap
- Angry Lips feeds the swipe feed by promoting the funniest results as highlights.
- The invite-only vault ties into the collaborative branch system; vault stories can spawn new canonical branches or be part of world-building.
- Analytics hooks align with the instrumentation spec (events: `angrylips_session_created`, `angrylips_blank_filled`, `angrylips_story_revealed`, etc.).
- Supabase tables in play: `angry_lips_sessions`, `angry_lips_turns`, `angry_lips_turn_events`, and `angry_lips_vault_entries` (service role policies are live; author-facing RLS to follow).
- API surface: `GET/POST /api/angry-lips/sessions`, `POST /api/angry-lips/turns/:id/{submit|auto-fill|events}`, `POST /api/angry-lips/sessions/:id/complete`, `GET /api/angry-lips/realtime/token` (Ably token broker).

## Next Steps
1. Wireframe core screens (room setup, blank filling, reveal). → see [`angry-lips-wireframes.md`](./angry-lips-wireframes.md)
2. Prototype template generator prompt and POS tagging pipeline. → run `npm run angrylips:template` in `/backend` for sample output.
3. Prototype hourglass UX (web + social DM) and timeout worker behavior.
4. Decide on real-time infrastructure (Supabase, Pusher, or custom Node WebSocket service).
5. Design data model for angry_lips_session + vault.
6. Queue user testing with small friend groups to validate humor and pacing.


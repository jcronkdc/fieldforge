# MythaTron Swipe Feed

Prototype web client for the Phase 1 "swipe-to-remix" storytelling loop.

## Getting Started

```bash
cd apps/swipe-feed
npm install
npm run dev
```

Visit `http://localhost:5174` to explore the sample feed. Use the ↓ / ↑ arrow keys, mouse wheel, or touch swipes to navigate. Press `R` or the **Remix Story** button to open the remix mode chooser. Selecting a mode launches the in-app branch editor where you can draft a new continuation, toggle “Pass the pen” to invite collaborators, configure hourglass timers (5 minutes–24 hours), and save the branch (invite-only sessions generate a notification, enforce cross-platform prompts, and tag the timeline entry). Press `T` or click **View timeline** to inspect canon/fan history and newly created branches for the current world. The header also features an **Angry Lips** tile linking to the party-mode spec so testers can explore the upcoming Mad Libs experience.

## Tech Stack
- React 18 + Vite
- Tailwind CSS for styling
- `react-swipeable` for gesture support

## Analytics Stub
All user interactions dispatch to `src/lib/analytics.ts`, which currently logs events to the console. Replace this helper with PostHog or the `/analytics/events` API when available.

## Sample Data
`src/data/sampleStories.ts` contains five seed stories with metadata matching the story genome attributes defined in `docs/phase1-spec.md`.

## Next Steps
- Wire real API endpoints for stories and remix creation.
- Connect analytics helper to PostHog or Supabase logging.
- Embed the remix editor once the backend workflow is ready.


# Angry Lips Hourglass UX & Timeout Prototype

This spec captures the unified timer experience across web, social DM prompts, and backend worker logic. It builds directly on the wireframes in `angry-lips-wireframes.md`.

## 1. Visual System

### 1.1 Timer Variants
- **Primary (Blank Filling Screen)**
  - Animated hourglass component (`<HourglassTimer size="lg" />`).
  - Aura ring synced to remaining time.
  - Text readout (`mm:ss`), rolls over to `hours` after 59 minutes.
  - Pulsing warning during final 10 seconds.
- **Mini Header Badge**
  - Used in lobby, reveal, and feed tiles (e.g., “⌛ 5m window”).
  - Static gradient, no sand animation.
- **Timeline Chip**
  - Compact pill that shows “⏳ AI autofilled at 00:00” or “Responded in 2m”.
- **Social DM Embed**
  - Lightweight SVG/emoji pair with text `You have 03:42 left`. Links back to web view.

### 1.2 Component Sketch
```
<div class="hourglass-shell" data-state="warning|active|expired">
  <svg class="hourglass-icon" ... />
  <div class="timer-readout">03:42</div>
  <div class="cta">Open turn →</div>
</div>
```

## 2. Interaction Flow

1. **Host starts session** → hourglass worker schedules timeout job per blank.
2. **Next turn assigned** → `turn.assigned_at` stored, `expires_at` calculated.
3. **Notifications dispatched** (web push, Discord, email, etc.) with timer context.
4. **Participant submits word** → `completed_at` recorded, timer stops, UI shows success state.
5. **Timer expires** → worker triggers AI fallback, marks blank as auto-filled, broadcast updates.

## 3. Web Implementation Plan

- **Component**: `apps/swipe-feed/src/components/hourglass/HourglassTimer.tsx`
  - Props: `expiresAt`, `now` (optional override), `mode` (`lg` | `sm` | `chip`).
  - Uses `requestAnimationFrame` hook to update `timeRemaining` (throttled every 250ms).
  - Applies CSS animation classes for sand flow (reusing existing hourglass styles, extend for states).
- **Context**: Provide `HourglassProvider` to sync `now` across components for deterministic countdowns.
- **Storybook/Playground**: Add a demo page inside `apps/swipe-feed` to test states.

## 4. Social DM Prompt Prototype

### 4.1 Discord / LangBot
```
**Angry Lips Turn** – @Starlight
We need a *ridiculous noun*.
⏳ You have **03:42** left → <https://mythatron.app/angrylips/turn/abc123>
Reply here with your word or tap the link for the live view.
```
- Bot keeps thread per session. Edits message when 60s remain: “⚠️ One minute left!”
- When timeout hits, bot posts “Time’s up — AI filled this blank.”

### 4.2 Email / SMS
- Subject: `Angry Lips turn – 3 minutes left`
- Body includes inline timer (static text), button linking to live UI, fallback instructions.

## 5. Timeout Worker Behavior

File: `backend/src/worker/hourglass-worker.ts`

Enhancements needed:
1. **Per-turn scheduling**: Use `cronQueue` or DB polling to check `active_turn_expires_at` every minute.
2. **Grace period & notifications**:
   - At 60s remaining, emit `angrylips_turn_warning` event → push to DM/email channels.
   - At expiration, call `generateAIFill`, update `branch_turns.auto_filled = true`, emit `angrylips_turn_expired`.
3. **Metrics**: track `on_time_rate`, `avg_response_time`, `auto_fill_rate`.

Pseudo-code:
```ts
async function processTurn(turn: ActiveTurn) {
  if (now > turn.expiresAt) {
    await handleTimeout(turn);
    return;
  }
  if (turn.expiresAt - now <= 60 && !turn.warningSent) {
    await sendWarning(turn);
  }
}
```

## 6. Testing Checklist

- [ ] Hourglass component renders correct remaining time across seconds, minutes, hours.
- [ ] Warning animation triggers in final minute.
- [ ] DM/email prototypes show accurate countdown text and links.
- [ ] Worker logs warning + timeout events; AI fallback invoked when expected.
- [ ] Metrics captured in analytics pipeline (`collab_turn_prompted`, `collab_timeout_autofill`).

## 7. Next Actions

- Implement `HourglassTimer` component in swipe-feed (web). 
- Update worker logic with warning + timeout states.
- Create mock DM/email payloads for QA.
- Integrate component into Branch Editor collab card and future Angry Lips blank screen.


# Angry Lips Wireframes – Core Flow

This layout guide keeps Angry Lips anchored in the primary MythaTron visual language: aurora accents, swipe card glassmorphism, and branch-aware motion cues. Each screen mirrors the swipe-feed proportions so users feel like they are still inside the broader narrative OS.

## 1. Room Setup (Create Session)

```
┌──────────────────────────────────────────────────────────────────────┐
│ HEADER: “Spin up a new Angry Lips session” · Back to feed            │
├──────────────────────────────────────────────────────────────────────┤
│ LEFT (60%):                                                          │
│  • Card stack with template preview (glass panel)                    │
│  • Dropdowns: Genre, Length, Tone Pack                               │
│  • Toggle chips: “Invite-only vault”, “AI co-host”, “DM prompts”     │
│  • Text field: Session title (inline validation)                     │
│                                                                      │
│ RIGHT (40%):                                                         │
│  • Pill list for invited users (avatars, platform badge)             │
│  • Add invite modal trigger (Button primary)                         │
│  • Slider: Response window preset (5m – 24h)                         │
│  • StatBlock summary: blanks, estimated duration, AI fallback policy │
│                                                                      │
│ FOOTER:                                                              │
│  • Secondary button “Preview template”                               │
│  • Primary button “Launch lobby” (disabled until minimum fields set) │
└──────────────────────────────────────────────────────────────────────┘
```

Key notes:
- **Timer slider** reuses `Slider` component; marks display human-friendly durations.
- Invite chips mirror Branch Editor collaborator pills with platform tags (Discord, Email, X, etc.).

## 2. Lobby (Pre-game Staging)

```
┌─────────────────────────────┬───────────────────────────────────────┐
│ LEFT: Story shell (timeline)│ RIGHT: Participant roster             │
│  • Card with template view  │  • Ordered list with draggable handles │
│  • Progress bar (0 / N)     │  • Avatar + pen name + platform icon  │
│  • Tip callout (host notes) │  • Pill to indicate AI backup slots   │
│                             │  • Button: “Copy invite link”         │
├─────────────────────────────┴───────────────────────────────────────┤
│ FOOTER (sticky)                                                     │
│  • Ghost button “Edit settings”  • Primary button “Start first blank”│
└──────────────────────────────────────────────────────────────────────┘
```

Motion:
- Participant reorder animates with subtle spring, preserving branch aesthetic.
- Starting the game slides the lobby card upward and fades into blank-filling view.

## 3. Blank Filling (Active Turn)

```
┌──────────────────────────────────────────────────────────────────────┐
│ TOP BAR: Session title · Hourglass (animated) · “⌛ 03:42 remaining”  │
├──────────────────────────────────────────────────────────────────────┤
│ PROMPT PANEL (glass card)                                            │
│  • Headline: “@Starlight, we need an outrageous noun”                │
│  • Subtext: part-of-speech + creative nudge                          │
│  • Aura ring around avatar pulses with timer                         │
│  • Input field with validator + quick suggestion chips               │
│  • Secondary button “I’m stuck — ask AI co-host”                     │
│  • Ghost button “Pass to host (with reason)”                         │
├──────────────────────────────────────────────────────────────────────┤
│ STORY PREVIEW                                                        │
│  • Scrollable panel showing blanks as masked tokens (•••)            │
│  • “Previously filled” timeline with Pills showing pen names         │
│  • Reactions bar (emoji inline)                                      │
└──────────────────────────────────────────────────────────────────────┘
```

Cross-platform prompts:
- DM views reuse the same structure: hourglass icon + CTA button linking to this screen.
- Fallback AI completion shows banner “AI pinch hit at 00:00 with attribution”.

## 4. Reveal Sequence

```
┌──────────────────────────────────────────────────────────────────────┐
│ HERO: Dynamic gradient stage with story title                        │
│  • Auto-scroll or voiceover synchronized with highlight animation    │
│  • Each filled blank fades up with pen name + platform badge         │
│  • AI fills flagged with aurora outline + tooltip “auto-filled”      │
├──────────────────────────────────────────────────────────────────────┤
│ ACTION ROW                                                           │
│  • Primary button “Save to Angry Vault”                              │
│  • Secondary button “Promote to MythaTron branch”                    │
│  • Ghost button “Share clip” (opens share modal)                     │
├──────────────────────────────────────────────────────────────────────┤
│ VAULT PREVIEW                                                        │
│  • Recent stories carousel (uses StoryCard styling)                   │
│  • Stats: laughs, replays, completion time                           │
└──────────────────────────────────────────────────────────────────────┘
```

Optional voiceover toggle located in top-right corner; defaults off for accessibility.

## 5. Vault Detail (Invite-only Shelf)

```
┌──────────────────────────────────────────────────────────────────────┐
│ Header: Vault name · privacy badge · member avatars                  │
├──────────────────────────────────────────────────────────────────────┤
│ LEFT COLUMN                                                          │
│  • Story transcript with inline annotations                          │
│  • Hourglass history timeline (who answered vs. AI autopilot)        │
│                                                                      │
│ RIGHT COLUMN                                                         │
│  • Comment thread (MythaTron styled)                                 │
│  • Buttons: “Promote to public”, “Export PDF”, “Remix in editor”     │
└──────────────────────────────────────────────────────────────────────┘
```

The vault UI borrows from `story-editor` panels so cross-feature navigation feels native.

## Component Checklist

- `Button`, `Pill`, `StatBlock`, `Slider` from `apps/swipe-feed` should be elevated into a shared design system package (or mirrored in the story-editor app) to keep parity.
- Hourglass timer component needs variants: full-size (blank fill), mini (header badge), inline (timeline history).
- Notification banners reuse the aurora-accented toast style currently used for collaboration alerts.

## Deliverables

1. **Figma frames / PNG exports** based on these layouts for quick review.
2. **Storyboard animation** (can be Lottie or CSS spec) for blank reveal transitions.
3. **Copy doc** for prompts, CTAs, and DM microcopy to stay on-brand.

Use this file as the canonical reference when building high-fidelity mockups or coding the React implementations—it aligns with the existing `angry-lips-spec.md` requirements and ensures design consistency with the MythaTron experience.


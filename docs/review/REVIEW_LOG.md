# Review Log



**Review Order**

1) Config & meta
2) Shared libs/utils
3) Hooks
4) Layout (app shell)
5) Components (small → large)
6) Pages/routes
7) Scripts & linters
8) Tests
9) Docs



## Batch 0 — Setup

**Files reviewed**

- (none yet)



**Findings**

- Initialized scaffolding for structured micro-review.



**Changes made**

- Created REVIEW_LOG.md and GAPS.md for tracking.



**Follow-ups**

- Begin Batch 1 (Config & Meta) next.



## Batch 1 — Config & Meta (part 1)

**Files reviewed**

- apps/swipe-feed/index.html
- apps/swipe-feed/tailwind.config.js



**Findings**

- Standardized meta/viewport/color-scheme.
- Ensured fonts via `<link>` (no CSS `@import`).
- Confirmed Tailwind content globs and darkMode strategy.



**Changes made**

- index.html: added/normalized meta, font links, basic favicon, optional OG/Twitter, skip link.
- tailwind.config: ensured content, darkMode, extend, plugins.



**Follow-ups**

- Verify app shell includes id="main" for Skip link target (to handle in Layout batch).
- If Google Fonts were also @imported in CSS, remove them in a later batch to avoid churn now.


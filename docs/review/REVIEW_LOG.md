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



## Batch 1 — Config & Meta (part 2)

**Files reviewed**

- apps/swipe-feed/postcss.config.js
- apps/swipe-feed/vite.config.ts



**Findings**

- PostCSS already includes Tailwind and Autoprefixer.
- Vite config needed env-aware base, alias, and host adjustments.



**Changes made**

- vite.config.ts: added base/env handling, alias for `@/`, and 0.0.0.0 dev host.
- postcss.config.js: confirmed existing plugins; no change required.



**Follow-ups**

- Ensure components leverage the `@/` alias in future refactors.
- Document any required VITE_BASE_URL/VITE_DEV_PORT env variables for deployments.



## Batch 2 — Shared Libs / Utils (part 1)

**Files reviewed**

- apps/swipe-feed/src/utils/storageUtils.ts
- apps/swipe-feed/src/utils/viewport-animate.ts



**Findings**

- Helpers lacked explicit return types.
- Animation observer uses a 200px root margin that should be revisited.



**Changes made**

- storageUtils: added explicit return types and tightened SafeStorage typing.
- viewport-animate: added return type annotation.



**Follow-ups**

- Review rootMargin value in future animation batch (tracked in GAPS).



## Batch 2 — Shared Libs / Utils (part 2)

**Files reviewed**

- apps/swipe-feed/src/lib/api.ts



**Findings**

- Previous wrapper lacked timeout handling and structured error propagation.



**Changes made**

- Added `fetchJson` helper with AbortController timeout, safe JSON parsing, and consistent logging.
- Updated `apiRequest` to reuse the helper while keeping the existing call signature.



**Follow-ups**

- Migrate remaining feature-specific request helpers to `fetchJson` in a later batch (tracked in GAPS).



## Batch 3 — Hooks

**Files reviewed**

- apps/swipe-feed/src/hooks/useAuth.ts
- apps/swipe-feed/src/hooks/useSwipeGestures.ts



**Findings**

- useAuth lacked stable dependencies and mounted protection for async work.
- useSwipeGestures recreated listeners on every render and hard-coded gesture thresholds.



**Changes made**

- useAuth: memoised helpers, added mounted guards, and documented hook contract.
- useSwipeGestures: extracted constants, stabilized handlers via refs, added helper docs.



**Follow-ups**

- Monitor gesture threshold constants during mobile QA; adjust if feedback suggests tweaks.


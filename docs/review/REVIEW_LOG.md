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



## Batch 4 — Layout (App Shell)

**Files reviewed**

- apps/swipe-feed/src/components/layout/MainLayout.tsx
- apps/swipe-feed/src/App.tsx



**Findings**

- App shell lacked main landmark and theme preference persistence.
- Console noise present in App shell; no skip target for new skip link.



**Changes made**

- MainLayout: main landmark, theme toggle honoring system preference, theme persistence.
- App.tsx: cleaned console noise and ensured skip link target is in place.



**Follow-ups**

- Consider extracting theme management into a dedicated hook/provider for reuse.



## Batch 5 — Components (Small)

**Files reviewed**

- apps/swipe-feed/src/components/ui/Button.tsx
- apps/swipe-feed/src/components/ui/Link.tsx
- apps/swipe-feed/src/components/ui/Input.tsx



**Findings**

- Button/link components lacked consistent accessibility fallbacks for icon-only usage.
- No shared input wrapper existed for handling helper/error messaging.



**Changes made**

- Button: improved icon-only labelling, tightened focus/disabled states, added documentation.
- Link: aligned transition/focus styling with shared tokens.
- Input: introduced accessible wrapper with label, helper, and error support.



**Follow-ups**

- Adopt new `Input` component across forms to remove bespoke field markup.



## Batch 6 — Components (Large/Visual)

**Files reviewed**

- apps/swipe-feed/src/components/dashboard/FuturisticDashboard.tsx
- apps/swipe-feed/src/components/dashboard/Dashboard.tsx
- apps/swipe-feed/src/styles/futuristic.css



**Findings**

- Dashboard components relied on ad-hoc colour classes that risked sub-AA contrast on darker surfaces.
- Fixed background attachment in legacy theme CSS caused CLS on mobile scroll.



**Changes made**

- Updated dashboard text styles to use shared on-surface tokens for consistent contrast.
- Removed fixed background attachment from `cyber-grid` utility to avoid layout shifts.
- Ensured milestone and activity sections expose readable body copy using `on-surface-muted`.



**Follow-ups**

- Audit additional hero components for consistent media sizing and contrast in subsequent batches.



## Batch 7 — Pages / Routes

**Files reviewed**

- apps/swipe-feed/src/pages/Landing.tsx
- apps/swipe-feed/src/pages/Dashboard.tsx
- apps/swipe-feed/src/pages/Settings.tsx
- apps/swipe-feed/src/App.tsx



**Findings**

- Pages lacked per-route metadata and relied on raw components without structured head updates.
- Default routes still mounted component-level implementations directly, making it harder to enforce consistent h1 hierarchy and future skeleton usage.



**Changes made**

- Added lightweight page wrappers that apply `SEOHead` metadata and reuse structured data helpers.
- Updated router to mount the new page components for landing, dashboard, and settings views.
- Ensured wrapped pages defer to component-level headings so each route exposes a single h1.



**Follow-ups**

- Extend the page-level pattern to remaining high-traffic routes (e.g., analytics, projects) to centralise metadata management.



## Batch 5 — Components (Small)

**Files reviewed**

- apps/swipe-feed/src/components/ui/Button.tsx
- apps/swipe-feed/src/components/ui/Link.tsx



**Findings**

- Button lacked shared focus utility and forwardRef support.
- Link focus styles were inconsistent with new token defaults.



**Changes made**

- Button: converted to forwardRef, enforced icon-only labelling, unified focus/hover transitions.
- Link: converted to forwardRef, aligned focus-visible outline with tokens, hid decorative icons from a11y tree.



**Follow-ups**

- No dedicated Input component exists; verify form implementations reuse consistent patterns in a later batch.


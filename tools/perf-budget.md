# FieldForge Web Performance Budget

- **Largest Contentful Paint (LCP):** ≤ 2.5 seconds on Fast 4G (Moto G4 emulation).
- **Cumulative Layout Shift (CLS):** ≤ 0.05 across an end-to-end navigation.
- **Interaction to Next Paint (INP):** ≤ 200 ms for primary interactions.
- **Long Tasks:** No main-thread tasks longer than 200 ms during initial load on mobile-class hardware.
- **JavaScript Budget:** ≤ 250 KB compressed for initial route (after gzip/brotli).
- **Animation Budget:** No more than 6 concurrent long-running animations in view; off-screen animations must be paused.

Track these budgets in Lighthouse (mobile mode) and Chrome DevTools Performance profiles during regressions, ensuring parity with production builds before deployment.


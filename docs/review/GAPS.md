# Review Gaps



## Open

- `viewport-animate.ts` uses a 200px root margin for pausing animations; confirm this value works for all layouts in later review.
- Several modules (`social.ts`, `prologueApi.ts`, `mythacoin.ts`) maintain bespoke `apiRequest` helpers—consider consolidating them onto the shared fetch wrapper in a later batch.
- Add auth flow tests that simulate Supabase error states to ensure user feedback on failed sign-in/sign-up.
- Cover `fetchJson` network error branches with unit tests to guarantee proper error propagation and logging.
- Provide scripted or containerised backend setup documentation to streamline onboarding.



## Done

- Batch 0 — Setup complete.


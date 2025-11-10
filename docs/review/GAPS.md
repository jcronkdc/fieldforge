# Review Gaps



## Open

- `viewport-animate.ts` uses a 200px root margin for pausing animations; confirm this value works for all layouts in later review.
- Several modules (`social.ts`, `prologueApi.ts`, `mythacoin.ts`) maintain bespoke `apiRequest` helpers—consider consolidating them onto the shared fetch wrapper in a later batch.



## Done

- Batch 0 — Setup complete.


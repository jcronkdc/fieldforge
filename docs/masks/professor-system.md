# Professor System – Core AI Persona Blueprint

Design brief for MythaTron’s flagship English Professor mask (codename: **Prof. Malachai Thorne**). This persona sets the standards for critique quality, flexible tone control, and collaborative classroom experiences.

## 2.1 Core Persona Creation

- **Identity**
  - Name: *Professor Malachai Thorne*
  - Background: Oxford-educated narrative theorist turned rogue indie mentor; blends classical literature references with modern storytelling insights.
  - Voice: Erudite, metaphor-rich, laser-focused on structure and intent.
- **Capabilities**
  - Handles narrative critique (plot, pacing, character arcs), technical copy edits (grammar, clarity), and code-style reviews (when routed via cross-domain engine).
  - Supports inline annotations (`line_number`, `excerpt`, `feedback`) plus macro-level summaries (`strengths`, `risks`, `next_steps`).
- **Prompt Schema**
  - Persona boilerplate defined in mask registry (`mask.professor@1.0.0`).
  - Includes `analysis_mode` parameter (`story`, `song`, `poem`, `essay`, `code`) to swap evaluation rubrics.
- **Safety & Guardrails**
  - Always provides constructive improvement steps, even in harsh tones.
  - Redacts disallowed content (hate speech, personal attacks) via post-processor.

## 2.2 Grading Engine

- **Evaluation Dimensions**
  - Structure (coherence, organization)
  - Clarity (language precision, readability)
  - Creativity (originality, voice)
  - Correctness (grammar, facts, logic)
  - Optional domain-specific facets (e.g., `lyricism`, `meter`, `test_coverage`).
- **Scoring Model**
  - Weighted rubric stored in `professor_rubrics` table; weights adjustable per domain/mode.
  - Uses LLM-generated analysis + deterministic checks (e.g., grammar API, readability metrics).
  - Outputs both qualitative notes and numeric scores (0–100) with letter grade mapping.
- **Adaptive Learning Loop**
  - Tracks user responses (`accepted_feedback`, `rejected_feedback`) in `professor_feedback_events` table.
  - Bayesian weight adjustment: shift focus toward preferences over time per user/project.
  - Model fine-tuning: logs high-confidence corrections to retrain mask-specific prompts.

## 2.3 Personality Modes

Each mode alters tone while preserving critique fidelity. Implemented via mask overlays (`mask.professor.modes.*`).

| Mode | Tone Toggle | Characteristics |
|------|-------------|-----------------|
| Serious | `tone: academic` | Formal, cites theory, disciplined structure. |
| Funny | `tone: comedic` | Uses wit, pop-culture analogies, still actionable. |
| Insult | `tone: hypercritical` | Brutally honest, sardonic; warnings against demoralizing language. |
| Heckler | `tone: heckling` | Running commentary, interrupts with quips while delivering notes. |
| Chaos | `tone: chaos` | Randomly blends other modes per paragraph. Controlled randomness to avoid nonsense. |
| Custom | `tone: user_defined` | Users supply keywords or sample style; stored as `custom_profile_id`. |

Mode selection pipeline:
1. Base persona prompt.
2. Apply mode overlay (tone guidelines, language examples).
3. Inject user overrides (e.g., banned phrases, favorite references).

## 2.4 Multi-Professor “Classroom” Mode

- **Setup**
  - Users choose 2–5 professor variants (Serious, Funny, Insult, etc.) or custom clones.
  - System spins up parallel mask sessions; each generates critique.
  - Debate orchestrator aggregates responses and injects rebuttals.
- **Flow**
  1. Each professor delivers initial assessment.
  2. Round-robin rebuttals highlight disagreements or agreement points.
  3. Optional final synthesis authored by `mask.professor.moderator` summarizing consensus + next actions.
- **UI**
  - Conversation thread view; toggles for “Solo view” and “Panel view”.
  - Voting/reaction buttons let users mark most helpful viewpoint.
- **Analytics**
  - Capture `classroom_session_started`, `professor_rebuttal`, `classroom_user_vote` events.
  - Track which tone combinations maximize user satisfaction.

## 2.5 Compare & Debate Features

- **Compare**
  - Inputs: multiple submissions (user drafts, AI outputs).
  - Output: comparison matrix with scores per dimension, bullet list of advantages/tradeoffs.
  - Support `diff view` showing side-by-side markup.
- **Debate**
  - Masks argue for/against a specific submission gaining the higher grade.
  - Optionally bring in other masks (e.g., `mask.critic`) for meta-analysis.
- **Workflow Integration**
  - Trainers queue comparisons when multiple branches exist; results feed into branch timeline tags (e.g., `professor_favored`).

## 2.6 Mask Blending

- **Implementation**
  - Leverages mask engine blending (weights per persona).
  - e.g., `blend(mask.professor.serious, mask.professor.insult, weights: [0.6, 0.4])`.
- **Constraints**
  - Validate compatibility (prevent chaotic combos that contradict safety policies).
  - Provide preview snippet before full critique.
- **Storage**
  - Blended configurations stored as `mask_profiles` entries referencing parent IDs (`parent_masks: ["mask.professor.serious", "mask.professor.funny"]`).

## 2.7 Community Feedback Loop

- **Rating UX**
  - After each interaction, prompt user to rate on 1–5 scale for `accuracy` and `entertainment`.
  - Optional short comment and “highlight” clip for social share.
- **Data Pipeline**
  - Store in `professor_ratings` table with user/project context.
  - Calculate rolling averages displayed in mask marketplace (e.g., Serious: 4.7 accuracy / 3.1 entertainment).
- **Governance**
  - Auto-flag masks with low accuracy for story-critical flows.
  - Reward high-rated community-made modes with featured placement.
- **Feedback Integration**
  - Adaptive learning engine uses ratings to adjust default mode suggestions.
  - Weekly digest for creators summarizing top professors and improvement opportunities.

---

**Implementation priorities:**
1. Ship base professor persona + grading rubric service.
2. Launch personality overlays (Serious/Funny/Insult) and rating capture.
3. Add classroom debate + compare tooling once single-mask feedback is stable.
4. Expand blending/custom SDK after community validates demand.


# CFA Wizard Detailed Application Review

Date: 18 September 2026

Scope: product strategy, CFA Level I fidelity, vignette and question generation, scoring and analytics, mock exams, persistence, accessibility, mobile usability, UI/UX, security, and engineering quality.

## Executive summary

CFA Wizard has a strong amount of domain-specific functionality: curriculum navigation, drills, answer autopsies, a BA II Plus workflow, mock exams, spaced repetition, analytics, and targeted generation are all represented. The strongest part of the product is the actual study workspace, where a candidate can read an item, choose an answer, use a calculator or scratchpad, and inspect the reasoning afterward.

The app is not ready to be trusted as an exam-preparation product. The highest-risk problems are learning-content integrity and telemetry correctness, followed by mobile and accessibility failures. Several controls promise behavior that the code does not deliver. Generated questions are not grounded in the supplied curriculum PDFs, are not runtime-validated, and enter the mock-exam pool without review. Retakes overwrite history, sprint answers collide across topics, and the correct answer is option A in 190 of 200 authored/procedural items.

The visual system is consistent but works against the stated product direction. It looks and speaks like a dense financial control room rather than a calm private tutor. The app should retain its useful expert tools while radically simplifying the first screen, terminology, mobile navigation, and feedback tone.

## Overall scores

### Technical audit health

| Dimension | Score | Key finding |
|---|---:|---|
| Accessibility | 1/4 | Ten modal systems have no dialog semantics, focus trapping, or focus restoration; touch targets and text are routinely too small. |
| Performance | 2/4 | Production build succeeds, but client bundles are about 293–301 kB, timers restart frequently, and the animated landing page has no reduced-motion mode. |
| Responsive design | 1/4 | At 390px, `/app` overflows by about 232px and 43 of 47 visible interactive targets are below 44px in at least one dimension. |
| Theming | 2/4 | Tailwind tokens exist, but hard-coded near-black and zinc values are repeated throughout; there is no alternate theme. |
| Anti-patterns | 1/4 | The product strongly resembles an AI-generated fintech command center: neon lime, mono uppercase labels, telemetry chrome, pulses, numbered scaffolding, and dense cards. |
| **Total** | **7/20** | **Poor: major overhaul required** |

### UX design health

| Nielsen heuristic | Score | Key issue |
|---|---:|---|
| Visibility of system status | 1/4 | New users are shown “in progress” and 100% retention before completing any study. |
| Match with the real world | 1/4 | Proprietary language such as “trap immunity,” “diagnostic matrix,” and “autopsy” replaces familiar study language. |
| User control and freedom | 2/4 | Return and reset controls exist, but the app is modal-heavy and duplicates navigation. |
| Consistency and standards | 3/4 | Visual vocabulary is consistent, but standard tabs, dialogs, menus, and mobile navigation are reinvented. |
| Error prevention | 2/4 | Some destructive actions are confirmed, but generation, import, and data-shape errors are not prevented. |
| Recognition rather than recall | 2/4 | Dense abbreviations, hidden mobile labels, and shortcuts add recall burden. |
| Flexibility and efficiency | 3/4 | Timers, counts, shortcuts, calculator, and scratchpad are useful for experienced candidates. |
| Aesthetic and minimalist design | 1/4 | Almost every element is bordered, badged, numbered, or labeled. |
| Error recovery | 1/4 | Several failures are console-only and provide no retry or recovery state. |
| Help and documentation | 2/4 | Briefings exist, but first-run guidance and metric definitions do not. |
| **Total** | **18/40** | **Major redesign needed** |

## Critical product and content findings

### P1: The core “vignette” concept does not match the Level I exam format

CFA Institute describes Level I as 180 standalone multiple-choice items. Vignette-supported multiple-choice questions are the Level II format. The application repeatedly labels Level I practice as “institutional case vignettes,” and shares one case across multiple questions.

Impact: candidates are being trained in a reading and item structure that does not mirror the actual Level I exam. Case-based learning may still be useful, but it must be explicitly presented as a learning mode, not exam simulation.

Recommendation: make the core entity a standalone `PracticeItem`; group items into a `PracticeSession`. Keep “case practice” as an optional learning mode. Do not call case sessions official Level I exam simulation.

Official references:

- https://www.cfainstitute.org/programs/cfa-program/candidate-resources/level-i-exam
- https://www.cfainstitute.org/programs/cfa-program/exam

### P1: The authored answer key is structurally gameable

Static bank distribution: 142 A, 8 B, 0 C. Procedural bank distribution: 48 A, 2 B, 0 C. Combined: 190 A, 10 B, 0 C.

Impact: always choosing A produces a 95% score. This invalidates drills, sprints, mocks, readiness scores, trap analysis, and spaced repetition.

Recommendation: rebalance answer positions during content authoring, then independently shuffle options per session while remapping `correctOption` and distractor explanations. Add a CI integrity test that fails when answer-position distribution exceeds a defined tolerance.

### P1: “AI generation” silently degrades to a fixed five-question bank

Locations: `src/app/api/generate-vignette/route.ts:29`, `:1205`, `:1291`, `:1322`.

Verified behavior:

- A request for 10 questions returned 5.
- “Standard” and “Institutional” returned the same questions.
- Different custom focuses changed only a sentence in the shared stem; the questions remained identical.
- Invalid topic IDs silently became topic 01.
- Invalid difficulty values were accepted and returned.

Impact: the main product promise is misleading. A candidate believes the app created tailored practice when it returned deterministic canned content.

Recommendation: return explicit provenance (`authored`, `procedural-fallback`, `ai-draft`) and disclose it in the UI. If the AI service is unavailable, either fail clearly or offer a visibly labeled authored drill. Never report fallback content as newly synthesized.

### P1: Generated content is not grounded or auditable

Location: `src/app/api/generate-vignette/route.ts:1234`.

The prompt uses only a topic name, weight, one trap label, difficulty, and free text. The 92 MB of 2027 curriculum PDFs in `CFA material/` are not used. The response has no citations, curriculum edition, source IDs, prompt version, model version, or validation status.

Impact: formulas, LOS codes, calculator sequences, and ethics interpretations may be hallucinated or stale. The learner has no way to tell.

Recommendation: build a licensed, versioned source corpus indexed by reading and LOS. Retrieve source passages before generation and require source references for every item. Run deterministic calculation checks and a separate critique pass before an item can become “validated.”

### P1: Model output is trusted without runtime validation

Locations: `route.ts:1296`, `AIVignetteGeneratorModal.tsx:61`, `useCFAStore.ts:267`, `VignetteEngine.tsx:95`.

Only `questions` being an array is checked. Duplicate IDs, missing options, invalid answer keys, incomplete autopsies, wrong topic metadata, and excessive field lengths all pass through and are persisted.

Impact: malformed AI output can corrupt scoring, React keys, trap logs, analytics, and mock exams.

Recommendation: define one strict runtime schema and use it for API input, model output, persisted migrations, and backup imports. Add semantic checks after schema validation.

### P1: Generated content automatically contaminates “official” mocks

Locations: `useCFAStore.ts:267`, `mockExamGenerator.ts:23`, `:122`.

Generated items are persisted immediately and merged into the mock pool. Small pools are cycled, so long mocks repeat questions. No approval gate or duplicate detection exists.

Impact: hallucinated and repeated items enter the product’s highest-trust workflow.

Recommendation: introduce `draft`, `validated`, `approved`, and `rejected` lifecycle states. AI items must stay out of mocks by default. Rename “Official Mock” unless the content is actually licensed or produced by CFA Institute.

### P1: The mock result uses a false fixed 70% MPS claim

Locations: `mockExamGenerator.ts:252`, `MockExamModal.tsx:600`.

The product grades against “the CFA Institute 70% MPS benchmark.” CFA Institute explains that the MPS is set through standard setting and equating; 70% is a useful mastery signal, not a fixed published MPS.

Impact: candidates receive false certainty about pass readiness.

Recommendation: label 70% as a study target, not CFA Institute’s MPS. Readiness should report coverage, recent performance, uncertainty, and sample size.

Reference: https://www.cfainstitute.org/programs/cfa-program/candidate-resources/exam-results

## Functional and data-integrity bugs

### P1: Generated drills retain state from the previous generated drill

Location: `src/components/vignette/VignetteEngine.tsx:76`.

The generated-vignette branch returns before clearing selected answers, submitted state, and elapsed time. Reused question IDs can make a new drill appear answered or submitted.

### P1: Question-count controls do not control generated drills

Locations: `VignetteEngine.tsx:77`, `:299`.

Generated sets always use their full question array. Selecting 2Q, 5Q, 10Q, or 15Q changes the setting but not the active generated questions.

### P1: “+AI Questions” appends duplicates

Locations: `VignetteEngine.tsx:247`, `useCFAStore.ts:279`.

The extension request omits the current case, existing questions, LOS gaps, exclusion fingerprints, and desired addition count. In fallback mode it returns the same five questions, which are blindly appended with new numeric IDs.

### P1: Sprint answers collide across topics

Locations: `src/components/sprint/InterleavedSprintModal.tsx:25`, `:98`, `:165`.

Question IDs repeat from 1 to 5 in every source vignette. Sprint answers and timing are keyed only by `question.id`, so answering one topic’s question 1 overwrites another topic’s question 1. React keys and expanded review state collide for the same reason.

### P1: Sprint results are recorded incorrectly

Locations: `InterleavedSprintModal.tsx:116-155`.

- Timed-out questions have no answer and are excluded from trap entries.
- Saved score is calculated as total questions minus trap entries, so timed-out questions can be counted as correct.
- A perfect sprint creates zero traps and is never saved at all.
- Final-question timing is omitted because state is read before the asynchronous update lands.

### P1: Retakes overwrite history

Location: `src/store/useCFAStore.ts:165`.

Results are stored as one record per `vignetteId`. A retake replaces the prior attempt while trap logs continue accumulating.

Impact: analytics cannot measure improvement, attempt count, recency, or learning curves; denominators diverge from trap totals.

Recommendation: store append-only `Attempt` records with globally unique session IDs.

### P1: Per-question timing is actually total-session timing

Location: `VignetteEngine.tsx:159`.

Every question receives the same full session elapsed time, corrupting any speed analysis.

### P1: Error-mode tagging can update the wrong trap

Location: `src/components/diagnostic/DiagnosticAutopsyView.tsx:68`.

The app searches trap logs by question text and updates the first match. Repeated or generated duplicate questions can therefore mutate an older attempt.

### P1: Readiness and retention metrics overstate certainty

Locations: `AnalyticsDashboardView.tsx:55`, `:85`, `:100`; `src/app/app/page.tsx:99`.

- Retention begins at 100% before the user has studied.
- Topic weight ranges are parsed using only the first number, not the midpoint.
- Readiness can become high after a tiny sample from one topic.
- Attempt overwriting and the 95% A-key bias invalidate the input data.

Recommendation: suppress metrics until minimum evidence thresholds are met, show sample size and coverage, and distinguish accuracy, retention, and readiness.

### P1: Cloud sync and backup claims exceed the implementation

Locations: `src/components/auth/AuthSyncModal.tsx:79`, `:130`, `:280`, `:343`; `src/lib/supabase/client.ts:73`.

- “Sign in & sync” uploads only `completed_topic_ids`.
- There is no cloud restore flow, session persistence, token refresh, or conflict handling.
- JSON “merge” replaces state.
- Imports accept arbitrary JSON without schema validation.
- “Zero knowledge,” AES-256, and verified RLS claims are not established by this client code.

Impact: users may believe their complete study history is protected in the cloud when it is not.

## Mobile and accessibility findings

### P1: The app header breaks on mobile and desktop widths

Location: `src/app/app/page.tsx:223-377`; `src/app/globals.css:12`.

Measured evidence:

- At 390px, document width was 616px against a 384px client width.
- The header action strip measured about 492px and pushed tools off-screen.
- At 1200px, the document still overflowed by about 236px.
- `overflow-x: hidden` conceals the problem rather than resolving it.

Recommendation: replace the action strip with a compact mobile study header and an overflow menu or bottom navigation. Keep only the current task and one primary action visible.

### P1: Most touch targets are too small

At 390px, 43 of 47 visible app controls and 12 of 16 landing-page controls were below 44px in at least one dimension. Examples include 31×20 count buttons, 53×26 timer controls, a 30×30 settings button, and 48×16 study links.

### P1: All modal systems are inaccessible

Ten overlay components use fixed positioned `div` elements. None use `<dialog>`, `role="dialog"`, `aria-modal`, accessible names, focus trapping, background inertness, or focus restoration.

Live verification on the formula-sheet modal showed focus remaining on the trigger and then tabbing through background controls while the modal was open.

Recommendation: implement one accessible dialog primitive and migrate all overlays to it. Use labelled titles, initial focus, containment, Escape close, focus restoration, and inert background content.

### P1: The interface has no systematic accessible state semantics

- Tabs do not expose tab roles or selected state.
- Settings lacks menu semantics, `aria-expanded`, and `aria-controls`.
- Icon-only close buttons have no accessible names.
- Selected choice buttons do not expose `aria-pressed` or radio state.
- The app page starts at `h2`; no `h1` was found.
- Many inputs remove outlines and rely only on border-color changes.

### P2: Reduced motion is absent

No `prefers-reduced-motion` handling exists despite scroll-linked blur and scale, pulse animations, confetti, fades, and slide transitions. The 250vh landing hero should have a direct, static reduced-motion alternative.

## UX and visual-design findings

### P1: The first screen contains too many competing actions

Before scrolling, candidates see question counts, timer, mock exam, Learn, calculator, formulas, settings, three assignment actions, four major tabs, and repeated actions on every topic card.

Recommendation: organize the home screen around three jobs:

1. Continue today’s study.
2. Choose another topic or learning objective.
3. Review due mistakes.

Move timer, count, and calculator preferences into drill setup or a compact session toolbar.

### P1: Empty-state status is misleading

The default store marks topic 01 active/in progress, while the header shows 100% retention before any response. The UI also claims an “Official CFA Level 1 Item Bank” while disclaiming affiliation elsewhere.

Use honest first-run states: “No study history yet,” “Choose your first topic,” and “Retention appears after your first review.”

### P2: The tone is adversarial and cognitively expensive

“Autopsy,” “trap triggered,” “critical,” “diagnostic matrix,” “trap vault,” and “institutional cockpit” are repeated across the journey. Small uppercase mono labels, borders, badges, and glow give almost everything equal emphasis.

Recommendation: reserve trap language for post-answer diagnosis. Use familiar study language elsewhere. Increase mobile body text toward 14–16px and reduce the number of containers, badges, and uppercase labels.

### P2: The landing page prioritizes spectacle over study

The 250vh progress-locked hero, three numbered acts, and repeated pillar cards delay the product’s useful action. At 390px, heading wrapping is awkward and the experience consumes several screens.

Recommendation: shorten the landing page to a clear promise, proof of study workflow, sample item, and direct start action.

## Engineering quality

### Positive findings

- `npm run build` passes.
- `npx tsc --noEmit` passes.
- The app has a coherent central store and shared TypeScript domain types.
- Fisher-Yates is used for question ordering in drills and mocks.
- Reset confirmation and disabled incomplete submission provide some error prevention.
- The study workspace groups domain tools logically.

### P1/P2 gaps

- No automated tests exist for generation contracts, answer distribution, scoring, persistence, migrations, mock composition, accessibility, or mobile behavior.
- `npm run lint` invokes deprecated `next lint` and opens an interactive setup prompt, so it is unusable in CI.
- Local storage grows without quota handling, pruning, migration logic, or persistence failure feedback.
- Generator requests have no authentication, rate limiting, body-size limit, prompt limit, timeout, or cancellation.
- The Gemini key is included in the request URL, which can leak into logs; use the appropriate authentication header.
- The deterministic UI detector reported two `gray-on-color` warnings, but both were source-parser false positives caused by mutually exclusive or hover-state classes.

## Recommended generation architecture

### 1. Correct the domain model

- `PracticeItem`: one standalone Level I question.
- `PracticeSession`: a selected set of items.
- `CasePractice`: optional multi-item learning case, clearly not exam format.
- `Attempt`: append-only response session.
- `ItemSource`: authored, generated draft, validated generated, imported.
- `ValidationRecord`: schema, numerical, curriculum, duplication, and reviewer results.

### 2. Use a structured generation request

Required fields should include exam year, topic, reading, LOS, item type, count, difficulty definition, target misconception, calculator expectation, source IDs, answer-position plan, and deterministic seed.

### 3. Generate a blueprint before prose

Create an item plan containing tested LOS, skill level, calculation path, misconception for each distractor, intended answer position, and required source evidence. Reject duplicated or uncovered plans before writing items.

### 4. Ground every item

Retrieve the relevant licensed source excerpts and pass only those excerpts into generation. Store source IDs and edition metadata. Do not rely on the model’s general CFA knowledge.

### 5. Validate in layers

1. Runtime schema and field limits.
2. Exact item count and unique global IDs.
3. A/B/C option completeness and balanced answer positions.
4. Deterministic recalculation for numerical questions.
5. LOS and source-entailment review.
6. Distractor quality and single-correct-answer review.
7. Duplicate/fingerprint check against authored and generated banks.
8. Separate model or human review before approval.

### 6. Add provenance and honest UX

Each item should show curriculum year, reading/LOS, source type, validation status, and last review date. The generation flow should preview drafts and validation failures before starting the session.

### 7. Isolate generated material

Generated drafts should never enter mocks, readiness analytics, or official-style pools until validated and explicitly approved.

## Recommended delivery sequence

### Phase 0: Restore trust and correctness

1. Rebalance or shuffle answer positions and add integrity tests.
2. Replace “vignette” as the default Level I exam entity with standalone items.
3. Fix sprint IDs, timeouts, saving, retake history, and per-item timing.
4. Remove false “official,” “fixed 70% MPS,” cloud-security, and generated-content claims.
5. Quarantine generated content from mocks.

### Phase 1: Rebuild generation safely

1. Add strict request/response schemas, authentication, rate limits, limits, and timeouts.
2. Add curriculum retrieval and provenance.
3. Add blueprint generation, deterministic validation, answer balancing, and deduplication.
4. Add review lifecycle and generation regression tests.

### Phase 2: Mobile and accessibility foundation

1. Replace the header and navigation with responsive structures.
2. Build one accessible dialog/menu/tab system.
3. Increase touch targets and default text sizes.
4. Add focus-visible and reduced-motion standards.
5. Test at 320, 390, 768, 1024, and 1440px with keyboard and screen readers.

### Phase 3: Product simplification

1. Redesign the home screen around continue, choose, and review.
2. Replace terminal jargon with calm study language.
3. Add truthful first-run, loading, empty, failure, and recovery states.
4. Define evidence thresholds for readiness and retention metrics.

### Phase 4: Visual polish and performance

1. Reduce chrome, badges, uppercase mono text, and decorative motion.
2. Simplify the landing page.
3. Consolidate design tokens and component states.
4. Profile bundles and interaction performance after the architecture stabilizes.

## Verification performed

- Production build: passed.
- TypeScript check: passed.
- Lint: failed because the configured command is deprecated and interactive.
- Automated tests: none found.
- Generator API: exercised locally with valid and invalid payloads.
- Browser inspection: desktop and 390×844 mobile.
- Keyboard/focus inspection: performed against a clean development server.
- Deterministic UI scan: completed; two reported warnings were false positives.

The audit itself did not change application behavior. A subsequent first-pass visual simplification implemented parts of Phases 2–4: a responsive study header, clearer navigation, a quieter topic list, larger touch targets, reduced visual effects, readable system typography, focus-visible styling, and reduced-motion support. The content-integrity, generation, persistence, scoring, and remaining accessibility findings above are still outstanding.

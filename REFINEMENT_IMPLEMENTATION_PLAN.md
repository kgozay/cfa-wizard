# CFA Wizard Refinement Implementation Plan

Status: ready for implementation  
Primary objective: make the existing product trustworthy, understandable, and robust before adding user-facing functionality  
Companion documents: `APP_REVIEW.md`, `PRODUCT.md`

## 1. Purpose

This document is an execution runbook for an implementation agent. It converts the application review into an ordered engineering programme with explicit dependencies, file-level work, migration rules, tests, and acceptance criteria.

The sequence is intentionally conservative. Do not add new study modes, dashboards, AI controls, analytics, or integrations while this plan is in progress. Existing capabilities may be renamed, simplified, corrected, quarantined, or temporarily disabled when their current behaviour is misleading or unsafe.

The work is complete only when the application can make the following claims truthfully:

1. Answer positions do not reveal the correct answer.
2. Every displayed question and attempt has a stable, globally unique identity.
3. Retakes are preserved as separate attempts.
4. Generated material is validated, labelled, and excluded from high-trust workflows until approved.
5. Mock, sprint, review, and analytics calculations use the same canonical attempt data.
6. Level I terminology and readiness claims match what the product actually provides.
7. Existing local progress is migrated or preserved safely.
8. The core study flow works on mobile, with keyboard access, without console errors.

## 2. Operating rules for the implementation agent

### 2.1 Required working method

- Read this file, `APP_REVIEW.md`, and `PRODUCT.md` before editing code.
- Work through phases in order. Do not begin a phase until the preceding phase's exit criteria pass.
- Keep each phase independently reviewable. Prefer one commit per numbered phase.
- Run `git diff --check`, type checks, tests, and a production build before every commit.
- Preserve unrelated user changes. Do not reset or overwrite a dirty worktree.
- Use compatibility adapters during migration; do not rewrite every consumer in one untestable change.
- Keep domain logic in pure TypeScript modules. React components should render state and dispatch actions, not own scoring, shuffling, validation, or migration rules.
- Use plain study language in user-facing text. Internal legacy names may remain temporarily behind adapters.
- Do not silently repair malformed generated or imported data. Reject it with an actionable error.
- Do not use `Math.random()` directly in rendering components. Session construction must accept an injectable or seeded random source.
- Do not persist derived analytics that can be calculated from attempts.
- Do not delete legacy persisted fields until the new storage version has shipped and its migration has been verified.

### 2.2 Stop conditions

Stop and report rather than guessing when:

- a proposed migration would drop user answers, trap history, or review cards;
- curriculum licensing or source-version authority is required;
- a generated item cannot be validated without subject-matter review;
- an existing field has multiple incompatible meanings across consumers;
- a phase requires a materially new product capability rather than refinement;
- the production build or migration fixture fails after three focused repair attempts.

### 2.3 Non-goals

The following are deliberately out of scope until this plan is complete:

- new study modes;
- social, competitive, or gamified features;
- additional AI controls or prompt presets;
- new cloud providers;
- new readiness metrics;
- automated publication of generated questions;
- claims that local curriculum PDFs are licensed or authoritative;
- visual redesign of every secondary modal beyond accessibility and terminology corrections.

## 3. Current-state risks that drive the order

| Risk | Current implementation | Consequence | Resolved in |
|---|---|---|---|
| Answer-key leakage | Most authored and fallback questions use option A | Scores and mocks are gameable | Phase 2 |
| Colliding IDs | Question IDs repeat from 1–5 by set/topic | Sprint answers and React keys overwrite one another | Phases 1–2 |
| Retake overwrite | `vignetteResults` is keyed by `vignetteId` | History and improvement are lost | Phase 3 |
| Incorrect timing | Full session time is copied onto every item | Speed analytics are false | Phase 3 |
| Untrusted generation | Model/fallback output has minimal validation | Bad data reaches scoring and persistence | Phase 4 |
| Mock contamination | `customVignettes` are merged into mock pools | Draft AI content appears in high-trust exams | Phase 5 |
| Sprint misgrading | Timeouts and IDs are handled incorrectly | Scores can count unanswered items as correct | Phase 5 |
| Misleading claims | “Official,” fixed 70% MPS, and Level I “vignettes” | User trust is harmed | Phase 6 |
| Unsafe imports | Backup JSON is assigned directly to the store | Malformed files can corrupt state | Phase 7 |
| Remaining access barriers | Modal semantics/focus behaviour vary | Mobile and keyboard study remains unreliable | Phase 8 |

## 4. Target domain model

Introduce the new model alongside the legacy model. Do not rename all files or components immediately.

Create `src/types/practice.ts` with the canonical types below. Exact names may change only if the replacement is clearer and is updated consistently.

```ts
export type OptionKey = "A" | "B" | "C";

export type PracticeMode = "standalone" | "case-study";
export type ContentOrigin = "authored" | "procedural-fallback" | "ai-draft";
export type ContentStatus = "draft" | "validated" | "approved" | "rejected";

export interface ContentProvenance {
  origin: ContentOrigin;
  status: ContentStatus;
  curriculumYear?: number;
  sourceIds: string[];
  generatorVersion?: string;
  promptVersion?: string;
  model?: string;
  createdAt: string;
  validatedAt?: string;
  validationNotes?: string[];
}

export interface PracticeItem {
  id: string;                 // globally unique immutable source ID
  topicId: string;
  topicName: string;
  subReading?: string;
  losCode?: string;
  mode: PracticeMode;
  caseId?: string;            // only for optional case-study mode
  stem: string;
  options: Record<OptionKey, string>;
  correctOption: OptionKey;   // authoring key; never infer from position
  solution: string;
  calculatorKeystrokes?: string;
  trapCategory: string;
  errorModeDefault?: ErrorMode;
  distractorFeedback: Record<OptionKey, string>;
  provenance: ContentProvenance;
}

export interface PresentedPracticeItem {
  sessionItemId: string;
  sourceItemId: string;
  displayIndex: number;
  stem: string;
  options: Record<OptionKey, string>;
  correctOption: OptionKey;
  distractorFeedback: Record<OptionKey, string>;
  optionPermutation: Record<OptionKey, OptionKey>;
}

export interface PracticeSession {
  id: string;
  mode: "practice" | "sprint" | "mock" | "review";
  topicIds: string[];
  sourceSetIds: string[];
  seed: string;
  itemIds: string[];
  presentedItems: PresentedPracticeItem[];
  startedAt: string;
  completedAt?: string;
  timerMode: "timed" | "untimed";
  targetSecondsPerItem?: number;
}

export interface ItemAttempt {
  id: string;
  sessionId: string;
  sessionItemId: string;
  sourceItemId: string;
  topicId: string;
  selectedOption: OptionKey | null;
  correctOption: OptionKey;
  isCorrect: boolean;
  timedOut: boolean;
  timeSpentSeconds: number;
  submittedAt: string;
  trapCategory?: string;
  errorMode?: ErrorMode;
}

export interface PracticeAttempt {
  id: string;
  sessionId: string;
  mode: PracticeSession["mode"];
  startedAt: string;
  submittedAt: string;
  totalTimeSeconds: number;
  itemAttempts: ItemAttempt[];
  score: number;
  total: number;
  topicIds: string[];
}
```

### 4.1 Identity rules

- Authored source IDs: `authored:<set-id>:<legacy-question-id>`.
- Procedural fallback IDs: `fallback:<generator-version>:<topic-id>:<content-hash>`.
- AI draft IDs: `ai:<request-id>:<item-index>:<content-hash>`.
- Session IDs: use `crypto.randomUUID()` at session creation.
- Session item IDs: `<session-id>:<display-index>:<source-item-id>`.
- Attempt, trap, and review-card IDs: use `crypto.randomUUID()`; never use question text as an identifier.
- Persist the session's option permutation. A session must not reshuffle after reload or while reviewing answers.

### 4.2 Eligibility rules

Create a single function in `src/lib/practice/eligibility.ts`:

```ts
isEligibleForMode(item, mode): boolean
```

Rules:

- `practice`: authored approved, procedural fallback approved, and AI validated/approved may be explicitly selected; drafts must be visibly labelled and opt-in only.
- `sprint`: approved content only.
- `mock`: approved authored content only until an explicit product decision changes this rule.
- `review`: any item tied to an existing attempt or review card.
- `rejected`: never eligible.

No component may construct its own eligibility condition.

## 5. Phase 0 — Establish guardrails and baselines

### Goal

Create a reliable verification loop before changing persisted data or scoring.

### Files

- `package.json`
- `vitest.config.ts` or equivalent
- `src/test/fixtures/legacy-storage-v3.ts`
- `src/test/fixtures/generated-items.ts`
- `src/data/__tests__/question-bank.integrity.test.ts`
- `src/store/__tests__/migration.test.ts`
- ESLint flat configuration if required by the installed ESLint version

### Tasks

1. Add scripts:

   ```json
   {
     "typecheck": "tsc --noEmit",
     "test": "vitest run",
     "test:watch": "vitest",
     "lint": "eslint .",
     "check": "npm run typecheck && npm run test && npm run build"
   }
   ```

2. Add only the dependencies necessary for validation and tests. Preferred choices:
   - `zod` for runtime schemas;
   - `vitest` for pure TypeScript tests.
3. Capture a representative version-3 persisted-store fixture containing:
   - one completed topic;
   - one passing result;
   - one failing result with a trap;
   - one custom generated set;
   - one Leitner card.
4. Write characterization tests for current bank counts and current known answer distribution. Mark the biased distribution test as a documented failing invariant only until Phase 2; do not hide it.
5. Add a bank-audit helper that reports:
   - source item count;
   - duplicate source IDs;
   - duplicate normalized stems;
   - missing/blank options;
   - invalid correct keys;
   - answer-position distribution;
   - missing solutions or distractor feedback.
6. Repair the lint command if it remains interactive or invokes removed Next.js behaviour.

### Exit criteria

- `npm run typecheck` passes.
- `npm run test` executes non-interactively.
- `npm run build` passes.
- A legacy-storage fixture exists and is committed.
- The bank audit reliably exposes the option-A bias rather than masking it.

### Commit checkpoint

`test: add refinement safety net and legacy fixtures`

## 6. Phase 1 — Add canonical types, schemas, and legacy adapters

### Goal

Create one source of truth without breaking current screens.

### Files

- new `src/types/practice.ts`
- new `src/lib/practice/schema.ts`
- new `src/lib/practice/adapters.ts`
- new `src/lib/practice/ids.ts`
- `src/types/cfa.ts`
- `src/types/mockExam.ts`
- tests under `src/lib/practice/__tests__/`

### Tasks

1. Implement Zod schemas matching the canonical types:
   - strict objects;
   - exactly A, B, and C options;
   - non-empty trimmed text;
   - valid topic IDs `01` through `10`;
   - bounded field lengths;
   - valid ISO timestamps;
   - unique item IDs inside a set;
   - correct key must exist in options and distractor feedback.
2. Add `legacyVignetteToPracticeItems(vignette)`.
3. Add `legacyResultToPracticeAttempt(result, context)` for storage migration only.
4. Add `practiceItemToLegacyQuestion(item)` only if a temporary component adapter is required.
5. Normalize authored data through adapters at module boundaries. Do not duplicate the authored bank.
6. Mark legacy interfaces in `src/types/cfa.ts` with deprecation comments, but do not delete them yet.
7. Change `MockQuestionItem.id` from a repeated number to a globally unique string or introduce `sourceItemId` and `sessionItemId` while retaining `globalIndex` for display.
8. Add tests for:
   - valid authored conversion;
   - invalid topic;
   - duplicate IDs;
   - missing option C;
   - invalid answer key;
   - blank explanation;
   - oversized generated fields.

### Constraints

- This phase must not change visible answer ordering or scoring.
- All adapters must be pure and deterministic.
- Do not loosen a schema to accommodate malformed generator output; fix or reject the producer.

### Exit criteria

- Every authored item can be converted and validated.
- Validation failures include a useful path and message.
- No UI regression is visible.
- Type checks, tests, and build pass.

### Commit checkpoint

`refactor: add canonical practice model and validation`

## 7. Phase 2 — Build sessions and remove answer-position leakage

### Goal

Create immutable sessions with stable item identities and correctly remapped option order.

### Files

- new `src/lib/practice/random.ts`
- new `src/lib/practice/presentItem.ts`
- new `src/lib/practice/createSession.ts`
- `src/components/vignette/VignetteEngine.tsx`
- `src/data/mockExamGenerator.ts`
- `src/components/sprint/InterleavedSprintModal.tsx`
- relevant tests

### Algorithm requirements

1. Session creation selects source items first.
2. Use a stored session seed and a deterministic PRNG.
3. For each item, generate a permutation of A/B/C.
4. Rebuild displayed options using the permutation.
5. Remap all key-dependent fields together:
   - `correctOption`;
   - `distractorFeedback` / `distractorAutopsy`;
   - any selected option restored after reload.
6. Persist the resulting `PresentedPracticeItem`; do not recompute it during React render.
7. Preserve `sourceItemId` separately from the displayed option keys.

Example mapping:

```text
Authoring: A=correct, B=distractor1, C=distractor2
Permutation: authoring A -> displayed C, B -> A, C -> B
Displayed correctOption: C
Displayed feedback A: original B feedback
Displayed feedback B: original C feedback
Displayed feedback C: original A feedback
```

### Tasks

1. Replace question-only shuffling in `VignetteEngine` with `createPracticeSession`.
2. Remove the early return that prevents generated-drill state from resetting.
3. Make requested question count apply consistently to authored and custom/generated sets.
4. Generate stable session state when the user starts practice, not whenever component dependencies change.
5. Update mock and sprint creation to consume the same session-builder utilities.
6. Remove answer maps keyed only by legacy numeric question ID.
7. Add deterministic tests using known seeds.
8. Add a statistical integrity test over many seeds. Tolerance must be explicit; for example, no displayed answer position may fall outside 25–42% over a sufficiently large sample.
9. Verify that solution text and distractor feedback still correspond to the displayed choices.

### Exit criteria

- Always selecting A no longer yields an abnormal score over repeated sessions.
- Reloading or reviewing a session does not change its option order.
- Two topics with legacy question ID `1` cannot overwrite one another.
- Authored source data remains immutable.
- Practice, sprint, and mock share the same presentation logic.

### Commit checkpoint

`fix: randomize answer presentation with stable session identities`

## 8. Phase 3 — Append-only attempts, accurate timing, and storage migration

### Goal

Make progress history and scoring auditable without losing version-3 user data.

### Files

- `src/store/useCFAStore.ts`
- new `src/store/migrations.ts`
- new `src/lib/practice/gradeAttempt.ts`
- `src/components/vignette/VignetteEngine.tsx`
- `src/components/diagnostic/DiagnosticAutopsyView.tsx`
- `src/components/dashboard/CurrentAssignmentCard.tsx`
- `src/components/dashboard/CurriculumTracksGrid.tsx`
- tests

### Store target

Add:

```ts
practiceSessions: Record<string, PracticeSession>;
practiceAttempts: PracticeAttempt[];
activePracticeSessionId: string | null;
```

Keep legacy `vignetteResults` readable during migration, but stop writing new results to it once consumers have moved.

### Migration rules

1. Increment Zustand persistence from `cfa-wizard-storage-v3` semantics to an explicit store `version` with a `migrate` function. Prefer retaining the storage key so Zustand can migrate in place.
2. Convert each legacy result to one synthetic historical attempt.
3. Use the legacy `submittedAt` and total time where available.
4. When per-item time is unknowable, set an explicit migration marker or distribute time only if the UI clearly treats it as estimated. Never present estimated timing as measured.
5. Preserve legacy trap IDs and Leitner links where possible. If IDs change, migrate both sides of the relationship atomically.
6. Preserve `completedTopicIds`, sound preference, drill count, and timer preference.
7. Keep a backup of the raw legacy payload inside the migration test fixture, not in production state.
8. Migration must be idempotent.

### Timing rules

- Store a timestamp when an item first becomes active.
- On answer, timeout, navigation, or submission, close that item's interval exactly once.
- A timed-out item has `selectedOption: null`, `isCorrect: false`, and `timedOut: true`.
- `totalTimeSeconds` should equal the sum of item times within a rounding tolerance.
- Retakes always create new session and attempt IDs.

### Tasks

1. Implement pure `gradeAttempt(session, answers, timing)`.
2. Change `recordVignetteSubmission` to `recordPracticeAttempt` or add the latter and deprecate the former.
3. Create traps from `ItemAttempt` IDs, not question text.
4. Update error-mode editing to target a trap ID directly.
5. Change “last score” selectors to derive the most recent attempt by submission time.
6. Make analytics selectors consume attempts, not the overwritten result map.
7. Add tests for:
   - two retakes preserved;
   - timeout counted incorrect;
   - per-item timing differs correctly;
   - total time consistency;
   - migration of a passing and failing legacy result;
   - migration idempotence;
   - trap/review-card links retained.

### Exit criteria

- Completing the same practice set twice produces two attempts.
- Historical attempts remain after reload.
- Timed-out and unanswered items count as incorrect.
- Error-mode edits cannot mutate an older duplicate question accidentally.
- Existing version-3 progress loads without a reset.

### Commit checkpoint

`refactor: preserve append-only attempts and accurate timing`

## 9. Phase 4 — Validate and quarantine generated content

### Goal

Make generation honest and prevent malformed or unreviewed content from affecting trusted workflows.

### Files

- `src/app/api/generate-vignette/route.ts`
- `src/lib/practice/schema.ts`
- new `src/lib/generation/requestSchema.ts`
- new `src/lib/generation/responseSchema.ts`
- new `src/lib/generation/provenance.ts`
- `src/components/tools/AIVignetteGeneratorModal.tsx`
- `src/components/dashboard/ScenarioSimulatorStudio.tsx`
- `src/store/useCFAStore.ts`
- API and store tests

### Request contract

The API must accept only a strict object similar to:

```ts
{
  topicId: "01" | "02" | ... | "10";
  mode: "standalone" | "case-study";
  difficulty: "standard" | "high-trap";
  questionCount: 2 | 5 | 10 | 15;
  focus?: string;          // trimmed and bounded
  excludeItemIds?: string[];
}
```

Unknown keys, invalid topics, invalid difficulty, excessive text, and unsupported counts must return HTTP 400 with structured field errors.

### Response contract

```ts
{
  requestId: string;
  provenance: ContentProvenance;
  items: PracticeItem[];
  warnings: string[];
}
```

Do not return a payload that pretends to be newly generated when it is the fixed procedural fallback.

### Tasks

1. Validate the request before any generation work.
2. Validate parsed model output against the strict schema.
3. Add semantic validation:
   - exact requested item count;
   - unique IDs and normalized stems;
   - unique options within an item;
   - answer key present;
   - topic/LOS consistency where metadata exists;
   - required feedback and solution fields;
   - no overlap with `excludeItemIds` or supplied fingerprints.
4. Assign all AI output `origin: "ai-draft"`, `status: "draft"`.
5. Assign procedural fallback output `origin: "procedural-fallback"` and label it clearly in UI.
6. Decide one honest fallback behaviour:
   - preferred: return a clear generation-unavailable response and offer authored practice;
   - acceptable interim: return visibly labelled fallback content that respects requested count.
7. Remove automatic addition of generated material to high-trust pools.
8. Store drafts separately from approved content, for example `generatedDrafts` rather than `customVignettes`.
9. Make extension requests include existing source IDs/fingerprints and desired addition count.
10. Deduplicate before persistence; never append blindly with timestamp-only IDs.
11. Display provenance and validation status before a learner starts a draft practice session.
12. Do not add curriculum retrieval in this phase unless source licensing and version authority are explicitly resolved.

### Failure UX

- Show a concise reason and retry action.
- Never fail only in `console.error`.
- Preserve the user's topic, count, and focus after a failure.
- Distinguish “generation unavailable,” “invalid generated content,” and “duplicate content.”

### Exit criteria

- Invalid input produces HTTP 400, not silent topic substitution.
- Malformed model output is rejected and is not persisted.
- A request for 10 items either returns 10 valid items or an explicit failure.
- Generated drafts cannot enter mock or readiness calculations.
- Fallback provenance is visible and truthful.

### Commit checkpoint

`fix: validate and quarantine generated practice content`

## 10. Phase 5 — Correct mock and sprint integrity

### Goal

Make timed and mixed-topic workflows use canonical sessions and attempts.

### Files

- `src/data/mockExamGenerator.ts`
- `src/components/mock/MockExamModal.tsx`
- `src/components/mock/MockScorecardView.tsx`
- `src/components/sprint/InterleavedSprintModal.tsx`
- `src/types/mockExam.ts`
- tests

### Mock tasks

1. Build the source pool through `isEligibleForMode(item, "mock")`.
2. Exclude drafts, validated-but-unapproved AI items, rejected items, and unknown legacy custom items.
3. Detect insufficient pools before session creation.
4. Do not cycle a small pool to fill a large exam. Offer a smaller supported mock or block with a clear explanation.
5. Use stable session item IDs for answers and flags.
6. Persist the presented option order with the session.
7. Grade with the canonical `gradeAttempt` path.
8. Rename titles that contain “Official.”

### Sprint tasks

1. Key answers, timing, React rows, and expanded review state by `sessionItemId`.
2. Record every question, including timeout and unanswered states.
3. Save perfect sprints as attempts even when no traps exist.
4. Capture the last item's timing before final grading.
5. Derive score from item attempts, never from trap count.
6. Build topic breakdowns from item attempts.
7. Replace repeated timer effects with one explicit item-timer lifecycle.

### Tests

- duplicate legacy numeric IDs across topics do not collide;
- perfect sprint is saved;
- all-timeout sprint scores zero;
- final-item time is included;
- mock excludes draft AI items;
- mock reports insufficient approved content rather than repeating it;
- flags and answers survive reload;
- option remapping grades correctly.

### Exit criteria

- Mock and sprint results reconcile exactly with their item attempts.
- No repeated content is inserted merely to reach a target length.
- No unapproved generated item appears in a mock.
- Timeout, perfect-score, and final-question edge cases pass.

### Commit checkpoint

`fix: unify mock and sprint scoring with canonical attempts`

## 11. Phase 6 — Correct terminology, claims, and analytics

### Goal

Make the product communicate only what its data and format support.

### Files

- `src/app/app/page.tsx`
- `src/components/vignette/VignetteEngine.tsx`
- `src/components/diagnostic/DiagnosticAutopsyView.tsx`
- `src/components/mock/MockExamModal.tsx`
- `src/components/mock/MockScorecardView.tsx`
- `src/components/analytics/AnalyticsDashboardView.tsx`
- `src/components/tools/AIVignetteGeneratorModal.tsx`
- `src/components/auth/AuthSyncModal.tsx`
- `src/components/common/KeyboardShortcutsModal.tsx`
- other search results for banned terminology

### Language map

| Replace | With |
|---|---|
| Vignette, when referring to default Level I practice | Practice set or practice items |
| Vignette, when an actual shared case is present | Case practice |
| Official mock | Mock exam |
| CFA Institute 70% MPS benchmark | 70% study target |
| Autopsy | Answer review or mistake review |
| Diagnostic matrix / cockpit / terminal | Study dashboard |
| Trap immunity | Avoided-mistake rate, only if evidence threshold is met |
| AI synthesized | AI draft or generated draft |
| Zero-risk / zero-knowledge / AES-256 claims | Exact verified storage behaviour only |

### Analytics rules

1. Do not show retention, readiness, or mastery with zero evidence.
2. Show sample size and topic coverage beside summary metrics.
3. Establish minimum evidence thresholds before status labels appear. Initial conservative proposal:
   - at least 20 total item attempts;
   - at least 3 distinct topics;
   - at least 5 attempts in a topic before topic status.
4. Parse weight ranges using a documented midpoint or use explicit numeric curriculum metadata; do not use only the first number.
5. Treat 70% as a configurable study target, not a guaranteed passing standard.
6. Use attempts within a defined recent window or show all-time versus recent separately. Do not invent a trend from one attempt.
7. Remove or label any metric that cannot be reconstructed from attempts.

### Search audit

Run repository searches for:

```text
official
vignette
autopsy
terminal
cockpit
matrix
MPS
70%
immunity
zero-risk
zero knowledge
AES-256
institutional
```

Review every user-visible occurrence; do not perform a blind global replacement in domain content.

### Exit criteria

- Default Level I practice is described as standalone items/practice sets.
- Case practice remains available but is clearly labelled as a learning mode.
- No “Official Mock” or fixed-MPS claim remains.
- Empty-state analytics do not display false 100% values.
- Every readiness-like metric shows its evidence base.

### Commit checkpoint

`refactor: align study language and analytics with evidence`

## 12. Phase 7 — Make backup, import, and persistence safe

### Goal

Protect the refined data model from malformed imports and overstated sync behaviour.

### Files

- `src/components/auth/AuthSyncModal.tsx`
- new `src/lib/backup/schema.ts`
- new `src/lib/backup/export.ts`
- new `src/lib/backup/import.ts`
- `src/lib/supabase/client.ts`
- store migrations and tests

### Tasks

1. Define a versioned backup envelope:

   ```ts
   {
     product: "cfa-wizard";
     schemaVersion: 4;
     exportedAt: string;
     data: { ...validated persisted fields };
   }
   ```

2. Validate the entire import before mutating state.
3. Reject unknown product identifiers and unsupported future versions.
4. Migrate supported older versions through the same tested migration functions as local persistence.
5. Present an import summary before applying:
   - attempts;
   - topics;
   - review cards;
   - generated drafts;
   - warnings.
6. Define replace versus merge explicitly. Do not label replacement as merge.
7. If merge is retained, deduplicate by immutable IDs and define conflict resolution.
8. Apply import atomically; on failure, retain the previous state.
9. Export only persisted domain state, not UI modal state or derived analytics.
10. Change cloud copy to state exactly which fields are synchronized.
11. Until full restore, token persistence, refresh, and conflict handling exist, label cloud sync as limited/experimental or disable it.

### Tests

- valid current export/import round trip;
- version-3 migration import;
- invalid JSON;
- correct JSON with wrong product;
- malformed item or attempt;
- duplicate IDs;
- unsupported future schema;
- atomic rollback after validation failure;
- merge/replace behaviour matches copy.

### Exit criteria

- No imported field reaches Zustand before validation succeeds.
- Export/import round trips without data loss.
- User-facing sync claims match actual synchronized fields.
- Failure cannot partially replace current progress.

### Commit checkpoint

`fix: validate backups and clarify persistence behaviour`

## 13. Phase 8 — Finish core accessibility and mobile refinement

### Goal

Complete the accessibility foundation for existing core workflows without introducing new visuals or features.

### Priority scope

1. Practice engine.
2. Answer/mistake review.
3. Mock exam.
4. Sprint.
5. Generator draft review.
6. Backup/import.

### Tasks

1. Create or adopt one accessible dialog primitive with:
   - `role="dialog"` and `aria-modal="true"`;
   - labelled title and optional description;
   - focus trap;
   - initial focus;
   - Escape close when safe;
   - focus restoration;
   - scroll locking.
2. Migrate the priority modals to that primitive.
3. Ensure close buttons have accessible names and at least 44×44 CSS-pixel targets.
4. Use real radio semantics or an equivalent accessible group for answer options.
5. Announce validation, timer, submission, and score changes appropriately without excessive live-region noise.
6. Keep question text at a comfortable base size and line length on mobile.
7. Remove remaining unnecessary mono/uppercase text in study and review flows.
8. Verify no horizontal overflow at 320, 390, 768, 1024, and 1440 px.
9. Honour reduced motion in timers, score transitions, and modal animation.
10. Ensure keyboard shortcuts never fire while focus is inside inputs, textareas, selects, or content-editable elements.
11. Do not make timer colour the only signal for warning/overtime.

### Manual QA matrix

For each priority workflow, verify:

- keyboard-only open, operate, submit, review, and close;
- visible focus at all times;
- focus returns to the launcher;
- screen-reader name/role/value for controls;
- 390×844 mobile layout;
- 200% browser zoom;
- reduced-motion mode;
- no console errors;
- no data loss after reload.

### Exit criteria

- All priority dialogs use the common accessible primitive.
- Core workflows are operable by keyboard.
- Core screens have no horizontal overflow at tested widths.
- Touch targets meet the 44×44 target.
- Automated checks, production build, and manual matrix pass.

### Commit checkpoint

`fix: complete accessible mobile core study flows`

## 14. Phase 9 — Remove legacy paths and document the stable architecture

### Goal

Retire compatibility code only after every consumer has moved and migration fixtures prove old progress remains usable.

### Tasks

1. Search for remaining writes to:
   - `vignetteResults`;
   - `customVignettes` as an undifferentiated pool;
   - numeric question IDs as keys;
   - direct mock/sprint grading;
   - unvalidated JSON assignment.
2. Remove unused legacy actions and selectors.
3. Retain migration readers for supported historical versions.
4. Rename files/components only when doing so improves comprehension and produces a contained diff. Avoid a repository-wide rename mixed with logic changes.
5. Add `ARCHITECTURE.md` covering:
   - content lifecycle;
   - session construction;
   - option presentation;
   - attempt storage;
   - mock eligibility;
   - generation validation;
   - backup versions.
6. Update `APP_REVIEW.md` with resolved items and remaining risks. Do not delete the original evidence.

### Exit criteria

- New attempts use only canonical models.
- No high-trust workflow reads an undifferentiated generated-content pool.
- Legacy types are isolated to adapters/migrations or removed.
- Architecture and backup schema are documented.

### Commit checkpoint

`chore: remove migrated legacy paths and document architecture`

## 15. Cross-phase test catalogue

The final suite must cover at least the cases below.

### Content validation

- accepts a valid authored item;
- rejects missing A/B/C;
- rejects duplicate option text;
- rejects invalid topic or key;
- rejects blank solution/feedback;
- rejects duplicate ID or normalized stem;
- preserves provenance.

### Option presentation

- remaps correct key;
- remaps every feedback key;
- is deterministic for a seed;
- differs for different seeds;
- never mutates the source item;
- persists through reload;
- has acceptable A/B/C distribution.

### Sessions and attempts

- stable global IDs;
- requested count honoured;
- append-only retakes;
- unanswered item incorrect;
- timeout incorrect;
- per-item and total timing reconcile;
- score equals correct item count;
- traps reference item-attempt IDs.

### Generator

- strict request errors;
- exact count;
- malformed model response rejected;
- duplicate response rejected;
- fallback labelled;
- draft status persisted;
- draft excluded from mock/analytics.

### Mock and sprint

- topic collisions impossible;
- insufficient pool reported;
- no cycling duplicates;
- perfect sprint saved;
- all-timeout sprint scores zero;
- final timing captured;
- flags and answers restore.

### Migration and backup

- version-3 local storage migrates;
- migration is idempotent;
- export/import round trip;
- invalid import is atomic;
- trap/review relationships preserved;
- future backup version rejected safely.

### Analytics

- no false metrics at zero attempts;
- evidence threshold respected;
- most recent attempt selected correctly;
- topic coverage calculated from attempts;
- weight range calculation is documented and correct.

## 16. End-to-end acceptance scenarios

### Scenario A — New learner practice

1. Start with empty storage.
2. Open Quantitative Methods.
3. Start five-item practice.
4. Confirm options are stable during the session.
5. Answer four items and allow one to time out.
6. Submit and confirm score is out of five with timeout incorrect.
7. Review feedback and record an error mode.
8. Reload and confirm session review remains identical.

### Scenario B — Retake history

1. Retake the same source set.
2. Confirm a new session and new option presentation are created.
3. Submit a different score.
4. Confirm both attempts exist and the dashboard shows the latest result.
5. Confirm analytics can calculate change without overwriting history.

### Scenario C — Generated draft

1. Request an invalid topic and confirm field-level rejection.
2. Request a valid five-item draft.
3. Confirm provenance and draft status are visible.
4. Confirm exact count and unique IDs.
5. Confirm the draft does not appear in mock pools or readiness data.
6. Simulate malformed output and confirm nothing is persisted.

### Scenario D — Sprint integrity

1. Start a sprint containing legacy item ID `1` from multiple topics.
2. Answer one, time out one, and finish the sprint.
3. Confirm each answer remains attached to the correct topic/item.
4. Confirm score, timing, topic breakdown, and saved attempt reconcile.
5. Repeat with a perfect sprint and confirm it is saved.

### Scenario E — Existing-user migration

1. Load the committed version-3 fixture.
2. Start the app and allow migration.
3. Confirm completed topics, latest scores, traps, custom content, and review cards remain visible.
4. Reload twice and confirm no duplicate migrated attempts are created.
5. Export and re-import the migrated state successfully.

### Scenario F — Mobile and keyboard

1. At 390×844, navigate from dashboard to practice without horizontal scrolling.
2. Complete a practice set using keyboard only.
3. Open and close calculator and answer review without losing focus context.
4. Verify all primary controls meet the touch target requirement.
5. Repeat with reduced motion enabled.

## 17. Release gate

Do not consider the refinement programme complete until all conditions below are true:

- [ ] Type checks pass.
- [ ] Unit and integration tests pass.
- [ ] Production build passes.
- [ ] `git diff --check` passes.
- [ ] Answer-position distribution is within the defined tolerance.
- [ ] No duplicate source or session item IDs are reported.
- [ ] Retakes are append-only.
- [ ] Per-item timing and timeout behaviour are correct.
- [ ] Generated drafts are schema-valid and quarantined.
- [ ] Mocks contain approved authored content only.
- [ ] Sprints save perfect, failed, and timed-out attempts correctly.
- [ ] Existing version-3 progress migrates idempotently.
- [ ] Backup imports validate before state mutation.
- [ ] User-facing claims and Level I terminology are accurate.
- [ ] Empty analytics show an honest insufficient-data state.
- [ ] Core workflows pass the mobile and keyboard QA matrix.
- [ ] Browser console is clean during end-to-end scenarios.
- [ ] `APP_REVIEW.md` is updated with resolved and outstanding items.

## 18. Recommended execution order and dependency map

```text
Phase 0: guardrails
    ↓
Phase 1: canonical model + validation
    ↓
Phase 2: stable sessions + option remapping
    ↓
Phase 3: append-only attempts + migration
    ↓
Phase 4: generated-content quarantine
    ↓
Phase 5: mock + sprint correction
    ↓
Phase 6: terminology + honest analytics
    ↓
Phase 7: backup + persistence safety
    ↓
Phase 8: accessibility + mobile completion
    ↓
Phase 9: remove legacy paths + document
```

Parallel work is discouraged through Phase 5 because the same types, store, and scoring paths are changing. After Phase 5, terminology auditing and backup-schema work may run in parallel only if they do not edit the same files. Resolve conflicts by preserving the canonical model and validation rules, not by reintroducing legacy shortcuts.

## 19. First task for the implementing agent

Begin with Phase 0 only.

Before writing production logic:

1. Confirm the current branch includes the dashboard simplification and this plan.
2. Record the current bank audit in a test fixture.
3. Add the test and validation toolchain.
4. Capture and test a realistic version-3 persisted-state fixture.
5. Run the full baseline verification.
6. Commit Phase 0 separately and report its results before starting the canonical model.

Do not begin by editing the 3,000-line authored bank or generator route. Those changes become safe only after the audit, schemas, fixtures, and migrations are executable.

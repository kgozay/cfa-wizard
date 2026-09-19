# CFA Wizard architecture

## Canonical study lifecycle

Authored questions are converted to `PracticeItem` records with immutable source IDs and content provenance. Generated questions enter as either `ai-draft` or `procedural-fallback`; their validation status is visible to the learner and draft content is excluded from mocks and readiness analytics.

Every practice, sprint, or mock starts by calling `createPracticeSession`. The resulting `PracticeSession` owns the question order, option permutation, displayed correct answer, stable `sessionItemId`, source ID, and timer policy. UI components render the session's `presentedItems`; they do not reshuffle or grade authoring data independently.

Submission calls `gradeAttempt`, producing one append-only `PracticeAttempt` with one `ItemAttempt` per presented question. Mistake records link to `attemptId`, `itemAttemptId`, `sessionItemId`, and `sourceItemId`. New workflows write through `recordPracticeAttempt`; `vignetteResults` remains only for migration and supported legacy backup data.

## Content eligibility

- Practice may use approved authored content, procedural fallback content, or clearly labelled AI drafts.
- Mock exams use approved authored content only.
- A mock is rejected when the authored bank cannot satisfy its requested topic quotas without repeating source questions.
- Readiness and topic mastery exclude attempts containing draft content.
- Topic mastery requires at least five eligible items. The readiness index requires at least 20 eligible items across at least three topics.

## Generation boundary

`POST /api/generate-vignette` accepts the strict `GenerationRequestSchema`. Unknown fields, invalid enum values, and unsupported counts are rejected. Responses must contain exactly the requested number of unique questions and pass `GenerationResponseSchema`; otherwise the route returns an explicit validation error. Provenance is attached to both the response and the persisted vignette.

## Persistence and backups

Zustand persists version 4 domain state under `cfa-wizard-storage-v3`; the key name is retained to preserve existing browser data. Store migrations convert supported legacy results to canonical attempts.

Current backups use this strict envelope:

```ts
{
  product: "cfa-wizard";
  schemaVersion: 4;
  exportedAt: string;
  restoreMode: "replace";
  data: PersistedDomainState;
}
```

Imports validate the entire envelope and all canonical sessions/attempts before state changes. The UI shows a replacement summary and requires a second explicit action. Unknown products, unsupported versions, extra envelope fields, duplicate attempt IDs, and dangling active-session IDs are rejected. Legacy v3 exports are normalized through a guarded compatibility reader with a warning.

## Accessibility foundation

Priority dialogs use `useAccessibleDialog` for initial focus, focus containment, Escape handling, body scroll locking, and launcher focus restoration. This is the shared behavior for the generator, mock, sprint, and backup flows; remaining overlays should adopt the same hook as they are refined.

# CFA Wizard UI refinement implementation plan

Status: ready for implementation  
Audience: implementation agent such as Antigravity  
Primary surface: `/app` study dashboard  
Objective: make the dashboard more visually distinctive and engaging without restoring the cognitive overload removed in the previous refinement pass

## 1. Product direction

CFA Wizard is a self-study application for CFA Level I candidates. The interface should feel like a calm, focused digital study desk: credible enough for serious exam preparation, approachable enough for regular use, and visibly responsive to learner progress.

Use the working direction **Calm Momentum**:

- calm, expert, readable, and encouraging;
- visually richer through hierarchy, typography, meaningful progress, and state;
- restrained use of colour tied to learning meaning;
- engaging through accomplishment and responsive feedback, not decoration or gamification;
- equally usable on mobile and desktop.

The page must not return to the old financial-terminal aesthetic. Do not add neon glows, dense telemetry, glass panels, ornamental charts, gradient text, confetti, streak mechanics, stock illustrations, or grids of new dashboard cards.

## 2. Non-negotiable constraints

1. Refine existing functionality before adding features.
2. Do not change the canonical session, attempt, grading, provenance, analytics, mock, or backup models.
3. Do not reintroduce reads or writes to legacy `vignetteResults` in dashboard workflows.
4. Use existing Zustand state and existing actions. Derived presentation data may be added with pure selectors or helpers.
5. Preserve WCAG 2.2 AA intent, keyboard access, reduced motion, and 44-by-44-pixel touch targets.
6. Maintain zero horizontal overflow at 320, 390, 768, 1024, and 1440 CSS pixels.
7. Keep body copy at 16px where space permits. Do not use text below 12px.
8. Colour must never be the only indicator of completion, weakness, selection, or progress.
9. Use Lucide icons already available in the project. Do not introduce emoji or another icon library.
10. Do not install a motion library for this pass. CSS transitions are sufficient.

## 3. Current problems to solve

The current dashboard is readable but visually flat:

- the page background, assignment card, tab bar, and topic list use nearly identical dark grey surfaces;
- borders define almost every region, making the page feel mechanically boxed in;
- the large assignment card has unused space and no meaningful progress visual;
- the white active tab looks disconnected from the brand palette;
- topic rows repeat the same treatment regardless of learner state;
- completion and prior performance are communicated mostly through text;
- the system font is clear but generic;
- there is little responsive feedback when progress changes.

The redesign must address those problems without increasing the amount of information visible at one time.

## 4. Files in scope

Primary files:

- `src/app/app/page.tsx`
- `src/app/globals.css`
- `src/app/layout.tsx`
- `src/components/dashboard/CurrentAssignmentCard.tsx`
- `src/components/dashboard/CurriculumTracksGrid.tsx`

Likely new supporting files:

- `src/components/dashboard/TopicProgressRing.tsx`
- `src/components/dashboard/topicPresentation.ts`

Optional only if genuine reuse is demonstrated:

- `src/components/common/ProgressBar.tsx`
- `src/components/common/StatusBadge.tsx`

Do not perform a repository-wide visual rewrite in this task. Other study, review, mock, generator, and analytics screens should continue working with the updated global tokens and font, but their detailed redesign belongs in later passes.

## 5. Visual system

### 5.1 Typography

Replace the generic system stack with **Plus Jakarta Sans** using `next/font/google` in `src/app/layout.tsx`.

Requirements:

- load only weights actually used, preferably 400, 500, 600, and 700;
- expose the font through a CSS variable and connect Tailwind `font-sans` to it if required by the current configuration;
- retain a system sans fallback;
- keep one primary family across headings, labels, buttons, and body copy;
- reserve monospace for formulas, calculator input, code-like values, or short numeric data only;
- use tabular numerals for scores, counts, percentages, and timers;
- do not use display fonts in application controls.

Recommended scale:

| Role | Desktop | Mobile | Weight |
|---|---:|---:|---:|
| Dashboard topic title | 32px | 26px | 700 |
| Section heading | 22px | 20px | 700 |
| Topic row heading | 16px | 16px | 600 |
| Body | 16px | 16px | 400 |
| Secondary text | 14px | 14px | 400 or 500 |
| Badge/caption | 12–13px | 12–13px | 600 |

Use tighter tracking only on large headings, around `-0.02em`. Do not add wide tracking or uppercase sentences.

### 5.2 Colour tokens

Move repeated dashboard colours into semantic CSS variables in `globals.css`. These values are a starting point and may be adjusted slightly after contrast testing:

```css
:root {
  --background: #0b100f;
  --surface: #121816;
  --surface-raised: #18211d;
  --surface-interactive: #1d2823;
  --border: #2a3530;
  --border-strong: #3a4841;
  --foreground: #f3f6f2;
  --muted: #aab5af;
  --muted-strong: #c5cdc8;
  --accent: #b8d878;
  --accent-strong: #c9e986;
  --accent-ink: #11170f;
  --info: #77cdb1;
  --warning: #e6bd68;
  --generated: #aaa5e8;
  --danger: #e07c7c;
}
```

Rules:

- use lime for the primary action, current selection, and positive completion state;
- use aqua for learning/review information;
- use amber for evidence-backed “needs review” states;
- use violet only for generated/custom practice;
- use red only for destructive actions or errors;
- keep inactive controls neutral;
- verify normal text at 4.5:1 and large text at 3:1 or better;
- reduce reliance on full borders by separating major surfaces through tone and spacing.

### 5.3 Shape and depth

- standard control radius: 10–12px;
- large surface radius: 18–20px;
- do not turn every text block into a card;
- use one quiet shadow only for elevated menus and the primary assignment surface;
- topic rows should primarily use shared surfaces and separators, not individual floating cards;
- no glassmorphism;
- no coloured side-stripe card accents.

## 6. Dashboard composition

### 6.1 Header

Keep the current header structure and actions. This pass should polish it, not redesign navigation.

Changes:

- use the new semantic tokens and font;
- slightly strengthen the CFA Wizard wordmark while keeping “Level I study” subordinate;
- make the brand dot feel intentional by placing it in a subtle 18–20px tinted circle, not by adding glow;
- ensure navigation hover, focus, active, and pressed states use the same control vocabulary;
- retain the compact mobile behavior;
- do not add more header destinations.

### 6.2 Current assignment hero

Refactor `CurrentAssignmentCard` into the page’s single focal surface.

Desktop composition:

- use a two-column layout around 65/35;
- left column: recommendation label, topic title, concise objective, last result, common difficulty;
- right column: overall topic progress summary, primary action, and secondary actions;
- right-column content should fill the currently unused space rather than merely centering three buttons;
- the card may use `--surface-raised` with a very subtle accent tint;
- avoid ornamental gradients. A functional progress ring may use SVG strokes.

Copy changes:

- replace “Suggested next topic” with `Continue studying` when an attempt exists, otherwise `Start here`;
- retain `Topic 01 of 10` and exam weight as secondary metadata;
- replace `Last eligible attempt` with learner-facing `Last attempt`;
- if the latest topic attempt was perfect, say `You completed your last set with 100%.`;
- otherwise say `Your last set was X%. Review the explanation or continue practising.`;
- avoid exposing internal terms such as “eligible,” “canonical,” or “evidence threshold.”

Progress summary:

- add `TopicProgressRing` using an accessible SVG circle;
- it represents `completedTopicIds.length / 10`, not readiness or an estimated pass probability;
- show the number in text inside the ring, for example `2 of 10`;
- add a visible label such as `Topics completed`;
- add `aria-label="2 of 10 topics completed"`;
- the ring must still be understandable with CSS disabled or colour unavailable;
- use tabular numerals.

Actions:

- primary: `Continue 5-question practice` if there is an attempt, otherwise `Start 5-question practice`;
- secondary: `Review topic` and `Create custom practice`;
- primary button remains full-width within the action region;
- secondary buttons share equal visual weight and consistent icons;
- loading, disabled, focus, hover, and pressed states must remain clear.

Mobile composition:

- stack the content;
- reduce the progress ring to approximately 72–80px and place it beside the completion copy;
- primary action spans the available width;
- secondary actions may remain a two-column row at 390px, but must stack at 320px if labels become cramped;
- do not hide the last-attempt result;
- `Common difficulty` may be collapsed into a concise one-line hint or moved below the actions, but must remain available.

## 7. Study view tabs

Replace the large white selected pill in `src/app/app/page.tsx`.

Desired treatment:

- one shared quiet surface for the tab list;
- active tab uses accent text, a low-opacity accent background, and a 2–3px bottom indicator;
- inactive tabs use muted text and a subtle hover surface;
- transition colour, background, and indicator position over 180–220ms with an ease-out curve;
- do not add icons unless user testing shows labels are insufficient;
- keep the current two-column mobile and four-column desktop structure unless a no-wrap test proves four columns work comfortably at 390px;
- preserve `role="tablist"`, `role="tab"`, and `aria-selected`;
- implement arrow-key tab navigation if it is not already present;
- focus indicators must remain distinct from the selected state.

Do not use a pure-white active fill. The tab should feel selected within the interface, not pasted on top of it.

## 8. Topic presentation model

Create a small pure helper in `topicPresentation.ts` to derive display-only topic state from existing data. Do not store these values.

Suggested state priority:

1. `current`: matches the active or in-progress topic;
2. `needs-review`: has at least five eligible item attempts and accuracy below 70%;
3. `completed`: included in `completedTopicIds`;
4. `started`: has an eligible attempt but does not meet the above states;
5. `not-started`.

Return:

```ts
type TopicDisplayState =
  | "current"
  | "needs-review"
  | "completed"
  | "started"
  | "not-started";

interface TopicPresentation {
  state: TopicDisplayState;
  latestScore?: number;
  latestTotal?: number;
  latestAccuracy?: number;
  eligibleItemCount: number;
}
```

Only use attempts where `containsDraftContent` is false. Reuse or extract existing canonical-attempt derivation instead of duplicating incompatible definitions between the hero, topic list, and analytics.

## 9. Topic list redesign

Keep curriculum order. Do not replace it with a grid of cards.

### 9.1 Row structure

Each row should contain:

1. a topic icon tile;
2. topic title and explicit state label;
3. concise metadata;
4. optional last-attempt progress bar;
5. expand control;
6. practice action.

Suggested Lucide mapping:

- 01 Quantitative Methods: `Sigma`
- 02 Economics: `TrendingUp`
- 03 Corporate Issuers/Finance: `Building2`
- 04 Financial Statement Analysis: `FileSpreadsheet`
- 05 Equity: `LineChart`
- 06 Fixed Income: `Landmark`
- 07 Derivatives: `ArrowLeftRight`
- 08 Alternative Investments: `Gem`
- 09 Portfolio Management: `PieChart`
- 10 Ethics: `Scale`

Icons are decorative beside visible topic names and should use `aria-hidden="true"`.

### 9.2 State styling

`current`:

- slightly elevated tinted surface;
- accent icon tile;
- visible `Continue` label;
- practice button uses stronger accent treatment.

`needs-review`:

- neutral surface with amber icon/status;
- visible text `Needs review`;
- do not use red for ordinary low scores.

`completed`:

- quiet green check plus visible `Completed` text;
- keep the row calmer than the current topic;
- completion should not make every row bright green.

`started`:

- show `In progress` and last-attempt accuracy;
- use an aqua informational treatment.

`not-started`:

- neutral icon tile and `Not started` only when useful;
- lower visual weight without reducing text contrast below accessibility requirements.

### 9.3 Progress bar

When a canonical eligible attempt exists:

- show a slim 4–6px progress bar representing latest attempt accuracy;
- include a visible value such as `Last attempt 4/5`;
- provide an accessible label;
- do not imply that this bar represents full topic mastery;
- use semantic state colours, but retain the numeric result.

### 9.4 Expanded content

Keep the current progressive-disclosure behavior and module content.

Refine it by:

- using the raised surface token instead of another heavily bordered card;
- keeping learning modules in one column on mobile and two on larger screens;
- reducing nested borders;
- retaining `Review topic notes` and `Create custom practice` actions;
- animating disclosure only with opacity and a short transform/clip transition when practical;
- making expansion instantaneous under reduced-motion preferences.

## 10. Motion and feedback

Motion must communicate state.

Implement:

- 180–220ms hover and selected-state transitions;
- a 1–2px visual lift for interactive topic rows on pointer hover only;
- chevron rotation on expansion;
- progress-ring and progress-bar updates after completed practice;
- a restrained checkmark draw or scale-in when a topic changes to completed;
- button pressed feedback around `scale(0.98)` without changing layout.

Do not implement:

- page-load sequences;
- repeating pulses;
- bouncing or elastic easing;
- animated backgrounds;
- motion that delays access to controls;
- animation of expensive layout properties when transform or opacity can express the state.

All motion must have a reduced-motion alternative through the existing global media query.

## 11. Accessibility requirements

- preserve sequential heading structure: dashboard `h1`, section `h2`, topic names `h3`;
- all icon-only buttons require accessible labels;
- decorative icons require `aria-hidden="true"`;
- maintain visible focus on every interactive element;
- ensure the focus ring is not clipped by rounded or overflow-hidden parents;
- minimum target is 44 by 44 CSS pixels;
- progress components must expose text and accessible names;
- topic status must use icon plus text, never colour alone;
- tabs must support keyboard navigation and expose correct selected state;
- expanded topic controls must retain `aria-expanded` and `aria-controls`;
- test at 200% browser zoom;
- verify colour contrast programmatically or with browser tooling.

## 12. Responsive behavior

### 320–389px

- compact header;
- stacked assignment hero;
- compact horizontal progress summary;
- secondary hero actions may stack;
- tabs remain a two-by-two grid;
- topic metadata wraps rather than truncating essential information;
- practice action remains at least 44px and may be icon-first with an accessible label;
- no horizontal scrolling.

### 390–767px

- assignment content remains stacked;
- secondary actions may use two columns;
- topic rows should display title, state, and primary metadata without clipping;
- expanded modules use one column.

### 768–1023px

- assignment hero may use a compact two-column split if it remains readable;
- tabs use four columns;
- topic actions show text;
- expanded modules may use two columns.

### 1024px and above

- use the 65/35 hero composition;
- preserve the existing maximum content width;
- avoid increasing empty margins beyond the current layout;
- do not stretch body copy past approximately 70 characters per line.

## 13. Implementation sequence

### Phase A: baseline and tokens

1. Confirm the worktree contains no unrelated uncommitted changes.
2. Capture before screenshots at 390 by 844 and 1440 by 1000.
3. Add Plus Jakarta Sans through `next/font`.
4. Introduce semantic colour, radius, shadow, and motion tokens.
5. Replace repeated raw dashboard colours only in files within this task’s scope.
6. Run type checking and linting.

### Phase B: assignment hero

1. Add the accessible `TopicProgressRing`.
2. Refactor `CurrentAssignmentCard` into the new 65/35 composition.
3. Improve learner-facing copy without changing domain calculations.
4. Verify empty, first-use, attempted, completed, and perfect-score states.
5. Verify the 320px and 390px layouts before proceeding.

### Phase C: tabs

1. Replace the white active state.
2. Normalize interaction states.
3. Add keyboard arrow navigation if absent.
4. Verify focus visibility and reduced motion.

### Phase D: topic rows

1. Add the pure topic presentation helper.
2. Add topic icon mapping.
3. Implement the five meaningful visual states.
4. Add latest-attempt bars with numeric text.
5. Refine expanded module content.
6. Test rows with long topic names and long metadata.

### Phase E: polish and verification

1. Normalize spacing and remove redundant borders.
2. Confirm all controls have complete default, hover, focus, active, disabled, and loading states where applicable.
3. Confirm reduced-motion behavior.
4. Capture after screenshots at all target sizes.
5. Run the complete validation suite.

## 14. Required test states

Test the dashboard with:

- no attempts and no completed topics;
- one current topic with a failed attempt;
- one topic with fewer than five eligible items;
- one topic with at least five items and accuracy below 70%;
- a completed topic;
- a perfect latest attempt;
- generated-draft attempts that must not affect topic presentation;
- all ten topics completed;
- very long translated or zoomed labels;
- reduced-motion enabled;
- keyboard-only operation.

Do not fake persistent user data in production code to create screenshots. Use test fixtures, browser storage in a disposable session, or development-only tooling.

## 15. Acceptance criteria

The work is complete when:

1. The current assignment is the clear visual focus at first glance.
2. The interface feels more distinctive without becoming denser.
3. Overall curriculum progress is visible without implying exam readiness.
4. Topic rows are visibly distinguishable as current, needs review, completed, started, or not started.
5. The selected tab feels integrated with the dark palette.
6. Learner-facing copy contains no internal data-model terminology.
7. The font is easier to read and consistently applied.
8. Colour usage is semantic and contrast-compliant.
9. The page has no horizontal overflow at 320, 390, 768, 1024, or 1440px.
10. Keyboard, focus, zoom, and reduced-motion behavior remain correct.
11. No canonical practice, generation, analytics, mock, or backup behavior changes.
12. `npm run check` and `git diff --check` both pass.
13. Browser console contains no errors during dashboard navigation, topic expansion, tab switching, or starting practice.

## 16. Manual verification checklist

- Open `/app` at 1440px and identify the next study action within two seconds.
- Switch among all four tabs with pointer and keyboard.
- Expand and collapse at least three topics.
- Start practice from both the assignment hero and a topic row.
- Return to the dashboard and confirm updated progress appears correctly.
- Check a generated-draft attempt does not change readiness or topic evidence.
- Verify every visible label at 200% zoom.
- Verify 320 by 568 and 390 by 844 mobile layouts.
- Verify touch targets and no clipped focus rings.
- Verify reduced motion.
- Verify no console errors.

## 17. Handoff expectations

The implementing agent should provide:

- a concise summary of visual decisions;
- before and after screenshots at desktop and mobile sizes;
- a list of modified and added files;
- any deliberate deviations from this plan and their rationale;
- automated-check results;
- manual responsive and accessibility verification results;
- remaining risks or follow-up work, especially screens that still use older visual tokens.

Keep commits scoped. A suitable commit sequence is:

1. `style: establish calm momentum dashboard tokens`
2. `feat: improve assignment and curriculum progress presentation`
3. `style: refine dashboard tabs and topic interactions`
4. `test: verify responsive accessible dashboard states`

# CFA Wizard UI Refinement Plan for Antigravity

Status: Approved by the user. Ready for Antigravity implementation.

Approved visual reference: the Obsidian Glass desktop concept generated in this Codex conversation on 19 September 2026. Treat the reference as a material, hierarchy, and composition guide; retain the application's real curriculum content and data.

## 1. Objective

Refine CFA Wizard into a calm, expert, rigorous study product with a recognizable visual identity. Preserve the improvements already made to clarity, accessibility, dark-mode readability, and touch targets while removing the remaining generic dashboard feel.

The primary experience should help a self-directed CFA Level I candidate answer three questions immediately:

1. What should I study next?
2. What action should I take now?
3. How am I progressing toward exam readiness?

Do not change application logic, study data, scoring, persistence, question generation, or existing user progress. This is a presentation, hierarchy, responsive-layout, and interaction-polish pass.

## 2. Confirmed visual direction

### Direction name: Obsidian Glass

Use a restrained, dark, smoked-glass visual system. It should feel like precision study equipment, not a trading terminal, game HUD, or generic glassmorphism demo.

Scene sentence: A focused CFA candidate studies at a desk in the evening, switching between explanations, questions, and progress data without visual noise or glare.

Color strategy: Restrained. Deep green-black neutrals carry the interface. The existing lime accent is reserved for primary actions, selected state, progress, and positive feedback.

Visual references in spirit, not direct imitation:

- Apple system glass for material depth and layered navigation.
- Linear for density, hierarchy, and disciplined controls.
- Stripe Dashboard for trustworthy data presentation and empty states.

### Why not full liquid glass everywhere

Heavy glass on every card, row, button, and data tile would reduce text contrast, increase visual noise, and make long CFA questions harder to read. It would also become another generic visual effect.

Use glass only where it communicates hierarchy:

- Sticky application header.
- Primary assignment surface.
- Main view navigation.
- Modal and floating utility surfaces.
- One or two elevated summary surfaces per view.

Use opaque or nearly opaque surfaces for:

- Question text.
- Answer options.
- Long explanations.
- Curriculum rows.
- Dense analytics.
- Form fields and configuration controls.

## 3. Remove the white-outline card treatment

The current bright perimeter around major cards makes the interface feel basic and diagrammatic. Do not replace it with another visible white or silver outline.

### New surface-separation method

Separate surfaces using a combination of:

- Tonal difference between page, surface, and raised surface.
- Soft ambient shadow.
- Backdrop blur only on true glass surfaces.
- A very faint internal top light, not a full perimeter stroke.
- Local accent tint for selected or important states.
- Whitespace and grouping rather than a border around everything.

### Border rules

- Major cards: no bright full-perimeter border.
- Glass panels: default to no border. An optional inset top highlight may be used at very low opacity.
- Curriculum rows: use subtle horizontal dividers inside one shared surface, not ten individually outlined cards.
- Interactive controls and form fields: retain a visible low-contrast boundary because it communicates affordance.
- Focus indicators: retain a strong accessible focus ring. A focus ring is functional and must not be removed to satisfy the no-outline visual preference.
- Warning, error, and success states: use a tonal background plus icon and text. Do not rely on a colored outline alone.

Avoid classes such as `border-white/*`, pale full-card strokes, or high-contrast `border-border/80` on large surfaces.

## 4. Foundation tokens

Consolidate the mixed token-based colors and hardcoded zinc/black values into one semantic system in `src/app/globals.css` and `tailwind.config.ts`.

The exact values can be tuned during browser QA, but begin from this hierarchy:

```css
:root {
  --background: #080d0b;
  --background-elevated: #0c1210;

  --surface-solid: #121916;
  --surface-raised: #17211c;
  --surface-interactive: #1b2721;

  --glass-surface: rgba(20, 30, 25, 0.72);
  --glass-surface-strong: rgba(23, 34, 28, 0.84);
  --glass-highlight: rgba(235, 255, 242, 0.055);
  --glass-shadow: 0 20px 60px rgba(0, 0, 0, 0.36);
  --glass-shadow-soft: 0 10px 32px rgba(0, 0, 0, 0.24);
  --glass-blur: 18px;

  --divider: rgba(190, 214, 199, 0.09);
  --control-boundary: rgba(190, 214, 199, 0.15);
  --control-boundary-hover: rgba(184, 216, 120, 0.34);

  --foreground: #f2f6f3;
  --muted-strong: #c3cec7;
  --muted: #9eaaa3;

  --accent: #b8d878;
  --accent-strong: #cae98a;
  --accent-ink: #10160f;
  --info: #77cdb1;
  --warning: #e6bd68;
  --danger: #e07c7c;
}
```

Create reusable material utilities instead of repeating long class strings:

- `.glass-shell`: navigation and sticky shell material.
- `.glass-panel`: major elevated glass surface.
- `.surface-panel`: opaque reading or data surface.
- `.surface-row`: row treatment with tonal hover state.
- `.control-boundary`: accessible boundary for interactive controls.

Suggested glass behavior:

```css
.glass-panel {
  background: var(--glass-surface);
  box-shadow:
    inset 0 1px 0 var(--glass-highlight),
    var(--glass-shadow);
  backdrop-filter: blur(var(--glass-blur)) saturate(115%);
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(115%);
}
```

Do not add a full white border to `.glass-panel`.

Provide a solid fallback through `@supports not (backdrop-filter: blur(1px))`. Reduce blur strength on small screens if scrolling performance degrades. Never place multiple blurred panels directly on top of one another.

## 5. Typography

Replace the single generic startup-style voice with a financial product type system:

- IBM Plex Sans for headings, interface copy, buttons, and long-form reading.
- IBM Plex Mono for topic numbers, LOS codes, percentages, timers, data columns, and keyboard shortcuts.
- Do not apply monospace to whole pages or full paragraphs.

Use a compact fixed scale:

- Page title: 30 to 32px, 650 or 700 weight.
- Section title: 20 to 24px, 600 or 650 weight.
- Card title: 16 to 18px, 600 weight.
- Body: 15 to 16px with 1.5 to 1.65 line height.
- Secondary text: 13 to 14px.
- Compact metadata: 12px minimum.

Reserve uppercase for short labels of four words or fewer. Rewrite long uppercase headings and buttons into sentence case. Keep numerical data tabular.

## 6. Information architecture and layout

### 6.1 Current assignment appears in full only on Study

The full `CurrentAssignmentCard` currently appears above Study, Custom Practice, Review, and Progress. It consumes most of the first viewport, so changing tabs appears to change only the underline while the selected content remains below the fold.

Implement this behavior:

- Study tab: show the redesigned full assignment surface.
- Custom Practice, Review, and Progress: replace it with a compact 56 to 72px context bar.
- Context bar content: topic number, topic name, exam weight, current progress, and one concise `Start practice` action.
- On tab change, move focus to the selected panel heading for keyboard and screen-reader users without forcing unexpected page scrolling for pointer users.

Relevant file: `src/app/app/page.tsx`.

### 6.2 Redesign the assignment surface

Remove the nested card-inside-card construction.

Desktop composition:

- Left: state label, topic title, objective, and common difficulty.
- Right: concise progress value and one primary CTA.
- Secondary actions sit below as quiet text or tonal buttons.
- Replace the large empty circular progress indicator with a compact linear syllabus indicator until progress becomes meaningful.
- Reduce total height by approximately one third.

Mobile composition:

- One column.
- Primary action remains full width.
- Keep secondary actions stacked until at least 480px, or use short labels `Review` and `Practice setup`.
- Do not truncate the action labels.

Relevant file: `src/components/dashboard/CurrentAssignmentCard.tsx`.

### 6.3 Main view navigation

The current rounded 2 by 2 mobile tab panel is visually heavy.

Use one row at all supported widths:

- Study
- Practice
- Review
- Progress

Desktop: a low-height glass navigation rail with a subtle selected fill and lime indicator.

Mobile: a compact sticky or static one-row control. Do not horizontally scroll four items. Each target must remain at least 44px high.

Avoid a bright outer outline around the tab container. Use tonal separation, an internal highlight, and shadow.

### 6.4 Curriculum index

Replace the settings-list appearance with a structured curriculum index.

Desktop row structure:

`Topic number | Topic name | Exam weight | Last result | Status | Practice action`

Rules:

- Use one continuous surface with internal dividers.
- Topic numbers are the primary visual anchors. Icons become optional and secondary.
- Align weights, scores, and actions into consistent columns.
- Use typography, a soft selected tint, and state icons for current, review, and completed states.
- Do not use a thick colored side stripe.
- Keep expansion for learning modules.
- Expanded content uses a tonal inset region, not another outlined card.

Mobile:

- Allow topic titles to wrap to two lines.
- Place module count, formula count, and exam weight on a second metadata line.
- Keep the practice target at least 44 by 44px.
- Do not hide important metadata behind ellipsis without an accessible disclosure.

Relevant file: `src/components/dashboard/CurriculumTracksGrid.tsx`.

## 7. Cross-view visual unification

### Custom Practice

- Replace hardcoded `#09090B`, `#0B0B0E`, and zinc classes with semantic tokens.
- Use one raised solid configuration surface inside the glass shell.
- Use sentence-case labels such as `Select curriculum topic`, `Question count`, `Difficulty`, and `Scenario focus`.
- Preserve standard native form affordances.
- Make selected segmented controls clear through fill and weight, not glowing outlines.
- Keep the configuration summary visible on desktop, but let it follow the form on mobile.
- Rename `Synthesize & launch drill` to `Generate practice set` unless product terminology requires the existing wording.

Relevant file: `src/components/dashboard/ScenarioSimulatorStudio.tsx`.

### Review

- Replace the full-page monospace and uppercase treatment with the shared typography system.
- Keep monospace for intervals, counts, and timing only.
- Rename theatrical labels where possible. For example, `Spaced repetition vault` can become `Spaced review`; `Candidate error log` can become `Mistake review`.
- Present the three Leitner boxes as a single stepped retention model, not three nested cards.
- Use one primary action per major section.

Relevant file: `src/components/dashboard/SpacedRecallSprintsView.tsx`.

### Progress

- Replace four empty KPI cards containing dashes with one intentional readiness onboarding state until enough data exists.
- Copy: `Complete 20 questions across at least 3 topics to calculate your readiness index.`
- Show visible progress toward 20 questions and 3 topics.
- Provide one action, `Start diagnostic practice`.
- Reveal the KPI strip only after meaningful evidence exists.
- At zero state, render the ten-topic mastery view as a compact curriculum table rather than ten identical `Untested` cards.
- Keep legends adjacent to charts and use icons or text in addition to color.

Relevant file: `src/components/analytics/AnalyticsDashboardView.tsx`.

### Practice engine

- Preserve its stronger identity, but remove excessive terminal language and all-page monospace.
- Use the same background, surface, typography, radii, and accent tokens as the dashboard.
- Question and explanation surfaces must remain opaque for readability.
- Keep LOS codes, timers, counts, and keyboard shortcuts in mono.
- Keep answer buttons visually stable when selected or graded.

Relevant file: `src/components/vignette/VignetteEngine.tsx`.

## 8. Brand details

Replace the generic green dot in the header with a small proprietary SVG mark. Explore a restrained geometric mark combining one of these ideas:

- A faceted `W`.
- A progress arc with a single node.
- A subtle wand and rising-data intersection.

Requirements:

- Must read clearly at 16 to 20px.
- Use one or two solid colors only.
- No gradients.
- No detailed illustration.
- Provide accessible text through the adjacent visible `CFA Wizard` label, and hide the mark itself from the accessibility tree.

Do not imitate or imply the CFA Institute logo.

## 9. Radius, shadow, and icon discipline

Use a controlled radius hierarchy:

- 8px: inputs, chips, and compact controls.
- 12px: buttons, rows, and small panels.
- 16px: major panels and modals.
- Avoid applying `rounded-2xl` to nearly every element.

Use only two elevation levels:

- Soft: navigation and interactive popovers.
- Raised: major glass surface and modal.

Continue using Lucide icons. Standardize sizes at 16, 20, and 24px with consistent stroke weight. Decorative icons beside visible labels should use `aria-hidden="true"`.

## 10. Motion and interaction

Motion must explain state changes rather than decorate the page.

- Hover and press feedback: 140 to 180ms.
- View crossfade or short vertical transition: 180 to 240ms.
- Assignment surface to compact context bar: restrained opacity and translate transition.
- Accordion disclosure: animate opacity and transform; avoid animating large heights when possible.
- Do not scale every button on press. Reserve subtle scale feedback for primary actions.
- Do not add orchestrated entrance sequences.
- Maintain the existing reduced-motion override and ensure every new transition has a reduced-motion result.

## 11. Responsive requirements

Verify at minimum:

- 375 by 812 phone.
- 390 by 844 phone.
- 768 by 1024 tablet portrait.
- 1024 by 768 tablet landscape.
- 1440 by 900 desktop.

Requirements:

- Use `min-h-dvh` for the page shell.
- No horizontal scrolling.
- No truncated primary actions.
- Topic names can wrap without colliding with controls.
- Four primary views remain reachable in one row.
- Sticky header never obscures keyboard focus.
- Long question content stays within a readable measure.
- Avoid nested scrolling regions.
- Reduce or disable expensive backdrop blur on constrained mobile devices if it affects scroll performance.

## 12. Accessibility requirements

Target WCAG 2.2 AA.

- Normal text contrast must be at least 4.5:1 against the composed glass background, not merely against the token value in isolation.
- Interactive component boundaries and meaningful icons must maintain at least 3:1 contrast.
- Do not remove visible focus rings.
- All interactive targets must be at least 44 by 44px.
- Preserve tab arrow-key behavior and correct ARIA relationships.
- Selected, expanded, loading, and disabled states must be available semantically.
- Color must not be the only status indicator.
- Decorative icons must be hidden from assistive technology.
- Empty states must explain the next action.
- Respect `prefers-reduced-motion`.

## 13. Implementation sequence

Implement in this order so Antigravity can verify each layer independently.

### Phase 1: Foundation

- [ ] Add IBM Plex Sans and IBM Plex Mono through `next/font/google`.
- [ ] Define semantic background, solid-surface, glass, divider, control, type, and motion tokens.
- [ ] Add reusable material utilities and no-blur fallbacks.
- [ ] Remove duplicated hardcoded black/zinc colors from shared dashboard surfaces.
- [ ] Establish radius, shadow, icon-size, and z-index scales.

### Phase 2: Application shell and hierarchy

- [ ] Convert the header to a restrained glass shell without a white perimeter.
- [ ] Replace the green dot with a simple local SVG brand mark.
- [ ] Show the full assignment surface only on Study.
- [ ] Add the compact topic context bar to the other three views.
- [ ] Replace the tab panel with the single-row view navigation.
- [ ] Ensure focus moves appropriately when views change.

### Phase 3: Study dashboard

- [ ] Redesign the assignment surface without nested cards.
- [ ] Convert the topic list into a curriculum index with aligned desktop columns.
- [ ] Implement the mobile row layout without inappropriate truncation.
- [ ] Preserve accordion behavior, keyboard operation, and current progress logic.

### Phase 4: Practice, Review, and Progress

- [ ] Apply shared tokens and typography to Custom Practice.
- [ ] Simplify Review terminology and reduce monospace usage.
- [ ] Replace empty analytics KPI cards with the readiness onboarding state.
- [ ] Convert the zero-state mastery matrix into a compact table/list.
- [ ] Align practice-engine materials with the global system while keeping reading surfaces opaque.

### Phase 5: Interaction and QA

- [ ] Add shared motion tokens and view transitions.
- [ ] Verify hover, focus, active, disabled, loading, empty, error, and success states.
- [ ] Test all required viewport sizes.
- [ ] Test keyboard-only navigation.
- [ ] Test reduced motion.
- [ ] Check composed contrast on glass surfaces.
- [ ] Run typecheck, tests, lint, and production build.

## 14. File map

Primary files expected to change:

- `src/app/globals.css`
- `src/app/layout.tsx`
- `tailwind.config.ts`
- `src/app/app/page.tsx`
- `src/components/dashboard/CurrentAssignmentCard.tsx`
- `src/components/dashboard/CurriculumTracksGrid.tsx`
- `src/components/dashboard/ScenarioSimulatorStudio.tsx`
- `src/components/dashboard/SpacedRecallSprintsView.tsx`
- `src/components/analytics/AnalyticsDashboardView.tsx`
- `src/components/vignette/VignetteEngine.tsx`
- `src/components/layout/Footer.tsx`

Potential new shared files:

- `src/components/common/GlassPanel.tsx`, only if a component abstraction reduces repetition without restricting semantics.
- `src/components/common/TopicContextBar.tsx`.
- `src/components/brand/CFAWizardMark.tsx`.
- `src/styles/materials.css`, only if `globals.css` becomes difficult to maintain.

Prefer semantic CSS utilities over creating a generic wrapper component for every surface.

## 15. Acceptance criteria

The pass is complete only when all of the following are true:

- Major cards no longer have bright white perimeter outlines.
- Glass is visible as depth and material, but does not reduce reading clarity.
- Study, Practice, Review, and Progress feel like one product.
- Changing a tab reveals meaningful selected content within the first viewport.
- The full assignment surface appears only on Study.
- Dashboard copy no longer mixes calm learner language with unnecessary terminal jargon.
- Monospace is limited to codes, metrics, timing, and compact data.
- The mobile navigation remains on one row.
- No primary button label truncates at 375px or 390px.
- Topic names and metadata remain understandable without hover.
- Empty Progress state teaches the user how to unlock readiness metrics.
- Every control remains keyboard accessible with visible focus.
- Text contrast is verified against the actual rendered glass composition.
- Reduced motion produces a complete, stable interface.
- `npm run typecheck`, `npm run test`, `npm run lint`, and `npm run build` pass.

## 16. Non-goals

Do not:

- Rebuild the app around a new component library.
- Add glass to every element.
- Introduce bright white card outlines.
- Add gradient text, neon glow, animated blobs, or decorative particle effects.
- Turn the product into a trading terminal.
- Replace familiar controls with experimental interactions.
- Change study logic, generation behavior, scoring, or persisted user data.
- Remove focus indicators to make surfaces look cleaner.
- Add motion that delays access to study content.

## 17. Final implementation instruction for Antigravity

Treat this document as the implementation source of truth. Preserve existing behavior first, then apply the new system in the stated phase order. After each phase, visually compare desktop and mobile layouts before proceeding. If glass and readability conflict, readability wins. If a panel can be separated through spacing and tone, do not add a border.

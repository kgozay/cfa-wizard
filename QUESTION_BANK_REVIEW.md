# CFA Wizard Question Bank Review

Date: 19 October 2026

Scope: the 200 authored items in `src/data/vignettes.ts` and `src/data/additionalQuestions.ts`, the parametric templates in `src/lib/generation/templates.ts`, the fallback bank in `src/app/api/generate-vignette/route.ts`, and the selection and randomisation logic behind practice drills, sprints, mocks and spaced review.

Questions this review answers:

1. Is the bank big enough?
2. Is it randomised enough?
3. Does it find the root cause of a candidate's mistakes?

Every item was read, and the calculations were re-run where something looked wrong.

## Verdict

| Question | Answer | Why |
|---|---|---|
| Big enough? | **No** | There are 200 items for a 180-item mock. Four topics have only 15 items each. Large parts of the curriculum have no questions at all. |
| Randomised enough? | **Partly** | Option order and question order are shuffled properly. Item selection does not know what the candidate has already seen. Numbers never change, and the two half mocks overlap by about 45%. |
| Gets to the root? | **Not yet** | Each distractor is written around one specific error, but the app records the item's single default error mode whichever distractor was chosen. Most items take one step, and the Ethics items test rule recall, not judgement. |

---

## 1. Content errors to fix first

### Wrong answer key

| Item | Problem | Fix |
|---|---|---|
| **119** (Quant, correlation) | ρ = 0.0048 / (0.20 × 0.30) = 0.0048 / 0.06 = **0.08**. The key says C (0.800), so candidates who answer correctly are marked wrong. The explanation for distractor B ("misplaces the decimal") is also wrong. | Either change the key to B, or change the covariance to 0.048 so that 0.80 is correct and rewrite the distractor explanations. |

### Numbers in the solution or options that are wrong

| Item | Problem |
|---|---|
| 108 | The product of the growth factors is 1.244208, not 1.244796. The geometric mean is **5.61%**, but the solution shows 5.63%. Option A is still the closest, but the worked solution is wrong. |
| 101 | Option C: e^0.084 − 1 = **8.763%**, not 8.765%. The explanation also calls it "daily continuous" compounding. |
| 501 | D₃ / (r − g) = **$68.77**. The option and the solution say $68.74. |
| 710 | The forward price is **$82.05**, but the option says $82.00. |
| 310 | 2.667 × 1.25 = 3.33. The option says 3.34 because DOL was rounded first. |

### Distractor explanation does not match the option value

This matters because these explanations feed the review screen, the trap log and the Leitner cards.

| Item | Option shown | What the explanation computes |
|---|---|---|
| 105 C | 0.725 | √0.65 = 0.806 |
| 115 C | 20.00 | "divides by n", which gives 66, not 20 |
| 306 B | 36.50% | mentions both 37.24% and 36.50% |
| 308 B | 9.50% | 6.75% |
| 309 B / C | 1.60 / 0.63 | 1.67 / 0.375 |
| 508 B | 5.50x | 6.00x |
| 602 C | $972.10 | the stated keystrokes give $698.05 |
| 604 B / C | $130,000 / $13,000 | The explanation calls $130,000 the PVBP. PVBP is actually $13,000, and $130,000 is the change for 10 bp. |
| 613 C | 5.50 | 7.00 |

These explanations are too vague to teach anything: 103 A, 106 C, 110 C, 312 B/C, 502 B, 505 C, 507 B, 515 C. Each one should name the exact wrong calculation that produces the option's number.

### Items that cannot be answered in sprints, mocks or Leitner review

Eight items depend on data in the topic's case text (`vignetteStem`): **401, 402, 501, 701, 801, 901, 902, 1001**. Two examples are "If Apex had reported under FIFO…" and "The beta of Stock Delta…". The case text is only shown in `VignetteEngine.tsx`. `InterleavedSprintModal`, `MockExamModal`/`MockQuestionItem` and `LeitnerCard` never carry or show `caseStem`. A full mock draws 22 of the 24 items in a topic, so it almost always includes some of these items without the data needed to solve them.

Fix: rewrite the eight items as standalone questions with the data in the stem. This is the better option because Level I uses standalone items. Alternatively, carry `caseStem` through to every mode, and add a test that fails when a stem refers to data it does not contain.

### Wording and tagging problems

- **1013** says GIPS verification "must be performed by" a third party. Verification is optional. The rule is that *if* a firm is verified, the verifier must be independent. The stem should say so.
- **811** includes "before management fees" in the soft-hurdle question, which makes the fee base ambiguous.
- **409** option C ("Tax rates are expected to decline permanently to zero") is not a plausible distractor.
- **711** is a swap question tagged with the trap category "Valuation of Contingent Claims (Options)". **510** is an industry life-cycle question tagged "Relative Valuation".
- Some LOS codes fall outside their topic's declared range, which breaks analytics by sub-reading:
  - 619 and 621 use 32.x, which is Derivatives.
  - 920 uses 43.c, which is Ethics.
  - 416, 422 and 424 use 15.b, 16.e and 21.c. The first two belong to Corporate Finance and the last is reused.
  - Ethics items run from 44.h to 44.s, but the topic's declared range is 44.a–g.
  - 1002 uses 45.b for a question about GIPS provisions, which are LOS 46.

---

## 2. Is the bank big enough?

### Size and depth

| Topic | Items | Full-mock quota | Share of the topic used by one full mock |
|---|---:|---:|---:|
| 01 Quant | 24 | 22 | 92% |
| 02 Economics | 15 | 13 | 87% |
| 03 Corporate Finance | 15 | 13 | 87% |
| 04 FSA | 24 | 22 | 92% |
| 05 Equity | 24 | 22 | 92% |
| 06 Fixed Income | 24 | 22 | 92% |
| 07 Derivatives | 15 | 13 | 87% |
| 08 Alternatives | 15 | 13 | 87% |
| 09 Portfolio | 20 | 18 | 90% |
| 10 Ethics | 24 | 22 | 92% |
| **Total** | **200** | **180** | **90%** |

- After one full mock there are almost no unseen items left, so a second mock measures memory rather than readiness.
- A 15-item topic runs out after two or three 5–10 question drills.
- Rule of thumb: the bank should be at least 3–4 times larger than the biggest single draw. That means about 60–80 items per topic, or 600–800 in total, so that one full mock uses no more than a third of any topic.

### Coverage gaps

These are high-frequency Level I areas with **no items**:

- **Quant:** money-weighted vs time-weighted return, annualising returns, confidence intervals, tests of correlation and non-parametric tests, Monte Carlo simulation and bootstrapping, introductory big data and machine learning.
- **Economics:** business cycle phases and indicators, monetary policy tools and transmission, geopolitics, international trade and capital flows, exchange rate regimes.
- **Corporate Finance:** business models, stakeholder and ESG considerations, capital structure theory (Modigliani–Miller, the pecking order), sources of liquidity.
- **FSA:** bonds payable and effective-interest amortisation, the balance sheet and income statement items beyond those already covered, analysis of cash flow statement ratios, financial statement modelling.
- **Equity:** types of equity securities, company analysis and forecasting.
- **Fixed Income:** yield curve theories, the four Cs of credit and credit ratings, repo haircuts and margins, the floating-rate note discount margin, ABS and covered bonds beyond one RMBS item, effective and key-rate duration calculations.
- **Derivatives:** the one-period binomial model and replication, swap valuation, cost of carry with convenience yield, option bounds and moneyness, forwards vs futures pricing.
- **Alternatives:** multi-year fees with a high-water mark, private credit, natural resources (timberland and farmland), digital assets.
- **Portfolio:** the risk management framework (only one VaR item), the slope of the capital allocation line and the optimal allocation from utility, more behavioural biases, the IPS beyond risk tolerance.
- **Ethics:** Standards IV(B), V(B), VI(A), III(A) client-identification nuances, and GIPS presentation and reporting.

### Cognitive depth

- About half the items (98) are conceptual and half (102) are numeric. Almost all numeric items use one formula in one step. The real exam often chains two or three steps, for example computing D₁, then g, then P₀, or a reserve change, then COGS, then a ratio.
- The **Ethics** items are rule recall ("Under Standard X, a member must…"). They include one obviously wrong option, such as "transferring employees to government contracts". The exam presents a scenario and asks whether there was a violation and which Standard applies, with three plausible options.
- **Implausible distractors** effectively turn some items into two-option questions: 311 C, 409 C, 807 C, 815 B ("GDP"), 913 C, 1004 C, 1005 C, 1007 C and others.
- **The longest option gives the answer away.** Among the 98 conceptual items, the correct answer is the longest option in 56 (57%), against 33% by chance. A test-wise candidate can score well above their real level.
- **Authored key position:** 157 A, 31 B, 12 C. The per-session shuffle hides this from candidates, but authors still need a check. The AI prompt's example JSON also hard-codes `"correctOption": "A"`.
- There is **no difficulty metadata per item**. The `difficulty` field is set per topic and is ignored by the template fallback. There are no "least likely" or "NOT" items in most topics.

### Trap and error-mode resolution

- Five topics have five trap categories or fewer, and 20 of the 24 Ethics items share the same trap ("Code of Ethics and Standards of Professional Conduct"). The trap analytics cannot distinguish one Ethics mistake from another.
- 22 of the 24 Ethics items use the error mode `CONCEPTUAL_CONFUSION`.

---

## 3. Is it randomised enough?

What works:

- Option order is shuffled per session with a seeded Mulberry32 PRNG. The key is remapped and the "Distractor X" references are rewritten (`presentItem.ts`).
- Question order is shuffled, sessions are reproducible from their seed, and mocks never repeat an item within a session.

What doesn't:

| Area | Current behaviour | Effect |
|---|---|---|
| Practice drill (`VignetteEngine.startNewSession`) | Uniform draw from the topic. It avoids only the items from the immediately previous session. | Older items come back at random, and there is no "unseen first" option. |
| Sprint (`InterleavedSprintModal.initSprint`) | Uniform over all 200 items. | Ignores exam weights, weak areas and history. A 10-question sprint can contain no Ethics and three Derivatives items. |
| Half Mock A and B | Independent draws per topic. | The expected overlap is Σ qA·qB/n ≈ **40 of 90 items (about 45%)**, yet the code comments say the two halves "together make one full mock". |
| Quick Diagnostic vs mocks | Independent draws, with no warning about items already seen. | Scores rise from familiarity, not skill. |
| Numbers | Every authored item has fixed numbers. | On a second exposure the candidate recognises the answer instead of working it out. |
| Parametric templates | 20 good templates exist, with none for Ethics. They are used **only** in the AI fallback, as `draft` content excluded from sprints and mocks. | The best randomisation tool in the codebase is not used where it would help most. |
| Leitner review | Re-shows the **same** item with the same option order and the same numbers, saved from the failed attempt. Box 3 tops out at 7 days and cards never leave it. | Candidates learn "it was C", not the concept. The deck grows forever. |

---

## 4. Does it get to the root of the problem?

The bank already encodes a misconception for each distractor ("B uses [BGN] mode", "C forgets the 1/2"). The app throws that information away:

- `ItemAttempt.errorMode` and the trap log use the item's `errorModeDefault`, which is the same whichever wrong option was picked. On item 102, choosing A (wrong calculator mode) and choosing C (double compounding) record the same error.
- The app never asks how confident the candidate was. A lucky guess counts the same as mastery, and a confidently wrong answer, which is the strongest sign of a misconception, is not separated from a careless slip.
- The candidate is never asked why they missed. The `ErrorMode` list already includes `READING_MISINTERPRETATION` and `BA2_MODE`, but the candidate never picks one.
- There is no item-level data across attempts, such as the share of candidates answering correctly or how often each distractor is chosen. That is the standard way to find bad items. Item 119 would show up immediately because the "wrong" option B would draw more answers than the key.

---

## 5. Recommendations

### P0: correctness (small effort, high trust impact)

1. Fix the items in section 1: the key for 119, the numbers for 101, 108, 310, 501 and 710, the mismatched explanations, the eight items that depend on case text, the wording of 1013, and the LOS codes and trap tags.
2. Generalise the existing check for item 111 into a **numeric verification test**. Give each computational item a small `verify()` function, or a list of inputs and a formula id, that recomputes the key *and each distractor*. The test fails when an option does not match its recomputed value to the displayed precision. This would have caught 119, 108, 501, 602, 604 and the others.
3. Add integrity tests for these rules:
   - Every LOS code falls inside its topic's declared range.
   - No stem refers to case data ("Apex", "Stock Delta", "Titan", "Year 1 fees") unless the item is in case mode.
   - The correct option is the longest one in no more than about 40% of conceptual items.
   - No topic has more than 50% of its keys on one authoring letter.

### P1: randomisation and exposure

4. **Track exposure per item** in the store: `seenCount`, `lastSeenAt`, `lastCorrect` and `streak`. Use it in one shared selector for practice, sprints and mocks, with this priority:
   1. Due Leitner items.
   2. Unseen items.
   3. Items missed earlier.
   4. Items not seen recently.
   5. Mastered items, rarely.
5. **Weight sprint draws** by exam topic weight × (1 − topic accuracy) instead of a uniform draw.
6. **Make Half Mock A and B disjoint.** Partition each topic's pool when Half A is generated, then draw Half B from the rest. Before every mock, show how many of its items the candidate has already seen ("62% of these items are new to you").
7. **Turn computational items into variant families.** Promote the template engine so that each numeric authored item has a generator that produces the same structure and trap with new numbers. Validate generators in CI by building many seeds and checking that the options are distinct, the key is correct and each distractor matches its intended error. Approve generators, not individual outputs, so their variants can appear in sprints, retries and Leitner review.
8. **Leitner fixes:**
   - Reshuffle the options on every review.
   - Use a fresh variant when one exists.
   - Carry the case data.
   - Extend to five boxes (1, 3, 7, 14, 30 days) and retire cards after the last box.

### P1: bank expansion

9. Grow each topic to 60–80 items, starting with the coverage gaps in section 2. Grow the 15-item topics first: Economics, Corporate Finance, Derivatives and Alternatives.
10. Rewrite the Ethics items as short scenarios with three plausible options of the form "No violation / Violation of I(B) / Violation of III(A)". Give them distinct trap categories, such as "gift vs. ordinary meal", "disclosure does not cure" and "mosaic vs MNPI".
11. Add multi-step items (two or three steps) and "least likely" items to every topic. Target roughly 40% recall, 40% application and 20% multi-step analysis.

### P2: finding the root cause

12. **Record an error mode per distractor.** Add `distractorErrorMode: { A?: ErrorMode; B?: ErrorMode; C?: ErrorMode }` to each item and record the mode of the option actually chosen. The analytics can then say "you selected the [BGN]/[END]-mode distractor 4 times this week" instead of naming a broad topic.
13. **Ask for confidence before revealing the answer** (sure, unsure or guess):
    - Confident and wrong: a misconception. Send the item to the topic guide and Leitner box 1.
    - Unsure and right: a lucky guess. Schedule a review rather than counting it as mastery.
    - Confident and right: mastery.
14. **Ask for a one-tap reason after a miss** (misread, calculator, concept, careless or time), with the distractor's tagged error preselected. The answer feeds trap analytics and suggests the next drill.
15. **Item statistics:** record the share answering correctly and the selection rate of each distractor, locally and optionally through sync. Flag items where a distractor beats the key (a probable key error) or the success rate is above 95% (too easy to be useful).
16. Add a `difficulty` field (1–3) and a `cognitiveLevel` field per item, and report readiness by difficulty, not only by topic.

### P3: AI generation

17. Before an AI-generated draft is shown, recompute its numeric answers in code, either by mapping it to a template formula or by having a second pass solve it independently. Ground the prompt in the real LOS statement from `curriculum.ts`. Randomise or remove the example key in the prompt. Make the `difficulty` parameter change the output, for example by requiring multi-step items for "High Trap".
18. Add a review queue so the candidate can promote validated drafts to `approved`. That makes good generated items eligible for sprints while mocks stay limited to authored content.

---

## Appendix: method

- The bank was dumped from the real `CFA_VIGNETTES` export through Vitest, and the statistics were computed from that dump: key distribution, trap and error-mode counts, LOS ranges, and how often the correct option is the longest.
- Every item's stem, options, key, solution and distractor explanations were read.
- Suspicious values were recalculated independently.
- Selection code reviewed: `createSession.ts`, `presentItem.ts`, `random.ts`, `eligibility.ts`, `mockExamGenerator.ts`, `InterleavedSprintModal.tsx`, `VignetteEngine.tsx`, `useCFAStore.ts` (Leitner) and `api/generate-vignette/route.ts`.
- The existing test suite passes. It does not check numeric correctness beyond item 111.

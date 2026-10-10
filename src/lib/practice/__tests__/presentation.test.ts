import { describe, it, expect } from "vitest";
import { CFA_VIGNETTES } from "@/data/vignettes";
import { legacyVignetteToPracticeItems } from "../adapters";
import { presentPracticeItem, remapOptionReferences } from "../presentItem";
import { createPracticeSession } from "../createSession";
import { createPRNG } from "../random";
import { hasCurrentAnswerKey } from "../eligibility";

describe("Option Presentation & Answer Permutation", () => {
  const quantVignette = CFA_VIGNETTES[0];
  const items = legacyVignetteToPracticeItems(quantVignette);
  const testItem = items[0];

  it("remaps options, correctOption, and distractor feedback coherently", () => {
    const prng = createPRNG("test-seed-42");
    const presented = presentPracticeItem(testItem, "session-1", 1, prng);

    // The displayed correct option must point to the original correct option's text
    const originalCorrectText = testItem.options[testItem.correctOption];
    const presentedCorrectText = presented.options[presented.correctOption];
    expect(presentedCorrectText).toBe(originalCorrectText);

    // Feedback for the presented correct option must match original correct feedback
    const originalCorrectFeedback = testItem.distractorFeedback[testItem.correctOption];
    const presentedCorrectFeedback = presented.distractorFeedback[presented.correctOption];
    expect(presentedCorrectFeedback).toBe(originalCorrectFeedback);

    // Source item remains completely unmodified
    expect(testItem.correctOption).toBe("B");
  });

  it("rewrites distractor letter references to match the displayed order", () => {
    for (const item of items) {
      const presented = presentPracticeItem(item, "session-letters", 1, createPRNG(`letters-${item.id}`));
      (["A", "B", "C"] as const).forEach((displayed) => {
        const match = presented.distractorFeedback[displayed].match(/^Distractor ([ABC])\b/);
        if (match) expect(match[1]).toBe(displayed);
      });
    }
  });

  it("remaps only explicit option references", () => {
    const mapping = { A: "C", B: "A", C: "B" } as const;
    expect(remapOptionReferences("Distractor A ignores compounding; Portfolio A is unchanged.", mapping))
      .toBe("Distractor C ignores compounding; Portfolio A is unchanged.");
  });

  it("is deterministic when given the same seed", () => {
    const session1 = createPracticeSession({
      mode: "practice",
      items,
      seed: "identical-seed-12345",
    });

    const session2 = createPracticeSession({
      mode: "practice",
      items,
      seed: "identical-seed-12345",
    });

    expect(session1.presentedItems.length).toBe(session2.presentedItems.length);
    for (let i = 0; i < session1.presentedItems.length; i++) {
      expect(session1.presentedItems[i].correctOption).toBe(session2.presentedItems[i].correctOption);
      expect(session1.presentedItems[i].options).toEqual(session2.presentedItems[i].options);
      expect(session1.presentedItems[i].distractorFeedback).toEqual(session2.presentedItems[i].distractorFeedback);
    }
  });

  it("honours requested question count", () => {
    const session = createPracticeSession({
      mode: "practice",
      items,
      requestedCount: 5,
      seed: "count-test-seed",
    });

    expect(session.presentedItems.length).toBe(5);
    expect(session.itemIds.length).toBe(5);
  });

  it("rejects an unfinished saved session with the corrected old answer key", () => {
    const item = items.find((candidate) => candidate.id.endsWith(":111"))!;
    const current = createPracticeSession({ mode: "practice", items: [item] });
    expect(hasCurrentAnswerKey(current)).toBe(true);
    const outdated = {
      ...current,
      presentedItems: current.presentedItems.map((presented) => ({
        ...presented,
        solution: "81 + 100 + 36 = 193.5",
      })),
    };
    expect(hasCurrentAnswerKey(outdated)).toBe(false);
    expect(hasCurrentAnswerKey({
      ...outdated,
      presentedItems: outdated.presentedItems.map((presented) => ({
        ...presented,
        sourceItemId: "authored:vignette-01-quant-expanded-123:111",
      })),
    })).toBe(false);
  });

  it("orders options like the exam: numbers ascending, words shortest to longest", () => {
    const numeric = presentPracticeItem(
      { ...testItem, options: { A: "$1,026.73", B: "-$4.50", C: "$973.27" }, correctOption: "C" },
      "session-order",
      1
    );
    expect(Object.values(numeric.options)).toEqual(["-$4.50", "$973.27", "$1,026.73"]);
    expect(numeric.options[numeric.correctOption]).toBe("$973.27");

    const words = presentPracticeItem(
      { ...testItem, options: { A: "Increases bank reserves a lot", B: "Raises rates", C: "Cuts reserves" }, correctOption: "A" },
      "session-order",
      2
    );
    expect(Object.values(words.options)).toEqual(["Raises rates", "Cuts reserves", "Increases bank reserves a lot"]);
    expect(words.correctOption).toBe("C");
  });

  it("keeps the correct answer spread across A, B and C over the whole bank", () => {
    const counts = { A: 0, B: 0, C: 0 };
    const all = CFA_VIGNETTES.flatMap((vignette) => legacyVignetteToPracticeItems(vignette));
    all.forEach((item) => {
      counts[presentPracticeItem(item, "session-balance", 1).correctOption]++;
    });
    (["A", "B", "C"] as const).forEach((key) => {
      const pct = (counts[key] / all.length) * 100;
      expect(pct).toBeGreaterThan(25);
      expect(pct).toBeLessThan(42);
    });
  });

});

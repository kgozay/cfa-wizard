import { describe, it, expect } from "vitest";
import { CFA_VIGNETTES } from "@/data/vignettes";
import { legacyVignetteToPracticeItems } from "../adapters";
import { presentPracticeItem } from "../presentItem";
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

  it("eliminates Option A bias across random presentations (statistical integrity test)", () => {
    // Generate 600 presented items across various seeds
    const counts = { A: 0, B: 0, C: 0 };
    const totalSamples = 600;

    for (let i = 0; i < totalSamples; i++) {
      const prng = createPRNG(`sample-seed-${i}`);
      // Use an item where original authoring key is A
      const presented = presentPracticeItem(items[2], `session-${i}`, 1, prng);
      counts[presented.correctOption]++;
    }

    const pctA = (counts.A / totalSamples) * 100;
    const pctB = (counts.B / totalSamples) * 100;
    const pctC = (counts.C / totalSamples) * 100;

    // Expected ~33.3% each; tolerance 25% to 42%
    expect(pctA).toBeGreaterThan(25);
    expect(pctA).toBeLessThan(42);

    expect(pctB).toBeGreaterThan(25);
    expect(pctB).toBeLessThan(42);

    expect(pctC).toBeGreaterThan(25);
    expect(pctC).toBeLessThan(42);
  });
});

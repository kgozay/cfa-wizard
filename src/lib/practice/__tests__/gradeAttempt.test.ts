import { describe, it, expect } from "vitest";
import { CFA_VIGNETTES } from "@/data/vignettes";
import { legacyVignetteToPracticeItems } from "../adapters";
import { createPracticeSession } from "../createSession";
import { gradeAttempt } from "../gradeAttempt";

describe("Attempt Grading & Timing Integrity", () => {
  const items = legacyVignetteToPracticeItems(CFA_VIGNETTES[0]);
  const session = createPracticeSession({
    mode: "practice",
    items,
    requestedCount: 3,
    seed: "grading-test-seed",
  });

  it("grades correctly and counts unanswered/timed-out items as incorrect", () => {
    const p1 = session.presentedItems[0];
    const p2 = session.presentedItems[1];
    const p3 = session.presentedItems[2];

    // Item 1: correct answer
    // Item 2: incorrect answer
    // Item 3: timed out (null / not answered)
    const answers = {
      [p1.sessionItemId]: p1.correctOption,
      [p2.sessionItemId]: (p2.correctOption === "A" ? "B" : "A") as "A" | "B" | "C",
      [p3.sessionItemId]: null,
    };

    const timing = {
      [p1.sessionItemId]: 35,
      [p2.sessionItemId]: 65,
      [p3.sessionItemId]: 90,
    };

    const attempt = gradeAttempt({
      session,
      answers,
      timing,
    });

    expect(attempt.score).toBe(1);
    expect(attempt.total).toBe(3);
    expect(attempt.totalTimeSeconds).toBe(190);

    // Item 1 is correct
    expect(attempt.itemAttempts[0].isCorrect).toBe(true);
    expect(attempt.itemAttempts[0].timedOut).toBe(false);
    expect(attempt.itemAttempts[0].timeSpentSeconds).toBe(35);

    // Item 2 is incorrect
    expect(attempt.itemAttempts[1].isCorrect).toBe(false);
    expect(attempt.itemAttempts[1].timedOut).toBe(false);
    expect(attempt.itemAttempts[1].timeSpentSeconds).toBe(65);

    // Item 3 timed out
    expect(attempt.itemAttempts[2].isCorrect).toBe(false);
    expect(attempt.itemAttempts[2].timedOut).toBe(true);
    expect(attempt.itemAttempts[2].selectedOption).toBeNull();
    expect(attempt.itemAttempts[2].timeSpentSeconds).toBe(90);
  });

  it("preserves individual per-item timing without session-wide copy", () => {
    const timing = {
      [session.presentedItems[0].sessionItemId]: 12,
      [session.presentedItems[1].sessionItemId]: 45,
      [session.presentedItems[2].sessionItemId]: 78,
    };

    const attempt = gradeAttempt({
      session,
      answers: {},
      timing,
    });

    expect(attempt.itemAttempts[0].timeSpentSeconds).toBe(12);
    expect(attempt.itemAttempts[1].timeSpentSeconds).toBe(45);
    expect(attempt.itemAttempts[2].timeSpentSeconds).toBe(78);
    expect(attempt.totalTimeSeconds).toBe(135);
  });
});

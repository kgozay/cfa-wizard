import { describe, it, expect } from "vitest";
import { generateMockExamSession } from "../mockExamGenerator";

describe("Mock Exam Integrity", () => {
  it("generates quick diagnostic mock with unique question IDs and sessionItemIds", () => {
    const mock = generateMockExamSession("quick_diagnostic_45");

    expect(mock.questions.length).toBe(45);
    expect(mock.totalQuestions).toBe(45);

    const ids = new Set(mock.questions.map((q) => q.id));
    expect(ids.size).toBe(45);

    const sessionItemIds = new Set(mock.questions.map((q) => q.sessionItemId));
    expect(sessionItemIds.size).toBe(45);
  });

  it("removes Option A bias in generated mock exam options", () => {
    // Generate a full 180 mock exam session
    const mock = generateMockExamSession("full_180");
    expect(mock.questions.length).toBe(180);

    const counts = { A: 0, B: 0, C: 0 };
    mock.questions.forEach((q) => {
      counts[q.correctOption]++;
    });

    const pctA = (counts.A / 180) * 100;
    const pctB = (counts.B / 180) * 100;
    const pctC = (counts.C / 180) * 100;

    // In a full 180 mock with permuted options, each option should be reasonably balanced (~33.3%).
    // No option should be > 55% or < 15%.
    expect(pctA).toBeLessThan(55);
    expect(pctA).toBeGreaterThan(15);

    expect(pctB).toBeLessThan(55);
    expect(pctB).toBeGreaterThan(15);

    expect(pctC).toBeLessThan(55);
    expect(pctC).toBeGreaterThan(15);
  });
});

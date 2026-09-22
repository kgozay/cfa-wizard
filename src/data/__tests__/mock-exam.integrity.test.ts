import { describe, it, expect } from "vitest";
import { generateMockExamSession, getMockExamShortages } from "../mockExamGenerator";
import { getMockElapsedSeconds, getMockRemainingSeconds } from "@/lib/practice/mockTiming";

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
    const mock = generateMockExamSession("quick_diagnostic_45");

    const counts = { A: 0, B: 0, C: 0 };
    mock.questions.forEach((q) => {
      counts[q.correctOption]++;
    });

    const pctA = (counts.A / mock.questions.length) * 100;
    const pctB = (counts.B / mock.questions.length) * 100;
    const pctC = (counts.C / mock.questions.length) * 100;

    // In a full 180 mock with permuted options, each option should be reasonably balanced (~33.3%).
    // No option should be > 55% or < 15%.
    expect(pctA).toBeLessThan(55);
    expect(pctA).toBeGreaterThan(15);

    expect(pctB).toBeLessThan(55);
    expect(pctB).toBeGreaterThan(15);

    expect(pctC).toBeLessThan(55);
    expect(pctC).toBeGreaterThan(15);
  });

  it("rejects mock sizes that would require repeated source questions", () => {
    expect(getMockExamShortages("quick_diagnostic_45")).toEqual([]);
    expect(getMockExamShortages("half_session_1").length).toBeGreaterThan(0);
    expect(getMockExamShortages("half_session_2").length).toBeGreaterThan(0);
    expect(getMockExamShortages("full_180").length).toBeGreaterThan(0);
    expect(() => generateMockExamSession("full_180")).toThrow(/without repeating questions/);
  });

  it("ends mock time at the deadline even after a page has been closed", () => {
    const session = {
      startedAt: "2026-01-01T00:00:00.000Z",
      allocatedMinutes: 68,
      timeSpentSeconds: 0,
    };
    expect(getMockRemainingSeconds(session, Date.parse(session.startedAt) + 60_000)).toBe(4020);
    expect(getMockRemainingSeconds(session, Date.parse(session.startedAt) + 4_080_000)).toBe(0);
    expect(getMockElapsedSeconds(session, Date.parse(session.startedAt) + 8_000_000)).toBe(4080);
  });
});

import { describe, expect, it } from "vitest";
import { CFA_VIGNETTES } from "@/data/vignettes";
import { expectedNewQuestions, generateMockExamSession, MOCK_TOPIC_QUOTAS } from "@/data/mockExamGenerator";
import { legacyVignetteToPracticeItems } from "../adapters";
import { buildExposureIndex, ExposureIndex } from "../exposure";
import { allocateByWeakness, selectItems, weightMidpoint } from "../selectItems";
import { createPRNG } from "../random";
import { PracticeAttempt } from "@/types/practice";

const quant = legacyVignetteToPracticeItems(CFA_VIGNETTES[0]);

const attemptFor = (entries: Array<[string, boolean]>, submittedAt: string): PracticeAttempt => ({
  id: `attempt-${submittedAt}`,
  sessionId: `session-${submittedAt}`,
  mode: "practice",
  startedAt: submittedAt,
  submittedAt,
  totalTimeSeconds: 0,
  score: entries.filter(([, ok]) => ok).length,
  total: entries.length,
  topicIds: ["01"],
  itemAttempts: entries.map(([sourceItemId, isCorrect], index) => ({
    id: `${submittedAt}-${index}`,
    sessionId: `session-${submittedAt}`,
    sessionItemId: `session-${submittedAt}:${index}`,
    sourceItemId,
    topicId: "01",
    selectedOption: "A",
    correctOption: isCorrect ? "A" : "B",
    isCorrect,
    timedOut: false,
    timeSpentSeconds: 30,
    submittedAt,
  })),
});

describe("buildExposureIndex", () => {
  it("tracks counts, recency and the current correct streak", () => {
    const id = quant[0].id;
    const index = buildExposureIndex([
      attemptFor([[id, true]], "2026-10-03T00:00:00.000Z"),
      attemptFor([[id, false]], "2026-10-01T00:00:00.000Z"),
      attemptFor([[id, true]], "2026-10-02T00:00:00.000Z"),
    ]);
    expect(index[id]).toEqual({
      seenCount: 3,
      correctCount: 2,
      lastSeenAt: "2026-10-03T00:00:00.000Z",
      lastCorrect: true,
      correctStreak: 2,
    });
  });
});

describe("selectItems", () => {
  const [due, missed, mastered, stale, ...unseen] = quant;
  const exposure: ExposureIndex = {
    [due.id]: { seenCount: 1, correctCount: 0, lastSeenAt: "2026-10-01", lastCorrect: false, correctStreak: 0 },
    [missed.id]: { seenCount: 1, correctCount: 0, lastSeenAt: "2026-10-01", lastCorrect: false, correctStreak: 0 },
    [mastered.id]: { seenCount: 3, correctCount: 3, lastSeenAt: "2026-09-01", lastCorrect: true, correctStreak: 3 },
    [stale.id]: { seenCount: 1, correctCount: 1, lastSeenAt: "2026-10-01", lastCorrect: true, correctStreak: 1 },
  };

  it("orders due reviews, unseen, missed, then seen-once and mastered items", () => {
    const picked = selectItems(quant, {
      count: quant.length,
      exposure,
      dueItemIds: new Set([due.id]),
      prng: createPRNG("order"),
    });
    expect(picked[0].id).toBe(due.id);
    expect(new Set(picked.slice(1, 1 + unseen.length).map((item) => item.id))).toEqual(new Set(unseen.map((item) => item.id)));
    expect(picked.slice(-3).map((item) => item.id)).toEqual([missed.id, stale.id, mastered.id]);
  });

  it("favours new items for mocks and ignores due reviews", () => {
    const picked = selectItems(quant, {
      count: unseen.length,
      exposure,
      dueItemIds: new Set([due.id]),
      policy: "fresh",
      prng: createPRNG("fresh"),
    });
    expect(new Set(picked.map((item) => item.id))).toEqual(new Set(unseen.map((item) => item.id)));
  });

  it("only reuses excluded items when the pool runs out", () => {
    const excluded = new Set(quant.slice(0, quant.length - 3).map((item) => item.id));
    const picked = selectItems(quant, { count: 5, exposure: {}, excludeItemIds: excluded, prng: createPRNG("x") });
    expect(picked.slice(0, 3).every((item) => !excluded.has(item.id))).toBe(true);
    expect(picked).toHaveLength(5);
  });
});

describe("allocateByWeakness", () => {
  it("fills every slot and leans towards heavy, weak topics", () => {
    const prng = createPRNG("alloc");
    const totals: Record<string, number> = { weak: 0, strong: 0 };
    for (let round = 0; round < 200; round++) {
      const allocation = allocateByWeakness(
        [
          { topicId: "weak", examWeight: 12.5, accuracy: 0.4, available: 50 },
          { topicId: "strong", examWeight: 12.5, accuracy: 0.95, available: 50 },
        ],
        10,
        prng
      );
      expect((allocation.weak ?? 0) + (allocation.strong ?? 0)).toBe(10);
      totals.weak += allocation.weak ?? 0;
      totals.strong += allocation.strong ?? 0;
    }
    expect(totals.weak).toBeGreaterThan(totals.strong * 2);
    expect(totals.strong).toBeGreaterThan(0);
  });

  it("never allocates more than a topic holds", () => {
    const allocation = allocateByWeakness([{ topicId: "a", examWeight: 10, available: 2 }], 5, createPRNG("cap"));
    expect(allocation).toEqual({ a: 2 });
  });

  it("reads curriculum weight bands", () => {
    expect(weightMidpoint("11–14%")).toBe(12.5);
    expect(weightMidpoint("6–9%")).toBe(7.5);
  });
});

describe("mock selection", () => {
  it("keeps Half Mock B clear of the latest Half Mock A", () => {
    const halfA = generateMockExamSession("half_session_1", [], { seed: "a" });
    const halfB = generateMockExamSession("half_session_2", [], {
      seed: "b",
      excludeItemIds: new Set(halfA.practiceSession.itemIds),
    });
    const overlap = halfB.practiceSession.itemIds.filter((id) => halfA.practiceSession.itemIds.includes(id));
    expect(overlap).toEqual([]);
    expect(halfA.practiceSession.mockExamType).toBe("half_session_1");
  });

  it("prefers questions the candidate has not seen", () => {
    const first = generateMockExamSession("quick_diagnostic_45", [], { seed: "first" });
    const exposure: ExposureIndex = Object.fromEntries(
      first.practiceSession.itemIds.map((id) => [
        id,
        { seenCount: 1, correctCount: 1, lastSeenAt: "2026-10-01", lastCorrect: true, correctStreak: 1 },
      ])
    );
    const second = generateMockExamSession("quick_diagnostic_45", [], { seed: "second", exposure });
    const repeats = second.practiceSession.itemIds.filter((id) => exposure[id]).length;
    const expectedNew = expectedNewQuestions("quick_diagnostic_45", exposure);
    expect(second.totalQuestions - repeats).toBe(expectedNew);
    const quota = Object.values(MOCK_TOPIC_QUOTAS.quick_diagnostic_45).reduce((a, b) => a + b, 0);
    expect(expectedNewQuestions("quick_diagnostic_45", {})).toBe(quota);
  });
});

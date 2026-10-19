import { describe, expect, it } from "vitest";
import { buildItemStats, flagItems } from "../itemStats";
import { ItemAttempt, OptionKey, PracticeAttempt } from "@/types/practice";

type Pick = { id: string; chose: OptionKey | null | undefined; key: OptionKey; variantSeed?: string };

const attempt = (picks: Pick[]): PracticeAttempt => ({
  id: "attempt",
  sessionId: "session",
  mode: "practice",
  startedAt: "2026-10-01T00:00:00.000Z",
  submittedAt: "2026-10-01T00:00:00.000Z",
  totalTimeSeconds: 0,
  score: 0,
  total: picks.length,
  topicIds: ["08"],
  itemAttempts: picks.map((pick, index): ItemAttempt => ({
    id: `item-${index}`,
    sessionId: "session",
    sessionItemId: `session:${index}`,
    sourceItemId: pick.id,
    topicId: "08",
    // The presented letter is shuffled; only selectedSourceOption is in authoring letters
    selectedOption: "C",
    correctOption: "A",
    isCorrect: pick.chose === pick.key,
    timedOut: pick.chose === null,
    timeSpentSeconds: 30,
    submittedAt: "2026-10-01T00:00:00.000Z",
    ...(pick.chose !== undefined ? { selectedSourceOption: pick.chose } : {}),
    ...(pick.variantSeed ? { variantSeed: pick.variantSeed } : {}),
  })),
});

const repeat = (count: number, pick: Pick) => Array.from({ length: count }, () => pick);
const keys: Record<string, OptionKey> = { wrongKey: "B", easy: "C", fine: "A" };

describe("buildItemStats", () => {
  it("counts selections in authoring letters and skips variant attempts", () => {
    const stats = buildItemStats([
      attempt([
        { id: "fine", chose: "A", key: "A" },
        { id: "fine", chose: "B", key: "A" },
        { id: "fine", chose: null, key: "A" },
        { id: "fine", chose: undefined, key: "A" },
        { id: "fine", chose: "C", key: "A", variantSeed: "retake-1" },
      ]),
    ]);
    expect(stats.fine).toMatchObject({ attempts: 4, correct: 1, lettered: 3, unanswered: 1, selections: { A: 1, B: 1, C: 0 } });
    expect(stats.fine.successRate).toBeCloseTo(0.25);
  });
});

describe("flagItems", () => {
  const stats = buildItemStats([
    attempt([
      ...repeat(4, { id: "wrongKey", chose: "C", key: "B" }),
      ...repeat(2, { id: "wrongKey", chose: "B", key: "B" }),
      ...repeat(12, { id: "easy", chose: "C", key: "C" }),
      ...repeat(3, { id: "fine", chose: "A", key: "A" }),
      ...repeat(3, { id: "fine", chose: "B", key: "A" }),
    ]),
  ]);
  const flags = flagItems(stats, (id) => keys[id]);

  it("flags a distractor chosen more often than the key", () => {
    expect(flags[0]).toMatchObject({ kind: "distractor-beats-key", sourceItemId: "wrongKey", distractor: "C", attempts: 6 });
  });

  it("flags items answered correctly more than 95% of the time", () => {
    expect(flags).toContainEqual(expect.objectContaining({ kind: "too-easy", sourceItemId: "easy", attempts: 12 }));
  });

  it("leaves items with a tie or too little evidence alone", () => {
    expect(flags.filter((flag) => flag.sourceItemId === "fine")).toEqual([]);
    const thin = buildItemStats([attempt(repeat(4, { id: "wrongKey", chose: "C", key: "B" }))]);
    expect(flagItems(thin, (id) => keys[id])).toEqual([]);
  });
});

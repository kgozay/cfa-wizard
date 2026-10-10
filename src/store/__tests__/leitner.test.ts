import { describe, it, expect } from "vitest";
import { upsertLeitnerCards } from "../useCFAStore";
import type { TrapLogEntry } from "@/types/cfa";

const miss = (id: string, sourceItemId: string): TrapLogEntry => ({
  id,
  topicId: "01",
  topicName: "Quantitative Methods",
  trapName: "Compounding",
  questionStem: "What is the EAR?",
  options: { A: "8.0%", B: "8.3%", C: "8.7%" },
  correctOption: "B",
  autopsyExplanation: "Distractor A ignores compounding.",
  solution: "EAR = (1 + r/m)^m - 1",
  timestamp: "2026-10-01T00:00:00.000Z",
  sourceItemId,
});

describe("upsertLeitnerCards", () => {
  it("routes each missed question into Box 1 and makes it due", () => {
    const cards = upsertLeitnerCards([], [miss("t1", "item-1"), miss("t2", "item-2")]);
    expect(cards).toHaveLength(2);
    expect(cards.every((card) => card.box === 1)).toBe(true);
    expect(Date.parse(cards[0].nextReviewAt)).toBeLessThanOrEqual(Date.now());
    expect(cards[0].solution).toBe("EAR = (1 + r/m)^m - 1");
  });

  it("resets an existing card instead of duplicating a repeated miss", () => {
    const [card] = upsertLeitnerCards([], [miss("t1", "item-1")]);
    const promoted = { ...card, box: 3 as const, reviewCount: 4 };
    const cards = upsertLeitnerCards([promoted], [miss("t9", "item-1")]);
    expect(cards).toHaveLength(1);
    expect(cards[0]).toMatchObject({ id: card.id, box: 1, reviewCount: 4, trapLogId: "t9" });
  });
});

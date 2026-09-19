import { describe, it, expect } from "vitest";
import { getTopicPresentation } from "../topicPresentation";
import { PracticeAttempt } from "@/types/practice";

const makeAttempt = (
  topicId: string,
  scores: boolean[],
  containsDraftContent = false
): PracticeAttempt => ({
  id: `att-${Math.random()}`,
  sessionId: "sess-1",
  mode: "practice",
  startedAt: new Date().toISOString(),
  submittedAt: new Date().toISOString(),
  totalTimeSeconds: 120,
  score: scores.filter(Boolean).length,
  total: scores.length,
  topicIds: [topicId],
  containsDraftContent,
  itemAttempts: scores.map((isCorrect, idx) => ({
    id: `item-${idx}`,
    sessionId: "sess-1",
    sessionItemId: `sitem-${idx}`,
    sourceItemId: `src-${idx}`,
    topicId,
    selectedOption: "A",
    correctOption: isCorrect ? "A" : "B",
    isCorrect,
    timedOut: false,
    timeSpentSeconds: 20,
    submittedAt: new Date().toISOString(),
  })),
});

describe("getTopicPresentation", () => {
  it("returns not-started when there are no attempts", () => {
    const res = getTopicPresentation({
      topicId: "01",
      activeTopicId: null,
      inProgressTopicId: null,
      completedTopicIds: [],
      practiceAttempts: [],
    });
    expect(res.state).toBe("not-started");
    expect(res.eligibleItemCount).toBe(0);
    expect(res.latestScore).toBeUndefined();
  });

  it("prioritizes current when activeTopicId matches", () => {
    const res = getTopicPresentation({
      topicId: "01",
      activeTopicId: "01",
      inProgressTopicId: null,
      completedTopicIds: ["01"],
      practiceAttempts: [makeAttempt("01", [false, false, false, false, false])],
    });
    expect(res.state).toBe("current");
    expect(res.isCompleted).toBe(true);
    expect(res.isCurrent).toBe(true);
  });

  it("identifies needs-review when >=5 eligible items and accuracy < 70%", () => {
    const res = getTopicPresentation({
      topicId: "02",
      activeTopicId: "01",
      inProgressTopicId: null,
      completedTopicIds: [],
      practiceAttempts: [makeAttempt("02", [true, false, false, false, true])], // 2/5 = 40%
    });
    expect(res.state).toBe("needs-review");
    expect(res.latestScore).toBe(2);
    expect(res.latestTotal).toBe(5);
    expect(res.latestAccuracy).toBe(40);
  });

  it("does not trigger needs-review if fewer than 5 eligible items", () => {
    const res = getTopicPresentation({
      topicId: "03",
      activeTopicId: "01",
      inProgressTopicId: null,
      completedTopicIds: [],
      practiceAttempts: [makeAttempt("03", [false, false])], // 2 items < 5
    });
    expect(res.state).toBe("started");
    expect(res.eligibleItemCount).toBe(2);
  });

  it("ignores draft content attempts for statistics and state determination", () => {
    const res = getTopicPresentation({
      topicId: "04",
      activeTopicId: "01",
      inProgressTopicId: null,
      completedTopicIds: [],
      practiceAttempts: [
        makeAttempt("04", [false, false, false, false, false], true), // draft attempt
      ],
    });
    expect(res.state).toBe("not-started");
    expect(res.eligibleItemCount).toBe(0);
  });

  it("identifies completed state when topicId is in completedTopicIds", () => {
    const res = getTopicPresentation({
      topicId: "05",
      activeTopicId: "01",
      inProgressTopicId: null,
      completedTopicIds: ["05"],
      practiceAttempts: [makeAttempt("05", [true, true, true, true, true])], // 100%
    });
    expect(res.state).toBe("completed");
    expect(res.latestAccuracy).toBe(100);
    expect(res.isCompleted).toBe(true);
  });
});

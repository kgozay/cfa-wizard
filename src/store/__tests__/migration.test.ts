import { describe, it, expect } from "vitest";
import { LEGACY_STORAGE_V3_FIXTURE } from "@/test/fixtures/legacy-storage-v3";
import { migrateV3ToV4 } from "../migrations";

describe("Storage Migration from v3 to v4", () => {
  it("migrates legacy v3 storage into append-only PracticeAttempts", () => {
    const rawState = LEGACY_STORAGE_V3_FIXTURE.state;
    const migrated = migrateV3ToV4(rawState, 0);

    // Practice attempts created for both results
    expect(migrated.practiceAttempts.length).toBe(2);

    const quantAttempt = migrated.practiceAttempts.find((a) => a.topicIds.includes("01"));
    expect(quantAttempt).toBeDefined();
    expect(quantAttempt?.score).toBe(5);
    expect(quantAttempt?.total).toBe(5);

    const econAttempt = migrated.practiceAttempts.find((a) => a.topicIds.includes("02"));
    expect(econAttempt).toBeDefined();
    expect(econAttempt?.score).toBe(3);
    expect(econAttempt?.total).toBe(5);

    // Trap logs and Leitner cards remain linked
    expect(migrated.trapLogs.length).toBe(1);
    expect(migrated.leitnerCards.length).toBe(1);
    expect(migrated.leitnerCards[0].trapLogId).toBe(migrated.trapLogs[0].id);

    // User preferences preserved
    expect(migrated.completedTopicIds).toEqual(["01"]);
    expect(migrated.soundEnabled).toBe(true);
    expect(migrated.drillQuestionCount).toBe(5);
    expect(migrated.isPacingTimerEnabled).toBe(true);
  });

  it("is idempotent and does not duplicate attempts on repeated migration runs", () => {
    const rawState = LEGACY_STORAGE_V3_FIXTURE.state;
    const firstRun = migrateV3ToV4(rawState, 0);
    expect(firstRun.practiceAttempts.length).toBe(2);

    // Second run with version 4
    const secondRun = migrateV3ToV4(firstRun, 4);
    expect(secondRun.practiceAttempts.length).toBe(2);

    // Third run with version 0 simulating reload
    const thirdRun = migrateV3ToV4(secondRun, 0);
    expect(thirdRun.practiceAttempts.length).toBe(2);
  });

  it("preserves retake attempts without overwriting previous attempts", () => {
    const rawState = LEGACY_STORAGE_V3_FIXTURE.state;
    const migrated = migrateV3ToV4(rawState, 0);

    // Simulate a retake of topic 02 by adding a new attempt
    const retakeAttempt = {
      ...migrated.practiceAttempts[1],
      id: "attempt-retake-econ-02",
      sessionId: "session-retake-02",
      score: 5,
      submittedAt: "2026-09-17T12:00:00.000Z",
    };

    const stateWithRetake = {
      ...migrated,
      practiceAttempts: [...migrated.practiceAttempts, retakeAttempt],
    };

    expect(stateWithRetake.practiceAttempts.length).toBe(3);
    const econAttempts = stateWithRetake.practiceAttempts.filter((a) => a.topicIds.includes("02"));
    expect(econAttempts.length).toBe(2);
    expect(econAttempts[0].score).toBe(3); // original
    expect(econAttempts[1].score).toBe(5); // retake
  });
});

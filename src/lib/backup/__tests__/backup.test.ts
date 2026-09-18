import { describe, it, expect } from "vitest";
import { validateBackupPayload } from "../schema";
import { LEGACY_STORAGE_V3_FIXTURE } from "@/test/fixtures/legacy-storage-v3";

describe("Backup Envelope Validation", () => {
  it("validates a modern v4 backup payload correctly", () => {
    const v4Payload = {
      exportVersion: "4.0",
      exportedAt: new Date().toISOString(),
      completedTopicIds: ["01", "02"],
      inProgressTopicId: "03",
      vignetteResults: {},
      practiceAttempts: [
        {
          id: "att-12345",
          sessionId: "sess-123",
          mode: "practice" as const,
          startedAt: new Date().toISOString(),
          submittedAt: new Date().toISOString(),
          totalTimeSeconds: 45,
          score: 1,
          total: 1,
          topicIds: ["01"],
          itemAttempts: [
            {
              id: "item-att-1",
              sessionId: "sess-123",
              sessionItemId: "sess-q1",
              sourceItemId: "cfa-l1-01-q1",
              topicId: "01",
              selectedOption: "B" as const,
              correctOption: "B" as const,
              isCorrect: true,
              timedOut: false,
              timeSpentSeconds: 45,
              submittedAt: new Date().toISOString(),
            },
          ],
        },
      ],
      practiceSessions: {},
      activePracticeSessionId: null,
      trapLogs: [],
      customVignettes: [],
      leitnerCards: [],
    };

    const res = validateBackupPayload(v4Payload);
    expect(res.success).toBe(true);
    expect(res.data?.practiceAttempts.length).toBe(1);
    expect(res.data?.completedTopicIds).toEqual(["01", "02"]);
  });

  it("validates a legacy v3 backup payload without practiceAttempts", () => {
    const v3Payload = {
      exportVersion: "3.0",
      exportedAt: new Date().toISOString(),
      completedTopicIds: LEGACY_STORAGE_V3_FIXTURE.state.completedTopicIds,
      vignetteResults: LEGACY_STORAGE_V3_FIXTURE.state.vignetteResults,
      trapLogs: LEGACY_STORAGE_V3_FIXTURE.state.trapLogs,
      customVignettes: LEGACY_STORAGE_V3_FIXTURE.state.customVignettes,
      leitnerCards: LEGACY_STORAGE_V3_FIXTURE.state.leitnerCards,
    };

    const res = validateBackupPayload(v3Payload);
    expect(res.success).toBe(true);
    expect(res.data?.exportVersion).toBe("3.0");
    expect(res.data?.completedTopicIds).toEqual(LEGACY_STORAGE_V3_FIXTURE.state.completedTopicIds);
    expect(res.data?.practiceAttempts).toEqual([]);
  });

  it("rejects non-object or malformed backup payloads", () => {
    expect(validateBackupPayload(null).success).toBe(false);
    expect(validateBackupPayload("not a json").success).toBe(false);
    expect(validateBackupPayload([]).success).toBe(false);
  });

  it("rejects corrupted backups missing critical version or date metadata", () => {
    const corruptPayload = {
      completedTopicIds: ["01"],
    };
    const res = validateBackupPayload(corruptPayload);
    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();
  });
});

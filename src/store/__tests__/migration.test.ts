import { describe, it, expect } from "vitest";
import { LEGACY_STORAGE_V3_FIXTURE } from "@/test/fixtures/legacy-storage-v3";

describe("Legacy Storage Fixture & Baseline", () => {
  it("validates the structure of the legacy v3 persisted storage fixture", () => {
    const { state, version } = LEGACY_STORAGE_V3_FIXTURE;

    expect(version).toBe(0);
    expect(state.completedTopicIds).toContain("01");
    expect(state.inProgressTopicId).toBe("02");

    // Has a passing and failing result
    const results = Object.values(state.vignetteResults);
    expect(results.length).toBe(2);

    const passing = state.vignetteResults["vignette-quant-01"];
    expect(passing.score).toBe(5);
    expect(passing.total).toBe(5);

    const failing = state.vignetteResults["vignette-econ-01"];
    expect(failing.score).toBe(3);
    expect(failing.trapsTriggered.length).toBeGreaterThan(0);

    // Trap logs exist and link to question and error mode
    expect(state.trapLogs.length).toBe(1);
    expect(state.trapLogs[0].errorMode).toBe("SIGN_INVERSION");

    // Leitner card exists and links to the trap
    expect(state.leitnerCards.length).toBe(1);
    expect(state.leitnerCards[0].trapLogId).toBe(state.trapLogs[0].id);

    // Custom vignette exists
    expect(state.customVignettes.length).toBe(1);
  });
});

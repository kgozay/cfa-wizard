import { describe, it, expect } from "vitest";
import { CFA_VIGNETTES } from "@/data/vignettes";
import {
  legacyVignetteToPracticeItems,
  legacyResultToPracticeAttempt,
  practiceItemToLegacyQuestion,
} from "../adapters";
import { PracticeItemSchema } from "../schema";
import { LEGACY_STORAGE_V3_FIXTURE } from "@/test/fixtures/legacy-storage-v3";

describe("Legacy Adapters", () => {
  it("converts all authored CFA_VIGNETTES into valid PracticeItems", () => {
    let totalConverted = 0;
    for (const vignette of CFA_VIGNETTES) {
      const items = legacyVignetteToPracticeItems(vignette);
      expect(items.length).toBe(vignette.questions.length);

      for (const item of items) {
        const parseResult = PracticeItemSchema.safeParse(item);
        if (!parseResult.success) {
          console.error("Validation error for item:", item.id, parseResult.error.issues);
        }
        expect(parseResult.success).toBe(true);
        totalConverted++;
      }
    }
    expect(totalConverted).toBe(150);
  });

  it("converts legacy VignetteSessionResult into a canonical PracticeAttempt", () => {
    const legacyResult = LEGACY_STORAGE_V3_FIXTURE.state.vignetteResults["vignette-econ-01"];
    const attempt = legacyResultToPracticeAttempt(legacyResult);

    expect(attempt.sessionId).toBeDefined();
    expect(attempt.mode).toBe("practice");
    expect(attempt.score).toBe(3);
    expect(attempt.total).toBe(5);
    expect(attempt.itemAttempts.length).toBe(5);

    // Check item attempt details
    const failedItem = attempt.itemAttempts[1];
    expect(failedItem.isCorrect).toBe(false);
    expect(failedItem.trapCategory).toBe("Elasticity Direction Reversal");
    expect(failedItem.errorMode).toBe("SIGN_INVERSION");
  });

  it("roundtrips canonical PracticeItem to legacy question for component compatibility", () => {
    const vignette = CFA_VIGNETTES[0];
    const items = legacyVignetteToPracticeItems(vignette);
    const legacyQ = practiceItemToLegacyQuestion(items[0], 1);

    expect(legacyQ.id).toBe(1);
    expect(legacyQ.stem).toBe(items[0].stem);
    expect(legacyQ.correctOption).toBe(items[0].correctOption);
    expect(legacyQ.algebraicSolution).toBe(items[0].solution);
  });
});

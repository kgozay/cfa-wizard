import { describe, it, expect } from "vitest";
import { GenerationRequestSchema } from "../requestSchema";
import { GenerationResponseSchema } from "../responseSchema";
import { createAIDraftProvenance, createFallbackProvenance } from "../provenance";
import { generateMockExamSession } from "@/data/mockExamGenerator";
import { SAMPLE_VALID_GENERATED_SET, SAMPLE_MALFORMED_GENERATED_SET } from "@/test/fixtures/generated-items";
import { legacyVignetteToPracticeItems } from "@/lib/practice/adapters";
import { VignetteSet } from "@/types/cfa";

describe("Generation Request & Response Validation", () => {
  it("accepts a valid generation request", () => {
    const valid = {
      topicId: "01",
      difficulty: "standard",
      questionCount: 5,
      focus: "Time value of money annuity due calculation",
    };
    const result = GenerationRequestSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects invalid topic ID with field error", () => {
    const invalid = {
      topicId: "99",
      questionCount: 5,
    };
    const result = GenerationRequestSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("topicId");
    }
  });

  it("rejects unsupported question count", () => {
    const invalid = {
      topicId: "01",
      questionCount: 7, // Allowed: 2, 5, 10, 15
    };
    const result = GenerationRequestSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects unknown fields and invalid difficulty instead of normalizing them", () => {
    const result = GenerationRequestSchema.safeParse({
      topicId: "01",
      mode: "case-study",
      difficulty: "banana",
      questionCount: 5,
      unknown: true,
    });
    expect(result.success).toBe(false);
  });

  it("validates generation response contract", () => {
    const provenance = createAIDraftProvenance({ sourceIds: ["01"] });
    const items = legacyVignetteToPracticeItems(SAMPLE_VALID_GENERATED_SET as unknown as VignetteSet, provenance);

    const response = {
      requestId: "req-12345",
      provenance,
      items,
      warnings: [],
    };

    const result = GenerationResponseSchema.safeParse(response);
    expect(result.success).toBe(true);
  });

  it("quarantines generated and custom content from mock exam pools", () => {
    const customVignette: VignetteSet = {
      id: "custom-vignette-draft-001",
      topicId: "01",
      topicName: "Quantitative Methods",
      subReading: "TVM",
      difficulty: "Standard",
      vignetteStem: "Custom scenario",
      questions: [
        {
          id: 9999,
          stem: "Quarantined draft question that must never appear in mocks",
          options: { A: "A", B: "B", C: "C" },
          correctOption: "A",
          algebraicSolution: "Solution",
          calculatorKeystrokes: "",
          trapCategory: "Trap",
          distractorAutopsy: { A: "A", B: "B", C: "C" },
        },
      ],
    };

    const mock = generateMockExamSession("quick_diagnostic_45", [customVignette]);
    const foundCustom = mock.questions.some((q) => q.stem.includes("Quarantined draft question"));
    expect(foundCustom).toBe(false);
  });
});

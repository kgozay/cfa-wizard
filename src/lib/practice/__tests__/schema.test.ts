import { describe, it, expect } from "vitest";
import { PracticeItemSchema, PracticeItemsArraySchema } from "../schema";
import { PracticeItem } from "@/types/practice";

const VALID_ITEM: PracticeItem = {
  id: "authored:vignette-01-quant:101",
  topicId: "01",
  topicName: "Quantitative Methods",
  subReading: "Time Value of Money",
  losCode: "LOS 1.b",
  mode: "standalone",
  stem: "A corporate bond quotes a stated nominal annual rate of 8.40% compounded monthly. What is the Effective Annual Rate (EAR)?",
  options: {
    A: "8.400%",
    B: "8.731%",
    C: "8.765%",
  },
  correctOption: "B",
  solution: "EAR = (1 + 0.084/12)^12 - 1 = 8.731%.",
  calculatorKeystrokes: "[2nd][ICONV] -> NOM = 8.40",
  trapCategory: "Compounding Periodicity",
  distractorFeedback: {
    A: "Ignores monthly compounding.",
    B: "Correctly computes EAR.",
    C: "Incorrectly computes continuous compounding.",
  },
  provenance: {
    origin: "authored",
    status: "approved",
    sourceIds: ["vignette-01-quant"],
    createdAt: "2026-09-18T00:00:00.000Z",
  },
};

describe("Canonical Practice Schema Validation", () => {
  it("accepts a fully valid PracticeItem", () => {
    const result = PracticeItemSchema.safeParse(VALID_ITEM);
    expect(result.success).toBe(true);
  });

  it("rejects invalid topic ID", () => {
    const invalid = { ...VALID_ITEM, topicId: "99" };
    const result = PracticeItemSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("topicId");
    }
  });

  it("rejects missing or blank option C", () => {
    const invalid = {
      ...VALID_ITEM,
      options: { ...VALID_ITEM.options, C: "" },
    };
    const result = PracticeItemSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects duplicate option text", () => {
    const invalid = {
      ...VALID_ITEM,
      options: { A: "Same text", B: "Same text", C: "Different" },
    };
    const result = PracticeItemSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects invalid answer key", () => {
    const invalid = { ...VALID_ITEM, correctOption: "D" };
    const result = PracticeItemSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects blank solution", () => {
    const invalid = { ...VALID_ITEM, solution: "   " };
    const result = PracticeItemSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects oversized generated fields", () => {
    const invalid = { ...VALID_ITEM, stem: "A".repeat(5000) };
    const result = PracticeItemSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects duplicate IDs inside an item array", () => {
    const duplicateArray = [VALID_ITEM, { ...VALID_ITEM }];
    const result = PracticeItemsArraySchema.safeParse(duplicateArray);
    expect(result.success).toBe(false);
  });
});

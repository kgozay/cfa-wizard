import { describe, it, expect } from "vitest";
import { CFA_VIGNETTES } from "@/data/vignettes";
import { auditVignetteBank } from "@/lib/practice/bankAudit";

describe("Question Bank Integrity & Characterization", () => {
  it("audits the authored CFA_VIGNETTES bank", () => {
    const report = auditVignetteBank(CFA_VIGNETTES);

    expect(report.totalVignettes).toBe(10);
    expect(report.totalQuestions).toBe(150);

    // No duplicate IDs inside the same vignette
    expect(report.duplicateIdsByVignette).toEqual([]);

    // Options must be complete (A, B, C present and non-empty)
    expect(report.missingOptions).toEqual([]);

    // Correct keys must be valid
    expect(report.invalidKeys).toEqual([]);

    // Every question must have an explanation/solution
    expect(report.missingSolutions).toEqual([]);
  });

  it("characterizes the authored answer distribution baseline", () => {
    const report = auditVignetteBank(CFA_VIGNETTES);

    // Baseline counts from the 150 authored questions
    expect(report.totalQuestions).toBe(150);
    expect(report.distribution.A + report.distribution.B + report.distribution.C).toBe(150);
    // In authored bank, check distribution
    expect(report.distribution.A).toBeGreaterThan(0);
  });

  it("characterizes question ID formats across authored vignettes", () => {
    const allIds = CFA_VIGNETTES.flatMap((v) => v.questions.map((q) => q.id));
    expect(allIds.length).toBe(150);
    // All authored questions currently use numeric IDs (e.g. 101, 201...)
    allIds.forEach((id) => {
      expect(typeof id).toBe("number");
    });
  });
});

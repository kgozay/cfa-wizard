import { describe, it, expect } from "vitest";
import { CFA_VIGNETTES } from "@/data/vignettes";
import { auditVignetteBank } from "@/lib/practice/bankAudit";

describe("Question Bank Integrity & Characterization", () => {
  it("audits the authored CFA_VIGNETTES bank", () => {
    const report = auditVignetteBank(CFA_VIGNETTES);

    expect(report.totalVignettes).toBe(10);
    expect(report.totalQuestions).toBe(338);

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

    // Baseline counts from the 338 authored questions
    expect(report.totalQuestions).toBe(338);
    expect(report.distribution.A + report.distribution.B + report.distribution.C).toBe(338);
    // In authored bank, check distribution
    expect(report.distribution.A).toBeGreaterThan(0);
  });

  it("characterizes question ID formats across authored vignettes", () => {
    const allIds = CFA_VIGNETTES.flatMap((v) => v.questions.map((q) => q.id));
    expect(allIds.length).toBe(338);
    // All authored questions currently use numeric IDs (e.g. 101, 201...)
    allIds.forEach((id) => {
      expect(typeof id).toBe("number");
    });
  });

  it("grades the two-asset volatility item against its calculated value", () => {
    const item = CFA_VIGNETTES.flatMap((vignette) => vignette.questions).find((question) => question.id === 111);
    expect(item).toBeDefined();
    const variance = (0.6 * 15) ** 2 + (0.4 * 25) ** 2 + 2 * 0.6 * 0.4 * 0.2 * 15 * 25;
    expect(variance).toBe(217);
    expect(item?.options[item.correctOption]).toBe(`${Math.sqrt(variance).toFixed(2)}%`);
    expect(item?.algebraicSolution).toContain("sqrt(217) = 14.73%");
  });

  it("keeps question ids and stems unique across the whole bank", () => {
    const questions = CFA_VIGNETTES.flatMap((vignette) => vignette.questions);
    expect(new Set(questions.map((q) => q.id)).size).toBe(questions.length);
    expect(new Set(questions.map((q) => q.stem.trim().toLowerCase())).size).toBe(questions.length);
  });

  it("gives each option a distinct value and an explanation keyed to its letter", () => {
    CFA_VIGNETTES.flatMap((vignette) => vignette.questions).forEach((q) => {
      expect(new Set([q.options.A, q.options.B, q.options.C]).size).toBe(3);
      expect(q.distractorAutopsy[q.correctOption]).toMatch(/^correct/i);
    });
  });
});

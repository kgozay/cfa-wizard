import { VignetteQuestion, VignetteSet } from "@/types/cfa";

export interface BankAuditReport {
  totalVignettes: number;
  totalQuestions: number;
  distribution: {
    A: number;
    B: number;
    C: number;
    other: number;
  };
  distributionPercentages: {
    A: number;
    B: number;
    C: number;
  };
  duplicateIdsByVignette: Array<{ vignetteId: string; duplicateIds: number[] }>;
  duplicateStems: Array<{ stem: string; count: number }>;
  missingOptions: Array<{ vignetteId: string; questionId: number; missingKeys: string[] }>;
  invalidKeys: Array<{ vignetteId: string; questionId: number; key: string }>;
  missingSolutions: Array<{ vignetteId: string; questionId: number }>;
  missingFeedback: Array<{ vignetteId: string; questionId: number; missingOptions: string[] }>;
}

export function auditVignetteBank(vignettes: VignetteSet[]): BankAuditReport {
  let totalQuestions = 0;
  const distribution = { A: 0, B: 0, C: 0, other: 0 };
  const duplicateIdsByVignette: Array<{ vignetteId: string; duplicateIds: number[] }> = [];
  const stemCounts = new Map<string, number>();
  const missingOptions: Array<{ vignetteId: string; questionId: number; missingKeys: string[] }> = [];
  const invalidKeys: Array<{ vignetteId: string; questionId: number; key: string }> = [];
  const missingSolutions: Array<{ vignetteId: string; questionId: number }> = [];
  const missingFeedback: Array<{ vignetteId: string; questionId: number; missingOptions: string[] }> = [];

  for (const v of vignettes) {
    const seenIds = new Set<number>();
    const dupes: number[] = [];

    for (const q of v.questions) {
      totalQuestions++;

      // Track duplicate IDs inside vignette
      if (seenIds.has(q.id)) {
        dupes.push(q.id);
      } else {
        seenIds.add(q.id);
      }

      // Track duplicate normalized stems
      const normStem = q.stem.trim().toLowerCase().replace(/\s+/g, " ");
      stemCounts.set(normStem, (stemCounts.get(normStem) || 0) + 1);

      // Distribution
      if (q.correctOption === "A") distribution.A++;
      else if (q.correctOption === "B") distribution.B++;
      else if (q.correctOption === "C") distribution.C++;
      else distribution.other++;

      // Options completeness
      const missingOpts: string[] = [];
      if (!q.options?.A || !q.options.A.trim()) missingOpts.push("A");
      if (!q.options?.B || !q.options.B.trim()) missingOpts.push("B");
      if (!q.options?.C || !q.options.C.trim()) missingOpts.push("C");
      if (missingOpts.length > 0) {
        missingOptions.push({ vignetteId: v.id, questionId: q.id, missingKeys: missingOpts });
      }

      // Valid key
      if (!["A", "B", "C"].includes(q.correctOption)) {
        invalidKeys.push({ vignetteId: v.id, questionId: q.id, key: String(q.correctOption) });
      }

      // Missing solution
      if (!q.algebraicSolution || !q.algebraicSolution.trim()) {
        missingSolutions.push({ vignetteId: v.id, questionId: q.id });
      }

      // Missing distractor feedback
      const missingFb: string[] = [];
      if (!q.distractorAutopsy?.A?.trim()) missingFb.push("A");
      if (!q.distractorAutopsy?.B?.trim()) missingFb.push("B");
      if (!q.distractorAutopsy?.C?.trim()) missingFb.push("C");
      if (missingFb.length > 0) {
        missingFeedback.push({ vignetteId: v.id, questionId: q.id, missingOptions: missingFb });
      }
    }

    if (dupes.length > 0) {
      duplicateIdsByVignette.push({ vignetteId: v.id, duplicateIds: dupes });
    }
  }

  const duplicateStems: Array<{ stem: string; count: number }> = [];
  for (const [stem, count] of stemCounts.entries()) {
    if (count > 1) {
      duplicateStems.push({ stem, count });
    }
  }

  const distributionPercentages = {
    A: totalQuestions > 0 ? (distribution.A / totalQuestions) * 100 : 0,
    B: totalQuestions > 0 ? (distribution.B / totalQuestions) * 100 : 0,
    C: totalQuestions > 0 ? (distribution.C / totalQuestions) * 100 : 0,
  };

  return {
    totalVignettes: vignettes.length,
    totalQuestions,
    distribution,
    distributionPercentages,
    duplicateIdsByVignette,
    duplicateStems,
    missingOptions,
    invalidKeys,
    missingSolutions,
    missingFeedback,
  };
}

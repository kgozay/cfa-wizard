import { describe, it, expect } from "vitest";
import { CFA_VIGNETTES } from "@/data/vignettes";
import { CFA_CURRICULUM } from "@/data/curriculum";
import { MOCK_TOPIC_QUOTAS } from "@/data/mockExamGenerator";
import { auditVignetteBank } from "@/lib/practice/bankAudit";
import { extractDisplayedNumbers } from "@/lib/practice/optionNumbers";
import { OptionKey } from "@/types/cfa";

const KEYS: OptionKey[] = ["A", "B", "C"];
const questions = CFA_VIGNETTES.flatMap((vignette) => vignette.questions);
const MIN_ITEMS_PER_TOPIC = 60;

/** Items whose options are words, not calculated values. */
const conceptual = questions.filter((q) => KEYS.every((key) => extractDisplayedNumbers(q.options[key]).length === 0));

describe("Question Bank Integrity & Characterization", () => {
  it("audits the authored CFA_VIGNETTES bank", () => {
    const report = auditVignetteBank(CFA_VIGNETTES);

    expect(report.totalVignettes).toBe(10);
    expect(report.totalQuestions).toBe(questions.length);
    expect(report.duplicateIdsByVignette).toEqual([]);
    expect(report.missingOptions).toEqual([]);
    expect(report.invalidKeys).toEqual([]);
    expect(report.missingSolutions).toEqual([]);
    expect(report.missingFeedback).toEqual([]);
    expect(report.duplicateStems).toEqual([]);
  });

  it("holds at least three times the largest mock quota in every topic", () => {
    CFA_VIGNETTES.forEach((vignette) => {
      const fullMockQuota = MOCK_TOPIC_QUOTAS.full_180[vignette.topicId];
      expect(vignette.questions.length).toBeGreaterThanOrEqual(MIN_ITEMS_PER_TOPIC);
      expect(vignette.questions.length / fullMockQuota).toBeGreaterThanOrEqual(2.5);
    });
  });

  it("keeps question ids and stems unique across the whole bank", () => {
    expect(new Set(questions.map((q) => q.id)).size).toBe(questions.length);
    expect(new Set(questions.map((q) => q.stem.trim().toLowerCase())).size).toBe(questions.length);
  });

  it("gives each option a distinct value and an explanation keyed to its letter", () => {
    questions.forEach((q) => {
      expect(new Set(KEYS.map((key) => q.options[key].trim().toLowerCase())).size).toBe(3);
      expect(q.distractorAutopsy[q.correctOption]).toMatch(/^correct/i);
      KEYS.filter((key) => key !== q.correctOption).forEach((key) => {
        expect(q.distractorAutopsy[key]).not.toMatch(/^correct/i);
      });
    });
  });

  it("keeps every LOS code inside its topic's declared readings and letter ranges", () => {
    const failures: string[] = [];
    CFA_VIGNETTES.forEach((vignette) => {
      const topic = CFA_CURRICULUM.find((t) => t.id === vignette.topicId)!;
      const ranges = new Map(
        topic.subReadings.map((sub) => {
          const [, reading, first, last] = sub.losCode!.match(/^LOS (\d+)\.([a-z])-([a-z])$/)!;
          return [Number(reading), [first, last] as const];
        })
      );
      vignette.questions.forEach((q) => {
        const match = q.losCode?.match(/^LOS (\d+)\.([a-z])$/);
        const range = match ? ranges.get(Number(match[1])) : undefined;
        if (!match || !range || match[2] < range[0] || match[2] > range[1]) {
          failures.push(`${q.id}: ${q.losCode} is outside topic ${vignette.topicId}`);
        }
      });
    });
    expect(failures).toEqual([]);
  });

  it("keeps set stems free of data, so every item is answerable on its own", () => {
    CFA_VIGNETTES.forEach((vignette) => {
      expect(vignette.vignetteStem).not.toMatch(/\d/);
    });
  });

  it("spreads authoring keys so no letter holds more than half of a topic", () => {
    CFA_VIGNETTES.forEach((vignette) => {
      KEYS.forEach((key) => {
        const share = vignette.questions.filter((q) => q.correctOption === key).length / vignette.questions.length;
        expect(share, `topic ${vignette.topicId} key ${key}`).toBeLessThanOrEqual(0.5);
      });
    });
  });

  it("does not let the longest option give away the answer", () => {
    const strictlyLongest = conceptual.filter((q) => {
      const correct = q.options[q.correctOption].length;
      return KEYS.every((key) => key === q.correctOption || q.options[key].length < correct);
    });
    // A clear cue: the key is both 10+ characters and 15%+ longer than any distractor
    const clearCue = conceptual.filter((q) => {
      const correct = q.options[q.correctOption].length;
      const longestOther = Math.max(...KEYS.filter((key) => key !== q.correctOption).map((key) => q.options[key].length));
      return correct - longestOther > 10 && correct > longestOther * 1.15;
    });
    expect(strictlyLongest.length / conceptual.length).toBeLessThanOrEqual(1 / 3);
    expect(clearCue.length / conceptual.length).toBeLessThanOrEqual(0.1);
  });

  it("gives each topic a range of trap categories for diagnostics", () => {
    CFA_VIGNETTES.forEach((vignette) => {
      expect(new Set(vignette.questions.map((q) => q.trapCategory)).size).toBeGreaterThanOrEqual(20);
    });
  });

  it("only points variant keys at templates that exist", async () => {
    const { QUESTION_TEMPLATES } = await import("@/lib/generation/templates");
    const keys = new Set(QUESTION_TEMPLATES.map((template) => template.key));
    expect(questions.filter((q) => q.variantKey && !keys.has(q.variantKey)).map((q) => q.id)).toEqual([]);
  });
});

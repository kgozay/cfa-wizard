import {
  VignetteSet,
  VignetteQuestion,
  VignetteSessionResult,
} from "@/types/cfa";
import {
  PracticeItem,
  PracticeAttempt,
  ItemAttempt,
  ContentProvenance,
  OptionKey,
} from "@/types/practice";
import { makeAuthoredSourceId, makeSessionId, makeSessionItemId, makeAttemptId } from "./ids";

/**
 * Converts a legacy VignetteSet (authored or custom) into canonical PracticeItems.
 */
export function legacyVignetteToPracticeItems(
  vignette: VignetteSet,
  overrideProvenance?: Partial<ContentProvenance>
): PracticeItem[] {
  const setId = vignette?.id || "vignette-set";
  const isCustom = setId.includes("custom") || setId.includes("ai-vignette") || setId.includes("req-") || setId.includes("-expanded-");
  const defaultProvenance: ContentProvenance = vignette.provenance || {
    origin: isCustom ? "procedural-fallback" : "authored",
    status: isCustom ? "draft" : "approved",
    sourceIds: [setId],
    createdAt: new Date().toISOString(),
  };
  return (vignette?.questions || []).map((q) => {
    const canonicalId = makeAuthoredSourceId(setId, q.id);
    const provenance = { ...defaultProvenance, ...q.provenance, ...overrideProvenance };

    return {
      id: canonicalId,
      topicId: vignette.topicId as PracticeItem["topicId"],
      topicName: vignette.topicName,
      subReading: vignette.subReading,
      losCode: q.losCode,
      mode: "case-study",
      caseId: vignette.id,
      caseStem: vignette.vignetteStem,
      stem: q.stem,
      options: {
        A: q.options.A,
        B: q.options.B,
        C: q.options.C,
      },
      correctOption: q.correctOption,
      solution: q.algebraicSolution,
      calculatorKeystrokes: q.calculatorKeystrokes,
      trapCategory: q.trapCategory || "General",
      errorModeDefault: q.errorModeDefault,
      distractorFeedback: {
        A: q.distractorAutopsy?.A || "No feedback provided.",
        B: q.distractorAutopsy?.B || "No feedback provided.",
        C: q.distractorAutopsy?.C || "No feedback provided.",
      },
      provenance,
    };
  });
}

export interface LegacySessionResultInput {
  vignetteId: string;
  topicId: string;
  submittedAt?: string;
  score: number;
  total: number;
  userAnswers?: Record<number, OptionKey>;
  submissions?: Array<{
    questionId: number;
    selectedOption?: OptionKey | null;
    isCorrect: boolean;
    trapTriggered?: string;
    errorModeLogged?: string;
    timeSpentSeconds?: number;
  }>;
  trapsTriggered?: string[];
  totalTimeSeconds?: number;
}

/**
 * Converts a legacy VignetteSessionResult into a canonical PracticeAttempt.
 * Used during Zustand storage migration and backup imports.
 */
export function legacyResultToPracticeAttempt(
  result: LegacySessionResultInput,
  _topicName?: string
): PracticeAttempt {
  const sessionId = makeSessionId();
  const submittedAt = result.submittedAt || new Date().toISOString();

  const itemAttempts: ItemAttempt[] = (result.submissions || []).map((sub, index) => {
    const sourceItemId = makeAuthoredSourceId(result.vignetteId, sub.questionId);
    const sessionItemId = makeSessionItemId(sessionId, index + 1, sourceItemId);

    return {
      id: makeAttemptId(),
      sessionId,
      sessionItemId,
      sourceItemId,
      topicId: result.topicId,
      selectedOption: sub.selectedOption || null,
      correctOption: (sub.isCorrect ? sub.selectedOption : "A") as "A" | "B" | "C", // Fallback for historical legacy records
      isCorrect: sub.isCorrect,
      timedOut: false,
      timeSpentSeconds: sub.timeSpentSeconds ?? 0,
      submittedAt,
      trapCategory: sub.trapTriggered,
      errorMode: sub.errorModeLogged as ItemAttempt["errorMode"],
    };
  });

  return {
    id: makeAttemptId(),
    sessionId,
    mode: "practice",
    startedAt: submittedAt, // Historical records did not record separate start timestamps
    submittedAt,
    totalTimeSeconds: result.totalTimeSeconds ?? 0,
    itemAttempts,
    score: result.score,
    total: result.total,
    topicIds: [result.topicId],
  };
}

/**
 * Converts a canonical PracticeItem back to a legacy VignetteQuestion
 * if required by legacy rendering components during transition.
 */
export function practiceItemToLegacyQuestion(item: PracticeItem, index: number = 1): VignetteQuestion {
  return {
    id: index,
    stem: item.stem,
    options: item.options,
    correctOption: item.correctOption,
    algebraicSolution: item.solution,
    calculatorKeystrokes: item.calculatorKeystrokes || "",
    trapCategory: item.trapCategory,
    errorModeDefault: item.errorModeDefault,
    losCode: item.losCode,
    distractorAutopsy: {
      A: item.distractorFeedback.A,
      B: item.distractorFeedback.B,
      C: item.distractorFeedback.C,
    },
  };
}

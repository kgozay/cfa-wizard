import { OptionKey, PracticeAttempt, PracticeSession, ItemAttempt } from "@/types/practice";
import { makeAttemptId } from "./ids";

export interface GradeAttemptOptions {
  session: PracticeSession;
  answers: Record<string, OptionKey | null>;
  timing: Record<string, number>; // sessionItemId -> seconds
  submittedAt?: string;
  trapCategories?: Record<string, string>; // sessionItemId -> trapCategory
  errorModes?: Record<string, import("@/types/cfa").ErrorMode>; // sessionItemId -> errorMode
}

/**
 * Pure function to grade a PracticeSession and produce an append-only PracticeAttempt record.
 */
export function gradeAttempt(options: GradeAttemptOptions): PracticeAttempt {
  const { session, answers, timing } = options;
  const submittedAt = options.submittedAt || new Date().toISOString();

  let score = 0;
  let totalTimeSeconds = 0;

  const itemAttempts: ItemAttempt[] = session.presentedItems.map((presented) => {
    const selectedOption = answers[presented.sessionItemId] || null;
    const isCorrect = selectedOption !== null && selectedOption === presented.correctOption;
    const timedOut = selectedOption === null;
    const timeSpent = timing[presented.sessionItemId] ?? 0;

    if (isCorrect) {
      score++;
    }
    totalTimeSeconds += timeSpent;

    return {
      id: makeAttemptId(),
      sessionId: session.id,
      sessionItemId: presented.sessionItemId,
      sourceItemId: presented.sourceItemId,
      topicId: session.topicIds[0] || "01",
      selectedOption,
      correctOption: presented.correctOption,
      isCorrect,
      timedOut,
      timeSpentSeconds: timeSpent,
      submittedAt,
      trapCategory: options.trapCategories?.[presented.sessionItemId],
      errorMode: options.errorModes?.[presented.sessionItemId],
    };
  });

  return {
    id: makeAttemptId(),
    sessionId: session.id,
    mode: session.mode,
    startedAt: session.startedAt,
    submittedAt,
    totalTimeSeconds,
    itemAttempts,
    score,
    total: session.presentedItems.length,
    topicIds: session.topicIds,
  };
}

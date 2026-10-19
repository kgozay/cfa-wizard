import { PracticeAttempt } from "@/types/practice";

/** What the candidate has done with one source item, derived from attempt history. */
export interface ItemExposure {
  seenCount: number;
  correctCount: number;
  lastSeenAt: string;
  lastCorrect: boolean;
  /** Consecutive correct answers up to and including the latest attempt. */
  correctStreak: number;
}

export type ExposureIndex = Record<string, ItemExposure>;

/**
 * Builds a per-item exposure index from the append-only attempt log, so no
 * separate state has to be persisted, migrated or backed up.
 */
export function buildExposureIndex(attempts: PracticeAttempt[]): ExposureIndex {
  const index: ExposureIndex = {};
  const ordered = [...attempts].sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));
  for (const attempt of ordered) {
    for (const item of attempt.itemAttempts) {
      const previous = index[item.sourceItemId];
      index[item.sourceItemId] = {
        seenCount: (previous?.seenCount ?? 0) + 1,
        correctCount: (previous?.correctCount ?? 0) + (item.isCorrect ? 1 : 0),
        lastSeenAt: item.submittedAt || attempt.submittedAt,
        lastCorrect: item.isCorrect,
        correctStreak: item.isCorrect ? (previous?.correctStreak ?? 0) + 1 : 0,
      };
    }
  }
  return index;
}

/** Share of the given items the candidate has never attempted. */
export function unseenShare(itemIds: string[], exposure: ExposureIndex): number {
  if (itemIds.length === 0) return 0;
  return itemIds.filter((id) => !exposure[id]).length / itemIds.length;
}

/** Accuracy per topic over items with history; topics without evidence are omitted. */
export function topicAccuracy(attempts: PracticeAttempt[]): Record<string, { correct: number; total: number }> {
  const totals: Record<string, { correct: number; total: number }> = {};
  for (const attempt of attempts) {
    for (const item of attempt.itemAttempts) {
      const entry = (totals[item.topicId] ??= { correct: 0, total: 0 });
      entry.total += 1;
      if (item.isCorrect) entry.correct += 1;
    }
  }
  return totals;
}

import { OptionKey, PracticeAttempt } from "@/types/practice";

const OPTION_KEYS: OptionKey[] = ["A", "B", "C"];

/** Answer history for one authored item, in its authoring letters. */
export interface ItemStats {
  sourceItemId: string;
  topicId: string;
  attempts: number;
  correct: number;
  successRate: number;
  /** Attempts whose chosen option was recorded in authoring letters. */
  lettered: number;
  /** How often each authoring letter was chosen, over lettered attempts. */
  selections: Record<OptionKey, number>;
  unanswered: number;
}

export type ItemFlag =
  | { kind: "distractor-beats-key"; sourceItemId: string; topicId: string; distractor: OptionKey; distractorRate: number; keyRate: number; attempts: number }
  | { kind: "too-easy"; sourceItemId: string; topicId: string; successRate: number; attempts: number };

export const ITEM_FLAG_THRESHOLDS = {
  /** Lettered attempts needed before a distractor can be said to beat the key. */
  minDistractorEvidence: 5,
  /** Attempts needed before an item can be called too easy. */
  minEasyEvidence: 10,
  easySuccessRate: 0.95,
};

/**
 * Per-item success and option-selection rates. Variant attempts are left out:
 * their numbers differ from the authored item, so they say nothing about its key.
 * Older attempts recorded before authoring letters were kept still count towards
 * the success rate but not towards the selection rates.
 */
export function buildItemStats(attempts: PracticeAttempt[]): Record<string, ItemStats> {
  const stats: Record<string, ItemStats> = {};
  for (const attempt of attempts) {
    for (const item of attempt.itemAttempts) {
      if (item.variantSeed) continue;
      const entry = (stats[item.sourceItemId] ??= {
        sourceItemId: item.sourceItemId,
        topicId: item.topicId,
        attempts: 0,
        correct: 0,
        successRate: 0,
        lettered: 0,
        selections: { A: 0, B: 0, C: 0 },
        unanswered: 0,
      });
      entry.attempts += 1;
      if (item.isCorrect) entry.correct += 1;
      if (item.selectedSourceOption === undefined) continue;
      entry.lettered += 1;
      if (item.selectedSourceOption === null) entry.unanswered += 1;
      else entry.selections[item.selectedSourceOption] += 1;
    }
  }
  for (const entry of Object.values(stats)) entry.successRate = entry.correct / entry.attempts;
  return stats;
}

/**
 * Flags items worth a second look: a distractor chosen more often than the key
 * (a possible wrong key or ambiguous wording) and items almost always answered
 * correctly (no longer discriminating). `keyOf` returns the authored key.
 */
export function flagItems(
  stats: Record<string, ItemStats>,
  keyOf: (sourceItemId: string) => OptionKey | undefined,
  thresholds = ITEM_FLAG_THRESHOLDS
): ItemFlag[] {
  const flags: ItemFlag[] = [];
  for (const entry of Object.values(stats)) {
    const key = keyOf(entry.sourceItemId);
    if (key && entry.lettered >= thresholds.minDistractorEvidence) {
      const rate = (letter: OptionKey) => entry.selections[letter] / entry.lettered;
      const strongest = OPTION_KEYS.filter((letter) => letter !== key).sort((a, b) => rate(b) - rate(a))[0];
      if (rate(strongest) > rate(key)) {
        flags.push({
          kind: "distractor-beats-key",
          sourceItemId: entry.sourceItemId,
          topicId: entry.topicId,
          distractor: strongest,
          distractorRate: rate(strongest),
          keyRate: rate(key),
          attempts: entry.lettered,
        });
      }
    }
    if (entry.attempts >= thresholds.minEasyEvidence && entry.successRate > thresholds.easySuccessRate) {
      flags.push({ kind: "too-easy", sourceItemId: entry.sourceItemId, topicId: entry.topicId, successRate: entry.successRate, attempts: entry.attempts });
    }
  }
  // Possible wrong keys first, strongest evidence first
  return flags.sort((a, b) => (a.kind === b.kind ? b.attempts - a.attempts : a.kind === "distractor-beats-key" ? -1 : 1));
}

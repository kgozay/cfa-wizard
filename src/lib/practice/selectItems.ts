import { PracticeItem } from "@/types/practice";
import { ExposureIndex } from "./exposure";
import { shuffleArray } from "./random";

/**
 * Priority tiers, lowest first:
 *   0 due     - a spaced-review card for the item is due
 *   1 unseen  - never attempted
 *   2 missed  - the latest attempt was wrong
 *   3 stale   - answered correctly, but not yet twice in a row
 *   4 mastered - answered correctly at least twice in a row
 * "learning" (drills, sprints) uses all tiers. "fresh" (mocks) ignores due cards
 * and misses, so exams favour new items, then the least recently seen.
 */
export type SelectionPolicy = "learning" | "fresh";

export interface SelectItemsOptions {
  count: number;
  exposure: ExposureIndex;
  prng: () => number;
  policy?: SelectionPolicy;
  dueItemIds?: ReadonlySet<string>;
  excludeItemIds?: ReadonlySet<string>;
}

const MASTERED_STREAK = 2;

export function exposureTier(
  item: PracticeItem,
  exposure: ExposureIndex,
  policy: SelectionPolicy,
  dueItemIds?: ReadonlySet<string>
): number {
  const history = exposure[item.id];
  if (policy === "learning" && dueItemIds?.has(item.id)) return 0;
  if (!history) return 1;
  if (policy === "fresh") return 3;
  if (!history.lastCorrect) return 2;
  return history.correctStreak >= MASTERED_STREAK ? 4 : 3;
}

/**
 * Picks `count` items by tier. Within a tier, seen items come oldest-first and
 * ties are broken randomly, so repeated sessions rotate through the pool.
 * Excluded items are only used when the rest of the pool is too small.
 */
export function selectItems(items: PracticeItem[], options: SelectItemsOptions): PracticeItem[] {
  const { count, exposure, prng, policy = "learning", dueItemIds, excludeItemIds } = options;
  const shuffled = shuffleArray(items, prng);
  const rank = (item: PracticeItem) => ({
    excluded: excludeItemIds?.has(item.id) ? 1 : 0,
    tier: exposureTier(item, exposure, policy, dueItemIds),
    lastSeen: exposure[item.id]?.lastSeenAt ?? "",
  });
  const ranked = shuffled.map((item, order) => ({ item, order, ...rank(item) }));
  ranked.sort(
    (a, b) =>
      a.excluded - b.excluded ||
      a.tier - b.tier ||
      a.lastSeen.localeCompare(b.lastSeen) ||
      a.order - b.order
  );
  return ranked.slice(0, Math.max(0, count)).map((entry) => entry.item);
}

/** Midpoint of a curriculum weight band such as "11–14%". */
export function weightMidpoint(weight: string): number {
  const numbers = weight.match(/\d+(\.\d+)?/g)?.map(Number) ?? [];
  if (numbers.length === 0) return 1;
  return numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
}

export interface TopicDemand {
  topicId: string;
  examWeight: number;
  /** Observed accuracy in [0, 1], or undefined without enough evidence. */
  accuracy?: number;
  available: number;
}

const MIN_WEAKNESS = 0.15;
const UNKNOWN_WEAKNESS = 0.5;

/**
 * Splits `count` slots across topics in proportion to exam weight × weakness,
 * drawing each slot at random so short sprints still vary. Strong topics keep a
 * floor so they are revisited occasionally.
 */
export function allocateByWeakness(topics: TopicDemand[], count: number, prng: () => number): Record<string, number> {
  const allocation: Record<string, number> = {};
  const remaining = new Map(topics.map((topic) => [topic.topicId, topic.available]));
  const score = (topic: TopicDemand) =>
    topic.examWeight * Math.max(MIN_WEAKNESS, topic.accuracy === undefined ? UNKNOWN_WEAKNESS : 1 - topic.accuracy);

  for (let slot = 0; slot < count; slot++) {
    const open = topics.filter((topic) => (remaining.get(topic.topicId) ?? 0) > 0);
    if (open.length === 0) break;
    const total = open.reduce((sum, topic) => sum + score(topic), 0);
    let pick = prng() * total;
    let chosen = open[open.length - 1];
    for (const topic of open) {
      pick -= score(topic);
      if (pick <= 0) {
        chosen = topic;
        break;
      }
    }
    allocation[chosen.topicId] = (allocation[chosen.topicId] ?? 0) + 1;
    remaining.set(chosen.topicId, (remaining.get(chosen.topicId) ?? 0) - 1);
  }
  return allocation;
}

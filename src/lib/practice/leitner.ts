import { LeitnerCard } from "@/types/cfa";

export type LeitnerBox = LeitnerCard["box"];

export const LEITNER_BOXES: readonly LeitnerBox[] = [1, 2, 3, 4, 5];

/** Days until the next review after a card lands in each box. */
export const LEITNER_INTERVAL_DAYS: Record<LeitnerBox, number> = { 1: 1, 2: 3, 3: 7, 4: 14, 5: 30 };

export const LEITNER_BOX_LABELS: Record<LeitnerBox, string> = {
  1: "daily",
  2: "every 3 days",
  3: "weekly",
  4: "every 2 weeks",
  5: "monthly",
};

export function isRetired(card: LeitnerCard): boolean {
  return Boolean(card.retiredAt);
}

export function isDue(card: LeitnerCard, now: number = Date.now()): boolean {
  return !isRetired(card) && Date.parse(card.nextReviewAt) <= now;
}

/** Source items whose review card is due, for the practice selectors. */
export function dueLeitnerSourceIds(cards: LeitnerCard[], now: number = Date.now()): Set<string> {
  return new Set(cards.filter((card) => card.sourceItemId && isDue(card, now)).map((card) => card.sourceItemId!));
}

/**
 * Moves a card one box up on a correct review and back to Box 1 on a miss.
 * A correct review from Box 5 retires the card: it has been recalled at
 * expanding intervals up to a month and no longer needs scheduled review.
 */
export function scheduleLeitnerCard(card: LeitnerCard, isCorrect: boolean, reviewedAt: Date = new Date()): LeitnerCard {
  const reviewed = {
    ...card,
    reviewCount: card.reviewCount + 1,
    lastReviewedAt: reviewedAt.toISOString(),
  };
  if (isCorrect && card.box === 5) {
    return { ...reviewed, retiredAt: reviewedAt.toISOString() };
  }
  const box: LeitnerBox = isCorrect ? ((card.box + 1) as LeitnerBox) : 1;
  const next = new Date(reviewedAt);
  next.setDate(next.getDate() + LEITNER_INTERVAL_DAYS[box]);
  return { ...reviewed, box, nextReviewAt: next.toISOString(), retiredAt: undefined };
}

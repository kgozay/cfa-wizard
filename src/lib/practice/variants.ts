import { LeitnerCard } from "@/types/cfa";
import { OptionKey, PracticeItem, PresentedPracticeItem } from "@/types/practice";
import { CFA_VIGNETTES } from "@/data/vignettes";
import { buildTemplateQuestion, QUESTION_TEMPLATES, QuestionTemplate } from "@/lib/generation/templates";
import { legacyVignetteToPracticeItems } from "./adapters";
import { presentPracticeItem } from "./presentItem";
import { createPRNG } from "./random";

const templatesByKey = new Map<string, QuestionTemplate>(QUESTION_TEMPLATES.map((template) => [template.key, template]));

let authoredById: Map<string, PracticeItem> | null = null;

/** Authored items by source ID, built once on first use. */
export function authoredItem(sourceItemId: string): PracticeItem | undefined {
  if (!authoredById) {
    authoredById = new Map(
      CFA_VIGNETTES.flatMap((vignette) => legacyVignetteToPracticeItems(vignette)).map((item) => [item.id, item])
    );
  }
  return authoredById.get(sourceItemId);
}

export function hasVariant(item: Pick<PracticeItem, "variantKey">): boolean {
  return Boolean(item.variantKey && templatesByKey.has(item.variantKey));
}

/**
 * Returns the item with freshly generated numbers from its variant template:
 * the same structure and trap, new inputs, recomputed answer and distractors.
 * Items without a template are returned unchanged. The source ID is kept so
 * history, exposure and review cards still point at the authored item.
 */
export function variantOf(item: PracticeItem, seed: string): PracticeItem {
  const template = item.variantKey ? templatesByKey.get(item.variantKey) : undefined;
  if (!template) return item;
  const generated = buildTemplateQuestion(template, createPRNG(`${item.id}:${seed}`));
  return {
    ...item,
    stem: generated.stem,
    options: { ...generated.options },
    correctOption: generated.correctOption,
    solution: generated.algebraicSolution,
    calculatorKeystrokes: generated.calculatorKeystrokes,
    distractorFeedback: { ...generated.distractorAutopsy },
    variantSeed: seed,
  };
}

/** Variants for items the candidate has already seen; new items stay as authored. */
export function withVariantsForSeen(items: PracticeItem[], seen: (id: string) => boolean, seed: string): PracticeItem[] {
  return items.map((item) => (seen(item.id) ? variantOf(item, seed) : item));
}

/**
 * Builds what the review deck shows for a card: a fresh variant of the source
 * item when one exists, otherwise the original question with its options
 * reshuffled, so the card is never answered by remembering a letter.
 */
export function presentReviewCard(card: LeitnerCard, seed: string): PresentedPracticeItem {
  const prng = createPRNG(`${card.id}:${seed}`);
  const source = card.sourceItemId ? authoredItem(card.sourceItemId) : undefined;
  const item: PracticeItem = source
    ? variantOf(source, seed)
    : {
        id: card.sourceItemId || card.id,
        topicId: card.topicId,
        topicName: card.topicName,
        mode: "standalone",
        stem: card.questionStem,
        options: card.options,
        correctOption: card.correctOption,
        solution: card.solution,
        calculatorKeystrokes: card.keystrokes,
        trapCategory: card.trapName,
        errorModeDefault: card.errorMode,
        distractorFeedback: feedbackFromSolution(card.solution, card.correctOption),
        provenance: { origin: "authored", status: "approved", sourceIds: [], createdAt: new Date(0).toISOString() },
      };
  return presentPracticeItem(item, `review-${card.id}`, 1, prng);
}

function feedbackFromSolution(solution: string, correct: OptionKey): Record<OptionKey, string> {
  const wrong = "See the worked solution for the correct approach.";
  return { A: correct === "A" ? solution : wrong, B: correct === "B" ? solution : wrong, C: correct === "C" ? solution : wrong };
}

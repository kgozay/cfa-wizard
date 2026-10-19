import { OptionKey, PracticeItem, PresentedPracticeItem } from "@/types/practice";
import { shuffleArray } from "./random";
import { makeSessionItemId } from "./ids";

const OPTION_KEYS: readonly OptionKey[] = ["A", "B", "C"];

export interface ItemPermutation {
  // Maps original authoring key to displayed key, e.g. { A: "C", B: "A", C: "B" }
  authoringToDisplayed: Record<OptionKey, OptionKey>;
  // Maps displayed key back to authoring key, e.g. { C: "A", A: "B", B: "C" }
  displayedToAuthoring: Record<OptionKey, OptionKey>;
}

/**
 * Creates a pseudo-random permutation of the keys A, B, C.
 */
export function createOptionPermutation(prng: () => number = Math.random): ItemPermutation {
  // Shuffle displayed positions ["A", "B", "C"]
  const shuffledDisplayed = shuffleArray(OPTION_KEYS, prng);

  const authoringToDisplayed: Record<OptionKey, OptionKey> = {
    A: shuffledDisplayed[0],
    B: shuffledDisplayed[1],
    C: shuffledDisplayed[2],
  };

  const displayedToAuthoring: Record<OptionKey, OptionKey> = {
    [shuffledDisplayed[0]]: "A",
    [shuffledDisplayed[1]]: "B",
    [shuffledDisplayed[2]]: "C",
  } as Record<OptionKey, OptionKey>;

  return { authoringToDisplayed, displayedToAuthoring };
}

const OPTION_REFERENCE_PATTERN = /\b(Distractor|Option|Choice|Answer)\s+([ABC])\b/gi;

/**
 * Rewrites authored letter references ("Distractor A", "Option C") so they
 * match the shuffled display order the candidate actually sees.
 */
export function remapOptionReferences(text: string, authoringToDisplayed: Record<OptionKey, OptionKey>): string {
  if (!text) return text;
  return text.replace(OPTION_REFERENCE_PATTERN, (_match, label: string, letter: string) => {
    const displayed = authoringToDisplayed[letter.toUpperCase() as OptionKey] || letter;
    return `${label} ${displayed}`;
  });
}

/**
 * Transforms a canonical PracticeItem into a PresentedPracticeItem with remapped options.
 * The source item remains completely immutable.
 */
export function presentPracticeItem(
  item: PracticeItem,
  sessionId: string,
  displayIndex: number,
  prng: () => number = Math.random,
  existingPermutation?: Record<OptionKey, OptionKey>
): PresentedPracticeItem {
  const sessionItemId = makeSessionItemId(sessionId, displayIndex, item.id);

  let authoringToDisplayed: Record<OptionKey, OptionKey>;
  if (existingPermutation) {
    authoringToDisplayed = existingPermutation;
  } else {
    authoringToDisplayed = createOptionPermutation(prng).authoringToDisplayed;
  }

  // Build the reverse mapping: displayed -> authoring
  const displayedToAuthoring: Record<OptionKey, OptionKey> = {
    [authoringToDisplayed.A]: "A",
    [authoringToDisplayed.B]: "B",
    [authoringToDisplayed.C]: "C",
  } as Record<OptionKey, OptionKey>;

  // Build new options map according to displayed positions
  const displayedOptions: Record<OptionKey, string> = {
    A: item.options[displayedToAuthoring.A],
    B: item.options[displayedToAuthoring.B],
    C: item.options[displayedToAuthoring.C],
  };

  // Remap the correct option key
  const displayedCorrectOption = authoringToDisplayed[item.correctOption];

  // Remap distractor feedback
  const displayedFeedback: Record<OptionKey, string> = {
    A: remapOptionReferences(item.distractorFeedback[displayedToAuthoring.A] || "", authoringToDisplayed),
    B: remapOptionReferences(item.distractorFeedback[displayedToAuthoring.B] || "", authoringToDisplayed),
    C: remapOptionReferences(item.distractorFeedback[displayedToAuthoring.C] || "", authoringToDisplayed),
  };

  return {
    sessionItemId,
    sourceItemId: item.id,
    displayIndex,
    topicId: item.topicId,
    topicName: item.topicName,
    subReading: item.subReading,
    losCode: item.losCode,
    mode: item.mode,
    stem: item.stem,
    caseStem: item.caseStem,
    options: displayedOptions,
    correctOption: displayedCorrectOption,
    solution: remapOptionReferences(item.solution, authoringToDisplayed),
    calculatorKeystrokes: item.calculatorKeystrokes,
    trapCategory: item.trapCategory,
    errorModeDefault: item.errorModeDefault,
    distractorFeedback: displayedFeedback,
    optionPermutation: authoringToDisplayed,
    origin: item.provenance.origin,
    contentStatus: item.provenance.status,
    ...(item.variantSeed ? { variantSeed: item.variantSeed } : {}),
  };
}

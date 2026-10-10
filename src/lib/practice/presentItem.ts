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

const NUMERIC_OPTION = /^\s*([-+−]?)\s*\$?\s*([-+−]?)\s*(\d[\d,]*(?:\.\d+)?|\.\d+)\s*(%|x|years?|days?|million|billion|bps?|basis points)?\s*$/i;

/** Parses a purely quantitative option ("$1,026.73", "-4.50%", "6.0x", "7.00 years"). */
export function parseNumericOption(text: string): number | null {
  const match = text.trim().match(NUMERIC_OPTION);
  if (!match) return null;
  const negative = [match[1], match[2]].some((sign) => sign === "-" || sign === "−");
  const value = Number(match[3].replace(/,/g, ""));
  return Number.isFinite(value) ? (negative ? -value : value) : null;
}

/**
 * Orders options the way CFA Institute presents them on the Level I exam:
 * quantitative choices from smallest to largest, word choices from shortest
 * to longest. Returns the authoring-key -> displayed-key mapping.
 */
export function createExamOrderPermutation(options: Record<OptionKey, string>): Record<OptionKey, OptionKey> {
  const keys = [...OPTION_KEYS];
  const numeric = keys.map((key) => parseNumericOption(options[key]));
  const allNumeric = numeric.every((value) => value !== null);
  const ordered = [...keys].sort((a, b) => {
    if (allNumeric) {
      const diff = (numeric[keys.indexOf(a)] as number) - (numeric[keys.indexOf(b)] as number);
      if (diff !== 0) return diff;
    } else {
      const diff = options[a].trim().length - options[b].trim().length;
      if (diff !== 0) return diff;
    }
    return keys.indexOf(a) - keys.indexOf(b);
  });
  return {
    [ordered[0]]: "A",
    [ordered[1]]: "B",
    [ordered[2]]: "C",
  } as Record<OptionKey, OptionKey>;
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
    // Exam order is deterministic, so the PRNG is no longer needed for option order
    void prng;
    authoringToDisplayed = createExamOrderPermutation(item.options);
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
  };
}

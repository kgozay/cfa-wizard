import type { CFATopic, VignetteQuestion } from "@/types/cfa";

/**
 * CFA Institute's published Level I item-writing conventions
 * (cfainstitute.org, "CFA Program Level I exam" page), used both to brief the
 * AI model and to validate what it returns.
 */
export const LEVEL_I_ITEM_RULES = [
  "Each item is a standalone stem (question, statement and/or table) with exactly three answer choices: A, B and C.",
  "Use either sentence completion or a direct question. Each stem supports only one item.",
  "Do not use 'except', 'true' or 'false' in stems, and avoid 'not' whenever possible.",
  "Where appropriate use one qualifier: 'most likely', 'least likely', 'best described', 'most appropriate', 'most accurate', 'least appropriate' or 'least accurate'.",
  "Never use 'all of the above', 'none of the above', 'A and B only' (or similar combinations), 'cannot determine', 'cannot calculate' or 'not enough information to determine' as choices.",
  "Order quantitative choices from smallest to largest and word choices from shortest to longest.",
  "Choices must agree grammatically with the stem; put language common to all choices in the stem.",
  "Financial Statement Analysis items follow IFRS unless US GAAP is explicitly stated.",
  "Calculations must be solvable with a TI BA II Plus or HP 12C in about 90 seconds.",
] as const;

const BANNED_CHOICES = [
  /\ball of the above\b/i,
  /\bnone of the above\b/i,
  /\b[ABC] and [ABC] only\b/,
  /\bcannot (be )?(determined?|calculated?)\b/i,
  /\bnot enough information\b/i,
];
const BANNED_STEM_WORDS = [/\bEXCEPT\b/i, /\btrue or false\b/i, /\bwhich (of the following )?(is|are) (true|false)\b/i];

export interface ItemValidationResult {
  valid: boolean;
  errors: string[];
}

const normalize = (text: string) => text.trim().toLowerCase().replace(/\s+/g, " ");

/**
 * Checks a generated item against the exam conventions and the app's data
 * contract. Items that fail are dropped rather than shown to candidates.
 */
export function validateGeneratedItem(
  item: Partial<VignetteQuestion> | null | undefined,
  knownStems: Set<string> = new Set()
): ItemValidationResult {
  const errors: string[] = [];
  if (!item || typeof item !== "object") return { valid: false, errors: ["Item is not an object"] };

  const stem = typeof item.stem === "string" ? item.stem.trim() : "";
  if (stem.length < 20) errors.push("Stem is missing or too short");
  if (stem.length > 1500) errors.push("Stem is too long");
  if (BANNED_STEM_WORDS.some((pattern) => pattern.test(stem))) errors.push("Stem uses a banned construction (except/true/false)");
  if (stem && knownStems.has(normalize(stem))) errors.push("Stem duplicates an existing question");

  const options = item.options as Record<string, unknown> | undefined;
  const values = (["A", "B", "C"] as const).map((key) => (typeof options?.[key] === "string" ? (options[key] as string).trim() : ""));
  if (values.some((value) => value.length === 0)) errors.push("Each of A, B and C needs a non-empty choice");
  if (new Set(values.map(normalize)).size !== 3) errors.push("Choices must be unique");
  if (values.some((value) => value.length > 300)) errors.push("A choice is too long");
  if (values.some((value) => BANNED_CHOICES.some((pattern) => pattern.test(value)))) {
    errors.push("A choice uses a banned form (all/none of the above, combinations, cannot determine)");
  }

  if (!["A", "B", "C"].includes(String(item.correctOption))) errors.push("correctOption must be A, B or C");
  if (typeof item.algebraicSolution !== "string" || item.algebraicSolution.trim().length < 15) {
    errors.push("A worked solution is required");
  }
  const feedback = item.distractorAutopsy as Record<string, unknown> | undefined;
  if ((["A", "B", "C"] as const).some((key) => typeof feedback?.[key] !== "string" || (feedback[key] as string).trim().length < 10)) {
    errors.push("Every choice needs an explanation");
  }
  if (typeof item.trapCategory !== "string" || item.trapCategory.trim().length === 0) errors.push("trapCategory is required");

  return { valid: errors.length === 0, errors };
}

export interface GenerationPromptInput {
  topic: CFATopic;
  moduleTitle?: string;
  difficulty: string;
  focus?: string;
  questionCount: number;
  excludeStems?: string[];
}

/** Builds the model brief from the official 2027 learning modules and item rules. */
export function buildGenerationPrompt(input: GenerationPromptInput): string {
  const { topic, moduleTitle, difficulty, focus, questionCount, excludeStems = [] } = input;
  const modules = topic.subReadings
    .filter((module) => !moduleTitle || module.title === moduleTitle)
    .map((module) => `- ${module.losCode} ${module.title}: ${module.losStatement} (common trap: ${module.coreTrap})`)
    .join("\n");
  const difficultyGuide =
    difficulty === "institutional"
      ? "Advanced: multi-step reasoning or calculations that combine two concepts, still answerable in about 90 seconds."
      : difficulty === "high-trap"
        ? "Common traps: each wrong choice should be the result of a specific, frequent candidate mistake."
        : "Standard: one concept or one calculation per item.";

  return `You are an experienced CFA Program Level I item writer. Write exactly ${questionCount} new, standalone multiple-choice items for the February 2027 CFA Level I exam.

Topic: ${topic.name} (exam weight ${topic.weight})
${moduleTitle ? `Learning module to assess (all items must target it):` : `Learning modules to draw from (spread items across them):`}
${modules}
Difficulty: ${difficultyGuide}
${focus ? `Candidate's requested focus: "${focus}". Stay within the learning outcomes above.` : ""}

Item-writing rules (CFA Institute conventions):
${LEVEL_I_ITEM_RULES.map((rule) => `- ${rule}`).join("\n")}

Quality requirements:
- Verify every calculation before answering; the correct choice must be exactly right and each distractor must come from a specific, plausible mistake.
- Explain why each choice is right or wrong in one or two sentences. The explanation for the correct choice must start with "Correct.".
- Give a worked solution and, for calculations, TI BA II Plus keystrokes.
- Use realistic, fictional company and fund names. Do not reproduce CFA Institute curriculum text or copyrighted questions.
${excludeStems.length > 0 ? `- Do not repeat or closely paraphrase these existing items:\n${excludeStems.slice(-20).map((stem) => `  - ${stem}`).join("\n")}` : ""}

Return JSON only, matching the response schema: an object with a "questions" array. Each question has
losModule (the learning module title), stem, options {A, B, C}, correctOption ("A" | "B" | "C"), algebraicSolution,
calculatorKeystrokes, trapCategory, errorModeDefault (one of SIGN_INVERSION, BA2_MODE, PERIODICITY_MISMATCH,
GAAP_VS_IFRS, FORMULA_SCALAR, CONCEPTUAL_CONFUSION, READING_MISINTERPRETATION) and distractorAutopsy {A, B, C}.`;
}

/** Gemini structured-output schema (OpenAPI subset) for the item format above. */
export const GENERATION_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    questions: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          losModule: { type: "STRING" },
          stem: { type: "STRING" },
          options: {
            type: "OBJECT",
            properties: { A: { type: "STRING" }, B: { type: "STRING" }, C: { type: "STRING" } },
            required: ["A", "B", "C"],
          },
          correctOption: { type: "STRING", enum: ["A", "B", "C"] },
          algebraicSolution: { type: "STRING" },
          calculatorKeystrokes: { type: "STRING" },
          trapCategory: { type: "STRING" },
          errorModeDefault: {
            type: "STRING",
            enum: [
              "SIGN_INVERSION",
              "BA2_MODE",
              "PERIODICITY_MISMATCH",
              "GAAP_VS_IFRS",
              "FORMULA_SCALAR",
              "CONCEPTUAL_CONFUSION",
              "READING_MISINTERPRETATION",
            ],
          },
          distractorAutopsy: {
            type: "OBJECT",
            properties: { A: { type: "STRING" }, B: { type: "STRING" }, C: { type: "STRING" } },
            required: ["A", "B", "C"],
          },
        },
        required: ["stem", "options", "correctOption", "algebraicSolution", "trapCategory", "distractorAutopsy"],
      },
    },
  },
  required: ["questions"],
} as const;

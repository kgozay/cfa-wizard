import { z } from "zod";

export const OptionKeySchema = z.enum(["A", "B", "C"]);

export const PracticeModeSchema = z.enum(["standalone", "case-study"]);

export const ContentOriginSchema = z.enum(["authored", "procedural-fallback", "ai-draft"]);

export const ContentStatusSchema = z.enum(["draft", "validated", "approved", "rejected"]);

export const ErrorModeSchema = z.enum([
  "SIGN_INVERSION",
  "BA2_MODE",
  "PERIODICITY_MISMATCH",
  "GAAP_VS_IFRS",
  "FORMULA_SCALAR",
  "CONCEPTUAL_CONFUSION",
  "READING_MISINTERPRETATION",
  "UNSPECIFIED",
]);

export const ContentProvenanceSchema = z.object({
  origin: ContentOriginSchema,
  status: ContentStatusSchema,
  curriculumYear: z.number().int().min(2020).max(2035).optional(),
  sourceIds: z.array(z.string().max(200)),
  generatorVersion: z.string().max(50).optional(),
  promptVersion: z.string().max(50).optional(),
  model: z.string().max(100).optional(),
  createdAt: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}T/)),
  validatedAt: z.string().optional(),
  validationNotes: z.array(z.string().max(500)).optional(),
});

export const OptionsMapSchema = z.object({
  A: z.string().trim().min(1, "Option A cannot be empty").max(1000),
  B: z.string().trim().min(1, "Option B cannot be empty").max(1000),
  C: z.string().trim().min(1, "Option C cannot be empty").max(1000),
});

export const DistractorFeedbackMapSchema = z.object({
  A: z.string().trim().min(1, "Feedback A cannot be empty").max(2000),
  B: z.string().trim().min(1, "Feedback B cannot be empty").max(2000),
  C: z.string().trim().min(1, "Feedback C cannot be empty").max(2000),
});

export const ValidTopicIdSchema = z.enum([
  "01", "02", "03", "04", "05", "06", "07", "08", "09", "10"
]);

export const PracticeItemSchema = z.object({
  id: z.string().min(1).max(200),
  topicId: ValidTopicIdSchema,
  topicName: z.string().trim().min(1).max(100),
  subReading: z.string().trim().max(200).optional(),
  losCode: z.string().trim().max(50).optional(),
  mode: PracticeModeSchema,
  caseId: z.string().max(100).optional(),
  caseStem: z.string().trim().max(5000).optional(),
  stem: z.string().trim().min(5, "Question stem is too short").max(3000),
  options: OptionsMapSchema,
  correctOption: OptionKeySchema,
  solution: z.string().trim().min(5, "Solution must be provided").max(4000),
  calculatorKeystrokes: z.string().trim().max(500).optional(),
  trapCategory: z.string().trim().min(1).max(200),
  errorModeDefault: ErrorModeSchema.optional(),
  distractorFeedback: DistractorFeedbackMapSchema,
  provenance: ContentProvenanceSchema,
}).refine(
  (data) => {
    // Unique options text check
    const a = data.options.A.trim().toLowerCase();
    const b = data.options.B.trim().toLowerCase();
    const c = data.options.C.trim().toLowerCase();
    return a !== b && b !== c && a !== c;
  },
  {
    message: "All three options (A, B, C) must have distinct text",
    path: ["options"],
  }
);

export const PracticeItemsArraySchema = z.array(PracticeItemSchema).refine(
  (items) => {
    const ids = new Set<string>();
    for (const item of items) {
      if (ids.has(item.id)) return false;
      ids.add(item.id);
    }
    return true;
  },
  {
    message: "All items in a set must have unique IDs",
  }
);

export const ItemAttemptSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  sessionItemId: z.string(),
  sourceItemId: z.string(),
  topicId: z.string(),
  selectedOption: OptionKeySchema.nullable(),
  correctOption: OptionKeySchema,
  isCorrect: z.boolean(),
  timedOut: z.boolean(),
  timeSpentSeconds: z.number().nonnegative(),
  submittedAt: z.string(),
  trapCategory: z.string().optional(),
  errorMode: ErrorModeSchema.optional(),
});

export const PracticeAttemptSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  mode: z.enum(["practice", "sprint", "mock", "review"]),
  startedAt: z.string(),
  submittedAt: z.string(),
  totalTimeSeconds: z.number().nonnegative(),
  itemAttempts: z.array(ItemAttemptSchema),
  score: z.number().nonnegative(),
  total: z.number().positive(),
  topicIds: z.array(z.string()),
});

export const PresentedPracticeItemSchema = z.object({
  sourceItemId: z.string(),
  sessionItemId: z.string(),
  displayIndex: z.number().int().nonnegative(),
  topicId: z.string(),
  topicName: z.string(),
  subReading: z.string().optional(),
  losCode: z.string().optional(),
  mode: PracticeModeSchema,
  caseStem: z.string().optional(),
  stem: z.string(),
  options: OptionsMapSchema,
  correctOption: OptionKeySchema,
  solution: z.string(),
  calculatorKeystrokes: z.string().optional(),
  trapCategory: z.string(),
  errorModeDefault: ErrorModeSchema.optional(),
  distractorFeedback: DistractorFeedbackMapSchema,
  optionPermutation: z.record(OptionKeySchema, OptionKeySchema),
});

export const PracticeSessionSchema = z.object({
  id: z.string(),
  mode: z.enum(["practice", "sprint", "mock", "review"]),
  topicIds: z.array(z.string()),
  sourceSetIds: z.array(z.string()),
  seed: z.string(),
  itemIds: z.array(z.string()),
  presentedItems: z.array(PresentedPracticeItemSchema),
  startedAt: z.string(),
  completedAt: z.string().optional(),
  timerMode: z.enum(["timed", "untimed"]),
  targetSecondsPerItem: z.number().positive().optional(),
});

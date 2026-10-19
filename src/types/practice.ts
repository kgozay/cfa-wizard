import { ErrorMode } from "./cfa";

export type OptionKey = "A" | "B" | "C";

export type PracticeMode = "standalone" | "case-study";
export type ContentOrigin = "authored" | "procedural-fallback" | "ai-draft";
export type ContentStatus = "draft" | "validated" | "approved" | "rejected";

export interface ContentProvenance {
  origin: ContentOrigin;
  status: ContentStatus;
  curriculumYear?: number;
  sourceIds: string[];
  generatorVersion?: string;
  promptVersion?: string;
  model?: string;
  createdAt: string;
  validatedAt?: string;
  validationNotes?: string[];
}

export interface PracticeItem {
  id: string; // globally unique immutable source ID
  topicId: string;
  topicName: string;
  subReading?: string;
  losCode?: string;
  mode: PracticeMode;
  caseId?: string; // only for optional case-study mode
  caseStem?: string;
  stem: string;
  options: Record<OptionKey, string>;
  correctOption: OptionKey; // authoring key; never infer from position
  solution: string;
  calculatorKeystrokes?: string;
  trapCategory: string;
  errorModeDefault?: ErrorMode;
  distractorFeedback: Record<OptionKey, string>;
  provenance: ContentProvenance;
  /** Template that can regenerate this item with new numbers. */
  variantKey?: string;
  /** Set when the stem and options were generated from the variant template. */
  variantSeed?: string;
}

export interface PresentedPracticeItem {
  sessionItemId: string;
  sourceItemId: string;
  displayIndex: number;
  topicId: string;
  topicName: string;
  subReading?: string;
  losCode?: string;
  mode: PracticeMode;
  stem: string;
  caseStem?: string;
  options: Record<OptionKey, string>;
  correctOption: OptionKey;
  solution: string;
  calculatorKeystrokes?: string;
  trapCategory: string;
  errorModeDefault?: ErrorMode;
  distractorFeedback: Record<OptionKey, string>;
  optionPermutation: Record<OptionKey, OptionKey>;
  origin: ContentOrigin;
  contentStatus: ContentStatus;
  variantSeed?: string;
}

export interface PracticeSession {
  id: string;
  mode: "practice" | "sprint" | "mock" | "review";
  topicIds: string[];
  sourceSetIds: string[];
  seed: string;
  itemIds: string[];
  presentedItems: PresentedPracticeItem[];
  startedAt: string;
  completedAt?: string;
  timerMode: "timed" | "untimed";
  targetSecondsPerItem?: number;
  /** Set on mock sessions so the two half mocks can avoid each other's items. */
  mockExamType?: "quick_diagnostic_45" | "half_session_1" | "half_session_2" | "full_180";
}

export interface PracticeDraft {
  sessionId: string;
  answers: Record<string, OptionKey>;
  itemTimes: Record<string, number>;
  elapsedSeconds: number;
  scratchpadText: string;
  lastAnswerAt: number;
  updatedAt: string;
}

export interface ItemAttempt {
  id: string;
  sessionId: string;
  sessionItemId: string;
  sourceItemId: string;
  topicId: string;
  selectedOption: OptionKey | null;
  correctOption: OptionKey;
  isCorrect: boolean;
  timedOut: boolean;
  timeSpentSeconds: number;
  submittedAt: string;
  trapCategory?: string;
  errorMode?: ErrorMode;
  /** The chosen option in the item's authoring letters, independent of the shuffle. */
  selectedSourceOption?: OptionKey | null;
  /** Present when the candidate saw a generated variant rather than the authored numbers. */
  variantSeed?: string;
}

export interface PracticeAttempt {
  id: string;
  sessionId: string;
  mode: PracticeSession["mode"];
  startedAt: string;
  submittedAt: string;
  totalTimeSeconds: number;
  itemAttempts: ItemAttempt[];
  score: number;
  total: number;
  topicIds: string[];
  contentOrigins?: ContentOrigin[];
  containsDraftContent?: boolean;
}

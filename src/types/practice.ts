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

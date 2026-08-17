export type TopicWeightCategory = "HIGH" | "MEDIUM" | "STANDARD";

export type OptionKey = "A" | "B" | "C";

export type ErrorMode =
  | "SIGN_INVERSION"
  | "BA2_MODE"
  | "PERIODICITY_MISMATCH"
  | "GAAP_VS_IFRS"
  | "FORMULA_SCALAR"
  | "CONCEPTUAL_CONFUSION"
  | "READING_MISINTERPRETATION"
  | "UNSPECIFIED";

export interface FormulaVariable {
  name: string;
  symbol: string;
  defaultVal: number;
  step?: number;
  unit?: string;
}

export interface FormulaItem {
  id: string;
  title: string;
  latex: string;
  description: string;
  losCode?: string;
  calculatorKeystrokes?: string;
  variables?: FormulaVariable[];
  compute?: (vars: Record<string, number>) => { result: number | string; display: string; keystrokeNotes?: string };
}

export interface SubReading {
  id: string;
  title: string;
  coreTrap: string;
  readingNumber?: number;
  losCode?: string;
  losStatement?: string;
  formulaIds?: string[];
}

export interface CFATopic {
  id: string; // "01" through "10"
  name: string; // Official name, e.g. "Corporate Finance", "Quantitative Methods"
  shortName: string;
  weight: string; // e.g. "11–14%"
  weightCategory: TopicWeightCategory;
  highYieldTrapArea: string;
  executiveSummary: string[];
  subReadings: SubReading[];
  formulas: FormulaItem[];
}

export interface DistractorAutopsyMap {
  A: string;
  B: string;
  C: string;
}

export interface VignetteQuestion {
  id: number;
  stem: string;
  options: {
    A: string;
    B: string;
    C: string;
  };
  correctOption: OptionKey;
  algebraicSolution: string;
  calculatorKeystrokes: string;
  trapCategory: string;
  errorModeDefault?: ErrorMode;
  losCode?: string;
  distractorAutopsy: DistractorAutopsyMap;
}

export interface VignetteSet {
  id: string;
  topicId: string;
  topicName: string;
  subReading: string;
  difficulty: "Standard" | "High Trap" | "Institutional";
  vignetteStem: string;
  questions: VignetteQuestion[];
}

export interface QuestionSubmission {
  questionId: number;
  selectedOption: OptionKey;
  isCorrect: boolean;
  trapTriggered?: string;
  errorModeLogged?: ErrorMode;
  timeSpentSeconds?: number;
}

export interface VignetteSessionResult {
  vignetteId: string;
  topicId: string;
  submittedAt: string;
  score: number;
  total: number;
  userAnswers: Record<number, OptionKey>;
  submissions: QuestionSubmission[];
  trapsTriggered: string[];
  totalTimeSeconds?: number;
  timerModeUsed?: "timed_90s" | "untimed";
}

export interface TrapLogEntry {
  id: string;
  topicId: string;
  topicName: string;
  subReading?: string;
  trapName: string;
  trapCategory?: string;
  questionId?: number;
  questionStem: string;
  options?: { A: string; B: string; C: string };
  selectedOption?: OptionKey;
  userChoice?: OptionKey;
  correctOption: OptionKey;
  autopsyExplanation: string;
  calculatorKeystrokes?: string;
  timestamp: string;
  errorMode?: ErrorMode;
  leitnerBox?: number; // 1 = daily, 2 = 3-day, 3 = 7-day
  nextReviewDate?: string;
}

export interface LeitnerCard {
  id: string;
  trapLogId: string;
  topicId: string;
  topicName: string;
  questionStem: string;
  options: { A: string; B: string; C: string };
  correctOption: OptionKey;
  solution: string;
  keystrokes: string;
  trapName: string;
  errorMode: ErrorMode;
  box: 1 | 2 | 3;
  lastReviewedAt?: string;
  nextReviewAt: string;
  reviewCount: number;
}

export interface SprintQuestionResult {
  questionId: number;
  topicId: string;
  topicName: string;
  selectedOption: OptionKey;
  correctOption: OptionKey;
  isCorrect: boolean;
  timeSpentSeconds: number;
  trapCategory: string;
}

export interface InterleavedSprintSession {
  id: string;
  timestamp: string;
  totalQuestions: number;
  score: number;
  totalDurationSeconds: number;
  questionResults: SprintQuestionResult[];
  topicBreakdown: Record<string, { total: number; correct: number }>;
}

export type TopicWeightCategory = "HIGH" | "MEDIUM" | "STANDARD";

export type OptionKey = "A" | "B" | "C";

export interface FormulaItem {
  id: string;
  title: string;
  latex: string;
  description: string;
  calculatorKeystrokes?: string;
  variables?: { name: string; symbol: string; defaultVal: number; step?: number; unit?: string }[];
  compute?: (vars: Record<string, number>) => { result: number | string; display: string; keystrokeNotes?: string };
}

export interface SubReading {
  id: string;
  title: string;
  coreTrap: string;
  readingNumber?: number;
  formulaIds?: string[];
}

export interface CFATopic {
  id: string; // "01", "02", ... "10"
  name: string;
  shortName: string;
  weight: string; // e.g. "15–20%"
  weightCategory: TopicWeightCategory;
  highYieldTrapArea: string;
  executiveSummary: string[];
  subReadings: SubReading[];
  formulas: FormulaItem[];
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
  distractorAutopsy: {
    A: string;
    B: string;
    C: string;
  };
}

export interface VignetteSet {
  id: string;
  topicId: string;
  topicName: string;
  subReading: string;
  difficulty: "Standard" | "High Trap" | "Institutional";
  vignetteStem: string;
  questions: [VignetteQuestion, VignetteQuestion];
}

export interface QuestionSubmission {
  questionId: number;
  selectedOption: OptionKey;
  isCorrect: boolean;
  trapTriggered?: string;
}

export interface VignetteSessionResult {
  vignetteId: string;
  topicId: string;
  submittedAt: string;
  score: number; // 0, 1, 2
  total: 2;
  userAnswers: Record<number, OptionKey>;
  submissions: QuestionSubmission[];
  trapsTriggered: string[];
}

export interface TrapLogEntry {
  id: string;
  topicId: string;
  topicName: string;
  subReading: string;
  trapName: string;
  questionStem: string;
  selectedOption: OptionKey;
  correctOption: OptionKey;
  autopsyExplanation: string;
  timestamp: string;
}

import { OptionKey, ErrorMode, DistractorAutopsyMap } from "./cfa";

export type MockExamType =
  | "quick_diagnostic_45"
  | "half_session_1"
  | "half_session_2"
  | "full_180";

export interface MockQuestionItem {
  id: number;
  globalIndex: number; // 1-based index in mock (1 to 45/90/180)
  topicId: string;
  topicName: string;
  subReading?: string;
  losCode?: string;
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
  distractorAutopsy: DistractorAutopsyMap;
}

export interface MockTopicScore {
  topicId: string;
  topicName: string;
  weight: string;
  total: number;
  correct: number;
  accuracy: number;
  status: "MASTERED" | "COMPETENT" | "NEEDS_WORK" | "CRITICAL";
}

export interface MockExamSession {
  id: string;
  examType: MockExamType;
  title: string;
  totalQuestions: number;
  allocatedMinutes: number;
  timeSpentSeconds: number;
  userAnswers: Record<number, OptionKey>;
  flaggedQuestionIds: number[];
  startedAt: string;
  submittedAt?: string;
  score: number;
  accuracy: number;
  isPassedMps: boolean; // >= 70%
  topicBreakdowns: MockTopicScore[];
  questions: MockQuestionItem[];
}

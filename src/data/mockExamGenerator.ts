import { CFA_VIGNETTES } from "./vignettes";
import { CFA_CURRICULUM } from "./curriculum";
import { MockExamSession, MockExamType, MockQuestionItem, MockTopicScore } from "@/types/mockExam";
import { OptionKey, TrapLogEntry } from "@/types/cfa";

// Fisher-Yates in-place shuffle helper
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Builds a curated, weighted Mock Exam Session with randomized question ordering.
 */
export function generateMockExamSession(
  examType: MockExamType,
  customVignettes: import("@/types/cfa").VignetteSet[] = []
): MockExamSession {
  const allVignettes = [...CFA_VIGNETTES, ...customVignettes];
  
  // Topic Pools
  const topicQuestionPool: Record<string, {
    topicId: string;
    topicName: string;
    subReading?: string;
    question: import("@/types/cfa").VignetteQuestion;
  }[]> = {};

  allVignettes.forEach((vig) => {
    if (!topicQuestionPool[vig.topicId]) {
      topicQuestionPool[vig.topicId] = [];
    }
    vig.questions.forEach((q) => {
      topicQuestionPool[vig.topicId].push({
        topicId: vig.topicId,
        topicName: vig.topicName,
        subReading: vig.subReading,
        question: q,
      });
    });
  });

  // Target questions per topic based on mock type and CFA official weights
  let targetCounts: Record<string, number> = {};
  let totalTarget = 45;
  let allocatedMinutes = 68; // ~90 sec / Q
  let title = "Quick Diagnostic Mock (45 Questions)";

  if (examType === "quick_diagnostic_45") {
    totalTarget = 45;
    allocatedMinutes = 68;
    title = "CFA Level 1 Diagnostic Half-Speed Mock (45 Questions)";
    targetCounts = {
      "10": 8, // Ethics (18%)
      "01": 5, // Quant (11%)
      "02": 3, // Econ (7%)
      "04": 6, // FSA (13%)
      "03": 4, // Corp Issuers (9%)
      "05": 5, // Equity (11%)
      "06": 6, // Fixed Income (13%)
      "07": 2, // Derivs (5%)
      "08": 2, // Alts (5%)
      "09": 4, // Portfolio (9%)
    };
  } else if (examType === "half_session_1") {
    totalTarget = 90;
    allocatedMinutes = 135;
    title = "Official Mock: Session 1 (Ethics, Quant, Econ, FSA)";
    targetCounts = {
      "10": 26, // Ethics
      "01": 20, // Quant
      "02": 16, // Econ
      "04": 28, // FSA
    };
  } else if (examType === "half_session_2") {
    totalTarget = 90;
    allocatedMinutes = 135;
    title = "Official Mock: Session 2 (Corp Issuers, Equity, FI, Derivs, Alts, PM)";
    targetCounts = {
      "03": 14, // Corp Issuers
      "05": 20, // Equity
      "06": 22, // Fixed Income
      "07": 10, // Derivatives
      "08": 10, // Alternatives
      "09": 14, // Portfolio Management
    };
  } else {
    // full_180
    totalTarget = 180;
    allocatedMinutes = 270;
    title = "CFA Level 1 Full Simulation Mock (180 Questions)";
    targetCounts = {
      "10": 30, // Ethics ~16.7%
      "01": 20, // Quant ~11%
      "02": 14, // Econ ~7.8%
      "04": 24, // FSA ~13.3%
      "03": 16, // Corp Issuers ~8.9%
      "05": 22, // Equity ~12.2%
      "06": 24, // Fixed Income ~13.3%
      "07": 10, // Derivatives ~5.5%
      "08": 10, // Alternatives ~5.5%
      "09": 10, // Portfolio Management ~5.5%
    };
  }

  // Sample questions according to target counts
  const selectedRawQuestions: {
    topicId: string;
    topicName: string;
    subReading?: string;
    question: import("@/types/cfa").VignetteQuestion;
  }[] = [];

  Object.entries(targetCounts).forEach(([topicId, count]) => {
    const pool = topicQuestionPool[topicId] || [];
    const shuffledPool = shuffleArray(pool);
    
    // Pick required amount (cycle if pool is smaller than target)
    for (let i = 0; i < count; i++) {
      if (shuffledPool.length > 0) {
        selectedRawQuestions.push(shuffledPool[i % shuffledPool.length]);
      }
    }
  });

  // Shuffle all questions so topics are interleaved realistically
  const randomizedMockList = shuffleArray(selectedRawQuestions);

  const mockQuestions: MockQuestionItem[] = randomizedMockList.map((item, index) => ({
    id: item.question.id * 1000 + index, // unique ID in this mock
    globalIndex: index + 1,
    topicId: item.topicId,
    topicName: item.topicName,
    subReading: item.subReading,
    losCode: item.question.losCode,
    stem: item.question.stem,
    options: item.question.options,
    correctOption: item.question.correctOption,
    algebraicSolution: item.question.algebraicSolution,
    calculatorKeystrokes: item.question.calculatorKeystrokes,
    trapCategory: item.question.trapCategory,
    errorModeDefault: item.question.errorModeDefault,
    distractorAutopsy: item.question.distractorAutopsy,
  }));

  const initialTopicScores: MockTopicScore[] = CFA_CURRICULUM.map((topic) => ({
    topicId: topic.id,
    topicName: topic.name,
    weight: topic.weight,
    total: mockQuestions.filter((q) => q.topicId === topic.id).length,
    correct: 0,
    accuracy: 0,
    status: "NEEDS_WORK" as const,
  })).filter((t) => t.total > 0);

  return {
    id: `mock-${examType}-${Date.now()}`,
    examType,
    title,
    totalQuestions: mockQuestions.length,
    allocatedMinutes,
    timeSpentSeconds: 0,
    userAnswers: {},
    flaggedQuestionIds: [],
    startedAt: new Date().toISOString(),
    score: 0,
    accuracy: 0,
    isPassedMps: false,
    topicBreakdowns: initialTopicScores,
    questions: mockQuestions,
  };
}

/**
 * Computes official post-mock results, breakdown, and trap logs for spaced repetition.
 */
export function gradeMockExam(
  session: MockExamSession
): {
  gradedSession: MockExamSession;
  generatedTraps: TrapLogEntry[];
} {
  let correctCount = 0;
  const traps: TrapLogEntry[] = [];
  const topicStats: Record<string, { total: number; correct: number; topicName: string }> = {};

  session.questions.forEach((q) => {
    if (!topicStats[q.topicId]) {
      topicStats[q.topicId] = { total: 0, correct: 0, topicName: q.topicName };
    }
    topicStats[q.topicId].total += 1;

    const chosen = session.userAnswers[q.id];
    const isCorrect = chosen === q.correctOption;

    if (isCorrect) {
      correctCount += 1;
      topicStats[q.topicId].correct += 1;
    } else {
      traps.push({
        id: `mock-trap-${Date.now()}-${q.id}`,
        topicId: q.topicId,
        topicName: q.topicName,
        subReading: q.subReading,
        trapName: q.trapCategory,
        questionId: q.id,
        questionStem: q.stem,
        options: q.options,
        userChoice: chosen,
        selectedOption: chosen,
        correctOption: q.correctOption,
        autopsyExplanation: chosen ? q.distractorAutopsy[chosen] : q.algebraicSolution,
        calculatorKeystrokes: q.calculatorKeystrokes,
        timestamp: new Date().toISOString(),
        errorMode: q.errorModeDefault || "UNSPECIFIED",
      });
    }
  });

  const accuracy = session.questions.length > 0
    ? Math.round((correctCount / session.questions.length) * 100)
    : 0;

  const topicBreakdowns: MockTopicScore[] = Object.entries(topicStats).map(([tId, stat]) => {
    const cur = CFA_CURRICULUM.find((c) => c.id === tId);
    const acc = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
    let status: MockTopicScore["status"] = "NEEDS_WORK";
    if (acc >= 80) status = "MASTERED";
    else if (acc >= 70) status = "COMPETENT";
    else if (acc >= 55) status = "NEEDS_WORK";
    else status = "CRITICAL";

    return {
      topicId: tId,
      topicName: stat.topicName,
      weight: cur?.weight || "8–11%",
      total: stat.total,
      correct: stat.correct,
      accuracy: acc,
      status,
    };
  });

  const gradedSession: MockExamSession = {
    ...session,
    score: correctCount,
    accuracy,
    isPassedMps: accuracy >= 70,
    submittedAt: new Date().toISOString(),
    topicBreakdowns,
  };

  return { gradedSession, generatedTraps: traps };
}

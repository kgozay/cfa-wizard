import { CFA_VIGNETTES } from "./vignettes";
import { CFA_CURRICULUM } from "./curriculum";
import { MockExamSession, MockExamType, MockQuestionItem, MockTopicScore } from "@/types/mockExam";
import { TrapLogEntry } from "@/types/cfa";
import { PracticeItem } from "@/types/practice";
import { legacyVignetteToPracticeItems } from "@/lib/practice/adapters";
import { createPracticeSession } from "@/lib/practice/createSession";

// Quotas follow the February 2027 Level I topic weights: Quant, FSA, Equities, Fixed Income
// 11–14%; Ethics 10–15%; Portfolio Construction 8–12%; Economics, Corporate Finance,
// Derivatives and Alternative Investments 6–9%. The two half mocks together make one full mock.
export const MOCK_TOPIC_QUOTAS: Record<MockExamType, Record<string, number>> = {
  quick_diagnostic_45: { "01": 6, "02": 3, "03": 3, "04": 6, "05": 6, "06": 6, "07": 3, "08": 3, "09": 4, "10": 5 },
  half_session_1: { "01": 11, "02": 6, "03": 7, "04": 11, "05": 11, "06": 11, "07": 7, "08": 6, "09": 9, "10": 11 },
  half_session_2: { "01": 11, "02": 7, "03": 6, "04": 11, "05": 11, "06": 11, "07": 6, "08": 7, "09": 9, "10": 11 },
  full_180: { "01": 22, "02": 13, "03": 13, "04": 22, "05": 22, "06": 22, "07": 13, "08": 13, "09": 18, "10": 22 },
};

export function getMockExamShortages(examType: MockExamType): Array<{ topicId: string; requested: number; available: number }> {
  const availableByTopic = CFA_VIGNETTES.reduce<Record<string, number>>((counts, vignette) => {
    counts[vignette.topicId] = (counts[vignette.topicId] || 0) + vignette.questions.length;
    return counts;
  }, {});
  return Object.entries(MOCK_TOPIC_QUOTAS[examType])
    .map(([topicId, requested]) => ({ topicId, requested, available: availableByTopic[topicId] || 0 }))
    .filter(({ requested, available }) => available < requested);
}

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
  _customVignettes: import("@/types/cfa").VignetteSet[] = []
): MockExamSession {
  // Approved authored content only for mock exams (quarantine unapproved generated drafts)
  const allVignettes = CFA_VIGNETTES;
  
  // Topic Pools
  const topicQuestionPool: Record<string, PracticeItem[]> = {};

  allVignettes.forEach((vig) => {
    if (!topicQuestionPool[vig.topicId]) {
      topicQuestionPool[vig.topicId] = [];
    }
    topicQuestionPool[vig.topicId].push(...legacyVignetteToPracticeItems(vig));
  });

  // Target questions per topic based on mock type and CFA official weights
  const targetCounts = MOCK_TOPIC_QUOTAS[examType];
  let totalTarget = 45;
  let allocatedMinutes = 68; // ~90 sec / Q
  let title = "Quick Diagnostic Mock (45 Questions)";

  if (examType === "quick_diagnostic_45") {
    totalTarget = 45;
    allocatedMinutes = 68;
    title = "Level I Quick Diagnostic Mock (45 Questions)";
  } else if (examType === "half_session_1") {
    totalTarget = 90;
    allocatedMinutes = 135;
    title = "Level I Half Mock A (90 Questions)";
  } else if (examType === "half_session_2") {
    totalTarget = 90;
    allocatedMinutes = 135;
    title = "Level I Half Mock B (90 Questions)";
  } else {
    // full_180
    totalTarget = 180;
    allocatedMinutes = 270;
    title = "Level I Full Mock (180 Questions)";
  }

  // Sample questions according to target counts without repeating questions
  const shortages = getMockExamShortages(examType);
  if (shortages.length > 0) {
    const details = shortages
      .map(({ topicId, requested, available }) => `topic ${topicId}: ${available}/${requested}`)
      .join(", ");
    throw new Error(`This mock cannot be assembled without repeating questions (${details}). Choose a smaller mock while the authored bank is expanded.`);
  }

  const selectedItems: PracticeItem[] = [];

  Object.entries(targetCounts).forEach(([topicId, count]) => {
    const pool = topicQuestionPool[topicId] || [];
    const shuffledPool = shuffleArray(pool);
    selectedItems.push(...shuffledPool.slice(0, count));
  });

  const practiceSession = createPracticeSession({
    mode: "mock",
    items: selectedItems,
    requestedCount: totalTarget,
    shuffleQuestions: true,
    timerMode: "timed",
  });

  const mockQuestions: MockQuestionItem[] = practiceSession.presentedItems.map((item, index) => {
    return {
      id: index + 1,
      sourceItemId: item.sourceItemId,
      sessionItemId: item.sessionItemId,
      globalIndex: index + 1,
      topicId: item.topicId,
      topicName: item.topicName,
      subReading: item.subReading,
      losCode: item.losCode,
      stem: item.stem,
      options: item.options,
      correctOption: item.correctOption,
      algebraicSolution: item.solution,
      calculatorKeystrokes: item.calculatorKeystrokes || "",
      trapCategory: item.trapCategory,
      errorModeDefault: item.errorModeDefault,
      distractorAutopsy: item.distractorFeedback,
    };
  });

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
    practiceSession,
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
        solution: q.algebraicSolution,
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
      weight: cur?.weight || "8–12%",
      total: stat.total,
      correct: stat.correct,
      accuracy: acc,
      status,
    };
  }).sort((a, b) => a.topicId.localeCompare(b.topicId));

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

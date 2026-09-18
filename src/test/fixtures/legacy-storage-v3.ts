/**
 * Realistic version-3 persisted Zustand store fixture.
 * Represents state persisted in localStorage under key 'cfa-wizard-storage-v3'.
 */

export interface LegacyStorageV3Payload {
  state: {
    completedTopicIds: string[];
    inProgressTopicId: string;
    vignetteResults: Record<string, {
      vignetteId: string;
      topicId: string;
      submittedAt: string;
      score: number;
      total: number;
      userAnswers: Record<number, "A" | "B" | "C">;
      submissions: Array<{
        questionId: number;
        selectedOption: "A" | "B" | "C";
        isCorrect: boolean;
        trapTriggered?: string;
        errorModeLogged?: string;
        timeSpentSeconds?: number;
      }>;
      trapsTriggered: string[];
      totalTimeSeconds?: number;
      timerModeUsed?: "timed_90s" | "untimed";
    }>;
    trapLogs: Array<{
      id: string;
      topicId: string;
      topicName: string;
      subReading?: string;
      trapName: string;
      trapCategory?: string;
      questionId?: number;
      questionStem: string;
      options?: { A: string; B: string; C: string };
      selectedOption?: "A" | "B" | "C";
      correctOption: "A" | "B" | "C";
      autopsyExplanation: string;
      calculatorKeystrokes?: string;
      timestamp: string;
      errorMode?: string;
      leitnerBox?: number;
      nextReviewDate?: string;
    }>;
    customVignettes: Array<{
      id: string;
      topicId: string;
      topicName: string;
      subReading: string;
      difficulty: "Standard" | "High Trap" | "Institutional";
      vignetteStem: string;
      questions: Array<{
        id: number;
        stem: string;
        options: { A: string; B: string; C: string };
        correctOption: "A" | "B" | "C";
        algebraicSolution: string;
        calculatorKeystrokes: string;
        trapCategory: string;
        errorModeDefault?: string;
        distractorAutopsy: { A: string; B: string; C: string };
      }>;
    }>;
    leitnerCards: Array<{
      id: string;
      trapLogId: string;
      topicId: string;
      topicName: string;
      questionStem: string;
      options: { A: string; B: string; C: string };
      correctOption: "A" | "B" | "C";
      solution: string;
      keystrokes: string;
      trapName: string;
      errorMode: string;
      box: 1 | 2 | 3;
      lastReviewedAt?: string;
      nextReviewAt: string;
      reviewCount: number;
    }>;
    soundEnabled: boolean;
    drillQuestionCount: 2 | 5 | 10 | 15;
    isPacingTimerEnabled: boolean;
  };
  version: number;
}

export const LEGACY_STORAGE_V3_FIXTURE: LegacyStorageV3Payload = {
  version: 0, // Zustand persist default before explicit versioning
  state: {
    completedTopicIds: ["01"],
    inProgressTopicId: "02",
    vignetteResults: {
      "vignette-quant-01": {
        vignetteId: "vignette-quant-01",
        topicId: "01",
        submittedAt: "2026-09-15T14:30:00.000Z",
        score: 5,
        total: 5,
        userAnswers: { 1: "A", 2: "A", 3: "A", 4: "A", 5: "A" },
        submissions: [
          { questionId: 1, selectedOption: "A", isCorrect: true, timeSpentSeconds: 45 },
          { questionId: 2, selectedOption: "A", isCorrect: true, timeSpentSeconds: 60 },
          { questionId: 3, selectedOption: "A", isCorrect: true, timeSpentSeconds: 50 },
          { questionId: 4, selectedOption: "A", isCorrect: true, timeSpentSeconds: 40 },
          { questionId: 5, selectedOption: "A", isCorrect: true, timeSpentSeconds: 55 },
        ],
        trapsTriggered: [],
        totalTimeSeconds: 250,
        timerModeUsed: "timed_90s",
      },
      "vignette-econ-01": {
        vignetteId: "vignette-econ-01",
        topicId: "02",
        submittedAt: "2026-09-16T10:15:00.000Z",
        score: 3,
        total: 5,
        userAnswers: { 1: "A", 2: "B", 3: "A", 4: "C", 5: "A" },
        submissions: [
          { questionId: 1, selectedOption: "A", isCorrect: true, timeSpentSeconds: 50 },
          { questionId: 2, selectedOption: "B", isCorrect: false, trapTriggered: "Elasticity Direction Reversal", errorModeLogged: "SIGN_INVERSION", timeSpentSeconds: 85 },
          { questionId: 3, selectedOption: "A", isCorrect: true, timeSpentSeconds: 45 },
          { questionId: 4, selectedOption: "C", isCorrect: false, trapTriggered: "Cross-Price Complement Confusion", errorModeLogged: "CONCEPTUAL_CONFUSION", timeSpentSeconds: 90 },
          { questionId: 5, selectedOption: "A", isCorrect: true, timeSpentSeconds: 60 },
        ],
        trapsTriggered: ["Elasticity Direction Reversal", "Cross-Price Complement Confusion"],
        totalTimeSeconds: 330,
        timerModeUsed: "timed_90s",
      },
    },
    trapLogs: [
      {
        id: "trap-econ-01-q2",
        topicId: "02",
        topicName: "Economics",
        subReading: "Firms and Market Structures",
        trapName: "Elasticity Direction Reversal",
        trapCategory: "Sign / Direction",
        questionId: 2,
        questionStem: "If the price elasticity of demand is -1.5 and price falls by 10%, quantity demanded will:",
        options: {
          A: "Increase by 15%",
          B: "Decrease by 15%",
          C: "Increase by 1.5%",
        },
        selectedOption: "B",
        correctOption: "A",
        autopsyExplanation: "Price and quantity demanded move inversely for ordinary goods. A price drop causes quantity to increase.",
        calculatorKeystrokes: "N/A - Conceptual derivation",
        timestamp: "2026-09-16T10:16:30.000Z",
        errorMode: "SIGN_INVERSION",
        leitnerBox: 1,
        nextReviewDate: "2026-09-17T10:16:30.000Z",
      },
    ],
    customVignettes: [
      {
        id: "custom-vignette-ai-quant-1726600000",
        topicId: "01",
        topicName: "Quantitative Methods",
        subReading: "Time Value of Money",
        difficulty: "Standard",
        vignetteStem: "An analyst is evaluating an ordinary annuity and an annuity due with identical parameters.",
        questions: [
          {
            id: 1,
            stem: "Which of the following statements comparing an annuity due to an ordinary annuity is most accurate?",
            options: {
              A: "The present value of an annuity due exceeds that of an ordinary annuity by a factor of (1 + r).",
              B: "The future value of an ordinary annuity exceeds that of an annuity due.",
              C: "Cash flows occur at the end of each period for an annuity due.",
            },
            correctOption: "A",
            algebraicSolution: "PV(due) = PV(ordinary) * (1 + r). Cash flows occur one period earlier.",
            calculatorKeystrokes: "2nd [BGN] 2nd [SET]",
            trapCategory: "Periodicity / Timing",
            distractorAutopsy: {
              A: "Correct. Annuity due cash flows are discounted one period less.",
              B: "Incorrect. Annuity due compounds for one additional period.",
              C: "Incorrect. Annuity due cash flows occur at the start of each period.",
            },
          },
        ],
      },
    ],
    leitnerCards: [
      {
        id: "card-trap-econ-01-q2",
        trapLogId: "trap-econ-01-q2",
        topicId: "02",
        topicName: "Economics",
        questionStem: "If the price elasticity of demand is -1.5 and price falls by 10%, quantity demanded will:",
        options: {
          A: "Increase by 15%",
          B: "Decrease by 15%",
          C: "Increase by 1.5%",
        },
        correctOption: "A",
        solution: "Price and quantity demanded move inversely for ordinary goods. A price drop causes quantity to increase.",
        keystrokes: "N/A",
        trapName: "Elasticity Direction Reversal",
        errorMode: "SIGN_INVERSION" as const,
        box: 1,
        lastReviewedAt: undefined,
        nextReviewAt: "2026-09-17T10:16:30.000Z",
        reviewCount: 0,
      },
    ],
    soundEnabled: true,
    drillQuestionCount: 5,
    isPacingTimerEnabled: true,
  },
};

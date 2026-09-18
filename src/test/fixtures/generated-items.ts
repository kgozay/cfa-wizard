/**
 * Fixtures for AI and procedural generated items.
 * Used to test validation schemas, deduplication, and quarantine logic.
 */

export const SAMPLE_VALID_GENERATED_SET = {
  requestId: "req-test-quant-001",
  topicId: "01",
  topicName: "Quantitative Methods",
  subReading: "Time Value of Money",
  difficulty: "Standard" as const,
  vignetteStem: "An institutional portfolio manager is calculating present values for structured cash flow streams.",
  questions: [
    {
      id: 1,
      stem: "An investor is offered an investment paying $10,000 annually for 5 years, starting immediately. At a discount rate of 6%, the present value is closest to:",
      options: {
        A: "$44,651",
        B: "$42,124",
        C: "$47,330",
      },
      correctOption: "A" as const,
      algebraicSolution: "PV(due) = PMT * [(1 - (1+r)^-n)/r] * (1+r) = 10,000 * 4.21236 * 1.06 = $44,651.",
      calculatorKeystrokes: "2nd [BGN] 2nd [SET] 2nd [QUIT] 5 [N] 6 [I/Y] 10000 [PMT] [CPT] [PV]",
      trapCategory: "Periodicity / Timing",
      distractorAutopsy: {
        A: "Correct. Annuity due formula applies because payments begin immediately.",
        B: "Ordinary annuity error: failed to switch BA II Plus to BGN mode.",
        C: "Compounding error: compounded rather than discounted.",
      },
    },
    {
      id: 2,
      stem: "Which of the following compounding frequencies produces the highest effective annual rate (EAR) for a stated annual rate of 8%?",
      options: {
        A: "Continuous",
        B: "Monthly",
        C: "Semi-annual",
      },
      correctOption: "A" as const,
      algebraicSolution: "EAR = e^r - 1 = e^0.08 - 1 = 8.3287%. Continuous compounding represents the mathematical upper bound.",
      calculatorKeystrokes: "0.08 [2nd] [e^x] - 1 = 0.0833",
      trapCategory: "Formula & Scalar",
      distractorAutopsy: {
        A: "Correct. As m -> infinity, (1 + r/m)^m approaches e^r.",
        B: "Incorrect. Monthly compounding yields (1 + 0.08/12)^12 - 1 = 8.3000% < continuous.",
        C: "Incorrect. Semi-annual compounding yields (1 + 0.04)^2 - 1 = 8.1600% < continuous.",
      },
    },
  ],
};

export const SAMPLE_MALFORMED_GENERATED_SET = {
  // Missing required fields (no topicId, questions not array, missing option C)
  difficulty: "Extreme_Difficulty",
  questions: [
    {
      id: 1,
      stem: "",
      options: {
        A: "Only A",
        B: "Only B",
      },
      correctOption: "Z",
    },
  ],
};

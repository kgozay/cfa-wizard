"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  Calculator,
  Grid,
  X,
  AlertCircle,
} from "lucide-react";
import { MockExamSession, MockExamType } from "@/types/mockExam";
import { generateMockExamSession, gradeMockExam, getMockExamShortages } from "@/data/mockExamGenerator";
import { MockScorecardView } from "./MockScorecardView";
import { FormattedMathText } from "@/components/common/KaTeXRenderer";
import { useCFAStore } from "@/store/useCFAStore";
import { OptionKey } from "@/types/cfa";
import { sound } from "@/components/common/SoundEffects";
import { gradeAttempt } from "@/lib/practice/gradeAttempt";
import { useAccessibleDialog } from "@/hooks/useAccessibleDialog";
import { getMockElapsedSeconds, getMockRemainingSeconds } from "@/lib/practice/mockTiming";
import { hasCurrentAnswerKey } from "@/lib/practice/eligibility";
import { shouldIgnoreShortcut } from "@/lib/keyboard";

interface MockExamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MockExamModal: React.FC<MockExamModalProps> = ({ isOpen, onClose }) => {
  const {
    soundEnabled,
    customVignettes,
    recordPracticeAttempt,
    savePracticeSession,
    mockExamDraft,
    setMockExamDraft,
    calculatorMode,
    setCalculatorMode } = useCFAStore();

  const [selectedExamType, setSelectedExamType] = useState<MockExamType>("quick_diagnostic_45");
  const [session, setSession] = useState<MockExamSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isNavigatorOpen, setIsNavigatorOpen] = useState<boolean>(false);
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState<boolean>(false);
  const [isGraded, setIsGraded] = useState<boolean>(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [now, setNow] = useState<number>(Date.now());

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const itemTimesRef = useRef<Record<string, number>>({});
  const questionStartedAtRef = useRef<number>(Date.now());
  const submissionRef = useRef(false);
  const [isLeaveConfirmOpen, setIsLeaveConfirmOpen] = useState<boolean>(false);
  // Escape or the close button during a live exam asks first: the clock keeps running
  const requestClose = useCallback(() => {
    if (session && !isGraded) {
      if (isSubmitConfirmOpen) setIsSubmitConfirmOpen(false);
      else setIsLeaveConfirmOpen((open) => !open);
      return;
    }
    onClose();
  }, [isGraded, isSubmitConfirmOpen, onClose, session]);
  const dialogRef = useAccessibleDialog<HTMLDivElement>(isOpen, requestClose);

  // Initialize or start new mock exam
  const handleStartExam = useCallback(
    (type: MockExamType) => {
      if (soundEnabled) sound.playNodeSwitch();
      try {
        const newSession = generateMockExamSession(type, customVignettes);
        savePracticeSession(newSession.practiceSession, false);
        setSession(newSession);
        setCurrentIndex(0);
        setIsGraded(false);
        setIsSubmitConfirmOpen(false);
        setStartError(null);
        itemTimesRef.current = {};
        questionStartedAtRef.current = Date.now();
        submissionRef.current = false;
        setNow(Date.now());
      } catch (error) {
        setStartError(error instanceof Error ? error.message : "Unable to assemble this mock.");
      }
    },
    [customVignettes, savePracticeSession, soundEnabled]
  );

  const handleResumeExam = useCallback(() => {
    if (!mockExamDraft) return;
    if (!hasCurrentAnswerKey(mockExamDraft.session.practiceSession)) {
      setMockExamDraft(null);
      setStartError("This saved mock contains a corrected answer. Start a new mock to use the current question bank.");
      return;
    }
    setSession(mockExamDraft.session);
    setCurrentIndex(mockExamDraft.currentIndex);
    itemTimesRef.current = { ...mockExamDraft.itemTimes };
    questionStartedAtRef.current = mockExamDraft.currentQuestionStartedAt || Date.now();
    submissionRef.current = false;
    setIsGraded(false);
    setNow(Date.now());
  }, [mockExamDraft, setMockExamDraft]);

  const changeQuestion = useCallback((nextIndex: number) => {
    if (!session || nextIndex === currentIndex) return;
    const sessionItemId = session.questions[currentIndex]?.sessionItemId;
    const changedAt = Date.now();
    if (sessionItemId) {
      const elapsed = Math.max(0, Math.round((changedAt - questionStartedAtRef.current) / 1000));
      itemTimesRef.current[sessionItemId] = (itemTimesRef.current[sessionItemId] || 0) + elapsed;
    }
    questionStartedAtRef.current = changedAt;
    setCurrentIndex(Math.max(0, Math.min(session.questions.length - 1, nextIndex)));
  }, [currentIndex, session]);

  useEffect(() => {
    if (!session || isGraded) return;
    setMockExamDraft({
      session,
      currentIndex,
      itemTimes: itemTimesRef.current,
      currentQuestionStartedAt: questionStartedAtRef.current,
      updatedAt: new Date().toISOString(),
    });
  }, [currentIndex, isGraded, session, setMockExamDraft]);

  // Countdown timer effect
  useEffect(() => {
    if (!isOpen || !session || isGraded) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setNow(Date.now());
    timerRef.current = setInterval(() => setNow(Date.now()), 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // Restart the clock only when a different exam starts, not on every answer
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, session?.id, isGraded]);

  // Answer selection handler
  const handleSelectAnswer = useCallback(
    (questionId: number, option: OptionKey) => {
      if (!session || isGraded || getMockRemainingSeconds(session) === 0) return;
      if (soundEnabled) sound.playKeyClick();
      setSession((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          userAnswers: {
            ...prev.userAnswers,
            [questionId]: option,
          },
        };
      });
    },
    [isGraded, session, soundEnabled]
  );

  // Flag toggle handler
  const handleToggleFlag = useCallback(
    (questionId: number) => {
      if (!session || isGraded || getMockRemainingSeconds(session) === 0) return;
      if (soundEnabled) sound.playKeyClick();
      setSession((prev) => {
        if (!prev) return prev;
        const exists = prev.flaggedQuestionIds.includes(questionId);
        const updated = exists
          ? prev.flaggedQuestionIds.filter((id) => id !== questionId)
          : [...prev.flaggedQuestionIds, questionId];
        return {
          ...prev,
          flaggedQuestionIds: updated,
        };
      });
    },
    [isGraded, session, soundEnabled]
  );

  // Submission handler
  const handleFinalSubmit = useCallback(() => {
    if (!session || submissionRef.current) return;
    submissionRef.current = true;
    if (soundEnabled) sound.playSuccessChime();

    const completedSession = {
      ...session,
      timeSpentSeconds: getMockElapsedSeconds(session),
    };
    const { gradedSession, generatedTraps } = gradeMockExam(completedSession);
    const currentSessionItemId = session.questions[currentIndex]?.sessionItemId;
    if (currentSessionItemId) {
      const recordedSeconds = Object.values(itemTimesRef.current).reduce((sum, seconds) => sum + seconds, 0);
      const remainingTimeForCurrent = Math.max(0, completedSession.timeSpentSeconds - recordedSeconds);
      itemTimesRef.current[currentSessionItemId] = (itemTimesRef.current[currentSessionItemId] || 0)
        + Math.min(remainingTimeForCurrent, Math.max(0, Math.round((Date.now() - questionStartedAtRef.current) / 1000)));
      questionStartedAtRef.current = Date.now();
    }
    const answers = Object.fromEntries(
      session.questions.map((question) => [question.sessionItemId!, session.userAnswers[question.id] || null])
    );
    const attempt = gradeAttempt({
      session: session.practiceSession,
      answers,
      timing: itemTimesRef.current,
      trapCategories: Object.fromEntries(session.questions.map((question) => [question.sessionItemId!, question.trapCategory])),
      errorModes: Object.fromEntries(session.questions.filter((question) => question.errorModeDefault).map((question) => [question.sessionItemId!, question.errorModeDefault!])),
    });
    const traceableTraps = generatedTraps.map((trap) => {
      const question = session.questions.find((candidate) => candidate.id === trap.questionId)!;
      const itemAttempt = attempt.itemAttempts.find((candidate) => candidate.sessionItemId === question.sessionItemId)!;
      return { ...trap, id: crypto.randomUUID(), attemptId: attempt.id, itemAttemptId: itemAttempt.id, sessionItemId: question.sessionItemId, sourceItemId: question.sourceItemId };
    });
    setSession(gradedSession);
    setIsGraded(true);
    setIsSubmitConfirmOpen(false);
    setMockExamDraft(null);

    recordPracticeAttempt(attempt, traceableTraps);
  }, [currentIndex, recordPracticeAttempt, session, setMockExamDraft, soundEnabled]);

  useEffect(() => {
    if (isOpen && session && !isGraded && getMockRemainingSeconds(session, now) === 0) {
      handleFinalSubmit();
    }
  }, [handleFinalSubmit, isGraded, isOpen, now, session]);

  // Keyboard navigation within active mock exam
  useEffect(() => {
    if (!isOpen || !session || isGraded || isSubmitConfirmOpen || isLeaveConfirmOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (shouldIgnoreShortcut(e)) return;
      if (e.key === "k" || e.key === "K") {
        setCalculatorMode(calculatorMode === "docked" ? "closed" : "docked");
        return;
      }
      // The calculator owns digit, operator and C keys while it is open
      if (calculatorMode !== "closed") return;

      const currentQ = session.questions[currentIndex];
      if (!currentQ) return;

      if (e.key === "1" || e.key === "a" || e.key === "A") {
        handleSelectAnswer(currentQ.id, "A");
      } else if (e.key === "2" || e.key === "b" || e.key === "B") {
        handleSelectAnswer(currentQ.id, "B");
      } else if (e.key === "3" || e.key === "c" || e.key === "C") {
        handleSelectAnswer(currentQ.id, "C");
      } else if (e.key === "f" || e.key === "F") {
        handleToggleFlag(currentQ.id);
      } else if (e.key === "ArrowLeft") {
        changeQuestion(Math.max(0, currentIndex - 1));
      } else if (e.key === "ArrowRight") {
        changeQuestion(Math.min(session.questions.length - 1, currentIndex + 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [calculatorMode, changeQuestion, currentIndex, handleSelectAnswer, handleToggleFlag, isGraded, isLeaveConfirmOpen, isOpen, isSubmitConfirmOpen, session, setCalculatorMode]);

  if (!isOpen) return null;

  // Setup screen when no exam is in progress
  if (!session) {
    return (
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mock-exam-title"
        className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-md"
      >
        <div className="liquid-glass-card my-auto w-full max-w-2xl space-y-6 rounded-2xl p-6 shadow-2xl sm:p-8">
          <div className="flex items-start justify-between gap-4 border-b border-divider pb-4">
            <div>
              <h2 id="mock-exam-title" className="text-lg font-bold text-foreground">
                Level I mock exam
              </h2>
              <p className="mt-1 text-sm text-muted">
                Timed at 90 seconds per question and weighted to the February 2027 Level I topic weights.
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close mock exam"
              className="glass-pill-btn flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-muted hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {mockExamDraft && (
            <button
              onClick={handleResumeExam}
              className="w-full rounded-xl border border-accent/40 bg-accent/10 p-4 text-left text-sm text-foreground hover:bg-accent/15"
            >
              <span className="font-semibold">Resume {mockExamDraft.session.title}</span>
              <span className="mt-0.5 block text-xs text-muted">
                {Object.keys(mockExamDraft.session.userAnswers).length} of {mockExamDraft.session.totalQuestions} answered · the clock kept running while you were away
              </span>
            </button>
          )}

          <fieldset className="space-y-3">
            <legend className="mb-3 text-sm font-semibold text-foreground">Choose a length</legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {MOCK_TIERS.map((tier) => {
                const shortages = getMockExamShortages(tier.id);
                const unavailable = shortages.length > 0;
                const isSelected = selectedExamType === tier.id;
                return (
                  <button
                    key={tier.id}
                    onClick={() => setSelectedExamType(tier.id)}
                    disabled={unavailable}
                    aria-pressed={isSelected}
                    className={`flex flex-col gap-1.5 rounded-xl border p-4 text-left transition-colors ${
                      unavailable
                        ? "cursor-not-allowed border-divider bg-surface-interactive text-muted"
                        : isSelected
                          ? "border-accent bg-accent/10 text-foreground"
                          : "border-control bg-surface-interactive text-muted-strong hover:border-control-boundary-hover"
                    }`}
                  >
                    <span className="flex items-center justify-between gap-2 text-xs">
                      <span className={`font-semibold ${isSelected ? "text-accent" : "text-muted-strong"}`}>{tier.badge}</span>
                      <span className="flex items-center gap-1 text-muted">
                        <Clock className="h-3 w-3" />
                        {tier.time}
                      </span>
                    </span>
                    <span className="text-sm font-semibold text-foreground">{tier.title}</span>
                    <span className="text-xs leading-relaxed text-muted">{tier.desc}</span>
                    {unavailable && (
                      <span className="text-xs text-warning">
                        Unavailable: more reviewed questions are needed in {shortages.length} topic{shortages.length === 1 ? "" : "s"}.
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {startError && (
            <div role="alert" className="rounded-xl border border-warning/40 bg-warning/10 p-3 text-sm text-warning">
              {startError}
            </div>
          )}

          <p className="text-xs leading-relaxed text-muted">
            Scores are compared with a 70% study target. This is a practice benchmark, not an official CFA Institute passing standard.
          </p>

          <div className="flex items-center justify-end gap-3 border-t border-divider pt-4">
            <button onClick={onClose} className="min-h-11 rounded-xl px-4 text-sm font-medium text-muted hover:text-foreground">
              Cancel
            </button>
            <button
              onClick={() => handleStartExam(selectedExamType)}
              className="lime-btn-primary flex min-h-11 items-center gap-2 rounded-xl px-5 text-sm"
            >
              Start mock exam
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Scorecard after grading
  if (isGraded) {
    return (
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Mock exam results"
        className="fixed inset-0 z-50 overflow-y-auto bg-background"
      >
        <div className="min-h-screen p-4 sm:p-6">
          <MockScorecardView
            session={session}
            onRetake={() => handleStartExam(session.examType)}
            onClose={() => {
              setSession(null);
              onClose();
            }}
          />
        </div>
      </div>
    );
  }

  // Active exam
  const currentQuestion = session.questions[currentIndex];
  const remainingSeconds = getMockRemainingSeconds(session, now);
  const remainingHrs = Math.floor(remainingSeconds / 3600);
  const remainingMins = Math.floor((remainingSeconds % 3600) / 60);
  const remainingSecs = remainingSeconds % 60;
  const isTimeExpiring = remainingSeconds < 300; // < 5 mins
  const answeredCount = Object.keys(session.userAnswers).length;
  const isCurrentFlagged = session.flaggedQuestionIds.includes(currentQuestion.id);
  const currentChoice = session.userAnswers[currentQuestion.id];
  const clockLabel = `${remainingHrs > 0 ? `${remainingHrs}:` : ""}${remainingMins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;

  return (
    <div
      ref={dialogRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={session.title}
      className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-background font-sans text-foreground"
    >
      <header className="flex h-16 shrink-0 select-none items-center justify-between gap-2 border-b border-divider bg-background-elevated px-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <button
            onClick={requestClose}
            aria-label="Leave exam"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted hover:bg-surface-interactive hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
          <span className="hidden truncate text-sm font-semibold text-muted-strong md:inline">{session.title}</span>
        </div>

        <div
          role="timer"
          aria-label={`Time remaining ${clockLabel}`}
          className={`flex items-center gap-2 rounded-xl px-3 py-1.5 font-mono text-sm font-semibold tabular-nums ${
            isTimeExpiring ? "bg-danger/15 text-danger" : "bg-surface-interactive text-foreground"
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>{clockLabel}</span>
          <span className="hidden text-xs font-normal text-muted sm:inline">left</span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setCalculatorMode(calculatorMode === "docked" ? "closed" : "docked")}
            aria-label="BA II Plus calculator"
            aria-pressed={calculatorMode !== "closed"}
            title="Calculator (K)"
            className="flex h-10 items-center gap-1.5 rounded-xl bg-surface-interactive px-2.5 text-sm text-muted-strong hover:text-foreground"
          >
            <Calculator className="h-4 w-4" />
            <span className="hidden sm:inline">Calculator</span>
          </button>
          <button
            onClick={() => setIsNavigatorOpen(!isNavigatorOpen)}
            aria-expanded={isNavigatorOpen}
            aria-label={`Question navigator, ${answeredCount} of ${session.totalQuestions} answered`}
            className={`flex h-10 items-center gap-1.5 rounded-xl px-2.5 text-sm tabular-nums transition-colors ${
              isNavigatorOpen ? "bg-accent text-accent-ink" : "bg-surface-interactive text-muted-strong hover:text-foreground"
            }`}
          >
            <Grid className="h-4 w-4" />
            <span>
              {answeredCount}/{session.totalQuestions}
            </span>
          </button>
          <button
            onClick={() => setIsSubmitConfirmOpen(true)}
            className="h-10 rounded-xl border border-accent/40 bg-accent/10 px-3 text-sm font-semibold text-accent hover:bg-accent hover:text-accent-ink"
          >
            Submit
          </button>
        </div>
      </header>

      <div className="relative flex flex-1 overflow-hidden">
        <main className="flex flex-1 flex-col justify-between overflow-y-auto p-4 sm:p-8">
          <div className="mx-auto w-full max-w-3xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-divider pb-4 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                  Question {currentQuestion.globalIndex} of {session.totalQuestions}
                </span>
                <span className="rounded-lg bg-surface-interactive px-2 py-0.5 text-muted-strong">
                  {currentQuestion.topicName}
                </span>
                {currentQuestion.losCode && <span className="text-muted">{currentQuestion.losCode}</span>}
              </div>
              <button
                onClick={() => handleToggleFlag(currentQuestion.id)}
                aria-pressed={isCurrentFlagged}
                title="Flag for review (F)"
                className={`flex min-h-10 items-center gap-1.5 rounded-xl px-3 text-xs transition-colors ${
                  isCurrentFlagged
                    ? "bg-warning/15 text-warning"
                    : "bg-surface-interactive text-muted hover:text-foreground"
                }`}
              >
                <Flag className={`h-3.5 w-3.5 ${isCurrentFlagged ? "fill-current" : ""}`} />
                <span>{isCurrentFlagged ? "Flagged" : "Flag"}</span>
              </button>
            </div>

            <div className="surface-panel rounded-2xl p-5 text-sm leading-relaxed sm:p-6 sm:text-base">
              <FormattedMathText text={currentQuestion.stem} />
            </div>

            <div className="space-y-3" role="radiogroup" aria-label="Answer options">
              {(["A", "B", "C"] as OptionKey[]).map((opt) => {
                const isSelected = currentChoice === opt;
                return (
                  <button
                    key={opt}
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => handleSelectAnswer(currentQuestion.id, opt)}
                    className={`flex min-h-[44px] w-full select-none items-start gap-4 rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                      isSelected
                        ? "border-accent bg-accent/10 text-foreground"
                        : "border-control bg-surface-interactive text-muted-strong hover:bg-surface-raised"
                    }`}
                  >
                    <span
                      className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                        isSelected ? "bg-accent text-accent-ink" : "bg-surface-raised text-muted"
                      }`}
                    >
                      {opt}
                    </span>
                    <span className="flex-1 text-sm leading-relaxed">
                      <FormattedMathText text={currentQuestion.options[opt]} />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mx-auto mt-6 flex w-full max-w-3xl items-center justify-between gap-4 border-t border-divider pt-6 text-sm">
            <button
              onClick={() => changeQuestion(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="glass-pill-btn flex min-h-11 items-center gap-1.5 rounded-xl px-4 text-muted-strong disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <span className="hidden text-xs text-muted sm:inline">Keys: 1/2/3 answer · F flag · ←/→ move · K calculator</span>
            <button
              onClick={() => changeQuestion(Math.min(session.questions.length - 1, currentIndex + 1))}
              disabled={currentIndex === session.questions.length - 1}
              className="lime-btn-primary flex min-h-11 items-center gap-1.5 rounded-xl px-5 disabled:opacity-30"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </main>

        {isNavigatorOpen && (
          <aside
            aria-label="Question navigator"
            className="absolute inset-y-0 right-0 z-10 flex w-full select-none flex-col justify-between overflow-y-auto border-l border-divider bg-background-elevated p-4 sm:static sm:w-80"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-divider pb-3">
                <span className="text-sm font-semibold text-foreground">Questions</span>
                <button
                  onClick={() => setIsNavigatorOpen(false)}
                  aria-label="Close question navigator"
                  className="-m-2 flex h-11 w-11 items-center justify-center text-muted hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded bg-accent" /> Answered
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded bg-warning" /> Flagged
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded bg-surface-raised" /> Unanswered
                </span>
              </div>

              <div className="grid max-h-[60vh] grid-cols-5 gap-1.5 overflow-y-auto pr-1 text-xs">
                {session.questions.map((q, idx) => {
                  const isAnswered = !!session.userAnswers[q.id];
                  const isFlagged = session.flaggedQuestionIds.includes(q.id);
                  const isCurrent = currentIndex === idx;
                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        changeQuestion(idx);
                        if (soundEnabled) sound.playKeyClick();
                        // On phones the navigator covers the question, so return to it
                        if (window.matchMedia("(max-width: 639px)").matches) setIsNavigatorOpen(false);
                      }}
                      aria-label={`Question ${idx + 1}${isAnswered ? ", answered" : ""}${isFlagged ? ", flagged" : ""}`}
                      aria-current={isCurrent ? "step" : undefined}
                      className={`relative flex h-10 items-center justify-center rounded-lg border font-semibold tabular-nums transition-colors ${
                        isCurrent
                          ? "border-accent bg-surface-raised text-foreground ring-2 ring-accent"
                          : isFlagged
                            ? "border-warning/50 bg-warning/15 text-warning"
                            : isAnswered
                              ? "border-accent/40 bg-accent/15 text-accent"
                              : "border-control bg-surface-interactive text-muted hover:bg-surface-raised"
                      }`}
                    >
                      {idx + 1}
                      {isFlagged && <span className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-warning" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => setIsSubmitConfirmOpen(true)}
              className="lime-btn-primary mt-4 min-h-11 w-full rounded-xl text-sm"
            >
              Review and submit
            </button>
          </aside>
        )}
      </div>

      {isSubmitConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div role="alertdialog" aria-modal="true" aria-labelledby="mock-submit-title" className="liquid-glass-card w-full max-w-md space-y-5 rounded-2xl p-6 text-sm shadow-2xl">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-warning" />
              <h3 id="mock-submit-title" className="font-semibold text-foreground">Submit this exam?</h3>
            </div>
            <dl className="space-y-2 rounded-xl bg-surface-interactive p-4">
              <div className="flex justify-between text-muted-strong">
                <dt>Questions</dt>
                <dd className="font-semibold tabular-nums text-foreground">{session.totalQuestions}</dd>
              </div>
              <div className="flex justify-between text-muted-strong">
                <dt>Answered</dt>
                <dd className="font-semibold tabular-nums text-accent">{answeredCount}</dd>
              </div>
              <div className="flex justify-between text-muted-strong">
                <dt>Unanswered</dt>
                <dd className="font-semibold tabular-nums text-danger">{session.totalQuestions - answeredCount}</dd>
              </div>
              <div className="flex justify-between text-muted-strong">
                <dt>Flagged</dt>
                <dd className="font-semibold tabular-nums text-warning">{session.flaggedQuestionIds.length}</dd>
              </div>
            </dl>
            <p className="leading-relaxed text-muted">
              After submitting you can&apos;t change answers. Missed questions are added to your review deck.
            </p>
            <div className="flex gap-3">
              <button
                autoFocus
                onClick={() => setIsSubmitConfirmOpen(false)}
                className="glass-pill-btn min-h-11 flex-1 rounded-xl text-muted-strong"
              >
                Keep working
              </button>
              <button onClick={handleFinalSubmit} className="lime-btn-primary min-h-11 flex-1 rounded-xl">
                Submit exam
              </button>
            </div>
          </div>
        </div>
      )}

      {isLeaveConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div role="alertdialog" aria-modal="true" aria-labelledby="mock-leave-title" className="liquid-glass-card w-full max-w-md space-y-4 rounded-2xl p-6 text-sm shadow-2xl">
            <h3 id="mock-leave-title" className="font-semibold text-foreground">Leave the exam?</h3>
            <p className="leading-relaxed text-muted">
              Your answers are saved and you can resume from the Mock exam button, but the clock keeps running, just as it would on exam day.
            </p>
            <div className="flex gap-3">
              <button
                autoFocus
                onClick={() => setIsLeaveConfirmOpen(false)}
                className="lime-btn-primary min-h-11 flex-1 rounded-xl"
              >
                Keep working
              </button>
              <button
                onClick={() => {
                  setIsLeaveConfirmOpen(false);
                  setIsNavigatorOpen(false);
                  setSession(null);
                  onClose();
                }}
                className="glass-pill-btn min-h-11 flex-1 rounded-xl text-muted-strong"
              >
                Leave exam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MOCK_TIERS: Array<{ id: MockExamType; title: string; badge: string; time: string; desc: string }> = [
  {
    id: "quick_diagnostic_45",
    title: "Quick diagnostic",
    badge: "45 questions",
    time: "1 h 8 min",
    desc: "A short, weighted check across all ten topics. A good place to start.",
  },
  {
    id: "half_session_1",
    title: "Session 1 mock",
    badge: "90 questions",
    time: "2 h 15 min",
    desc: "Exam session 1: Ethics, Quantitative Methods, Economics, Financial Statement Analysis and Corporate Finance.",
  },
  {
    id: "half_session_2",
    title: "Session 2 mock",
    badge: "90 questions",
    time: "2 h 15 min",
    desc: "Exam session 2: Equities, Fixed Income, Derivatives, Alternative Investments and Portfolio Construction.",
  },
  {
    id: "full_180",
    title: "Full mock",
    badge: "180 questions",
    time: "4 h 30 min",
    desc: "Both sessions back to back, for exam-day stamina.",
  },
];

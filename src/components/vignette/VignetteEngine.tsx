"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  ArrowLeft,
  Calculator,
  Edit3,
  CheckCircle,
  AlertCircle,
  ShieldAlert,
  Sparkles,
  Send,
  Timer,
  Clock,
  Volume2,
  Sliders,
  Keyboard,
} from "lucide-react";
import {
  OptionKey,
  TrapLogEntry,
  VignetteSessionResult,
  VignetteQuestion
} from "@/types/cfa";
import { PracticeSession } from "@/types/practice";
import { CFA_VIGNETTES } from "@/data/vignettes";
import { CFA_CURRICULUM } from "@/data/curriculum";
import { useCFAStore } from "@/store/useCFAStore";
import { DiagnosticAutopsyView } from "@/components/diagnostic/DiagnosticAutopsyView";
import { legacyVignetteToPracticeItems } from "@/lib/practice/adapters";
import { createPracticeSession } from "@/lib/practice/createSession";
import { gradeAttempt } from "@/lib/practice/gradeAttempt";
import { FormattedMathText } from "@/components/common/KaTeXRenderer";
import { sound } from "@/components/common/SoundEffects";

export const VignetteEngine: React.FC = () => {
  const {
    activeVignetteId,
    activeTopicId,
    closeVignetteDrill,
    recordPracticeAttempt,
    savePracticeSession,
    setCalculatorOpen,
    setCalculatorMode,
    calculatorMode,
    setActiveBriefing,
    startVignetteDrill,
    selectTopic,
    customVignettes,
    addQuestionsToActiveVignette,
    setAIGeneratorOpen,
    soundEnabled,
    drillQuestionCount,
    setDrillQuestionCount,
    isPacingTimerEnabled,
    togglePacingTimer,
  } = useCFAStore();

  const [practiceSession, setPracticeSession] = useState<PracticeSession | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, OptionKey>>({});
  const [, setItemTimes] = useState<Record<string, number>>({});
  const itemTimesRef = useRef<Record<string, number>>({});
  const lastAnswerAtRef = useRef<number>(Date.now());
  const [reviewResult, setReviewResult] = useState<VignetteSessionResult | null>(null);
  const [scratchpadText, setScratchpadText] = useState<string>("");
  const [isScratchpadOpen, setIsScratchpadOpen] = useState<boolean>(false);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [isInjectingAI, setIsInjectingAI] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Per-question elapsed time tracking
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const allVignettes = useMemo(() => [...CFA_VIGNETTES, ...customVignettes], [customVignettes]);
  const vignette = useMemo(
    () =>
      allVignettes.find((v) => v.id === activeVignetteId || v.topicId === activeVignetteId) ||
      allVignettes.find((v) => v.topicId === activeTopicId) ||
      CFA_VIGNETTES[0],
    [allVignettes, activeVignetteId, activeTopicId]
  );

  const startNewSession = useCallback(() => {
    const items = legacyVignetteToPracticeItems(vignette);
    const session = createPracticeSession({
      mode: "practice",
      items,
      requestedCount: drillQuestionCount,
      timerMode: isPacingTimerEnabled ? "timed" : "untimed",
      shuffleQuestions: true,
    });
    savePracticeSession(session, true);
    setPracticeSession(session);
    setSelectedAnswers({});
    setItemTimes({});
    itemTimesRef.current = {};
    lastAnswerAtRef.current = Date.now();
    setHasSubmitted(false);
    setReviewResult(null);
    setElapsedSeconds(0);
  }, [drillQuestionCount, isPacingTimerEnabled, savePracticeSession, vignette]);

  useEffect(() => {
    const state = useCFAStore.getState();
    const stored = state.activePracticeSessionId
      ? state.practiceSessions[state.activePracticeSessionId]
      : undefined;
    const expectedCount = Math.min(drillQuestionCount, vignette.questions.length);
    if (
      stored &&
      !stored.completedAt &&
      stored.sourceSetIds.includes(vignette.id) &&
      stored.presentedItems.length === expectedCount
    ) {
      setPracticeSession(stored);
      setSelectedAnswers({});
      setItemTimes({});
      itemTimesRef.current = {};
      lastAnswerAtRef.current = Date.now();
      setHasSubmitted(false);
      setReviewResult(null);
      setElapsedSeconds(0);
      return;
    }
    startNewSession();
  }, [drillQuestionCount, startNewSession, vignette.id, vignette.questions.length]);

  const activeQuestions = useMemo(
    () =>
      (practiceSession?.presentedItems || []).map((item) => ({
        id: item.displayIndex,
        sessionItemId: item.sessionItemId,
        sourceItemId: item.sourceItemId,
        stem: item.stem,
        options: item.options,
        correctOption: item.correctOption,
        algebraicSolution: item.solution,
        calculatorKeystrokes: item.calculatorKeystrokes || "",
        trapCategory: item.trapCategory,
        errorModeDefault: item.errorModeDefault,
        losCode: item.losCode,
        distractorAutopsy: item.distractorFeedback,
      })),
    [practiceSession]
  );

  const isFormComplete = useMemo(
    () => activeQuestions.length > 0 && activeQuestions.every((q) => selectedAnswers[q.sessionItemId]),
    [activeQuestions, selectedAnswers]
  );

  // Start timer on mount / question change
  useEffect(() => {
    if (hasSubmitted || !isPacingTimerEnabled) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [hasSubmitted, isPacingTimerEnabled]);

  const handleSelectOption = useCallback((sessionItemId: string, option: OptionKey) => {
    if (hasSubmitted) return;
    if (soundEnabled) sound.playKeyClick();
    if (!selectedAnswers[sessionItemId]) {
      const now = Date.now();
      const seconds = Math.max(1, Math.round((now - lastAnswerAtRef.current) / 1000));
      lastAnswerAtRef.current = now;
      itemTimesRef.current = { ...itemTimesRef.current, [sessionItemId]: seconds };
      setItemTimes(itemTimesRef.current);
    }
    setSelectedAnswers((prev) => ({
      ...prev,
      [sessionItemId]: option,
    }));
  }, [hasSubmitted, selectedAnswers, soundEnabled]);

  const handleSubmitDiagnostic = useCallback(() => {
    if (!isFormComplete || !practiceSession) return;

    const trapCategories = Object.fromEntries(
      practiceSession.presentedItems.map((item) => [item.sessionItemId, item.trapCategory])
    );
    const errorModes = Object.fromEntries(
      practiceSession.presentedItems
        .filter((item) => item.errorModeDefault)
        .map((item) => [item.sessionItemId, item.errorModeDefault!])
    );
    const attempt = gradeAttempt({
      session: practiceSession,
      answers: selectedAnswers,
      timing: itemTimesRef.current,
      trapCategories,
      errorModes,
    });

    const trapEntries: TrapLogEntry[] = attempt.itemAttempts
      .filter((itemAttempt) => !itemAttempt.isCorrect)
      .map((itemAttempt) => {
        const item = practiceSession.presentedItems.find(
          (candidate) => candidate.sessionItemId === itemAttempt.sessionItemId
        )!;
        const chosen = itemAttempt.selectedOption;
        return {
          id: crypto.randomUUID(),
          topicId: item.topicId,
          topicName: item.topicName,
          subReading: item.subReading,
          trapName: item.trapCategory,
          questionId: item.displayIndex,
          questionStem: item.stem,
          options: item.options,
          userChoice: chosen || undefined,
          selectedOption: chosen || undefined,
          correctOption: item.correctOption,
          autopsyExplanation: chosen ? item.distractorFeedback[chosen] : item.solution,
          calculatorKeystrokes: item.calculatorKeystrokes,
          errorMode: item.errorModeDefault || "UNSPECIFIED",
          timestamp: attempt.submittedAt,
          attemptId: attempt.id,
          itemAttemptId: itemAttempt.id,
          sessionItemId: item.sessionItemId,
          sourceItemId: item.sourceItemId,
        };
      });

    recordPracticeAttempt(attempt, trapEntries);

    const displayAnswers = Object.fromEntries(
      activeQuestions.map((question) => [question.id, selectedAnswers[question.sessionItemId]])
    ) as Record<number, OptionKey>;
    const result: VignetteSessionResult = {
      vignetteId: vignette.id,
      topicId: vignette.topicId,
      submittedAt: attempt.submittedAt,
      score: attempt.score,
      total: attempt.total,
      userAnswers: displayAnswers,
      submissions: attempt.itemAttempts.map((itemAttempt, index) => ({
        questionId: index + 1,
        selectedOption: itemAttempt.selectedOption!,
        isCorrect: itemAttempt.isCorrect,
        trapTriggered: itemAttempt.isCorrect ? undefined : itemAttempt.trapCategory,
        errorModeLogged: itemAttempt.isCorrect ? undefined : itemAttempt.errorMode,
        timeSpentSeconds: itemAttempt.timeSpentSeconds,
      })),
      trapsTriggered: trapEntries.map((entry) => entry.trapName),
      totalTimeSeconds: attempt.totalTimeSeconds,
      timerModeUsed: isPacingTimerEnabled ? "timed_90s" : "untimed",
    };
    setReviewResult(result);
    setHasSubmitted(true);
  }, [
    isFormComplete,
    activeQuestions,
    selectedAnswers,
    practiceSession,
    vignette,
    isPacingTimerEnabled,
    recordPracticeAttempt
  ]);

  // Keyboard shortcut listener for rapid ergonomics (1/2/3, A/B/C, Space/Enter, K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing in scratchpad or inputs
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;

      const key = e.key.toUpperCase();

      if (key === "K") {
        setCalculatorOpen(true);
        return;
      }

      if (!hasSubmitted && activeQuestions.length > 0) {
        // Find the first unanswered question
        const unanswered = activeQuestions.find((q) => !selectedAnswers[q.sessionItemId]);
        const targetQ = unanswered || activeQuestions[activeQuestions.length - 1];

        if (key === "1" || key === "A") {
          handleSelectOption(targetQ.sessionItemId, "A");
        } else if (key === "2" || key === "B") {
          handleSelectOption(targetQ.sessionItemId, "B");
        } else if (key === "3" || key === "C") {
          handleSelectOption(targetQ.sessionItemId, "C");
        } else if ((e.key === "Enter" || e.key === " ") && isFormComplete) {
          e.preventDefault();
          handleSubmitDiagnostic();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    hasSubmitted,
    activeQuestions,
    selectedAnswers,
    isFormComplete,
    handleSelectOption,
    handleSubmitDiagnostic,
    setCalculatorOpen
  ]);

  if (!activeVignetteId) return null;

  const handleResetForRetake = () => {
    startNewSession();
  };

  const handleInjectAIQuestions = async () => {
    if (soundEnabled) sound.playKeyClick();
    setIsInjectingAI(true);
    setGenerationError(null);
    try {
      const res = await fetch("/api/generate-vignette", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicId: vignette.topicId,
          mode: "case-study",
          difficulty: vignette.difficulty === "High Trap" ? "high-trap" : "standard",
          focus: `Additional high-yield practice questions for ${vignette.topicName}`,
          questionCount: 5,
          excludeItemIds: practiceSession?.itemIds || [],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unable to generate additional practice questions.");
      }
      if (data.vignette && data.vignette.questions) {
        if (soundEnabled) sound.playSuccessChime();
        const existingStems = new Set(activeQuestions.map((question) => question.stem.trim().toLowerCase()));
        const newQs = data.vignette.questions
          .filter((question: VignetteQuestion) => !existingStems.has(question.stem.trim().toLowerCase()))
          .map((question: VignetteQuestion, idx: number) => ({ ...question, id: Date.now() + idx }));
        if (newQs.length === 0) throw new Error("No new questions were returned.");
        addQuestionsToActiveVignette(newQs);
      }
    } catch (err) {
      setGenerationError(err instanceof Error ? err.message : "Unable to generate questions.");
    } finally {
      setIsInjectingAI(false);
    }
  };

  // Exam Pace benchmark (90s per question * count)
  const targetTimeSeconds = activeQuestions.length * 90;
  const isOvertime = elapsedSeconds > targetTimeSeconds;
  const isWarning = elapsedSeconds > targetTimeSeconds * 0.75;

  const currentTopic = CFA_CURRICULUM.find((t) => t.id === vignette.topicId);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      
      {/* Top Ergonomic Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-divider">
        <button
          onClick={closeVignetteDrill}
          className="inline-flex items-center gap-2 text-xs font-medium text-muted hover:text-foreground transition-colors min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to dashboard</span>
        </button>

        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* Question Count Selector (2, 5, 10, 15) */}
          <div className="flex items-center gap-1 bg-surface-interactive rounded-lg p-0.5 border border-control">
            <span className="text-[11px] text-muted px-2 font-medium select-none">Count:</span>
            {([2, 5, 10, 15] as const).map((cnt) => (
              <button
                key={cnt}
                onClick={() => {
                  if (hasSubmitted) return;
                  if (soundEnabled) sound.playKeyClick();
                  setDrillQuestionCount(cnt);
                }}
                disabled={hasSubmitted}
                className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                  drillQuestionCount === cnt
                    ? "bg-accent text-accent-ink"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {cnt}Q
              </button>
            ))}
          </div>

          {/* Dynamic AI Question Extender Button */}
          <button
            onClick={handleInjectAIQuestions}
            disabled={isInjectingAI || hasSubmitted}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent text-xs font-semibold transition-all active:scale-[0.98] disabled:opacity-50 min-h-[36px]"
            title="Generate & inject additional AI scenario questions into this drill"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isInjectingAI ? "animate-spin" : ""}`} />
            <span>{isInjectingAI ? "Generating..." : "+ AI questions"}</span>
          </button>

          {/* 90-Second Exam Pace Toggle */}
          <button
            onClick={() => {
              if (soundEnabled) sound.playKeyClick();
              togglePacingTimer();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all min-h-[36px] ${
              isPacingTimerEnabled
                ? isOvertime
                  ? "bg-danger/20 text-danger border border-danger/50 animate-pulse"
                  : isWarning
                  ? "bg-warning/20 text-warning border border-warning/50"
                  : "bg-accent/15 text-accent"
                : "bg-surface-interactive text-muted hover:text-foreground"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>
              {isPacingTimerEnabled
                ? `${Math.floor(elapsedSeconds / 60)}:${(elapsedSeconds % 60)
                    .toString()
                    .padStart(2, "0")} / ${Math.floor(targetTimeSeconds / 60)}:00`
                : "Untimed"}
            </span>
          </button>

          {/* TI BA II Plus toggle */}
          <button
            onClick={() => {
              if (soundEnabled) sound.playKeyClick();
              setCalculatorMode(calculatorMode === "docked" ? "closed" : "docked");
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all min-h-[36px] ${
              calculatorMode !== "closed"
                ? "bg-warning text-accent-ink font-semibold"
                : "bg-surface-interactive hover:bg-surface-raised text-warning"
            }`}
            title="Toggle Texas Instruments BA II Plus Emulator (Hotkey: K)"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">BA II+ [K]</span>
          </button>

          {/* Scratchpad Toggle */}
          <button
            onClick={() => setIsScratchpadOpen(!isScratchpadOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all min-h-[36px] ${
              isScratchpadOpen
                ? "bg-accent text-accent-ink font-semibold"
                : "bg-surface-interactive text-muted hover:text-foreground"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Scratchpad</span>
          </button>
        </div>
      </div>

      {generationError && (
        <div role="alert" className="mb-6 rounded-xl bg-danger/10 border border-danger/25 px-4 py-3 text-sm text-danger">
          {generationError}
        </div>
      )}

      {/* Main Grid: Vignette Header + Case Stem */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Vignette Case Stem (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="surface-panel rounded-2xl p-6 sm:p-7 relative overflow-hidden shadow-sm">
            {/* Topic & Difficulty Badges */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-accent/15 text-accent font-mono text-xs font-semibold">
                  Topic {vignette.topicId} · {vignette.topicName}
                </span>
                <span className="text-xs text-muted">
                  {vignette.subReading}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-surface-interactive text-muted text-xs font-medium">
                {vignette.difficulty}
              </span>
            </div>

            {vignette.provenance && (
              <p className="mb-4 text-xs text-warning" role="status">
                {vignette.provenance.origin === "ai-draft" ? "AI draft" : "Procedural fallback"}
                {" · "}{vignette.provenance.status}. Generated content is excluded from readiness analytics and mock exams.
              </p>
            )}

            {/* Vignette Case Stem Text (Clean font-sans) */}
            <h2 className="text-xs font-semibold text-muted tracking-wider uppercase mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              Practice case scenario
            </h2>
            <div className="text-sm sm:text-base text-foreground leading-relaxed font-sans font-normal border-l-2 border-accent/60 pl-4 py-1">
              <FormattedMathText text={vignette.vignetteStem} />
            </div>

            {/* Hotkey Guide Pill */}
            <div className="mt-5 pt-3 border-t border-divider flex items-center justify-between text-xs text-muted">
              <span className="flex items-center gap-1.5">
                <Keyboard className="w-3.5 h-3.5 text-accent" />
                <span className="font-mono">Keys: [1/2/3] select · [Space/Enter] submit · [K] BA II+</span>
              </span>
              <span className="font-mono text-foreground font-semibold">{activeQuestions.length} questions</span>
            </div>
          </div>

          {/* Scratchpad (Collapsible) */}
          {isScratchpadOpen && (
            <div className="surface-panel rounded-xl border border-divider p-4 space-y-2 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-xs text-accent font-medium">
                <span>Scratchpad · Workings</span>
                <span className="text-[11px] text-muted font-normal">Auto-saved in session</span>
              </div>
              <textarea
                value={scratchpadText}
                onChange={(e) => setScratchpadText(e.target.value)}
                placeholder="Type intermediate keystrokes, cash flows, or formula steps..."
                rows={4}
                className="w-full bg-surface-solid border border-control rounded-lg p-3 text-xs sm:text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent font-mono"
              />
            </div>
          )}
        </div>

        {/* Right Column: Questions & Distractor Selection (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {activeQuestions.map((q, idx) => {
            const chosen = selectedAnswers[q.sessionItemId];
            return (
              <div
                key={q.sessionItemId}
                className={`p-5 rounded-2xl surface-panel transition-all ${
                  chosen ? "bg-surface-raised" : ""
                }`}
              >
                {/* Question Header */}
                <div className="flex items-center justify-between mb-3 text-xs">
                  <span className="text-accent font-mono font-semibold">
                    Question {idx + 1} of {activeQuestions.length}
                  </span>
                  {q.losCode && (
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-surface-interactive text-muted">
                      {q.losCode}
                    </span>
                  )}
                </div>

                {/* Question Stem */}
                <div className="text-xs sm:text-sm text-foreground font-medium mb-4 leading-relaxed">
                  <FormattedMathText text={q.stem} />
                </div>

                {/* Option Selector (A, B, C) */}
                <div className="space-y-2">
                  {(["A", "B", "C"] as OptionKey[]).map((opt) => {
                    const isSelected = chosen === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleSelectOption(q.sessionItemId, opt)}
                        disabled={hasSubmitted}
                        className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 select-none min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                          isSelected
                            ? "bg-accent/15 text-foreground shadow-sm"
                            : "bg-surface-interactive/60 text-muted-strong hover:bg-surface-interactive hover:text-foreground"
                        } ${hasSubmitted ? "cursor-not-allowed opacity-80" : ""}`}
                      >
                        <span
                          className={`inline-flex items-center justify-center w-5 h-5 rounded-md font-mono font-bold text-xs shrink-0 ${
                            isSelected
                              ? "bg-accent text-accent-ink"
                              : "bg-surface-interactive text-muted"
                          }`}
                        >
                          {opt}
                        </span>
                        <div className="text-xs leading-relaxed flex-1 font-sans">
                          <FormattedMathText text={q.options[opt]} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Submit Action Button */}
          {!hasSubmitted ? (
            <button
              onClick={handleSubmitDiagnostic}
              disabled={!isFormComplete}
              className={`w-full min-h-[44px] py-3.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                isFormComplete
                  ? "bg-accent text-accent-ink hover:bg-accent-strong cursor-pointer"
                  : "bg-surface-interactive text-muted border border-control cursor-not-allowed"
              }`}
            >
              <Send className="w-4 h-4" />
              <span>
                {isFormComplete
                  ? "Submit practice set"
                  : `Select all answers (${Object.keys(selectedAnswers).length}/${activeQuestions.length})`}
              </span>
            </button>
          ) : (
            <button
              onClick={handleResetForRetake}
              className="w-full min-h-[44px] py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-surface-interactive hover:bg-surface-raised text-foreground transition-all active:scale-[0.98]"
            >
              Re-take this practice set
            </button>
          )}
        </div>

      </div>

      {/* Post-Submission Distractor Autopsy & Diagnostic Report */}
      {hasSubmitted && reviewResult && (
        <div className="mt-12 pt-8 border-t border-[#1F1F23]">
          <DiagnosticAutopsyView
            vignette={{ ...vignette, questions: activeQuestions }}
            result={reviewResult}
            onDrillAnother={() => {
              const other = allVignettes.find((v) => v.id !== vignette.id);
              if (other) startVignetteDrill(other.id);
              else handleResetForRetake();
            }}
            onReviewFormulas={() => useCFAStore.getState().setFormulaSheetOpen(true)}
            onReturnDashboard={closeVignetteDrill}
            onNextTrack={() => {
              const nextId = (parseInt(vignette.topicId, 10) + 1).toString().padStart(2, "0");
              const nextTopic = CFA_CURRICULUM.find((t) => t.id === nextId);
              if (nextTopic) {
                selectTopic(nextId);
                const v = allVignettes.find((item) => item.topicId === nextId);
                if (v) startVignetteDrill(v.id);
                else closeVignetteDrill();
              } else {
                closeVignetteDrill();
              }
            }}
          />
        </div>
      )}

    </div>
  );
};

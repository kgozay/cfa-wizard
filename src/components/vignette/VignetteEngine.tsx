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
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-[#1F1F23]">
        <button
          onClick={closeVignetteDrill}
          className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO STUDY DASHBOARD</span>
        </button>

        <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs">
          
          {/* Question Count Selector (2, 5, 10, 15) */}
          <div className="flex items-center gap-1 bg-[#121215] border border-[#27272A] p-0.5 rounded-lg">
            <span className="text-[11px] text-zinc-400 px-2 uppercase font-semibold select-none">Count:</span>
            {([2, 5, 10, 15] as const).map((cnt) => (
              <button
                key={cnt}
                onClick={() => {
                  if (hasSubmitted) return;
                  if (soundEnabled) sound.playKeyClick();
                  setDrillQuestionCount(cnt);
                }}
                disabled={hasSubmitted}
                className={`px-2 py-1 rounded text-xs font-bold transition-all ${
                  drillQuestionCount === cnt
                    ? "bg-brand-lime text-black shadow-lime-sm"
                    : "text-zinc-400 hover:text-white"
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
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-lime/10 hover:bg-brand-lime/20 text-brand-lime border border-brand-lime/40 text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
            title="Generate & inject additional AI scenario questions into this drill"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isInjectingAI ? "animate-spin" : ""}`} />
            <span>{isInjectingAI ? "SYNTHESIZING..." : "+AI QUESTIONS"}</span>
          </button>

          {/* 90-Second Exam Pace Toggle */}
          <button
            onClick={() => {
              if (soundEnabled) sound.playKeyClick();
              togglePacingTimer();
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono font-bold transition-all ${
              isPacingTimerEnabled
                ? isOvertime
                ? "bg-red-500/20 text-red-400 border-red-500/50 animate-pulse"
                : isWarning
                ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                : "bg-brand-lime/10 text-brand-lime border-brand-lime/40"
              : "bg-[#121215] text-zinc-400 border-[#27272A] hover:text-white"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>
              {isPacingTimerEnabled
                ? `${Math.floor(elapsedSeconds / 60)}:${(elapsedSeconds % 60)
                    .toString()
                    .padStart(2, "0")} / ${Math.floor(targetTimeSeconds / 60)}:00`
                : "UNTIMED STUDY"}
            </span>
          </button>

          {/* Non-Blocking Floating / Docked TI BA II Plus */}
          <button
            onClick={() => {
              if (soundEnabled) sound.playKeyClick();
              setCalculatorMode(calculatorMode === "docked" ? "closed" : "docked");
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-bold transition-all ${
              calculatorMode !== "closed"
                ? "bg-amber-400 text-black border-amber-400 shadow-sm"
                : "bg-[#141418] hover:bg-[#1C1C22] border-[#27272A] text-amber-300"
            }`}
            title="Toggle Texas Instruments BA II Plus Emulator (Hotkey: K)"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">BA II+ [K]</span>
          </button>

          {/* Scratchpad Toggle */}
          <button
            onClick={() => setIsScratchpadOpen(!isScratchpadOpen)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs transition-all ${
              isScratchpadOpen
                ? "bg-brand-lime text-black font-bold border-brand-lime"
                : "bg-[#141418] text-zinc-400 border-[#27272A] hover:text-white"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">SCRATCHPAD</span>
          </button>
        </div>
      </div>

      {generationError && (
        <div role="alert" className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {generationError}
        </div>
      )}

      {/* Main Grid: Vignette Header + Case Stem */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Vignette Case Stem (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 bg-[#0B0B0E] border border-[#1F1F23] rounded-xl relative overflow-hidden shadow-lg">
            
            {/* Topic & Difficulty Badges */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-brand-lime/10 border border-brand-lime/30 text-brand-lime font-mono text-xs font-bold uppercase tracking-wider">
                  TOPIC {vignette.topicId} {"//"} {vignette.topicName}
                </span>
                <span className="text-xs font-mono text-zinc-400">
                  {vignette.subReading}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#18181B] border border-[#27272A] text-zinc-300 font-mono text-xs font-semibold">
                DIFFICULTY: {vignette.difficulty.toUpperCase()}
              </span>
            </div>

            {vignette.provenance && (
              <p className="mb-4 text-xs text-amber-200" role="status">
                {vignette.provenance.origin === "ai-draft" ? "AI draft" : "Procedural fallback"}
                {" · "}{vignette.provenance.status}. Generated content is excluded from readiness analytics and mock exams.
              </p>
            )}

            {/* Vignette Case Stem Text (Clean font-sans) */}
            <h2 className="text-xs font-mono font-bold text-zinc-400 tracking-wider uppercase mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-lime" />
              PRACTICE CASE SCENARIO
            </h2>
            <div className="text-sm sm:text-base text-zinc-100 leading-relaxed font-sans font-normal border-l-2 border-brand-lime/40 pl-4 py-1">
              <FormattedMathText text={vignette.vignetteStem} />
            </div>

            {/* Hotkey Guide Pill */}
            <div className="mt-5 pt-3 border-t border-[#18181B] flex items-center justify-between text-xs font-mono text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Keyboard className="w-3.5 h-3.5 text-brand-lime" />
                <span>HOTKEYS: [1/2/3] SELECT &bull; [SPACE/ENTER] SUBMIT &bull; [K] BA II+</span>
              </span>
              <span className="text-white font-bold">{activeQuestions.length} QUESTIONS IN SET</span>
            </div>
          </div>

          {/* Scratchpad (Collapsible) */}
          {isScratchpadOpen && (
            <div className="p-4 bg-[#0A0A0D] border border-brand-lime/30 rounded-xl space-y-2 font-mono animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-xs text-brand-lime">
                <span className="font-bold">SCRATCHPAD // INTERMEDIATE WORKINGS</span>
                <span className="text-[11px] text-zinc-400">Auto-persisted in session</span>
              </div>
              <textarea
                value={scratchpadText}
                onChange={(e) => setScratchpadText(e.target.value)}
                placeholder="Type intermediate keystrokes, cash flows, or formula steps..."
                rows={4}
                className="w-full bg-[#121215] border border-[#27272A] rounded-lg p-3 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-brand-lime font-mono"
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
                className={`p-5 rounded-xl border transition-all ${
                  chosen ? "bg-[#0E0E12] border-brand-lime/40" : "bg-[#0B0B0E] border-[#1F1F23]"
                }`}
              >
                {/* Question Header */}
                <div className="flex items-center justify-between mb-3 font-mono text-xs">
                  <span className="text-brand-lime font-bold">
                    QUESTION {idx + 1} OF {activeQuestions.length}
                  </span>
                  {q.losCode && (
                    <span className="text-editorial-dim text-[11px] px-1.5 py-0.5 rounded bg-[#141418] border border-[#27272A]">
                      {q.losCode}
                    </span>
                  )}
                </div>

                {/* Question Stem */}
                <div className="text-xs sm:text-sm text-zinc-100 font-medium mb-4 leading-relaxed">
                  <FormattedMathText text={q.stem} />
                </div>

                {/* Option Selector (A, B, C) */}
                <div className="space-y-2 font-mono">
                  {(["A", "B", "C"] as OptionKey[]).map((opt) => {
                    const isSelected = chosen === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleSelectOption(q.sessionItemId, opt)}
                        disabled={hasSubmitted}
                        className={`w-full text-left p-3 rounded-lg border transition-all flex items-start gap-3 select-none min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime ${
                          isSelected
                            ? "bg-brand-lime/10 border-brand-lime text-white shadow-[0_0_12px_rgba(216,255,62,0.15)]"
                            : "bg-[#121215] border-[#222226] text-zinc-300 hover:border-[#3F3F46] hover:bg-[#16161A]"
                        } ${hasSubmitted ? "cursor-not-allowed opacity-80" : ""}`}
                      >
                        <span
                          className={`inline-flex items-center justify-center w-5 h-5 rounded font-bold text-xs shrink-0 ${
                            isSelected
                              ? "bg-brand-lime text-black"
                              : "bg-[#1C1C22] text-editorial-dim border border-[#27272A]"
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
              className={`w-full py-3.5 px-4 rounded-xl font-mono text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                isFormComplete
                  ? "bg-brand-lime text-black hover:bg-brand-lime/90 shadow-lime-glow cursor-pointer active:scale-[0.99]"
                  : "bg-[#18181B] text-editorial-dim border border-[#27272A] cursor-not-allowed"
              }`}
            >
              <Send className="w-4 h-4" />
              <span>
                {isFormComplete
                  ? "SUBMIT PRACTICE SET"
                  : `SELECT ALL ANSWERS (${Object.keys(selectedAnswers).length}/${activeQuestions.length})`}
              </span>
            </button>
          ) : (
            <button
              onClick={handleResetForRetake}
              className="w-full py-3 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-[#141418] hover:bg-[#1A1A20] text-zinc-300 border border-[#27272A] transition-all"
            >
              RE-DRILL THIS PRACTICE SET (RESET)
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

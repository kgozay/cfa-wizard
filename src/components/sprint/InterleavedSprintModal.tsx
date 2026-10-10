"use client";

import React, { useState, useEffect } from "react";
import { X, Zap, Clock, CheckCircle, XCircle, RotateCcw, Award, ChevronDown, ChevronUp, Cpu } from "lucide-react";
import { useCFAStore } from "@/store/useCFAStore";
import { CFA_VIGNETTES } from "@/data/vignettes";
import { OptionKey, VignetteQuestion, TrapLogEntry } from "@/types/cfa";
import type { PracticeSession } from "@/types/practice";
import { FormattedMathText } from "@/components/common/KaTeXRenderer";
import { sound } from "@/components/common/SoundEffects";
import { legacyVignetteToPracticeItems } from "@/lib/practice/adapters";
import { createPracticeSession } from "@/lib/practice/createSession";
import { gradeAttempt } from "@/lib/practice/gradeAttempt";
import { useAccessibleDialog } from "@/hooks/useAccessibleDialog";
import { shouldIgnoreShortcut } from "@/lib/keyboard";

export interface SprintQuestionItem {
  uniqueKey: string;
  topicId: string;
  topicName: string;
  question: VignetteQuestion;
}

export const InterleavedSprintModal: React.FC = () => {
  const { isSprintModalOpen, setSprintModalOpen, soundEnabled, recordPracticeAttempt, savePracticeSession } = useCFAStore();

  const [sprintLength, setSprintLength] = useState<5 | 10 | 15>(10);
  const [sprintQuestions, setSprintQuestions] = useState<SprintQuestionItem[]>([]);
  const [practiceSession, setPracticeSession] = useState<PracticeSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, OptionKey>>({});
  const [questionTimes, setQuestionTimes] = useState<Record<string, number>>({});
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(90);
  const [expandedAutopsyId, setExpandedAutopsyId] = useState<string | null>(null);
  const dialogRef = useAccessibleDialog<HTMLDivElement>(isSprintModalOpen, () => setSprintModalOpen(false));

  // Generate randomized interleaved set
  const initSprint = (length: 5 | 10 | 15 = sprintLength) => {
    const allPracticeItems = CFA_VIGNETTES.flatMap((v) => legacyVignetteToPracticeItems(v));
    const session = createPracticeSession({
      mode: "sprint",
      items: allPracticeItems,
      requestedCount: length,
      shuffleQuestions: true,
      timerMode: "timed",
      targetSecondsPerItem: 90,
    });
    savePracticeSession(session, false);
    setPracticeSession(session);

    const items: SprintQuestionItem[] = session.presentedItems.map((pi, index) => {
      const sourceItem = allPracticeItems.find((item) => item.id === pi.sourceItemId) || allPracticeItems[index];
      return {
        uniqueKey: pi.sessionItemId,
        topicId: sourceItem.topicId,
        topicName: sourceItem.topicName,
        question: {
          id: index + 1,
          stem: pi.stem,
          options: pi.options,
          correctOption: pi.correctOption,
          algebraicSolution: sourceItem.solution,
          calculatorKeystrokes: sourceItem.calculatorKeystrokes || "",
          trapCategory: sourceItem.trapCategory,
          errorModeDefault: sourceItem.errorModeDefault,
          losCode: sourceItem.losCode,
          distractorAutopsy: {
            A: pi.distractorFeedback.A,
            B: pi.distractorFeedback.B,
            C: pi.distractorFeedback.C,
          },
        },
      };
    });

    setSprintQuestions(items);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setQuestionTimes({});
    setIsFinished(false);
    setSecondsRemaining(90);
    setExpandedAutopsyId(null);
  };

  useEffect(() => {
    if (isSprintModalOpen) {
      initSprint();
    }
    // A new sprint is dealt only when the modal opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSprintModalOpen]);

  // 90-second countdown per question
  useEffect(() => {
    if (!isSprintModalOpen || isFinished || sprintQuestions.length === 0) return;

    // The updater stays pure; advancing on timeout happens in the effect below
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [isSprintModalOpen, isFinished, currentIndex, sprintQuestions]);

  useEffect(() => {
    if (!isSprintModalOpen || isFinished || sprintQuestions.length === 0 || secondsRemaining > 0) return;
    handleAdvance(null, 90);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsRemaining]);

  // Keyboard shortcut listener for rapid sprint answering (1/2/3, A/B/C, Esc)
  useEffect(() => {
    if (!isSprintModalOpen || isFinished) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (shouldIgnoreShortcut(e)) return;
      // The calculator owns digit and C keys while it is open
      if (useCFAStore.getState().isCalculatorOpen) return;

      const key = e.key.toUpperCase();
      if (key === "1" || key === "A") {
        handleAdvance("A");
      } else if (key === "2" || key === "B") {
        handleAdvance("B");
      } else if (key === "3" || key === "C") {
        handleAdvance("C");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // handleAdvance is recreated each render; the listener is refreshed per question
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSprintModalOpen, isFinished, currentIndex, sprintQuestions]);

  if (!isSprintModalOpen || sprintQuestions.length === 0) return null;

  const currentItem = sprintQuestions[currentIndex];
  const q = currentItem?.question;

  const handleAdvance = (chosenOption: OptionKey | null, elapsedOverride?: number) => {
    if (soundEnabled) sound.playKeyClick();
    if (!currentItem) return;

    const qKey = currentItem.uniqueKey;
    const timeSpent = elapsedOverride ?? Math.max(1, 90 - secondsRemaining);

    const updatedAnswers = { ...selectedAnswers };
    if (chosenOption) {
      updatedAnswers[qKey] = chosenOption;
      setSelectedAnswers(updatedAnswers);
    }
    const updatedTimes = { ...questionTimes, [qKey]: timeSpent };
    setQuestionTimes(updatedTimes);

    if (currentIndex < sprintQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSecondsRemaining(90);
    } else {
      setIsFinished(true);
      if (soundEnabled) sound.playSuccessChime();

      if (!practiceSession) return;
      const attempt = gradeAttempt({
        session: practiceSession,
        answers: Object.fromEntries(sprintQuestions.map((item) => [item.uniqueKey, updatedAnswers[item.uniqueKey] || null])),
        timing: updatedTimes,
        trapCategories: Object.fromEntries(sprintQuestions.map((item) => [item.uniqueKey, item.question.trapCategory])),
        errorModes: Object.fromEntries(sprintQuestions.filter((item) => item.question.errorModeDefault).map((item) => [item.uniqueKey, item.question.errorModeDefault!])),
      });
      const trapEntries: TrapLogEntry[] = [];

      sprintQuestions.forEach((item, index) => {
        const userChoice = updatedAnswers[item.uniqueKey];
        const isCorrect = userChoice === item.question.correctOption;
        if (!isCorrect) {
          const itemAttempt = attempt.itemAttempts[index];
          trapEntries.push({
            id: crypto.randomUUID(),
            timestamp: attempt.submittedAt,
            topicId: item.topicId,
            topicName: item.topicName,
            questionId: item.question.id,
            questionStem: item.question.stem,
            options: item.question.options,
            userChoice: userChoice || undefined,
            selectedOption: userChoice || undefined,
            correctOption: item.question.correctOption,
            trapCategory: item.question.trapCategory,
            trapName: item.question.trapCategory,
            errorMode: item.question.errorModeDefault || "UNSPECIFIED",
            autopsyExplanation: userChoice ? item.question.distractorAutopsy[userChoice] : "Time expired before an answer was selected.",
            solution: item.question.algebraicSolution,
            calculatorKeystrokes: item.question.calculatorKeystrokes,
            attemptId: attempt.id,
            itemAttemptId: itemAttempt.id,
            sessionItemId: item.uniqueKey,
            sourceItemId: itemAttempt.sourceItemId,
          });
        }
      });

      recordPracticeAttempt(attempt, trapEntries);
    }
  };

  // Results calculation
  let correctCount = 0;
  const topicStats: Record<string, { total: number; correct: number; name: string }> = {};

  if (isFinished) {
    sprintQuestions.forEach((item) => {
      const isCorrect = selectedAnswers[item.uniqueKey] === item.question.correctOption;
      if (isCorrect) correctCount += 1;

      if (!topicStats[item.topicId]) {
        topicStats[item.topicId] = { total: 0, correct: 0, name: item.topicName };
      }
      topicStats[item.topicId].total += 1;
      if (isCorrect) topicStats[item.topicId].correct += 1;
    });
  }

  return (
    <div
      ref={dialogRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sprint-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 font-sans"
    >
      <div className="liquid-glass-card rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Sprint Header */}
        <div className="p-4 sm:p-5 border-b border-white/[0.04] bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-warning/20 flex items-center justify-center text-warning">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 id="sprint-modal-title" className="text-sm font-bold text-white">
                Mixed-topic sprint · {sprintLength} questions
              </h2>
              <p className="text-[11px] tabular-nums text-muted">
                Simulates real exam context switching under strict 90-second pace pressure
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isFinished && (
              <div className="hidden sm:flex items-center gap-1 bg-surface-interactive border border-control p-0.5 rounded-lg text-[10px] tabular-nums text-muted">
                {([5, 10, 15] as const).map((len) => (
                  <button
                    key={len}
                    onClick={() => {
                      setSprintLength(len);
                      initSprint(len);
                    }}
                    className={`px-2 py-1 rounded transition-all ${
                      sprintLength === len
                        ? "bg-accent text-accent-ink font-bold"
                        : "hover:text-white"
                    }`}
                  >
                    {len}Q
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => setSprintModalOpen(false)}
              aria-label="Close sprint modal"
              className="p-2 rounded-lg bg-surface-interactive text-muted hover:text-white border border-control min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {!isFinished ? (
            <div className="space-y-6">
              
              {/* Progress & Pacing Bar */}
              <div className="flex items-center justify-between tabular-nums text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-accent font-bold">
                    QUESTION {currentIndex + 1} OF {sprintQuestions.length}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-surface-interactive border border-control text-muted text-[11px]">
                    TOPIC {currentItem.topicId}: {currentItem.topicName}
                  </span>
                </div>

                <div
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border font-bold text-xs ${
                    secondsRemaining < 20
                      ? "bg-danger/20 text-danger border-danger/50 animate-pulse"
                      : secondsRemaining < 45
                      ? "bg-warning/20 text-warning border-warning/50"
                      : "bg-surface-interactive text-accent border-accent/40"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{secondsRemaining}s</span>
                </div>
              </div>

              {/* Question Stem */}
              <div className="p-5 rounded-xl bg-background-elevated border border-control text-sm text-foreground leading-relaxed font-sans shadow-inner">
                <FormattedMathText text={q.stem} />
              </div>

              {/* Option Selector */}
              <div className="space-y-2.5 tabular-nums">
                {(["A", "B", "C"] as OptionKey[]).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleAdvance(opt)}
                    className="w-full text-left p-3.5 rounded-lg border border-control bg-surface-interactive hover:bg-surface-raised hover:border-accent/50 text-foreground transition-all flex items-start gap-3 active:scale-[0.99] min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <span className="w-6 h-6 rounded bg-surface-raised border border-control flex items-center justify-center font-bold text-xs shrink-0 text-accent">
                      {opt}
                    </span>
                    <div className="text-xs leading-relaxed font-sans pt-0.5">
                      <FormattedMathText text={q.options[opt]} />
                    </div>
                  </button>
                ))}
              </div>

            </div>
          ) : (
            /* Sprint Diagnostic Scorecard */
            <div className="space-y-6">
              <div className="p-6 rounded-xl bg-accent/10 border border-accent/40 text-center space-y-2">
                <Award className="w-10 h-10 text-accent mx-auto" />
                <div className="tabular-nums text-2xl font-semibold text-white">
                  Sprint score: <span className="text-accent">{correctCount}</span> / {sprintQuestions.length} ({Math.round((correctCount / sprintQuestions.length) * 100)}%)
                </div>
                <p className="text-xs text-muted-strong">
                  Cross-topic context switching performance analysis below:
                </p>
              </div>

              {/* Topic-by-Topic Breakdown */}
              <div className="space-y-3 tabular-nums text-xs">
                <span className="text-muted block">
                  Track-by-Track Diagnostic Summary:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(topicStats).map(([topicId, stats]) => {
                    const pct = Math.round((stats.correct / stats.total) * 100);
                    return (
                      <div
                        key={topicId}
                        className="p-3.5 rounded-lg bg-background-elevated border border-control flex items-center justify-between"
                      >
                        <div>
                          <span className="text-white font-bold block">
                            Topic {topicId}: {stats.name}
                          </span>
                          <span className="text-[11px] text-muted">
                            {stats.correct}/{stats.total} correct
                          </span>
                        </div>
                        <span
                          className={`font-bold px-2 py-1 rounded text-[11px] ${
                            pct >= 70
                              ? "bg-accent/20 text-accent border border-accent/40"
                              : "bg-danger/20 text-danger border border-danger/40"
                          }`}
                        >
                          {pct}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Distractor Autopsy Review */}
              <div className="space-y-3 tabular-nums text-xs">
                <span className="text-muted block">
                  Answer Review:
                </span>
                <div className="space-y-2">
                  {sprintQuestions.map((item, idx) => {
                    const userPick = selectedAnswers[item.uniqueKey];
                    const isCorrect = userPick === item.question.correctOption;
                    const isExpanded = expandedAutopsyId === item.uniqueKey;

                    return (
                      <div
                        key={item.uniqueKey}
                        className={`rounded-lg border transition-all ${
                          isCorrect
                            ? "bg-background-elevated border-control"
                            : "bg-danger/10 border-danger/30"
                        }`}
                      >
                        <button
                          onClick={() => setExpandedAutopsyId(isExpanded ? null : item.uniqueKey)}
                          className="w-full p-3 flex items-center justify-between text-left"
                        >
                          <div className="flex items-center gap-2">
                            {isCorrect ? (
                              <CheckCircle className="w-4 h-4 text-accent shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-danger shrink-0" />
                            )}
                            <span className="text-white font-medium">
                              Q{idx + 1}: Topic {item.topicId} &bull; User [{userPick || "None"}] vs Key [{item.question.correctOption}]
                            </span>
                          </div>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
                        </button>

                        {isExpanded && (
                          <div className="p-4 border-t border-control bg-background-elevated space-y-3 font-sans text-xs">
                            <div className="text-foreground">
                              <FormattedMathText text={item.question.stem} />
                            </div>
                            <div className="p-3 rounded bg-accent/5 border border-accent/30 text-accent space-y-1">
                              <span className="tabular-nums font-bold block">Canonical Solution:</span>
                              <FormattedMathText text={item.question.algebraicSolution} />
                            </div>
                            {userPick && item.question.distractorAutopsy[userPick] && (
                              <div className="p-3 rounded bg-danger/10 border border-danger/30 text-danger space-y-1">
                                <span className="tabular-nums font-bold block">Why your answer was incorrect ([{userPick}]):</span>
                                <FormattedMathText text={item.question.distractorAutopsy[userPick]} />
                              </div>
                            )}
                            {item.question.calculatorKeystrokes && (
                              <div className="p-2.5 rounded bg-surface-interactive border border-control flex items-center gap-2 tabular-nums text-[11px] text-warning">
                                <Cpu className="w-3.5 h-3.5 text-warning shrink-0" />
                                <span>{item.question.calculatorKeystrokes}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Modal Footer */}
        {isFinished && (
          <div className="p-4 border-t border-control bg-background-elevated flex items-center justify-between tabular-nums text-xs">
            <button
              onClick={() => initSprint(sprintLength)}
              className="px-4 py-2 rounded-lg bg-surface-interactive hover:bg-surface-raised text-muted-strong border border-control flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Start a new sprint</span>
            </button>
            <button
              onClick={() => setSprintModalOpen(false)}
              className="px-5 py-2 rounded-lg bg-accent text-accent-ink font-semibold hover:bg-accent/90"
            >
              Back to dashboard
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

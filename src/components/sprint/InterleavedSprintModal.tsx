"use client";

import React, { useState, useEffect } from "react";
import { X, Zap, Clock, CheckCircle, XCircle, ArrowRight, RotateCcw, Award, ChevronDown, ChevronUp, Cpu, Sparkles } from "lucide-react";
import { useCFAStore } from "@/store/useCFAStore";
import { CFA_VIGNETTES } from "@/data/vignettes";
import { OptionKey, VignetteQuestion, TrapLogEntry, QuestionSubmission } from "@/types/cfa";
import { FormattedMathText } from "@/components/common/KaTeXRenderer";
import { sound } from "@/components/common/SoundEffects";
import { legacyVignetteToPracticeItems } from "@/lib/practice/adapters";
import { createPracticeSession } from "@/lib/practice/createSession";

export interface SprintQuestionItem {
  uniqueKey: string;
  topicId: string;
  topicName: string;
  question: VignetteQuestion;
}

export const InterleavedSprintModal: React.FC = () => {
  const { isSprintModalOpen, setSprintModalOpen, soundEnabled, recordVignetteSubmission } = useCFAStore();

  const [sprintLength, setSprintLength] = useState<5 | 10 | 15>(10);
  const [sprintQuestions, setSprintQuestions] = useState<SprintQuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, OptionKey>>({});
  const [questionTimes, setQuestionTimes] = useState<Record<string, number>>({});
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(90);
  const [expandedAutopsyId, setExpandedAutopsyId] = useState<string | null>(null);

  // Generate randomized interleaved set
  const initSprint = (length: 5 | 10 | 15 = sprintLength) => {
    const allPracticeItems = CFA_VIGNETTES.flatMap((v) => legacyVignetteToPracticeItems(v));
    const session = createPracticeSession({
      mode: "sprint",
      items: allPracticeItems,
      requestedCount: length,
      shuffleQuestions: true,
    });

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
  }, [isSprintModalOpen]);

  // 90-second countdown per question
  useEffect(() => {
    if (!isSprintModalOpen || isFinished || sprintQuestions.length === 0) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          handleAdvance(null);
          return 90;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isSprintModalOpen, isFinished, currentIndex, sprintQuestions]);

  // Keyboard shortcut listener for rapid sprint answering (1/2/3, A/B/C, Esc)
  useEffect(() => {
    if (!isSprintModalOpen || isFinished) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

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
  }, [isSprintModalOpen, isFinished, currentIndex, sprintQuestions]);

  if (!isSprintModalOpen || sprintQuestions.length === 0) return null;

  const currentItem = sprintQuestions[currentIndex];
  const q = currentItem?.question;

  const handleAdvance = (chosenOption: OptionKey | null) => {
    if (soundEnabled) sound.playKeyClick();
    if (!currentItem) return;

    const qKey = currentItem.uniqueKey;
    const timeSpent = Math.max(1, 90 - secondsRemaining);

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

      let score = 0;
      const trapEntries: TrapLogEntry[] = [];
      const submissions: QuestionSubmission[] = [];

      sprintQuestions.forEach((item) => {
        const userChoice = updatedAnswers[item.uniqueKey];
        const isCorrect = userChoice === item.question.correctOption;
        if (isCorrect) {
          score++;
        } else if (userChoice) {
          trapEntries.push({
            id: `sprint-trap-${item.uniqueKey}-${Date.now()}`,
            timestamp: new Date().toISOString(),
            topicId: item.topicId,
            topicName: item.topicName,
            questionId: item.question.id,
            questionStem: item.question.stem,
            options: item.question.options,
            userChoice,
            selectedOption: userChoice,
            correctOption: item.question.correctOption,
            trapCategory: item.question.trapCategory,
            trapName: item.question.trapCategory,
            errorMode: item.question.errorModeDefault || "UNSPECIFIED",
            autopsyExplanation: item.question.distractorAutopsy[userChoice] || item.question.algebraicSolution,
            calculatorKeystrokes: item.question.calculatorKeystrokes,
          });
        }

        submissions.push({
          questionId: item.question.id,
          selectedOption: userChoice || "A",
          isCorrect,
          trapTriggered: isCorrect ? undefined : item.question.trapCategory,
          errorModeLogged: isCorrect ? undefined : item.question.errorModeDefault,
          timeSpentSeconds: updatedTimes[item.uniqueKey] || 0,
        });
      });

      // Always save sprint attempts (including perfect 100% scores)
      recordVignetteSubmission(
        {
          vignetteId: `sprint-${Date.now()}`,
          topicId: "00",
          score,
          total: sprintQuestions.length,
          submittedAt: new Date().toISOString(),
          userAnswers: {},
          submissions,
          trapsTriggered: trapEntries.map((t) => t.trapName),
          totalTimeSeconds: Object.values(updatedTimes).reduce((a, b) => a + b, 0),
        },
        trapEntries
      );
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
      role="dialog"
      aria-modal="true"
      aria-labelledby="sprint-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 font-sans"
    >
      <div className="bg-[#0B0B0E] border border-[#27272A] rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Sprint Header */}
        <div className="p-4 sm:p-5 border-b border-[#1F1F23] bg-[#0E0E12] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 id="sprint-modal-title" className="text-sm font-mono font-bold text-white tracking-wide uppercase">
                CROSS-TRACK INTERLEAVED SPRINT // {sprintLength} QUESTIONS
              </h2>
              <p className="text-[11px] font-mono text-editorial-dim">
                Simulates real exam context switching under strict 90-second pace pressure
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isFinished && (
              <div className="hidden sm:flex items-center gap-1 bg-[#141418] border border-[#27272A] p-0.5 rounded-lg text-[10px] font-mono text-editorial-dim">
                {([5, 10, 15] as const).map((len) => (
                  <button
                    key={len}
                    onClick={() => {
                      setSprintLength(len);
                      initSprint(len);
                    }}
                    className={`px-2 py-1 rounded transition-all ${
                      sprintLength === len
                        ? "bg-brand-lime text-black font-bold"
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
              className="p-2 rounded-lg bg-[#141418] text-editorial-dim hover:text-white border border-[#27272A] min-h-[44px] min-w-[44px] flex items-center justify-center"
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
              <div className="flex items-center justify-between font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-brand-lime font-bold">
                    QUESTION {currentIndex + 1} OF {sprintQuestions.length}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#141418] border border-[#27272A] text-editorial-dim text-[11px]">
                    TOPIC {currentItem.topicId}: {currentItem.topicName}
                  </span>
                </div>

                <div
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border font-bold text-xs ${
                    secondsRemaining < 20
                      ? "bg-red-500/20 text-red-400 border-red-500/50 animate-pulse"
                      : secondsRemaining < 45
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                      : "bg-[#141418] text-brand-lime border-brand-lime/40"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{secondsRemaining}s</span>
                </div>
              </div>

              {/* Question Stem */}
              <div className="p-5 rounded-xl bg-[#0E0E12] border border-[#1F1F23] text-sm text-zinc-100 leading-relaxed font-sans shadow-inner">
                <FormattedMathText text={q.stem} />
              </div>

              {/* Option Selector */}
              <div className="space-y-2.5 font-mono">
                {(["A", "B", "C"] as OptionKey[]).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleAdvance(opt)}
                    className="w-full text-left p-3.5 rounded-lg border border-[#222226] bg-[#121215] hover:bg-[#18181C] hover:border-brand-lime/50 text-zinc-200 transition-all flex items-start gap-3 active:scale-[0.99] min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime"
                  >
                    <span className="w-6 h-6 rounded bg-[#1A1A20] border border-[#2A2A30] flex items-center justify-center font-bold text-xs shrink-0 text-brand-lime">
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
              <div className="p-6 rounded-xl bg-brand-lime/10 border border-brand-lime/40 text-center space-y-2">
                <Award className="w-10 h-10 text-brand-lime mx-auto" />
                <div className="font-mono text-2xl font-extrabold text-white">
                  SPRINT SCORE: <span className="text-brand-lime">{correctCount}</span> / {sprintQuestions.length} ({Math.round((correctCount / sprintQuestions.length) * 100)}%)
                </div>
                <p className="text-xs text-editorial-steely">
                  Cross-topic context switching performance analysis below:
                </p>
              </div>

              {/* Topic-by-Topic Breakdown */}
              <div className="space-y-3 font-mono text-xs">
                <span className="text-editorial-dim uppercase tracking-wider block">
                  Track-by-Track Diagnostic Summary:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(topicStats).map(([topicId, stats]) => {
                    const pct = Math.round((stats.correct / stats.total) * 100);
                    return (
                      <div
                        key={topicId}
                        className="p-3.5 rounded-lg bg-[#0E0E12] border border-[#1F1F23] flex items-center justify-between"
                      >
                        <div>
                          <span className="text-white font-bold block">
                            Topic {topicId}: {stats.name}
                          </span>
                          <span className="text-[11px] text-editorial-dim">
                            {stats.correct}/{stats.total} correct
                          </span>
                        </div>
                        <span
                          className={`font-bold px-2 py-1 rounded text-[11px] ${
                            pct >= 70
                              ? "bg-brand-lime/20 text-brand-lime border border-brand-lime/40"
                              : "bg-red-500/20 text-red-400 border border-red-500/40"
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
              <div className="space-y-3 font-mono text-xs">
                <span className="text-editorial-dim uppercase tracking-wider block">
                  Question Autopsy Review:
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
                            ? "bg-[#0E0E12] border-[#1F1F23]"
                            : "bg-red-950/10 border-red-900/30"
                        }`}
                      >
                        <button
                          onClick={() => setExpandedAutopsyId(isExpanded ? null : item.uniqueKey)}
                          className="w-full p-3 flex items-center justify-between text-left"
                        >
                          <div className="flex items-center gap-2">
                            {isCorrect ? (
                              <CheckCircle className="w-4 h-4 text-brand-lime shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                            )}
                            <span className="text-white font-medium">
                              Q{idx + 1}: Topic {item.topicId} &bull; User [{userPick || "None"}] vs Key [{item.question.correctOption}]
                            </span>
                          </div>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-editorial-dim" /> : <ChevronDown className="w-4 h-4 text-editorial-dim" />}
                        </button>

                        {isExpanded && (
                          <div className="p-4 border-t border-[#1F1F23] bg-[#0A0A0D] space-y-3 font-sans text-xs">
                            <div className="text-zinc-200">
                              <FormattedMathText text={item.question.stem} />
                            </div>
                            <div className="p-3 rounded bg-brand-lime/5 border border-brand-lime/30 text-brand-lime space-y-1">
                              <span className="font-mono font-bold block">Canonical Solution:</span>
                              <FormattedMathText text={item.question.algebraicSolution} />
                            </div>
                            {userPick && item.question.distractorAutopsy[userPick] && (
                              <div className="p-3 rounded bg-red-500/10 border border-red-500/30 text-red-300 space-y-1">
                                <span className="font-mono font-bold block">Your Selection Autopsy ([{userPick}]):</span>
                                <FormattedMathText text={item.question.distractorAutopsy[userPick]} />
                              </div>
                            )}
                            {item.question.calculatorKeystrokes && (
                              <div className="p-2.5 rounded bg-[#141418] border border-[#27272A] flex items-center gap-2 font-mono text-[11px] text-amber-300">
                                <Cpu className="w-3.5 h-3.5 text-amber-400 shrink-0" />
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
          <div className="p-4 border-t border-[#1F1F23] bg-[#0E0E12] flex items-center justify-between font-mono text-xs">
            <button
              onClick={() => initSprint(sprintLength)}
              className="px-4 py-2 rounded-lg bg-[#141418] hover:bg-[#1A1A20] text-zinc-300 border border-[#27272A] flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>START NEW SPRINT</span>
            </button>
            <button
              onClick={() => setSprintModalOpen(false)}
              className="px-5 py-2 rounded-lg bg-brand-lime text-black font-extrabold hover:bg-brand-lime/90"
            >
              RETURN TO COCKPIT
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

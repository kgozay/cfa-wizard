"use client";

import React, { useState, useEffect } from "react";
import { X, Zap, Clock, CheckCircle, XCircle, ArrowRight, RotateCcw, Award, ChevronDown, ChevronUp, Cpu, Sparkles } from "lucide-react";
import { useCFAStore } from "@/store/useCFAStore";
import { CFA_VIGNETTES } from "@/data/vignettes";
import { OptionKey, VignetteQuestion, TrapLogEntry } from "@/types/cfa";
import { FormattedMathText } from "@/components/common/KaTeXRenderer";
import { sound } from "@/components/common/SoundEffects";

export const InterleavedSprintModal: React.FC = () => {
  const { isSprintModalOpen, setSprintModalOpen, soundEnabled, recordVignetteSubmission } = useCFAStore();

  const [sprintLength, setSprintLength] = useState<5 | 10 | 15>(10);
  const [sprintQuestions, setSprintQuestions] = useState<{ question: VignetteQuestion; topicId: string; topicName: string }[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, OptionKey>>({});
  const [questionTimes, setQuestionTimes] = useState<Record<number, number>>({});
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(90);
  const [expandedAutopsyId, setExpandedAutopsyId] = useState<number | null>(null);

  // Generate randomized interleaved set
  const initSprint = (length: 5 | 10 | 15 = sprintLength) => {
    const pool: { question: VignetteQuestion; topicId: string; topicName: string }[] = [];
    CFA_VIGNETTES.forEach((v) => {
      v.questions.forEach((q) => {
        pool.push({
          question: q,
          topicId: v.topicId,
          topicName: v.topicName,
        });
      });
    });

    // Shuffle pool
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, length);

    setSprintQuestions(selected);
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
    const qId = q.id;

    const updatedAnswers = { ...selectedAnswers };
    if (chosenOption) {
      updatedAnswers[qId] = chosenOption;
      setSelectedAnswers(updatedAnswers);
    }
    setQuestionTimes((prev) => ({ ...prev, [qId]: 90 - secondsRemaining }));

    if (currentIndex < sprintQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSecondsRemaining(90);
    } else {
      setIsFinished(true);
      if (soundEnabled) sound.playSuccessChime();

      // Log missed sprint questions into trap logs
      const trapEntries: TrapLogEntry[] = [];
      sprintQuestions.forEach((item) => {
        const userChoice = updatedAnswers[item.question.id];
        if (userChoice && userChoice !== item.question.correctOption) {
          trapEntries.push({
            id: `sprint-trap-${item.question.id}-${Date.now()}`,
            timestamp: new Date().toISOString(),
            topicId: item.topicId,
            topicName: item.topicName,
            questionId: item.question.id,
            questionStem: item.question.stem,
            options: item.question.options,
            userChoice,
            correctOption: item.question.correctOption,
            trapCategory: item.question.trapCategory,
            trapName: item.question.trapCategory,
            errorMode: item.question.errorModeDefault || "UNSPECIFIED",
            autopsyExplanation: item.question.distractorAutopsy[userChoice] || item.question.algebraicSolution,
            calculatorKeystrokes: item.question.calculatorKeystrokes,
          });
        }
      });

      if (trapEntries.length > 0) {
        recordVignetteSubmission(
          {
            vignetteId: `sprint-${Date.now()}`,
            topicId: "00",
            score: sprintQuestions.length - trapEntries.length,
            total: sprintQuestions.length,
            submittedAt: new Date().toISOString(),
            userAnswers: updatedAnswers,
            submissions: [],
            trapsTriggered: trapEntries.map((t) => t.trapName),
            totalTimeSeconds: Object.values(questionTimes).reduce((a, b) => a + b, 0),
          },
          trapEntries
        );
      }
    }
  };

  // Results calculation
  let correctCount = 0;
  const topicStats: Record<string, { total: number; correct: number; name: string }> = {};

  if (isFinished) {
    sprintQuestions.forEach((item) => {
      const isCorrect = selectedAnswers[item.question.id] === item.question.correctOption;
      if (isCorrect) correctCount += 1;

      if (!topicStats[item.topicId]) {
        topicStats[item.topicId] = { total: 0, correct: 0, name: item.topicName };
      }
      topicStats[item.topicId].total += 1;
      if (isCorrect) topicStats[item.topicId].correct += 1;
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div className="bg-[#0B0B0E] border border-[#27272A] rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Sprint Header */}
        <div className="p-4 sm:p-5 border-b border-[#1F1F23] bg-[#0E0E12] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-mono font-bold text-white tracking-wide uppercase">
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
              className="p-1.5 rounded-lg bg-[#141418] text-editorial-dim hover:text-white border border-[#27272A]"
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
                    className="w-full text-left p-3.5 rounded-lg border border-[#222226] bg-[#121215] hover:bg-[#18181C] hover:border-brand-lime/50 text-zinc-200 transition-all flex items-start gap-3 active:scale-[0.99]"
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
                    const userPick = selectedAnswers[item.question.id];
                    const isCorrect = userPick === item.question.correctOption;
                    const isExpanded = expandedAutopsyId === item.question.id;

                    return (
                      <div
                        key={item.question.id}
                        className={`rounded-lg border transition-all ${
                          isCorrect
                            ? "bg-[#0E0E12] border-[#1F1F23]"
                            : "bg-red-950/10 border-red-900/30"
                        }`}
                      >
                        <button
                          onClick={() => setExpandedAutopsyId(isExpanded ? null : item.question.id)}
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

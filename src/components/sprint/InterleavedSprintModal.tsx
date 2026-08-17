"use client";

import React, { useState, useEffect, useMemo } from "react";
import { X, Zap, Clock, CheckCircle, XCircle, ArrowRight, RotateCcw, Award } from "lucide-react";
import { useCFAStore } from "@/store/useCFAStore";
import { CFA_VIGNETTES } from "@/data/vignettes";
import { CFA_CURRICULUM } from "@/data/curriculum";
import { OptionKey, VignetteQuestion } from "@/types/cfa";
import { FormattedMathText } from "@/components/common/KaTeXRenderer";
import { sound } from "@/components/common/SoundEffects";

export const InterleavedSprintModal: React.FC = () => {
  const { isSprintModalOpen, setSprintModalOpen, soundEnabled } = useCFAStore();

  const [sprintQuestions, setSprintQuestions] = useState<{ question: VignetteQuestion; topicId: string; topicName: string }[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, OptionKey>>({});
  const [questionTimes, setQuestionTimes] = useState<Record<number, number>>({});
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(90);

  // Generate randomized interleaved set (up to 10 questions)
  const initSprint = () => {
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
    const selected = shuffled.slice(0, 10);

    setSprintQuestions(selected);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setQuestionTimes({});
    setIsFinished(false);
    setSecondsRemaining(90);
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
          // Auto advance if time runs out
          handleAdvance(null);
          return 90;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isSprintModalOpen, isFinished, currentIndex, sprintQuestions]);

  if (!isSprintModalOpen || sprintQuestions.length === 0) return null;

  const currentItem = sprintQuestions[currentIndex];
  const q = currentItem?.question;

  const handleAdvance = (chosenOption: OptionKey | null) => {
    if (soundEnabled) sound.playKeyClick();
    const qId = q.id;

    if (chosenOption) {
      setSelectedAnswers((prev) => ({ ...prev, [qId]: chosenOption }));
    }
    setQuestionTimes((prev) => ({ ...prev, [qId]: 90 - secondsRemaining }));

    if (currentIndex < sprintQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSecondsRemaining(90);
    } else {
      setIsFinished(true);
      if (soundEnabled) sound.playSuccessChime();
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
                CROSS-TRACK INTERLEAVED SPRINT // 10 QUESTIONS
              </h2>
              <p className="text-[11px] font-mono text-editorial-dim">
                Simulates real exam context switching under strict 90-second pace pressure
              </p>
            </div>
          </div>

          <button
            onClick={() => setSprintModalOpen(false)}
            className="p-1.5 rounded-lg bg-[#141418] text-editorial-dim hover:text-white border border-[#27272A]"
          >
            <X className="w-4 h-4" />
          </button>
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
              <div className="p-5 rounded-xl bg-[#0E0E12] border border-[#1F1F23] text-sm text-zinc-100 leading-relaxed font-sans">
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
                  Track-by-Track Vulnerability Report:
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
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {isFinished && (
          <div className="p-4 border-t border-[#1F1F23] bg-[#0E0E12] flex items-center justify-between font-mono text-xs">
            <button
              onClick={initSprint}
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

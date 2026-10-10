"use client";

import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import {
  BookOpen,
  RotateCcw,
  ArrowRight,
  Calculator,
  Tag,
  ShieldCheck,
  Zap } from "lucide-react";
import { OptionKey, VignetteSessionResult, VignetteSet, ErrorMode } from "@/types/cfa";
import { ERROR_MODE_LABELS } from "@/data/trapTaxonomy";
import { FormattedMathText } from "@/components/common/KaTeXRenderer";
import { KeystrokeSequence } from "@/components/calculator/KeystrokeBadge";
import { useCFAStore } from "@/store/useCFAStore";
import { sound } from "@/components/common/SoundEffects";
import { CFA_CURRICULUM } from "@/data/curriculum";

interface DiagnosticAutopsyViewProps {
  vignette: VignetteSet;
  result: VignetteSessionResult;
  onDrillAnother: () => void;
  onReviewFormulas: () => void;
  onReturnDashboard: () => void;
  onNextTrack: () => void;
}

export const DiagnosticAutopsyView: React.FC<DiagnosticAutopsyViewProps> = ({
  vignette,
  result,
  onDrillAnother,
  onReviewFormulas,
  onReturnDashboard,
  onNextTrack }) => {
  const { setCalculatorOpen, soundEnabled, logErrorMode, trapLogs } = useCFAStore();
  const [taggedErrors, setTaggedErrors] = useState<Record<number, ErrorMode>>({});

  useEffect(() => {
    if (result.score === result.total) {
      if (soundEnabled) sound.playSuccessChime();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#D8FF3E", "#CCFF00", "#FFFFFF", "#3F3F46"] });
      } catch {
        // ignore
      }
    } else {
      if (soundEnabled) sound.playWarningBuzz();
    }
  }, [result.score, result.total, soundEnabled]);

  const handleSelectErrorMode = (questionId: number, errorMode: ErrorMode) => {
    if (soundEnabled) sound.playKeyClick();
    setTaggedErrors((prev) => ({ ...prev, [questionId]: errorMode }));
    // Find matching trapLog targeting this specific topic and attempt
    const targetQ = vignette.questions.find((q) => q.id === questionId);
    const log = trapLogs.find(
      (l) => l.topicId === vignette.topicId && l.questionId === questionId
    ) || trapLogs.find(
      (l) => targetQ && l.questionStem === targetQ.stem
    );
    if (log) {
      logErrorMode(log.id, errorMode);
    }
  };

  const nextTopicId = (parseInt(vignette.topicId, 10) + 1).toString().padStart(2, "0");
  const hasNextTrack = CFA_CURRICULUM.some((t) => t.id === nextTopicId);

  const accuracyPct = Math.round((result.score / result.total) * 100);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 font-sans">
      
      {/* Score Banner Metric */}
      <div
        className={`p-6 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          result.score === result.total
            ? "bg-accent/10 border-accent/50 "
            : result.score > 0
            ? "bg-warning/10 border-warning/40"
            : "bg-danger/10 border-danger/40"
        }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center tabular-nums font-semibold text-xl ${
              result.score === result.total
                ? "bg-accent text-accent-ink "
                : result.score > 0
                ? "bg-warning text-black"
                : "bg-danger text-white"
            }`}
          >
            {result.score}/{result.total}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">
                Set complete: {accuracyPct}%
              </span>
              {result.score === result.total ? (
                <span className="px-2 py-0.5 rounded bg-accent text-accent-ink tabular-nums text-[10px] font-bold">
                  Perfect score
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-warning/20 text-warning tabular-nums text-[10px] font-bold border border-warning/40">
                  Traps to review
                </span>
              )}
            </div>
            <p className="text-xs text-muted-strong mt-1">
              {result.score === result.total
                ? "Every answer was correct. Review the solutions below to confirm your method."
                : "Review each missed question below. Tagging why you missed it helps focus your review deck and mistake log."}
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 tabular-nums text-xs w-full sm:w-auto">
          <button
            onClick={onReviewFormulas}
            className="flex-1 sm:flex-initial px-3 py-2 rounded-lg bg-surface-interactive hover:bg-surface-raised border border-control text-accent flex items-center justify-center gap-1.5 transition-all"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Formulas</span>
          </button>
          <button
            onClick={() => setCalculatorOpen(true)}
            className="flex-1 sm:flex-initial px-3 py-2 rounded-lg bg-surface-interactive hover:bg-surface-raised border border-control text-accent flex items-center justify-center gap-1.5 transition-all"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Calculator</span>
          </button>
        </div>
      </div>

      {/* Per-Question Surgical Autopsies */}
      <div className="space-y-6">
        <div className="flex items-center justify-between tabular-nums text-xs text-muted border-b border-control pb-2">
          <span className="">
            Answer review · {vignette.questions.length} questions
          </span>
          <span className="text-[11px] text-muted">
            Tag why you missed a question to focus your review
          </span>
        </div>

        {vignette.questions.map((q, idx) => {
          const userAnswer = result.userAnswers[q.id];
          const isCorrect = userAnswer === q.correctOption;
          const activeErrorMode =
            taggedErrors[q.id] || q.errorModeDefault || "UNSPECIFIED";

          return (
            <div
              key={q.id}
              className={`p-6 rounded-xl border bg-background-elevated space-y-6 ${
                isCorrect ? "border-accent/30" : "border-danger/40 shadow-[0_0_15px_rgba(239,68,68,0.05)]"
              }`}
            >
              {/* Question Autopsy Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-divider">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center tabular-nums font-bold text-xs ${
                      isCorrect
                        ? "bg-accent/20 text-accent border border-accent/40"
                        : "bg-danger/20 text-danger border border-danger/40"
                    }`}
                  >
                    Q{idx + 1}
                  </div>
                  <div>
                    <span className="tabular-nums text-xs font-bold text-white block">
                      {isCorrect ? "Correct" : "Missed"}
                    </span>
                    <span className="text-[11px] tabular-nums text-muted">
                      Your Answer: <strong className="text-white">[{userAnswer}]</strong> &bull; Correct:{" "}
                      <strong className="text-accent">[{q.correctOption}]</strong>
                    </span>
                  </div>
                </div>

                {q.losCode && (
                  <span className="px-2 py-1 rounded bg-surface-interactive border border-control tabular-nums text-[11px] text-accent">
                    {q.losCode}
                  </span>
                )}
              </div>

              {/* Question Stem Excerpt */}
              <div className="text-xs text-muted-strong font-medium leading-relaxed bg-background-elevated p-3.5 rounded-lg border border-divider">
                <FormattedMathText text={q.stem} />
              </div>

              {/* Interactive Distractor Matrix (A, B, C) */}
              <div className="space-y-2.5">
                <div className="text-[11px] text-muted">
                  Distractor Breakdown:
                </div>
                {(["A", "B", "C"] as OptionKey[]).map((opt) => {
                  const isUserPick = userAnswer === opt;
                  const isAnswerKey = q.correctOption === opt;
                  const autopsyText = q.distractorAutopsy[opt];

                  return (
                    <div
                      key={opt}
                      className={`p-3.5 rounded-lg border text-xs font-sans transition-all ${
                        isAnswerKey
                          ? "bg-accent/10 border-accent/50 text-white"
                          : isUserPick
                          ? "bg-danger/10 border-danger/40 text-danger"
                          : "bg-surface-interactive border-divider text-muted"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5 tabular-nums text-[11px] font-bold">
                        <span
                          className={`w-5 h-5 rounded flex items-center justify-center text-[10px] ${
                            isAnswerKey
                              ? "bg-accent text-accent-ink"
                              : isUserPick
                              ? "bg-danger text-white"
                              : "bg-surface-raised text-muted"
                          }`}
                        >
                          {opt}
                        </span>
                        <span>{isAnswerKey ? "Correct answer" : isUserPick ? "Your answer" : "Incorrect option"}</span>
                        <span className="text-muted font-normal">&bull; {q.options[opt]}</span>
                      </div>
                      <p className="text-xs leading-relaxed pl-7">
                        <FormattedMathText text={autopsyText} />
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Texas Instruments BA II Plus Keystroke Sequence */}
              {q.calculatorKeystrokes && (
                <div className="p-4 rounded-lg bg-background-elevated border border-control space-y-2">
                  <div className="flex items-center justify-between text-xs tabular-nums text-accent">
                    <span className="flex items-center gap-1.5 font-bold">
                      <Calculator className="w-3.5 h-3.5" />
                      <span>BA II Plus keystrokes:</span>
                    </span>
                    <button
                      onClick={() => setCalculatorOpen(true)}
                      className="text-[10px] text-muted hover:text-white underline"
                    >
                      Open in Emulator &rarr;
                    </button>
                  </div>
                  <KeystrokeSequence sequence={q.calculatorKeystrokes} />
                </div>
              )}

              {/* Algebraic Canonical Solution */}
              <div className="p-4 rounded-lg bg-background-elevated border border-control space-y-1.5">
                <span className="text-xs font-bold text-muted block">
                  Algebraic & Theoretical Proof:
                </span>
                <div className="text-xs text-foreground leading-relaxed">
                  <FormattedMathText text={q.algebraicSolution} />
                </div>
              </div>

              {/* Post-Mortem Error Taxonomy (Only rendered on missed questions) or Mastered Badge */}
              {!isCorrect ? (
                <div className="p-4 rounded-lg bg-surface-interactive border border-danger/30 space-y-3 tabular-nums">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-warning font-bold flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      <span>Why did you miss it?</span>
                    </span>
                    <span className="text-[11px] text-muted">
                      Currently Logged:{" "}
                      <strong className="text-accent">
                        {ERROR_MODE_LABELS[activeErrorMode]?.label || activeErrorMode}
                      </strong>
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {(
                      [
                        "SIGN_INVERSION",
                        "BA2_MODE",
                        "PERIODICITY_MISMATCH",
                        "GAAP_VS_IFRS",
                        "FORMULA_SCALAR",
                        "CONCEPTUAL_CONFUSION",
                        "READING_MISINTERPRETATION",
                      ] as ErrorMode[]
                    ).map((mode) => {
                      const isSelected = activeErrorMode === mode;
                      return (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => handleSelectErrorMode(q.id, mode)}
                          className={`px-2.5 py-1 rounded text-xs border transition-all ${
                            isSelected
                              ? "bg-accent text-accent-ink font-bold border-accent "
                              : "bg-surface-raised text-muted-strong border-control hover:text-white hover:border-control-boundary-hover"
                          }`}
                        >
                          {ERROR_MODE_LABELS[mode].label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-lg bg-accent/5 border border-accent/30 flex items-center justify-between tabular-nums text-xs">
                  <div className="flex items-center gap-2 text-accent font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Answered correctly</span>
                  </div>
                  <span className="text-muted text-xs">Trap: {q.trapCategory}</span>
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* Bottom Master Navigation Actions */}
      <div className="p-6 bg-background-elevated border border-control rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 tabular-nums text-xs shadow-lg">
        <button
          onClick={onReturnDashboard}
          className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-surface-interactive hover:bg-surface-raised border border-control text-muted-strong font-bold transition-all"
        >
          &larr; Back to dashboard
        </button>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={() => {
              if (soundEnabled) sound.playNodeSwitch();
              useCFAStore.getState().setAIGeneratorOpen(true);
            }}
            className="px-4 py-2.5 rounded-lg bg-surface-raised hover:bg-surface-raised border border-accent/40 text-accent font-bold transition-all flex items-center justify-center gap-1.5"
            title="Generate AI practice questions targeted at this topic"
          >
            <Zap className="w-3.5 h-3.5 text-accent" />
            <span>Generate similar questions</span>
          </button>

          <button
            onClick={onDrillAnother}
            className="px-4 py-2.5 rounded-lg bg-surface-raised hover:bg-surface-raised border border-control text-white font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New questions on this topic</span>
          </button>

          {hasNextTrack && (
            <button
              onClick={onNextTrack}
              className="px-5 py-2.5 rounded-lg bg-accent text-accent-ink font-semibold hover:bg-accent/90 transition-all flex items-center justify-center gap-1.5"
            >
              <span>Next topic</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

    </div>
  );
};

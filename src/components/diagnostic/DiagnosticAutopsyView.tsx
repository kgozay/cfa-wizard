"use client";

import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  BookOpen,
  RotateCcw,
  ArrowRight,
  Calculator,
  Tag,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { OptionKey, VignetteSessionResult, VignetteSet, ErrorMode } from "@/types/cfa";
import { TRAP_TAXONOMY, ERROR_MODE_LABELS } from "@/data/trapTaxonomy";
import { KaTeXRenderer, FormattedMathText } from "@/components/common/KaTeXRenderer";
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
  onNextTrack,
}) => {
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
          colors: ["#D8FF3E", "#CCFF00", "#FFFFFF", "#3F3F46"],
        });
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
    // Find matching trapLog
    const log = trapLogs.find((l) => l.questionStem === vignette.questions.find((q) => q.id === questionId)?.stem);
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
            ? "bg-brand-lime/10 border-brand-lime/50 shadow-lime-glow"
            : result.score > 0
            ? "bg-amber-500/10 border-amber-500/40"
            : "bg-red-500/10 border-red-500/40"
        }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center font-mono font-extrabold text-xl ${
              result.score === result.total
                ? "bg-brand-lime text-black shadow-lime-sm"
                : result.score > 0
                ? "bg-amber-400 text-black"
                : "bg-red-500 text-white"
            }`}
          >
            {result.score}/{result.total}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                SURGICAL DIAGNOSTIC EVALUATION COMPLETE ({accuracyPct}%)
              </span>
              {result.score === result.total ? (
                <span className="px-2 py-0.5 rounded bg-brand-lime text-black font-mono text-[10px] font-bold">
                  PERFECT SCORE
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-400/40">
                  TRAP MECHANISMS TRIGGERED
                </span>
              )}
            </div>
            <p className="text-xs text-editorial-steely mt-1">
              {result.score === result.total
                ? "Flawless execution. All distractor traps successfully recognized, calculated, and avoided."
                : "Diagnostic analysis has isolated the mathematical, convention, and accounting traps triggered below. Tag your error modes to update your Trap Immunity Index."}
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 font-mono text-xs w-full sm:w-auto">
          <button
            onClick={onReviewFormulas}
            className="flex-1 sm:flex-initial px-3 py-2 rounded-lg bg-[#141418] hover:bg-[#1C1C22] border border-[#27272A] text-brand-lime flex items-center justify-center gap-1.5 transition-all"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>FORMULAS</span>
          </button>
          <button
            onClick={() => setCalculatorOpen(true)}
            className="flex-1 sm:flex-initial px-3 py-2 rounded-lg bg-[#141418] hover:bg-[#1C1C22] border border-[#27272A] text-brand-lime flex items-center justify-center gap-1.5 transition-all"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>BA II+ EMULATOR</span>
          </button>
        </div>
      </div>

      {/* Per-Question Surgical Autopsies */}
      <div className="space-y-6">
        <div className="flex items-center justify-between font-mono text-xs text-editorial-dim border-b border-[#1F1F23] pb-2">
          <span className="uppercase tracking-wider">
            STEP-BY-STEP DISTRACTOR AUTOPSY // {vignette.questions.length} QUESTIONS
          </span>
          <span className="text-[11px] text-editorial-muted">
            TAG YOUR ERROR MODE TO CALIBRATE SPACED REPETITION
          </span>
        </div>

        {vignette.questions.map((q, idx) => {
          const userAnswer = result.userAnswers[q.id];
          const isCorrect = userAnswer === q.correctOption;
          const trapInfo = TRAP_TAXONOMY[q.trapCategory];
          const activeErrorMode =
            taggedErrors[q.id] || q.errorModeDefault || "UNSPECIFIED";

          return (
            <div
              key={q.id}
              className={`p-6 rounded-xl border bg-[#0B0B0E] space-y-6 ${
                isCorrect ? "border-brand-lime/30" : "border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.05)]"
              }`}
            >
              {/* Question Autopsy Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#1A1A1E]">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                      isCorrect
                        ? "bg-brand-lime/20 text-brand-lime border border-brand-lime/40"
                        : "bg-red-500/20 text-red-400 border border-red-500/40"
                    }`}
                  >
                    Q{idx + 1}
                  </div>
                  <div>
                    <span className="font-mono text-xs font-bold text-white block">
                      {isCorrect ? "CORRECT EXECUTION" : "TRAP TRIGGERED"}
                    </span>
                    <span className="text-[11px] font-mono text-editorial-dim">
                      Your Answer: <strong className="text-white">[{userAnswer}]</strong> &bull; Correct:{" "}
                      <strong className="text-brand-lime">[{q.correctOption}]</strong>
                    </span>
                  </div>
                </div>

                {q.losCode && (
                  <span className="px-2 py-1 rounded bg-[#121215] border border-[#27272A] font-mono text-[11px] text-brand-lime">
                    {q.losCode}
                  </span>
                )}
              </div>

              {/* Question Stem Excerpt */}
              <div className="text-xs text-zinc-300 font-medium leading-relaxed bg-[#0E0E12] p-3.5 rounded-lg border border-[#1A1A1E]">
                <FormattedMathText text={q.stem} />
              </div>

              {/* Interactive Distractor Matrix (A, B, C) */}
              <div className="space-y-2.5">
                <div className="text-[11px] font-mono text-editorial-dim uppercase tracking-wider">
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
                          ? "bg-brand-lime/10 border-brand-lime/50 text-white"
                          : isUserPick
                          ? "bg-red-500/10 border-red-500/40 text-red-200"
                          : "bg-[#121215] border-[#1E1E22] text-zinc-400"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5 font-mono text-[11px] font-bold">
                        <span
                          className={`w-5 h-5 rounded flex items-center justify-center text-[10px] ${
                            isAnswerKey
                              ? "bg-brand-lime text-black"
                              : isUserPick
                              ? "bg-red-500 text-white"
                              : "bg-[#222226] text-zinc-400"
                          }`}
                        >
                          {opt}
                        </span>
                        <span>{isAnswerKey ? "CORRECT ANSWER" : isUserPick ? "YOUR SELECTION (TRAP)" : "DISTRACTOR"}</span>
                        <span className="text-zinc-500 font-normal">&bull; {q.options[opt]}</span>
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
                <div className="p-4 rounded-lg bg-[#0E0E12] border border-[#222228] space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-brand-lime">
                    <span className="flex items-center gap-1.5 font-bold">
                      <Calculator className="w-3.5 h-3.5" />
                      <span>TEXAS INSTRUMENTS BA II PLUS KEYSTROKE PATH:</span>
                    </span>
                    <button
                      onClick={() => setCalculatorOpen(true)}
                      className="text-[10px] text-editorial-dim hover:text-white underline"
                    >
                      Open in Emulator &rarr;
                    </button>
                  </div>
                  <KeystrokeSequence sequence={q.calculatorKeystrokes} />
                </div>
              )}

              {/* Algebraic Canonical Solution */}
              <div className="p-4 rounded-lg bg-[#0E0E12] border border-[#222228] space-y-1.5">
                <span className="text-xs font-mono font-bold text-editorial-muted uppercase tracking-wider block">
                  Algebraic & Theoretical Proof:
                </span>
                <div className="text-xs text-zinc-200 leading-relaxed">
                  <FormattedMathText text={q.algebraicSolution} />
                </div>
              </div>

              {/* Interactive Post-Mortem Error Mode Tagging (If missed or reviewed) */}
              <div className="p-4 rounded-lg bg-[#121216] border border-[#27272A] space-y-3 font-mono">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-editorial-steely font-bold flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-brand-lime" />
                    <span>POST-MORTEM ERROR TAXONOMY:</span>
                  </span>
                  <span className="text-[10px] text-editorial-dim">
                    Currently Logged:{" "}
                    <strong className="text-brand-lime">
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
                        className={`px-2.5 py-1 rounded text-[10px] border transition-all ${
                          isSelected
                            ? "bg-brand-lime text-black font-bold border-brand-lime shadow-lime-sm"
                            : "bg-[#18181C] text-zinc-400 border-[#2A2A30] hover:text-white hover:border-[#3F3F46]"
                        }`}
                      >
                        {ERROR_MODE_LABELS[mode].label}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Bottom Master Navigation Actions */}
      <div className="p-6 bg-[#0E0E12] border border-[#1F1F23] rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
        <button
          onClick={onReturnDashboard}
          className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-[#141418] hover:bg-[#1A1A20] border border-[#27272A] text-zinc-300 font-bold transition-all"
        >
          &larr; RETURN TO STUDY COCKPIT
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onDrillAnother}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-lg bg-[#18181C] hover:bg-[#222228] border border-[#2E2E36] text-white font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>DRILL NEXT VIGNETTE</span>
          </button>

          {hasNextTrack && (
            <button
              onClick={onNextTrack}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-lg bg-brand-lime text-black font-extrabold hover:bg-brand-lime/90 shadow-lime-glow transition-all flex items-center justify-center gap-1.5"
            >
              <span>ADVANCE TO TOPIC {nextTopicId}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

    </div>
  );
};

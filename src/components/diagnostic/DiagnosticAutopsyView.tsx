"use client";

import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { CheckCircle2, XCircle, AlertTriangle, Play, BookOpen, RotateCcw, ArrowRight, Calculator } from "lucide-react";
import { OptionKey, VignetteSessionResult, VignetteSet } from "@/types/cfa";
import { TRAP_TAXONOMY } from "@/data/trapTaxonomy";
import { KaTeXRenderer } from "@/components/common/KaTeXRenderer";
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
  const { setCalculatorOpen, soundEnabled } = useCFAStore();

  useEffect(() => {
    if (result.score === 2) {
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
  }, [result.score, soundEnabled]);

  const nextTopicId = (parseInt(vignette.topicId, 10) + 1).toString().padStart(2, "0");
  const hasNextTrack = CFA_CURRICULUM.some((t) => t.id === nextTopicId);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 font-sans">
      
      {/* Score Banner Metric */}
      <div
        className={`p-6 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          result.score === 2
            ? "bg-brand-lime/10 border-brand-lime/50 shadow-lime-glow"
            : result.score === 1
            ? "bg-amber-500/10 border-amber-500/40"
            : "bg-red-500/10 border-red-500/40"
        }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono font-extrabold text-xl ${
              result.score === 2
                ? "bg-brand-lime text-black shadow-lime-sm"
                : result.score === 1
                ? "bg-amber-400 text-black"
                : "bg-red-500 text-white"
            }`}
          >
            {result.score}/2
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                DIAGNOSTIC EVALUATION COMPLETE
              </span>
              {result.score === 2 ? (
                <span className="px-2 py-0.5 rounded bg-brand-lime text-black font-mono text-[10px] font-bold">
                  PERFECT SCORE
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-400/40">
                  TRAP TRIGGERED
                </span>
              )}
            </div>
            <p className="text-xs text-editorial-steely mt-1">
              {result.score === 2
                ? "Flawless execution. All distractor traps successfully recognized and avoided."
                : "Diagnostic analysis has mapped the underlying mathematical and conceptual misconceptions below."}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (soundEnabled) sound.playKeyClick();
            setCalculatorOpen(true);
          }}
          className="px-3.5 py-2 rounded-lg bg-[#18181B] text-white border border-[#3F3F46] hover:border-brand-lime/40 font-mono text-xs flex items-center gap-2 transition-all active:scale-95"
        >
          <Calculator className="w-3.5 h-3.5 text-brand-lime" />
          <span>Verify on BA II+</span>
        </button>
      </div>

      {/* Linked Questions Autopsy Breakdown */}
      {vignette.questions.map((q) => {
        const userAnswer = result.userAnswers[q.id];
        const isCorrect = userAnswer === q.correctOption;
        const trapInfo = TRAP_TAXONOMY[q.trapCategory];

        return (
          <div
            key={q.id}
            className="p-6 rounded-xl bg-[#0B0B0E] border border-[#1F1F23] space-y-6"
          >
            {/* Question Header & User Result */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#18181B]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-brand-lime">
                    QUESTION 0{q.id} OF 02
                  </span>
                  <span className="text-editorial-dim font-mono text-xs">•</span>
                  <span className="font-mono text-xs text-editorial-muted">
                    Trap Category: {q.trapCategory}
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-semibold text-white leading-snug">
                  {q.stem}
                </h4>
              </div>

              <div
                className={`px-3 py-1 rounded font-mono text-xs font-bold uppercase tracking-wider shrink-0 flex items-center gap-1.5 border ${
                  isCorrect
                    ? "bg-brand-lime/10 text-brand-lime border-brand-lime/40"
                    : "bg-red-500/10 text-red-400 border-red-500/40"
                }`}
              >
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>CORRECT ({userAnswer})</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" />
                    <span>CHOSE {userAnswer} // KEY: {q.correctOption}</span>
                  </>
                )}
              </div>
            </div>

            {/* Options Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-xs">
              {(["A", "B", "C"] as OptionKey[]).map((optKey) => {
                const isSelected = userAnswer === optKey;
                const isTheCorrectOption = q.correctOption === optKey;

                let optStyle = "bg-[#09090B] border-[#1F1F23] text-editorial-muted";
                if (isTheCorrectOption) {
                  optStyle = "bg-brand-lime/10 border-brand-lime/50 text-white shadow-[0_0_8px_rgba(216,255,62,0.1)]";
                } else if (isSelected && !isCorrect) {
                  optStyle = "bg-red-500/10 border-red-500/50 text-red-300";
                }

                return (
                  <div
                    key={optKey}
                    className={`p-3 rounded-lg border flex items-start gap-2 ${optStyle}`}
                  >
                    <span className="font-bold text-xs">{optKey}.</span>
                    <span className="text-xs">{q.options[optKey]}</span>
                  </div>
                );
              })}
            </div>

            {/* Algebraic Derivation Box */}
            <div className="p-4 rounded-xl bg-[#09090B] border border-[#1F1F23] space-y-2 font-mono text-xs">
              <div className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-lime" />
                <span>STEP-BY-STEP ALGEBRAIC DERIVATION</span>
              </div>
              <KaTeXRenderer math={q.algebraicSolution} block />
            </div>

            {/* TI BA II Plus Keystrokes Box */}
            {q.calculatorKeystrokes && q.calculatorKeystrokes !== "N/A" && (
              <div className="p-4 rounded-xl bg-[#121215] border border-[#27272A] space-y-2">
                <div className="font-mono text-[11px] font-bold text-editorial-muted uppercase tracking-wider">
                  TEXAS INSTRUMENTS BA II PLUS KEYSTROKE SEQUENCE:
                </div>
                <KeystrokeSequence sequence={q.calculatorKeystrokes} />
              </div>
            )}

            {/* Distractor Autopsy Engine Cards */}
            <div className="space-y-2">
              <div className="font-mono text-xs font-bold text-brand-lime tracking-wider uppercase flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>DISTRACTOR AUTOPSY ENGINE</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-sans text-xs">
                {(["A", "B", "C"] as OptionKey[]).map((optKey) => {
                  const isTheCorrectOption = q.correctOption === optKey;
                  const explanation = q.distractorAutopsy[optKey];

                  return (
                    <div
                      key={optKey}
                      className={`p-4 rounded-xl border flex flex-col justify-between ${
                        isTheCorrectOption
                          ? "bg-brand-lime/5 border-brand-lime/40"
                          : "bg-[#0E0E12] border-[#1F1F23]"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1F1F23] font-mono text-[11px]">
                          <span className={isTheCorrectOption ? "text-brand-lime font-bold" : "text-white font-semibold"}>
                            OPTION {optKey} {isTheCorrectOption ? "(KEY)" : "(DISTRACTOR)"}
                          </span>
                          {isTheCorrectOption ? (
                            <span className="text-brand-lime text-[10px] font-bold uppercase">CORRECT</span>
                          ) : (
                            <span className="text-red-400 text-[10px] uppercase">TRAP</span>
                          )}
                        </div>
                        <p className="text-xs text-editorial-steely leading-relaxed">
                          {explanation}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Candidate Trap Alert & Remediation */}
            {trapInfo && (
              <div className="p-3.5 rounded-lg bg-[#141418] border border-[#27272A] flex items-start gap-3 text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-mono text-[11px] font-bold text-white">
                    HISTORICAL CANDIDATE PITFALL: <span className="text-amber-400">{trapInfo.name}</span> ({trapInfo.historicalErrorRate})
                  </div>
                  <p className="text-editorial-steely text-xs mt-1">
                    {trapInfo.recommendedRemediation}
                  </p>
                </div>
              </div>
            )}

          </div>
        );
      })}

      {/* System Action Footer */}
      <div className="p-5 rounded-xl bg-[#0E0E12] border border-[#1F1F23] flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
        
        <div className="flex flex-wrap items-center gap-2">
          {/* [01] Drill Another Vignette */}
          <button
            onClick={() => {
              if (soundEnabled) sound.playNodeSwitch();
              onDrillAnother();
            }}
            className="px-4 py-2.5 rounded-lg bg-brand-lime text-black font-bold flex items-center gap-2 hover:bg-brand-neon active:scale-95 transition-all shadow-lime-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>[01] DRILL ANOTHER VIGNETTE</span>
          </button>

          {/* [02] Review Formula Matrix */}
          <button
            onClick={() => {
              if (soundEnabled) sound.playKeyClick();
              onReviewFormulas();
            }}
            className="px-4 py-2.5 rounded-lg bg-[#18181B] text-white border border-[#3F3F46] hover:border-brand-lime/40 flex items-center gap-2 transition-all active:scale-95"
          >
            <BookOpen className="w-3.5 h-3.5 text-brand-lime" />
            <span>[02] REVIEW FORMULA MATRIX</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* [03] Return to Curriculum */}
          <button
            onClick={() => {
              if (soundEnabled) sound.playKeyClick();
              onReturnDashboard();
            }}
            className="px-4 py-2.5 rounded-lg text-editorial-muted hover:text-white border border-[#27272A] hover:bg-[#141418] transition-all"
          >
            <span>[03] CURRICULUM INDEX</span>
          </button>

          {/* [04] Next Track (if available) */}
          {hasNextTrack && (
            <button
              onClick={() => {
                if (soundEnabled) sound.playNodeSwitch();
                onNextTrack();
              }}
              className="px-4 py-2.5 rounded-lg bg-[#18181B] text-brand-lime border border-brand-lime/40 hover:bg-brand-lime/10 flex items-center gap-1.5 font-bold transition-all"
            >
              <span>[04] NEXT TRACK</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>

    </div>
  );
};

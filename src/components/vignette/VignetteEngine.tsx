"use client";

import React, { useState } from "react";
import { ArrowLeft, Calculator, Edit3, CheckCircle, AlertCircle, ShieldAlert, Sparkles, Send } from "lucide-react";
import { OptionKey, QuestionSubmission, TrapLogEntry, VignetteSessionResult, VignetteSet } from "@/types/cfa";
import { CFA_VIGNETTES } from "@/data/vignettes";
import { CFA_CURRICULUM } from "@/data/curriculum";
import { useCFAStore } from "@/store/useCFAStore";
import { DiagnosticAutopsyView } from "@/components/diagnostic/DiagnosticAutopsyView";
import { FormattedMathText } from "@/components/common/KaTeXRenderer";
import { sound } from "@/components/common/SoundEffects";

export const VignetteEngine: React.FC = () => {
  const {
    activeVignetteId,
    closeVignetteDrill,
    recordVignetteSubmission,
    vignetteResults,
    setCalculatorOpen,
    setActiveBriefing,
    startVignetteDrill,
    selectTopic,
    customVignettes,
    soundEnabled,
  } = useCFAStore();

  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, OptionKey>>({});
  const [scratchpadText, setScratchpadText] = useState<string>("");
  const [isScratchpadOpen, setIsScratchpadOpen] = useState<boolean>(false);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  if (!activeVignetteId) return null;

  const allVignettes = [...CFA_VIGNETTES, ...customVignettes];
  const vignette = allVignettes.find((v) => v.id === activeVignetteId) || CFA_VIGNETTES[0];
  const existingResult = vignetteResults[vignette.id];

  const handleSelectOption = (questionId: number, option: OptionKey) => {
    if (hasSubmitted) return; // Locked once submitted
    if (soundEnabled) sound.playKeyClick();
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const isFormComplete = vignette.questions.every((q) => selectedAnswers[q.id]);

  const handleSubmitDiagnostic = () => {
    if (!isFormComplete) return;

    let score = 0;
    const submissions: QuestionSubmission[] = [];
    const trapsTriggered: string[] = [];
    const trapEntries: TrapLogEntry[] = [];

    vignette.questions.forEach((q) => {
      const chosen = selectedAnswers[q.id];
      const isCorrect = chosen === q.correctOption;
      if (isCorrect) {
        score += 1;
      } else {
        trapsTriggered.push(q.trapCategory);
        trapEntries.push({
          id: `trap-${Date.now()}-${q.id}`,
          topicId: vignette.topicId,
          topicName: vignette.topicName,
          subReading: vignette.subReading,
          trapName: q.trapCategory,
          questionStem: q.stem,
          selectedOption: chosen,
          correctOption: q.correctOption,
          autopsyExplanation: q.distractorAutopsy[chosen],
          timestamp: new Date().toISOString(),
        });
      }

      submissions.push({
        questionId: q.id,
        selectedOption: chosen,
        isCorrect,
        trapTriggered: isCorrect ? undefined : q.trapCategory,
      });
    });

    const result: VignetteSessionResult = {
      vignetteId: vignette.id,
      topicId: vignette.topicId,
      submittedAt: new Date().toISOString(),
      score,
      total: 2,
      userAnswers: selectedAnswers,
      submissions,
      trapsTriggered,
    };

    recordVignetteSubmission(result, trapEntries);
    setHasSubmitted(true);
  };

  const handleDrillAnother = () => {
    // Look for another vignette in same topic or reset
    setSelectedAnswers({});
    setHasSubmitted(false);
    setScratchpadText("");
  };

  const handleReviewFormulas = () => {
    setActiveBriefing(vignette.topicId);
  };

  const handleReturnDashboard = () => {
    closeVignetteDrill();
  };

  const handleNextTrack = () => {
    const nextTopicId = (parseInt(vignette.topicId, 10) + 1).toString().padStart(2, "0");
    const nextVignette = allVignettes.find((v) => v.topicId === nextTopicId);
    if (nextVignette) {
      setSelectedAnswers({});
      setHasSubmitted(false);
      setScratchpadText("");
      selectTopic(nextTopicId);
      startVignetteDrill(nextVignette.id);
    } else {
      closeVignetteDrill();
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6 font-sans">
      
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-[#1F1F23]">
        <button
          onClick={() => {
            if (soundEnabled) sound.playKeyClick();
            closeVignetteDrill();
          }}
          className="flex items-center gap-2 font-mono text-xs text-editorial-muted hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>RETURN TO CURRICULUM INDEX</span>
        </button>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => {
              if (soundEnabled) sound.playKeyClick();
              setIsScratchpadOpen(!isScratchpadOpen);
            }}
            className={`px-3 py-1.5 rounded border transition-all flex items-center gap-1.5 ${
              isScratchpadOpen
                ? "bg-brand-lime text-black font-bold border-brand-lime"
                : "bg-[#121215] text-editorial-steely border-[#27272A] hover:text-white"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>SCRATCHPAD</span>
          </button>

          <button
            onClick={() => {
              if (soundEnabled) sound.playKeyClick();
              setCalculatorOpen(true);
            }}
            className="px-3 py-1.5 rounded bg-[#18181B] text-white border border-[#3F3F46] hover:border-brand-lime/50 flex items-center gap-1.5 transition-all"
          >
            <Calculator className="w-3.5 h-3.5 text-brand-lime" />
            <span>TI BA II+</span>
          </button>
        </div>
      </div>

      {/* Candidate Scratchpad Drawer */}
      {isScratchpadOpen && (
        <div className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] space-y-2 animate-in fade-in duration-150">
          <div className="flex items-center justify-between font-mono text-xs text-editorial-dim">
            <span className="flex items-center gap-1.5 text-brand-lime font-bold">
              <Edit3 className="w-3.5 h-3.5" />
              <span>CANDIDATE SCRATCHPAD & CALCULATIONS</span>
            </span>
            <span className="text-[10px]">Private notes (not submitted)</span>
          </div>
          <textarea
            value={scratchpadText}
            onChange={(e) => setScratchpadText(e.target.value)}
            placeholder="Type your notes, intermediate register values (PV, PMT, FV), or step-by-step logic here..."
            className="w-full h-24 bg-[#121215] border border-[#1F1F23] rounded-lg p-3 text-xs font-mono text-white placeholder:text-editorial-dim focus:outline-none focus:border-brand-lime/40"
          />
        </div>
      )}

      {/* Vignette Context Header */}
      <div className="p-6 rounded-xl bg-[#0B0B0E] border border-[#1F1F23] space-y-4">
        
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#18181B] font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-brand-lime text-black font-bold text-[10px]">
              TRACK {vignette.topicId}
            </span>
            <span className="text-white font-semibold">{vignette.topicName}</span>
          </div>
          <span className="text-editorial-muted text-[11px] truncate">
            {vignette.subReading}
          </span>
        </div>

        {/* Realistic Institutional Scenario Stem */}
        <div>
          <div className="font-mono text-[11px] text-editorial-dim tracking-wider uppercase mb-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-lime" />
            <span>INSTITUTIONAL CASE SCENARIO:</span>
          </div>
          <div className="text-sm sm:text-base text-editorial-white leading-relaxed font-sans bg-[#0E0E12] p-4 rounded-lg border border-[#1F1F23]">
            <FormattedMathText text={vignette.vignetteStem} />
          </div>
        </div>

      </div>

      {/* If already submitted, render the Distractor Autopsy Diagnostic */}
      {hasSubmitted ? (
        <DiagnosticAutopsyView
          vignette={vignette}
          result={{
            vignetteId: vignette.id,
            topicId: vignette.topicId,
            submittedAt: new Date().toISOString(),
            score: vignette.questions.filter((q) => selectedAnswers[q.id] === q.correctOption).length,
            total: 2,
            userAnswers: selectedAnswers,
            submissions: vignette.questions.map((q) => ({
              questionId: q.id,
              selectedOption: selectedAnswers[q.id],
              isCorrect: selectedAnswers[q.id] === q.correctOption,
              trapTriggered: selectedAnswers[q.id] === q.correctOption ? undefined : q.trapCategory,
            })),
            trapsTriggered: vignette.questions
              .filter((q) => selectedAnswers[q.id] !== q.correctOption)
              .map((q) => q.trapCategory),
          }}
          onDrillAnother={handleDrillAnother}
          onReviewFormulas={handleReviewFormulas}
          onReturnDashboard={handleReturnDashboard}
          onNextTrack={handleNextTrack}
        />
      ) : (
        /* Unsubmitted Question Pair with Strict Submission Barrier */
        <div className="space-y-6">
          
          {vignette.questions.map((q) => {
            const currentSelected = selectedAnswers[q.id];

            return (
              <div
                key={q.id}
                className="p-6 rounded-xl bg-[#0B0B0E] border border-[#1F1F23] space-y-5"
              >
                {/* Question Stem */}
                <div>
                  <span className="font-mono text-xs font-bold text-brand-lime block mb-1">
                    QUESTION 0{q.id} OF 02
                  </span>
                  <h3 className="text-sm sm:text-base font-semibold text-white leading-snug">
                    <FormattedMathText text={q.stem} />
                  </h3>
                </div>

                {/* 3 Options: A, B, C */}
                <div className="space-y-2.5">
                  {(["A", "B", "C"] as OptionKey[]).map((optKey) => {
                    const isSelected = currentSelected === optKey;

                    return (
                      <button
                        key={optKey}
                        type="button"
                        onClick={() => handleSelectOption(q.id, optKey)}
                        className={`w-full text-left p-4 rounded-lg border transition-all duration-150 flex items-start gap-3.5 group ${
                          isSelected
                            ? "bg-[#18181D] border-brand-lime/60 shadow-[0_0_15px_rgba(216,255,62,0.12)]"
                            : "bg-[#0E0E12] border-[#1F1F23] hover:border-[#27272A] hover:bg-[#121216]"
                        }`}
                      >
                        {/* Option Radio / Badge */}
                        <div
                          className={`w-6 h-6 rounded-full font-mono text-xs font-bold flex items-center justify-center shrink-0 border transition-all ${
                            isSelected
                              ? "bg-brand-lime text-black border-brand-lime shadow-lime-sm"
                              : "bg-[#141418] text-editorial-muted border-[#27272A] group-hover:border-editorial-muted"
                          }`}
                        >
                          {optKey}
                        </div>

                        {/* Option Text */}
                        <span
                          className={`text-xs sm:text-sm leading-relaxed ${
                            isSelected ? "text-white font-medium" : "text-editorial-steely group-hover:text-white"
                          }`}
                        >
                          <FormattedMathText text={q.options[optKey]} />
                        </span>
                      </button>
                    );
                  })}
                </div>

              </div>
            );
          })}

          {/* Submission Barrier Bar */}
          <div className="p-5 rounded-xl bg-[#0E0E12] border border-[#1F1F23] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-editorial-dim" />
              <p className="text-xs text-editorial-muted font-mono">
                Full algebraic solutions, calculator workflows, and Distractor Autopsies stay concealed until evaluation.
              </p>
            </div>

            <button
              onClick={handleSubmitDiagnostic}
              disabled={!isFormComplete}
              className={`w-full sm:w-auto px-6 py-3 rounded-lg font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
                isFormComplete
                  ? "bg-brand-lime text-black hover:bg-brand-neon shadow-lime-glow"
                  : "bg-[#18181B] text-editorial-dim border border-[#27272A] cursor-not-allowed"
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>SUBMIT & RUN DIAGNOSTIC</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};

"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  Send,
  Calculator,
  Grid,
  X,
  AlertCircle,
  CheckCircle2,
  Bookmark,
  Sparkles,
} from "lucide-react";
import { MockExamSession, MockExamType } from "@/types/mockExam";
import { generateMockExamSession, gradeMockExam } from "@/data/mockExamGenerator";
import { MockScorecardView } from "./MockScorecardView";
import { FormattedMathText } from "@/components/common/KaTeXRenderer";
import { useCFAStore } from "@/store/useCFAStore";
import { OptionKey } from "@/types/cfa";
import { sound } from "@/components/common/SoundEffects";

interface MockExamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MockExamModal: React.FC<MockExamModalProps> = ({ isOpen, onClose }) => {
  const {
    soundEnabled,
    customVignettes,
    recordVignetteSubmission,
    setCalculatorOpen,
    calculatorMode,
    setCalculatorMode,
  } = useCFAStore();

  const [selectedExamType, setSelectedExamType] = useState<MockExamType>("quick_diagnostic_45");
  const [session, setSession] = useState<MockExamSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isNavigatorOpen, setIsNavigatorOpen] = useState<boolean>(false);
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState<boolean>(false);
  const [isGraded, setIsGraded] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize or start new mock exam
  const handleStartExam = useCallback(
    (type: MockExamType) => {
      if (soundEnabled) sound.playNodeSwitch();
      const newSession = generateMockExamSession(type, customVignettes);
      setSession(newSession);
      setCurrentIndex(0);
      setIsGraded(false);
      setIsSubmitConfirmOpen(false);
    },
    [customVignettes, soundEnabled]
  );

  // Countdown timer effect
  useEffect(() => {
    if (!isOpen || !session || isGraded) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setSession((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          timeSpentSeconds: prev.timeSpentSeconds + 1,
        };
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, session, isGraded]);

  // Answer selection handler
  const handleSelectAnswer = useCallback(
    (questionId: number, option: OptionKey) => {
      if (!session || isGraded) return;
      if (soundEnabled) sound.playKeyClick();
      setSession((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          userAnswers: {
            ...prev.userAnswers,
            [questionId]: option,
          },
        };
      });
    },
    [isGraded, session, soundEnabled]
  );

  // Flag toggle handler
  const handleToggleFlag = useCallback(
    (questionId: number) => {
      if (!session || isGraded) return;
      if (soundEnabled) sound.playKeyClick();
      setSession((prev) => {
        if (!prev) return prev;
        const exists = prev.flaggedQuestionIds.includes(questionId);
        const updated = exists
          ? prev.flaggedQuestionIds.filter((id) => id !== questionId)
          : [...prev.flaggedQuestionIds, questionId];
        return {
          ...prev,
          flaggedQuestionIds: updated,
        };
      });
    },
    [isGraded, session, soundEnabled]
  );

  // Submission handler
  const handleFinalSubmit = useCallback(() => {
    if (!session) return;
    if (soundEnabled) sound.playSuccessChime();

    const { gradedSession, generatedTraps } = gradeMockExam(session);
    setSession(gradedSession);
    setIsGraded(true);
    setIsSubmitConfirmOpen(false);

    // Feed session and traps into store for spaced repetition
    recordVignetteSubmission(
      {
        vignetteId: gradedSession.id,
        topicId: "MOCK",
        submittedAt: gradedSession.submittedAt || new Date().toISOString(),
        score: gradedSession.score,
        total: gradedSession.totalQuestions,
        userAnswers: gradedSession.userAnswers,
        submissions: gradedSession.questions.map((q) => ({
          questionId: q.id,
          selectedOption: gradedSession.userAnswers[q.id] || "A",
          isCorrect: gradedSession.userAnswers[q.id] === q.correctOption,
          trapTriggered: q.trapCategory,
          timeSpentSeconds: Math.round(gradedSession.timeSpentSeconds / gradedSession.totalQuestions),
        })),
        trapsTriggered: generatedTraps.map((t) => t.trapName),
        totalTimeSeconds: gradedSession.timeSpentSeconds,
        timerModeUsed: "timed_90s",
      },
      generatedTraps
    );
  }, [recordVignetteSubmission, session, soundEnabled]);

  // Keyboard navigation within active mock exam
  useEffect(() => {
    if (!isOpen || !session || isGraded) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const currentQ = session.questions[currentIndex];
      if (!currentQ) return;

      if (e.key === "1" || e.key === "a" || e.key === "A") {
        handleSelectAnswer(currentQ.id, "A");
      } else if (e.key === "2" || e.key === "b" || e.key === "B") {
        handleSelectAnswer(currentQ.id, "B");
      } else if (e.key === "3" || e.key === "c" || e.key === "C") {
        handleSelectAnswer(currentQ.id, "C");
      } else if (e.key === "f" || e.key === "F") {
        handleToggleFlag(currentQ.id);
      } else if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => Math.min(session.questions.length - 1, prev + 1));
      } else if (e.key === "k" || e.key === "K") {
        setCalculatorMode(calculatorMode === "docked" ? "closed" : "docked");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [calculatorMode, currentIndex, handleSelectAnswer, handleToggleFlag, isGraded, isOpen, session, setCalculatorMode]);

  if (!isOpen) return null;

  // Render Setup Screen if no session active
  if (!session) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-[#0D0D11] border border-[#27272A] rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-[0_25px_60px_rgba(0,0,0,0.9)] animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-4 border-b border-[#1F1F23]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-lime/20 border border-brand-lime/40 flex items-center justify-center text-brand-lime font-bold font-mono">
                CFA
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-wide font-sans">
                  Official CFA® Level 1 Mock Exam Engine
                </h2>
                <p className="text-xs text-zinc-400 font-mono">
                  Standardized Timing • 10-Topic Weighting • MPS Benchmark Simulation
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#1A1A20]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider block">
              Select Mock Simulation Tier:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  id: "quick_diagnostic_45",
                  title: "Quick Diagnostic Mock",
                  badge: "RECOMMENDED (45Q)",
                  time: "68 Minutes",
                  desc: "Balanced 10-topic diagnostic with full distractor autopsies & speed scoring.",
                },
                {
                  id: "half_session_1",
                  title: "Session 1 Half-Mock",
                  badge: "SESSION 1 (90Q)",
                  time: "135 Minutes (2h 15m)",
                  desc: "Ethical Standards, Quantitative Methods, Economics, and FSA.",
                },
                {
                  id: "half_session_2",
                  title: "Session 2 Half-Mock",
                  badge: "SESSION 2 (90Q)",
                  time: "135 Minutes (2h 15m)",
                  desc: "Corporate Issuers, Equity, Fixed Income, Derivatives, Alternatives, Portfolio.",
                },
                {
                  id: "full_180",
                  title: "Full 180Q Simulation",
                  badge: "EXAM DAY (180Q)",
                  time: "270 Minutes (4.5 hrs)",
                  desc: "Full two-session stamina simulation mirroring the complete test day.",
                },
              ].map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => setSelectedExamType(tier.id as MockExamType)}
                  className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between gap-3 ${
                    selectedExamType === tier.id
                      ? "bg-brand-lime/10 border-brand-lime text-white shadow-[0_0_15px_rgba(216,255,62,0.12)]"
                      : "bg-[#121216] border-[#222228] text-zinc-300 hover:border-[#3F3F46]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs font-mono font-bold text-brand-lime">
                        {tier.badge}
                      </span>
                      <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-zinc-400" />
                        {tier.time}
                      </span>
                    </div>
                    <div className="font-bold text-sm text-white font-sans">{tier.title}</div>
                    <p className="text-xs text-zinc-400 font-sans mt-1 leading-relaxed">
                      {tier.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[#1F1F23] flex items-center justify-between gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-mono text-zinc-400 hover:text-white"
            >
              CANCEL
            </button>
            <button
              onClick={() => handleStartExam(selectedExamType)}
              className="px-6 py-3 rounded-xl bg-brand-lime hover:bg-brand-neon text-black font-mono text-xs font-extrabold shadow-lime-glow transition-all active:scale-[0.99] flex items-center gap-2"
            >
              <span>COMMENCE EXAM SIMULATION</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render Post-Grading Scorecard if session submitted
  if (isGraded) {
    return (
      <div className="fixed inset-0 z-50 bg-[#09090B] overflow-y-auto">
        <div className="min-h-screen p-4 sm:p-6">
          <MockScorecardView
            session={session}
            onRetake={() => handleStartExam(session.examType)}
            onClose={() => {
              setSession(null);
              onClose();
            }}
          />
        </div>
      </div>
    );
  }

  // Render Active Exam Session
  const currentQuestion = session.questions[currentIndex];
  const totalSecondsAllocated = session.allocatedMinutes * 60;
  const remainingSeconds = Math.max(0, totalSecondsAllocated - session.timeSpentSeconds);
  const remainingHrs = Math.floor(remainingSeconds / 3600);
  const remainingMins = Math.floor((remainingSeconds % 3600) / 60);
  const remainingSecs = remainingSeconds % 60;
  const isTimeExpiring = remainingSeconds < 300; // < 5 mins

  const answeredCount = Object.keys(session.userAnswers).length;
  const isCurrentFlagged = session.flaggedQuestionIds.includes(currentQuestion.id);
  const currentChoice = session.userAnswers[currentQuestion.id];

  return (
    <div className="fixed inset-0 z-50 bg-[#09090B] text-white flex flex-col font-sans overflow-hidden">
      
      {/* Top Standardized Exam Navbar */}
      <header className="h-14 px-4 sm:px-6 bg-[#0E0E12] border-b border-[#1F1F23] flex items-center justify-between select-none shrink-0">
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 rounded bg-brand-lime text-black font-mono text-xs font-extrabold uppercase">
            CFA LEVEL 1 MOCK
          </span>
          <span className="hidden md:inline text-xs font-mono text-zinc-300 font-semibold truncate max-w-xs">
            {session.title}
          </span>
        </div>

        {/* Center Countdown Clock */}
        <div
          className={`flex items-center gap-2 px-3.5 py-1 rounded-lg border font-mono text-xs sm:text-sm font-bold ${
            isTimeExpiring
              ? "bg-red-500/20 text-red-400 border-red-500/50 animate-pulse"
              : "bg-[#141418] text-brand-lime border-[#27272A]"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>
            {remainingHrs > 0 ? `${remainingHrs}h ` : ""}
            {remainingMins.toString().padStart(2, "0")}:{remainingSecs.toString().padStart(2, "0")} REMAINING
          </span>
        </div>

        {/* Right Tools: Calculator, Navigator, Finish */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCalculatorMode(calculatorMode === "docked" ? "closed" : "docked")}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#141418] hover:bg-[#1A1A20] text-amber-300 border border-[#27272A] text-xs font-mono font-bold"
            title="Toggle Texas Instruments BA II Plus [Hotkey: K]"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">BA II+ [K]</span>
          </button>

          <button
            onClick={() => setIsNavigatorOpen(!isNavigatorOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all ${
              isNavigatorOpen
                ? "bg-brand-lime text-black border-brand-lime"
                : "bg-[#141418] text-zinc-300 border-[#27272A] hover:text-white"
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>
              {answeredCount}/{session.totalQuestions}
            </span>
          </button>

          <button
            onClick={() => setIsSubmitConfirmOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-brand-lime/15 hover:bg-brand-lime text-brand-lime hover:text-black border border-brand-lime/40 text-xs font-mono font-bold transition-all"
          >
            SUBMIT
          </button>
        </div>
      </header>

      {/* Main Question Viewport */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left / Center: Question Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col justify-between">
          <div className="max-w-3xl mx-auto w-full space-y-6">
            
            {/* Question Info Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#1F1F23] font-mono text-xs">
              <div className="flex items-center gap-2">
                <span className="text-brand-lime font-bold text-sm">
                  QUESTION {currentQuestion.globalIndex} OF {session.totalQuestions}
                </span>
                <span className="px-2 py-0.5 rounded bg-[#18181D] text-zinc-300 border border-[#27272A]">
                  TOPIC {currentQuestion.topicId} // {currentQuestion.topicName}
                </span>
                {currentQuestion.losCode && (
                  <span className="text-editorial-dim text-[11px]">
                    {currentQuestion.losCode}
                  </span>
                )}
              </div>

              {/* Flag Button */}
              <button
                onClick={() => handleToggleFlag(currentQuestion.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all text-xs font-mono ${
                  isCurrentFlagged
                    ? "bg-amber-400/20 text-amber-300 border-amber-400/50"
                    : "bg-[#121216] text-zinc-400 border-[#27272A] hover:text-white"
                }`}
                title="Flag for later review [Hotkey: F]"
              >
                <Flag className={`w-3.5 h-3.5 ${isCurrentFlagged ? "fill-amber-300" : ""}`} />
                <span>{isCurrentFlagged ? "FLAGGED" : "FLAG [F]"}</span>
              </button>
            </div>

            {/* Question Stem */}
            <div className="p-6 bg-[#0E0E12] border border-[#1F1F23] rounded-2xl text-sm sm:text-base text-zinc-100 font-sans leading-relaxed shadow-md">
              <FormattedMathText text={currentQuestion.stem} />
            </div>

            {/* Answer Options */}
            <div className="space-y-3 font-mono">
              {(["A", "B", "C"] as OptionKey[]).map((opt) => {
                const isSelected = currentChoice === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => handleSelectAnswer(currentQuestion.id, opt)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 select-none ${
                      isSelected
                        ? "bg-brand-lime/10 border-brand-lime text-white shadow-[0_0_15px_rgba(216,255,62,0.15)]"
                        : "bg-[#121215] border-[#222226] text-zinc-300 hover:border-[#3F3F46] hover:bg-[#16161A]"
                    }`}
                  >
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-lg font-bold text-xs shrink-0 ${
                        isSelected
                          ? "bg-brand-lime text-black"
                          : "bg-[#1C1C22] text-editorial-dim border border-[#27272A]"
                      }`}
                    >
                      {opt}
                    </span>
                    <div className="text-xs sm:text-sm leading-relaxed flex-1 font-sans">
                      <FormattedMathText text={currentQuestion.options[opt]} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Step Navigation Bar */}
          <div className="max-w-3xl mx-auto w-full pt-6 border-t border-[#1F1F23] flex items-center justify-between gap-4 font-mono text-xs">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#141418] hover:bg-[#1C1C22] text-zinc-300 disabled:opacity-30 border border-[#27272A] transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>PREVIOUS</span>
            </button>

            <span className="text-zinc-500 hidden sm:inline text-[11px]">
              KEYS: [1/2/3] SELECT &bull; [F] FLAG &bull; [←/→] NAVIGATE
            </span>

            <button
              onClick={() => setCurrentIndex((prev) => Math.min(session.questions.length - 1, prev + 1))}
              disabled={currentIndex === session.questions.length - 1}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-lime hover:bg-brand-neon text-black font-bold disabled:opacity-30 transition-all shadow-lime-sm"
            >
              <span>NEXT</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </main>

        {/* Right Sidebar: Question Navigator Matrix (Collapsible) */}
        {isNavigatorOpen && (
          <aside className="w-80 bg-[#0A0A0D] border-l border-[#1F1F23] p-4 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right-4 duration-150 select-none">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1F1F23]">
                <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                  Question Navigator
                </span>
                <button
                  onClick={() => setIsNavigatorOpen(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Status Legend */}
              <div className="flex items-center gap-3 font-mono text-[10px] text-zinc-400">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded bg-brand-lime" /> Answered
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded bg-amber-400" /> Flagged
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded bg-[#27272A]" /> Unanswered
                </span>
              </div>

              {/* Grid of question tiles */}
              <div className="grid grid-cols-5 gap-1.5 font-mono text-xs max-h-[60vh] overflow-y-auto pr-1">
                {session.questions.map((q, idx) => {
                  const isAnswered = !!session.userAnswers[q.id];
                  const isFlagged = session.flaggedQuestionIds.includes(q.id);
                  const isCurrent = currentIndex === idx;

                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        setCurrentIndex(idx);
                        if (soundEnabled) sound.playKeyClick();
                      }}
                      className={`h-9 rounded-lg border font-bold flex items-center justify-center relative transition-all ${
                        isCurrent
                          ? "ring-2 ring-brand-lime text-white bg-[#1A1A20] border-brand-lime"
                          : isFlagged
                          ? "bg-amber-500/20 text-amber-300 border-amber-400/50"
                          : isAnswered
                          ? "bg-brand-lime/20 text-brand-lime border-brand-lime/40"
                          : "bg-[#121215] text-zinc-400 border-[#222226] hover:bg-[#18181D]"
                      }`}
                    >
                      {idx + 1}
                      {isFlagged && (
                        <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-amber-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => setIsSubmitConfirmOpen(true)}
              className="w-full py-3 rounded-xl bg-brand-lime text-black font-mono text-xs font-extrabold uppercase shadow-lime-sm mt-4"
            >
              FINALIZE & SUBMIT EXAM
            </button>
          </aside>
        )}
      </div>

      {/* Confirmation Modal before Submit */}
      {isSubmitConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0E0E12] border border-[#27272A] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl font-mono text-xs">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertCircle className="w-5 h-5" />
              <span className="font-bold text-sm text-white">Confirm Exam Submission</span>
            </div>

            <div className="bg-[#121216] p-4 rounded-xl space-y-2 border border-[#222226]">
              <div className="flex justify-between text-zinc-300">
                <span>Total Questions:</span>
                <span className="font-bold text-white">{session.totalQuestions}</span>
              </div>
              <div className="flex justify-between text-brand-lime">
                <span>Answered:</span>
                <span className="font-bold">{answeredCount}</span>
              </div>
              <div className="flex justify-between text-red-400">
                <span>Unanswered:</span>
                <span className="font-bold">{session.totalQuestions - answeredCount}</span>
              </div>
              <div className="flex justify-between text-amber-300">
                <span>Flagged for Review:</span>
                <span className="font-bold">{session.flaggedQuestionIds.length}</span>
              </div>
            </div>

            <p className="text-zinc-400 font-sans leading-relaxed">
              Once submitted, your session will be locked, graded against the CFA Institute 70% MPS benchmark, and all missed items will be logged for autopsy.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsSubmitConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#18181D] text-zinc-300 hover:text-white border border-[#27272A]"
              >
                RETURN TO EXAM
              </button>
              <button
                onClick={handleFinalSubmit}
                className="flex-1 py-2.5 rounded-xl bg-brand-lime text-black font-extrabold hover:bg-brand-neon shadow-lime-sm"
              >
                EXECUTE GRADING
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

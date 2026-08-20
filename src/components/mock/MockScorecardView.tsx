"use client";

import React, { useState } from "react";
import {
  Award,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Cpu,
  Clock,
  Sparkles,
} from "lucide-react";
import { MockExamSession } from "@/types/mockExam";
import { FormattedMathText } from "@/components/common/KaTeXRenderer";
import { KeystrokeSequence } from "@/components/calculator/KeystrokeBadge";
import { useCFAStore } from "@/store/useCFAStore";
import { sound } from "@/components/common/SoundEffects";

interface MockScorecardViewProps {
  session: MockExamSession;
  onRetake: () => void;
  onClose: () => void;
}

export const MockScorecardView: React.FC<MockScorecardViewProps> = ({
  session,
  onRetake,
  onClose,
}) => {
  const { soundEnabled, setCalculatorOpen } = useCFAStore();
  const [filterMode, setFilterMode] = useState<"ALL" | "INCORRECT" | "FLAGGED">("ALL");
  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(null);

  const isPassed = session.isPassedMps;
  const totalMinutes = Math.floor(session.timeSpentSeconds / 60);
  const totalSeconds = session.timeSpentSeconds % 60;
  const avgSecondsPerQ =
    session.totalQuestions > 0 ? Math.round(session.timeSpentSeconds / session.totalQuestions) : 0;

  const filteredQuestions = session.questions.filter((q) => {
    const isCorrect = session.userAnswers[q.id] === q.correctOption;
    const isFlagged = session.flaggedQuestionIds.includes(q.id);

    if (filterMode === "INCORRECT") return !isCorrect;
    if (filterMode === "FLAGGED") return isFlagged;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 font-sans space-y-8 animate-in fade-in duration-200">
      
      {/* Top Banner: Score & MPS Benchmark */}
      <div
        className={`p-6 sm:p-8 rounded-2xl border relative overflow-hidden ${
          isPassed
            ? "bg-gradient-to-br from-[#0D180D] via-[#0E150E] to-[#0A0A0D] border-brand-lime/50 shadow-[0_0_40px_rgba(216,255,62,0.15)]"
            : "bg-gradient-to-br from-[#1A0F0F] via-[#150D0D] to-[#0A0A0D] border-red-500/40 shadow-[0_0_40px_rgba(239,68,68,0.15)]"
        }`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase tracking-wider ${
                  isPassed
                    ? "bg-brand-lime/20 text-brand-lime border border-brand-lime/40"
                    : "bg-red-500/20 text-red-400 border border-red-500/40"
                }`}
              >
                {isPassed ? "MPS PASS HEURISTIC EXCEEDED" : "BELOW MINIMUM PASSING SCORE"}
              </span>
              <span className="text-xs font-mono text-zinc-400">
                {session.title}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {isPassed ? "Institutional Pass Level Achieved" : "Rigorous Remediation Recommended"}
            </h1>

            <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
              {isPassed
                ? `You scored ${session.score} out of ${session.totalQuestions} (${session.accuracy}%), clearing the estimated 70% CFA Institute Minimum Passing Score (MPS) threshold.`
                : `You scored ${session.score} out of ${session.totalQuestions} (${session.accuracy}%). Review distractor autopsies below to resolve trapped error modes before actual exam day.`}
            </p>
          </div>

          {/* Big Score Gauge */}
          <div className="flex items-baseline gap-2 bg-[#09090C] border border-[#27272A] px-6 py-4 rounded-xl shrink-0">
            <div className="text-center font-mono">
              <div
                className={`text-4xl sm:text-5xl font-black ${
                  isPassed ? "text-brand-lime" : "text-red-400"
                }`}
              >
                {session.accuracy}%
              </div>
              <div className="text-[11px] text-zinc-400 uppercase font-semibold mt-1">
                {session.score} / {session.totalQuestions} CORRECT
              </div>
            </div>
          </div>
        </div>

        {/* Telemetry Strip: Time, Speed, Traps */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10 font-mono text-xs">
          <div className="bg-[#121216]/80 p-3 rounded-lg border border-[#27272A]">
            <span className="text-zinc-400 text-[11px] block">TOTAL DURATION</span>
            <span className="text-white font-bold text-sm">
              {totalMinutes}m {totalSeconds}s
            </span>
          </div>
          <div className="bg-[#121216]/80 p-3 rounded-lg border border-[#27272A]">
            <span className="text-zinc-400 text-[11px] block">AVG SPEED / QUESTION</span>
            <span
              className={`font-bold text-sm ${
                avgSecondsPerQ <= 90 ? "text-brand-lime" : "text-amber-400"
              }`}
            >
              {avgSecondsPerQ}s <span className="text-[10px] font-normal">(Target: 90s)</span>
            </span>
          </div>
          <div className="bg-[#121216]/80 p-3 rounded-lg border border-[#27272A]">
            <span className="text-zinc-400 text-[11px] block">FLAGGED QUESTIONS</span>
            <span className="text-amber-300 font-bold text-sm">
              {session.flaggedQuestionIds.length} flagged
            </span>
          </div>
          <div className="bg-[#121216]/80 p-3 rounded-lg border border-[#27272A]">
            <span className="text-zinc-400 text-[11px] block">TRAPS LOGGED</span>
            <span className="text-red-400 font-bold text-sm">
              {session.totalQuestions - session.score} errors recorded
            </span>
          </div>
        </div>
      </div>

      {/* Topic-by-Topic Mastery Matrix */}
      <div className="bg-[#0B0B0E] border border-[#1F1F23] rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Award className="w-4 h-4 text-brand-lime" />
          <span>Curriculum Topic Breakdown & Official Weights</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-[#27272A] text-zinc-400">
                <th className="py-2.5 px-3">CFA TOPIC</th>
                <th className="py-2.5 px-3">EXAM WEIGHT</th>
                <th className="py-2.5 px-3">ACCURACY</th>
                <th className="py-2.5 px-3">SCORE</th>
                <th className="py-2.5 px-3 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A20]">
              {session.topicBreakdowns.map((t) => (
                <tr key={t.topicId} className="hover:bg-[#121216] transition-colors">
                  <td className="py-3 px-3 font-medium text-white">
                    <span className="text-brand-lime mr-2">[{t.topicId}]</span>
                    {t.topicName}
                  </td>
                  <td className="py-3 px-3 text-zinc-400">{t.weight}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-[#18181D] h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            t.accuracy >= 70
                              ? "bg-brand-lime"
                              : t.accuracy >= 55
                              ? "bg-amber-400"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${t.accuracy}%` }}
                        />
                      </div>
                      <span className="font-bold text-zinc-200">{t.accuracy}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-zinc-300">
                    {t.correct} / {t.total}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.status === "MASTERED"
                          ? "bg-brand-lime/10 text-brand-lime border border-brand-lime/30"
                          : t.status === "COMPETENT"
                          ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                          : t.status === "NEEDS_WORK"
                          ? "bg-amber-500/10 text-amber-300 border border-amber-500/30"
                          : "bg-red-500/10 text-red-400 border border-red-500/30"
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Forensic Distractor Autopsy Review Section */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-brand-lime" />
              <span>Diagnostic Question Autopsies ({filteredQuestions.length})</span>
            </h2>
            <p className="text-xs text-zinc-400 font-sans mt-0.5">
              Click any question to view canonical proofs, calculator keystrokes, and distractor traps.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 font-mono text-xs bg-[#121215] p-1 rounded-lg border border-[#27272A]">
            <button
              onClick={() => setFilterMode("ALL")}
              className={`px-2.5 py-1 rounded transition-all ${
                filterMode === "ALL"
                  ? "bg-brand-lime text-black font-bold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              ALL ({session.questions.length})
            </button>
            <button
              onClick={() => setFilterMode("INCORRECT")}
              className={`px-2.5 py-1 rounded transition-all ${
                filterMode === "INCORRECT"
                  ? "bg-red-500 text-white font-bold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              MISSED ({session.totalQuestions - session.score})
            </button>
            <button
              onClick={() => setFilterMode("FLAGGED")}
              className={`px-2.5 py-1 rounded transition-all ${
                filterMode === "FLAGGED"
                  ? "bg-amber-400 text-black font-bold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              FLAGGED ({session.flaggedQuestionIds.length})
            </button>
          </div>
        </div>

        {/* Question Cards List */}
        <div className="space-y-3">
          {filteredQuestions.map((q) => {
            const userPick = session.userAnswers[q.id];
            const isCorrect = userPick === q.correctOption;
            const isExpanded = expandedQuestionId === q.id;

            return (
              <div
                key={q.id}
                className={`rounded-xl border transition-all ${
                  isCorrect
                    ? "bg-[#0A0D0A] border-[#1D2A1D]"
                    : "bg-[#0E0A0A] border-[#2A1D1D]"
                }`}
              >
                {/* Header Row (Clickable) */}
                <button
                  onClick={() => {
                    if (soundEnabled) sound.playKeyClick();
                    setExpandedQuestionId(isExpanded ? null : q.id);
                  }}
                  className="w-full text-left p-4 flex items-center justify-between gap-4 select-none hover:bg-white/[0.02]"
                >
                  <div className="flex items-center gap-3">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-brand-lime shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                    )}
                    <div>
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="text-white font-bold">Q{q.globalIndex}</span>
                        <span className="text-zinc-400">[{q.topicName}]</span>
                        {q.losCode && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#18181D] text-zinc-300 border border-[#27272A]">
                            {q.losCode}
                          </span>
                        )}
                        {session.flaggedQuestionIds.includes(q.id) && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40">
                            FLAGGED
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-300 font-sans line-clamp-1 mt-0.5">
                        {q.stem}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-xs shrink-0">
                    <span
                      className={`font-bold ${
                        isCorrect ? "text-brand-lime" : "text-red-400"
                      }`}
                    >
                      {isCorrect ? "CORRECT" : `PICKED ${userPick || "NONE"}`}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-zinc-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Autopsy Details */}
                {isExpanded && (
                  <div className="p-4 pt-0 border-t border-white/5 space-y-4 animate-in fade-in duration-150">
                    {/* Full Question Stem */}
                    <div className="p-3 bg-[#121216] rounded-lg text-xs sm:text-sm text-zinc-100 font-sans leading-relaxed">
                      <FormattedMathText text={q.stem} />
                    </div>

                    {/* Options Breakdown */}
                    <div className="grid grid-cols-1 gap-2 font-mono text-xs">
                      {(["A", "B", "C"] as const).map((opt) => {
                        const isThisCorrect = q.correctOption === opt;
                        const isThisChosen = userPick === opt;

                        return (
                          <div
                            key={opt}
                            className={`p-3 rounded-lg border text-xs flex flex-col gap-1.5 ${
                              isThisCorrect
                                ? "bg-brand-lime/10 border-brand-lime/50 text-white"
                                : isThisChosen
                                ? "bg-red-500/10 border-red-500/40 text-red-200"
                                : "bg-[#101014] border-[#1F1F24] text-zinc-400"
                            }`}
                          >
                            <div className="flex items-center justify-between font-bold">
                              <span>
                                OPTION {opt}: {q.options[opt]}
                              </span>
                              <span>
                                {isThisCorrect
                                  ? "✓ CANONICAL CORRECT"
                                  : isThisChosen
                                  ? "✗ YOUR SELECTION (DISTRACTOR TRAP)"
                                  : ""}
                              </span>
                            </div>
                            <div className="text-[11px] font-sans text-zinc-300 leading-relaxed pl-2 border-l border-white/10">
                              <FormattedMathText
                                text={q.distractorAutopsy[opt] || "Option analysis."}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Calculator Keystrokes & Solution */}
                    {q.calculatorKeystrokes && (
                      <div className="p-3 bg-[#121216] border border-amber-400/20 rounded-lg space-y-1.5 font-mono text-xs">
                        <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                          <Cpu className="w-3.5 h-3.5" />
                          <span>TI BA II PLUS CANONICAL WORKFLOW:</span>
                        </span>
                        <KeystrokeSequence sequence={q.calculatorKeystrokes} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-[#1F1F23]">
        <button
          onClick={onRetake}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#141418] hover:bg-[#1C1C22] text-zinc-200 border border-[#27272A] font-mono text-xs font-bold transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>RETAKE THIS MOCK EXAM</span>
        </button>

        <button
          onClick={onClose}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-lime hover:bg-brand-neon text-black font-mono text-xs font-extrabold shadow-lime-glow transition-all active:scale-[0.99]"
        >
          <span>RETURN TO STUDY COCKPIT</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

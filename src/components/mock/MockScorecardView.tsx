"use client";

import React, { useState } from "react";
import {
  Award,
  CheckCircle,
  XCircle,
  RotateCcw,
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Cpu } from "lucide-react";
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
  onClose }) => {
  const { soundEnabled } = useCFAStore();
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
      
      {/* Top Banner: Score and study target */}
      <div
        className={`p-6 sm:p-8 rounded-2xl border relative overflow-hidden ${
          isPassed
            ? "bg-gradient-to-br from-surface-interactive via-surface-interactive to-surface border-accent/50 shadow-[0_0_40px_rgba(216,255,62,0.15)]"
            : "bg-gradient-to-br from-surface-interactive via-surface-interactive to-surface border-danger/40 shadow-[0_0_40px_rgba(239,68,68,0.15)]"
        }`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded text-xs tabular-nums font-bold ${
                  isPassed
                    ? "bg-accent/20 text-accent border border-accent/40"
                    : "bg-danger/20 text-danger border border-danger/40"
                }`}
              >
                {isPassed ? "70% study target reached" : "Below the 70% study target"}
              </span>
              <span className="text-xs tabular-nums text-muted">
                {session.title}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
              {isPassed ? "Study target reached" : "More practice recommended"}
            </h1>

            <p className="text-xs sm:text-sm text-muted-strong max-w-2xl leading-relaxed">
              {isPassed
                ? `You scored ${session.score} out of ${session.totalQuestions} (${session.accuracy}%), clearing the recommended 70% study target.`
                : `You scored ${session.score} out of ${session.totalQuestions} (${session.accuracy}%). Review the explanations below and practise the topics that need more work.`}
            </p>
          </div>

          {/* Big Score Gauge */}
          <div className="flex items-baseline gap-2 bg-background border border-control px-6 py-4 rounded-xl shrink-0">
            <div className="text-center tabular-nums">
              <div
                className={`text-4xl sm:text-5xl font-black ${
                  isPassed ? "text-accent" : "text-danger"
                }`}
              >
                {session.accuracy}%
              </div>
              <div className="text-[11px] text-muted font-semibold mt-1">
                {session.score} of {session.totalQuestions} correct
              </div>
            </div>
          </div>
        </div>

        {/* Telemetry Strip: Time, Speed, Traps */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10 tabular-nums text-xs">
          <div className="bg-surface-interactive p-3 rounded-lg border border-control">
            <span className="text-muted text-[11px] block">Total time</span>
            <span className="text-white font-bold text-sm">
              {totalMinutes}m {totalSeconds}s
            </span>
          </div>
          <div className="bg-surface-interactive p-3 rounded-lg border border-control">
            <span className="text-muted text-[11px] block">Average per question</span>
            <span
              className={`font-bold text-sm ${
                avgSecondsPerQ <= 90 ? "text-accent" : "text-warning"
              }`}
            >
              {avgSecondsPerQ}s <span className="text-[10px] font-normal">(Target: 90s)</span>
            </span>
          </div>
          <div className="bg-surface-interactive p-3 rounded-lg border border-control">
            <span className="text-muted text-[11px] block">Flagged</span>
            <span className="text-warning font-bold text-sm">
              {session.flaggedQuestionIds.length} flagged
            </span>
          </div>
          <div className="bg-surface-interactive p-3 rounded-lg border border-control">
            <span className="text-muted text-[11px] block">Missed questions</span>
            <span className="text-danger font-bold text-sm">
              {session.totalQuestions - session.score} errors recorded
            </span>
          </div>
        </div>
      </div>

      {/* Topic-by-Topic Mastery Matrix */}
      <div className="bg-background-elevated border border-control rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Award className="w-4 h-4 text-accent" />
          <span>Results by topic</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left tabular-nums text-xs">
            <thead>
              <tr className="border-b border-control text-muted">
                <th className="py-2.5 px-3">Topic</th>
                <th className="py-2.5 px-3">Exam weight</th>
                <th className="py-2.5 px-3">Accuracy</th>
                <th className="py-2.5 px-3">Score</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider">
              {session.topicBreakdowns.map((t) => (
                <tr key={t.topicId} className="hover:bg-surface-interactive transition-colors">
                  <td className="py-3 px-3 font-medium text-white">
                    <span className="text-accent mr-2">[{t.topicId}]</span>
                    {t.topicName}
                  </td>
                  <td className="py-3 px-3 text-muted">{t.weight}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-surface-raised h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            t.accuracy >= 70
                              ? "bg-accent"
                              : t.accuracy >= 55
                              ? "bg-warning"
                              : "bg-danger"
                          }`}
                          style={{ width: `${t.accuracy}%` }}
                        />
                      </div>
                      <span className="font-bold text-foreground">{t.accuracy}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-muted-strong">
                    {t.correct} / {t.total}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.status === "MASTERED"
                          ? "bg-accent/10 text-accent border border-accent/30"
                          : t.status === "COMPETENT"
                          ? "bg-accent/10 text-accent border border-accent/30"
                          : t.status === "NEEDS_WORK"
                          ? "bg-warning/10 text-warning border border-warning/30"
                          : "bg-danger/10 text-danger border border-danger/30"
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
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-accent" />
              <span>Diagnostic Question Autopsies ({filteredQuestions.length})</span>
            </h2>
            <p className="text-xs text-muted font-sans mt-0.5">
              Click any question to view canonical proofs, calculator keystrokes, and distractor traps.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 tabular-nums text-xs bg-surface-interactive p-1 rounded-lg border border-control">
            <button
              onClick={() => setFilterMode("ALL")}
              className={`px-2.5 py-1 rounded transition-all ${
                filterMode === "ALL"
                  ? "bg-accent text-accent-ink font-bold"
                  : "text-muted hover:text-white"
              }`}
            >
              All ({session.questions.length})
            </button>
            <button
              onClick={() => setFilterMode("INCORRECT")}
              className={`px-2.5 py-1 rounded transition-all ${
                filterMode === "INCORRECT"
                  ? "bg-danger text-white font-bold"
                  : "text-muted hover:text-white"
              }`}
            >
              Missed ({session.totalQuestions - session.score})
            </button>
            <button
              onClick={() => setFilterMode("FLAGGED")}
              className={`px-2.5 py-1 rounded transition-all ${
                filterMode === "FLAGGED"
                  ? "bg-warning text-black font-bold"
                  : "text-muted hover:text-white"
              }`}
            >
              Flagged ({session.flaggedQuestionIds.length})
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
                    ? "bg-background-elevated border-control"
                    : "bg-background-elevated border-control"
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
                      <CheckCircle className="w-5 h-5 text-accent shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-danger shrink-0" />
                    )}
                    <div>
                      <div className="flex items-center gap-2 tabular-nums text-xs">
                        <span className="text-white font-bold">Q{q.globalIndex}</span>
                        <span className="text-muted">[{q.topicName}]</span>
                        {q.losCode && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-raised text-muted-strong border border-control">
                            {q.losCode}
                          </span>
                        )}
                        {session.flaggedQuestionIds.includes(q.id) && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-warning/20 text-warning border border-warning/40">
                            Flagged
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-strong font-sans line-clamp-1 mt-0.5">
                        {q.stem}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 tabular-nums text-xs shrink-0">
                    <span
                      className={`font-bold ${
                        isCorrect ? "text-accent" : "text-danger"
                      }`}
                    >
                      {isCorrect ? "Correct" : userPick ? `You chose ${userPick}` : "Not answered"}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-muted" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted" />
                    )}
                  </div>
                </button>

                {/* Expanded Autopsy Details */}
                {isExpanded && (
                  <div className="p-4 pt-0 border-t border-white/5 space-y-4 animate-in fade-in duration-150">
                    {/* Full Question Stem */}
                    <div className="p-3 bg-surface-interactive rounded-lg text-xs sm:text-sm text-foreground font-sans leading-relaxed">
                      <FormattedMathText text={q.stem} />
                    </div>

                    {/* Options Breakdown */}
                    <div className="grid grid-cols-1 gap-2 tabular-nums text-xs">
                      {(["A", "B", "C"] as const).map((opt) => {
                        const isThisCorrect = q.correctOption === opt;
                        const isThisChosen = userPick === opt;

                        return (
                          <div
                            key={opt}
                            className={`p-3 rounded-lg border text-xs flex flex-col gap-1.5 ${
                              isThisCorrect
                                ? "bg-accent/10 border-accent/50 text-white"
                                : isThisChosen
                                ? "bg-danger/10 border-danger/40 text-danger"
                                : "bg-surface-interactive border-control text-muted"
                            }`}
                          >
                            <div className="flex items-center justify-between font-bold">
                              <span>
                                OPTION {opt}: {q.options[opt]}
                              </span>
                              <span>
                                {isThisCorrect
                                  ? "✓ Correct answer"
                                  : isThisChosen
                                  ? "✗ Your answer"
                                  : ""}
                              </span>
                            </div>
                            <div className="text-[11px] font-sans text-muted-strong leading-relaxed pl-2 border-l border-white/10">
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
                      <div className="p-3 bg-surface-interactive border border-warning/20 rounded-lg space-y-1.5 tabular-nums text-xs">
                        <span className="text-[11px] font-bold text-warning flex items-center gap-1.5">
                          <Cpu className="w-3.5 h-3.5" />
                          <span>BA II Plus keystrokes:</span>
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
      <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-control">
        <button
          onClick={onRetake}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-surface-interactive hover:bg-surface-raised text-foreground border border-control tabular-nums text-xs font-bold transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Take another mock</span>
        </button>

        <button
          onClick={onClose}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent hover:bg-accent-strong text-accent-ink tabular-nums text-xs font-semibold transition-all active:scale-[0.99]"
        >
          <span>Back to dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

"use client";

import React, { useMemo } from "react";
import {
  Award,
  TrendingUp,
  Target,
  Shield,
  Zap,
  AlertTriangle,
  Flame,
  ArrowRight,
  Sparkles,
  BookOpen,
  BarChart2,
  PieChart,
  CheckCircle,
} from "lucide-react";
import { useCFAStore } from "@/store/useCFAStore";
import { CFA_CURRICULUM } from "@/data/curriculum";
import { ERROR_MODE_LABELS } from "@/data/trapTaxonomy";
import { sound } from "@/components/common/SoundEffects";

interface AnalyticsDashboardViewProps {
  onOpenScenarioSimulator: (topicId: string) => void;
  onOpenLearnHub: (topicId: string) => void;
}

export const AnalyticsDashboardView: React.FC<AnalyticsDashboardViewProps> = ({
  onOpenScenarioSimulator,
  onOpenLearnHub,
}) => {
  const {
    vignetteResults,
    trapLogs,
    leitnerCards,
    completedTopicIds,
    soundEnabled,
  } = useCFAStore();

  const resultsList = useMemo(() => Object.values(vignetteResults), [vignetteResults]);

  // Total telemetry
  const totalQuestionsSolved = useMemo(
    () => resultsList.reduce((acc, r) => acc + (r.total || 5), 0),
    [resultsList]
  );
  const totalCorrect = useMemo(
    () => resultsList.reduce((acc, r) => acc + r.score, 0),
    [resultsList]
  );
  const overallAccuracy =
    totalQuestionsSolved > 0 ? Math.round((totalCorrect / totalQuestionsSolved) * 100) : 0;

  const trapImmunityPct =
    totalQuestionsSolved > 0
      ? Math.max(0, 100 - Math.round((trapLogs.length / totalQuestionsSolved) * 100))
      : 100;

  // Due flashcards count
  const now = new Date();
  const dueFlashcardsCount = useMemo(
    () => leitnerCards.filter((c) => new Date(c.nextReviewAt) <= now).length,
    [leitnerCards, now]
  );

  // Topic-level stats
  const topicAnalytics = useMemo(() => {
    return CFA_CURRICULUM.map((topic) => {
      const topicSessions = resultsList.filter((r) => r.topicId === topic.id);
      const totalQ = topicSessions.reduce((acc, r) => acc + (r.total || 5), 0);
      const correctQ = topicSessions.reduce((acc, r) => acc + r.score, 0);
      const accuracy = totalQ > 0 ? Math.round((correctQ / totalQ) * 100) : 0;
      const topicTraps = trapLogs.filter((t) => t.topicId === topic.id).length;

      let masteryLevel: "MASTERED" | "COMPETENT" | "NEEDS_WORK" | "CRITICAL" | "UNTESTED" =
        "UNTESTED";
      if (totalQ > 0) {
        if (accuracy >= 80) masteryLevel = "MASTERED";
        else if (accuracy >= 70) masteryLevel = "COMPETENT";
        else if (accuracy >= 55) masteryLevel = "NEEDS_WORK";
        else masteryLevel = "CRITICAL";
      }

      // Weight multiplier for overall readiness (approx mid-weight)
      const weightParsed = parseFloat(topic.weight.replace(/[^0-9.]/g, "")) || 10;

      return {
        topic,
        totalQ,
        correctQ,
        accuracy,
        topicTraps,
        masteryLevel,
        weightNum: weightParsed,
      };
    });
  }, [resultsList, trapLogs]);

  // Overall Weighted CFA Readiness Score (0-100)
  const weightedReadinessScore = useMemo(() => {
    let totalWeightTested = 0;
    let weightedAccSum = 0;

    topicAnalytics.forEach((t) => {
      if (t.totalQ > 0) {
        totalWeightTested += t.weightNum;
        weightedAccSum += t.accuracy * t.weightNum;
      }
    });

    if (totalWeightTested === 0) return 0;
    const baseReadiness = Math.round(weightedAccSum / totalWeightTested);
    const coveragePenalty = Math.round((completedTopicIds.length / 10) * 100);
    return Math.round(baseReadiness * 0.7 + coveragePenalty * 0.3);
  }, [completedTopicIds.length, topicAnalytics]);

  // Detect top 3 weak areas
  const weakAreas = useMemo(() => {
    return topicAnalytics
      .filter((t) => t.totalQ > 0 && t.accuracy < 70)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 3);
  }, [topicAnalytics]);

  // Error Mode distribution
  const errorModeStats = useMemo(() => {
    const counts: Record<string, number> = {};
    trapLogs.forEach((t) => {
      const mode = t.errorMode || "UNSPECIFIED";
      counts[mode] = (counts[mode] || 0) + 1;
    });
    return counts;
  }, [trapLogs]);

  return (
    <div className="space-y-8 font-sans animate-in fade-in duration-200">
      
      {/* Top Telemetry Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Estimated CFA Readiness Score */}
        <div className="p-5 rounded-2xl bg-[#0E0E12] border border-[#1F1F23] relative overflow-hidden shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between font-mono text-xs text-zinc-400">
            <span className="font-bold uppercase tracking-wider">CFA® READINESS INDEX</span>
            <Target className="w-4 h-4 text-brand-lime" />
          </div>
          <div className="my-3 flex items-baseline gap-2">
            <span
              className={`text-3xl sm:text-4xl font-black font-mono ${
                weightedReadinessScore >= 70
                  ? "text-brand-lime"
                  : weightedReadinessScore >= 50
                  ? "text-amber-300"
                  : "text-zinc-400"
              }`}
            >
              {weightedReadinessScore}%
            </span>
            <span className="text-xs text-zinc-500 font-mono">
              (Benchmark: ≥70% MPS)
            </span>
          </div>
          <div className="w-full bg-[#18181D] h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                weightedReadinessScore >= 70 ? "bg-brand-lime" : "bg-amber-400"
              }`}
              style={{ width: `${weightedReadinessScore}%` }}
            />
          </div>
        </div>

        {/* Global Accuracy */}
        <div className="p-5 rounded-2xl bg-[#0E0E12] border border-[#1F1F23] shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between font-mono text-xs text-zinc-400">
            <span className="font-bold uppercase tracking-wider">GLOBAL ACCURACY</span>
            <TrendingUp className="w-4 h-4 text-cyan-300" />
          </div>
          <div className="my-3 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black font-mono text-white">
              {overallAccuracy}%
            </span>
            <span className="text-xs text-zinc-500 font-mono">
              {totalCorrect}/{totalQuestionsSolved} Qs
            </span>
          </div>
          <span className="text-[11px] font-mono text-zinc-400">
            Across {resultsList.length} completed diagnostic sessions
          </span>
        </div>

        {/* Candidate Trap Immunity */}
        <div className="p-5 rounded-2xl bg-[#0E0E12] border border-[#1F1F23] shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between font-mono text-xs text-zinc-400">
            <span className="font-bold uppercase tracking-wider">TRAP IMMUNITY RADAR</span>
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-3 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black font-mono text-brand-lime">
              {trapImmunityPct}%
            </span>
            <span className="text-xs text-zinc-500 font-mono">
              {trapLogs.length} logged traps
            </span>
          </div>
          <span className="text-[11px] font-mono text-zinc-400">
            Immunity against examiner distractor pitfalls
          </span>
        </div>

        {/* Spaced Repetition Due */}
        <div className="p-5 rounded-2xl bg-[#0E0E12] border border-[#1F1F23] shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between font-mono text-xs text-zinc-400">
            <span className="font-bold uppercase tracking-wider">RECALL VAULT QUEUE</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-3 flex items-baseline gap-2">
            <span
              className={`text-3xl sm:text-4xl font-black font-mono ${
                dueFlashcardsCount > 0 ? "text-amber-400" : "text-zinc-400"
              }`}
            >
              {dueFlashcardsCount}
            </span>
            <span className="text-xs text-zinc-500 font-mono">
              / {leitnerCards.length} cards due
            </span>
          </div>
          <span className="text-[11px] font-mono text-zinc-400">
            Active 3-Box Leitner spaced retention
          </span>
        </div>
      </div>

      {/* Weak Area Auto-Detection & Remediation Banner */}
      {weakAreas.length > 0 && (
        <div className="p-6 bg-gradient-to-r from-red-950/40 via-[#120E0E] to-[#0A0A0D] border border-red-500/40 rounded-2xl space-y-4 shadow-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="font-mono text-xs font-bold text-red-400 uppercase tracking-wider">
                  WEAK-AREA AUTO-DETECTION RADAR
                </span>
              </div>
              <h2 className="text-lg font-bold text-white">
                Targeted Remediation Recommended for {weakAreas.length} High-Yield Topic(s)
              </h2>
              <p className="text-xs text-zinc-300 font-sans leading-relaxed max-w-2xl">
                The diagnostic engine detected scores below 70% in these tracks. Initiate a targeted AI remediation session to resolve trapped error modes.
              </p>
            </div>

            <button
              onClick={() => onOpenScenarioSimulator(weakAreas[0].topic.id)}
              className="px-5 py-3 rounded-xl bg-red-500 hover:bg-red-400 text-white font-mono text-xs font-extrabold flex items-center gap-2 shrink-0 transition-all shadow-md active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>REMEDIATE [{weakAreas[0].topic.name}] WITH AI</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {weakAreas.map((w) => (
              <div
                key={w.topic.id}
                className="p-3 bg-[#181111] border border-red-500/30 rounded-xl font-mono text-xs flex items-center justify-between"
              >
                <div>
                  <span className="text-white font-bold block">{w.topic.name}</span>
                  <span className="text-zinc-400 text-[11px]">Weight: {w.topic.weight}</span>
                </div>
                <span className="text-red-400 font-bold text-sm">{w.accuracy}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 10-Topic Mastery Matrix Heatmap */}
      <div className="bg-[#0B0B0E] border border-[#1F1F23] rounded-2xl p-6 space-y-4 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-brand-lime" />
              <span>Curriculum Mastery Matrix & Topic Heatmap</span>
            </h2>
            <p className="text-xs text-zinc-400 font-sans mt-0.5">
              Live tracking across all 10 CFA Level 1 tracks relative to official exam weights.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-[10px]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-brand-lime" /> Mastered (≥80%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-emerald-400" /> Competent (70-79%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-amber-400" /> Needs Work (55-69%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-red-500" /> Critical (&lt;55%)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          {topicAnalytics.map((t) => {
            const isMastered = t.masteryLevel === "MASTERED";
            const isCompetent = t.masteryLevel === "COMPETENT";
            const isNeedsWork = t.masteryLevel === "NEEDS_WORK";
            const isCritical = t.masteryLevel === "CRITICAL";

            return (
              <div
                key={t.topic.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                  isMastered
                    ? "bg-[#0D180D] border-brand-lime/50 shadow-[0_0_12px_rgba(216,255,62,0.1)]"
                    : isCompetent
                    ? "bg-[#0B150F] border-emerald-500/40"
                    : isNeedsWork
                    ? "bg-[#18140B] border-amber-500/40"
                    : isCritical
                    ? "bg-[#180E0E] border-red-500/40"
                    : "bg-[#101014] border-[#1F1F24]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between font-mono text-xs mb-1">
                    <span className="text-brand-lime font-bold">[{t.topic.id}]</span>
                    <span className="text-zinc-400 text-[11px]">{t.topic.weight}</span>
                  </div>
                  <h3 className="font-bold text-sm text-white font-sans truncate" title={t.topic.name}>
                    {t.topic.name}
                  </h3>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/5 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 text-[11px]">Accuracy:</span>
                    <span
                      className={`font-bold ${
                        isMastered
                          ? "text-brand-lime"
                          : isCompetent
                          ? "text-emerald-400"
                          : isNeedsWork
                          ? "text-amber-400"
                          : isCritical
                          ? "text-red-400"
                          : "text-zinc-500"
                      }`}
                    >
                      {t.totalQ > 0 ? `${t.accuracy}%` : "Untested"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span>Solved: {t.totalQ} Qs</span>
                    <span>Traps: {t.topicTraps}</span>
                  </div>

                  <button
                    onClick={() => onOpenLearnHub(t.topic.id)}
                    className="w-full mt-2 py-1.5 rounded-lg bg-[#14141A] hover:bg-[#1C1C24] text-brand-lime border border-brand-lime/30 text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
                  >
                    <BookOpen className="w-3 h-3" />
                    <span>LEARN GUIDE</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error Taxonomy Breakdown */}
      {trapLogs.length > 0 && (
        <div className="bg-[#0B0B0E] border border-[#1F1F23] rounded-2xl p-6 space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <PieChart className="w-4 h-4 text-cyan-400" />
              <span>Candidate Error Taxonomy Breakdown</span>
            </h2>
            <span className="font-mono text-xs text-zinc-400">
              {trapLogs.length} Total Errors Cataloged
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            {Object.entries(errorModeStats).map(([mode, count]) => {
              const meta = ERROR_MODE_LABELS[mode as keyof typeof ERROR_MODE_LABELS] || {
                label: mode,
                description: "Standard question distractor trap.",
                badgeColor: "bg-zinc-800 text-zinc-300 border-zinc-700",
              };

              return (
                <div
                  key={mode}
                  className="p-4 bg-[#101014] border border-[#1F1F24] rounded-xl font-mono text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{meta.label}</span>
                    <span className="px-2 py-0.5 rounded bg-brand-lime/20 text-brand-lime font-bold">
                      {count}x
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                    {meta.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

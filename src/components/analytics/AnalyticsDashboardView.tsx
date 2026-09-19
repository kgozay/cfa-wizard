"use client";

import React, { useMemo } from "react";
import {
  TrendingUp,
  Target,
  Shield,
  AlertTriangle,
  Flame,
  Sparkles,
  BookOpen,
  BarChart2,
  PieChart,
  Play,
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
    practiceAttempts,
    trapLogs,
    leitnerCards,
    soundEnabled,
  } = useCFAStore();

  const eligibleAttempts = useMemo(
    () => practiceAttempts.filter((attempt) => !attempt.containsDraftContent),
    [practiceAttempts]
  );
  const eligibleItemAttempts = useMemo(
    () => eligibleAttempts.flatMap((attempt) => attempt.itemAttempts),
    [eligibleAttempts]
  );
  const eligibleAttemptIds = useMemo(
    () => new Set(eligibleAttempts.map((attempt) => attempt.id)),
    [eligibleAttempts]
  );
  const eligibleTrapLogs = useMemo(
    () => trapLogs.filter((trap) => !trap.attemptId || eligibleAttemptIds.has(trap.attemptId)),
    [eligibleAttemptIds, trapLogs]
  );

  // Total telemetry
  const totalQuestionsSolved = useMemo(
    () => eligibleItemAttempts.length,
    [eligibleItemAttempts]
  );
  const totalCorrect = useMemo(
    () => eligibleItemAttempts.filter((item) => item.isCorrect).length,
    [eligibleItemAttempts]
  );
  const overallAccuracy =
    totalQuestionsSolved > 0 ? Math.round((totalCorrect / totalQuestionsSolved) * 100) : 0;

  const avoidedMistakePct =
    totalQuestionsSolved > 0
      ? Math.max(0, 100 - Math.round((eligibleItemAttempts.filter((item) => !item.isCorrect).length / totalQuestionsSolved) * 100))
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
      const topicItems = eligibleItemAttempts.filter((item) => item.topicId === topic.id);
      const totalQ = topicItems.length;
      const correctQ = topicItems.filter((item) => item.isCorrect).length;
      const accuracy = totalQ > 0 ? Math.round((correctQ / totalQ) * 100) : 0;
      const topicTraps = eligibleTrapLogs.filter((t) => t.topicId === topic.id).length;

      let masteryLevel: "MASTERED" | "COMPETENT" | "NEEDS_WORK" | "CRITICAL" | "UNTESTED" =
        "UNTESTED";
      if (totalQ >= 5) {
        if (accuracy >= 80) masteryLevel = "MASTERED";
        else if (accuracy >= 70) masteryLevel = "COMPETENT";
        else if (accuracy >= 55) masteryLevel = "NEEDS_WORK";
        else masteryLevel = "CRITICAL";
      }

      const weightValues = topic.weight.match(/\d+(?:\.\d+)?/g)?.map(Number) || [10];
      const weightParsed = weightValues.reduce((sum, value) => sum + value, 0) / weightValues.length;

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
  }, [eligibleItemAttempts, eligibleTrapLogs]);

  const testedTopicCount = topicAnalytics.filter((topic) => topic.totalQ >= 5).length;
  const hasReadinessEvidence = totalQuestionsSolved >= 20 && testedTopicCount >= 3;

  // Overall Weighted CFA Readiness Score (0-100)
  const weightedReadinessScore = useMemo(() => {
    let totalWeightTested = 0;
    let weightedAccSum = 0;

    topicAnalytics.forEach((t) => {
      if (t.totalQ >= 5) {
        totalWeightTested += t.weightNum;
        weightedAccSum += t.accuracy * t.weightNum;
      }
    });

    if (totalWeightTested === 0) return 0;
    const baseReadiness = Math.round(weightedAccSum / totalWeightTested);
    const coverageScore = Math.round((testedTopicCount / 10) * 100);
    return Math.round(baseReadiness * 0.7 + coverageScore * 0.3);
  }, [testedTopicCount, topicAnalytics]);

  // Detect top 3 weak areas
  const weakAreas = useMemo(() => {
    return topicAnalytics
      .filter((t) => t.totalQ >= 5 && t.accuracy < 70)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 3);
  }, [topicAnalytics]);

  // Error Mode distribution
  const errorModeStats = useMemo(() => {
    const counts: Record<string, number> = {};
    eligibleTrapLogs.forEach((t) => {
      const mode = t.errorMode || "UNSPECIFIED";
      counts[mode] = (counts[mode] || 0) + 1;
    });
    return counts;
  }, [eligibleTrapLogs]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Onboarding State vs Telemetry Strip */}
      {!hasReadinessEvidence ? (
        <div className="surface-panel rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-accent" />
                <h3 className="text-lg font-bold text-foreground">
                  Exam readiness onboarding
                </h3>
              </div>
              <p className="text-sm text-muted-strong leading-relaxed">
                Complete 20 questions across at least 3 topics to calculate your readiness index.
              </p>
            </div>

            <button
              onClick={() => {
                if (soundEnabled) sound.playNodeSwitch();
                onOpenScenarioSimulator("01");
              }}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink hover:bg-accent-strong transition-all active:scale-[0.98] shrink-0"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>Start diagnostic practice</span>
            </button>
          </div>

          {/* Progress towards unlocking readiness */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="rounded-xl bg-surface-raised p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted">Questions completed</span>
                <span className="font-mono font-semibold text-foreground">
                  {Math.min(totalQuestionsSolved, 20)}/20
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-interactive">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-300"
                  style={{ width: `${Math.min((totalQuestionsSolved / 20) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="rounded-xl bg-surface-raised p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted">Topics tested (min 5 questions each)</span>
                <span className="font-mono font-semibold text-foreground">
                  {Math.min(testedTopicCount, 3)}/3
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-interactive">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-300"
                  style={{ width: `${Math.min((testedTopicCount / 3) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Unlocked Telemetry Strip */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Estimated CFA Readiness Score */}
          <div className="p-5 rounded-2xl surface-panel shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-muted">
              <span className="font-semibold uppercase tracking-wider">CFA readiness index</span>
              <Target className="w-4 h-4 text-accent" />
            </div>
            <div className="my-3 flex items-baseline gap-2">
              <span
                className={`text-3xl sm:text-4xl font-black font-mono ${
                  weightedReadinessScore >= 70
                    ? "text-accent"
                    : weightedReadinessScore >= 50
                    ? "text-warning"
                    : "text-muted"
                }`}
              >
                {weightedReadinessScore}%
              </span>
              <span className="text-xs text-muted font-mono">
                Target: ≥70%
              </span>
            </div>
            <div className="w-full bg-surface-interactive h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  weightedReadinessScore >= 70 ? "bg-accent" : "bg-warning"
                }`}
                style={{ width: `${weightedReadinessScore}%` }}
              />
            </div>
          </div>

          {/* Global Accuracy */}
          <div className="p-5 rounded-2xl surface-panel shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-muted">
              <span className="font-semibold uppercase tracking-wider">Overall accuracy</span>
              <TrendingUp className="w-4 h-4 text-info" />
            </div>
            <div className="my-3 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black font-mono text-foreground">
                {overallAccuracy}%
              </span>
              <span className="text-xs text-muted font-mono">
                {totalCorrect}/{totalQuestionsSolved} Qs
              </span>
            </div>
            <span className="text-xs text-muted">
              Across {eligibleAttempts.length} practice sessions
            </span>
          </div>

          {/* Candidate Trap Immunity */}
          <div className="p-5 rounded-2xl surface-panel shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-muted">
              <span className="font-semibold uppercase tracking-wider">Avoided-mistake rate</span>
              <Shield className="w-4 h-4 text-accent" />
            </div>
            <div className="my-3 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black font-mono text-accent">
                {avoidedMistakePct}%
              </span>
              <span className="text-xs text-muted font-mono">
                {eligibleTrapLogs.length} mistakes
              </span>
            </div>
            <span className="text-xs text-muted">
              Answers completed without a trap error
            </span>
          </div>

          {/* Spaced Repetition Due */}
          <div className="p-5 rounded-2xl surface-panel shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-muted">
              <span className="font-semibold uppercase tracking-wider">Review cards due</span>
              <Flame className="w-4 h-4 text-warning" />
            </div>
            <div className="my-3 flex items-baseline gap-2">
              <span
                className={`text-3xl sm:text-4xl font-black font-mono ${
                  dueFlashcardsCount > 0 ? "text-warning" : "text-muted"
                }`}
              >
                {dueFlashcardsCount}
              </span>
              <span className="text-xs text-muted font-mono">
                / {leitnerCards.length} cards
              </span>
            </div>
            <span className="text-xs text-muted">
              Active Leitner spaced review
            </span>
          </div>
        </div>
      )}

      {/* Weak Area Remediation Banner */}
      {weakAreas.length > 0 && (
        <div className="p-6 bg-surface-raised rounded-2xl space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-danger" />
                <span className="font-mono text-xs font-semibold text-danger uppercase tracking-wider">
                  Topics to review
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                Targeted practice recommended for {weakAreas.length} topic(s)
              </h2>
              <p className="text-xs sm:text-sm text-muted-strong leading-relaxed max-w-2xl">
                Your practice scores are currently below the 70% study target in these areas.
              </p>
            </div>

            <button
              onClick={() => onOpenScenarioSimulator(weakAreas[0].topic.id)}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-danger/15 hover:bg-danger/25 text-danger font-semibold text-xs sm:text-sm flex items-center gap-2 shrink-0 transition-all active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Practice [{weakAreas[0].topic.name}]</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {weakAreas.map((w) => (
              <div
                key={w.topic.id}
                className="p-3 bg-surface-interactive rounded-xl text-xs flex items-center justify-between"
              >
                <div>
                  <span className="text-foreground font-semibold block">{w.topic.name}</span>
                  <span className="text-muted font-mono text-[11px]">Weight: {w.topic.weight}</span>
                </div>
                <span className="text-danger font-mono font-bold text-sm">{w.accuracy}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 10-Topic Curriculum Mastery Matrix */}
      <div className="surface-panel rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-divider pb-4">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-accent" />
              <span>Curriculum mastery matrix</span>
            </h2>
            <p className="text-xs sm:text-sm text-muted mt-0.5">
              Performance tracking across all 10 CFA Level I topics relative to exam weights.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-accent" /> Mastered (≥80%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-info" /> Competent (70-79%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-warning" /> Needs work (55-69%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-danger" /> Critical (&lt;55%)
            </span>
          </div>
        </div>

        {totalQuestionsSolved === 0 ? (
          /* Zero-state compact table */
          <div className="overflow-hidden rounded-xl bg-surface-raised/40 divide-y divide-divider text-xs">
            <div className="grid grid-cols-12 px-4 py-2.5 bg-surface-raised/60 font-semibold text-muted uppercase tracking-wider">
              <span className="col-span-2">Topic</span>
              <span className="col-span-6">Curriculum area</span>
              <span className="col-span-2 text-right">Exam weight</span>
              <span className="col-span-2 text-right">Status</span>
            </div>
            {topicAnalytics.map((t) => (
              <div key={t.topic.id} className="grid grid-cols-12 items-center px-4 py-2.5 text-xs hover:bg-surface-interactive/40 transition-colors">
                <span className="col-span-2 font-mono font-semibold text-muted">Topic {t.topic.id}</span>
                <span className="col-span-6 font-medium text-foreground">{t.topic.name}</span>
                <span className="col-span-2 text-right font-mono text-muted">{t.topic.weight}</span>
                <span className="col-span-2 text-right text-muted/60">Untested</span>
              </div>
            ))}
          </div>
        ) : (
          /* Populated cards grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
            {topicAnalytics.map((t) => {
              const isMastered = t.masteryLevel === "MASTERED";
              const isCompetent = t.masteryLevel === "COMPETENT";
              const isNeedsWork = t.masteryLevel === "NEEDS_WORK";
              const isCritical = t.masteryLevel === "CRITICAL";

              return (
                <div
                  key={t.topic.id}
                  className={`p-4 rounded-xl transition-all flex flex-col justify-between gap-3 ${
                    isMastered
                      ? "bg-accent/[0.08]"
                      : isCompetent
                      ? "bg-info/[0.08]"
                      : isNeedsWork
                      ? "bg-warning/[0.08]"
                      : isCritical
                      ? "bg-danger/[0.08]"
                      : "bg-surface-raised"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-accent font-mono font-semibold">[{t.topic.id}]</span>
                      <span className="text-muted font-mono text-[11px]">{t.topic.weight}</span>
                    </div>
                    <h3 className="font-semibold text-sm text-foreground truncate" title={t.topic.name}>
                      {t.topic.name}
                    </h3>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-divider text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted text-[11px]">Accuracy:</span>
                      <span
                        className={`font-mono font-bold ${
                          isMastered
                            ? "text-accent"
                            : isCompetent
                            ? "text-info"
                            : isNeedsWork
                            ? "text-warning"
                            : isCritical
                            ? "text-danger"
                            : "text-muted/60"
                        }`}
                      >
                        {t.totalQ > 0 ? (
                          <span>
                            {t.accuracy}%
                            {t.totalQ < 5 && (
                              <span className="text-[10px] font-normal text-muted ml-1">
                                (n={t.totalQ})
                              </span>
                            )}
                          </span>
                        ) : (
                          "Untested"
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted">
                      <span>Solved: {t.totalQ} Qs</span>
                      <span>Traps: {t.topicTraps}</span>
                    </div>

                    <button
                      onClick={() => onOpenLearnHub(t.topic.id)}
                      className="w-full min-h-[32px] mt-1 py-1 px-2 rounded-lg bg-surface-interactive hover:bg-surface-raised text-muted-strong hover:text-foreground text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>Learn guide</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Error Taxonomy Breakdown */}
      {eligibleTrapLogs.length > 0 && (
        <div className="surface-panel rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-divider pb-3">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <PieChart className="w-4 h-4 text-info" />
              <span>Common mistake categories</span>
            </h2>
            <span className="font-mono text-xs text-muted">
              {eligibleTrapLogs.length} total errors cataloged
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            {Object.entries(errorModeStats).map(([mode, count]) => {
              const meta = ERROR_MODE_LABELS[mode as keyof typeof ERROR_MODE_LABELS] || {
                label: mode,
                description: "Standard question distractor trap.",
                badgeColor: "bg-surface-interactive text-muted",
              };

              return (
                <div
                  key={mode}
                  className="p-4 bg-surface-raised rounded-xl text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">{meta.label}</span>
                    <span className="px-2 py-0.5 rounded-md bg-accent/15 text-accent font-mono font-semibold">
                      {count}x
                    </span>
                  </div>
                  <p className="text-muted text-xs leading-relaxed">
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

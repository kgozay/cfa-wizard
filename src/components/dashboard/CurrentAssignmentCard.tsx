"use client";

import React from "react";
import { Play, BookOpen, Wand2, CheckCircle2 } from "lucide-react";
import { useCFAStore } from "@/store/useCFAStore";
import { CFA_CURRICULUM } from "@/data/curriculum";
import { CFA_VIGNETTES } from "@/data/vignettes";
import { sound } from "@/components/common/SoundEffects";

interface CurrentAssignmentCardProps {
  onOpenBriefing: (topicId: string) => void;
  onOpenScenarioSimulator: (topicId: string) => void;
}

export const CurrentAssignmentCard: React.FC<CurrentAssignmentCardProps> = ({
  onOpenBriefing,
  onOpenScenarioSimulator,
}) => {
  const {
    activeTopicId,
    inProgressTopicId,
    completedTopicIds,
    startVignetteDrill,
    drillQuestionCount,
    practiceAttempts,
    soundEnabled,
  } = useCFAStore();

  const currentTopicId = activeTopicId || inProgressTopicId || "01";
  const topic =
    CFA_CURRICULUM.find((t) => t.id === currentTopicId) || CFA_CURRICULUM[0];
  const isCompleted = completedTopicIds.includes(topic.id);
  const baseVignette = CFA_VIGNETTES.find((v) => v.topicId === topic.id);

  // Eligible attempts for this topic (filtering out unapproved/draft content)
  const eligibleAttempts = practiceAttempts.filter(
    (attempt) => !attempt.containsDraftContent
  );
  const latestAttempt = [...eligibleAttempts]
    .reverse()
    .find((attempt) =>
      attempt.itemAttempts.some((item) => item.topicId === topic.id)
    );

  const latestTopicItems =
    latestAttempt?.itemAttempts.filter((item) => item.topicId === topic.id) ||
    [];
  const latestTopicScore = latestTopicItems.filter((item) => item.isCorrect).length;
  const hasAttempt = latestTopicItems.length > 0;
  const latestAccuracy = hasAttempt
    ? Math.round((latestTopicScore / latestTopicItems.length) * 100)
    : undefined;

  const handleStartDrill = () => {
    if (soundEnabled) sound.playNodeSwitch();
    startVignetteDrill(baseVignette?.id || topic.id);
  };

  const completedCount = completedTopicIds.length;
  const syllabusPercentage = Math.round((completedCount / 10) * 100);

  return (
    <section className="relative w-full overflow-hidden rounded-2xl glass-panel p-5 sm:p-6 shadow-glass">
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
        {/* Left Column (approx 65%) */}
        <div className="flex flex-col space-y-4 lg:col-span-7">
          <div className="space-y-2.5">
            {/* Status badge & topic metadata */}
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs text-muted">
              <span className="inline-flex items-center rounded-md bg-accent/15 px-2.5 py-0.5 font-mono text-xs font-semibold text-accent">
                {hasAttempt ? "Continue studying" : "Recommended next"}
              </span>
              <span aria-hidden="true" className="text-muted/40">•</span>
              <span className="font-mono text-xs font-medium text-foreground">
                Topic {topic.id} of 10
              </span>
              <span aria-hidden="true" className="text-muted/40">•</span>
              <span className="font-mono text-xs">{topic.weight} weight</span>
              {isCompleted && (
                <span className="inline-flex items-center gap-1 rounded-md bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Completed
                </span>
              )}
            </div>

            {/* Topic Title & Concise Objective */}
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl leading-snug">
                {topic.name}
              </h1>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-strong">
                Build fluency across {topic.subReadings.length} learning modules with a focused practice set.
              </p>
            </div>
          </div>

          {/* Last Attempt Feedback */}
          {hasAttempt && latestAccuracy !== undefined && (
            <div className="rounded-xl bg-surface-solid/80 px-4 py-2.5 text-xs sm:text-sm text-muted-strong">
              <p className="leading-snug">
                {latestAccuracy === 100 ? (
                  <>
                    You scored <span className="font-semibold text-accent">100%</span> on your last practice set.
                  </>
                ) : (
                  <>
                    Last set score: <span className="font-semibold text-foreground font-mono">{latestAccuracy}%</span> ({latestTopicScore}/{latestTopicItems.length}). Review the rationale or practice again.
                  </>
                )}
              </p>
            </div>
          )}

          {/* High-yield Trap Area */}
          <div className="text-xs leading-relaxed text-muted">
            <span className="font-medium text-foreground">Common difficulty:</span>{" "}
            {topic.highYieldTrapArea}
          </div>
        </div>

        {/* Right Column (approx 35%) */}
        <div className="flex flex-col justify-between gap-4 rounded-xl bg-surface-solid/60 p-4 sm:p-5 lg:col-span-5">
          {/* Compact Linear Syllabus Progress */}
          <div className="space-y-2 pb-3 border-b border-divider">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-muted">Syllabus completion</span>
              <span className="font-mono font-semibold text-foreground">
                {completedCount}/10 ({syllabusPercentage}%)
              </span>
            </div>
            <div
              className="h-1.5 w-full overflow-hidden rounded-full bg-surface-interactive"
              role="progressbar"
              aria-valuenow={syllabusPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Syllabus progress"
            >
              <div
                className="h-full rounded-full bg-accent transition-all duration-300 ease-out"
                style={{ width: `${syllabusPercentage}%` }}
              />
            </div>
          </div>

          {/* Action Area */}
          <div className="space-y-2.5">
            <button
              onClick={handleStartDrill}
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink transition-all duration-150 hover:bg-accent-strong active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>
                {hasAttempt
                  ? `Continue ${drillQuestionCount}-question practice`
                  : `Start ${drillQuestionCount}-question practice`}
              </span>
            </button>

            <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2">
              <button
                onClick={() => onOpenBriefing(topic.id)}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-surface-interactive px-3 py-2 text-xs sm:text-sm font-medium text-muted-strong transition-all duration-150 hover:bg-surface-raised hover:text-foreground active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <BookOpen className="h-4 w-4 shrink-0 text-muted" />
                <span>Review topic</span>
              </button>

              <button
                onClick={() => onOpenScenarioSimulator(topic.id)}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-surface-interactive px-3 py-2 text-xs sm:text-sm font-medium text-muted-strong transition-all duration-150 hover:bg-surface-raised hover:text-foreground active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Wand2 className="h-4 w-4 shrink-0 text-muted" />
                <span>Custom practice</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

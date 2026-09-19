"use client";

import React from "react";
import { Play, BookOpen, Wand2, CheckCircle2 } from "lucide-react";
import { useCFAStore } from "@/store/useCFAStore";
import { CFA_CURRICULUM } from "@/data/curriculum";
import { CFA_VIGNETTES } from "@/data/vignettes";
import { sound } from "@/components/common/SoundEffects";
import { TopicProgressRing } from "./TopicProgressRing";

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

  return (
    <section className="relative w-full overflow-hidden rounded-2xl border border-border/80 bg-surface-raised p-5 shadow-lg shadow-black/25 sm:p-7">
      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12 lg:gap-8">
        {/* Left Column (approx 65%) */}
        <div className="flex flex-col justify-between space-y-4 lg:col-span-7">
          <div className="space-y-3">
            {/* Recommendation badge & topic metadata */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs sm:text-sm text-muted">
              <span className="inline-flex items-center rounded-md bg-accent/15 px-2.5 py-1 text-xs font-semibold text-accent">
                {hasAttempt ? "Continue studying" : "Start here"}
              </span>
              <span aria-hidden="true" className="text-border-strong">•</span>
              <span className="font-medium text-foreground">
                Topic {topic.id} of 10
              </span>
              <span aria-hidden="true" className="text-border-strong">•</span>
              <span>{topic.weight} exam weight</span>
              {isCompleted && (
                <span className="inline-flex items-center gap-1 rounded-md bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Completed
                </span>
              )}
            </div>

            {/* Topic Title & Concise Objective */}
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-[2rem] leading-tight">
                {topic.name}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-strong sm:text-base">
                Build fluency across {topic.subReadings.length} learning modules with a focused practice set.
              </p>
            </div>
          </div>

          {/* Last Attempt Feedback (learner-facing copy) */}
          {hasAttempt && latestAccuracy !== undefined && (
            <div className="rounded-xl border border-border/70 bg-surface/70 px-4 py-3 text-sm text-muted-strong">
              <p className="leading-snug">
                {latestAccuracy === 100 ? (
                  <>
                    You completed your last set with{" "}
                    <span className="font-semibold text-accent">100%</span>.
                  </>
                ) : (
                  <>
                    Your last set was{" "}
                    <span className="font-semibold text-foreground">
                      {latestAccuracy}%
                    </span>{" "}
                    ({latestTopicScore}/{latestTopicItems.length}). Review the explanation or continue practising.
                  </>
                )}
              </p>
            </div>
          )}

          {/* High-yield Trap Area / Common Difficulty */}
          <div className="pt-1 text-xs leading-relaxed text-muted sm:text-sm">
            <span className="font-medium text-foreground">Common difficulty:</span>{" "}
            {topic.highYieldTrapArea}
          </div>
        </div>

        {/* Right Column (approx 35%) */}
        <div className="flex flex-col justify-between gap-5 rounded-xl border border-border/60 bg-surface/50 p-4 sm:p-5 lg:col-span-5">
          {/* Syllabus Progress Ring */}
          <div className="border-b border-border/50 pb-4 sm:pb-5">
            <TopicProgressRing
              completedCount={completedTopicIds.length}
              totalCount={10}
            />
          </div>

          {/* Action Area */}
          <div className="space-y-3">
            <button
              onClick={handleStartDrill}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-ink transition-all duration-200 hover:bg-accent-strong active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:text-base"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>
                {hasAttempt
                  ? `Continue ${drillQuestionCount}-question practice`
                  : `Start ${drillQuestionCount}-question practice`}
              </span>
            </button>

            <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
              <button
                onClick={() => onOpenBriefing(topic.id)}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface-interactive/60 px-3 py-2 text-sm font-medium text-muted-strong transition-all duration-200 hover:bg-surface-interactive hover:text-foreground active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <BookOpen className="h-4 w-4 shrink-0 text-muted" />
                <span className="truncate">Review topic</span>
              </button>

              <button
                onClick={() => onOpenScenarioSimulator(topic.id)}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface-interactive/60 px-3 py-2 text-sm font-medium text-muted-strong transition-all duration-200 hover:bg-surface-interactive hover:text-foreground active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Wand2 className="h-4 w-4 shrink-0 text-muted" />
                <span className="truncate">Custom practice</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

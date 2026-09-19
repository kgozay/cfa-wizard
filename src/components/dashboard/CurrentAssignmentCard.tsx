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
    <section className="relative w-full overflow-hidden rounded-2xl liquid-glass-card p-6 sm:p-8">
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        {/* Left Column (approx 60%) */}
        <div className="flex flex-col space-y-4 lg:col-span-7">
          <div className="space-y-3">
            {/* Status badge & topic metadata */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs">
              <span className="px-2.5 py-0.5 rounded-full bg-accent/15 text-accent font-medium text-xs">
                {hasAttempt ? "Continue studying" : "Start here"}
              </span>
              <span aria-hidden="true" className="text-slate-600">•</span>
              <span className="font-mono text-xs text-slate-300">
                Topic {topic.id} of 10
              </span>
              <span aria-hidden="true" className="text-slate-600">•</span>
              <span className="font-mono text-xs text-slate-400">{topic.weight}</span>
              {isCompleted && (
                <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Completed
                </span>
              )}
            </div>

            {/* Topic Title & Concise Objective */}
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-snug">
                {topic.name}
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
                Build fluency across {topic.subReadings.length} learning modules.
              </p>
            </div>
          </div>

          {/* Last Attempt Feedback */}
          {hasAttempt && latestAccuracy !== undefined && (
            <div className="rounded-xl bg-white/[0.03] px-4 py-2 text-xs sm:text-sm text-slate-300">
              <p className="leading-snug">
                {latestAccuracy === 100 ? (
                  <>
                    You scored <span className="font-semibold text-accent">100%</span> on your last practice set.
                  </>
                ) : (
                  <>
                    Last set score: <span className="font-semibold text-white font-mono">{latestAccuracy}%</span> ({latestTopicScore}/{latestTopicItems.length}). Review the rationale or practice again.
                  </>
                )}
              </p>
            </div>
          )}

          {/* High-yield Trap Area */}
          <div className="pt-1 text-xs leading-relaxed text-slate-400">
            <span className="font-semibold text-slate-200">Common difficulty:</span>{" "}
            {topic.highYieldTrapArea}
          </div>
        </div>

        {/* Right Column (approx 40%) */}
        <div className="flex flex-col justify-between space-y-5 lg:col-span-5 lg:pl-6">
          {/* Compact Linear Syllabus Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold tracking-wider uppercase text-slate-400 text-[11px]">
                Syllabus Progress
              </span>
              <span className="font-mono font-medium text-slate-400">
                {syllabusPercentage}% complete
              </span>
            </div>
            <div
              className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800/60"
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
            <p className="text-xs text-slate-400">
              {completedCount} of 10 topics completed
            </p>
          </div>

          {/* Action Cluster */}
          <div className="space-y-2.5">
            <button
              onClick={handleStartDrill}
              className="lime-btn-primary w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>
                {hasAttempt
                  ? `Continue ${drillQuestionCount}-question practice`
                  : `Start ${drillQuestionCount}-question practice`}
              </span>
            </button>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => onOpenBriefing(topic.id)}
                className="glass-pill-btn py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
              >
                <BookOpen className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>Review</span>
              </button>

              <button
                onClick={() => onOpenScenarioSimulator(topic.id)}
                className="glass-pill-btn py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
              >
                <Wand2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>Practice setup</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

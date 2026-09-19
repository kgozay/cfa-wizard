"use client";

import React from "react";
import { Play, CheckCircle2 } from "lucide-react";
import { useCFAStore } from "@/store/useCFAStore";
import { CFA_CURRICULUM } from "@/data/curriculum";
import { CFA_VIGNETTES } from "@/data/vignettes";
import { sound } from "@/components/common/SoundEffects";

interface TopicContextBarProps {
  onStartPractice?: () => void;
}

/**
 * Compact 56-72px context bar that anchors the user's active topic
 * across Custom Practice, Review, and Progress tabs without pushing
 * view content below the fold.
 */
export const TopicContextBar: React.FC<TopicContextBarProps> = ({
  onStartPractice,
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
    if (onStartPractice) {
      onStartPractice();
    } else {
      startVignetteDrill(baseVignette?.id || topic.id);
    }
  };

  return (
    <div
      role="region"
      aria-label="Current topic context"
      className="liquid-glass-card rounded-2xl p-4 sm:px-6 sm:py-4 transition-all"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Topic Info */}
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] font-mono text-xs font-semibold text-accent">
            {topic.id}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="truncate text-sm font-semibold text-white sm:text-base">
                {topic.name}
              </span>
              <span className="hidden font-mono text-xs text-slate-400 sm:inline">
                {topic.weight}
              </span>
              {isCompleted ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                  <CheckCircle2 className="h-3 w-3" />
                  Done
                </span>
              ) : hasAttempt && latestAccuracy !== undefined ? (
                <span className="font-mono text-xs text-slate-400">
                  Last: {latestAccuracy}%
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Action Target */}
        <div className="flex shrink-0 items-center gap-3">
          <button
            onClick={handleStartDrill}
            className="lime-btn-primary inline-flex min-h-[40px] w-full sm:w-auto items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Practice ({drillQuestionCount}Q)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

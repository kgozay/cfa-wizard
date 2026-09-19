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
      className="glass-panel rounded-xl p-3 sm:px-5 sm:py-3.5 shadow-sm transition-all"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Topic Info */}
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-interactive font-mono text-xs font-semibold text-accent">
            {topic.id}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate text-sm font-semibold text-foreground sm:text-base">
                {topic.name}
              </span>
              <span className="hidden font-mono text-xs text-muted sm:inline">
                {topic.weight}
              </span>
              {isCompleted ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                  <CheckCircle2 className="h-3 w-3" />
                  Done
                </span>
              ) : hasAttempt && latestAccuracy !== undefined ? (
                <span className="font-mono text-xs text-muted">
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
            className="inline-flex min-h-[44px] w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2 text-xs sm:text-sm font-semibold text-accent-ink transition-all duration-150 hover:bg-accent-strong active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Practice ({drillQuestionCount}Q)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

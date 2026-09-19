import { PracticeAttempt } from "@/types/practice";

export type TopicDisplayState =
  | "current"
  | "needs-review"
  | "completed"
  | "started"
  | "not-started";

export interface TopicPresentation {
  state: TopicDisplayState;
  latestScore?: number;
  latestTotal?: number;
  latestAccuracy?: number;
  eligibleItemCount: number;
  cumulativeAccuracy?: number;
  isCompleted: boolean;
  isCurrent: boolean;
}

interface TopicPresentationOptions {
  topicId: string;
  activeTopicId: string | null;
  inProgressTopicId: string | null;
  completedTopicIds: string[];
  practiceAttempts: PracticeAttempt[];
}

/**
 * Pure helper function to derive presentation state for a curriculum topic.
 * Does not mutate any store data and strictly filters out draft/unapproved AI content.
 */
export function getTopicPresentation({
  topicId,
  activeTopicId,
  inProgressTopicId,
  completedTopicIds,
  practiceAttempts,
}: TopicPresentationOptions): TopicPresentation {
  const isCompleted = completedTopicIds.includes(topicId);
  const isCurrent = (activeTopicId || inProgressTopicId) === topicId;

  // Only consider attempts that do NOT contain draft content
  const eligibleAttempts = practiceAttempts.filter(
    (attempt) => !attempt.containsDraftContent
  );

  // All eligible items for this topic across attempts
  const topicItems = eligibleAttempts
    .flatMap((attempt) => attempt.itemAttempts)
    .filter((item) => item.topicId === topicId);

  const eligibleItemCount = topicItems.length;
  const correctItemCount = topicItems.filter((item) => item.isCorrect).length;
  const cumulativeAccuracy =
    eligibleItemCount > 0
      ? Math.round((correctItemCount / eligibleItemCount) * 100)
      : undefined;

  // Latest eligible attempt containing items for this topic
  const latestAttempt = [...eligibleAttempts]
    .reverse()
    .find((attempt) =>
      attempt.itemAttempts.some((item) => item.topicId === topicId)
    );

  let latestScore: number | undefined;
  let latestTotal: number | undefined;
  let latestAccuracy: number | undefined;

  if (latestAttempt) {
    const latestTopicItems = latestAttempt.itemAttempts.filter(
      (item) => item.topicId === topicId
    );
    latestTotal = latestTopicItems.length;
    latestScore = latestTopicItems.filter((item) => item.isCorrect).length;
    latestAccuracy =
      latestTotal > 0
        ? Math.round((latestScore / latestTotal) * 100)
        : undefined;
  }

  // Derive state according to strict priority:
  // 1. current: active or in-progress
  // 2. needs-review: at least 5 eligible items and cumulative accuracy < 70%
  // 3. completed: included in completedTopicIds
  // 4. started: has an eligible attempt
  // 5. not-started: no eligible attempts
  let state: TopicDisplayState = "not-started";

  if (isCurrent) {
    state = "current";
  } else if (
    eligibleItemCount >= 5 &&
    cumulativeAccuracy !== undefined &&
    cumulativeAccuracy < 70
  ) {
    state = "needs-review";
  } else if (isCompleted) {
    state = "completed";
  } else if (eligibleItemCount > 0) {
    state = "started";
  }

  return {
    state,
    latestScore,
    latestTotal,
    latestAccuracy,
    eligibleItemCount,
    cumulativeAccuracy,
    isCompleted,
    isCurrent,
  };
}

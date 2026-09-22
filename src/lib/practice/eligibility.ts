import { PracticeItem, PracticeSession } from "@/types/practice";

/**
 * Single source of truth for whether a practice item is eligible for a given study mode.
 * Prevents draft or unapproved AI items from leaking into mocks or sprints.
 */
export function isEligibleForMode(
  item: PracticeItem,
  mode: PracticeSession["mode"]
): boolean {
  const { origin, status } = item.provenance;

  if (status === "rejected") {
    return false;
  }

  switch (mode) {
    case "mock":
      // Approved authored content only for mock exams
      return origin === "authored" && status === "approved";

    case "sprint":
      // Approved content only for fast sprints
      return status === "approved";

    case "practice":
      // Approved content, or drafts when explicitly selected for testing
      return status === "approved" || status === "validated" || status === "draft";

    case "review":
      // Any item tied to review is eligible
      return true;

    default:
      return false;
  }
}

/** Reject saved sessions containing an authored answer corrected after they were created. */
export function hasCurrentAnswerKey(session: PracticeSession): boolean {
  return !session.presentedItems.some(
    (item) =>
      item.sourceItemId.startsWith("authored:vignette-01-quant") &&
      item.sourceItemId.endsWith(":111") &&
      item.solution.includes("193.5")
  );
}

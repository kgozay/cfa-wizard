import type { MockExamSession } from "@/types/mockExam";

export function getMockElapsedSeconds(
  session: Pick<MockExamSession, "startedAt" | "allocatedMinutes" | "timeSpentSeconds">,
  now: number = Date.now()
): number {
  const startedAt = Date.parse(session.startedAt);
  const wallSeconds = Number.isFinite(startedAt)
    ? Math.max(0, Math.floor((now - startedAt) / 1000))
    : 0;
  return Math.min(session.allocatedMinutes * 60, Math.max(session.timeSpentSeconds, wallSeconds));
}

export function getMockRemainingSeconds(
  session: Pick<MockExamSession, "startedAt" | "allocatedMinutes" | "timeSpentSeconds">,
  now: number = Date.now()
): number {
  return Math.max(0, session.allocatedMinutes * 60 - getMockElapsedSeconds(session, now));
}

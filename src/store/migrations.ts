import { PracticeAttempt, PracticeSession } from "@/types/practice";
import { legacyResultToPracticeAttempt, LegacySessionResultInput } from "@/lib/practice/adapters";
import { CFA_CURRICULUM } from "@/data/curriculum";
import { TrapLogEntry, VignetteSet, LeitnerCard, VignetteSessionResult } from "@/types/cfa";

export interface MigratedStoreState {
  completedTopicIds: string[];
  inProgressTopicId: string;
  activeTopicId: string | null;
  activeVignetteId: string | null;
  drillQuestionCount: 2 | 5 | 10 | 15;
  isPacingTimerEnabled: boolean;
  soundEnabled: boolean;
  // Legacy map retained for backward compatibility
  vignetteResults: Record<string, VignetteSessionResult>;
  // Canonical append-only attempts
  practiceAttempts: PracticeAttempt[];
  practiceSessions: Record<string, PracticeSession>;
  activePracticeSessionId: string | null;
  trapLogs: TrapLogEntry[];
  customVignettes: VignetteSet[];
  leitnerCards: LeitnerCard[];
  [key: string]: unknown;
}

interface RawStoreInput {
  completedTopicIds?: unknown[];
  inProgressTopicId?: string;
  activeTopicId?: string | null;
  activeVignetteId?: string | null;
  drillQuestionCount?: 2 | 5 | 10 | 15;
  isPacingTimerEnabled?: boolean;
  soundEnabled?: boolean;
  vignetteResults?: Record<string, LegacySessionResultInput>;
  practiceAttempts?: PracticeAttempt[];
  practiceSessions?: Record<string, PracticeSession>;
  activePracticeSessionId?: string | null;
  trapLogs?: TrapLogEntry[];
  customVignettes?: VignetteSet[];
  leitnerCards?: LeitnerCard[];
  [key: string]: unknown;
}

/**
 * Migrates persisted state from v3 (unversioned/v0) to v4 (append-only attempts).
 * Idempotent: running multiple times does not duplicate attempts.
 */
export function migrateV3ToV4(persistedState: unknown, version: number): MigratedStoreState {
  const state = (persistedState && typeof persistedState === "object" ? persistedState : {}) as RawStoreInput;

  // If already at version 4 or higher and has practiceAttempts, ensure schema integrity and return
  if (version >= 4 && Array.isArray(state.practiceAttempts)) {
    return state as MigratedStoreState;
  }

  const existingAttempts: PracticeAttempt[] = Array.isArray(state.practiceAttempts)
    ? [...state.practiceAttempts]
    : [];

  const legacyResults = state.vignetteResults || {};

  // Convert each legacy result into a canonical PracticeAttempt if not already converted
  Object.values(legacyResults).forEach((result) => {
    if (!result || typeof result !== "object" || !result.vignetteId) return;

    // Check if this result was already migrated
    const alreadyMigrated = existingAttempts.some(
      (a) => a.sessionId.includes(result.vignetteId) || (a.topicIds.includes(result.topicId) && a.submittedAt === result.submittedAt)
    );

    if (!alreadyMigrated) {
      const topicName = CFA_CURRICULUM.find((t) => t.id === result.topicId)?.name || "Unknown Topic";
      const attempt = legacyResultToPracticeAttempt(result, topicName);
      existingAttempts.push(attempt);
    }
  });

  return {
    ...state,
    completedTopicIds: Array.isArray(state.completedTopicIds) ? (state.completedTopicIds as string[]) : [],
    inProgressTopicId: typeof state.inProgressTopicId === "string" ? state.inProgressTopicId : "01",
    activeTopicId: typeof state.activeTopicId === "string" ? state.activeTopicId : "01",
    activeVignetteId: typeof state.activeVignetteId === "string" ? state.activeVignetteId : null,
    drillQuestionCount: state.drillQuestionCount || 5,
    isPacingTimerEnabled: state.isPacingTimerEnabled ?? true,
    soundEnabled: state.soundEnabled ?? true,
    vignetteResults: legacyResults as Record<string, VignetteSessionResult>,
    practiceAttempts: existingAttempts,
    practiceSessions: state.practiceSessions || {},
    activePracticeSessionId: state.activePracticeSessionId || null,
    trapLogs: Array.isArray(state.trapLogs) ? state.trapLogs : [],
    customVignettes: Array.isArray(state.customVignettes) ? state.customVignettes : [],
    leitnerCards: Array.isArray(state.leitnerCards) ? state.leitnerCards : [],
  };
}

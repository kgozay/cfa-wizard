import { z } from "zod";
import { PracticeAttemptSchema, PracticeSessionSchema } from "@/lib/practice/schema";

/**
 * Backup Envelope Schema
 * Supports both modern v4.0 backups and legacy v3.0 backups.
 */
export const BackupPayloadSchema = z.object({
  exportVersion: z.string(),
  exportedAt: z.string(),
  completedTopicIds: z.array(z.string()).default([]),
  inProgressTopicId: z.string().optional().default("01"),
  vignetteResults: z.record(z.string(), z.any()).default({}),
  practiceAttempts: z.array(PracticeAttemptSchema).optional().default([]),
  practiceSessions: z.record(z.string(), PracticeSessionSchema).optional().default({}),
  activePracticeSessionId: z.string().nullable().optional().default(null),
  trapLogs: z.array(z.any()).optional().default([]),
  customVignettes: z.array(z.any()).optional().default([]),
  leitnerCards: z.array(z.any()).optional().default([]),
});

export type BackupPayload = z.infer<typeof BackupPayloadSchema>;

export interface BackupValidationResult {
  success: boolean;
  data?: BackupPayload;
  error?: string;
}

/**
 * Validates a parsed JSON object as a valid CFA Wizard backup envelope.
 */
export function validateBackupPayload(raw: unknown): BackupValidationResult {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {
      success: false,
      error: "Backup file must be a valid JSON object.",
    };
  }

  const result = BackupPayloadSchema.safeParse(raw);
  if (!result.success) {
    const errorDetails = result.error.issues
      .map((e) => `${e.path.map(String).join(".")}: ${e.message}`)
      .slice(0, 3)
      .join("; ");
    return {
      success: false,
      error: `Invalid backup schema: ${errorDetails}`,
    };
  }

  return {
    success: true,
    data: result.data,
  };
}

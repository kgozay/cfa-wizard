import { z } from "zod";
import { PracticeAttemptSchema, PracticeSessionSchema } from "@/lib/practice/schema";

export const BackupDataSchema = z.object({
  completedTopicIds: z.array(z.string()).default([]),
  inProgressTopicId: z.string().optional().default("01"),
  vignetteResults: z.record(z.string(), z.any()).default({}),
  practiceAttempts: z.array(PracticeAttemptSchema).default([]),
  practiceSessions: z.record(z.string(), PracticeSessionSchema).default({}),
  activePracticeSessionId: z.string().nullable().default(null),
  trapLogs: z.array(z.any()).default([]),
  customVignettes: z.array(z.any()).default([]),
  leitnerCards: z.array(z.any()).default([]),
}).strict().superRefine((data, context) => {
  const attemptIds = data.practiceAttempts.map((attempt) => attempt.id);
  if (new Set(attemptIds).size !== attemptIds.length) {
    context.addIssue({ code: "custom", path: ["practiceAttempts"], message: "Attempt IDs must be unique" });
  }
  if (data.activePracticeSessionId && !data.practiceSessions[data.activePracticeSessionId]) {
    context.addIssue({ code: "custom", path: ["activePracticeSessionId"], message: "Active session does not exist in practiceSessions" });
  }
});

export const BackupPayloadSchema = z.object({
  product: z.literal("cfa-wizard"),
  schemaVersion: z.literal(4),
  exportedAt: z.string().datetime(),
  restoreMode: z.literal("replace"),
  data: BackupDataSchema,
}).strict();

const LegacyV3BackupSchema = z.object({
  exportVersion: z.literal("3.0"),
  exportedAt: z.string().datetime(),
  completedTopicIds: z.array(z.string()).default([]),
  inProgressTopicId: z.string().optional().default("01"),
  vignetteResults: z.record(z.string(), z.any()).default({}),
  trapLogs: z.array(z.any()).default([]),
  customVignettes: z.array(z.any()).default([]),
  leitnerCards: z.array(z.any()).default([]),
}).strict();

export type BackupPayload = z.infer<typeof BackupPayloadSchema>;

export interface BackupValidationResult {
  success: boolean;
  data?: BackupPayload;
  warnings?: string[];
  error?: string;
}

export function validateBackupPayload(raw: unknown): BackupValidationResult {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { success: false, error: "Backup file must be a valid JSON object." };
  }

  const current = BackupPayloadSchema.safeParse(raw);
  if (current.success) return { success: true, data: current.data, warnings: [] };

  const legacy = LegacyV3BackupSchema.safeParse(raw);
  if (legacy.success) {
    return {
      success: true,
      warnings: ["Legacy v3 backup imported. Canonical attempt detail was not present in that format."],
      data: {
        product: "cfa-wizard",
        schemaVersion: 4,
        exportedAt: legacy.data.exportedAt,
        restoreMode: "replace",
        data: {
          completedTopicIds: legacy.data.completedTopicIds,
          inProgressTopicId: legacy.data.inProgressTopicId,
          vignetteResults: legacy.data.vignetteResults,
          practiceAttempts: [],
          practiceSessions: {},
          activePracticeSessionId: null,
          trapLogs: legacy.data.trapLogs,
          customVignettes: legacy.data.customVignettes,
          leitnerCards: legacy.data.leitnerCards,
        },
      },
    };
  }

  const issues = current.error.issues.slice(0, 4).map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
  return { success: false, error: `Invalid or unsupported backup: ${issues}` };
}

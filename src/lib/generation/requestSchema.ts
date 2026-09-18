import { z } from "zod";
import { ValidTopicIdSchema } from "@/lib/practice/schema";

export const GenerationRequestSchema = z.object({
  topicId: ValidTopicIdSchema,
  mode: z.enum(["standalone", "case-study"]).default("standalone"),
  difficulty: z.enum(["standard", "high-trap", "institutional"]).default("standard"),
  questionCount: z.union([
    z.literal(2),
    z.literal(5),
    z.literal(10),
    z.literal(15),
  ]).default(5),
  focus: z.string().trim().max(500, "Focus prompt must be 500 characters or fewer").optional(),
  excludeItemIds: z.array(z.string().max(200)).max(100).optional(),
}).strict();

export type GenerationRequest = z.infer<typeof GenerationRequestSchema>;

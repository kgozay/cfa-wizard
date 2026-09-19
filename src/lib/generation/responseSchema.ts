import { z } from "zod";
import { ContentProvenanceSchema, PracticeItemSchema } from "@/lib/practice/schema";
import type { VignetteSet } from "@/types/cfa";

export const GenerationResponseSchema = z.object({
  success: z.literal(true).default(true),
  requestId: z.string().min(1),
  vignette: z.custom<VignetteSet>().optional(),
  provenance: ContentProvenanceSchema,
  items: z.array(PracticeItemSchema),
  warnings: z.array(z.string()),
}).strict();

export type GenerationResponse = z.infer<typeof GenerationResponseSchema>;

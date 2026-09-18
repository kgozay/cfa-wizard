import { z } from "zod";
import { ContentProvenanceSchema, PracticeItemSchema } from "@/lib/practice/schema";

export const GenerationResponseSchema = z.object({
  requestId: z.string().min(1),
  provenance: ContentProvenanceSchema,
  items: z.array(PracticeItemSchema),
  warnings: z.array(z.string()),
});

export type GenerationResponse = z.infer<typeof GenerationResponseSchema>;

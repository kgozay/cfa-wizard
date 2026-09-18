import { ContentProvenance } from "@/types/practice";

export interface CreateProvenanceOptions {
  sourceIds?: string[];
  generatorVersion?: string;
  promptVersion?: string;
  model?: string;
  validationNotes?: string[];
}

export function createAIDraftProvenance(options: CreateProvenanceOptions = {}): ContentProvenance {
  return {
    origin: "ai-draft",
    status: "draft",
    curriculumYear: 2027,
    sourceIds: options.sourceIds || [],
    generatorVersion: options.generatorVersion || "1.0.0",
    promptVersion: options.promptVersion || "v1-rubric",
    model: options.model || "gemini-2.0-flash",
    createdAt: new Date().toISOString(),
    validationNotes: options.validationNotes || ["Awaiting candidate review before approval"],
  };
}

export function createFallbackProvenance(options: CreateProvenanceOptions = {}): ContentProvenance {
  return {
    origin: "procedural-fallback",
    status: "draft",
    curriculumYear: 2027,
    sourceIds: options.sourceIds || ["procedural-bank"],
    generatorVersion: options.generatorVersion || "procedural-1.0.0",
    createdAt: new Date().toISOString(),
    validationNotes: ["Generated from verified offline financial formula template"],
  };
}

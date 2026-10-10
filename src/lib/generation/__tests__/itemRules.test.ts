import { describe, it, expect, vi, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { validateGeneratedItem, buildGenerationPrompt, LEVEL_I_ITEM_RULES } from "../itemRules";
import { CFA_CURRICULUM, moduleCodeFor } from "@/data/curriculum";
import { POST } from "@/app/api/generate-vignette/route";
import type { VignetteQuestion } from "@/types/cfa";

const goodItem = {
  stem: "A bond's yield to maturity rises by 100 basis points. Its price most likely:",
  options: { A: "Falls", B: "Rises", C: "Is unchanged" },
  correctOption: "A",
  algebraicSolution: "Bond prices move inversely to yields, so the price falls.",
  calculatorKeystrokes: "",
  trapCategory: "Price-yield relationship",
  errorModeDefault: "SIGN_INVERSION",
  distractorAutopsy: {
    A: "Correct. Price and yield move in opposite directions.",
    B: "Prices rise when yields fall, not when they rise.",
    C: "A change in yield changes the price of a fixed-rate bond.",
  },
} as const;

const request = (body: Record<string, unknown>) =>
  new NextRequest("http://localhost/api/generate-vignette", { method: "POST", body: JSON.stringify(body) });

describe("Generated item validation", () => {
  it("accepts an item that follows the Level I conventions", () => {
    expect(validateGeneratedItem(goodItem as unknown as VignetteQuestion)).toEqual({ valid: true, errors: [] });
  });

  it("rejects banned choices, banned stems, duplicates and missing explanations", () => {
    const banned = { ...goodItem, options: { A: "Falls", B: "Rises", C: "None of the above" } };
    expect(validateGeneratedItem(banned as unknown as VignetteQuestion).valid).toBe(false);

    const except = { ...goodItem, stem: "All of the following affect bond prices EXCEPT the bond's coupon frequency:" };
    expect(validateGeneratedItem(except as unknown as VignetteQuestion).valid).toBe(false);

    const duplicateChoices = { ...goodItem, options: { A: "Falls", B: "falls", C: "Rises" } };
    expect(validateGeneratedItem(duplicateChoices as unknown as VignetteQuestion).valid).toBe(false);

    const known = new Set([goodItem.stem.toLowerCase()]);
    expect(validateGeneratedItem(goodItem as unknown as VignetteQuestion, known).valid).toBe(false);

    const noFeedback = { ...goodItem, distractorAutopsy: { A: "Correct. Inverse relationship.", B: "", C: "" } };
    expect(validateGeneratedItem(noFeedback as unknown as VignetteQuestion).valid).toBe(false);
  });

  it("briefs the model with the official module outcomes and item rules", () => {
    const topic = CFA_CURRICULUM.find((candidate) => candidate.id === "06")!;
    const prompt = buildGenerationPrompt({ topic, moduleTitle: topic.subReadings[4].title, difficulty: "standard", questionCount: 5 });
    expect(prompt).toContain(topic.subReadings[4].title);
    expect(prompt).not.toContain(topic.subReadings[0].title);
    LEVEL_I_ITEM_RULES.forEach((rule) => expect(prompt).toContain(rule));
  });
});

describe("Generation route", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.GEMINI_API_KEY;
  });

  it("targets a learning module when one is requested", async () => {
    const topic = CFA_CURRICULUM.find((candidate) => candidate.id === "06")!;
    const moduleTitle = "Yield-Based Bond Convexity and Portfolio Properties";
    const res = await POST(request({ topicId: "06", questionCount: 5, moduleTitle }));
    expect(res.status).toBe(200);
    const data = await res.json();
    const moduleCode = moduleCodeFor(topic.id, moduleTitle);
    const onModule = data.vignette.questions.filter((q: VignetteQuestion) => q.losCode === moduleCode);
    expect(onModule.length).toBeGreaterThanOrEqual(3);
  });

  it("rejects an unknown learning module", async () => {
    const res = await POST(request({ topicId: "06", questionCount: 5, moduleTitle: "Not a module" }));
    expect(res.status).toBe(400);
  });

  it("keeps valid AI items, drops invalid ones and backfills from templates", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    const invalid = { ...goodItem, stem: "Which of the following is true about bonds?", options: { A: "x", B: "y", C: "All of the above" } };
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            candidates: [{ content: { parts: [{ text: JSON.stringify({ questions: [goodItem, invalid] }) }] } }],
          }),
          { status: 200 }
        )
      )
    );
    const res = await POST(request({ topicId: "06", questionCount: 5 }));
    expect(res.status).toBe(200);
    const data = await res.json();
    const stems = data.vignette.questions.map((q: VignetteQuestion) => q.stem);
    expect(stems).toHaveLength(5);
    expect(stems).toContain(goodItem.stem);
    expect(stems).not.toContain(invalid.stem);
    expect(data.provenance.origin).toBe("ai-draft");
    expect(data.warnings.join(" ")).toMatch(/rejected by quality checks/);
    expect(data.warnings.join(" ")).toMatch(/4 questions came from randomized templates/);
  });
});

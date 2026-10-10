import { describe, it, expect, beforeAll } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/generate-vignette/route";
import { QUESTION_TEMPLATES, buildTemplateQuestion } from "../templates";
import { createPRNG } from "@/lib/practice/random";
import { CFA_CURRICULUM } from "@/data/curriculum";
import type { VignetteQuestion } from "@/types/cfa";

const request = (body: Record<string, unknown>) =>
  new NextRequest("http://localhost/api/generate-vignette", { method: "POST", body: JSON.stringify(body) });

describe("Fallback question generator", () => {
  beforeAll(() => {
    delete process.env.GEMINI_API_KEY;
    delete process.env.GOOGLE_API_KEY;
  });

  it("builds template items with three distinct options and a valid key", () => {
    const rand = createPRNG("templates");
    QUESTION_TEMPLATES.forEach((template) => {
      for (let i = 0; i < 25; i++) {
        const question = buildTemplateQuestion(template, rand);
        expect(new Set(Object.values(question.options)).size).toBe(3);
        expect(["A", "B", "C"]).toContain(question.correctOption);
        expect(question.stem).not.toMatch(/NaN|Infinity|undefined/);
        Object.values(question.options).forEach((option) => expect(option).not.toMatch(/NaN|Infinity/));
      }
    });
  });

  it.each(CFA_CURRICULUM.map((topic) => topic.id))("returns 10 and 15 unique questions for topic %s", async (topicId) => {
    for (const questionCount of [10, 15]) {
      const res = await POST(request({ topicId, questionCount, mode: "case-study" }));
      expect(res.status).toBe(200);
      const data = await res.json();
      const stems = data.vignette.questions.map((q: VignetteQuestion) => q.stem);
      expect(stems).toHaveLength(questionCount);
      expect(new Set(stems).size).toBe(questionCount);
    }
  });

  it("produces new questions when earlier stems are excluded", async () => {
    const first = await (await POST(request({ topicId: "06", questionCount: 5 }))).json();
    const firstStems: string[] = first.vignette.questions.map((q: VignetteQuestion) => q.stem);
    const second = await (await POST(request({ topicId: "06", questionCount: 5, excludeStems: firstStems }))).json();
    const overlap = second.vignette.questions.filter((q: VignetteQuestion) => firstStems.includes(q.stem));
    expect(second.vignette.questions).toHaveLength(5);
    expect(overlap).toHaveLength(0);
  });
});

import { describe, expect, it } from "vitest";
import { CFA_VIGNETTES } from "@/data/vignettes";
import { OptionKey } from "@/types/cfa";
import { extractDisplayedNumbers, matchesDisplayed } from "@/lib/practice/optionNumbers";
import { createPRNG } from "@/lib/practice/random";
import { QUESTION_TEMPLATES, buildTemplateQuestion } from "../templates";
import { VARIANT_TEMPLATES } from "../variants";
import { renderVariant } from "../variants/dsl";

const KEYS: OptionKey[] = ["A", "B", "C"];
const questions = CFA_VIGNETTES.flatMap((vignette) => vignette.questions.map((q) => ({ ...q, topicId: vignette.topicId })));
const SEEDS = 300;

/** True when every rendered option's numbers match some authored option's numbers. */
function sameOptions(rendered: Record<OptionKey, string>, authored: Record<OptionKey, string>): boolean {
  const remaining = KEYS.map((key) => extractDisplayedNumbers(authored[key]));
  return KEYS.every((key) => {
    const values = extractDisplayedNumbers(rendered[key]).map((n) => n.value);
    const index = remaining.findIndex(
      (shown) => shown.length === values.length && shown.every((number, i) => matchesDisplayed(number, values[i]))
    );
    if (index < 0) return false;
    remaining.splice(index, 1);
    return true;
  });
}

describe("question templates", () => {
  it("use unique keys", () => {
    const keys = QUESTION_TEMPLATES.map((template) => template.key);
    expect(keys.filter((key, index) => keys.indexOf(key) !== index)).toEqual([]);
  });

  it.each(QUESTION_TEMPLATES.map((template) => [template.key, template] as const))(
    "%s builds well-formed, distinct items across many draws",
    (_key, template) => {
      const rand = createPRNG(`validate-${template.key}`);
      const stems = new Set<string>();
      for (let i = 0; i < SEEDS; i++) {
        const q = buildTemplateQuestion(template, rand);
        const text = [q.stem, ...KEYS.map((key) => q.options[key]), q.algebraicSolution, ...KEYS.map((key) => q.distractorAutopsy[key])].join(" ");
        expect(text).not.toMatch(/NaN|Infinity|undefined/);
        expect(new Set(KEYS.map((key) => q.options[key])).size).toBe(3);
        expect(q.distractorAutopsy[q.correctOption]).toMatch(/^correct/i);
        stems.add(q.stem);
      }
      // Fresh numbers, not the same item over and over
      expect(stems.size).toBeGreaterThan(5);
    }
  );
});

describe("variant families for authored items", () => {
  it.each(VARIANT_TEMPLATES.map((template) => [template.key, template] as const))(
    "%s reproduces its authored item from the example inputs",
    (key, template) => {
      const tagged = questions.filter((q) => q.variantKey === key);
      expect(tagged.length, `no authored item uses ${key}`).toBeGreaterThan(0);
      tagged.forEach((q) => expect(q.topicId).toBe(template.topicId));
      const rendered = renderVariant(template.spec, template.spec.example);
      const matches = tagged.filter((q) => sameOptions(rendered.options, q.options));
      expect(matches.length, `example of ${key} does not match any tagged item`).toBeGreaterThan(0);
      // The template's answer must match that item's keyed answer, not just one of its options
      const answer = extractDisplayedNumbers(rendered.options.A).map((n) => n.value);
      expect(
        matches.some((q) => {
          const keyed = extractDisplayedNumbers(q.options[q.correctOption]);
          return keyed.length === answer.length && keyed.every((number, i) => matchesDisplayed(number, answer[i]));
        })
      ).toBe(true);
    }
  );
});

import { describe, expect, it } from "vitest";
import { CFA_VIGNETTES } from "@/data/vignettes";
import { OptionKey } from "@/types/cfa";
import { extractDisplayedNumbers, matchesDisplayed } from "@/lib/practice/optionNumbers";
import { CONCEPTUAL_WITH_NUMBERS, NUMERIC_VERIFIERS } from "./verifiers";

const KEYS: OptionKey[] = ["A", "B", "C"];
const questions = CFA_VIGNETTES.flatMap((vignette) => vignette.questions);

describe("extractDisplayedNumbers", () => {
  it("reads currency, percentages, signs and multi-value options", () => {
    expect(extractDisplayedNumbers("$241,986").map((n) => n.value)).toEqual([241986]);
    expect(extractDisplayedNumbers("-10.335%").map((n) => n.value)).toEqual([-10.335]);
    expect(extractDisplayedNumbers("-$274,472").map((n) => n.value)).toEqual([-274472]);
    expect(extractDisplayedNumbers("t = 1.75; Fail to reject H_0").map((n) => n.value)).toEqual([1.75]);
    expect(extractDisplayedNumbers("32.0 (%^2)").map((n) => n.value)).toEqual([32]);
    expect(extractDisplayedNumbers("Beta = 1.20; Required Return = 11.20%").map((n) => n.decimals)).toEqual([2, 2]);
  });
});

describe("numeric answer verification", () => {
  it("has an independent recalculation for every item with numeric options", () => {
    const missing = questions
      .filter((q) => KEYS.some((key) => extractDisplayedNumbers(q.options[key]).length > 0))
      .filter((q) => !NUMERIC_VERIFIERS[q.id] && !CONCEPTUAL_WITH_NUMBERS.has(q.id))
      .map((q) => q.id);
    expect(missing).toEqual([]);
  });

  it("matches every displayed option value to its recalculated value", () => {
    const failures: string[] = [];
    for (const q of questions) {
      const verifier = NUMERIC_VERIFIERS[q.id];
      if (!verifier) continue;
      const expected = verifier();
      for (const key of KEYS) {
        const shown = extractDisplayedNumbers(q.options[key]);
        const wanted = ([] as number[]).concat(expected[key]);
        if (shown.length !== wanted.length) {
          failures.push(`${q.id}${key}: shows ${shown.length} number(s), expected ${wanted.length}`);
          continue;
        }
        shown.forEach((number, index) => {
          if (!matchesDisplayed(number, wanted[index])) {
            failures.push(`${q.id}${key}: shows ${number.value}, recalculated ${wanted[index].toFixed(6)}`);
          }
        });
      }
    }
    expect(failures).toEqual([]);
  });

  it("only registers verifiers for items that exist", () => {
    const ids = new Set(questions.map((q) => q.id));
    expect(Object.keys(NUMERIC_VERIFIERS).map(Number).filter((id) => !ids.has(id))).toEqual([]);
  });
});

import { ErrorMode, OptionKey } from "@/types/cfa";
import type { QuestionTemplate, TemplateQuestion } from "../templates";

type Text<V> = string | ((v: V) => string);

export interface VariantDistractor<V> {
  value: (v: V) => number;
  why: Text<V>;
  /** Overrides the shared option formatter for this option. */
  text?: (x: number, v: V) => string;
}

/**
 * A numeric item family: the inputs vary, the structure and the traps stay the
 * same. The correct answer and both distractors are recomputed for every draw.
 */
export interface NumericVariantSpec<V> {
  key: string;
  topicId: string;
  losCode: string;
  trap: string;
  error: ErrorMode;
  inputs: (rand: () => number) => V;
  stem: (v: V) => string;
  answer: (v: V) => number;
  format: (x: number, v: V) => string;
  correctWhy: Text<V>;
  distractors: [VariantDistractor<V>, VariantDistractor<V>];
  solution: (v: V) => string;
  keystrokes: (v: V) => string;
  /** The inputs of the authored item this family generalises, used to cross-check the formula. */
  example: V;
}

export interface NumericVariantTemplate<V = unknown> extends QuestionTemplate {
  spec: NumericVariantSpec<V>;
}

const resolve = <V,>(text: Text<V>, v: V) => (typeof text === "function" ? text(v) : text);

export function renderVariant<V>(spec: NumericVariantSpec<V>, v: V): TemplateQuestion {
  const [first, second] = spec.distractors;
  const option = (d: VariantDistractor<V>) => (d.text ?? spec.format)(d.value(v), v);
  const options: Record<OptionKey, string> = {
    A: spec.format(spec.answer(v), v),
    B: option(first),
    C: option(second),
  };
  return {
    losCode: spec.losCode,
    stem: spec.stem(v),
    options,
    correctOption: "A",
    algebraicSolution: spec.solution(v),
    calculatorKeystrokes: spec.keystrokes(v),
    trapCategory: spec.trap,
    errorModeDefault: spec.error,
    distractorAutopsy: {
      A: `CORRECT: ${resolve(spec.correctWhy, v)}`,
      B: resolve(first.why, v),
      C: resolve(second.why, v),
    },
  };
}

export function numericVariant<V>(spec: NumericVariantSpec<V>): NumericVariantTemplate<V> {
  return {
    key: spec.key,
    topicId: spec.topicId,
    build: (rand) => renderVariant(spec, spec.inputs(rand)),
    spec,
  };
}

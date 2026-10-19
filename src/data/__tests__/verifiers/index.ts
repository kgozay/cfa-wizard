import { Verifier } from "./math";
import { EXISTING_VERIFIERS } from "./existing";
import { TOPIC_01_VERIFIERS } from "./topic01";
import { TOPIC_02_VERIFIERS } from "./topic02";
import { TOPIC_03_VERIFIERS } from "./topic03";
import { TOPIC_04_VERIFIERS } from "./topic04";
import { TOPIC_05_VERIFIERS } from "./topic05";
import { TOPIC_06_VERIFIERS } from "./topic06";
import { TOPIC_07_VERIFIERS } from "./topic07";
import { TOPIC_08_VERIFIERS } from "./topic08";
import { TOPIC_09_VERIFIERS } from "./topic09";
import { TOPIC_10_VERIFIERS } from "./topic10";

export const NUMERIC_VERIFIERS: Record<number, Verifier> = {
  ...EXISTING_VERIFIERS,
  ...TOPIC_01_VERIFIERS,
  ...TOPIC_02_VERIFIERS,
  ...TOPIC_03_VERIFIERS,
  ...TOPIC_04_VERIFIERS,
  ...TOPIC_05_VERIFIERS,
  ...TOPIC_06_VERIFIERS,
  ...TOPIC_07_VERIFIERS,
  ...TOPIC_08_VERIFIERS,
  ...TOPIC_09_VERIFIERS,
  ...TOPIC_10_VERIFIERS,
};

/**
 * Items whose options mention numbers as part of a rule or statement rather
 * than as a calculated answer, so there is nothing to recompute.
 */
export const CONCEPTUAL_WITH_NUMBERS = new Set<number>([
  112, // p-value decision rule quoted in each option
  113, // "power equal to 1 - α"
  162, // significance levels named in the options
  211, // Fisher relation in words
  302, // NPV vs IRR ranking rationale
  512, // stop order behaviour around $45
  611, // covenant wording with ratio thresholds
  920, // VaR interpretation
  961, // "correlation below +1" in a statement
]);

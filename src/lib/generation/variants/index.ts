import { TOPIC_01_VARIANTS } from "./topic01";
import { TOPIC_02_VARIANTS } from "./topic02";
import { TOPIC_03_VARIANTS } from "./topic03";
import { TOPIC_04_VARIANTS } from "./topic04";
import { TOPIC_05_VARIANTS } from "./topic05";
import { TOPIC_06_VARIANTS } from "./topic06";
import { TOPIC_07_VARIANTS } from "./topic07";
import { TOPIC_08_VARIANTS } from "./topic08";
import { TOPIC_09_VARIANTS } from "./topic09";
import type { NumericVariantTemplate } from "./dsl";

/** Variant families for authored numeric items, keyed by the items' variantKey. */
export const VARIANT_TEMPLATES = [...TOPIC_01_VARIANTS, ...TOPIC_02_VARIANTS, ...TOPIC_03_VARIANTS, ...TOPIC_04_VARIANTS, ...TOPIC_05_VARIANTS, ...TOPIC_06_VARIANTS, ...TOPIC_07_VARIANTS, ...TOPIC_08_VARIANTS, ...TOPIC_09_VARIANTS] as NumericVariantTemplate[];

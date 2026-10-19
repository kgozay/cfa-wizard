import { VignetteQuestion } from "@/types/cfa";
import { between, millions, money, num, pct, pick } from "./format";
import { VARIANT_TEMPLATES } from "./variants";

/**
 * Parametric question templates used when no AI model is configured. Each build
 * draws fresh inputs, so repeated requests produce new, independently computed
 * items rather than the same fixed questions.
 */
export type TemplateQuestion = Omit<VignetteQuestion, "id">;

export interface QuestionTemplate {
  key: string;
  topicId: string;
  build: (rand: () => number) => TemplateQuestion;
}

const BASE_TEMPLATES: QuestionTemplate[] = [
  // ---------------- 01 Quantitative Methods ----------------
  {
    key: "quant-annuity-pv",
    topicId: "01",
    build: (rand) => {
      const pmt = between(rand, 5000, 60000, 2500);
      const rate = between(rand, 3, 10, 0.5);
      const n = between(rand, 4, 12, 1);
      const r = rate / 100;
      const pvOrd = (pmt * (1 - Math.pow(1 + r, -n))) / r;
      return {
        losCode: "LOS 2.d",
        stem: `An investor will receive ${money(pmt)} at the end of each year for ${n} years. At a discount rate of ${pct(rate)}, the present value of these payments is closest to:`,
        options: { A: money(pvOrd), B: money(pvOrd * (1 + r)), C: money(pmt * n) },
        correctOption: "A",
        algebraicSolution: `PV = PMT * [1 - (1 + r)^-N] / r = ${money(pmt)} * [1 - ${num(1 + r, 3)}^-${n}] / ${num(r, 3)} = ${money(pvOrd)}.`,
        calculatorKeystrokes: `[END] N = ${n}, I/Y = ${rate}, PMT = ${pmt}, FV = 0 -> [CPT] PV => -${num(pvOrd, 2)}`,
        trapCategory: "Annuity Timing Convention (BGN vs. END Mode)",
        errorModeDefault: "BA2_MODE",
        distractorAutopsy: {
          A: "Correct. End-of-year payments are an ordinary annuity.",
          B: "Distractor B values the payments as an annuity due ([BGN] mode).",
          C: "Distractor C adds the payments without discounting them.",
        },
      };
    },
  },

  // ---------------- 02 Economics ----------------
  {
    key: "econ-elasticity",
    topicId: "02",
    build: (rand) => {
      const p1 = between(rand, 10, 40, 1);
      const pctPrice = between(rand, 5, 20, 1);
      const pctQty = between(rand, 2, 30, 1);
      const e = -pctQty / pctPrice;
      const q1 = between(rand, 1000, 5000, 100);
      const p2 = p1 * (1 + pctPrice / 100);
      const q2 = q1 * (1 - pctQty / 100);
      const label = Math.abs(e) > 1 ? "elastic" : Math.abs(e) < 1 ? "inelastic" : "unit elastic";
      return {
        losCode: "LOS 8.b",
        stem: `When the price of a good rises from ${money(p1, 2)} to ${money(p2, 2)}, quantity demanded falls from ${q1.toLocaleString()} to ${Math.round(q2).toLocaleString()} units. Using the initial values, the own-price elasticity of demand is closest to:`,
        options: { A: num(e, 2), B: num(1 / e, 2), C: num(-e, 2) },
        correctOption: "A",
        algebraicSolution: `E = %ΔQ / %ΔP = (-${pctQty}%) / (+${pctPrice}%) = ${num(e, 2)}. Demand is ${label} over this range.`,
        calculatorKeystrokes: `${pctQty} [+/-] [÷] ${pctPrice} [=] ${num(e, 2)}`,
        trapCategory: "Elasticity Ratio Inversion",
        errorModeDefault: "SIGN_INVERSION",
        distractorAutopsy: {
          A: "Correct. Elasticity divides the percentage change in quantity by the percentage change in price.",
          B: "Distractor B inverts the ratio (%ΔP / %ΔQ).",
          C: "Distractor C drops the negative sign of the demand relationship.",
        },
      };
    },
  },
  {
    key: "econ-real-rate",
    topicId: "02",
    build: (rand) => {
      const nominal = between(rand, 3, 9, 0.25);
      const inflation = between(rand, 1, 5, 0.25);
      const real = ((1 + nominal / 100) / (1 + inflation / 100) - 1) * 100;
      return {
        losCode: "LOS 11.d",
        stem: `A government bond yields a nominal ${pct(nominal)} and expected inflation is ${pct(inflation)}. Using the exact Fisher relation, the real interest rate is closest to:`,
        options: { A: pct(real, 3), B: pct(nominal + inflation, 3), C: pct(inflation - nominal, 3) },
        correctOption: "A",
        algebraicSolution: `(1 + nominal) = (1 + real)(1 + inflation) => real = ${num(1 + nominal / 100, 4)} / ${num(1 + inflation / 100, 4)} - 1 = ${pct(real, 3)}.`,
        calculatorKeystrokes: `${num(1 + nominal / 100, 4)} [÷] ${num(1 + inflation / 100, 4)} [-] 1 [=] ${num(real / 100, 5)}`,
        trapCategory: "Nominal vs. Real Rate Conversion",
        errorModeDefault: "SIGN_INVERSION",
        distractorAutopsy: {
          A: "Correct. The real rate strips expected inflation out of the nominal rate.",
          B: "Distractor B adds inflation to the nominal rate instead of removing it.",
          C: "Distractor C subtracts in the wrong direction.",
        },
      };
    },
  },

  // ---------------- 03 Corporate Finance ----------------
  {
    key: "cf-npv",
    topicId: "03",
    build: (rand) => {
      const outlay = between(rand, 500, 2000, 50);
      const cf = Math.round(outlay * between(rand, 0.3, 0.5, 0.01));
      const rate = between(rand, 6, 14, 0.5);
      const n = 4;
      const r = rate / 100;
      const pv = (cf * (1 - Math.pow(1 + r, -n))) / r;
      const npv = pv - outlay;
      return {
        losCode: "LOS 14.b",
        stem: `A project costs $${outlay.toLocaleString()} million today and generates $${cf.toLocaleString()} million at the end of each of the next ${n} years. At a cost of capital of ${pct(rate, 1)}, the project's NPV is closest to:`,
        options: {
          A: millions(npv),
          B: millions(cf * n - outlay),
          C: millions(pv),
        },
        correctOption: "A",
        algebraicSolution: `NPV = -${outlay} + ${cf} * [1 - ${num(1 + r, 3)}^-${n}] / ${num(r, 3)} = -${outlay} + ${num(pv, 1)} = ${num(npv, 1)}.`,
        calculatorKeystrokes: `[CF] CF0 = -${outlay}, C01 = ${cf}, F01 = ${n} -> [NPV] I = ${rate} [CPT] => ${num(npv, 1)}`,
        trapCategory: "NPV Discounting and Initial Outlay",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "Correct. Discount the inflows and subtract the initial investment.",
          B: "Distractor B ignores the time value of money.",
          C: "Distractor C reports the present value of inflows and omits the initial outlay.",
        },
      };
    },
  },

  // ---------------- 04 Financial Statement Analysis ----------------
  {
    key: "fsa-dupont",
    topicId: "04",
    build: (rand) => {
      const margin = between(rand, 4, 15, 0.5);
      const turnover = between(rand, 0.6, 2.0, 0.1);
      const leverage = between(rand, 1.4, 3.0, 0.1);
      const roe = margin * turnover * leverage;
      const roa = margin * turnover;
      return {
        losCode: "LOS 21.e",
        stem: `A company has a net profit margin of ${pct(margin, 1)}, total asset turnover of ${num(turnover, 1)}x, and financial leverage (average assets / average equity) of ${num(leverage, 1)}x. Its ROE is closest to:`,
        options: { A: pct(roe), B: pct(roa), C: pct(margin * leverage) },
        correctOption: "A",
        algebraicSolution: `ROE = Net profit margin * Asset turnover * Financial leverage = ${margin}% * ${num(turnover, 1)} * ${num(leverage, 1)} = ${pct(roe)}.`,
        calculatorKeystrokes: `${margin} [×] ${num(turnover, 1)} [×] ${num(leverage, 1)} [=] ${num(roe, 2)}`,
        trapCategory: "DuPont Decomposition Omission",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "Correct. The three-factor DuPont identity multiplies all three ratios.",
          B: "Distractor B is ROA: it omits financial leverage.",
          C: "Distractor C omits asset turnover.",
        },
      };
    },
  },
  {
    key: "fsa-ddb",
    topicId: "04",
    build: (rand) => {
      const cost = between(rand, 50000, 400000, 10000);
      const life = between(rand, 4, 10, 1);
      const rate = 2 / life;
      const year1 = cost * rate;
      const year2 = (cost - year1) * rate;
      const sl = cost / life;
      return {
        losCode: "LOS 17.c",
        stem: `Equipment costs ${money(cost)} and has a ${life}-year useful life with no residual value. Using the double-declining-balance method, depreciation expense in Year 2 is closest to:`,
        options: { A: money(year2), B: money(year1), C: money(sl) },
        correctOption: "A",
        algebraicSolution: `DDB rate = 2 / ${life} = ${pct(rate * 100, 1)}. Year 1 = ${money(cost)} * ${num(rate, 4)} = ${money(year1)}. Year 2 = (${money(cost)} - ${money(year1)}) * ${num(rate, 4)} = ${money(year2)}.`,
        calculatorKeystrokes: `${cost} [×] ${num(rate, 4)} [=] ${num(year1, 0)} -> (${cost} [-] ${num(year1, 0)}) [×] ${num(rate, 4)} [=] ${num(year2, 0)}`,
        trapCategory: "Accelerated Depreciation Base",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "Correct. The DDB rate applies to the declining carrying amount at the start of Year 2.",
          B: "Distractor B repeats Year 1 depreciation instead of applying the rate to the reduced base.",
          C: "Distractor C is straight-line depreciation.",
        },
      };
    },
  },

  // ---------------- 05 Equities ----------------

  // ---------------- 06 Fixed Income ----------------
  {
    key: "fi-duration",
    topicId: "06",
    build: (rand) => {
      const modDur = between(rand, 3, 12, 0.1);
      const bp = pick(rand, [25, 50, 75, 100] as const);
      const direction = pick(rand, ["rise", "fall"] as const);
      const change = -modDur * (bp / 10000) * 100 * (direction === "rise" ? 1 : -1);
      return {
        losCode: "LOS 32.d",
        stem: `A bond has a modified duration of ${num(modDur, 1)}. If its yield to maturity ${direction}s by ${bp} basis points, the approximate percentage change in price (ignoring convexity) is closest to:`,
        options: {
          A: `${change > 0 ? "+" : ""}${pct(change)}`,
          B: `${change > 0 ? "-" : "+"}${pct(Math.abs(change))}`,
          C: `${change > 0 ? "+" : "-"}${pct(Math.abs(change) * 10)}`,
        },
        correctOption: "A",
        algebraicSolution: `%ΔP ≈ -ModDur * ΔYield = -${num(modDur, 1)} * (${direction === "rise" ? "+" : "-"}${num(bp / 10000, 4)}) = ${pct(change)}.`,
        calculatorKeystrokes: `${num(modDur, 1)} [×] ${num(bp / 100, 2)} [=] ${num(Math.abs(change), 2)} -> sign opposite to yield change`,
        trapCategory: "Duration Sign and Basis Point Scaling",
        errorModeDefault: "SIGN_INVERSION",
        distractorAutopsy: {
          A: "Correct. Price moves opposite to yield by about duration times the yield change.",
          B: "Distractor B gets the direction wrong: prices fall when yields rise.",
          C: "Distractor C misplaces the basis-point decimal by a factor of ten.",
        },
      };
    },
  },

  // ---------------- 07 Derivatives ----------------
  {
    key: "der-forward",
    topicId: "07",
    build: (rand) => {
      const spot = between(rand, 40, 150, 1);
      const r = between(rand, 2, 6, 0.25);
      const months = pick(rand, [3, 6, 9, 12] as const);
      const t = months / 12;
      const fwd = spot * Math.pow(1 + r / 100, t);
      return {
        losCode: "LOS 35.b",
        stem: `A non-dividend-paying stock trades at ${money(spot, 2)}. The annual risk-free rate is ${pct(r)} (annual compounding). The no-arbitrage price of a ${months}-month forward contract is closest to:`,
        options: {
          A: money(fwd, 2),
          B: money(spot / Math.pow(1 + r / 100, t), 2),
          C: money(spot * (1 + r / 100), 2),
        },
        correctOption: "A",
        algebraicSolution: `F_0 = S_0 * (1 + r)^T = ${num(spot, 2)} * ${num(1 + r / 100, 4)}^${num(t, 2)} = ${money(fwd, 2)}.`,
        calculatorKeystrokes: `${num(1 + r / 100, 4)} [yˣ] ${num(t, 2)} [×] ${spot} [=] ${num(fwd, 2)}`,
        trapCategory: "Cost-of-Carry Forward Pricing",
        errorModeDefault: "PERIODICITY_MISMATCH",
        distractorAutopsy: {
          A: "Correct. The forward price compounds the spot price at the risk-free rate for the contract's term.",
          B: "Distractor B discounts the spot price instead of compounding it.",
          C: "Distractor C compounds for a full year regardless of the contract term.",
        },
      };
    },
  },
  {
    key: "der-parity",
    topicId: "07",
    build: (rand) => {
      const spot = between(rand, 40, 120, 1);
      const strike = spot + between(rand, -10, 10, 1);
      const r = between(rand, 2, 6, 0.25);
      const pvK = strike / (1 + r / 100);
      // Keep the put above its no-arbitrage floor so the implied call is positive
      const put = Math.max(between(rand, 2, 8, 0.25), Math.ceil((pvK - spot) * 4) / 4 + between(rand, 1, 4, 0.25));
      const call = put + spot - pvK;
      return {
        losCode: "LOS 37.e",
        stem: `A one-year European put on a non-dividend-paying stock with a strike of ${money(strike, 2)} costs ${money(put, 2)}. The stock trades at ${money(spot, 2)} and the risk-free rate is ${pct(r)}. By put-call parity, the price of the matching European call is closest to:`,
        options: { A: money(call, 2), B: money(put + spot - strike, 2), C: money(put, 2) },
        correctOption: "A",
        algebraicSolution: `c = p + S_0 - K / (1 + r)^T = ${num(put, 2)} + ${num(spot, 2)} - ${num(strike, 2)} / ${num(1 + r / 100, 4)} = ${money(call, 2)}.`,
        calculatorKeystrokes: `${num(strike, 2)} [÷] ${num(1 + r / 100, 4)} [=] ${num(pvK, 2)} -> ${put} [+] ${spot} [-] ${num(pvK, 2)} [=] ${num(call, 2)}`,
        trapCategory: "Put-Call Parity Discounting",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "Correct. The strike enters parity at its present value.",
          B: "Distractor B uses the undiscounted strike price.",
          C: "Distractor C assumes a call and a put with the same strike must have the same price.",
        },
      };
    },
  },

  // ---------------- 08 Alternative Investments ----------------
  {
    key: "alt-cap-rate",
    topicId: "08",
    build: (rand) => {
      const noi = between(rand, 0.8, 6, 0.1);
      const cap = between(rand, 4, 9, 0.25);
      const value = noi / (cap / 100);
      return {
        losCode: "LOS 38.c",
        stem: `A commercial property is expected to generate net operating income (NOI) of $${num(noi, 1)} million next year. Comparable properties trade at a capitalization rate of ${pct(cap)}. The property's value is closest to:`,
        options: {
          A: `$${num(value, 1)} million`,
          B: `$${num(noi * (cap / 100), 3)} million`,
          C: `$${num(noi * (1 + cap / 100), 2)} million`,
        },
        correctOption: "A",
        algebraicSolution: `Value = NOI / Cap rate = ${num(noi, 1)} / ${num(cap / 100, 4)} = $${num(value, 1)} million.`,
        calculatorKeystrokes: `${num(noi, 1)} [÷] ${num(cap / 100, 4)} [=] ${num(value, 1)}`,
        trapCategory: "Direct Capitalization Inversion",
        errorModeDefault: "SIGN_INVERSION",
        distractorAutopsy: {
          A: "Correct. Direct capitalization divides NOI by the cap rate.",
          B: "Distractor B multiplies NOI by the cap rate.",
          C: "Distractor C grows NOI by the cap rate rather than capitalizing it.",
        },
      };
    },
  },
  {
    key: "alt-fees",
    topicId: "08",
    build: (rand) => {
      const start = between(rand, 100, 500, 10);
      const gross = between(rand, 8, 30, 1);
      const mgmt = 2;
      const incentive = 20;
      const end = start * (1 + gross / 100);
      const mgmtFee = end * (mgmt / 100);
      const incFee = Math.max(0, end - start - mgmtFee) * (incentive / 100);
      const net = ((end - mgmtFee - incFee) / start - 1) * 100;
      const netSimple = gross - mgmt - gross * (incentive / 100);
      return {
        losCode: "LOS 36.d",
        stem: `A hedge fund charges a 2% management fee on year-end assets and a 20% incentive fee on gains net of the management fee, with no hurdle rate. Assets grow from $${start} million to $${num(end, 1)} million before fees. The investor's net return is closest to:`,
        options: { A: pct(net), B: pct(gross - mgmt), C: pct(netSimple) },
        correctOption: "A",
        algebraicSolution: `Management fee = ${num(end, 1)} * 2% = ${num(mgmtFee, 2)}. Incentive fee = (${num(end, 1)} - ${start} - ${num(mgmtFee, 2)}) * 20% = ${num(incFee, 2)}. Net return = (${num(end, 1)} - ${num(mgmtFee, 2)} - ${num(incFee, 2)}) / ${start} - 1 = ${pct(net)}.`,
        calculatorKeystrokes: `${num(end, 1)} [×] 0.02 [=] ${num(mgmtFee, 2)} -> (${num(end, 1)} [-] ${start} [-] ${num(mgmtFee, 2)}) [×] 0.2 [=] ${num(incFee, 2)}`,
        trapCategory: "Hedge Fund Fee Waterfall",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "Correct. Deduct the management fee, then the incentive fee on the remaining gain.",
          B: "Distractor B deducts only the management fee.",
          C: "Distractor C computes the incentive fee on the gross gain and deducts fees as percentages of starting assets.",
        },
      };
    },
  },

  // ---------------- 09 Portfolio Construction ----------------
  {
    key: "pc-capm",
    topicId: "09",
    build: (rand) => {
      const rf = between(rand, 2, 5, 0.25);
      const rm = between(rand, rf + 4, rf + 8, 0.25);
      const beta = between(rand, 0.6, 1.8, 0.05);
      const req = rf + beta * (rm - rf);
      return {
        losCode: "LOS 41.d",
        stem: `The risk-free rate is ${pct(rf)}, the expected market return is ${pct(rm)}, and a stock's beta is ${num(beta, 2)}. Using the CAPM, its required return is closest to:`,
        options: { A: pct(req), B: pct(beta * rm), C: pct(rf + beta * rm) },
        correctOption: "A",
        algebraicSolution: `E(R) = R_f + β * [E(R_m) - R_f] = ${rf} + ${num(beta, 2)} * (${rm} - ${rf}) = ${pct(req)}.`,
        calculatorKeystrokes: `(${rm} [-] ${rf}) [×] ${num(beta, 2)} [+] ${rf} [=] ${num(req, 2)}`,
        trapCategory: "Market Return vs. Market Risk Premium",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "Correct. Beta scales the market risk premium, not the market return.",
          B: "Distractor B multiplies beta by the market return and omits the risk-free rate.",
          C: "Distractor C adds the risk-free rate twice by using the market return instead of the premium.",
        },
      };
    },
  },
  {
    key: "pc-sharpe",
    topicId: "09",
    build: (rand) => {
      const rp = between(rand, 6, 16, 0.5);
      const rf = between(rand, 1, 4, 0.5);
      const sd = between(rand, 8, 25, 0.5);
      const beta = between(rand, 0.7, 1.5, 0.05);
      const sharpe = (rp - rf) / sd;
      return {
        losCode: "LOS 41.e",
        stem: `A portfolio returned ${pct(rp, 1)} with a standard deviation of ${pct(sd, 1)} and a beta of ${num(beta, 2)}. The risk-free rate is ${pct(rf, 1)}. The portfolio's Sharpe ratio is closest to:`,
        options: { A: num(sharpe, 3), B: num(rp / sd, 3), C: num((rp - rf) / beta, 3) },
        correctOption: "A",
        algebraicSolution: `Sharpe = (R_p - R_f) / σ_p = (${rp} - ${rf}) / ${sd} = ${num(sharpe, 3)}.`,
        calculatorKeystrokes: `(${rp} [-] ${rf}) [÷] ${sd} [=] ${num(sharpe, 3)}`,
        trapCategory: "Treynor vs. Sharpe Risk Measure",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "Correct. The Sharpe ratio divides excess return by total risk.",
          B: "Distractor B uses the total return instead of the excess return.",
          C: "Distractor C divides by beta, which is the Treynor measure.",
        },
      };
    },
  },
];

/** Fallback-generation templates plus the variant templates for authored items. */
export const QUESTION_TEMPLATES: QuestionTemplate[] = [...BASE_TEMPLATES, ...VARIANT_TEMPLATES];

export function templatesForTopic(topicId: string): QuestionTemplate[] {
  return QUESTION_TEMPLATES.filter((template) => template.topicId === topicId);
}

/** Builds a template item, retrying until its three options are distinct. */
export function buildTemplateQuestion(template: QuestionTemplate, rand: () => number): TemplateQuestion {
  for (let attempt = 0; attempt < 20; attempt++) {
    const question = template.build(rand);
    const { A, B, C } = question.options;
    if (A !== B && B !== C && A !== C) return question;
  }
  throw new Error(`Template ${template.key} could not produce distinct options`);
}

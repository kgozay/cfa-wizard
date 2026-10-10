import { VignetteQuestion } from "@/types/cfa";
import { moduleCodeFor } from "@/data/curriculum";

/**
 * Parametric question templates used when no AI model is configured. Each build
 * draws fresh inputs, so repeated requests produce new, independently computed
 * items rather than the same fixed questions.
 */
export type TemplateQuestion = Omit<VignetteQuestion, "id">;

export interface QuestionTemplate {
  key: string;
  topicId: string;
  /** Official 2027 learning module title the template assesses */
  module: string;
  build: (rand: () => number) => TemplateQuestion;
}

const pick = <T,>(rand: () => number, values: readonly T[]): T => values[Math.floor(rand() * values.length)];
const between = (rand: () => number, min: number, max: number, step: number) => {
  const steps = Math.round((max - min) / step);
  return Number((min + Math.round(rand() * steps) * step).toFixed(6));
};
const money = (value: number, decimals = 0) =>
  `${value < 0 ? "-" : ""}$${Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
const pct = (value: number, decimals = 2) => `${value.toFixed(decimals)}%`;
const num = (value: number, decimals = 2) => value.toFixed(decimals);
const millions = (value: number) => `${money(value, 1)} million`;

export const QUESTION_TEMPLATES: QuestionTemplate[] = [
  // ---------------- 01 Quantitative Methods ----------------
  {
    key: "quant-ear",
    module: "Types of Financial Returns",
    topicId: "01",
    build: (rand) => {
      const rate = between(rand, 4, 12, 0.25);
      const [m, label] = pick(rand, [[4, "quarterly"], [12, "monthly"], [2, "semiannually"]] as const);
      const ear = (Math.pow(1 + rate / 100 / m, m) - 1) * 100;
      const continuous = (Math.exp(rate / 100) - 1) * 100;
      return {
        stem: `A deposit pays a stated annual rate of ${pct(rate)} compounded ${label}. Its effective annual rate (EAR) is closest to:`,
        options: { A: pct(ear, 3), B: pct(rate, 3), C: pct(continuous, 3) },
        correctOption: "A",
        algebraicSolution: `EAR = (1 + r_s / m)^m - 1 = (1 + ${num(rate / 100, 4)} / ${m})^${m} - 1 = ${pct(ear, 3)}.`,
        calculatorKeystrokes: `[2nd][ICONV] NOM = ${rate} [ENTER] [↓][↓] C/Y = ${m} [ENTER] [↑] [CPT] EFF => ${num(ear, 3)}`,
        trapCategory: "Effective Annual Rate Compounding Periodicity",
        errorModeDefault: "PERIODICITY_MISMATCH",
        distractorAutopsy: {
          A: `Correct. Compounding ${m} times per year raises the effective rate to ${pct(ear, 3)}.`,
          B: "Distractor B treats the stated rate as the effective rate, ignoring compounding.",
          C: "Distractor C assumes continuous compounding (e^r - 1).",
        },
      };
    },
  },
  {
    key: "quant-annuity-pv",
    module: "The Time Value of Money in Finance",
    topicId: "01",
    build: (rand) => {
      const pmt = between(rand, 5000, 60000, 2500);
      const rate = between(rand, 3, 10, 0.5);
      const n = between(rand, 4, 12, 1);
      const r = rate / 100;
      const pvOrd = (pmt * (1 - Math.pow(1 + r, -n))) / r;
      return {
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
  {
    key: "quant-z",
    module: "Statistical Distributions for Financial Asset Prices and Returns",
    topicId: "01",
    build: (rand) => {
      const mean = between(rand, 4, 12, 1);
      const sd = between(rand, 8, 20, 1);
      const [k, tail] = pick(rand, [[1, 15.87], [2, 2.28], [3, 0.13]] as const);
      const threshold = mean - k * sd;
      return {
        stem: `Annual returns are normally distributed with a mean of ${pct(mean, 1)} and a standard deviation of ${pct(sd, 1)}. The probability of a return below ${pct(threshold, 1)} is closest to:`,
        options: { A: pct(tail, 2), B: pct(tail * 2, 2), C: pct(100 - tail, 2) },
        correctOption: "A",
        algebraicSolution: `z = (${num(threshold, 1)} - ${num(mean, 1)}) / ${num(sd, 1)} = -${k}. P(Z < -${k}) = ${pct(tail, 2)}.`,
        calculatorKeystrokes: `(${num(threshold, 1)} [-] ${num(mean, 1)}) [÷] ${num(sd, 1)} [=] -${k} -> z-table`,
        trapCategory: "One-Tailed vs. Two-Tailed Normal Probability",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: `Correct. The threshold is ${k} standard deviation(s) below the mean, a single lower tail.`,
          B: "Distractor B counts both tails.",
          C: "Distractor C gives the probability of a return above the threshold.",
        },
      };
    },
  },

  // ---------------- 02 Economics ----------------
  {
    key: "econ-elasticity",
    module: "The Firm and Market Structures",
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
    key: "econ-cross-rate",
    module: "Exchange Rate Calculations",
    topicId: "02",
    build: (rand) => {
      const usdEur = between(rand, 1.02, 1.25, 0.005);
      const jpyUsd = between(rand, 120, 160, 0.5);
      const jpyEur = usdEur * jpyUsd;
      return {
        stem: `The spot rate is ${num(usdEur, 3)} USD/EUR (USD per EUR) and ${num(jpyUsd, 1)} JPY/USD (JPY per USD). The JPY/EUR cross rate is closest to:`,
        options: { A: num(jpyEur, 2), B: num(jpyUsd / usdEur, 2), C: num(usdEur / jpyUsd, 5) },
        correctOption: "A",
        algebraicSolution: `JPY/EUR = (JPY/USD) * (USD/EUR) = ${num(jpyUsd, 1)} * ${num(usdEur, 3)} = ${num(jpyEur, 2)}.`,
        calculatorKeystrokes: `${num(jpyUsd, 1)} [×] ${num(usdEur, 3)} [=] ${num(jpyEur, 2)}`,
        trapCategory: "Cross-Rate Currency Cancellation",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "Correct. Multiplying the quotes cancels USD and leaves JPY per EUR.",
          B: "Distractor B divides the quotes, which does not cancel the USD terms.",
          C: "Distractor C inverts the relationship and is not a JPY/EUR quote.",
        },
      };
    },
  },
  {
    key: "econ-real-rate",
    module: "Monetary Policy",
    topicId: "02",
    build: (rand) => {
      const nominal = between(rand, 3, 9, 0.25);
      const inflation = between(rand, 1, 5, 0.25);
      const real = ((1 + nominal / 100) / (1 + inflation / 100) - 1) * 100;
      return {
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
    module: "Capital Investments and Capital Allocation",
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
  {
    key: "cf-wacc",
    module: "Capital Structure",
    topicId: "03",
    build: (rand) => {
      const wd = between(rand, 0.2, 0.5, 0.05);
      const rd = between(rand, 4, 8, 0.25);
      const re = between(rand, 9, 15, 0.25);
      const t = between(rand, 20, 30, 1);
      const wacc = wd * rd * (1 - t / 100) + (1 - wd) * re;
      const noTax = wd * rd + (1 - wd) * re;
      return {
        stem: `A company's target capital structure is ${Math.round(wd * 100)}% debt and ${Math.round((1 - wd) * 100)}% equity. Its before-tax cost of debt is ${pct(rd)}, cost of equity is ${pct(re)}, and marginal tax rate is ${t}%. Its WACC is closest to:`,
        options: { A: pct(wacc), B: pct(noTax), C: pct((rd + re) / 2) },
        correctOption: "A",
        algebraicSolution: `WACC = w_d * r_d * (1 - t) + w_e * r_e = ${num(wd, 2)} * ${rd} * ${num(1 - t / 100, 2)} + ${num(1 - wd, 2)} * ${re} = ${pct(wacc)}.`,
        calculatorKeystrokes: `${num(wd, 2)} [×] ${rd} [×] ${num(1 - t / 100, 2)} [+] ${num(1 - wd, 2)} [×] ${re} [=] ${num(wacc, 2)}`,
        trapCategory: "After-Tax Cost of Debt in WACC",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "Correct. Debt is weighted at its after-tax cost.",
          B: "Distractor B omits the (1 - t) tax shield on debt.",
          C: "Distractor C takes a simple average of the component costs, ignoring weights and taxes.",
        },
      };
    },
  },

  // ---------------- 04 Financial Statement Analysis ----------------
  {
    key: "fsa-dupont",
    module: "Financial Analysis Techniques",
    topicId: "04",
    build: (rand) => {
      const margin = between(rand, 4, 15, 0.5);
      const turnover = between(rand, 0.6, 2.0, 0.1);
      const leverage = between(rand, 1.4, 3.0, 0.1);
      const roe = margin * turnover * leverage;
      const roa = margin * turnover;
      return {
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
    module: "Analysis of Long-Term Assets",
    topicId: "04",
    build: (rand) => {
      const cost = between(rand, 50000, 400000, 10000);
      const life = between(rand, 4, 10, 1);
      const rate = 2 / life;
      const year1 = cost * rate;
      const year2 = (cost - year1) * rate;
      const sl = cost / life;
      return {
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
  {
    key: "eq-gordon",
    module: "Discounted Cash Flow (DCF) and Growth Models",
    topicId: "05",
    build: (rand) => {
      const d0 = between(rand, 1, 5, 0.25);
      const g = between(rand, 2, 6, 0.5);
      const r = between(rand, g + 3, g + 7, 0.5);
      const d1 = d0 * (1 + g / 100);
      const value = d1 / ((r - g) / 100);
      return {
        stem: `A company just paid a dividend of ${money(d0, 2)}. Dividends are expected to grow at ${pct(g, 1)} forever and the required return is ${pct(r, 1)}. The intrinsic value per share is closest to:`,
        options: { A: money(value, 2), B: money(d0 / ((r - g) / 100), 2), C: money(d1 / (r / 100), 2) },
        correctOption: "A",
        algebraicSolution: `D_1 = ${money(d0, 2)} * ${num(1 + g / 100, 3)} = ${money(d1, 4)}. V_0 = D_1 / (r - g) = ${num(d1, 4)} / ${num((r - g) / 100, 3)} = ${money(value, 2)}.`,
        calculatorKeystrokes: `${d0} [×] ${num(1 + g / 100, 3)} [÷] ${num((r - g) / 100, 3)} [=] ${num(value, 2)}`,
        trapCategory: "D0 vs. D1 in the Gordon Growth Model",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "Correct. Grow the dividend one period (D1) before dividing by (r - g).",
          B: "Distractor B uses the dividend just paid (D0) instead of next year's dividend.",
          C: "Distractor C ignores growth in the denominator.",
        },
      };
    },
  },
  {
    key: "eq-margin-call",
    module: "Equity Issuance and Trading",
    topicId: "05",
    build: (rand) => {
      const price = between(rand, 20, 100, 1);
      const im = between(rand, 0.4, 0.6, 0.05);
      const mm = between(rand, 0.25, 0.35, 0.05);
      const call = (price * (1 - im)) / (1 - mm);
      return {
        stem: `An investor buys shares at ${money(price, 2)} with an initial margin of ${Math.round(im * 100)}%. The maintenance margin is ${Math.round(mm * 100)}%. The price below which the investor receives a margin call is closest to:`,
        options: { A: money(call, 2), B: money(price * (1 - mm), 2), C: money((price * (1 - im)) / mm, 2) },
        correctOption: "A",
        algebraicSolution: `Margin call price = P_0 * (1 - IM) / (1 - MM) = ${num(price, 2)} * ${num(1 - im, 2)} / ${num(1 - mm, 2)} = ${money(call, 2)}.`,
        calculatorKeystrokes: `${price} [×] ${num(1 - im, 2)} [÷] ${num(1 - mm, 2)} [=] ${num(call, 2)}`,
        trapCategory: "Margin Call Trigger Price",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "Correct. The loan stays fixed; a call occurs when equity falls to the maintenance level.",
          B: "Distractor B applies the maintenance margin to the purchase price and ignores the loan.",
          C: "Distractor C divides by the maintenance margin instead of (1 - maintenance margin).",
        },
      };
    },
  },

  // ---------------- 06 Fixed Income ----------------
  {
    key: "fi-duration",
    module: "Yield-Based Bond Duration Measures and Properties",
    topicId: "06",
    build: (rand) => {
      const modDur = between(rand, 3, 12, 0.1);
      const bp = pick(rand, [25, 50, 75, 100] as const);
      const direction = pick(rand, ["rise", "fall"] as const);
      const change = -modDur * (bp / 10000) * 100 * (direction === "rise" ? 1 : -1);
      return {
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
  {
    key: "fi-zero-price",
    module: "Yield and Yield Spread Measures for Fixed-Rate Bonds",
    topicId: "06",
    build: (rand) => {
      const years = between(rand, 2, 10, 1);
      const y = between(rand, 2, 7, 0.25);
      const semi = 1000 / Math.pow(1 + y / 200, years * 2);
      const annual = 1000 / Math.pow(1 + y / 100, years);
      const wrong = 1000 / Math.pow(1 + y / 100, years * 2);
      return {
        stem: `A zero-coupon bond maturing in ${years} years with a $1,000 par value is priced to yield ${pct(y)} quoted on a semiannual bond basis. Its price is closest to:`,
        options: { A: money(semi, 2), B: money(annual, 2), C: money(wrong, 2) },
        correctOption: "A",
        algebraicSolution: `P = 1,000 / (1 + ${num(y / 200, 5)})^${years * 2} = ${money(semi, 2)}.`,
        calculatorKeystrokes: `N = ${years * 2}, I/Y = ${num(y / 2, 3)}, PMT = 0, FV = 1,000 -> [CPT] PV => -${num(semi, 2)}`,
        trapCategory: "Periodicity of Yield Quotation",
        errorModeDefault: "PERIODICITY_MISMATCH",
        distractorAutopsy: {
          A: "Correct. Use semiannual periods and half the quoted yield per period.",
          B: "Distractor B discounts annually, ignoring the semiannual quotation.",
          C: "Distractor C doubles the periods but uses the full annual yield per period.",
        },
      };
    },
  },

  // ---------------- 07 Derivatives ----------------
  {
    key: "der-forward",
    module: "Arbitrage, Replication, and the Cost of Carry in Pricing Derivatives",
    topicId: "07",
    build: (rand) => {
      const spot = between(rand, 40, 150, 1);
      const r = between(rand, 2, 6, 0.25);
      const months = pick(rand, [3, 6, 9, 12] as const);
      const t = months / 12;
      const fwd = spot * Math.pow(1 + r / 100, t);
      return {
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
    module: "Option Replication Using Put–Call Parity",
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
    module: "Real Estate and Infrastructure",
    topicId: "08",
    build: (rand) => {
      const noi = between(rand, 0.8, 6, 0.1);
      const cap = between(rand, 4, 9, 0.25);
      const value = noi / (cap / 100);
      return {
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
    module: "Alternative Investment Performance and Returns",
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
    module: "Portfolio Risk and Return: Part II",
    topicId: "09",
    build: (rand) => {
      const rf = between(rand, 2, 5, 0.25);
      const rm = between(rand, rf + 4, rf + 8, 0.25);
      const beta = between(rand, 0.6, 1.8, 0.05);
      const req = rf + beta * (rm - rf);
      return {
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
    module: "Portfolio Risk and Return: Part II",
    topicId: "09",
    build: (rand) => {
      const rp = between(rand, 6, 16, 0.5);
      const rf = between(rand, 1, 4, 0.5);
      const sd = between(rand, 8, 25, 0.5);
      const beta = between(rand, 0.7, 1.5, 0.05);
      const sharpe = (rp - rf) / sd;
      return {
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

  // ---------------- Additional 2027 module coverage ----------------
  {
    key: "quant-twr",
    topicId: "01",
    module: "Benchmarking Returns",
    build: (rand) => {
      const r1 = between(rand, -15, 30, 1);
      const r2 = between(rand, -15, 30, 1);
      const twr = (Math.sqrt((1 + r1 / 100) * (1 + r2 / 100)) - 1) * 100;
      const cumulative = ((1 + r1 / 100) * (1 + r2 / 100) - 1) * 100;
      return {
        stem: `A fund returned ${r1 >= 0 ? "+" : ""}${r1}% in Year 1 and ${r2 >= 0 ? "+" : ""}${r2}% in Year 2. Its annualized time-weighted rate of return is closest to:`,
        options: { A: pct(twr), B: pct((r1 + r2) / 2), C: pct(cumulative) },
        correctOption: "A",
        algebraicSolution: `TWR = [(1 + ${num(r1 / 100, 2)})(1 + ${num(r2 / 100, 2)})]^(1/2) - 1 = ${pct(twr)}.`,
        calculatorKeystrokes: `${num(1 + r1 / 100, 2)} [×] ${num(1 + r2 / 100, 2)} [=] [√x] [-] 1 [=] ${num(twr / 100, 4)}`,
        trapCategory: "Geometric vs. Arithmetic Linking",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "Correct. Link the sub-period returns geometrically, then annualize.",
          B: "This is the arithmetic mean, which overstates compound growth when returns vary.",
          C: "This is the cumulative two-year return, not an annual rate.",
        },
      };
    },
  },
  {
    key: "quant-ci",
    topicId: "01",
    module: "Estimation and Hypothesis Testing",
    build: (rand) => {
      const n = pick(rand, [25, 36, 49, 64, 100, 144] as const);
      const mean = between(rand, 4, 14, 0.5);
      const sd = between(rand, 10, 30, 1);
      const se = sd / Math.sqrt(n);
      const range = (z: number, spread: number) => `${pct(mean - z * spread)} to ${pct(mean + z * spread)}`;
      return {
        stem: `A sample of ${n} returns has a mean of ${pct(mean, 1)} and a standard deviation of ${pct(sd, 0)}. The 95% confidence interval for the population mean (z = 1.96) is closest to:`,
        options: { A: range(1.96, se), B: range(1.645, se), C: range(1.96, sd) },
        correctOption: "A",
        algebraicSolution: `Standard error = ${sd}% / √${n} = ${pct(se)}. CI = ${mean}% ± 1.96 × ${pct(se)} = ${range(1.96, se)}.`,
        calculatorKeystrokes: `${sd} [÷] ${n} [√x] [=] ${num(se, 4)} [×] 1.96 [=] ${num(1.96 * se, 4)}`,
        trapCategory: "Standard Error in Confidence Intervals",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "Correct. Use the standard error of the mean with the 95% reliability factor.",
          B: "This uses the 90% reliability factor (1.645).",
          C: "This uses the standard deviation instead of the standard error.",
        },
      };
    },
  },
  {
    key: "quant-cv",
    topicId: "01",
    module: "Statistical Characteristics of Asset Returns",
    build: (rand) => {
      const mean = between(rand, 4, 15, 0.5);
      const sd = between(rand, 6, 30, 0.5);
      return {
        stem: `An asset has a mean return of ${pct(mean, 1)} and a standard deviation of ${pct(sd, 1)}. Its coefficient of variation is closest to:`,
        options: { A: num(sd / mean, 2), B: num(mean / sd, 2), C: num(sd - mean, 2) },
        correctOption: "A",
        algebraicSolution: `CV = σ / mean = ${sd} / ${mean} = ${num(sd / mean, 2)}.`,
        calculatorKeystrokes: `${sd} [÷] ${mean} [=] ${num(sd / mean, 2)}`,
        trapCategory: "Coefficient of Variation Inversion",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "Correct. CV measures risk per unit of mean return.",
          B: "This inverts the ratio.",
          C: "This subtracts instead of dividing.",
        },
      };
    },
  },
  {
    key: "econ-forward",
    topicId: "02",
    module: "Exchange Rate Calculations",
    build: (rand) => {
      const spot = between(rand, 1.05, 1.3, 0.005);
      const iUsd = between(rand, 1, 6, 0.25);
      const iEur = between(rand, 1, 6, 0.25);
      const fwd = (spot * (1 + iUsd / 100)) / (1 + iEur / 100);
      const inverted = (spot * (1 + iEur / 100)) / (1 + iUsd / 100);
      return {
        stem: `The spot rate is ${num(spot, 4)} USD/EUR (USD per EUR). The one-year USD interest rate is ${pct(iUsd)} and the one-year EUR interest rate is ${pct(iEur)}. The one-year forward rate (USD/EUR) is closest to:`,
        options: { A: num(fwd, 4), B: num(inverted, 4), C: num(spot, 4) },
        correctOption: "A",
        algebraicSolution: `F = S × (1 + i_USD) / (1 + i_EUR) = ${num(spot, 4)} × ${num(1 + iUsd / 100, 4)} / ${num(1 + iEur / 100, 4)} = ${num(fwd, 4)}.`,
        calculatorKeystrokes: `${num(spot, 4)} [×] ${num(1 + iUsd / 100, 4)} [÷] ${num(1 + iEur / 100, 4)} [=] ${num(fwd, 4)}`,
        trapCategory: "Covered Interest Parity Orientation",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "Correct. The price currency's (USD) rate goes in the numerator.",
          B: "This inverts the interest rate ratio.",
          C: "This ignores the interest rate differential.",
        },
      };
    },
  },
  {
    key: "econ-multiplier",
    topicId: "02",
    module: "Fiscal Policy",
    build: (rand) => {
      const mpc = between(rand, 0.6, 0.9, 0.05);
      const t = between(rand, 10, 35, 5);
      const multiplier = 1 / (1 - mpc * (1 - t / 100));
      return {
        stem: `The marginal propensity to consume is ${num(mpc, 2)} and the tax rate is ${t}%. The fiscal multiplier is closest to:`,
        options: { A: num(multiplier, 2), B: num(1 / (1 - mpc), 2), C: num(1 / mpc, 2) },
        correctOption: "A",
        algebraicSolution: `Multiplier = 1 / [1 - MPC(1 - t)] = 1 / [1 - ${num(mpc, 2)} × ${num(1 - t / 100, 2)}] = ${num(multiplier, 2)}.`,
        calculatorKeystrokes: `${num(mpc, 2)} [×] ${num(1 - t / 100, 2)} [=] -> 1 [-] Ans [=] [1/x] => ${num(multiplier, 2)}`,
        trapCategory: "Fiscal Multiplier with Taxes",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "Correct. Taxes reduce the share of each extra unit of income that is spent.",
          B: "This ignores taxes.",
          C: "This is 1 / MPC, which is not the multiplier.",
        },
      };
    },
  },
  {
    key: "cf-ccc",
    topicId: "03",
    module: "Working Capital and Liquidity",
    build: (rand) => {
      const dso = between(rand, 20, 75, 1);
      const doh = between(rand, 20, 120, 1);
      const dpo = between(rand, 15, 70, 1);
      return {
        stem: `A company has days of sales outstanding of ${dso}, days of inventory on hand of ${doh} and days of payables of ${dpo}. Its cash conversion cycle is closest to:`,
        options: { A: `${dso + doh - dpo} days`, B: `${dso + doh + dpo} days`, C: `${dso + doh} days` },
        correctOption: "A",
        algebraicSolution: `CCC = DSO + DOH - DPO = ${dso} + ${doh} - ${dpo} = ${dso + doh - dpo} days.`,
        calculatorKeystrokes: `${dso} [+] ${doh} [-] ${dpo} [=] ${dso + doh - dpo}`,
        trapCategory: "Cash Conversion Cycle Signs",
        errorModeDefault: "SIGN_INVERSION",
        distractorAutopsy: {
          A: "Correct. Supplier credit shortens the cash conversion cycle.",
          B: "This adds payables days instead of subtracting them.",
          C: "This ignores payables days.",
        },
      };
    },
  },
  {
    key: "cf-roic",
    topicId: "03",
    module: "Capital Investments and Capital Allocation",
    build: (rand) => {
      const ebit = between(rand, 80, 600, 10);
      const t = between(rand, 20, 30, 1);
      const ic = Math.round(ebit * between(rand, 4, 9, 0.5));
      const equity = Math.round(ic * between(rand, 0.5, 0.8, 0.05));
      const nopat = ebit * (1 - t / 100);
      return {
        stem: `A company earns EBIT of $${ebit} million and pays tax at ${t}%. It has invested capital (debt plus equity) of $${ic.toLocaleString()} million, of which $${equity.toLocaleString()} million is equity. Its ROIC is closest to:`,
        options: { A: pct((nopat / ic) * 100, 1), B: pct((ebit / ic) * 100, 1), C: pct((nopat / equity) * 100, 1) },
        correctOption: "A",
        algebraicSolution: `ROIC = EBIT × (1 - t) / Invested capital = ${ebit} × ${num(1 - t / 100, 2)} / ${ic} = ${pct((nopat / ic) * 100, 1)}.`,
        calculatorKeystrokes: `${ebit} [×] ${num(1 - t / 100, 2)} [÷] ${ic} [=] ${num(nopat / ic, 4)}`,
        trapCategory: "ROIC Numerator and Denominator",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "Correct. ROIC divides after-tax operating profit by total invested capital.",
          B: "This uses pre-tax EBIT.",
          C: "This divides by equity only.",
        },
      };
    },
  },
  {
    key: "fsa-etr",
    topicId: "04",
    module: "Analysis of Income Taxes",
    build: (rand) => {
      const pretax = between(rand, 20, 200, 5);
      const etr = between(rand, 15, 30, 0.5);
      const cashRate = Math.max(5, etr - between(rand, 2, 8, 0.5));
      const statutory = etr + between(rand, 1, 6, 1);
      return {
        stem: `A company reports pre-tax income of $${pretax} million, income tax expense of $${num((pretax * etr) / 100, 2)} million and cash taxes paid of $${num((pretax * cashRate) / 100, 2)} million. The statutory tax rate is ${num(statutory, 1)}%. Its effective tax rate is closest to:`,
        options: { A: pct(etr, 1), B: pct(cashRate, 1), C: pct(statutory, 1) },
        correctOption: "A",
        algebraicSolution: `Effective tax rate = Income tax expense / Pre-tax income = ${num((pretax * etr) / 100, 2)} / ${pretax} = ${pct(etr, 1)}.`,
        calculatorKeystrokes: `${num((pretax * etr) / 100, 2)} [÷] ${pretax} [=] ${num(etr / 100, 4)}`,
        trapCategory: "Effective vs. Cash vs. Statutory Tax Rate",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "Correct. The effective rate uses reported income tax expense.",
          B: "This is the cash tax rate.",
          C: "This is the statutory rate.",
        },
      };
    },
  },
  {
    key: "fsa-gross-margin",
    topicId: "04",
    module: "Analyzing Income Statements",
    build: (rand) => {
      const revenue = between(rand, 200, 2000, 10);
      const cogs = Math.round(revenue * between(rand, 0.35, 0.8, 0.01));
      const gp = revenue - cogs;
      return {
        stem: `A company reports revenue of $${revenue.toLocaleString()} million and cost of goods sold of $${cogs.toLocaleString()} million. Its gross profit margin is closest to:`,
        options: { A: pct((gp / revenue) * 100, 1), B: pct((gp / cogs) * 100, 1), C: pct((cogs / revenue) * 100, 1) },
        correctOption: "A",
        algebraicSolution: `Gross margin = (Revenue - COGS) / Revenue = ${gp} / ${revenue} = ${pct((gp / revenue) * 100, 1)}.`,
        calculatorKeystrokes: `(${revenue} [-] ${cogs}) [÷] ${revenue} [=] ${num(gp / revenue, 4)}`,
        trapCategory: "Common-Size Margin Denominator",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "Correct. Margins are expressed as a percentage of revenue.",
          B: "This divides gross profit by COGS.",
          C: "This is COGS as a percentage of revenue.",
        },
      };
    },
  },
  {
    key: "eq-residual-income",
    topicId: "05",
    module: "Discounted Cash Flow (DCF) and Growth Models",
    build: (rand) => {
      const bv = between(rand, 10, 60, 1);
      const r = between(rand, 7, 12, 0.5);
      const roe = between(rand, r + 1, r + 10, 0.5);
      return {
        stem: `A company has book value per share of ${money(bv, 2)}, an expected ROE of ${pct(roe, 1)} and a required return on equity of ${pct(r, 1)}. Next year's residual income per share is closest to:`,
        options: { A: money(((roe - r) / 100) * bv, 2), B: money((r / 100) * bv, 2), C: money((roe / 100) * bv, 2) },
        correctOption: "A",
        algebraicSolution: `RI = (ROE - r) × BV = (${num(roe / 100, 3)} - ${num(r / 100, 3)}) × ${bv} = ${money(((roe - r) / 100) * bv, 2)}.`,
        calculatorKeystrokes: `(${num(roe / 100, 3)} [-] ${num(r / 100, 3)}) [×] ${bv} [=] ${num(((roe - r) / 100) * bv, 2)}`,
        trapCategory: "Residual Income Calculation",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "Correct. Residual income is earnings above the equity charge.",
          B: "This is the equity charge.",
          C: "This is expected earnings per share.",
        },
      };
    },
  },
  {
    key: "eq-justified-pb",
    topicId: "05",
    module: "Relative Value Equity Valuation Approaches",
    build: (rand) => {
      const g = between(rand, 2, 6, 0.5);
      const r = between(rand, g + 3, g + 6, 0.5);
      const roe = between(rand, r + 2, r + 8, 0.5);
      return {
        stem: `A company has an ROE of ${pct(roe, 1)}, a sustainable growth rate of ${pct(g, 1)} and a required return of ${pct(r, 1)}. Its justified price-to-book ratio is closest to:`,
        options: { A: num((roe - g) / (r - g), 2), B: num(roe / r, 2), C: num(roe / (r - g), 2) },
        correctOption: "A",
        algebraicSolution: `Justified P/B = (ROE - g) / (r - g) = (${roe} - ${g}) / (${r} - ${g}) = ${num((roe - g) / (r - g), 2)}.`,
        calculatorKeystrokes: `(${roe} [-] ${g}) [÷] (${r} [-] ${g}) [=] ${num((roe - g) / (r - g), 2)}`,
        trapCategory: "Justified P/B from Fundamentals",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "Correct. The justified P/B uses (ROE - g) / (r - g).",
          B: "This ignores growth.",
          C: "This omits growth from the numerator.",
        },
      };
    },
  },
  {
    key: "fi-accrued",
    topicId: "06",
    module: "Fixed-Income Bond Valuation: Prices and Yields",
    build: (rand) => {
      const coupon = between(rand, 2, 9, 0.5);
      const days = between(rand, 10, 170, 1);
      const periodCoupon = (coupon / 2) * 10;
      return {
        stem: `A bond pays a ${pct(coupon, 1)} annual coupon semiannually on $1,000 par. Settlement is ${days} days into a 182-day coupon period. The accrued interest is closest to:`,
        options: {
          A: money((periodCoupon * days) / 182, 2),
          B: money((periodCoupon * (182 - days)) / 182, 2),
          C: money(periodCoupon, 2),
        },
        correctOption: "A",
        algebraicSolution: `AI = ${money(periodCoupon, 2)} × ${days}/182 = ${money((periodCoupon * days) / 182, 2)}.`,
        calculatorKeystrokes: `${num(periodCoupon, 2)} [×] ${days} [÷] 182 [=] ${num((periodCoupon * days) / 182, 2)}`,
        trapCategory: "Accrued Interest Day Fraction",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "Correct. Accrue the coupon for the days elapsed since the last payment.",
          B: "This uses the days remaining in the period.",
          C: "This is the full semiannual coupon.",
        },
      };
    },
  },
  {
    key: "fi-tbill",
    topicId: "06",
    module: "Yield and Yield Spread Measures for Floating-Rate Instruments",
    build: (rand) => {
      const rate = between(rand, 1.5, 6, 0.25);
      const days = pick(rand, [30, 60, 90, 120, 180] as const);
      const price = 100 * (1 - (rate / 100) * (days / 360));
      const addOn = 100 / (1 + (rate / 100) * (days / 360));
      return {
        stem: `A ${days}-day money market instrument is quoted at a discount rate of ${pct(rate)} (360-day year). Its price per 100 of face value is closest to:`,
        options: { A: num(price, 3), B: num(addOn, 3), C: num(100 * (1 - rate / 100), 3) },
        correctOption: "A",
        algebraicSolution: `Price = 100 × (1 - ${num(rate / 100, 4)} × ${days}/360) = ${num(price, 3)}.`,
        calculatorKeystrokes: `${num(rate / 100, 4)} [×] ${days} [÷] 360 [=] -> 1 [-] Ans [×] 100 [=] ${num(price, 3)}`,
        trapCategory: "Discount Rate vs. Add-On Rate",
        errorModeDefault: "PERIODICITY_MISMATCH",
        distractorAutopsy: {
          A: "Correct. A discount rate is applied to face value for the fraction of the year.",
          B: "This treats the quote as an add-on rate.",
          C: "This applies a full year of discount.",
        },
      };
    },
  },
  {
    key: "fi-convexity",
    topicId: "06",
    module: "Yield-Based Bond Convexity and Portfolio Properties",
    build: (rand) => {
      const modDur = between(rand, 3, 12, 0.5);
      const convexity = between(rand, 20, 150, 5);
      const bp = pick(rand, [50, 100, 150] as const);
      const dy = bp / 10000;
      const up = rand() < 0.5;
      const durationPart = -modDur * (up ? dy : -dy) * 100;
      const convexityPart = 0.5 * convexity * dy * dy * 100;
      return {
        stem: `A bond has a modified duration of ${num(modDur, 1)} and an annual convexity of ${convexity}. If its yield ${up ? "rises" : "falls"} by ${bp} basis points, the estimated percentage price change is closest to:`,
        options: {
          A: pct(durationPart + convexityPart),
          B: pct(durationPart),
          C: pct(durationPart - convexityPart),
        },
        correctOption: "A",
        algebraicSolution: `%ΔP ≈ -ModDur × Δy + ½ × Convexity × (Δy)² = ${pct(durationPart)} + ${pct(convexityPart)} = ${pct(durationPart + convexityPart)}.`,
        calculatorKeystrokes: `0.5 [×] ${convexity} [×] ${num(dy, 4)} [x²] [=] ${num(convexityPart / 100, 5)}`,
        trapCategory: "Convexity Adjustment Sign",
        errorModeDefault: "SIGN_INVERSION",
        distractorAutopsy: {
          A: "Correct. Positive convexity always adds to the duration estimate.",
          B: "This ignores convexity.",
          C: "This subtracts the convexity adjustment.",
        },
      };
    },
  },
  {
    key: "der-call-profit",
    topicId: "07",
    module: "Forward Commitment and Contingent Claim Features and Instruments",
    build: (rand) => {
      const strike = between(rand, 30, 120, 5);
      const premium = between(rand, 1, 8, 0.5);
      const st = strike + between(rand, -10, 20, 1);
      const payoff = Math.max(0, st - strike);
      return {
        stem: `An investor buys a call option with a strike price of ${money(strike, 2)} for a premium of ${money(premium, 2)}. At expiration the stock price is ${money(st, 2)}. The investor's profit is closest to:`,
        options: { A: money(payoff - premium, 2), B: money(payoff, 2), C: money(payoff + premium, 2) },
        correctOption: "A",
        algebraicSolution: `Payoff = max(0, ${st} - ${strike}) = ${money(payoff, 2)}. Profit = payoff - premium = ${money(payoff - premium, 2)}.`,
        calculatorKeystrokes: `max(0, ${st} [-] ${strike}) [-] ${premium} [=] ${num(payoff - premium, 2)}`,
        trapCategory: "Option Payoff vs. Profit",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "Correct. Profit subtracts the premium paid from the exercise payoff.",
          B: "This is the payoff before the premium.",
          C: "This adds the premium instead of subtracting it.",
        },
      };
    },
  },
  {
    key: "der-binomial",
    topicId: "07",
    module: "Valuing a Derivative Using a One-Period Binomial Model",
    build: (rand) => {
      const s0 = between(rand, 40, 120, 5);
      const u = between(rand, 1.1, 1.3, 0.05);
      const d = between(rand, 0.8, 0.95, 0.05);
      const r = between(rand, 2, 6, 1);
      const q = (1 + r / 100 - d) / (u - d);
      const upPayoff = Math.max(0, s0 * u - s0);
      const value = (q * upPayoff) / (1 + r / 100);
      return {
        stem: `A stock at ${money(s0, 2)} will be worth ${money(s0 * u, 2)} or ${money(s0 * d, 2)} in one year. The risk-free rate is ${r}%. Using a one-period binomial model, the value of a call with a ${money(s0, 2)} strike is closest to:`,
        options: { A: money(value, 2), B: money(q * upPayoff, 2), C: money((0.5 * upPayoff) / (1 + r / 100), 2) },
        correctOption: "A",
        algebraicSolution: `q = (1 + r - d) / (u - d) = (${num(1 + r / 100, 2)} - ${num(d, 2)}) / (${num(u, 2)} - ${num(d, 2)}) = ${num(q, 4)}. Call = q × ${num(upPayoff, 2)} / ${num(1 + r / 100, 2)} = ${money(value, 2)}.`,
        calculatorKeystrokes: `${num(q, 4)} [×] ${num(upPayoff, 2)} [÷] ${num(1 + r / 100, 2)} [=] ${num(value, 2)}`,
        trapCategory: "Risk-Neutral Valuation",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "Correct. Discount the risk-neutral expected payoff at the risk-free rate.",
          B: "This forgets to discount the expected payoff.",
          C: "This assumes a 50% up probability instead of the risk-neutral probability.",
        },
      };
    },
  },
  {
    key: "der-forward-value",
    topicId: "07",
    module: "Pricing and Valuation of Forward Contracts and for an Underlying with Varying Maturities",
    build: (rand) => {
      const f0 = between(rand, 50, 150, 1);
      const st = f0 + between(rand, -8, 8, 1);
      const r = between(rand, 2, 6, 0.5);
      const months = pick(rand, [3, 6, 9] as const);
      const t = months / 12;
      const value = st - f0 / Math.pow(1 + r / 100, t);
      return {
        stem: `A long forward contract has a forward price of ${money(f0, 2)} and ${months} months remaining. The spot price is now ${money(st, 2)} and the annual risk-free rate is ${pct(r, 1)}. The value of the long position is closest to:`,
        options: {
          A: money(value, 2),
          B: money(st - f0, 2),
          C: money(st * Math.pow(1 + r / 100, t) - f0, 2),
        },
        correctOption: "A",
        algebraicSolution: `V = S_t - F_0 / (1 + r)^(T - t) = ${num(st, 2)} - ${num(f0, 2)} / ${num(1 + r / 100, 3)}^${num(t, 2)} = ${money(value, 2)}.`,
        calculatorKeystrokes: `${num(1 + r / 100, 3)} [yˣ] ${num(t, 2)} [=] -> ${f0} [÷] Ans [=] -> ${st} [-] Ans [=] ${num(value, 2)}`,
        trapCategory: "Forward Value During the Contract",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "Correct. Compare the spot price with the present value of the forward price.",
          B: "This ignores the time value of money.",
          C: "This compounds the spot price instead of discounting the forward price.",
        },
      };
    },
  },
  {
    key: "alt-hurdle",
    topicId: "08",
    module: "Alternative Investment Performance and Returns",
    build: (rand) => {
      const gross = between(rand, 10, 30, 1);
      const mgmt = pick(rand, [1, 1.5, 2] as const);
      const hurdle = pick(rand, [6, 7, 8] as const);
      const netOfMgmt = gross - mgmt;
      const incentive = Math.max(0, 0.2 * (netOfMgmt - hurdle));
      const net = netOfMgmt - incentive;
      return {
        stem: `A fund earns a gross return of ${gross}% on beginning assets. It charges a ${mgmt}% management fee on beginning assets and a 20% incentive fee on gains net of the management fee above a hard hurdle of ${hurdle}%. The investor's net return is closest to:`,
        options: { A: pct(net, 1), B: pct(netOfMgmt - 0.2 * netOfMgmt, 1), C: pct(netOfMgmt, 1) },
        correctOption: "A",
        algebraicSolution: `Gain after management fee = ${gross}% - ${mgmt}% = ${num(netOfMgmt, 1)}%. Incentive = 20% × (${num(netOfMgmt, 1)}% - ${hurdle}%) = ${num(incentive, 2)}%. Net = ${pct(net, 1)}.`,
        calculatorKeystrokes: `0.2 [×] (${num(netOfMgmt, 1)} [-] ${hurdle}) [=] ${num(incentive, 2)} -> ${num(netOfMgmt, 1)} [-] ${num(incentive, 2)} [=] ${num(net, 2)}`,
        trapCategory: "Hard Hurdle Fee Calculation",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "Correct. With a hard hurdle, the incentive fee applies only to gains above the hurdle.",
          B: "This ignores the hurdle.",
          C: "This deducts only the management fee.",
        },
      };
    },
  },
  {
    key: "pc-jensen",
    topicId: "09",
    module: "Portfolio Risk and Return: Part II",
    build: (rand) => {
      const rf = between(rand, 1, 5, 0.5);
      const rm = between(rand, rf + 4, rf + 8, 0.5);
      const beta = between(rand, 0.6, 1.6, 0.1);
      const rp = between(rand, 6, 18, 0.5);
      const capm = rf + beta * (rm - rf);
      return {
        stem: `A portfolio with a beta of ${num(beta, 1)} returned ${pct(rp, 1)}. The risk-free rate is ${pct(rf, 1)} and the market returned ${pct(rm, 1)}. Jensen's alpha is closest to:`,
        options: { A: pct(rp - capm), B: pct(rp - rm), C: pct(rp - rf) },
        correctOption: "A",
        algebraicSolution: `Required return = ${rf} + ${num(beta, 1)} × (${rm} - ${rf}) = ${pct(capm)}. Alpha = ${rp}% - ${pct(capm)} = ${pct(rp - capm)}.`,
        calculatorKeystrokes: `(${rm} [-] ${rf}) [×] ${num(beta, 1)} [+] ${rf} [=] ${num(capm, 2)} -> ${rp} [-] Ans [=] ${num(rp - capm, 2)}`,
        trapCategory: "Jensen's Alpha",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "Correct. Alpha is the return above the CAPM required return.",
          B: "This compares with the market without adjusting for beta.",
          C: "This is the excess return over the risk-free rate.",
        },
      };
    },
  },
  {
    key: "pc-utility",
    topicId: "09",
    module: "Portfolio Risk and Return: Part I",
    build: (rand) => {
      const er = between(rand, 5, 15, 0.5);
      const sd = between(rand, 8, 30, 1);
      const a = pick(rand, [2, 3, 4, 5, 6] as const);
      const utility = er - 0.5 * a * (sd * sd) / 100;
      return {
        stem: `An investor with risk aversion A = ${a} evaluates a portfolio with an expected return of ${pct(er, 1)} and a standard deviation of ${pct(sd, 0)}. Using U = E(R) - 0.5 × A × σ², the utility is closest to:`,
        options: { A: pct(utility), B: pct(er - (a * sd * sd) / 100), C: pct(er) },
        correctOption: "A",
        algebraicSolution: `U = ${num(er / 100, 3)} - 0.5 × ${a} × ${num(sd / 100, 2)}² = ${pct(utility)}.`,
        calculatorKeystrokes: `0.5 [×] ${a} [×] ${num(sd / 100, 2)} [x²] [=] -> ${num(er / 100, 3)} [-] Ans [=] ${num(utility / 100, 4)}`,
        trapCategory: "Utility Function Calculation",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "Correct. Utility subtracts half of A times variance from the expected return.",
          B: "This omits the 0.5 factor.",
          C: "This ignores the risk penalty.",
        },
      };
    },
  },
];

export function templatesForTopic(topicId: string): QuestionTemplate[] {
  return QUESTION_TEMPLATES.filter((template) => template.topicId === topicId);
}

/** Builds a template item, retrying until its three options are distinct. */
export function buildTemplateQuestion(template: QuestionTemplate, rand: () => number): TemplateQuestion {
  for (let attempt = 0; attempt < 20; attempt++) {
    const question = { ...template.build(rand), losCode: moduleCodeFor(template.topicId, template.module) };
    const { A, B, C } = question.options;
    if (A !== B && B !== C && A !== C) return question;
  }
  throw new Error(`Template ${template.key} could not produce distinct options`);
}

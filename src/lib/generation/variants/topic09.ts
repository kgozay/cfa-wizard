import { between, money, num, pct, pick } from "../format";
import { numericVariant } from "./dsl";

const pct1 = (x: number) => pct(x, 1);
const signedPct = (x: number) => `${x >= 0 ? "+" : ""}${pct(x)}`;

/** Draws until the three displayed options differ. */
function distinctDraw<V>(draw: () => V, shown: (v: V) => string[]): V {
  for (;;) {
    const v = draw();
    if (new Set(shown(v)).size === 3) return v;
  }
}

export const TOPIC_09_VARIANTS = [
  numericVariant({
    key: "pc-beta-from-correlation",
    topicId: "09",
    losCode: "LOS 41.c",
    trap: "Beta Ratio Inversion (Market vs Asset Volatility)",
    error: "SIGN_INVERSION",
    inputs: (r) => {
      const rf = between(r, 2, 5, 0.5);
      const rm = rf + between(r, 4, 8, 0.5);
      const sdStock = between(r, 20, 40, 1);
      const sdMarket = between(r, 12, 18, 1);
      const rho = between(r, 0.4, 0.9, 0.05);
      const required = rf + rho * (sdStock / sdMarket) * (rm - rf);
      return { rf, rm, sdStock, sdMarket, rho, forecast: Number((required + between(r, 1, 4, 0.5)).toFixed(1)) };
    },
    example: { rf: 4, rm: 10, sdStock: 24, sdMarket: 15, rho: 0.75, forecast: 13.5 },
    stem: (v) => `The risk-free rate is ${pct(v.rf)} and the expected market return is ${pct(v.rm)}. A stock has a standard deviation of ${pct1(v.sdStock)}, the market's standard deviation is ${pct1(v.sdMarket)}, and the correlation between the stock and the market is ${num(v.rho)}. An analyst forecasts the stock will return ${pct(v.forecast)}. The stock's beta and CAPM required return are closest to:`,
    answer: (v) => v.rho * (v.sdStock / v.sdMarket),
    format: (beta, v) => `Beta = ${num(beta)}; Required Return = ${pct(v.rf + beta * (v.rm - v.rf))}`,
    correctWhy: "Beta = correlation × (σ_stock / σ_market); the required return comes from the CAPM, not the forecast.",
    distractors: [
      {
        value: (v) => v.rho * (v.sdStock / v.sdMarket),
        text: (beta, v) => `Beta = ${num(beta)}; Required Return = ${pct(v.forecast)}`,
        why: "Confuses the analyst's forecast return with the CAPM required return.",
      },
      { value: (v) => v.rho * (v.sdMarket / v.sdStock), why: "Inverts the standard deviation ratio when computing beta." },
    ],
    solution: (v) => {
      const beta = v.rho * (v.sdStock / v.sdMarket);
      return `Beta = ${num(v.rho)} × (${v.sdStock} / ${v.sdMarket}) = ${num(beta)}. Required return = ${pct(v.rf)} + ${num(beta)} × (${pct(v.rm)} - ${pct(v.rf)}) = ${pct(v.rf + beta * (v.rm - v.rf))}.`;
    },
    keystrokes: (v) => `${num(v.rho)} [×] (${v.sdStock} [÷] ${v.sdMarket}) [=] -> ${v.rf} [+] beta [×] ${num(v.rm - v.rf, 1)} [=]`,
  }),
  numericVariant({
    key: "pc-sharpe-treynor",
    topicId: "09",
    losCode: "LOS 41.e",
    trap: "Portfolio Risk and Return: Part II (CAPM & SML)",
    error: "FORMULA_SCALAR",
    inputs: (r) => ({ rp: between(r, 8, 18, 0.5), sd: between(r, 10, 25, 1), beta: between(r, 0.7, 1.6, 0.05), rf: between(r, 1, 5, 0.5) }),
    example: { rp: 14, sd: 18, beta: 1.25, rf: 3 },
    stem: (v) => `Portfolio A generated an annualized return of ${pct1(v.rp)} with standard deviation of ${pct1(v.sd)} and beta of ${num(v.beta)}. If the risk-free rate is ${pct1(v.rf)}, the Sharpe Ratio and Treynor Ratio for Portfolio A are closest to:`,
    answer: (v) => (v.rp - v.rf) / v.sd,
    format: (sharpe, v) => `Sharpe = ${num(sharpe, 3)}; Treynor = ${pct((v.rp - v.rf) / v.beta)}`,
    correctWhy: "Sharpe divides excess return by σ; Treynor divides it by beta.",
    distractors: [
      {
        value: (v) => (v.rp - v.rf) / v.sd,
        text: (sharpe, v) => `Sharpe = ${pct((v.rp - v.rf) / v.beta)}; Treynor = ${num(sharpe, 3)}`,
        why: "Swaps the Sharpe and Treynor ratios.",
      },
      {
        value: (v) => v.rp / v.sd,
        text: (sharpe, v) => `Sharpe = ${num(sharpe, 3)}; Treynor = ${pct(v.rp / v.beta)}`,
        why: "Uses the raw return without subtracting the risk-free rate.",
      },
    ],
    solution: (v) => `Excess return = ${pct1(v.rp - v.rf)}. Sharpe = ${num(v.rp - v.rf, 1)} / ${v.sd} = ${num((v.rp - v.rf) / v.sd, 3)}. Treynor = ${num(v.rp - v.rf, 1)} / ${num(v.beta)} = ${pct((v.rp - v.rf) / v.beta)}.`,
    keystrokes: (v) => `(${v.rp} [-] ${v.rf}) [÷] ${v.sd} [=]; (${v.rp} [-] ${v.rf}) [÷] ${num(v.beta)} [=]`,
  }),
  numericVariant({
    key: "pc-jensen-alpha",
    topicId: "09",
    losCode: "LOS 41.g",
    trap: "Portfolio Risk and Return: Part II (CAPM & SML)",
    error: "SIGN_INVERSION",
    inputs: (r) =>
      distinctDraw(
        () => {
          const rf = between(r, 2, 5, 0.5);
          const rm = rf + between(r, 4, 9, 0.5);
          const beta = pick(r, [0.7, 0.8, 0.85, 0.9, 1.1, 1.15, 1.2, 1.3, 1.4]);
          const alpha = between(r, 0.5, 4, 0.1) * (r() < 0.75 ? 1 : -1);
          return { rf, rm, beta, rp: Number((rf + beta * (rm - rf) + alpha).toFixed(1)) };
        },
        (v) => [v.rp - (v.rf + v.beta * (v.rm - v.rf)), v.rp - v.rm, v.rf + v.beta * (v.rm - v.rf) - v.rp].map(signedPct)
      ),
    example: { rf: 4, rm: 12, beta: 1.1, rp: 15 },
    stem: (v) => `An active fund manager reports a portfolio return of ${pct1(v.rp)} and beta of ${num(v.beta)}. If the risk-free rate is ${pct1(v.rf)} and the market return is ${pct1(v.rm)}, Jensen's Alpha for the fund is closest to:`,
    answer: (v) => v.rp - (v.rf + v.beta * (v.rm - v.rf)),
    format: signedPct,
    correctWhy: "Alpha = actual return - CAPM required return.",
    distractors: [
      { value: (v) => v.rp - v.rm, why: "Measures the return over the market, ignoring beta." },
      { value: (v) => v.rf + v.beta * (v.rm - v.rf) - v.rp, why: "Reverses the subtraction (required minus actual)." },
    ],
    solution: (v) => {
      const req = v.rf + v.beta * (v.rm - v.rf);
      return `Required return = ${pct1(v.rf)} + ${num(v.beta)} × ${pct1(v.rm - v.rf)} = ${pct(req)}. Alpha = ${pct1(v.rp)} - ${pct(req)} = ${signedPct(v.rp - req)}.`;
    },
    keystrokes: (v) => `${v.rp} [-] (${v.rf} [+] ${num(v.beta)} [×] (${v.rm} [-] ${v.rf})) [=]`,
  }),
  numericVariant({
    key: "pc-expected-return-weights",
    topicId: "09",
    losCode: "LOS 40.a",
    trap: "Portfolio Weighting",
    error: "FORMULA_SCALAR",
    inputs: (r) => {
      for (;;) {
        const v = { wA: pick(r, [10, 20, 30, 40, 60, 70, 80, 90]), rA: between(r, 3, 15, 1), rB: between(r, 3, 15, 1) };
        if (Math.abs(v.rA - v.rB) >= 3) return v;
      }
    },
    example: { wA: 40, rA: 10, rB: 6 },
    stem: (v) => `A portfolio invests ${v.wA}% in Asset A (expected return ${v.rA}%) and ${100 - v.wA}% in Asset B (expected return ${v.rB}%). The portfolio's expected return is closest to:`,
    answer: (v) => (v.wA * v.rA + (100 - v.wA) * v.rB) / 100,
    format: pct1,
    correctWhy: "The expected return is the weighted average of the asset returns.",
    distractors: [
      { value: (v) => (v.rA + v.rB) / 2, why: "Takes a simple average of the two returns, ignoring the weights." },
      { value: (v) => ((100 - v.wA) * v.rA + v.wA * v.rB) / 100, why: "Swaps the weights." },
    ],
    solution: (v) => `E(R_p) = ${num(v.wA / 100, 1)} × ${v.rA}% + ${num(1 - v.wA / 100, 1)} × ${v.rB}% = ${pct1((v.wA * v.rA + (100 - v.wA) * v.rB) / 100)}.`,
    keystrokes: (v) => `${v.wA / 100} [×] ${v.rA} [+] ${num(1 - v.wA / 100, 1)} [×] ${v.rB} [=]`,
  }),
  numericVariant({
    key: "pc-treynor",
    topicId: "09",
    losCode: "LOS 41.e",
    trap: "Treynor vs. Sharpe Risk Measure",
    error: "CONCEPTUAL_CONFUSION",
    inputs: (r) => ({ rp: between(r, 6, 18, 1), sd: between(r, 10, 25, 1), beta: pick(r, [0.6, 0.7, 0.8, 0.9, 1.2, 1.3, 1.4, 1.5, 1.6, 1.8]), rf: between(r, 1, 5, 1) }),
    example: { rp: 12, sd: 15, beta: 1.5, rf: 3 },
    stem: (v) => `A portfolio returned ${v.rp}% with a standard deviation of ${v.sd}% and a beta of ${num(v.beta, 1)}. The risk-free rate is ${v.rf}%. The portfolio's Treynor ratio is closest to:`,
    answer: (v) => (v.rp - v.rf) / v.beta,
    format: pct1,
    correctWhy: "The Treynor ratio divides excess return by beta (systematic risk).",
    distractors: [
      { value: (v) => (v.rp - v.rf) / v.sd, text: (x) => num(x), why: "Is the Sharpe ratio, which divides by total risk (standard deviation)." },
      { value: (v) => v.rp - v.rf, why: "Reports the excess return without adjusting for any risk." },
    ],
    solution: (v) => `Treynor = (${v.rp}% - ${v.rf}%) / ${num(v.beta, 1)} = ${pct1((v.rp - v.rf) / v.beta)}. (The Sharpe ratio would be ${num((v.rp - v.rf) / v.sd)}.)`,
    keystrokes: (v) => `(${v.rp} [-] ${v.rf}) [÷] ${num(v.beta, 1)} [=]`,
  }),
  numericVariant({
    key: "pc-portfolio-beta",
    topicId: "09",
    losCode: "LOS 41.c",
    trap: "Portfolio Beta Aggregation",
    error: "FORMULA_SCALAR",
    inputs: (r) =>
      distinctDraw(
        () => {
          const w1 = pick(r, [40, 50, 60]);
          const w2 = pick(r, [20, 30]);
          return { w1, w2, b1: between(r, 0.6, 1.8, 0.1), b2: between(r, 0.5, 1.6, 0.1), b3: between(r, 0.6, 2, 0.1) };
        },
        (v) => [1, (v.w1 * v.b1 + v.w2 * v.b2 + (100 - v.w1 - v.w2) * v.b3) / 100, (v.b1 + v.b2 + v.b3) / 3].map((x) => num(x))
      ),
    example: { w1: 50, w2: 30, b1: 1.2, b2: 0.8, b3: 1.5 },
    stem: (v) => `A portfolio holds ${v.w1}% in a stock with beta ${num(v.b1, 1)}, ${v.w2}% in a stock with beta ${num(v.b2, 1)}, and ${100 - v.w1 - v.w2}% in a stock with beta ${num(v.b3, 1)}. The portfolio beta is closest to:`,
    answer: (v) => (v.w1 * v.b1 + v.w2 * v.b2 + (100 - v.w1 - v.w2) * v.b3) / 100,
    format: (x) => num(x),
    correctWhy: "Portfolio beta is the weighted average of the individual betas.",
    distractors: [
      { value: () => 1, why: "Assumes the market beta of 1.0 rather than computing the portfolio's beta." },
      { value: (v) => (v.b1 + v.b2 + v.b3) / 3, why: "Takes a simple average of the three betas, ignoring weights." },
    ],
    solution: (v) => `β_p = ${num(v.w1 / 100, 1)} × ${num(v.b1, 1)} + ${num(v.w2 / 100, 1)} × ${num(v.b2, 1)} + ${num(1 - (v.w1 + v.w2) / 100, 1)} × ${num(v.b3, 1)} = ${num((v.w1 * v.b1 + v.w2 * v.b2 + (100 - v.w1 - v.w2) * v.b3) / 100)}.`,
    keystrokes: (v) => `${v.w1 / 100} [×] ${v.b1} [+] ${v.w2 / 100} [×] ${v.b2} [+] ${num(1 - (v.w1 + v.w2) / 100, 1)} [×] ${v.b3} [=]`,
  }),
  numericVariant({
    key: "pc-optimal-allocation",
    topicId: "09",
    losCode: "LOS 40.e",
    trap: "Optimal Capital Allocation",
    error: "FORMULA_SCALAR",
    inputs: (r) =>
      distinctDraw(
        () => ({ er: between(r, 7, 14, 1), sd: between(r, 12, 25, 1), rf: between(r, 2, 5, 1), aversion: between(r, 2, 6, 1) }),
        (v) => [(v.er - v.rf) / (v.aversion * (v.sd / 100) ** 2), (v.er - v.rf) / v.sd * 100, (v.er - v.rf) / (v.aversion * v.sd) * 100].map(pct1)
      ),
    example: { er: 10, sd: 18, rf: 3, aversion: 3 },
    stem: (v) => `A risky portfolio has an expected return of ${v.er}% and a standard deviation of ${v.sd}%. The risk-free rate is ${v.rf}%. For an investor with risk aversion A = ${v.aversion}, the optimal weight in the risky portfolio is closest to:`,
    answer: (v) => (v.er - v.rf) / (v.aversion * (v.sd / 100) ** 2),
    format: pct1,
    correctWhy: "Divides the risk premium by A times the variance.",
    distractors: [
      { value: (v) => ((v.er - v.rf) / v.sd) * 100, why: "Divides the risk premium by the standard deviation (the Sharpe ratio), ignoring risk aversion." },
      { value: (v) => ((v.er - v.rf) / (v.aversion * v.sd)) * 100, why: "Uses the standard deviation instead of the variance." },
    ],
    solution: (v) => `y* = [E(R_p) - R_f] / (A × σ²) = ${num((v.er - v.rf) / 100)} / (${v.aversion} × ${num((v.sd / 100) ** 2, 4)}) = ${pct1((v.er - v.rf) / (v.aversion * (v.sd / 100) ** 2))}.`,
    keystrokes: (v) => `${num((v.er - v.rf) / 100)} [÷] (${v.aversion} [×] ${num((v.sd / 100) ** 2, 4)}) [=]`,
  }),
  numericVariant({
    key: "pc-cal-slope",
    topicId: "09",
    losCode: "LOS 40.e",
    trap: "Capital Allocation Line",
    error: "FORMULA_SCALAR",
    inputs: (r) =>
      distinctDraw(
        () => ({ rf: between(r, 2, 5, 1), er: between(r, 8, 15, 1), sd: between(r, 12, 25, 1) }),
        (v) => [(v.er - v.rf) / v.sd, (v.er - v.rf) / 100 / (v.sd / 100) ** 2, v.er / v.sd].map((x) => num(x))
      ),
    example: { rf: 4, er: 11, sd: 20 },
    stem: (v) => `The capital allocation line combines a risk-free asset yielding ${v.rf}% with a risky portfolio that has an expected return of ${v.er}% and a standard deviation of ${v.sd}%. The slope of the CAL is closest to:`,
    answer: (v) => (v.er - v.rf) / v.sd,
    format: (x) => num(x),
    correctWhy: "Divides the excess return by the standard deviation.",
    distractors: [
      { value: (v) => (v.er - v.rf) / 100 / (v.sd / 100) ** 2, why: "Divides the excess return by the variance instead of the standard deviation." },
      { value: (v) => v.er / v.sd, why: "Divides the total return by the standard deviation, ignoring the risk-free rate." },
    ],
    solution: (v) => `Slope = (${v.er}% - ${v.rf}%) / ${v.sd}% = ${num((v.er - v.rf) / v.sd)}, the reward-to-variability (Sharpe) ratio.`,
    keystrokes: (v) => `${v.er - v.rf} [÷] ${v.sd} [=]`,
  }),
  numericVariant({
    key: "pc-beta-covariance",
    topicId: "09",
    losCode: "LOS 41.c",
    trap: "Beta Calculation",
    error: "FORMULA_SCALAR",
    inputs: (r) =>
      distinctDraw(
        () => ({ cov: between(r, 0.005, 0.06, 0.001), sdMarket: between(r, 12, 25, 1) }),
        (v) => [v.cov / (v.sdMarket / 100) ** 2, v.cov / (v.sdMarket / 100), (v.sdMarket / 100) ** 2 / v.cov].map((x) => num(x))
      ),
    example: { cov: 0.024, sdMarket: 20 },
    stem: (v) => `The covariance between a stock's returns and the market's returns is ${num(v.cov, 3)}, and the market's standard deviation is ${v.sdMarket}%. The stock's beta is closest to:`,
    answer: (v) => v.cov / (v.sdMarket / 100) ** 2,
    format: (x) => num(x),
    correctWhy: "Divides the covariance by the market variance.",
    distractors: [
      { value: (v) => v.cov / (v.sdMarket / 100), why: "Divides by the market's standard deviation instead of its variance." },
      { value: (v) => (v.sdMarket / 100) ** 2 / v.cov, why: "Inverts the ratio." },
    ],
    solution: (v) => `β = Cov / σ_m² = ${num(v.cov, 3)} / ${num((v.sdMarket / 100) ** 2, 4)} = ${num(v.cov / (v.sdMarket / 100) ** 2)}.`,
    keystrokes: (v) => `${num(v.cov, 3)} [÷] ${num((v.sdMarket / 100) ** 2, 4)} [=]`,
  }),
  numericVariant({
    key: "pc-m-squared",
    topicId: "09",
    losCode: "LOS 41.g",
    trap: "M-Squared Measure",
    error: "FORMULA_SCALAR",
    inputs: (r) =>
      distinctDraw(
        () => ({ rp: between(r, 6, 16, 1), sdp: between(r, 10, 25, 1), rm: between(r, 7, 12, 1), sdm: between(r, 14, 22, 1), rf: between(r, 1, 4, 1) }),
        (v) => {
          const sp = (v.rp - v.rf) / v.sdp;
          const sm = (v.rm - v.rf) / v.sdm;
          return [sp * v.sdm + v.rf - v.rm, v.rp - v.rm, (sp - sm) * 100].map((x) => pct(x));
        }
      ),
    example: { rp: 12, sdp: 15, rm: 10, sdm: 20, rf: 3 },
    stem: (v) => `A portfolio earned ${v.rp}% with a standard deviation of ${v.sdp}%. The market earned ${v.rm}% with a standard deviation of ${v.sdm}%, and the risk-free rate was ${v.rf}%. The portfolio's M² (relative to the market) is closest to:`,
    answer: (v) => ((v.rp - v.rf) / v.sdp) * v.sdm + v.rf - v.rm,
    format: (x) => pct(x),
    correctWhy: "Leverages the portfolio to market risk and compares its return with the market's.",
    distractors: [
      { value: (v) => v.rp - v.rm, why: "Compares raw returns without adjusting for risk." },
      { value: (v) => ((v.rp - v.rf) / v.sdp - (v.rm - v.rf) / v.sdm) * 100, why: "Reports the difference in Sharpe ratios, not a return." },
    ],
    solution: (v) => {
      const sp = (v.rp - v.rf) / v.sdp;
      return `Sharpe_p = ${v.rp - v.rf} / ${v.sdp} = ${num(sp, 3)}; M² = Sharpe_p × σ_m + R_f - R_m = ${num(sp, 3)} × ${v.sdm}% + ${v.rf}% - ${v.rm}% = ${pct(sp * v.sdm + v.rf - v.rm)}.`;
    },
    keystrokes: (v) => `(${v.rp} [-] ${v.rf}) [÷] ${v.sdp} [×] ${v.sdm} [+] ${v.rf} [-] ${v.rm} [=]`,
  }),
  numericVariant({
    key: "pc-required-return-additive",
    topicId: "09",
    losCode: "LOS 42.b",
    trap: "Return Objectives",
    error: "FORMULA_SCALAR",
    inputs: (r) => {
      for (;;) {
        const portfolio = between(r, 0.5, 5, 0.05) * 1e6;
        const spend = between(r, 2, 6, 0.25);
        const v = { portfolio, withdrawal: Math.round((portfolio * spend) / 100 / 1000) * 1000, inflation: between(r, 1.5, 4, 0.5) };
        if (pct((v.withdrawal / v.portfolio) * 100) !== pct(v.inflation)) return v;
      }
    },
    example: { portfolio: 1_500_000, withdrawal: 60_000, inflation: 2.5 },
    stem: (v) => `A retiree with a ${money(v.portfolio)} portfolio needs to withdraw ${money(v.withdrawal)} at the end of the coming year and wants the portfolio to keep pace with ${num(v.inflation, 1)}% inflation. Using an additive approach, her required return is closest to:`,
    answer: (v) => (v.withdrawal / v.portfolio) * 100 + v.inflation,
    format: (x) => pct(x),
    correctWhy: "Adds the spending rate and expected inflation.",
    distractors: [
      { value: (v) => (v.withdrawal / v.portfolio) * 100, why: "Covers spending but not inflation." },
      { value: (v) => v.inflation, why: "Covers inflation but not spending." },
    ],
    solution: (v) => `Spending rate = ${money(v.withdrawal)} / ${money(v.portfolio)} = ${pct((v.withdrawal / v.portfolio) * 100)}. Required return ≈ ${pct((v.withdrawal / v.portfolio) * 100)} + ${pct(v.inflation)} = ${pct((v.withdrawal / v.portfolio) * 100 + v.inflation)}.`,
    keystrokes: (v) => `${v.withdrawal} [÷] ${v.portfolio} [+] ${v.inflation / 100} [=]`,
  }),
  numericVariant({
    key: "pc-parametric-var",
    topicId: "09",
    losCode: "LOS 42.k",
    trap: "Value at Risk Calculation",
    error: "SIGN_INVERSION",
    inputs: (r) => ({ value: between(r, 1, 50, 1) * 1e6, mu: between(r, 0.01, 0.08, 0.01), sd: between(r, 0.6, 2.5, 0.1) }),
    example: { value: 10_000_000, mu: 0.05, sd: 1.2 },
    stem: (v) => `A ${money(v.value)} portfolio has an expected daily return of ${pct(v.mu)} and a daily standard deviation of ${pct1(v.sd)}. Using the parametric method and z = 1.65, its 1-day 5% VaR is closest to:`,
    answer: (v) => ((1.65 * v.sd - v.mu) / 100) * v.value,
    format: (x) => money(x),
    correctWhy: "Measures the loss at the 5% tail, net of the expected return.",
    distractors: [
      { value: (v) => ((1.65 * v.sd + v.mu) / 100) * v.value, why: "Adds the expected return instead of subtracting it." },
      { value: (v) => (v.sd / 100) * v.value, why: "Uses one standard deviation, ignoring the confidence level." },
    ],
    solution: (v) => `VaR = [1.65 × ${pct1(v.sd)} - ${pct(v.mu)}] × ${money(v.value)} = ${money(((1.65 * v.sd - v.mu) / 100) * v.value)}. The expected return slightly reduces the loss threshold.`,
    keystrokes: (v) => `(1.65 [×] ${num(v.sd / 100, 3)} [-] ${num(v.mu / 100, 4)}) [×] ${v.value} [=]`,
  }),
  numericVariant({
    key: "pc-diversification-ratio",
    topicId: "09",
    losCode: "LOS 40.c",
    trap: "Diversification Measures",
    error: "FORMULA_SCALAR",
    inputs: (r) =>
      distinctDraw(
        () => {
          const avg = between(r, 15, 35, 1);
          return { avg, port: Math.round(avg * between(r, 0.4, 0.9, 0.05)) };
        },
        (v) => [v.port / v.avg, v.avg / v.port, 1 - v.port / v.avg].map((x) => num(x))
      ),
    example: { avg: 18, port: 12 },
    stem: (v) => `The average standard deviation of the stocks in a portfolio is ${v.avg}%, and the equally weighted portfolio's standard deviation is ${v.port}%. The diversification ratio (portfolio risk / average stand-alone risk) is closest to:`,
    answer: (v) => v.port / v.avg,
    format: (x) => num(x),
    correctWhy: "Divides portfolio risk by average stand-alone risk.",
    distractors: [
      { value: (v) => v.avg / v.port, why: "Inverts the ratio." },
      { value: (v) => 1 - v.port / v.avg, why: "Reports the share of risk eliminated rather than the ratio." },
    ],
    solution: (v) => `Diversification ratio = ${v.port} / ${v.avg} = ${num(v.port / v.avg)}. Lower values mean greater diversification benefit.`,
    keystrokes: (v) => `${v.port} [÷] ${v.avg} [=]`,
  }),
  numericVariant({
    key: "pc-cml-return",
    topicId: "09",
    losCode: "LOS 41.a",
    trap: "Capital Market Line",
    error: "FORMULA_SCALAR",
    inputs: (r) =>
      distinctDraw(
        () => {
          const sdm = between(r, 12, 22, 1);
          return { rf: between(r, 2, 5, 1), rm: between(r, 8, 13, 1), sdm, sdp: between(r, 4, sdm - 2, 1) };
        },
        (v) => [v.rf + ((v.rm - v.rf) / v.sdm) * v.sdp, v.rm, (v.rm * v.sdp) / v.sdm].map(pct1)
      ),
    example: { rf: 4, rm: 10, sdm: 15, sdp: 9 },
    stem: (v) => `The risk-free rate is ${v.rf}% and the market portfolio has an expected return of ${v.rm}% with a standard deviation of ${v.sdm}%. An efficient portfolio on the capital market line with a standard deviation of ${v.sdp}% has an expected return closest to:`,
    answer: (v) => v.rf + ((v.rm - v.rf) / v.sdm) * v.sdp,
    format: pct1,
    correctWhy: "Moves along the CML by the market price of risk times σ.",
    distractors: [
      { value: (v) => v.rm, why: "Uses the market's expected return, ignoring that the portfolio carries less risk than the market." },
      { value: (v) => (v.rm * v.sdp) / v.sdm, why: "Scales the market return by the risk ratio and omits the risk-free rate." },
    ],
    solution: (v) => `E(R) = ${v.rf}% + (${v.rm - v.rf}% / ${v.sdm}%) × ${v.sdp}% = ${pct1(v.rf + ((v.rm - v.rf) / v.sdm) * v.sdp)}.`,
    keystrokes: (v) => `${v.rf} [+] ${num((v.rm - v.rf) / v.sdm, 4)} [×] ${v.sdp} [=]`,
  }),
  numericVariant({
    key: "pc-cal-risk",
    topicId: "09",
    losCode: "LOS 40.e",
    trap: "Capital Allocation Line",
    error: "FORMULA_SCALAR",
    inputs: (r) => ({ weight: pick(r, [20, 30, 40, 50, 60, 70, 80, 90]), sdm: between(r, 12, 25, 1) }),
    example: { weight: 60, sdm: 20 },
    stem: (v) => `An investor puts ${v.weight}% in the market portfolio (standard deviation ${v.sdm}%) and ${100 - v.weight}% in a risk-free asset. The portfolio's standard deviation is closest to:`,
    answer: (v) => (v.weight * v.sdm) / 100,
    format: pct1,
    correctWhy: "Scales the market's standard deviation by its weight.",
    distractors: [
      { value: (v) => v.sdm, why: "Ignores the risk-free allocation." },
      { value: (v) => ((v.weight / 100) * (v.sdm / 100)) ** 2 * 100, why: "Reports the portfolio variance as a percentage." },
    ],
    solution: (v) => `The risk-free asset has zero variance and zero covariance, so σ_p = ${num(v.weight / 100, 1)} × ${v.sdm}% = ${pct1((v.weight * v.sdm) / 100)}.`,
    keystrokes: (v) => `${v.weight / 100} [×] ${v.sdm} [=]`,
  }),
  numericVariant({
    key: "pc-information-ratio",
    topicId: "09",
    losCode: "LOS 41.g",
    trap: "Information Ratio",
    error: "FORMULA_SCALAR",
    inputs: (r) =>
      distinctDraw(
        () => {
          const rb = between(r, 5, 12, 0.5);
          return { rb, rp: rb + between(r, 0.5, 4, 0.5), te: between(r, 2, 8, 0.5) };
        },
        (v) => [(v.rp - v.rb) / v.te, v.rp / v.te, v.te / (v.rp - v.rb)].map((x) => num(x))
      ),
    example: { rb: 10, rp: 11.5, te: 4 },
    stem: (v) => `A manager returned ${pct1(v.rp)} against a benchmark return of ${pct1(v.rb)}, with a tracking error of ${pct1(v.te)}. The information ratio is closest to:`,
    answer: (v) => (v.rp - v.rb) / v.te,
    format: (x) => num(x),
    correctWhy: "Divides active return by active risk.",
    distractors: [
      { value: (v) => v.rp / v.te, why: "Divides the total return, not the active return, by tracking error." },
      { value: (v) => v.te / (v.rp - v.rb), why: "Inverts the ratio." },
    ],
    solution: (v) => `IR = active return / tracking error = (${pct1(v.rp)} - ${pct1(v.rb)}) / ${pct1(v.te)} = ${num((v.rp - v.rb) / v.te)}.`,
    keystrokes: (v) => `${num(v.rp - v.rb, 1)} [÷] ${v.te} [=]`,
  }),
  numericVariant({
    key: "pc-capm-premium",
    topicId: "09",
    losCode: "LOS 41.d",
    trap: "Portfolio Risk and Return: Part II (CAPM & SML)",
    error: "FORMULA_SCALAR",
    inputs: (r) => ({ beta: pick(r, [0.6, 0.7, 0.8, 0.9, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6]), rf: between(r, 2, 5, 0.5), mrp: between(r, 4, 8, 0.5) }),
    example: { beta: 1.2, rf: 3, mrp: 6 },
    stem: (v) => `A portfolio has a beta of ${num(v.beta, 1)}. The risk-free rate is ${num(v.rf, 1).replace(".0", "")}% and the market risk premium is ${num(v.mrp, 1).replace(".0", "")}%. Its expected return under the CAPM is closest to:`,
    answer: (v) => v.rf + v.beta * v.mrp,
    format: pct1,
    correctWhy: "Adds beta times the market risk premium to the risk-free rate.",
    distractors: [
      { value: (v) => v.beta * (v.rf + v.mrp), why: (v) => `Multiplies beta by the market return (${pct1(v.rf + v.mrp)}) and omits the risk-free rate.` },
      { value: (v) => v.rf + v.mrp, why: "Ignores beta, which is the market's expected return." },
    ],
    solution: (v) => `E(R) = ${pct1(v.rf)} + ${num(v.beta, 1)} × ${pct1(v.mrp)} = ${pct1(v.rf + v.beta * v.mrp)}.`,
    keystrokes: (v) => `${v.rf} [+] ${num(v.beta, 1)} [×] ${v.mrp} [=]`,
  }),
];

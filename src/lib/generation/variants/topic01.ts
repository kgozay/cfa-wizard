import { between, money, num, pct, pick } from "../format";
import { numericVariant } from "./dsl";

const ann = (pmt: number, r: number, n: number) => (pmt * (1 - Math.pow(1 + r, -n))) / r;
const fvAnn = (pmt: number, r: number, n: number) => (pmt * (Math.pow(1 + r, n) - 1)) / r;
const normCdf = (z: number) => {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989422804014327 * Math.exp((-z * z) / 2);
  const p = d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return z >= 0 ? 1 - p : p;
};
const irr = (flows: number[]) => {
  const npv = (r: number) => flows.reduce((s, cf, t) => s + cf / Math.pow(1 + r, t), 0);
  let lo = -0.99;
  let hi = 10;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (Math.sign(npv(mid)) === Math.sign(npv(lo))) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
};

const COMPOUNDING = [
  [12, "monthly"],
  [4, "quarterly"],
  [2, "semiannually"],
] as const;

export const TOPIC_01_VARIANTS = [
  numericVariant({
    key: "quant-ear",
    topicId: "01",
    losCode: "LOS 1.b",
    trap: "Effective Annual Rate Compounding Periodicity",
    error: "PERIODICITY_MISMATCH",
    inputs: (r) => ({ rate: between(r, 4, 12, 0.1), comp: pick(r, COMPOUNDING) }),
    example: { rate: 8.4, comp: COMPOUNDING[0] },
    stem: (v) => `A corporate bond quotes a stated annual rate of ${pct(v.rate)} compounded ${v.comp[1]}. Its effective annual rate (EAR) is closest to:`,
    answer: (v) => (Math.pow(1 + v.rate / 100 / v.comp[0], v.comp[0]) - 1) * 100,
    format: (x) => pct(x, 3),
    correctWhy: (v) => `(1 + ${num(v.rate / 100, 4)} / ${v.comp[0]})^${v.comp[0]} - 1 captures intra-year compounding.`,
    distractors: [
      { value: (v) => v.rate, why: "Treats the stated rate as the effective rate, ignoring intra-year compounding." },
      { value: (v) => (Math.exp(v.rate / 100) - 1) * 100, why: "Applies continuous compounding (e^r - 1), although the rate compounds a set number of times a year." },
    ],
    solution: (v) => `EAR = (1 + r_s / m)^m - 1 = (1 + ${num(v.rate / 100, 4)} / ${v.comp[0]})^${v.comp[0]} - 1 = ${pct((Math.pow(1 + v.rate / 100 / v.comp[0], v.comp[0]) - 1) * 100, 3)}.`,
    keystrokes: (v) => `[2nd][ICONV] NOM = ${v.rate} [ENTER] [↓][↓] C/Y = ${v.comp[0]} [ENTER] [↑] [CPT] EFF`,
  }),
  numericVariant({
    key: "quant-annuity-due-pv",
    topicId: "01",
    losCode: "LOS 2.d",
    trap: "Annuity Due Mode Timing Trap ([BGN] vs [END])",
    error: "BA2_MODE",
    inputs: (r) => ({ pmt: between(r, 10000, 90000, 5000), rate: between(r, 3, 9, 0.25), n: between(r, 4, 12, 1) }),
    example: { pmt: 50000, rate: 6.5, n: 6 },
    stem: (v) => `An endowment pays a grant of ${money(v.pmt)} at the beginning of each year for ${v.n} years, with the first grant paid today. At an annual discount rate of ${pct(v.rate)}, the present value of the grants is closest to:`,
    answer: (v) => ann(v.pmt, v.rate / 100, v.n) * (1 + v.rate / 100),
    format: (x) => money(x),
    correctWhy: "The first payment is today, so the annuity is valued in [BGN] mode.",
    distractors: [
      { value: (v) => ann(v.pmt, v.rate / 100, v.n), why: "Values the grants as an ordinary annuity ([END] mode), so every payment is discounted one period too many." },
      { value: (v) => ann(v.pmt, v.rate / 100, v.n) * (1 + v.rate / 100) ** 2, why: "Multiplies the ordinary annuity by (1 + r)^2, over-adjusting for timing." },
    ],
    solution: (v) => `PV(ordinary) = ${money(v.pmt)} × [1 - (1 + ${num(v.rate / 100, 4)})^-${v.n}] / ${num(v.rate / 100, 4)} = ${money(ann(v.pmt, v.rate / 100, v.n))}. PV(due) = PV(ordinary) × ${num(1 + v.rate / 100, 4)} = ${money(ann(v.pmt, v.rate / 100, v.n) * (1 + v.rate / 100))}.`,
    keystrokes: (v) => `[2nd][BGN][2nd][SET] N = ${v.n}, I/Y = ${v.rate}, PMT = ${v.pmt}, FV = 0 -> [CPT] PV`,
  }),
  numericVariant({
    key: "quant-bayes",
    topicId: "01",
    losCode: "LOS 4.d",
    trap: "Bayes' Formula Conditional Inversion",
    error: "CONCEPTUAL_CONFUSION",
    inputs: (r) => ({ prior: between(r, 0.15, 0.45, 0.05), hit: between(r, 0.6, 0.9, 0.05), falseHit: between(r, 0.05, 0.25, 0.05) }),
    example: { prior: 0.3, hit: 0.8, falseHit: 0.15 },
    stem: (v) => `An analyst estimates a ${num(v.prior * 100, 0)}% probability of recession. In a recession, a company cuts its dividend with probability ${num(v.hit * 100, 0)}%; without a recession, the probability is ${num(v.falseHit * 100, 0)}%. If the company cuts its dividend, the probability of recession is closest to:`,
    answer: (v) => ((v.prior * v.hit) / (v.prior * v.hit + (1 - v.prior) * v.falseHit)) * 100,
    format: (x) => pct(x, 1),
    correctWhy: "Divides the joint probability of recession and a cut by the total probability of a cut.",
    distractors: [
      { value: (v) => v.prior * v.hit * 100, why: "Reports the joint probability of recession and a cut without dividing by the total probability of a cut." },
      { value: (v) => v.hit * 100, why: "Confuses P(cut | recession) with P(recession | cut)." },
    ],
    solution: (v) => {
      const joint = v.prior * v.hit;
      const total = joint + (1 - v.prior) * v.falseHit;
      return `P(cut) = ${num(v.prior, 2)} × ${num(v.hit, 2)} + ${num(1 - v.prior, 2)} × ${num(v.falseHit, 2)} = ${num(total, 4)}. P(recession | cut) = ${num(joint, 4)} / ${num(total, 4)} = ${pct((joint / total) * 100, 1)}.`;
    },
    keystrokes: (v) => `${v.prior} [×] ${v.hit} [=] [STO] 1; ${num(1 - v.prior, 2)} [×] ${v.falseHit} [+] [RCL] 1 [=] [STO] 2; [RCL] 1 [÷] [RCL] 2 [=]`,
  }),
  numericVariant({
    key: "quant-mean-t-test",
    topicId: "01",
    losCode: "LOS 6.c",
    trap: "Hypothesis Testing Critical Region & Decision Rule",
    error: "FORMULA_SCALAR",
    inputs: (r) => {
      const [n, critical] = pick(r, [[16, 2.131], [25, 2.064], [36, 2.03], [49, 2.011], [64, 1.998]] as const);
      return { n, critical, mean: between(r, 0.6, 1.8, 0.05), s: between(r, 1.5, 3, 0.1), mu0: between(r, 0.2, 0.6, 0.05) };
    },
    example: { n: 25, critical: 2.064, mean: 1.2, s: 2, mu0: 0.5 },
    stem: (v) => `A sample of ${v.n} monthly fund returns has a mean of ${pct(v.mean)} and a standard deviation of ${pct(v.s)}. The analyst tests H_0: μ = ${pct(v.mu0)} against H_a: μ ≠ ${pct(v.mu0)} at the 5% level (two-tailed critical t = ${num(v.critical, 3)} with ${v.n - 1} df). The test statistic and conclusion are:`,
    answer: (v) => (v.mean - v.mu0) / (v.s / Math.sqrt(v.n)),
    format: (x, v) => `t = ${num(x)}; ${Math.abs(x) > v.critical ? "Reject" : "Fail to reject"} H_0`,
    correctWhy: "Divides the difference from the hypothesised mean by the standard error and compares it with the critical value.",
    distractors: [
      {
        value: (v) => v.critical,
        text: (x, v) => `t = ${num(x, 3)}; ${Math.abs((v.mean - v.mu0) / (v.s / Math.sqrt(v.n))) > v.critical ? "Reject" : "Fail to reject"} H_0`,
        why: "Reports the critical value as if it were the test statistic.",
      },
      {
        value: (v) => (v.mean - v.mu0) / (v.s / Math.sqrt(v.n)),
        text: (x, v) => `t = ${num(x)}; ${Math.abs(x) > v.critical ? "Fail to reject" : "Reject"} H_0`,
        why: "Computes the statistic correctly but reverses the decision rule.",
      },
    ],
    solution: (v) => {
      const se = v.s / Math.sqrt(v.n);
      const t = (v.mean - v.mu0) / se;
      return `SE = ${num(v.s)} / √${v.n} = ${num(se, 3)}. t = (${num(v.mean)} - ${num(v.mu0)}) / ${num(se, 3)} = ${num(t)}. |t| ${Math.abs(t) > v.critical ? ">" : "<"} ${num(v.critical, 3)}, so ${Math.abs(t) > v.critical ? "reject" : "fail to reject"} H_0.`;
    },
    keystrokes: (v) => `(${v.mean} [-] ${v.mu0}) [÷] (${v.s} [÷] ${v.n} [√x]) [=]`,
  }),
  numericVariant({
    key: "quant-r-squared",
    topicId: "01",
    losCode: "LOS 7.c",
    trap: "R-squared vs. Unexplained Variation (SSE/SST)",
    error: "SIGN_INVERSION",
    inputs: (r) => {
      const sst = between(r, 200, 900, 50);
      return { sst, sse: Math.round(sst * between(r, 0.15, 0.45, 0.05)) };
    },
    example: { sst: 400, sse: 140 },
    stem: (v) => `In a simple linear regression of a stock's returns on the market, the total sum of squares (SST) is ${v.sst} and the sum of squared errors (SSE) is ${v.sse}. The coefficient of determination (R²) is closest to:`,
    answer: (v) => 1 - v.sse / v.sst,
    format: (x) => num(x, 3),
    correctWhy: "R² = 1 - SSE / SST, the share of variation explained by the regression.",
    distractors: [
      { value: (v) => v.sse / v.sst, why: "Reports the unexplained share (SSE / SST) instead of R²." },
      { value: (v) => Math.sqrt(1 - v.sse / v.sst), why: "Takes the square root of R², which is the absolute correlation." },
    ],
    solution: (v) => `R² = 1 - ${v.sse} / ${v.sst} = ${num(1 - v.sse / v.sst, 3)}.`,
    keystrokes: (v) => `1 [-] ${v.sse} [÷] ${v.sst} [=]`,
  }),
  numericVariant({
    key: "quant-continuous-fv",
    topicId: "01",
    losCode: "LOS 1.c",
    trap: "Continuous vs. Discrete Compounding",
    error: "PERIODICITY_MISMATCH",
    inputs: (r) => ({ pv: between(r, 20000, 200000, 10000), rate: between(r, 3, 9, 0.25), years: between(r, 2, 8, 1) }),
    example: { pv: 100000, rate: 6, years: 3 },
    stem: (v) => `An investment of ${money(v.pv)} earns a stated annual rate of ${pct(v.rate)} compounded continuously for ${v.years} years. Its future value is closest to:`,
    answer: (v) => v.pv * Math.exp((v.rate / 100) * v.years),
    format: (x) => money(x),
    correctWhy: "Continuous compounding grows the investment by e^(rt).",
    distractors: [
      { value: (v) => v.pv * Math.pow(1 + v.rate / 100, v.years), why: "Compounds annually instead of continuously." },
      { value: (v) => v.pv * (1 + (v.rate / 100) * v.years), why: "Applies simple interest." },
    ],
    solution: (v) => `FV = ${money(v.pv)} × e^(${num(v.rate / 100, 4)} × ${v.years}) = ${money(v.pv * Math.exp((v.rate / 100) * v.years))}.`,
    keystrokes: (v) => `${num((v.rate / 100) * v.years, 4)} [2nd][e^x] [×] ${v.pv} [=]`,
  }),
  numericVariant({
    key: "quant-perpetuity",
    topicId: "01",
    losCode: "LOS 2.b",
    trap: "Perpetuity Timing",
    error: "FORMULA_SCALAR",
    inputs: (r) => ({ d: between(r, 2, 12, 0.5), rate: between(r, 4, 10, 0.25) }),
    example: { d: 8, rate: 6.25 },
    stem: (v) => `A preferred stock pays a perpetual annual dividend of ${money(v.d, 2)}, with the first dividend one year from today. At a required return of ${pct(v.rate)}, its value is closest to:`,
    answer: (v) => v.d / (v.rate / 100),
    format: (x) => money(x, 2),
    correctWhy: "A perpetuity starting in one year is worth PMT / r.",
    distractors: [
      { value: (v) => v.d / (v.rate / 100) + v.d, why: "Adds a payment today, treating it as a perpetuity due." },
      { value: (v) => v.d / (v.rate / 100) / (1 + v.rate / 100), why: "Discounts the perpetuity value one extra period." },
    ],
    solution: (v) => `V = ${money(v.d, 2)} / ${num(v.rate / 100, 4)} = ${money(v.d / (v.rate / 100), 2)}.`,
    keystrokes: (v) => `${v.d} [÷] ${num(v.rate / 100, 4)} [=]`,
  }),
  numericVariant({
    key: "quant-geometric-mean",
    topicId: "01",
    losCode: "LOS 3.b",
    trap: "Arithmetic vs. Geometric Mean",
    error: "CONCEPTUAL_CONFUSION",
    inputs: (r) => ({ returns: [between(r, 5, 20, 1), between(r, -15, -2, 1), between(r, 5, 20, 1), between(r, 0, 10, 1)] }),
    example: { returns: [12, -8, 15, 5] },
    stem: (v) => `Over the past 4 years, a fund returned ${v.returns.map((x) => `${x >= 0 ? "+" : ""}${num(x, 1)}%`).join(", ")}. The geometric mean annual return is closest to:`,
    answer: (v) => (Math.pow(v.returns.reduce((p, x) => p * (1 + x / 100), 1), 0.25) - 1) * 100,
    format: (x) => pct(x),
    correctWhy: "Compounds the four returns and takes the fourth root.",
    distractors: [
      { value: (v) => v.returns.reduce((s, x) => s + x, 0) / 4, why: "Takes the arithmetic mean, which overstates compound growth." },
      { value: (v) => (v.returns.reduce((p, x) => p * (1 + x / 100), 1) - 1) * 100, why: "Reports the cumulative 4-year return instead of the annual geometric mean." },
    ],
    solution: (v) => {
      const factor = v.returns.reduce((p, x) => p * (1 + x / 100), 1);
      return `Growth factor = ${v.returns.map((x) => num(1 + x / 100, 2)).join(" × ")} = ${num(factor, 6)}. Geometric mean = ${num(factor, 6)}^(1/4) - 1 = ${pct((Math.pow(factor, 0.25) - 1) * 100)}.`;
    },
    keystrokes: () => "Multiply the growth factors [y^x] 0.25 [-] 1 [=]",
  }),
  numericVariant({
    key: "quant-sample-variance",
    topicId: "01",
    losCode: "LOS 3.c",
    trap: "Sample vs Population Variance Degrees of Freedom",
    error: "FORMULA_SCALAR",
    inputs: (r) => {
      const start = between(r, 2, 6, 1);
      const step = between(r, 2, 5, 1);
      return { xs: [0, 1, 2, 3, 4].map((i) => start + i * step) };
    },
    example: { xs: [4, 8, 12, 16, 20] },
    stem: (v) => `A sample of 5 fund returns is ${v.xs.map((x) => `${x}%`).join(", ")}. The sample variance is closest to:`,
    answer: (v) => {
      const m = v.xs.reduce((a, b) => a + b, 0) / 5;
      return v.xs.reduce((a, x) => a + (x - m) ** 2, 0) / 4;
    },
    format: (x) => `${num(x, 1)} (%^2)`,
    correctWhy: "Divides the sum of squared deviations by n - 1.",
    distractors: [
      {
        value: (v) => {
          const m = v.xs.reduce((a, b) => a + b, 0) / 5;
          return v.xs.reduce((a, x) => a + (x - m) ** 2, 0) / 5;
        },
        why: "Divides by n, which gives the population variance.",
      },
      {
        value: (v) => {
          const m = v.xs.reduce((a, b) => a + b, 0) / 5;
          return Math.sqrt(v.xs.reduce((a, x) => a + (x - m) ** 2, 0) / 4);
        },
        text: (x) => `${num(x)} (%)`,
        why: "Reports the sample standard deviation instead of the variance.",
      },
    ],
    solution: (v) => {
      const m = v.xs.reduce((a, b) => a + b, 0) / 5;
      const ss = v.xs.reduce((a, x) => a + (x - m) ** 2, 0);
      return `Mean = ${num(m, 1)}%. Sum of squared deviations = ${num(ss, 1)}. s² = ${num(ss, 1)} / 4 = ${num(ss / 4, 1)}.`;
    },
    keystrokes: () => "[2nd][DATA] enter X values -> [2nd][STAT] -> Sx -> [x²]",
  }),
  numericVariant({
    key: "quant-chebyshev",
    topicId: "01",
    losCode: "LOS 3.d",
    trap: "Chebyshev's Inequality vs. Normal Distribution",
    error: "FORMULA_SCALAR",
    inputs: (r) => ({ k: pick(r, [1.5, 1.75, 2, 2.25, 2.5, 3, 3.5, 4] as const) as number }),
    example: { k: 2.5 },
    stem: (v) => `According to Chebyshev's inequality, the minimum share of observations that must lie within ${num(v.k, 2)} standard deviations of the mean, for any distribution, is closest to:`,
    answer: (v) => (1 - 1 / v.k ** 2) * 100,
    format: (x) => pct(x, 1),
    correctWhy: "Applies 1 - 1/k².",
    distractors: [
      { value: (v) => (1 - 1 / (v.k + 0.5) ** 2) * 100, why: "Uses k plus half a standard deviation." },
      { value: (v) => (normCdf(v.k) - normCdf(-v.k)) * 100, why: "Applies the normal distribution, which is far less conservative than Chebyshev's bound." },
    ],
    solution: (v) => `1 - 1 / ${num(v.k, 2)}² = ${pct((1 - 1 / v.k ** 2) * 100, 1)}.`,
    keystrokes: (v) => `1 [-] ${v.k} [x²] [1/x] [=]`,
  }),
  numericVariant({
    key: "quant-two-asset-sd",
    topicId: "01",
    losCode: "LOS 5.b",
    trap: "Portfolio Mathematics & Covariance",
    error: "FORMULA_SCALAR",
    inputs: (r) => ({ w: between(r, 0.3, 0.7, 0.1), s1: between(r, 10, 20, 1), s2: between(r, 20, 35, 1), rho: between(r, -0.5, 0.6, 0.1) }),
    example: { w: 0.6, s1: 15, s2: 25, rho: 0.2 },
    stem: (v) => `A portfolio holds ${num(v.w * 100, 0)}% in Asset 1 (σ = ${v.s1}%) and ${num((1 - v.w) * 100, 0)}% in Asset 2 (σ = ${v.s2}%). The correlation between them is ${num(v.rho, 2)}. The portfolio standard deviation is closest to:`,
    answer: (v) => Math.sqrt((v.w * v.s1) ** 2 + ((1 - v.w) * v.s2) ** 2 + 2 * v.w * (1 - v.w) * v.rho * v.s1 * v.s2),
    format: (x) => pct(x),
    correctWhy: "Includes both variance terms and the covariance term.",
    distractors: [
      { value: (v) => Math.sqrt((v.w * v.s1) ** 2 + ((1 - v.w) * v.s2) ** 2), why: "Drops the covariance term, which assumes zero correlation." },
      { value: (v) => v.w * v.s1 + (1 - v.w) * v.s2, why: "Takes the weighted average of the standard deviations, which assumes perfect correlation." },
    ],
    solution: (v) => {
      const variance = (v.w * v.s1) ** 2 + ((1 - v.w) * v.s2) ** 2 + 2 * v.w * (1 - v.w) * v.rho * v.s1 * v.s2;
      return `σp² = (${num(v.w, 1)} × ${v.s1})² + (${num(1 - v.w, 1)} × ${v.s2})² + 2(${num(v.w, 1)})(${num(1 - v.w, 1)})(${num(v.rho, 2)})(${v.s1})(${v.s2}) = ${num(variance, 2)}. σp = ${pct(Math.sqrt(variance))}.`;
    },
    keystrokes: () => "Sum the three variance terms [=] [√x]",
  }),
  numericVariant({
    key: "quant-slope-t",
    topicId: "01",
    losCode: "LOS 7.d",
    trap: "Regression Slope Test Degrees of Freedom",
    error: "FORMULA_SCALAR",
    inputs: (r) => ({ b: between(r, 0.6, 2, 0.05), se: between(r, 0.15, 0.5, 0.05), n: between(r, 20, 60, 2) }),
    example: { b: 1.4, se: 0.35, n: 32 },
    stem: (v) => `A simple linear regression with n = ${v.n} observations estimates a slope of ${num(v.b)} with a standard error of ${num(v.se)}. The t-statistic for H_0: b_1 = 0 is closest to:`,
    answer: (v) => v.b / v.se,
    format: (x, v) => `${num(x)} with ${v.n - 2} degrees of freedom`,
    correctWhy: "Divides the slope by its standard error; a slope test has n - 2 degrees of freedom.",
    distractors: [
      { value: (v) => v.b / v.se, text: (x, v) => `${num(x)} with ${v.n - 1} degrees of freedom`, why: "Uses n - 1 degrees of freedom, which applies to a test of a single mean." },
      { value: (v) => v.se / v.b, text: (x, v) => `${num(x)} with ${v.n - 2} degrees of freedom`, why: "Inverts the ratio." },
    ],
    solution: (v) => `t = ${num(v.b)} / ${num(v.se)} = ${num(v.b / v.se)}, with ${v.n} - 2 = ${v.n - 2} degrees of freedom.`,
    keystrokes: (v) => `${v.b} [÷] ${v.se} [=]`,
  }),
  numericVariant({
    key: "quant-f-stat",
    topicId: "01",
    losCode: "LOS 7.e",
    trap: "ANOVA Mean Squares",
    error: "FORMULA_SCALAR",
    inputs: (r) => ({ ssr: between(r, 100, 400, 10), sse: between(r, 40, 120, 5), n: between(r, 20, 40, 2) }),
    example: { ssr: 180, sse: 60, n: 22 },
    stem: (v) => `In a simple linear regression with n = ${v.n}, the regression sum of squares is ${v.ssr} and the sum of squared errors is ${v.sse}. The F-statistic is closest to:`,
    answer: (v) => v.ssr / (v.sse / (v.n - 2)),
    format: (x) => num(x),
    correctWhy: "F = MSR / MSE, with MSE = SSE / (n - 2).",
    distractors: [
      { value: (v) => v.ssr / v.sse, why: "Divides the sums of squares without dividing SSE by its degrees of freedom." },
      { value: (v) => v.ssr / (v.sse / v.n), why: "Divides SSE by n instead of n - 2." },
    ],
    solution: (v) => `MSR = ${v.ssr} / 1. MSE = ${v.sse} / ${v.n - 2} = ${num(v.sse / (v.n - 2), 3)}. F = ${num(v.ssr / (v.sse / (v.n - 2)))}.`,
    keystrokes: (v) => `${v.ssr} [÷] (${v.sse} [÷] ${v.n - 2}) [=]`,
  }),
  numericVariant({
    key: "quant-periodic-fv",
    topicId: "01",
    losCode: "LOS 1.c",
    trap: "Compounding Frequency in Future Value",
    error: "PERIODICITY_MISMATCH",
    inputs: (r) => ({ pv: between(r, 10000, 90000, 5000), rate: between(r, 3, 9, 0.25), years: between(r, 3, 10, 1) }),
    example: { pv: 25000, rate: 5, years: 4 },
    stem: (v) => `An investor deposits ${money(v.pv)} at a stated annual rate of ${pct(v.rate)} compounded quarterly. The value after ${v.years} years is closest to:`,
    answer: (v) => v.pv * Math.pow(1 + v.rate / 400, 4 * v.years),
    format: (x) => money(x),
    correctWhy: "Compounds quarterly at r/4 for 4 × N periods.",
    distractors: [
      { value: (v) => v.pv * (1 + (v.rate / 100) * v.years), why: "Applies simple interest." },
      { value: (v) => v.pv * Math.pow(1 + v.rate / 100, v.years), why: "Compounds annually, ignoring quarterly compounding." },
    ],
    solution: (v) => `FV = ${money(v.pv)} × (1 + ${num(v.rate / 400, 5)})^${4 * v.years} = ${money(v.pv * Math.pow(1 + v.rate / 400, 4 * v.years))}.`,
    keystrokes: (v) => `N = ${4 * v.years}, I/Y = ${num(v.rate / 4, 4)}, PV = -${v.pv}, PMT = 0 -> [CPT] FV`,
  }),
  numericVariant({
    key: "quant-loan-payment",
    topicId: "01",
    losCode: "LOS 2.d",
    trap: "Annuity Timing Convention (BGN vs. END Mode)",
    error: "BA2_MODE",
    inputs: (r) => ({ pv: between(r, 50000, 400000, 10000), rate: between(r, 3, 9, 0.25), n: between(r, 3, 10, 1) }),
    example: { pv: 200000, rate: 6, n: 5 },
    stem: (v) => `A ${money(v.pv)} loan at ${pct(v.rate)} annual interest is repaid with ${v.n} equal annual payments, the first due one year from today. The annual payment is closest to:`,
    answer: (v) => (v.pv * (v.rate / 100)) / (1 - Math.pow(1 + v.rate / 100, -v.n)),
    format: (x) => money(x),
    correctWhy: "Payments at the end of each year form an ordinary annuity.",
    distractors: [
      { value: (v) => (v.pv * (v.rate / 100)) / (1 - Math.pow(1 + v.rate / 100, -v.n)) / (1 + v.rate / 100), why: "Solves in [BGN] mode, as if the first payment were due today." },
      { value: (v) => v.pv / v.n, why: "Ignores interest and divides the principal by the number of payments." },
    ],
    solution: (v) => `PMT = ${money(v.pv)} × ${num(v.rate / 100, 4)} / [1 - ${num(1 + v.rate / 100, 4)}^-${v.n}] = ${money((v.pv * (v.rate / 100)) / (1 - Math.pow(1 + v.rate / 100, -v.n)))}.`,
    keystrokes: (v) => `[END] N = ${v.n}, I/Y = ${v.rate}, PV = ${v.pv}, FV = 0 -> [CPT] PMT`,
  }),
  numericVariant({
    key: "quant-hpr",
    topicId: "01",
    losCode: "LOS 1.a",
    trap: "Total Return Omitting Income",
    error: "FORMULA_SCALAR",
    inputs: (r) => {
      const p0 = between(r, 20, 80, 1);
      return { p0, d: between(r, 0.5, 3, 0.25), p1: p0 + between(r, 1, 8, 0.5) };
    },
    example: { p0: 40, d: 1.5, p1: 43 },
    stem: (v) => `An investor buys a share for ${money(v.p0, 2)}, receives a ${money(v.d, 2)} dividend during the year and sells the share at year-end for ${money(v.p1, 2)}. The holding period return is closest to:`,
    answer: (v) => ((v.p1 - v.p0 + v.d) / v.p0) * 100,
    format: (x) => pct(x),
    correctWhy: "Includes both the price gain and the dividend.",
    distractors: [
      { value: (v) => ((v.p1 - v.p0) / v.p0) * 100, why: "Counts only the price change and omits the dividend." },
      { value: (v) => (v.d / v.p0) * 100, why: "Counts only the dividend yield." },
    ],
    solution: (v) => `HPR = (${num(v.p1, 2)} - ${num(v.p0, 2)} + ${num(v.d, 2)}) / ${num(v.p0, 2)} = ${pct(((v.p1 - v.p0 + v.d) / v.p0) * 100)}.`,
    keystrokes: (v) => `(${v.p1} [-] ${v.p0} [+] ${v.d}) [÷] ${v.p0} [=]`,
  }),
  numericVariant({
    key: "quant-correlation",
    topicId: "01",
    losCode: "LOS 4.b",
    trap: "Covariance to Correlation Standardization",
    error: "FORMULA_SCALAR",
    inputs: (r) => {
      const sx = between(r, 0.1, 0.3, 0.05);
      const sy = between(r, 0.15, 0.35, 0.05);
      return { sx, sy, cov: Number((sx * sy * between(r, 0.05, 0.9, 0.05)).toFixed(5)) };
    },
    example: { sx: 0.2, sy: 0.3, cov: 0.0048 },
    stem: (v) => `The covariance between the returns of Asset X and Asset Y is ${v.cov}. The standard deviation of X is ${num(v.sx * 100, 0)}% and of Y is ${num(v.sy * 100, 0)}%. The correlation between the two assets is closest to:`,
    answer: (v) => v.cov / (v.sx * v.sy),
    format: (x) => num(x, 3),
    correctWhy: "Divides the covariance by the product of the two standard deviations.",
    distractors: [
      { value: (v) => v.cov / v.sx, why: "Divides by only one standard deviation." },
      { value: (v) => v.cov / (v.sx + v.sy), why: "Divides by the sum rather than the product of the standard deviations." },
    ],
    solution: (v) => `ρ = ${v.cov} / (${num(v.sx, 2)} × ${num(v.sy, 2)}) = ${num(v.cov / (v.sx * v.sy), 3)}.`,
    keystrokes: (v) => `${v.cov} [÷] (${v.sx} [×] ${v.sy}) [=]`,
  }),
  numericVariant({
    key: "quant-discrete-sd",
    topicId: "01",
    losCode: "LOS 4.a",
    trap: "Variance vs. Standard Deviation",
    error: "FORMULA_SCALAR",
    inputs: (r) => ({
      probs: pick(r, [[0.5, 0.3, 0.2], [0.4, 0.4, 0.2], [0.3, 0.5, 0.2], [0.6, 0.25, 0.15]] as const) as readonly number[],
      outcomes: [between(r, 8, 18, 1), between(r, 2, 7, 1), between(r, -12, -3, 1)],
    }),
    example: { probs: [0.5, 0.3, 0.2], outcomes: [10, 4, -6] },
    stem: (v) => `A portfolio returns ${v.outcomes[0]}% with probability ${v.probs[0]}, ${v.outcomes[1]}% with probability ${v.probs[1]}, and ${v.outcomes[2]}% with probability ${v.probs[2]}. The standard deviation of its return is closest to:`,
    answer: (v) => {
      const m = v.outcomes.reduce((s, x, i) => s + x * v.probs[i], 0);
      return Math.sqrt(v.outcomes.reduce((s, x, i) => s + v.probs[i] * (x - m) ** 2, 0));
    },
    format: (x) => pct(x),
    correctWhy: "Takes the square root of the probability-weighted squared deviations.",
    distractors: [
      { value: (v) => v.outcomes.reduce((s, x, i) => s + x * v.probs[i], 0), why: "Reports the expected return, not its dispersion." },
      {
        value: (v) => {
          const m = v.outcomes.reduce((s, x, i) => s + x * v.probs[i], 0);
          return v.outcomes.reduce((s, x, i) => s + v.probs[i] * (x - m) ** 2, 0);
        },
        why: "Reports the variance (in %²) and forgets to take the square root.",
      },
    ],
    solution: (v) => {
      const m = v.outcomes.reduce((s, x, i) => s + x * v.probs[i], 0);
      const variance = v.outcomes.reduce((s, x, i) => s + v.probs[i] * (x - m) ** 2, 0);
      return `E(R) = ${num(m)}%. Variance = ${num(variance)} (%²). σ = ${pct(Math.sqrt(variance))}.`;
    },
    keystrokes: () => "Weight each squared deviation by its probability, sum, then [√x]",
  }),
  numericVariant({
    key: "quant-z",
    topicId: "01",
    losCode: "LOS 5.c",
    trap: "One-Tailed vs. Two-Tailed Normal Probability",
    error: "CONCEPTUAL_CONFUSION",
    inputs: (r) => ({ mean: between(r, 4, 12, 1), sd: between(r, 8, 20, 1), k: 2 }),
    example: { mean: 8, sd: 12, k: 2 },
    stem: (v) => `Annual returns are normally distributed with a mean of ${v.mean}% and a standard deviation of ${v.sd}%. The probability of a return below ${v.mean - v.k * v.sd}% in a given year is closest to:`,
    answer: (v) => normCdf(-v.k) * 100,
    format: (x) => pct(x, 1),
    correctWhy: "The threshold is two standard deviations below the mean: a single lower tail.",
    distractors: [
      { value: (v) => 2 * normCdf(-v.k) * 100, why: "Counts both tails." },
      { value: () => normCdf(-1) * 100, why: "Uses the one-standard-deviation tail probability." },
    ],
    solution: (v) => `z = (${v.mean - v.k * v.sd} - ${v.mean}) / ${v.sd} = -${v.k}. P(Z < -${v.k}) ≈ ${pct(normCdf(-v.k) * 100, 1)}.`,
    keystrokes: (v) => `(${v.mean - v.k * v.sd} [-] ${v.mean}) [÷] ${v.sd} [=] -> z-table`,
  }),
  numericVariant({
    key: "quant-regression-prediction",
    topicId: "01",
    losCode: "LOS 7.f",
    trap: "Regression Prediction Omitting Intercept",
    error: "FORMULA_SCALAR",
    inputs: (r) => ({ b0: between(r, 0.2, 1, 0.1), b1: between(r, 0.6, 1.6, 0.1), x: between(r, 2, 6, 0.5) }),
    example: { b0: 0.5, b1: 1.2, x: 4 },
    stem: (v) => `A regression of a stock's monthly return on the market return has an intercept of ${pct(v.b0)} and a slope of ${num(v.b1)}. If the market returns ${pct(v.x)} next month, the predicted stock return is closest to:`,
    answer: (v) => v.b0 + v.b1 * v.x,
    format: (x) => pct(x),
    correctWhy: "Adds the intercept to the slope times the forecast X.",
    distractors: [
      { value: (v) => v.b1 * v.x, why: "Omits the intercept." },
      { value: (v) => v.b0 + v.b1, why: "Adds the coefficients without using the forecast value of X." },
    ],
    solution: (v) => `Ŷ = ${num(v.b0)} + ${num(v.b1)} × ${num(v.x)} = ${pct(v.b0 + v.b1 * v.x)}.`,
    keystrokes: (v) => `${v.b0} [+] ${v.b1} [×] ${v.x} [=]`,
  }),
  numericVariant({
    key: "quant-standard-error",
    topicId: "01",
    losCode: "LOS 6.a",
    trap: "Standard Error Uses √n",
    error: "FORMULA_SCALAR",
    inputs: (r) => ({ sigma: between(r, 8, 30, 1), n: pick(r, [16, 25, 36, 49, 64, 81, 100] as const) as number }),
    example: { sigma: 18, n: 36 },
    stem: (v) => `A random sample of ${v.n} funds is drawn from a population whose returns have a known standard deviation of ${v.sigma}%. The standard error of the sample mean is closest to:`,
    answer: (v) => v.sigma / Math.sqrt(v.n),
    format: (x) => pct(x),
    correctWhy: "Divides the population standard deviation by √n.",
    distractors: [
      { value: (v) => v.sigma / v.n, why: "Divides by n instead of √n." },
      { value: (v) => v.sigma, why: "Confuses the population standard deviation with the standard error." },
    ],
    solution: (v) => `σ_x̄ = ${v.sigma}% / √${v.n} = ${pct(v.sigma / Math.sqrt(v.n))}.`,
    keystrokes: (v) => `${v.sigma} [÷] ${v.n} [√x] [=]`,
  }),
  numericVariant({
    key: "quant-mwr",
    topicId: "01",
    losCode: "LOS 1.d",
    trap: "Money-Weighted vs. Time-Weighted Return",
    error: "CONCEPTUAL_CONFUSION",
    inputs: (r) => {
      const p0 = between(r, 40, 120, 5);
      const p1 = p0 * between(r, 1.02, 1.15, 0.01);
      return { p0, p1: Number(p1.toFixed(2)), p2: Number((p1 * between(r, 1.02, 1.15, 0.01)).toFixed(2)) };
    },
    example: { p0: 100, p1: 110, p2: 120 },
    stem: (v) => `An investor buys one share for ${money(v.p0, 2)} at t = 0 and a second share for ${money(v.p1, 2)} at t = 1. No dividends are paid, and both shares are sold for ${money(v.p2, 2)} each at t = 2. The investor's annual money-weighted rate of return is closest to:`,
    answer: (v) => irr([-v.p0, -v.p1, 2 * v.p2]) * 100,
    format: (x) => pct(x),
    correctWhy: "Solves for the IRR of the investor's own cash flows.",
    distractors: [
      { value: (v) => (Math.sqrt((v.p1 / v.p0) * (v.p2 / v.p1)) - 1) * 100, why: "Reports the time-weighted return, which ignores the size and timing of contributions." },
      { value: (v) => ((2 * v.p2 - v.p0 - v.p1) / (v.p0 + v.p1)) * 100, why: "Divides the total gain by the total invested, ignoring timing and annualisation." },
    ],
    solution: (v) => `CF0 = -${num(v.p0, 2)}, CF1 = -${num(v.p1, 2)}, CF2 = +${num(2 * v.p2, 2)}. IRR = ${pct(irr([-v.p0, -v.p1, 2 * v.p2]) * 100)}.`,
    keystrokes: (v) => `[CF] CF0 = -${v.p0}, C01 = -${v.p1}, C02 = ${num(2 * v.p2, 2)} -> [IRR] [CPT]`,
  }),
  numericVariant({
    key: "quant-twr",
    topicId: "01",
    losCode: "LOS 1.d",
    trap: "Time-Weighted Return Around External Cash Flows",
    error: "CONCEPTUAL_CONFUSION",
    inputs: (r) => {
      const v0 = between(r, 50000, 200000, 10000);
      const v1 = Math.round(v0 * between(r, 1.03, 1.15, 0.01));
      const dep = Math.round(v0 * between(r, 0.1, 0.3, 0.02));
      return { v0, v1, dep, v2: Math.round((v1 + dep) * between(r, 0.95, 1.1, 0.01)) };
    },
    example: { v0: 100000, v1: 110000, dep: 22000, v2: 126000 },
    stem: (v) => `A portfolio is worth ${money(v.v0)} at the start of Year 1 and ${money(v.v1)} at the end of Year 1, just before the client deposits ${money(v.dep)}. At the end of Year 2 it is worth ${money(v.v2)}. The annualized time-weighted return over the two years is closest to:`,
    answer: (v) => (Math.sqrt((v.v1 / v.v0) * (v.v2 / (v.v1 + v.dep))) - 1) * 100,
    format: (x) => pct(x),
    correctWhy: "Breaks the period at the deposit and links the sub-period returns geometrically.",
    distractors: [
      { value: (v) => (Math.sqrt((v.v2 - v.dep) / v.v0) - 1) * 100, why: "Subtracts the deposit from the ending value as if it earned nothing." },
      { value: (v) => (Math.sqrt(v.v2 / v.v0) - 1) * 100, why: "Ignores the deposit and treats the whole increase as investment return." },
    ],
    solution: (v) => `Year 1 = ${pct((v.v1 / v.v0 - 1) * 100)}; Year 2 = ${pct((v.v2 / (v.v1 + v.dep) - 1) * 100)}. TWR = [(${num(v.v1 / v.v0, 4)})(${num(v.v2 / (v.v1 + v.dep), 4)})]^(1/2) - 1.`,
    keystrokes: () => "Link sub-period growth factors [=] [√x] [-] 1 [=]",
  }),
  numericVariant({
    key: "quant-annualize",
    topicId: "01",
    losCode: "LOS 1.c",
    trap: "Annualizing Short-Horizon Returns",
    error: "PERIODICITY_MISMATCH",
    inputs: (r) => ({ ret: between(r, 1, 4, 0.1), days: pick(r, [45, 60, 100, 120, 150] as const) as number }),
    example: { ret: 2.5, days: 100 },
    stem: (v) => `An investment earns ${pct(v.ret, 1)} over ${v.days} days. Using a 365-day year, its annualized return is closest to:`,
    answer: (v) => (Math.pow(1 + v.ret / 100, 365 / v.days) - 1) * 100,
    format: (x) => pct(x),
    correctWhy: (v) => `Compounds the ${v.days}-day return ${num(365 / v.days, 2)} times a year.`,
    distractors: [
      { value: (v) => (v.ret * 365) / v.days, why: "Scales the return linearly and ignores compounding." },
      { value: (v) => v.ret, why: "Reports the holding period return without annualising it." },
    ],
    solution: (v) => `(1 + ${num(v.ret / 100, 4)})^(365/${v.days}) - 1 = ${pct((Math.pow(1 + v.ret / 100, 365 / v.days) - 1) * 100)}.`,
    keystrokes: (v) => `${num(1 + v.ret / 100, 4)} [y^x] (365 [÷] ${v.days}) [-] 1 [=]`,
  }),
  numericVariant({
    key: "quant-real-return",
    topicId: "01",
    losCode: "LOS 1.b",
    trap: "Real vs. Nominal Return",
    error: "SIGN_INVERSION",
    inputs: (r) => ({ nominal: between(r, 4, 14, 0.5), inflation: between(r, 1.5, 6, 0.5) }),
    example: { nominal: 8, inflation: 3 },
    stem: (v) => `A fund earns a nominal return of ${pct(v.nominal, 1)} in a year when inflation is ${pct(v.inflation, 1)}. Its real return is closest to:`,
    answer: (v) => ((1 + v.nominal / 100) / (1 + v.inflation / 100) - 1) * 100,
    format: (x) => pct(x),
    correctWhy: "Divides the nominal growth factor by the inflation factor.",
    distractors: [
      { value: (v) => v.nominal - v.inflation, why: "Uses the additive approximation, which overstates the real return." },
      { value: (v) => v.nominal + v.inflation, why: "Adds inflation instead of removing it." },
    ],
    solution: (v) => `(1 + real) = ${num(1 + v.nominal / 100, 4)} / ${num(1 + v.inflation / 100, 4)}, so real = ${pct(((1 + v.nominal / 100) / (1 + v.inflation / 100) - 1) * 100)}.`,
    keystrokes: (v) => `${num(1 + v.nominal / 100, 4)} [÷] ${num(1 + v.inflation / 100, 4)} [-] 1 [=]`,
  }),
  numericVariant({
    key: "quant-annuity-due-fv",
    topicId: "01",
    losCode: "LOS 2.c",
    trap: "Annuity Timing Convention (BGN vs. END Mode)",
    error: "BA2_MODE",
    inputs: (r) => ({ pmt: between(r, 2000, 15000, 500), rate: between(r, 3, 9, 0.5), n: between(r, 5, 20, 1) }),
    example: { pmt: 5000, rate: 6, n: 10 },
    stem: (v) => `An investor deposits ${money(v.pmt)} at the beginning of each year for ${v.n} years into an account earning ${pct(v.rate, 1)} a year. The balance at the end of Year ${v.n} is closest to:`,
    answer: (v) => fvAnn(v.pmt, v.rate / 100, v.n) * (1 + v.rate / 100),
    format: (x) => money(x),
    correctWhy: "Beginning-of-year deposits earn an extra year of interest ([BGN] mode).",
    distractors: [
      { value: (v) => fvAnn(v.pmt, v.rate / 100, v.n), why: "Values the deposits as an ordinary annuity in [END] mode." },
      { value: (v) => v.pmt * v.n, why: "Adds the deposits without interest." },
    ],
    solution: (v) => `FV(ordinary) = ${money(fvAnn(v.pmt, v.rate / 100, v.n), 2)}; FV(due) = × ${num(1 + v.rate / 100, 3)} = ${money(fvAnn(v.pmt, v.rate / 100, v.n) * (1 + v.rate / 100), 2)}.`,
    keystrokes: (v) => `[BGN] N = ${v.n}, I/Y = ${v.rate}, PV = 0, PMT = -${v.pmt} -> [CPT] FV`,
  }),
  numericVariant({
    key: "quant-retirement",
    topicId: "01",
    losCode: "LOS 2.e",
    trap: "Multi-Stage Retirement Funding",
    error: "FORMULA_SCALAR",
    inputs: (r) => ({ w: between(r, 30000, 90000, 5000), years: between(r, 15, 25, 1), saving: between(r, 15, 30, 1), rate: between(r, 4, 7, 0.5) }),
    example: { w: 60000, years: 20, saving: 25, rate: 5 },
    stem: (v) => `A client wants to withdraw ${money(v.w)} at the end of each year for ${v.years} years of retirement, starting ${v.saving + 1} years from today. She will make ${v.saving} equal annual deposits, the first one year from today. At ${pct(v.rate, 1)} a year throughout, each deposit is closest to:`,
    answer: (v) => (ann(v.w, v.rate / 100, v.years) * (v.rate / 100)) / (Math.pow(1 + v.rate / 100, v.saving) - 1),
    format: (x) => money(x),
    correctWhy: "Discounts the withdrawals to the retirement date, then finds the deposit that compounds to that amount.",
    distractors: [
      { value: (v) => (v.w * v.years) / v.saving, why: "Ignores interest entirely." },
      { value: (v) => ann(v.w, v.rate / 100, v.years) / v.saving, why: "Finds the amount needed but lets the deposits earn nothing." },
    ],
    solution: (v) => `Needed at t = ${v.saving}: ${money(ann(v.w, v.rate / 100, v.years))}. Deposit = that × ${num(v.rate / 100, 3)} / (${num(1 + v.rate / 100, 3)}^${v.saving} - 1).`,
    keystrokes: (v) => `N = ${v.years}, I/Y = ${v.rate}, PMT = ${v.w} -> [CPT] PV; then N = ${v.saving}, FV = PV -> [CPT] PMT`,
  }),
  numericVariant({
    key: "quant-cagr",
    topicId: "01",
    losCode: "LOS 2.e",
    trap: "Implied Compound Growth Rate",
    error: "FORMULA_SCALAR",
    inputs: (r) => {
      const start = between(r, 0.8, 3, 0.1);
      return { start, end: Number((start * between(r, 1.2, 2, 0.05)).toFixed(2)), years: between(r, 4, 10, 1) };
    },
    example: { start: 1.5, end: 2.2, years: 6 },
    stem: (v) => `A company's dividend per share grew from ${money(v.start, 2)} to ${money(v.end, 2)} over ${v.years} years. The compound annual growth rate is closest to:`,
    answer: (v) => (Math.pow(v.end / v.start, 1 / v.years) - 1) * 100,
    format: (x) => pct(x),
    correctWhy: "Solves for the compound rate that grows the start value to the end value.",
    distractors: [
      { value: (v) => ((v.end / v.start - 1) / v.years) * 100, why: "Divides total growth by the number of years, ignoring compounding." },
      { value: (v) => (v.end / v.start - 1) * 100, why: "Reports the cumulative growth, not the annual rate." },
    ],
    solution: (v) => `g = (${num(v.end, 2)} / ${num(v.start, 2)})^(1/${v.years}) - 1 = ${pct((Math.pow(v.end / v.start, 1 / v.years) - 1) * 100)}.`,
    keystrokes: (v) => `N = ${v.years}, PV = -${v.start}, PMT = 0, FV = ${v.end} -> [CPT] I/Y`,
  }),
  numericVariant({
    key: "quant-ci",
    topicId: "01",
    losCode: "LOS 6.b",
    trap: "Confidence Interval Uses the Standard Error",
    error: "FORMULA_SCALAR",
    inputs: (r) => ({ n: pick(r, [36, 49, 64, 100] as const) as number, mean: between(r, 0.5, 1.5, 0.1), s: between(r, 1.5, 3.5, 0.1) }),
    example: { n: 36, mean: 1.1, s: 2.4 },
    stem: (v) => `A sample of ${v.n} monthly returns has a mean of ${pct(v.mean, 1)} and a standard deviation of ${pct(v.s, 1)}. Using a reliability factor of 1.96, the 95% confidence interval for the population mean is closest to:`,
    answer: (v) => 1.96 * (v.s / Math.sqrt(v.n)),
    format: (x, v) => `${pct(v.mean - x)} to ${pct(v.mean + x)}`,
    correctWhy: "Builds the interval as the mean ± 1.96 standard errors.",
    distractors: [
      { value: (v) => 1.96 * v.s, why: "Uses the standard deviation instead of the standard error." },
      { value: (v) => 1.645 * (v.s / Math.sqrt(v.n)), why: "Uses the 90% reliability factor." },
    ],
    solution: (v) => `SE = ${num(v.s, 1)} / √${v.n} = ${num(v.s / Math.sqrt(v.n), 3)}. Interval = ${num(v.mean, 1)} ± 1.96 × ${num(v.s / Math.sqrt(v.n), 3)}.`,
    keystrokes: (v) => `${v.s} [÷] ${v.n} [√x] [=] [×] 1.96 [=]`,
  }),
  numericVariant({
    key: "quant-corr-test",
    topicId: "01",
    losCode: "LOS 6.e",
    trap: "Testing the Significance of a Correlation",
    error: "FORMULA_SCALAR",
    inputs: (r) => {
      const [n, critical] = pick(r, [[22, 2.086], [30, 2.048], [42, 2.021], [62, 2.0]] as const);
      return { n, critical, rho: between(r, 0.15, 0.55, 0.01) };
    },
    example: { n: 30, critical: 2.048, rho: 0.35 },
    stem: (v) => `The sample correlation between two return series over ${v.n} months is ${num(v.rho)}. An analyst tests H_0: ρ = 0 against H_a: ρ ≠ 0 at the 5% level (critical t = ${num(v.critical, 3)} for ${v.n - 2} df). The test statistic and conclusion are:`,
    answer: (v) => (v.rho * Math.sqrt(v.n - 2)) / Math.sqrt(1 - v.rho ** 2),
    format: (x, v) => `t = ${num(x)}; ${x > v.critical ? "reject" : "fail to reject"} H_0`,
    correctWhy: "Computes t = r√(n - 2) / √(1 - r²) and compares it with the critical value.",
    distractors: [
      {
        value: (v) => v.rho * Math.sqrt(v.n),
        text: (x, v) => `t = ${num(x)}; ${(v.rho * Math.sqrt(v.n - 2)) / Math.sqrt(1 - v.rho ** 2) > v.critical ? "fail to reject" : "reject"} H_0`,
        why: "Uses √n and omits the (1 - r²) adjustment.",
      },
      {
        value: (v) => v.rho * Math.sqrt(v.n - 2),
        text: (x, v) => `t = ${num(x)}; ${(v.rho * Math.sqrt(v.n - 2)) / Math.sqrt(1 - v.rho ** 2) > v.critical ? "fail to reject" : "reject"} H_0`,
        why: "Omits the √(1 - r²) denominator.",
      },
    ],
    solution: (v) => `t = ${num(v.rho)} × √${v.n - 2} / √(1 - ${num(v.rho)}²) = ${num((v.rho * Math.sqrt(v.n - 2)) / Math.sqrt(1 - v.rho ** 2))}.`,
    keystrokes: (v) => `${v.rho} [×] ${v.n - 2} [√x] [=] [÷] (1 [-] ${v.rho} [x²]) [√x] [=]`,
  }),
  numericVariant({
    key: "quant-see",
    topicId: "01",
    losCode: "LOS 7.e",
    trap: "Standard Error of the Estimate",
    error: "FORMULA_SCALAR",
    inputs: (r) => ({ n: between(r, 18, 40, 2), sse: between(r, 30, 150, 5) }),
    example: { n: 22, sse: 60 },
    stem: (v) => `A simple linear regression with ${v.n} observations has a sum of squared errors (SSE) of ${v.sse}. The standard error of the estimate is closest to:`,
    answer: (v) => Math.sqrt(v.sse / (v.n - 2)),
    format: (x) => num(x),
    correctWhy: "Takes the square root of SSE / (n - 2).",
    distractors: [
      { value: (v) => Math.sqrt(v.sse / v.n), why: "Divides SSE by n instead of n - 2." },
      { value: (v) => v.sse / (v.n - 2), why: "Reports the mean squared error without taking the square root." },
    ],
    solution: (v) => `SEE = √(${v.sse} / ${v.n - 2}) = ${num(Math.sqrt(v.sse / (v.n - 2)))}.`,
    keystrokes: (v) => `${v.sse} [÷] ${v.n - 2} [=] [√x]`,
  }),
  numericVariant({
    key: "quant-regression-intercept",
    topicId: "01",
    losCode: "LOS 7.b",
    trap: "Regression Coefficient Estimation",
    error: "FORMULA_SCALAR",
    inputs: (r) => ({ cov: between(r, 0.0015, 0.004, 0.0005), varX: between(r, 0.0015, 0.003, 0.0005), my: between(r, 0.6, 1.4, 0.1), mx: between(r, 0.4, 1, 0.1) }),
    example: { cov: 0.003, varX: 0.0025, my: 1, mx: 0.8 },
    stem: (v) => `The covariance between a stock's monthly returns (Y) and the market's (X) is ${v.cov}, and the variance of the market's returns is ${v.varX}. The mean returns are ${pct(v.my, 1)} for the stock and ${pct(v.mx, 1)} for the market. The estimated intercept is closest to:`,
    answer: (v) => v.my - (v.cov / v.varX) * v.mx,
    format: (x) => pct(x),
    correctWhy: "Estimates the slope as Cov / Var, then sets the line through the means.",
    distractors: [
      { value: (v) => v.my - (v.varX / v.cov) * v.mx, why: "Inverts the slope before computing the intercept." },
      { value: (v) => v.my - v.mx, why: "Subtracts the market mean without multiplying by the slope." },
    ],
    solution: (v) => `b1 = ${v.cov} / ${v.varX} = ${num(v.cov / v.varX, 3)}. b0 = ${num(v.my, 1)} - ${num(v.cov / v.varX, 3)} × ${num(v.mx, 1)} = ${pct(v.my - (v.cov / v.varX) * v.mx)}.`,
    keystrokes: (v) => `${v.cov} [÷] ${v.varX} [=] [×] ${v.mx} [=] [+/-] [+] ${v.my} [=]`,
  }),
  numericVariant({
    key: "quant-continuous-return",
    topicId: "01",
    losCode: "LOS 1.c",
    trap: "Continuous vs. Discrete Return",
    error: "FORMULA_SCALAR",
    inputs: (r) => {
      const p0 = between(r, 20, 100, 1);
      return { p0, p1: Number((p0 * between(r, 1.04, 1.3, 0.01)).toFixed(2)) };
    },
    example: { p0: 50, p1: 56 },
    stem: (v) => `A stock's price rises from ${money(v.p0, 2)} to ${money(v.p1, 2)} over one year with no dividends. Its continuously compounded return is closest to:`,
    answer: (v) => Math.log(v.p1 / v.p0) * 100,
    format: (x) => pct(x),
    correctWhy: "Takes the natural log of the price relative.",
    distractors: [
      { value: (v) => (v.p1 / v.p0 - 1) * 100, why: "Reports the discrete holding period return." },
      { value: (v) => (Math.exp(v.p1 / v.p0 - 1) - 1) * 100, why: "Applies e^r - 1 to the discrete return, converting in the wrong direction." },
    ],
    solution: (v) => `ln(${num(v.p1, 2)} / ${num(v.p0, 2)}) = ${pct(Math.log(v.p1 / v.p0) * 100)}.`,
    keystrokes: (v) => `${v.p1} [÷] ${v.p0} [=] [LN]`,
  }),
  numericVariant({
    key: "quant-uneven-pv",
    topicId: "01",
    losCode: "LOS 2.a",
    trap: "Discounting Uneven Cash Flows",
    error: "PERIODICITY_MISMATCH",
    inputs: (r) => ({ cfs: [between(r, 500, 2000, 100), between(r, 1000, 3000, 100), between(r, 2000, 4000, 100)], rate: between(r, 5, 10, 0.5) }),
    example: { cfs: [1000, 2000, 3000], rate: 8 },
    stem: (v) => `An investment pays ${money(v.cfs[0])} in one year, ${money(v.cfs[1])} in two years and ${money(v.cfs[2])} in three years. At a ${pct(v.rate, 1)} discount rate, its present value is closest to:`,
    answer: (v) => v.cfs.reduce((s, cf, i) => s + cf / Math.pow(1 + v.rate / 100, i + 1), 0),
    format: (x) => money(x),
    correctWhy: "Discounts each cash flow for its own number of periods.",
    distractors: [
      { value: (v) => v.cfs.reduce((s, cf) => s + cf, 0) / Math.pow(1 + v.rate / 100, 3), why: "Discounts the total as if everything arrived at the end." },
      { value: (v) => v.cfs.reduce((s, cf) => s + cf, 0) / (1 + v.rate / 100), why: "Discounts the total by only one period." },
    ],
    solution: (v) => `PV = ${v.cfs.map((cf, i) => `${cf}/${num(1 + v.rate / 100, 3)}^${i + 1}`).join(" + ")} = ${money(v.cfs.reduce((s, cf, i) => s + cf / Math.pow(1 + v.rate / 100, i + 1), 0))}.`,
    keystrokes: (v) => `[CF] C01 = ${v.cfs[0]}, C02 = ${v.cfs[1]}, C03 = ${v.cfs[2]} -> [NPV] I = ${v.rate} [CPT]`,
  }),
  numericVariant({
    key: "quant-sample-covariance",
    topicId: "01",
    losCode: "LOS 4.b",
    trap: "Sample Covariance Degrees of Freedom",
    error: "FORMULA_SCALAR",
    inputs: (r) => ({ xs: [between(r, 0, 4, 1), between(r, 3, 7, 1), between(r, 6, 10, 1)], ys: [between(r, 1, 5, 1), between(r, 5, 9, 1), between(r, 7, 12, 1)] }),
    example: { xs: [2, 4, 6], ys: [3, 7, 8] },
    stem: (v) => `Over three years, Stock X returned ${v.xs.map((x) => `${x}%`).join(", ")} and Stock Y returned ${v.ys.map((y) => `${y}%`).join(", ")}. The sample covariance of their returns (in %²) is closest to:`,
    answer: (v) => {
      const mx = v.xs.reduce((a, b) => a + b, 0) / 3;
      const my = v.ys.reduce((a, b) => a + b, 0) / 3;
      return v.xs.reduce((s, x, i) => s + (x - mx) * (v.ys[i] - my), 0) / 2;
    },
    format: (x) => num(x),
    correctWhy: "Divides the sum of cross-deviations by n - 1.",
    distractors: [
      {
        value: (v) => {
          const mx = v.xs.reduce((a, b) => a + b, 0) / 3;
          const my = v.ys.reduce((a, b) => a + b, 0) / 3;
          return v.xs.reduce((s, x, i) => s + (x - mx) * (v.ys[i] - my), 0) / 3;
        },
        why: "Divides by n, giving the population covariance.",
      },
      {
        value: (v) => {
          const mx = v.xs.reduce((a, b) => a + b, 0) / 3;
          const my = v.ys.reduce((a, b) => a + b, 0) / 3;
          const cov = v.xs.reduce((s, x, i) => s + (x - mx) * (v.ys[i] - my), 0) / 2;
          const sx = Math.sqrt(v.xs.reduce((s, x) => s + (x - mx) ** 2, 0) / 2);
          const sy = Math.sqrt(v.ys.reduce((s, y) => s + (y - my) ** 2, 0) / 2);
          return cov / (sx * sy);
        },
        text: (x) => num(x, 3),
        why: "Reports the correlation coefficient instead of the covariance.",
      },
    ],
    solution: () => "Compute the means, sum the products of the paired deviations, and divide by n - 1.",
    keystrokes: () => "Σ(x - x̄)(y - ȳ) [÷] (n [-] 1) [=]",
  }),
];

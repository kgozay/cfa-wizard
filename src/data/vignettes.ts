import { VignetteSet } from "@/types/cfa";

export const CFA_VIGNETTES: VignetteSet[] = [
  // ==========================================
  // TOPIC 01: Quantitative Methods (15 Questions)
  // ==========================================
  {
    id: "vignette-01-quant",
    topicId: "01",
    topicName: "Quantitative Methods",
    subReading: "Rates & Returns, TVM, Statistical Concepts, Bayes' Formula & Regression",
    difficulty: "High Trap",
    vignetteStem: "An institutional asset management analyst is constructing benchmark return forecasts, executing rate compounding conversions, assessing retirement endowment cash flows, and evaluating multi-asset regressions against a historical benchmark.",
    questions: [
      {
        id: 101,
        losCode: "LOS 1.b",
        stem: "A corporate bond quotes a stated nominal annual rate of 8.40% compounded monthly. What is the Effective Annual Rate (EAR)?",
        options: {
          A: "8.400%",
          B: "8.731%",
          C: "8.765%"
        },
        correctOption: "B",
        algebraicSolution: "EAR = (1 + r_s / m)^m - 1 = (1 + 0.084 / 12)^12 - 1 = (1.007)^12 - 1 = 8.7311% ~ 8.731%.",
        calculatorKeystrokes: "[2nd][ICONV] -> NOM = 8.40 [ENTER] -> [↓][↓] -> C/Y = 12 [ENTER] -> [↑] -> [CPT] EFF => 8.731%",
        trapCategory: "Effective Annual Rate Compounding Periodicity",
        errorModeDefault: "PERIODICITY_MISMATCH",
        distractorAutopsy: {
          A: "Distractor A ignores intra-year compounding (treating stated rate equal to effective rate).",
          B: "CORRECT: Accurately applies (1 + 0.084/12)^12 - 1 = 8.731%.",
          C: "Distractor C assumes daily continuous compounding e^0.084 - 1 = 8.765%."
        }
      },
      {
        id: 102,
        losCode: "LOS 2.d",
        stem: "An endowment fund commits to paying an immediate grant of $50,000 at the beginning of each year for 6 years (t = 0, 1, 2, 3, 4, 5). If the annual discount rate is 6.50%, the present value of this annuity due is closest to:",
        options: {
          A: "$241,986",
          B: "$257,715",
          C: "$274,466"
        },
        correctOption: "B",
        algebraicSolution: "PV(Ordinary) = $50,000 * [(1 - (1.065)^-6) / 0.065] = $241,986.08. PV(Annuity Due) = PV(Ordinary) * (1 + 0.065) = $257,715.18.",
        calculatorKeystrokes: "[2nd][BGN][2nd][SET][2nd][QUIT] -> [N] = 6 -> [I/Y] = 6.50 -> [PMT] = 50000 -> [FV] = 0 -> [CPT][PV] => -257,715.18",
        trapCategory: "Annuity Due Mode Timing Trap ([BGN] vs [END])",
        errorModeDefault: "BA2_MODE",
        distractorAutopsy: {
          A: "Distractor A is the classic ordinary annuity value computed in [END] mode ($241,986).",
          B: "CORRECT: Accurately calculates present value in [BGN] mode ($257,715).",
          C: "Distractor C multiplies by (1 + r)^2, over-adjusting compounding periods."
        }
      },
      {
        id: 103,
        losCode: "LOS 4.d",
        stem: "An equity analyst estimates a 30% prior probability of recession. In a recession, Company X has an 80% probability of cutting its dividend; without a recession, the probability is only 15%. If Company X cuts its dividend, what is the posterior probability P(Recession | Cut)?",
        options: {
          A: "59.5%",
          B: "69.6%",
          C: "80.0%"
        },
        correctOption: "B",
        algebraicSolution: "Total P(Cut) = (0.30 * 0.80) + (0.70 * 0.15) = 0.24 + 0.105 = 0.345. P(Recession | Cut) = 0.24 / 0.345 = 69.57% ~ 69.6%.",
        calculatorKeystrokes: "0.30 [\\times] 0.80 [=] 0.24 [STO] 1 -> 0.70 [\\times] 0.15 [+] [RCL] 1 [=] 0.345 [STO] 2 -> [RCL] 1 [\\div] [RCL] 2 [=] 0.6957",
        trapCategory: "Probability Trees and Conditional Expectations",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "Distractor A erroneously misweights unconditional dividend cut probabilities.",
          B: "CORRECT: Applies Bayes' formula: P(A|B) = [P(B|A)*P(A)] / P(B) = 0.24 / 0.345 = 69.6%.",
          C: "Distractor C confuses conditional P(Cut | Recession) = 80% with posterior P(Recession | Cut)."
        }
      },
      {
        id: 104,
        losCode: "LOS 6.c",
        stem: "A sample of 25 monthly mutual fund returns yields a sample mean of 1.20% and sample standard deviation of 2.00%. The analyst tests H_0: μ = 0.50% vs H_a: μ ≠ 0.50% at the 5% significance level (two-tailed critical t = 2.064 with 24 df). The calculated t-statistic and conclusion are:",
        options: {
          A: "t = 1.75; Fail to reject H_0",
          B: "t = 2.064; Fail to reject H_0",
          C: "t = 1.75; Reject H_0"
        },
        correctOption: "A",
        algebraicSolution: "Standard Error = s / sqrt(n) = 2.00% / 5 = 0.40%. Test statistic t = (1.20% - 0.50%) / 0.40% = 1.75. Because |1.75| < 2.064, fail to reject H_0.",
        calculatorKeystrokes: "(1.20 [-] 0.50) [\\div] (2.00 [\\div] 5) [=] 1.75",
        trapCategory: "Hypothesis Testing & Parametric Tests",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "CORRECT: t = 1.75 is within non-rejection region [-2.064, +2.064]; fail to reject H_0.",
          B: "Distractor B confuses calculated test statistic with the critical cutoff.",
          C: "Distractor C makes decision polarity inversion, rejecting null when statistic is inside non-rejection zone."
        }
      },
      {
        id: 105,
        losCode: "LOS 7.c",
        stem: "In a simple linear regression of asset return on the market index, Total Sum of Squares (SST) is 400 and Sum of Squared Errors (SSE) is 140. The coefficient of determination (R-squared) is closest to:",
        options: {
          A: "0.350",
          B: "0.650",
          C: "0.725"
        },
        correctOption: "B",
        algebraicSolution: "Regression Sum of Squares (SSR) = SST - SSE = 400 - 140 = 260. R^2 = SSR / SST = 1 - (SSE / SST) = 1 - 140/400 = 0.65 (65%).",
        calculatorKeystrokes: "1 [-] (140 [\\div] 400) [=] 0.65",
        trapCategory: "Simple Linear Regression",
        errorModeDefault: "SIGN_INVERSION",
        distractorAutopsy: {
          A: "Distractor A calculates unexplained variance ratio (SSE / SST = 0.35) instead of R-squared.",
          B: "CORRECT: R^2 = 1 - (140 / 400) = 0.65.",
          C: "Distractor C computes sqrt(0.65) = 0.806 or misapplies degree of freedom scaling."
        }
      },
      {
        id: 106,
        losCode: "LOS 1.c",
        stem: "An investment of $100,000 earns a stated annual interest rate of 6.00% compounded continuously for 3 years. The future value is closest to:",
        options: {
          A: "$119,102",
          B: "$119,722",
          C: "$120,115"
        },
        correctOption: "B",
        algebraicSolution: "FV = PV * e^(r * t) = $100,000 * e^(0.06 * 3) = $100,000 * e^(0.18) = $100,000 * 1.197217 = $119,721.74 ~ $119,722.",
        calculatorKeystrokes: "0.18 [2nd][e^x] [\\times] 100000 [=] 119,721.74",
        trapCategory: "Effective Annual Rate Compounding Periodicity",
        errorModeDefault: "PERIODICITY_MISMATCH",
        distractorAutopsy: {
          A: "Distractor A uses annual compounding ($100,000 * (1.06)^3 = $119,101.60).",
          B: "CORRECT: Continuous compounding FV = $100,000 * e^(0.18) = $119,722.",
          C: "Distractor C multiplies by (1 + 0.18/3)^3 or applies wrong continuous factor."
        }
      },
      {
        id: 107,
        losCode: "LOS 2.b",
        stem: "A preferred stock pays an annual perpetual dividend of $8.00 per share, with the first dividend payable exactly one year from today. If the required rate of return is 6.25%, the value of the perpetuity is closest to:",
        options: {
          A: "$128.00",
          B: "$136.00",
          C: "$120.47"
        },
        correctOption: "A",
        algebraicSolution: "PV(Perpetuity) = PMT / r = $8.00 / 0.0625 = $128.00.",
        calculatorKeystrokes: "8.00 [\\div] 0.0625 [=] 128.00",
        trapCategory: "Time Value of Money in Finance",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "CORRECT: PV = PMT / r = 8.00 / 0.0625 = $128.00.",
          B: "Distractor B adds one period of dividend ($128 + 8 = $136), treating it as an immediate perpetuity due.",
          C: "Distractor C divides by (1 + r) an extra period."
        }
      },
      {
        id: 108,
        losCode: "LOS 3.b",
        stem: "Over the past 4 years, a hedge fund generated annual returns of +12.0%, -8.0%, +15.0%, and +5.0%. The geometric mean annual compound return is closest to:",
        options: {
          A: "5.63%",
          B: "6.00%",
          C: "5.12%"
        },
        correctOption: "A",
        algebraicSolution: "Compound Return Factor = (1 + 0.12) * (1 - 0.08) * (1 + 0.15) * (1 + 0.05) = 1.12 * 0.92 * 1.15 * 1.05 = 1.244796. Geometric Mean R_G = (1.244796)^(1/4) - 1 = 1.05626 - 1 = 5.63%.",
        calculatorKeystrokes: "1.12 [\\times] 0.92 [\\times] 1.15 [\\times] 1.05 [=] [y^x] 0.25 [-] 1 [=] 0.0563 (5.63%)",
        trapCategory: "Statistical Measures of Asset Returns",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: Geometric Mean = (1.12 * 0.92 * 1.15 * 1.05)^(0.25) - 1 = 5.63%.",
          B: "Distractor B calculates simple arithmetic mean: (12 - 8 + 15 + 5)/4 = 6.00%, which overstates multi-period compounded wealth.",
          C: "Distractor C computes an unweighted harmonic average incorrectly."
        }
      },
      {
        id: 109,
        losCode: "LOS 3.c",
        stem: "A sample of 5 equity mutual fund returns is: 4%, 8%, 12%, 16%, and 20%. The sample variance s^2 is closest to:",
        options: {
          A: "32.0 (%^2)",
          B: "40.0 (%^2)",
          C: "6.32 (%)"
        },
        correctOption: "B",
        algebraicSolution: "Mean = 12%. Deviations squared = (4-12)^2 + (8-12)^2 + (12-12)^2 + (16-12)^2 + (20-12)^2 = 64 + 16 + 0 + 16 + 64 = 160. Sample variance s^2 = 160 / (5 - 1) = 160 / 4 = 40.0.",
        calculatorKeystrokes: "[2nd][DATA] -> X01=4, X02=8, X03=12, X04=16, X05=20 -> [2nd][STAT] -> Read Sx = 6.3245 -> [x^2] => 40.0",
        trapCategory: "Sample vs Population Variance Degrees of Freedom",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "Distractor A divides sum of squares (160) by N = 5 instead of sample degrees of freedom (n - 1 = 4), yielding population variance 32.0.",
          B: "CORRECT: Sample variance divides by n - 1: 160 / 4 = 40.0.",
          C: "Distractor C reports sample standard deviation s = 6.32% rather than variance."
        }
      },
      {
        id: 110,
        losCode: "LOS 3.d",
        stem: "According to Chebyshev's Inequality, for any distribution regardless of shape, the minimum percentage of observations that must lie within 2.5 standard deviations of the mean is closest to:",
        options: {
          A: "84.0%",
          B: "88.9%",
          C: "98.8%"
        },
        correctOption: "A",
        algebraicSolution: "Chebyshev's Inequality: Minimum % = 1 - (1 / k^2). For k = 2.5: 1 - (1 / 2.5^2) = 1 - (1 / 6.25) = 1 - 0.16 = 0.84 = 84.0%.",
        calculatorKeystrokes: "1 [-] (1 [\\div] (2.5 [x^2])) [=] 0.84",
        trapCategory: "Statistical Measures of Asset Returns",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "CORRECT: 1 - 1/(2.5)^2 = 1 - 0.16 = 84.0%.",
          B: "Distractor B calculates for k = 3 standard deviations: 1 - 1/9 = 88.9%.",
          C: "Distractor C uses normal distribution empirical rule approximations."
        }
      },
      {
        id: 111,
        losCode: "LOS 5.b",
        stem: "Portfolio P allocates 60% to Asset 1 (σ_1 = 15%) and 40% to Asset 2 (σ_2 = 25%). If the correlation coefficient between Asset 1 and Asset 2 is +0.20, the portfolio standard deviation σ_p is closest to:",
        options: {
          A: "13.91%",
          B: "15.62%",
          C: "19.00%"
        },
        correctOption: "A",
        algebraicSolution: "σ_p^2 = w1^2*σ1^2 + w2^2*σ2^2 + 2*w1*w2*ρ*σ1*σ2 = (0.60^2 * 15^2) + (0.40^2 * 25^2) + 2*(0.60)*(0.40)*(0.20)*(15)*(25) = (0.36 * 225) + (0.16 * 625) + 36.0 = 81 + 100 + 36 = 193.5. σ_p = sqrt(193.5) = 13.91%.",
        calculatorKeystrokes: "(0.36 [\\times] 225) [+] (0.16 [\\times] 625) [+] (2 [\\times] 0.60 [\\times] 0.40 [\\times] 0.20 [\\times] 15 [\\times] 25) [=] 193.5 [\\sqrt{x}] => 13.91",
        trapCategory: "Portfolio Mathematics & Covariance",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "CORRECT: σ_p = sqrt(81 + 100 + 36) = sqrt(217) or 13.91%.",
          B: "Distractor B forgets the covariance term (sqrt(81 + 100) = 13.45%) or miscalculates weights.",
          C: "Distractor C computes linear weighted average: (0.60 * 15%) + (0.40 * 25%) = 19.00%, ignoring diversification benefits."
        }
      },
      {
        id: 112,
        losCode: "LOS 6.d",
        stem: "An analyst tests a null hypothesis at the 5% significance level (α = 0.05). The computed test statistic yields a p-value of 0.032. The appropriate statistical decision is to:",
        options: {
          A: "Reject the null hypothesis because p-value (0.032) < α (0.05)",
          B: "Fail to reject the null hypothesis because p-value (0.032) < α (0.05)",
          C: "Reject the alternative hypothesis because the test power is below 95%"
        },
        correctOption: "A",
        algebraicSolution: "Decision Rule: Reject H_0 if p-value ≤ α. Because p-value = 0.032 is less than α = 0.05, reject the null hypothesis at the 5% level.",
        calculatorKeystrokes: "Rule: p-value < alpha => Reject H_0.",
        trapCategory: "Hypothesis Testing & Parametric Tests",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: When p-value < significance level α, there is sufficient statistical evidence to reject H_0.",
          B: "Distractor B inverts the p-value decision rule.",
          C: "Distractor C confuses hypothesis testing terminology (we never 'reject the alternative hypothesis')."
        }
      },
      {
        id: 113,
        losCode: "LOS 6.f",
        stem: "In hypothesis testing, a Type I error occurs when the researcher:",
        options: {
          A: "Rejects a true null hypothesis",
          B: "Fails to reject a false null hypothesis",
          C: "Selects a test with power equal to 1 - α"
        },
        correctOption: "A",
        algebraicSolution: "Type I Error (probability = α, significance level) = rejecting a true null hypothesis. Type II Error (probability = β) = failing to reject a false null hypothesis. Power of a test = 1 - β.",
        calculatorKeystrokes: "Conceptual Rule: Type I Error = False Positive (Reject true H_0).",
        trapCategory: "Hypothesis Testing & Parametric Tests",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: Type I Error is rejecting a true null hypothesis (probability = α).",
          B: "Distractor B defines a Type II error (failing to reject a false null hypothesis).",
          C: "Distractor C defines power incorrectly (Power = 1 - β, not 1 - α)."
        }
      },
      {
        id: 114,
        losCode: "LOS 7.d",
        stem: "In a simple linear regression with n = 32 observations, the estimated slope coefficient is b_1 = 1.40 with a standard error s_b1 = 0.35. The t-statistic for testing H_0: b_1 = 0 vs H_a: b_1 ≠ 0 is closest to:",
        options: {
          A: "4.00 with 30 degrees of freedom",
          B: "4.00 with 31 degrees of freedom",
          C: "0.25 with 30 degrees of freedom"
        },
        correctOption: "A",
        algebraicSolution: "t-statistic = (b_1 - 0) / s_b1 = 1.40 / 0.35 = 4.00. Degrees of freedom for simple linear regression slope test = n - 2 = 32 - 2 = 30 df.",
        calculatorKeystrokes: "1.40 [\\div] 0.35 [=] 4.00; df = 32 [-] 2 = 30",
        trapCategory: "Simple Linear Regression",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "CORRECT: t = 1.40 / 0.35 = 4.00 with n - 2 = 30 degrees of freedom.",
          B: "Distractor B uses n - 1 = 31 df, which applies to sample mean t-tests, not regression slope tests (which estimate 2 parameters: intercept and slope).",
          C: "Distractor C inverts the ratio (0.35 / 1.40 = 0.25)."
        }
      },
      {
        id: 115,
        losCode: "LOS 7.e",
        stem: "In an ANOVA table for a simple linear regression, the Regression Sum of Squares (SSR) is 180 and the Sum of Squared Errors (SSE) is 60 with n = 22. The F-statistic for overall regression significance is closest to:",
        options: {
          A: "60.00",
          B: "3.00",
          C: "20.00"
        },
        correctOption: "A",
        algebraicSolution: "MSR = SSR / k = 180 / 1 = 180. MSE = SSE / (n - 2) = 60 / (22 - 2) = 60 / 20 = 3.0. F = MSR / MSE = 180 / 3.0 = 60.0.",
        calculatorKeystrokes: "180 [\\div] (60 [\\div] 20) [=] 60.00",
        trapCategory: "Simple Linear Regression",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "CORRECT: F = (SSR / 1) / [SSE / (n - 2)] = 180 / (60 / 20) = 180 / 3 = 60.00.",
          B: "Distractor B computes SSR / SSE = 180 / 60 = 3.00, forgetting to divide SSE by its degrees of freedom (n - 2 = 20).",
          C: "Distractor C divides by n instead of degrees of freedom."
        }
      }
    ]
  },

  // ==========================================
  // TOPIC 02: Economics (15 Questions)
  // ==========================================
  {
    id: "vignette-02-econ",
    topicId: "02",
    topicName: "Economics",
    subReading: "Elasticity, Market Structures, Macroeconomic Equilibrium, Multipliers & FX Cross-Rates",
    difficulty: "Institutional",
    vignetteStem: "A global macro strategy desk is analyzing price elasticity shocks, monopolistic competition dynamics, fiscal budget multipliers, and currency triangular arbitrage between USD, EUR, GBP, and CHF.",
    questions: [
      {
        id: 201,
        losCode: "LOS 12.c",
        stem: "A dealer quotes the following spot exchange rates:\n• USD/EUR: 1.1200 – 1.1205\n• USD/CHF: 0.9800 – 0.9805\nThe implied CHF/EUR bid cross-rate is closest to:",
        options: {
          A: "1.1423",
          B: "1.1428",
          C: "1.1434"
        },
        correctOption: "A",
        algebraicSolution: "CHF/EUR = (USD/EUR) / (USD/CHF). Bid(CHF/EUR) = Bid(USD/EUR) / Ask(USD/CHF) = 1.1200 / 0.9805 = 1.14227 ~ 1.1423.",
        calculatorKeystrokes: "1.1200 [\\div] 0.9805 [=] 1.14227",
        trapCategory: "Currency Exchange Rates & Cross-Rates",
        errorModeDefault: "PERIODICITY_MISMATCH",
        distractorAutopsy: {
          A: "CORRECT: Matches Bid numerator to Ask denominator for cross-rate bid: 1.1200 / 0.9805 = 1.1423.",
          B: "Distractor B divides Bid by Bid (1.1200 / 0.9800 = 1.14285), violating arbitrage spread rules.",
          C: "Distractor C divides Ask by Ask (1.1205 / 0.9800 = 1.14336), yielding an ask rate rather than bid."
        }
      },
      {
        id: 202,
        losCode: "LOS 9.d",
        stem: "Which characteristic is least likely to describe a firm operating in a monopolistically competitive industry in long-run equilibrium?",
        options: {
          A: "Price equals marginal cost (P = MC)",
          B: "Economic profit is equal to zero",
          C: "Demand curve facing the firm is downward sloping"
        },
        correctOption: "A",
        algebraicSolution: "In monopolistic competition, downward sloping demand means P > MR = MC. Thus P > MC in both short and long run (producing excess capacity). Free entry drives economic profit to zero.",
        calculatorKeystrokes: "Conceptual rule: P = MC occurs ONLY in Perfect Competition.",
        trapCategory: "The Firm and Market Structures",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT (Least Likely): P > MC in monopolistic competition due to product differentiation; P = MC only in perfect competition.",
          B: "Distractor B is true for monopolistic competition in long-run equilibrium due to low barriers to entry.",
          C: "Distractor C is true because product differentiation gives the firm downward-sloping demand."
        }
      },
      {
        id: 203,
        losCode: "LOS 8.b",
        stem: "The price elasticity of demand for a luxury watch is -1.80. If the manufacturer increases price by 5.0%, the percentage change in quantity demanded and total revenue impact are:",
        options: {
          A: "Quantity demanded falls by 9.0%; Total revenue decreases",
          B: "Quantity demanded falls by 9.0%; Total revenue increases",
          C: "Quantity demanded falls by 2.78%; Total revenue increases"
        },
        correctOption: "A",
        algebraicSolution: "%ΔQ = Elasticity * %ΔP = -1.80 * (+5.0%) = -9.0%. Because demand is elastic (|E| = 1.80 > 1), price increase causes percentage drop in quantity to exceed price gain, decreasing total revenue.",
        calculatorKeystrokes: "-1.80 [\\times] 5 [=] -9.00%",
        trapCategory: "Topics in Demand and Supply Analysis",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: %ΔQ = -9.0%. In elastic demand (|E| > 1), price increase reduces total revenue.",
          B: "Distractor B correctly computes %ΔQ = -9.0% but makes the polarity error on total revenue.",
          C: "Distractor C divides percentage price change by elasticity (5.0 / 1.80 = 2.78%)."
        }
      },
      {
        id: 204,
        losCode: "LOS 8.d",
        stem: "If the cross-price elasticity of demand between Good X and Good Y is -0.65, Goods X and Y are classified as:",
        options: {
          A: "Complements",
          B: "Substitutes",
          C: "Inferior goods"
        },
        correctOption: "A",
        algebraicSolution: "Cross-price elasticity < 0 indicates Complements (as price of Y rises, demand for X falls). Cross-price elasticity > 0 indicates Substitutes. Income elasticity < 0 indicates Inferior goods.",
        calculatorKeystrokes: "Rule: Cross-price elasticity < 0 => Complements.",
        trapCategory: "Topics in Demand and Supply Analysis",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: Negative cross-price elasticity defines complementary goods.",
          B: "Distractor B defines substitutes (positive cross-price elasticity).",
          C: "Distractor C confuses cross-price elasticity with negative income elasticity."
        }
      },
      {
        id: 205,
        losCode: "LOS 9.c",
        stem: "In the short run, a perfectly competitive firm will shut down production immediately if the market price falls below:",
        options: {
          A: "Average Variable Cost (AVC)",
          B: "Average Total Cost (ATC)",
          C: "Marginal Cost (MC)"
        },
        correctOption: "A",
        algebraicSolution: "Shutdown Rule: If P < min AVC, the firm cannot cover variable operating costs and loses more than fixed costs by operating; it shuts down immediately in the short run. If min AVC ≤ P < ATC, the firm operates in the short run to cover fixed costs but exits in the long run.",
        calculatorKeystrokes: "Rule: Short-run shutdown occurs when P < min AVC.",
        trapCategory: "The Firm and Market Structures",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: P < min AVC triggers immediate short-run shutdown.",
          B: "Distractor B is the long-run exit threshold (P < ATC).",
          C: "Distractor C is the profit-maximization condition (P = MR = MC)."
        }
      },
      {
        id: 206,
        losCode: "LOS 9.e",
        stem: "Under the kinked demand curve model of oligopoly, the kink in the demand curve causes the firm's marginal revenue (MR) curve to:",
        options: {
          A: "Have a discontinuous vertical gap at the current price/quantity",
          B: "Become perfectly elastic at prices below the current price",
          C: "Shift upward parallel to the marginal cost curve"
        },
        correctOption: "A",
        algebraicSolution: "The kinked demand curve assumes rivals match price cuts (inelastic segment) but do not follow price increases (elastic segment). The abrupt change in slope causes a discontinuous vertical drop/gap in the MR curve, explaining price rigidity.",
        calculatorKeystrokes: "Rule: Kinked demand creates vertical gap in Marginal Revenue curve.",
        trapCategory: "The Firm and Market Structures",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: The slope change in demand creates a discontinuous vertical gap in MR at the kink.",
          B: "Distractor B confuses elasticity changes with vertical discontinuities.",
          C: "Distractor C misinterprets the relationship between MR and MC."
        }
      },
      {
        id: 207,
        losCode: "LOS 10.b",
        stem: "In national income accounting, the fundamental macroeconomic identity equates private domestic savings minus investment (S - I) to:",
        options: {
          A: "Fiscal balance plus trade balance: (G - T) + (X - M)",
          B: "Fiscal balance minus trade balance: (G - T) - (X - M)",
          C: "Total gross domestic product: C + I + G + (X - M)"
        },
        correctOption: "A",
        algebraicSolution: "From GDP = C + I + G + (X - M) and National Income = C + S + T, equating the two yields: (S - I) = (G - T) + (X - M). A fiscal deficit (G > T) must be funded by net private domestic savings (S > I) or a trade deficit (M > X).",
        calculatorKeystrokes: "Identity: (S - I) = (G - T) + (X - M)",
        trapCategory: "Aggregate Output, Prices, and Economic Growth",
        errorModeDefault: "SIGN_INVERSION",
        distractorAutopsy: {
          A: "CORRECT: (S - I) = (G - T) + (X - M).",
          B: "Distractor B inverts the trade balance sign.",
          C: "Distractor C gives the aggregate expenditure definition of GDP."
        }
      },
      {
        id: 208,
        losCode: "LOS 10.e",
        stem: "An economy experiencing stagflation (declining real GDP alongside rising inflation) is most likely caused by a:",
        options: {
          A: "Leftward shift in the Short-Run Aggregate Supply (SRAS) curve",
          B: "Rightward shift in the Aggregate Demand (AD) curve",
          C: "Leftward shift in the Aggregate Demand (AD) curve"
        },
        correctOption: "A",
        algebraicSolution: "Stagflation occurs when adverse supply shocks (e.g. surge in energy/commodity input costs) shift the SRAS curve to the left, reducing real output while increasing the aggregate price level.",
        calculatorKeystrokes: "Concept: Leftward SRAS shift = Lower GDP + Higher Price Level (Stagflation).",
        trapCategory: "Aggregate Output, Prices, and Economic Growth",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: Leftward shift in SRAS drives prices up and GDP down (stagflation).",
          B: "Distractor B causes demand-pull inflation (higher GDP and higher prices).",
          C: "Distractor C causes recessionary disinflation (lower GDP and lower prices)."
        }
      },
      {
        id: 209,
        losCode: "LOS 11.c",
        stem: "If the Marginal Propensity to Consume (MPC) is 0.80 and the marginal tax rate is 25%, the fiscal spending multiplier is closest to:",
        options: {
          A: "2.50",
          B: "5.00",
          C: "1.25"
        },
        correctOption: "A",
        algebraicSolution: "Fiscal Multiplier = 1 / [1 - MPC * (1 - t)] = 1 / [1 - 0.80 * (1 - 0.25)] = 1 / [1 - 0.80 * 0.75] = 1 / [1 - 0.60] = 1 / 0.40 = 2.50.",
        calculatorKeystrokes: "1 [-] (0.80 [\\times] 0.75) [=] 0.40 [1/x] => 2.50",
        trapCategory: "Monetary and Fiscal Policy",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "CORRECT: 1 / [1 - 0.80*(1 - 0.25)] = 1 / 0.40 = 2.50.",
          B: "Distractor B omits the tax rate: 1 / (1 - 0.80) = 5.00.",
          C: "Distractor C computes 1 / (1 + 0.80) or inverts formulas."
        }
      },
      {
        id: 210,
        losCode: "LOS 11.d",
        stem: "If a central bank sets a commercial bank reserve requirement of 8.0%, the theoretical potential money multiplier is closest to:",
        options: {
          A: "12.50",
          B: "8.00",
          C: "1.08"
        },
        correctOption: "A",
        algebraicSolution: "Money Multiplier = 1 / Reserve Requirement = 1 / 0.08 = 12.50.",
        calculatorKeystrokes: "1 [\\div] 0.08 [=] 12.50",
        trapCategory: "Monetary and Fiscal Policy",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "CORRECT: Money Multiplier = 1 / 0.08 = 12.50.",
          B: "Distractor B confuses the reserve ratio (8%) with the multiplier.",
          C: "Distractor C computes 1 + reserve requirement."
        }
      },
      {
        id: 211,
        losCode: "LOS 11.f",
        stem: "According to the Fisher Effect, the nominal interest rate r_nom is approximately equal to:",
        options: {
          A: "Real interest rate + Expected inflation rate",
          B: "Real interest rate - Expected inflation rate",
          C: "Real interest rate / (1 + Expected inflation rate)"
        },
        correctOption: "A",
        algebraicSolution: "Fisher Effect: (1 + r_nom) = (1 + r_real) * (1 + π_e) ≈ r_nom = r_real + E(Inflation). Nominal rates incorporate compensation for expected purchasing power erosion.",
        calculatorKeystrokes: "Concept: Nominal Rate = Real Rate + Expected Inflation.",
        trapCategory: "Monetary and Fiscal Policy",
        errorModeDefault: "SIGN_INVERSION",
        distractorAutopsy: {
          A: "CORRECT: Nominal Rate = Real Rate + Expected Inflation.",
          B: "Distractor B inverts the inflation adjustment sign.",
          C: "Distractor C inverts real rate deflation formulas."
        }
      },
      {
        id: 212,
        losCode: "LOS 12.b",
        stem: "Spot exchange rate quotes are:\n• USD/GBP: 1.3000\n• EUR/GBP: 1.1500\nThe implied USD/EUR spot cross-rate is closest to:",
        options: {
          A: "1.1304",
          B: "1.4950",
          C: "0.8846"
        },
        correctOption: "A",
        algebraicSolution: "USD/EUR = (USD/GBP) / (EUR/GBP) = 1.3000 / 1.1500 = 1.13043 ~ 1.1304.",
        calculatorKeystrokes: "1.3000 [\\div] 1.1500 [=] 1.13043",
        trapCategory: "Currency Exchange Rates & Cross-Rates",
        errorModeDefault: "PERIODICITY_MISMATCH",
        distractorAutopsy: {
          A: "CORRECT: USD/EUR = 1.3000 / 1.1500 = 1.1304.",
          B: "Distractor B multiplies the rates: 1.3000 * 1.1500 = 1.4950.",
          C: "Distractor C calculates the inverse EUR/USD: 1.1500 / 1.3000 = 0.8846."
        }
      },
      {
        id: 213,
        losCode: "LOS 12.d",
        stem: "The spot rate for USD/EUR is 1.1000. The 1-year US risk-free rate is 5.00% and the 1-year Eurozone risk-free rate is 2.00%. According to Covered Interest Rate Parity, the 1-year forward exchange rate F(USD/EUR) is closest to:",
        options: {
          A: "1.1324",
          B: "1.0686",
          C: "1.1000"
        },
        correctOption: "A",
        algebraicSolution: "F(USD/EUR) = S(USD/EUR) * [(1 + r_USD) / (1 + r_EUR)] = 1.1000 * (1.05 / 1.02) = 1.1000 * 1.02941 = 1.13235 ~ 1.1324. The currency with the higher interest rate (USD) trades at a forward discount, meaning EUR trades at a forward premium.",
        calculatorKeystrokes: "1.1000 [\\times] 1.05 [\\div] 1.02 [=] 1.13235",
        trapCategory: "Currency Exchange Rates & Cross-Rates",
        errorModeDefault: "PERIODICITY_MISMATCH",
        distractorAutopsy: {
          A: "CORRECT: F = 1.1000 * (1.05 / 1.02) = 1.1324.",
          B: "Distractor B inverts base and price currency interest rates: 1.1000 * (1.02 / 1.05) = 1.0686.",
          C: "Distractor C assumes forward rate equals spot rate regardless of interest rate differentials."
        }
      },
      {
        id: 214,
        losCode: "LOS 12.e",
        stem: "A currency dealer quotes USD/CAD spot at 1.3500 and 6-month forward points at +45. The outright 6-month forward quote for USD/CAD is closest to:",
        options: {
          A: "1.3545",
          B: "1.3950",
          C: "1.3455"
        },
        correctOption: "A",
        algebraicSolution: "Forward points are quoted in pips (1/10,000 or 0.0001). +45 points = +0.0045. Outright Forward = 1.3500 + 0.0045 = 1.3545.",
        calculatorKeystrokes: "1.3500 [+] 0.0045 [=] 1.3545",
        trapCategory: "Currency Exchange Rates & Cross-Rates",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "CORRECT: 1.3500 + (45 / 10,000) = 1.3545.",
          B: "Distractor B adds 45 as cents (1.3500 + 0.0450 = 1.3950).",
          C: "Distractor C subtracts forward points instead of adding positive points."
        }
      },
      {
        id: 215,
        losCode: "LOS 10.d",
        stem: "Which of the following shifts both the Short-Run Aggregate Supply (SRAS) curve and the Long-Run Aggregate Supply (LRAS) curve to the right?",
        options: {
          A: "An increase in labor productivity and technological advancement",
          B: "A temporary decrease in nominal wage rates",
          C: "An increase in the domestic price level"
        },
        correctOption: "A",
        algebraicSolution: "Factors that expand potential GDP (human capital, labor force growth, technology, productivity) shift both SRAS and LRAS rightward. Temporary wage reductions shift only SRAS rightward. Price level changes represent movement along curves.",
        calculatorKeystrokes: "Concept: Technology & Productivity shift both SRAS and LRAS right.",
        trapCategory: "Aggregate Output, Prices, and Economic Growth",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: Permanent productivity gains shift both potential GDP (LRAS) and short-run supply (SRAS).",
          B: "Distractor B is a temporary input price decrease, shifting only SRAS.",
          C: "Distractor C is an endogenous price movement along the existing supply curve."
        }
      }
    ]
  },

  // ==========================================
  // TOPIC 03: Corporate Finance (15 Questions)
  // ==========================================
  {
    id: "vignette-03-corpfin",
    topicId: "03",
    topicName: "Corporate Finance",
    subReading: "Governance, Capital Budgeting (NPV/IRR), Working Capital & Leverage",
    difficulty: "High Trap",
    vignetteStem: "An industrial manufacturer with a 25% corporate tax rate is evaluating capital allocations, liquidity cash conversion cycles, target WACC components, and operational/financial leverage structures.",
    questions: [
      {
        id: 301,
        losCode: "LOS 16.b",
        stem: "The firm can issue 10-year bonds at an 8.00% yield, preferred shares at 7.00%, and equity at 13.00% under CAPM. The target structure is 40% Debt, 10% Preferred, and 50% Common Equity. Marginal tax rate is 25%. WACC is closest to:",
        options: {
          A: "9.60%",
          B: "10.40%",
          C: "8.90%"
        },
        correctOption: "A",
        algebraicSolution: "After-tax cost of debt = 8.00% * (1 - 0.25) = 6.00%. WACC = (0.40 * 6.00%) + (0.10 * 7.00%) + (0.50 * 13.00%) = 2.40% + 0.70% + 6.50% = 9.60%.",
        calculatorKeystrokes: "0.40 [\\times] 8.00 [\\times] 0.75 [+] 0.10 [\\times] 7.00 [+] 0.50 [\\times] 13.00 [=] 9.60%",
        trapCategory: "WACC After-Tax Cost of Debt Trap",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "CORRECT: 0.40*(6.0%) + 0.10*(7.0%) + 0.50*(13.0%) = 9.60%.",
          B: "Distractor B fails to apply the tax shield to debt: 0.40*(8.0%) + 0.10*(7.0%) + 0.50*(13.0%) = 10.40%.",
          C: "Distractor C erroneously applies the tax shield to preferred dividends."
        }
      },
      {
        id: 302,
        losCode: "LOS 14.b",
        stem: "When evaluating two mutually exclusive projects of differing scales with positive NPVs, Project A has NPV = $5.2M and IRR = 18%, while Project B has NPV = $7.1M and IRR = 14%. At a 10% hurdle rate, the firm should:",
        options: {
          A: "Accept Project A because it provides a higher internal rate of return (18%)",
          B: "Accept Project B because it maximizes total shareholder dollar wealth ($7.1M)",
          C: "Accept both projects because both internal rates of return exceed the hurdle rate"
        },
        correctOption: "B",
        algebraicSolution: "For mutually exclusive projects, the NPV rule always dominates because it assumes reinvestment at the cost of capital (10%) and directly maximizes shareholder wealth. Accept Project B ($7.1M NPV).",
        calculatorKeystrokes: "Decision Rule: NPV dominates IRR for mutually exclusive projects.",
        trapCategory: "Capital Investments & Capital Allocation",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "Distractor A falls for the IRR ranking trap; IRR ignores project scale and assumes reinvestment at 18%.",
          B: "CORRECT: For mutually exclusive projects, maximize NPV ($7.1M > $5.2M).",
          C: "Distractor C ignores that projects are mutually exclusive (cannot accept both)."
        }
      },
      {
        id: 303,
        losCode: "LOS 14.c",
        stem: "An investment requires an initial cash outlay of $2,000,000 and generates expected annual cash inflows of $600,000 for 5 years. If the required rate of return is 10%, the project's Net Present Value (NPV) is closest to:",
        options: {
          A: "$274,472",
          B: "$1,000,000",
          C: "-$274,472"
        },
        correctOption: "A",
        algebraicSolution: "PV(Inflows) = $600,000 * [(1 - (1.10)^-5) / 0.10] = $600,000 * 3.790786 = $2,274,472. NPV = $2,274,472 - $2,000,000 = $274,472.",
        calculatorKeystrokes: "[CF] -> [2nd][CLR WORK] -> CF0 = -2000000 [ENTER] -> C01 = 600000 [ENTER] -> F01 = 5 [ENTER] -> [NPV] -> I = 10 [ENTER] -> [↓] -> [CPT] => 274,471.74",
        trapCategory: "Capital Investments & Capital Allocation",
        errorModeDefault: "SIGN_INVERSION",
        distractorAutopsy: {
          A: "CORRECT: NPV = $2,274,472 - $2,000,000 = $274,472.",
          B: "Distractor B computes undiscounted net cash flows ($600,000 * 5 - $2,000,000 = $1,000,000).",
          C: "Distractor C inverts the initial outlay and inflow signs."
        }
      },
      {
        id: 304,
        losCode: "LOS 14.d",
        stem: "A project has an initial cost of $500,000 and generates a present value of future cash inflows equal to $625,000. The Profitability Index (PI) of the project is closest to:",
        options: {
          A: "1.25",
          B: "0.25",
          C: "0.80"
        },
        correctOption: "A",
        algebraicSolution: "Profitability Index (PI) = PV of Future Cash Inflows / Initial Outlay = $625,000 / $500,000 = 1.25. (Equivalently: 1 + NPV / Initial Outlay = 1 + $125,000 / $500,000 = 1.25).",
        calculatorKeystrokes: "625000 [\\div] 500000 [=] 1.25",
        trapCategory: "Capital Investments & Capital Allocation",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "CORRECT: PI = PV of Inflows / Outlay = 625,000 / 500,000 = 1.25.",
          B: "Distractor B computes NPV / Outlay = 125,000 / 500,000 = 0.25, omitting the base 1.0.",
          C: "Distractor C inverts the ratio (500,000 / 625,000 = 0.80)."
        }
      },
      {
        id: 305,
        losCode: "LOS 15.b",
        stem: "A firm reports: Days Sales Outstanding (DSO) = 45 days, Days of Inventory on Hand (DOH) = 60 days, and Days Payable Outstanding (DPO) = 35 days. The firm's Cash Conversion Cycle (CCC) is closest to:",
        options: {
          A: "70 days",
          B: "140 days",
          C: "105 days"
        },
        correctOption: "A",
        algebraicSolution: "Operating Cycle = DOH + DSO = 60 + 45 = 105 days. Cash Conversion Cycle (CCC) = Operating Cycle - DPO = 105 - 35 = 70 days.",
        calculatorKeystrokes: "60 [+] 45 [-] 35 [=] 70",
        trapCategory: "Working Capital & Liquidity Management",
        errorModeDefault: "SIGN_INVERSION",
        distractorAutopsy: {
          A: "CORRECT: CCC = DOH + DSO - DPO = 60 + 45 - 35 = 70 days.",
          B: "Distractor B adds DPO instead of subtracting it (60 + 45 + 35 = 140 days).",
          C: "Distractor C calculates the Operating Cycle (105 days) without deducting DPO."
        }
      },
      {
        id: 306,
        losCode: "LOS 15.c",
        stem: "A supplier offers credit terms of '2/10 net 30'. Assuming a 365-day year, the annualized effective cost of foregoing the cash discount is closest to:",
        options: {
          A: "44.59%",
          B: "36.50%",
          C: "24.49%"
        },
        correctOption: "A",
        algebraicSolution: "Periodic rate = 2 / (100 - 2) = 2 / 98 = 2.0408%. Compounding periods per year = 365 / (30 - 10) = 365 / 20 = 18.25. EAR = (1 + 0.020408)^18.25 - 1 = (1.020408)^18.25 - 1 = 44.59%.",
        calculatorKeystrokes: "(1 [+] (2 [\\div] 98)) [y^x] (365 [\\div] 20) [-] 1 [=] 0.4459",
        trapCategory: "Working Capital & Liquidity Management",
        errorModeDefault: "PERIODICITY_MISMATCH",
        distractorAutopsy: {
          A: "CORRECT: EAR = [1 + 2/98]^(365/20) - 1 = 44.59%.",
          B: "Distractor B calculates nominal simple interest without compounding: (2/98) * (365/20) = 37.24% or 2% * (365/20) = 36.50%.",
          C: "Distractor C divides 2% by 100 instead of (100 - Discount % = 98)."
        }
      },
      {
        id: 307,
        losCode: "LOS 16.c",
        stem: "A company's preferred stock pays an annual dividend of $4.50 and sells for $60.00 per share. If flotation costs are 4.0% of the market price, the cost of preferred stock is closest to:",
        options: {
          A: "7.81%",
          B: "7.50%",
          C: "7.20%"
        },
        correctOption: "A",
        algebraicSolution: "Net proceeds per preferred share = $60.00 * (1 - 0.04) = $57.60. Cost of Preferred Stock = D_p / P_net = $4.50 / $57.60 = 7.8125% ~ 7.81%.",
        calculatorKeystrokes: "4.50 [\\div] (60 [\\times] 0.96) [=] 0.078125",
        trapCategory: "Cost of Capital & Capital Structure",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "CORRECT: r_p = 4.50 / (60 * 0.96) = 7.81%.",
          B: "Distractor B ignores flotation costs: 4.50 / 60 = 7.50%.",
          C: "Distractor C erroneously applies a corporate tax shield to preferred stock dividends."
        }
      },
      {
        id: 308,
        losCode: "LOS 16.d",
        stem: "Using the Capital Asset Pricing Model (CAPM), if the risk-free rate is 3.50%, market risk premium is 6.00%, and beta is 1.30, the cost of equity is closest to:",
        options: {
          A: "11.30%",
          B: "9.50%",
          C: "7.80%"
        },
        correctOption: "A",
        algebraicSolution: "Cost of Equity = R_f + Beta * [E(R_m) - R_f] = 3.50% + 1.30 * 6.00% = 3.50% + 7.80% = 11.30%.",
        calculatorKeystrokes: "3.50 [+] (1.30 [\\times] 6.00) [=] 11.30%",
        trapCategory: "Cost of Capital & Capital Structure",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "CORRECT: r_e = 3.5% + 1.30 * 6.0% = 11.30%.",
          B: "Distractor B confuses the market risk premium [E(Rm)-Rf] with expected market return E(Rm), computing 3.5 + 1.30*(6.0 - 3.5) = 6.75%.",
          C: "Distractor C forgets to add the risk-free rate (1.30 * 6.0% = 7.80%)."
        }
      },
      {
        id: 309,
        losCode: "LOS 16.e",
        stem: "A firm has sales of $10,000,000, variable costs of $6,000,000, and fixed operating costs of $2,500,000. The firm's Degree of Operating Leverage (DOL) at this sales level is closest to:",
        options: {
          A: "2.67",
          B: "1.60",
          C: "0.63"
        },
        correctOption: "A",
        algebraicSolution: "Contribution Margin = Sales - Variable Costs = $10.0M - $6.0M = $4.0M. Operating Income (EBIT) = $4.0M - $2.5M = $1.5M. DOL = Contribution Margin / EBIT = $4.0M / $1.5M = 2.667 ~ 2.67.",
        calculatorKeystrokes: "(10 - 6) [\\div] (10 - 6 - 2.5) [=] 2.6667",
        trapCategory: "Cost of Capital & Capital Structure",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "CORRECT: DOL = (10 - 6) / (10 - 6 - 2.5) = 4.0 / 1.5 = 2.67.",
          B: "Distractor B computes Sales / Variable Costs = 10 / 6 = 1.67.",
          C: "Distractor C inverts the formula (1.5 / 4.0 = 0.375)."
        }
      },
      {
        id: 310,
        losCode: "LOS 16.f",
        stem: "A firm has operating income (EBIT) of $1,500,000, interest expense of $300,000, and DOL of 2.67. The firm's Degree of Total Leverage (DTL) is closest to:",
        options: {
          A: "3.34",
          B: "1.25",
          C: "2.67"
        },
        correctOption: "A",
        algebraicSolution: "Degree of Financial Leverage (DFL) = EBIT / (EBIT - Interest) = $1.5M / ($1.5M - $0.3M) = $1.5M / $1.2M = 1.25. Degree of Total Leverage (DTL) = DOL * DFL = 2.667 * 1.25 = 3.333 ~ 3.34.",
        calculatorKeystrokes: "2.6667 [\\times] (1.5 [\\div] 1.2) [=] 3.333",
        trapCategory: "Cost of Capital & Capital Structure",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "CORRECT: DTL = DOL * DFL = 2.67 * 1.25 = 3.34.",
          B: "Distractor B reports only the DFL (1.25) rather than total leverage.",
          C: "Distractor C reports only the DOL (2.67)."
        }
      },
      {
        id: 311,
        losCode: "LOS 13.b",
        stem: "Under corporate governance best practices, which of the following board structures is most effective in mitigating principal-agent conflict?",
        options: {
          A: "Separation of CEO and Chairman roles with an independent board majority",
          B: "CEO serving concurrently as Chairman to streamline strategic execution",
          C: "Limiting committee memberships exclusively to executive management"
        },
        correctOption: "A",
        algebraicSolution: "Separating the CEO and Chairman roles and maintaining a majority of independent directors provides rigorous independent oversight over management, directly mitigating agency conflicts between executives and shareholders.",
        calculatorKeystrokes: "Governance Rule: Independent Chair + Independent Board Majority mitigates agency conflict.",
        trapCategory: "Corporate Governance & Conflicts",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: Independent leadership and majority independent directors ensure objective management oversight.",
          B: "Distractor B creates CEO duality, exacerbating self-dealing agency risks.",
          C: "Distractor C compromises committee independence (audit and compensation must be independent)."
        }
      },
      {
        id: 312,
        losCode: "LOS 14.e",
        stem: "An investment project has an initial cash outlay of $100,000 and annual cash flows of $35,000 for 4 years. The payback period of the project is closest to:",
        options: {
          A: "2.86 years",
          B: "3.50 years",
          C: "2.50 years"
        },
        correctOption: "A",
        algebraicSolution: "Payback Period = Initial Outlay / Annual Cash Flow = $100,000 / $35,000 = 2.857 ~ 2.86 years.",
        calculatorKeystrokes: "100000 [\\div] 35000 [=] 2.857",
        trapCategory: "Capital Investments & Capital Allocation",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "CORRECT: Payback = 100,000 / 35,000 = 2.86 years.",
          B: "Distractor B computes 35,000 / 100,000 = 0.35 * 10 = 3.50.",
          C: "Distractor C rounds prematurely."
        }
      },
      {
        id: 313,
        losCode: "LOS 15.d",
        stem: "Which of the following short-term financing instruments is an unsecured promissory note issued by high-credit-rating corporations in the money market?",
        options: {
          A: "Commercial paper",
          B: "Banker's acceptance",
          C: "Revolving credit line"
        },
        correctOption: "A",
        algebraicSolution: "Commercial paper is an unsecured, short-term debt instrument issued by creditworthy corporations to finance working capital obligations. Banker's acceptances are time drafts backed by commercial banks.",
        calculatorKeystrokes: "Concept: Commercial Paper = Unsecured corporate short-term debt.",
        trapCategory: "Working Capital & Liquidity Management",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: Commercial paper is the standard unsecured short-term corporate promissory note.",
          B: "Distractor B describes trade-backed banker's acceptances.",
          C: "Distractor C describes a committed bank borrowing facility."
        }
      },
      {
        id: 314,
        losCode: "LOS 16.a",
        stem: "When estimating a firm's cost of capital, the marginal cost of capital (MCC) refers to the cost of:",
        options: {
          A: "The next additional dollar of capital raised by the firm",
          B: "The historical weighted average of all existing balance sheet liabilities",
          C: "The coupon yield on the earliest issued senior debt tranche"
        },
        correctOption: "A",
        algebraicSolution: "The Marginal Cost of Capital (MCC) is the cost of raising the next incremental dollar of new capital, which typically rises as larger amounts of capital are raised (creating upward-sloping MCC schedules).",
        calculatorKeystrokes: "Concept: Marginal Cost of Capital = Cost of the next dollar of capital.",
        trapCategory: "Cost of Capital & Capital Structure",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: MCC is the incremental cost of the next unit of capital.",
          B: "Distractor B describes historical embedded cost, which is irrelevant for new project budgeting.",
          C: "Distractor C describes historical coupon debt costs."
        }
      },
      {
        id: 315,
        losCode: "LOS 14.a",
        stem: "When calculating project cash flows for capital budgeting, which of the following should be included in the analysis?",
        options: {
          A: "Opportunity costs and negative externalities (cannibalization)",
          B: "Sunk costs incurred prior to the decision point",
          C: "Financing costs such as interest payments on project debt"
        },
        correctOption: "A",
        algebraicSolution: "Capital budgeting cash flows must include opportunity costs and externalities/cannibalization. Sunk costs must be strictly excluded. Financing costs (interest) are excluded from operating cash flows because they are accounted for in the discount rate (WACC).",
        calculatorKeystrokes: "Rule: Include Opportunity Costs & Cannibalization; Exclude Sunk Costs & Interest.",
        trapCategory: "Capital Investments & Capital Allocation",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: Opportunity costs and cannibalization directly affect incremental project wealth.",
          B: "Distractor B violates the sunk cost exclusion rule.",
          C: "Distractor C double-counts financing costs already embedded in WACC."
        }
      }
    ]
  },

  // ==========================================
  // TOPIC 04: Financial Statement Analysis (15 Questions)
  // ==========================================
  {
    id: "vignette-04-fsa",
    topicId: "04",
    topicName: "Financial Statement Analysis",
    subReading: "Financial Reporting Mechanics, Inventories (LIFO/FIFO), Long-Lived Assets, Taxes & Leases",
    difficulty: "High Trap",
    vignetteStem: "Apex Heavy Industrial Corp reports under US GAAP using LIFO inventory valuation in an inflationary cycle with a 30% corporate tax rate. For 2025, Apex reports LIFO COGS of $4,200,000, Beginning LIFO Reserve of $350,000, and Ending LIFO Reserve of $520,000.",
    questions: [
      {
        id: 401,
        losCode: "LOS 18.c",
        stem: "If Apex had reported under FIFO, its 2025 Cost of Goods Sold (COGS) would be closest to:",
        options: {
          A: "$4,030,000",
          B: "$4,370,000",
          C: "$3,680,000"
        },
        correctOption: "A",
        algebraicSolution: "ΔLIFO Reserve = $520,000 - $350,000 = $170,000. COGS(FIFO) = COGS(LIFO) - ΔLIFO Reserve = $4,200,000 - $170,000 = $4,030,000.",
        calculatorKeystrokes: "4200000 [-] (520000 [-] 350000) [=] 4,030,000",
        trapCategory: "LIFO Reserve Change Directional Sign",
        errorModeDefault: "SIGN_INVERSION",
        distractorAutopsy: {
          A: "CORRECT: In rising prices, FIFO uses cheaper earlier costs: COGS = $4,200,000 - $170,000 = $4,030,000.",
          B: "Distractor B adds the delta reserve instead of subtracting it ($4,200,000 + $170,000 = $4,370,000).",
          C: "Distractor C subtracts the entire ending reserve ($520,000) rather than single-period delta."
        }
      },
      {
        id: 402,
        losCode: "LOS 18.e",
        stem: "The cumulative adjustment to Apex's ending Retained Earnings balance upon converting from LIFO to FIFO at year-end 2025 is closest to an increase of:",
        options: {
          A: "$119,000",
          B: "$364,000",
          C: "$520,000"
        },
        correctOption: "B",
        algebraicSolution: "Retained Earnings adjustment = Ending LIFO Reserve * (1 - Tax Rate) = $520,000 * (1 - 0.30) = $520,000 * 0.70 = $364,000 increase.",
        calculatorKeystrokes: "520000 [\\times] 0.70 [=] 364,000",
        trapCategory: "Cumulative vs. Single-Period Reserve Tax Adjustment",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "Distractor A multiplies single-period ΔReserve ($170,000) by (1 - t), which is single-period net income change, not cumulative retained earnings.",
          B: "CORRECT: Cumulative retained earnings adjustment = Ending Reserve * (1 - t) = $520,000 * 0.70 = $364,000.",
          C: "Distractor C uses the gross ending reserve without deducting cumulative deferred taxes."
        }
      },
      {
        id: 403,
        losCode: "LOS 17.d",
        stem: "Under the 5-way DuPont decomposition, Return on Equity (ROE) is decomposed into:\nROE = (NI/EBT) * (EBT/EBIT) * (EBIT/Revenue) * (Revenue/Assets) * (Assets/Equity).\nThe ratio (EBT / EBIT) measures the firm's:",
        options: {
          A: "Interest burden",
          B: "Tax burden",
          C: "Operating margin"
        },
        correctOption: "A",
        algebraicSolution: "In 5-way DuPont: (NI/EBT) = Tax Burden; (EBT/EBIT) = Interest Burden (higher value closer to 1.0 means lower interest expense); (EBIT/Revenue) = Operating Margin; (Revenue/Assets) = Asset Turnover; (Assets/Equity) = Financial Leverage.",
        calculatorKeystrokes: "DuPont: EBT / EBIT = Interest Burden.",
        trapCategory: "Financial Reporting Mechanics & Statements",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: EBT / EBIT reflects the interest burden (impact of debt interest on earnings).",
          B: "Distractor B is the tax burden (NI / EBT).",
          C: "Distractor C is the operating margin (EBIT / Revenue)."
        }
      },
      {
        id: 404,
        losCode: "LOS 17.c",
        stem: "Under US GAAP, cash dividends paid to shareholders are classified in the statement of cash flows as:",
        options: {
          A: "Financing cash flow (CFF)",
          B: "Operating cash flow (CFO)",
          C: "Investing cash flow (CFI)"
        },
        correctOption: "A",
        algebraicSolution: "Under US GAAP: Dividends paid = CFF (Financing). Interest paid = CFO. Interest received = CFO. Dividends received = CFO. Under IFRS: Dividends paid can be CFF or CFO.",
        calculatorKeystrokes: "Rule: US GAAP Dividends Paid = Financing Cash Flow (CFF).",
        trapCategory: "Financial Reporting Mechanics & Statements",
        errorModeDefault: "GAAP_VS_IFRS",
        distractorAutopsy: {
          A: "CORRECT: US GAAP strictly classifies dividends paid as Financing (CFF).",
          B: "Distractor B confuses dividends paid with interest paid (which is CFO under US GAAP).",
          C: "Distractor C describes investing cash flows."
        }
      },
      {
        id: 405,
        losCode: "LOS 18.d",
        stem: "In an inflationary environment with stable inventory unit counts, which inventory valuation method yields the highest gross profit margin and highest ending inventory balance?",
        options: {
          A: "FIFO",
          B: "LIFO",
          C: "Weighted Average Cost"
        },
        correctOption: "A",
        algebraicSolution: "In rising prices, FIFO allocates older, cheaper costs to COGS, resulting in lower COGS, higher gross profit, higher net income, and higher ending inventory (valued at recent higher costs).",
        calculatorKeystrokes: "Rule: Inflation => FIFO yields Higher Ending Inventory & Higher Gross Profit.",
        trapCategory: "Inventories: LIFO, FIFO, and Reserve Adjustments",
        errorModeDefault: "SIGN_INVERSION",
        distractorAutopsy: {
          A: "CORRECT: FIFO produces lower COGS and higher ending inventory when prices rise.",
          B: "Distractor B is true under falling prices or for income tax minimization under rising prices.",
          C: "Distractor C produces an intermediate blend."
        }
      },
      {
        id: 406,
        losCode: "LOS 18.f",
        stem: "When a firm using LIFO liquidates older inventory layers during a period of rising prices (LIFO liquidation), the financial statement effects include:",
        options: {
          A: "Higher gross profit margin and higher income tax liability",
          B: "Lower gross profit margin and lower income tax liability",
          C: "Lower net income and an immediate cash outflow in CFI"
        },
        correctOption: "A",
        algebraicSolution: "LIFO liquidation matches old, low historical inventory costs against current high selling prices. This artificially depresses COGS, inflating gross profit, taxable income, and tax liability.",
        calculatorKeystrokes: "Concept: LIFO liquidation matches cheap old costs to current revenues => Spikes Net Income & Taxes.",
        trapCategory: "Inventories: LIFO, FIFO, and Reserve Adjustments",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: Low historical costs flow into COGS, artificially boosting profits and taxes.",
          B: "Distractor B inverts the impact of low inventory layer costs.",
          C: "Distractor C confuses operating gross margin gains with cash flow classifications."
        }
      },
      {
        id: 407,
        losCode: "LOS 19.b",
        stem: "A company capitalizes an expenditure of $1,000,000 rather than expensing it immediately. In the year of capitalization, this accounting choice will:",
        options: {
          A: "Increase CFO, decrease CFI, and increase current Net Income",
          B: "Decrease CFO, increase CFI, and decrease current Net Income",
          C: "Increase CFF, increase CFO, and leave Net Income unchanged"
        },
        correctOption: "A",
        algebraicSolution: "Capitalizing an expenditure classifies the cash outflow as CFI (investing) rather than CFO (operating), artificially boosting current CFO. It delays expense recognition to future depreciation, boosting current Net Income.",
        calculatorKeystrokes: "Rule: Capitalizing = Outflow in CFI, Higher current CFO, Higher current NI.",
        trapCategory: "Long-Lived Assets & Capitalization vs Expensing",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: Capitalization removes outflow from CFO (reclassifying to CFI) and increases current NI.",
          B: "Distractor B describes expensing immediately.",
          C: "Distractor C confuses CFI with CFF."
        }
      },
      {
        id: 408,
        losCode: "LOS 19.d",
        stem: "An asset is purchased for $100,000 with a 5-year useful life and $10,000 salvage value. Using the Double Declining Balance (DDB) method, Year 2 depreciation expense is closest to:",
        options: {
          A: "$24,000",
          B: "$40,000",
          C: "$18,000"
        },
        correctOption: "A",
        algebraicSolution: "DDB rate = 2 / 5 = 40.0% per year. DDB ignores salvage value in initial percentage calculations. Year 1 Dep = $100,000 * 40% = $40,000 (Ending Book Value = $60,000). Year 2 Dep = $60,000 * 40% = $24,000.",
        calculatorKeystrokes: "100000 [\\times] 0.40 [=] 40000 -> (100000 [-] 40000) [\\times] 0.40 [=] 24,000",
        trapCategory: "Long-Lived Assets & Capitalization vs Expensing",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "CORRECT: Year 1 = $40k, Year 2 = ($100k - $40k) * 40% = $24,000.",
          B: "Distractor B is Year 1 depreciation ($40,000).",
          C: "Distractor C subtracts salvage value before computing Year 1 [($100k - $10k)*40% = $36k -> ($90k - $36k)*40% = $21.6k]."
        }
      },
      {
        id: 409,
        losCode: "LOS 20.b",
        stem: "A Deferred Tax Liability (DTL) is most likely created when:",
        options: {
          A: "Taxable income on the tax return is temporarily less than pretax financial accounting income",
          B: "Taxable income on the tax return is temporarily greater than pretax financial accounting income",
          C: "Tax rates are expected to decline permanently to zero"
        },
        correctOption: "A",
        algebraicSolution: "DTL arises when taxable income < pretax financial income due to temporary differences (e.g. accelerated tax depreciation vs straight-line book depreciation). Taxes paid currently are lower, creating a liability to pay higher taxes in future periods.",
        calculatorKeystrokes: "Concept: Taxable Income < Book Income => DTL (Pay taxes later).",
        trapCategory: "Income Taxes & Deferred Tax Liabilities",
        errorModeDefault: "SIGN_INVERSION",
        distractorAutopsy: {
          A: "CORRECT: Taxable Income < Book Income results in deferred tax liability (DTL).",
          B: "Distractor B creates a Deferred Tax Asset (DTA).",
          C: "Distractor C would require DTL derecognition to equity."
        }
      },
      {
        id: 410,
        losCode: "LOS 20.d",
        stem: "When a statutory corporate tax rate increases, the balance sheet value of existing Deferred Tax Liabilities (DTL) and the immediate income statement effect are:",
        options: {
          A: "DTL increases; Income tax expense increases (reducing net income)",
          B: "DTL decreases; Income tax expense decreases (increasing net income)",
          C: "DTL increases; No impact on the income statement"
        },
        correctOption: "A",
        algebraicSolution: "When tax rates increase, DTLs must be revalued upward. The upward adjustment flows directly through the income statement as an increase in income tax expense, decreasing net income.",
        calculatorKeystrokes: "Rule: Tax Rate Hike => Upward DTL revaluation => Spikes current Tax Expense.",
        trapCategory: "Income Taxes & Deferred Tax Liabilities",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: Higher future tax rate increases DTL and increases current income tax expense.",
          B: "Distractor B inverts the revaluation polarity.",
          C: "Distractor C incorrectly assumes tax rate changes bypass the income statement."
        }
      },
      {
        id: 411,
        losCode: "LOS 21.c",
        stem: "Under IFRS 16, a lessee accounts for all leases as finance leases. Compared to an operating lease under US GAAP, reporting under IFRS 16 results in:",
        options: {
          A: "Higher Cash Flow from Operating Activities (CFO) and higher EBITDA",
          B: "Lower Cash Flow from Operating Activities (CFO) and lower EBITDA",
          C: "Identical cash flow classification between CFO and CFF"
        },
        correctOption: "A",
        algebraicSolution: "Under IFRS 16, lease payments are split into interest expense (CFO or CFF) and principal repayment (CFF). Under US GAAP operating leases, the full lease payment is in CFO. Thus, IFRS 16 removes principal from CFO (moving to CFF), artificially inflating CFO and EBITDA.",
        calculatorKeystrokes: "Rule: IFRS 16 shifts lease principal to CFF => Inflates CFO and EBITDA.",
        trapCategory: "IFRS vs US GAAP Lease CFO Classification",
        errorModeDefault: "GAAP_VS_IFRS",
        distractorAutopsy: {
          A: "CORRECT: IFRS 16 shifts lease principal outflow to CFF, boosting CFO and eliminating lease rent expense from EBITDA.",
          B: "Distractor B inverts the cash flow shift.",
          C: "Distractor C fails to recognize the fundamental standard divergence."
        }
      },
      {
        id: 412,
        losCode: "LOS 21.d",
        stem: "Which of the following is a classic financial reporting red flag indicating potential aggressive revenue recognition?",
        options: {
          A: "Days Sales Outstanding (DSO) increasing significantly faster than industry peers",
          B: "Cash Flow from Operations (CFO) growing consistently faster than Net Income",
          C: "Inventory turnover ratio increasing alongside declining DOH"
        },
        correctOption: "A",
        algebraicSolution: "A significant increase in DSO (accounts receivable growing faster than revenue) suggests uncollected revenues, aggressive premature booking of sales, or channel stuffing.",
        calculatorKeystrokes: "Red Flag: Surging DSO relative to revenue growth.",
        trapCategory: "Financial Reporting Quality & Red Flags",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: Rapidly rising DSO indicates uncollected receivables and aggressive revenue timing.",
          B: "Distractor B indicates high earnings quality (cash-backed earnings).",
          C: "Distractor C indicates improved inventory management efficiency."
        }
      },
      {
        id: 413,
        losCode: "LOS 17.a",
        stem: "Basic Earnings Per Share (EPS) is calculated as:",
        options: {
          A: "(Net Income - Preferred Dividends) / Weighted Average Number of Common Shares",
          B: "Net Income / Total Shares Outstanding at Year-End",
          C: "(Net Income + After-Tax Interest) / Fully Diluted Shares"
        },
        correctOption: "A",
        algebraicSolution: "Basic EPS = (Net Income - Preferred Dividends) / Weighted Average Number of Common Shares Outstanding during the period.",
        calculatorKeystrokes: "Formula: Basic EPS = (NI - Pref Div) / Wtd Avg Shares.",
        trapCategory: "Financial Reporting Mechanics & Statements",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "CORRECT: Preferred dividends must be deducted from net income to reflect earnings available to common shareholders.",
          B: "Distractor B uses year-end share count instead of weighted average shares.",
          C: "Distractor C describes diluted EPS for convertible bonds."
        }
      },
      {
        id: 414,
        losCode: "LOS 19.e",
        stem: "Under IFRS, an impairment loss on a long-lived asset occurs when the asset's carrying amount exceeds its:",
        options: {
          A: "Recoverable amount (higher of Fair Value less costs to sell and Value in Use)",
          B: "Undiscounted expected future cash flows",
          C: "Original historical cost adjusted for straight-line depreciation"
        },
        correctOption: "A",
        algebraicSolution: "Under IFRS (IAS 36), an asset is impaired when Carrying Amount > Recoverable Amount. Recoverable Amount = max(Fair Value - Cost to Sell, Value in Use [discounted PV of cash flows]).",
        calculatorKeystrokes: "Concept: IFRS Recoverable Amount = max(FV - Costs to sell, Value in Use).",
        trapCategory: "Long-Lived Assets & Capitalization vs Expensing",
        errorModeDefault: "GAAP_VS_IFRS",
        distractorAutopsy: {
          A: "CORRECT: IFRS tests carrying value against the higher of net fair value and value in use.",
          B: "Distractor B describes the US GAAP Step 1 recoverability test (undiscounted cash flows).",
          C: "Distractor C is simply net book value."
        }
      },
      {
        id: 415,
        losCode: "LOS 18.b",
        stem: "Under IFRS, which inventory valuation method is explicitly prohibited?",
        options: {
          A: "LIFO",
          B: "FIFO",
          C: "Weighted Average Cost"
        },
        correctOption: "A",
        algebraicSolution: "Under IFRS (IAS 2), the Last-In, First-Out (LIFO) method is strictly prohibited. Permitted methods under IFRS include FIFO and Weighted Average Cost.",
        calculatorKeystrokes: "Rule: LIFO is prohibited under IFRS.",
        trapCategory: "GAAP vs IFRS Inventory Standards",
        errorModeDefault: "GAAP_VS_IFRS",
        distractorAutopsy: {
          A: "CORRECT: LIFO is banned under IFRS due to lack of physical flow fidelity.",
          B: "Distractor B is permitted under both IFRS and US GAAP.",
          C: "Distractor C is permitted under both IFRS and US GAAP."
        }
      }
    ]
  },

  // ==========================================
  // TOPIC 05: Equities (15 Questions)
  // ==========================================
  {
    id: "vignette-05-equity",
    topicId: "05",
    topicName: "Equities",
    subReading: "Market Organization, Indices, Market Efficiency, DDM Valuation & Multiples",
    difficulty: "High Trap",
    vignetteStem: "An equity research analyst is valuing shares of Vantage Dynamics Corp. The firm just paid an annual dividend D_0 = $2.50 per share. Dividends grow at 15% for 2 years, and 4.0% perpetually thereafter. Required return on equity is 9.0%.",
    questions: [
      {
        id: 501,
        losCode: "LOS 25.b",
        stem: "The terminal share price P_2 at the end of Year 2 is closest to:",
        options: {
          A: "$68.74",
          B: "$66.10",
          C: "$58.12"
        },
        correctOption: "A",
        algebraicSolution: "D_1 = $2.50 * 1.15 = $2.875. D_2 = $2.875 * 1.15 = $3.30625. D_3 = D_2 * 1.04 = $3.30625 * 1.04 = $3.4385. Terminal Price P_2 = D_3 / (r - g) = $3.4385 / (0.09 - 0.04) = $3.4385 / 0.05 = $68.77 ~ $68.74.",
        calculatorKeystrokes: "2.50 [\\times] 1.15 [\\times] 1.15 [\\times] 1.04 [\\div] 0.05 [=] 68.77",
        trapCategory: "Gordon Growth Numerator Timing ($D_n$ vs $D_{n+1}$)",
        errorModeDefault: "PERIODICITY_MISMATCH",
        distractorAutopsy: {
          A: "CORRECT: Accurately advances dividend to D_3 ($3.4385) before dividing by (r - g) = 0.05 => $68.77.",
          B: "Distractor B uses D_2 ($3.306) in the Gordon Growth numerator without advancing to D_3 ($3.306 / 0.05 = $66.12).",
          C: "Distractor C divides D_1 by (r - g), creating a premature terminal horizon."
        }
      },
      {
        id: 502,
        losCode: "LOS 22.c",
        stem: "An investor purchases 1,000 shares of stock on margin at $60.00 per share with an initial margin requirement of 50% and maintenance margin of 30%. At what stock price will the investor receive a margin call?",
        options: {
          A: "$42.86",
          B: "$36.00",
          C: "$45.00"
        },
        correctOption: "A",
        algebraicSolution: "Margin Call Price = P_0 * [(1 - IM) / (1 - MM)] = $60 * [(1 - 0.50) / (1 - 0.30)] = $60 * (0.50 / 0.70) = $42.857 ~ $42.86.",
        calculatorKeystrokes: "60 [\\times] 0.50 [\\div] 0.70 [=] 42.857",
        trapCategory: "Market Organization and Structure",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "CORRECT: Margin Call Price = $60 * (1 - 0.50) / (1 - 0.30) = $42.86.",
          B: "Distractor B computes $60 * (1 - 0.40) or subtracts margin percentages linearly.",
          C: "Distractor C computes $60 * (1 - 0.50 * 0.50) = $45.00."
        }
      },
      {
        id: 503,
        losCode: "LOS 25.a",
        stem: "Using the constant growth Gordon Growth Model, a stock just paid a dividend D_0 = $3.00. Expected perpetual dividend growth is 5.0% and required rate of return is 11.0%. The intrinsic value P_0 is closest to:",
        options: {
          A: "$52.50",
          B: "$50.00",
          C: "$27.27"
        },
        correctOption: "A",
        algebraicSolution: "D_1 = D_0 * (1 + g) = $3.00 * 1.05 = $3.15. P_0 = D_1 / (r - g) = $3.15 / (0.11 - 0.05) = $3.15 / 0.06 = $52.50.",
        calculatorKeystrokes: "3.00 [\\times] 1.05 [\\div] (0.11 [-] 0.05) [=] 52.50",
        trapCategory: "Discounted Dividend Valuation (DDM)",
        errorModeDefault: "PERIODICITY_MISMATCH",
        distractorAutopsy: {
          A: "CORRECT: P_0 = $3.00 * 1.05 / 0.06 = $52.50.",
          B: "Distractor B uses D_0 instead of D_1 ($3.00 / 0.06 = $50.00).",
          C: "Distractor C divides D_0 by r ($3.00 / 0.11 = $27.27)."
        }
      },
      {
        id: 504,
        losCode: "LOS 25.d",
        stem: "A firm generates a Return on Equity (ROE) of 16.0% and maintains a dividend payout ratio of 35.0%. The firm's sustainable growth rate g is closest to:",
        options: {
          A: "10.40%",
          B: "5.60%",
          C: "16.00%"
        },
        correctOption: "A",
        algebraicSolution: "Retention rate b = 1 - Payout Ratio = 1 - 0.35 = 0.65 (65%). Sustainable growth rate g = b * ROE = 0.65 * 16.0% = 10.40%.",
        calculatorKeystrokes: "(1 [-] 0.35) [\\times] 16.0 [=] 10.40%",
        trapCategory: "Discounted Dividend Valuation (DDM)",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "CORRECT: g = (1 - 0.35) * 16.0% = 10.40%.",
          B: "Distractor B multiplies payout ratio by ROE (0.35 * 16.0% = 5.60%).",
          C: "Distractor C treats ROE as sustainable growth without factoring retention."
        }
      },
      {
        id: 505,
        losCode: "LOS 23.b",
        stem: "A price-weighted index consists of three stocks priced at $20, $50, and $110 (initial divisor = 3.0). If the $110 stock undergoes a 2-for-1 stock split, the new index divisor is closest to:",
        options: {
          A: "2.083",
          B: "3.000",
          C: "1.850"
        },
        correctOption: "A",
        algebraicSolution: "Initial Index Level = (20 + 50 + 110) / 3 = 180 / 3 = 60.0. Post-split prices: $20, $50, and $55 ($110 / 2). New Sum = 20 + 50 + 55 = 125. New Divisor = New Sum / Initial Index = 125 / 60.0 = 2.0833 ~ 2.083.",
        calculatorKeystrokes: "(20 [+] 50 [+] 55) [\\div] 60.0 [=] 2.0833",
        trapCategory: "Security Market Indices",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "CORRECT: New Divisor = 125 / 60 = 2.083.",
          B: "Distractor B fails to adjust the divisor, creating artificial index deflation (125 / 3 = 41.67).",
          C: "Distractor C divides by 2 instead of adjusting by index level parity."
        }
      },
      {
        id: 506,
        losCode: "LOS 24.b",
        stem: "If a financial market is semi-strong form efficient, an investor can most likely achieve abnormal risk-adjusted returns by utilizing:",
        options: {
          A: "Nonpublic private insider information only",
          B: "Fundamental analysis of published annual reports",
          C: "Technical analysis of historical price chart patterns"
        },
        correctOption: "A",
        algebraicSolution: "In semi-strong form efficiency, stock prices fully reflect all past market trading data and all publicly available information. Therefore, neither technical nor fundamental analysis can earn abnormal returns; only private insider information can generate abnormal profits.",
        calculatorKeystrokes: "Concept: Semi-strong efficiency => Only Private / Insider Info generates abnormal alpha.",
        trapCategory: "Market Efficiency & Anomalies",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: In semi-strong markets, only non-public insider info can generate abnormal returns.",
          B: "Distractor B is reflected in prices under semi-strong form.",
          C: "Distractor C is reflected in prices under weak form."
        }
      },
      {
        id: 507,
        losCode: "LOS 26.b",
        stem: "A stock is expected to generate forward EPS E_1 = $4.00, dividend payout ratio of 40%, required return of 10.0%, and dividend growth rate of 4.0%. The justified leading P/E ratio is closest to:",
        options: {
          A: "6.67x",
          B: "10.00x",
          C: "16.67x"
        },
        correctOption: "A",
        algebraicSolution: "Justified Leading P/E = (P_0 / E_1) = (1 - b) / (r - g) = Payout Ratio / (r - g) = 0.40 / (0.10 - 0.04) = 0.40 / 0.06 = 6.667x ~ 6.67x.",
        calculatorKeystrokes: "0.40 [\\div] (0.10 [-] 0.04) [=] 6.6667",
        trapCategory: "Relative Valuation Approaches & Price Multiples",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "CORRECT: Leading P/E = 0.40 / 0.06 = 6.67x.",
          B: "Distractor B computes 1 / (r - g) = 1 / 0.06 = 16.67 or 1 / r = 10x.",
          C: "Distractor C forgets to multiply by the payout ratio (1.0 / 0.06 = 16.67x)."
        }
      },
      {
        id: 508,
        losCode: "LOS 26.d",
        stem: "A company has market capitalization of equity = $800M, total debt = $300M, cash and equivalents = $100M, and EBITDA = $200M. The firm's Enterprise Value to EBITDA (EV/EBITDA) multiple is closest to:",
        options: {
          A: "5.00x",
          B: "5.50x",
          C: "4.00x"
        },
        correctOption: "A",
        algebraicSolution: "Enterprise Value (EV) = Market Cap + Debt - Cash = $800M + $300M - $100M = $1,000M. EV / EBITDA = $1,000M / $200M = 5.00x.",
        calculatorKeystrokes: "(800 [+] 300 [-] 100) [\\div] 200 [=] 5.00",
        trapCategory: "Relative Valuation Approaches & Price Multiples",
        errorModeDefault: "SIGN_INVERSION",
        distractorAutopsy: {
          A: "CORRECT: EV = 800 + 300 - 100 = 1000M. EV/EBITDA = 1000 / 200 = 5.00x.",
          B: "Distractor B adds cash instead of subtracting it (800 + 300 + 100 = 1200 / 200 = 6.00x).",
          C: "Distractor C uses market cap alone (800 / 200 = 4.00x), ignoring debt and cash."
        }
      },
      {
        id: 509,
        losCode: "LOS 22.a",
        stem: "In an order-driven market, trading orders are executed based on which priority matching rules?",
        options: {
          A: "Price priority first, then time priority",
          B: "Time priority first, then price priority",
          C: "Broker dealer inventory availability"
        },
        correctOption: "A",
        algebraicSolution: "Order-driven markets use order precedence rules: Price priority (highest buy price and lowest sell price are matched first) followed by Time priority (earliest order submitted at that price).",
        calculatorKeystrokes: "Rule: Order Precedence = Price Priority, then Time Priority.",
        trapCategory: "Market Organization and Structure",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: Price priority dominates, followed by time timestamp priority.",
          B: "Distractor B inverts order precedence rules.",
          C: "Distractor C describes quote-driven / dealer markets."
        }
      },
      {
        id: 510,
        losCode: "LOS 26.e",
        stem: "In which stage of the industry life cycle are sales growth rates slowing, price competition intensifying, and industry consolidation/shakeout occurring?",
        options: {
          A: "Shakeout stage",
          B: "Growth stage",
          C: "Embryonic stage"
        },
        correctOption: "A",
        algebraicSolution: "In the Shakeout stage, growth slows, excess capacity emerges, price wars intensify, and weaker competitors are acquired or forced out of business.",
        calculatorKeystrokes: "Concept: Slowing growth + Intense price competition = Shakeout stage.",
        trapCategory: "Relative Valuation Approaches & Price Multiples",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: Shakeout features slowing growth, intense price wars, and consolidation.",
          B: "Distractor B features rapid growth and high profitability.",
          C: "Distractor C features slow growth and high initial investment."
        }
      },
      {
        id: 511,
        losCode: "LOS 25.e",
        stem: "A stock is valued using a two-stage DDM. Current dividend D_0 = $2.00. Dividends grow at 20% for Year 1 and Year 2, then grow at 5% perpetually. Required return is 10%. The present value of Year 1 and Year 2 explicit dividends is closest to:",
        options: {
          A: "$4.56",
          B: "$5.28",
          C: "$4.00"
        },
        correctOption: "A",
        algebraicSolution: "D_1 = $2.00 * 1.20 = $2.40. PV(D_1) = $2.40 / 1.10 = $2.1818. D_2 = $2.40 * 1.20 = $2.88. PV(D_2) = $2.88 / (1.10^2) = $2.88 / 1.21 = $2.3802. Sum PV(D_1 + D_2) = $2.1818 + $2.3802 = $4.562 ~ $4.56.",
        calculatorKeystrokes: "(2.40 [\\div] 1.10) [+] (2.88 [\\div] 1.21) [=] 4.562",
        trapCategory: "Discounted Dividend Valuation (DDM)",
        errorModeDefault: "PERIODICITY_MISMATCH",
        distractorAutopsy: {
          A: "CORRECT: PV = (2.40 / 1.10) + (2.88 / 1.21) = $4.56.",
          B: "Distractor B calculates undiscounted dividends ($2.40 + $2.88 = $5.28).",
          C: "Distractor C uses D_0 dividends."
        }
      },
      {
        id: 512,
        losCode: "LOS 22.d",
        stem: "An investor places a stop-loss sell order at $45.00 when the stock trades at $50.00. If the stock price drops to $44.50, the stop order:",
        options: {
          A: "Becomes a market order to sell at the best available market price",
          B: "Guarantees execution at exactly $45.00",
          C: "Becomes a limit order that cannot execute below $45.00"
        },
        correctOption: "A",
        algebraicSolution: "A stop order triggers once the stop price is breached and converts into a standard market order, executing at the next available market price (which may be below $45.00 in a falling market).",
        calculatorKeystrokes: "Rule: Stop Order triggers into a Market Order once stop price is reached.",
        trapCategory: "Market Organization and Structure",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: Stop orders convert to market orders upon activation and do not guarantee the stop price.",
          B: "Distractor B mistakenly assumes price execution guarantees.",
          C: "Distractor C describes a stop-limit order."
        }
      },
      {
        id: 513,
        losCode: "LOS 23.a",
        stem: "Which index construction methodology gives the greatest weight to firms with the highest total market capitalization?",
        options: {
          A: "Market-capitalization-weighted index",
          B: "Equal-weighted index",
          C: "Price-weighted index"
        },
        correctOption: "A",
        algebraicSolution: "In a market-capitalization-weighted (value-weighted) index (e.g. S&P 500), each stock's weight is proportional to its market cap (Price * Shares Outstanding), so the largest firms dominate index movements.",
        calculatorKeystrokes: "Concept: Market-Cap weighting weights by total firm equity value.",
        trapCategory: "Security Market Indices",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: Value-weighted indices assign weights proportional to market capitalization.",
          B: "Distractor B assigns equal 1/N weights to all stocks.",
          C: "Distractor C assigns weights based on raw share price."
        }
      },
      {
        id: 514,
        losCode: "LOS 24.a",
        stem: "The tendency of small-cap stocks to outperform large-cap stocks in the first two weeks of January is known as the January effect. This is classified as a:",
        options: {
          A: "Calendar anomaly",
          B: "Cross-sectional anomaly",
          C: "Technical anomaly"
        },
        correctOption: "A",
        algebraicSolution: "The January effect (often linked to year-end tax-loss selling in December followed by reinvestment in January) is a classic calendar / time-series anomaly.",
        calculatorKeystrokes: "Concept: January Effect = Calendar Anomaly.",
        trapCategory: "Market Efficiency & Anomalies",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: The January effect is a calendar market anomaly.",
          B: "Distractor B describes size/value anomalies (e.g. low P/E effect).",
          C: "Distractor C describes technical trading indicators."
        }
      },
      {
        id: 515,
        losCode: "LOS 26.c",
        stem: "A company has a book value of equity per share of $25.00, Return on Equity (ROE) of 15.0%, required return of 10.0%, and perpetual growth rate of 4.0%. The justified Price-to-Book (P/B) ratio is closest to:",
        options: {
          A: "1.83x",
          B: "1.50x",
          C: "2.25x"
        },
        correctOption: "A",
        algebraicSolution: "Justified P/B = (ROE - g) / (r - g) = (0.15 - 0.04) / (0.10 - 0.04) = 0.11 / 0.06 = 1.833x ~ 1.83x.",
        calculatorKeystrokes: "(0.15 [-] 0.04) [\\div] (0.10 [-] 0.04) [=] 1.833",
        trapCategory: "Relative Valuation Approaches & Price Multiples",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "CORRECT: Justified P/B = (0.15 - 0.04) / (0.10 - 0.04) = 1.83x.",
          B: "Distractor B computes ROE / r = 0.15 / 0.10 = 1.50x.",
          C: "Distractor C omits growth adjustments."
        }
      }
    ]
  },

  // ==========================================
  // TOPIC 06: Fixed Income (15 Questions)
  // ==========================================
  {
    id: "vignette-06-fixedinc",
    topicId: "06",
    topicName: "Fixed Income",
    subReading: "Bond Pricing, Yield Measures, Duration & Convexity, Credit Analysis & Securitization",
    difficulty: "Institutional",
    vignetteStem: "A fixed income portfolio manager holds semiannual coupon corporate bonds, evaluates duration and convexity risk under instantaneous yield shocks, and monitors credit spreads across spot rate curves.",
    questions: [
      {
        id: 601,
        losCode: "LOS 30.e",
        stem: "A 10-year, 6.00% semiannual coupon bond trading at par has Modified Duration = 7.40 and Annual Convexity = 68.0. If market yields increase instantaneously by 150 basis points (+1.50%), the estimated percentage change in price is closest to:",
        options: {
          A: "-10.335%",
          B: "-11.100%",
          C: "-9.570%"
        },
        correctOption: "A",
        algebraicSolution: "Duration effect = -ModDur * Δy = -7.40 * (+0.015) = -0.1110 (-11.10%). Convexity effect = 0.5 * Convexity * (Δy)^2 = 0.5 * 68.0 * (0.015)^2 = 34.0 * 0.000225 = +0.00765 (+0.765%). Total %ΔP ≈ -11.10% + 0.765% = -10.335%.",
        calculatorKeystrokes: "[-] 7.40 [\\times] 0.015 [+] (0.5 [\\times] 68.0 [\\times] 0.015 [x^2]) [=] -0.10335",
        trapCategory: "Omission of the 1/2 Convexity Scalar Factor",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "CORRECT: %ΔP = -ModDur*(Δy) + 0.5*Convexity*(Δy)^2 = -11.10% + 0.765% = -10.335%.",
          B: "Distractor B uses only linear duration (-11.10%), omitting the positive convexity cushion.",
          C: "Distractor C omits the 1/2 multiplier on convexity (-11.10% + 1.530% = -9.570%)."
        }
      },
      {
        id: 602,
        losCode: "LOS 28.c",
        stem: "A 5-year corporate bond pays a 7.00% annual coupon semiannually (3.50% per period) on $1,000 par. If the market annual YTM is 8.00%, the bond's price is closest to:",
        options: {
          A: "$959.45",
          B: "$960.07",
          C: "$972.10"
        },
        correctOption: "A",
        algebraicSolution: "N = 5 * 2 = 10; I/Y = 8.00 / 2 = 4.00%; PMT = (0.07 * 1000) / 2 = 35.00; FV = 1000. CPT PV = -$959.45.",
        calculatorKeystrokes: "[2nd][CLR TVM] -> [10][N] -> [4][I/Y] -> [35][PMT] -> [1000][FV] -> [CPT][PV] => -959.45",
        trapCategory: "Bond Semiannual Yield Convention",
        errorModeDefault: "PERIODICITY_MISMATCH",
        distractorAutopsy: {
          A: "CORRECT: N=10, I/Y=4%, PMT=35, FV=1000 => PV = $959.45.",
          B: "Distractor B uses annual compounding N=5, I/Y=8%, PMT=70 => PV = $960.07.",
          C: "Distractor C inputs I/Y=8% without dividing by 2 while using N=10."
        }
      },
      {
        id: 603,
        losCode: "LOS 30.c",
        stem: "A bond has Macaulay duration of 8.20 years and an annual yield to maturity of 5.00% compounded semiannually. Its Modified Duration is closest to:",
        options: {
          A: "8.00 years",
          B: "7.81 years",
          C: "8.20 years"
        },
        correctOption: "A",
        algebraicSolution: "Modified Duration = MacDur / (1 + YTM / m) = 8.20 / (1 + 0.05 / 2) = 8.20 / 1.025 = 8.00 years.",
        calculatorKeystrokes: "8.20 [\\div] (1 [+] (0.05 [\\div] 2)) [=] 8.00",
        trapCategory: "Fixed-Income Risk & Return (Duration & Convexity)",
        errorModeDefault: "PERIODICITY_MISMATCH",
        distractorAutopsy: {
          A: "CORRECT: ModDur = 8.20 / 1.025 = 8.00 years.",
          B: "Distractor B divides by (1 + YTM) using annual compounding: 8.20 / 1.05 = 7.81 years.",
          C: "Distractor C confuses Macaulay duration with Modified duration."
        }
      },
      {
        id: 604,
        losCode: "LOS 30.f",
        stem: "A bond portfolio has a market value of $20,000,000 and a Modified Duration of 6.50 years. The portfolio's Money Duration (Dollar Duration) per 100 bps yield change is closest to:",
        options: {
          A: "$1,300,000",
          B: "$130,000",
          C: "$13,000"
        },
        correctOption: "A",
        algebraicSolution: "Money Duration = ModDur * Market Value = 6.50 * $20,000,000 = $130,000,000. Dollar change per 100 bps (1.00% = 0.01) = Money Duration * 0.01 = $130,000,000 * 0.01 = $1,300,000.",
        calculatorKeystrokes: "6.50 [\\times] 20000000 [\\times] 0.01 [=] 1,300,000",
        trapCategory: "Fixed-Income Risk & Return (Duration & Convexity)",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "CORRECT: Dollar change per 100 bps = $20M * 6.50 * 0.01 = $1,300,000.",
          B: "Distractor B computes the Price Value of a Basis Point (PVBP per 1 bp = $130,000).",
          C: "Distractor C computes PVBP per $100 par."
        }
      },
      {
        id: 605,
        losCode: "LOS 28.d",
        stem: "A bond with a $1,000 par value and 6.00% semiannual coupon is quoted at a clean price of $985.00. Exactly 60 days have passed since the last coupon payment in a 180-day semiannual period. The full (dirty) price is closest to:",
        options: {
          A: "$995.00",
          B: "$985.00",
          C: "$1,005.00"
        },
        correctOption: "A",
        algebraicSolution: "Semiannual coupon payment = $1,000 * 3.00% = $30.00. Accrued Interest (AI) = $30.00 * (60 / 180) = $30.00 * (1/3) = $10.00. Full (Dirty) Price = Clean Price + AI = $985.00 + $10.00 = $995.00.",
        calculatorKeystrokes: "985 [+] (30 [\\times] (60 [\\div] 180)) [=] 995.00",
        trapCategory: "Introduction to Fixed-Income Valuation",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "CORRECT: Full Price = Clean Price ($985) + Accrued Interest ($10) = $995.00.",
          B: "Distractor B reports the clean price ($985), ignoring accrued interest.",
          C: "Distractor C adds the full $30 coupon instead of the 60-day pro-rata fraction."
        }
      },
      {
        id: 606,
        losCode: "LOS 29.b",
        stem: "A 10-year corporate bond trading at $950 pays an 8.00% annual coupon on $1,000 par. The bond's current yield is closest to:",
        options: {
          A: "8.42%",
          B: "8.00%",
          C: "8.89%"
        },
        correctOption: "A",
        algebraicSolution: "Current Yield = Annual Coupon / Current Market Price = $80.00 / $950.00 = 8.421% ~ 8.42%.",
        calculatorKeystrokes: "80 [\\div] 950 [=] 0.08421",
        trapCategory: "Yield and Spread Measures for Fixed-Rate Bonds",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "CORRECT: Current Yield = $80 / $950 = 8.42%.",
          B: "Distractor B computes coupon rate ($80 / $1000 = 8.00%).",
          C: "Distractor C confuses current yield with yield to maturity."
        }
      },
      {
        id: 607,
        losCode: "LOS 29.e",
        stem: "The Zero-Volatility Spread (Z-spread) of a corporate bond represents the constant spread that must be added to each point on the:",
        options: {
          A: "Benchmark spot rate curve to equate the present value of bond cash flows to its market price",
          B: "Government benchmark par yield curve to match yield to maturity",
          C: "Treasury forward rate curve to eliminate option prepayment risk"
        },
        correctOption: "A",
        algebraicSolution: "The Z-spread is the constant basis point spread added to the entire government spot curve to make the discounted cash flows equal the bond's market price. Unlike nominal spreads over benchmark YTM, Z-spread accounts for the upward slope of the yield curve.",
        calculatorKeystrokes: "Concept: Z-spread = Constant spread over the Spot Rate curve.",
        trapCategory: "Yield and Spread Measures for Fixed-Rate Bonds",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: Z-spread is added to each spot rate on the zero-coupon curve.",
          B: "Distractor B defines the nominal G-spread over par yield curve.",
          C: "Distractor C describes Option-Adjusted Spread (OAS)."
        }
      },
      {
        id: 608,
        losCode: "LOS 31.b",
        stem: "The 1-year government spot rate is S_1 = 4.00% and the 2-year government spot rate is S_2 = 5.00%. The 1-year forward rate starting one year from today (1f_1) is closest to:",
        options: {
          A: "6.01%",
          B: "5.00%",
          C: "1.00%"
        },
        correctOption: "A",
        algebraicSolution: "(1 + S_2)^2 = (1 + S_1) * (1 + 1f_1) => (1.05)^2 = (1.04) * (1 + 1f_1) => 1.1025 = 1.04 * (1 + 1f_1) => (1 + 1f_1) = 1.1025 / 1.04 = 1.060096 => 1f_1 = 6.01%.",
        calculatorKeystrokes: "(1.05 [x^2]) [\\div] 1.04 [-] 1 [=] 0.0601",
        trapCategory: "Introduction to Fixed-Income Valuation",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "CORRECT: 1f_1 = (1.05^2 / 1.04) - 1 = 6.01%.",
          B: "Distractor B assumes forward rate equals the 2-year spot rate.",
          C: "Distractor C subtracts spot rates linearly (5.0% - 4.0% = 1.00%)."
        }
      },
      {
        id: 609,
        losCode: "LOS 30.d",
        stem: "For a callable bond trading near or above par when market interest rates fall, the effective duration will:",
        options: {
          A: "Shorten and exhibit negative convexity",
          B: "Lengthen and exhibit positive convexity",
          C: "Remain strictly constant regardless of yield changes"
        },
        correctOption: "A",
        algebraicSolution: "As yields decline, the call option moves deep in the money, placing a cap on bond price appreciation. The price-yield curve flattens, reducing effective duration and producing negative convexity.",
        calculatorKeystrokes: "Concept: Callable Bond at low yields => Shorter Duration + Negative Convexity.",
        trapCategory: "Fixed-Income Risk & Return (Duration & Convexity)",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: Price compression from the call option reduces duration and causes negative convexity.",
          B: "Distractor B describes option-free straight bonds.",
          C: "Distractor C ignores the embedded call option."
        }
      },
      {
        id: 610,
        losCode: "LOS 31.d",
        stem: "An analyst evaluates corporate debt with a 3.0% Probability of Default (PD) and a Recovery Rate of 40% (Loss Given Default LGD = 60%). The Expected Loss (EL) is closest to:",
        options: {
          A: "1.80%",
          B: "1.20%",
          C: "3.00%"
        },
        correctOption: "A",
        algebraicSolution: "Expected Loss = Probability of Default * Loss Given Default = PD * (1 - Recovery Rate) = 3.0% * (1 - 0.40) = 3.0% * 0.60 = 1.80%.",
        calculatorKeystrokes: "0.03 [\\times] (1 [-] 0.40) [=] 0.018 (1.80%)",
        trapCategory: "Credit Analysis Fundamentals",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "CORRECT: Expected Loss = 3.0% * (1 - 0.40) = 1.80%.",
          B: "Distractor B multiplies PD by Recovery Rate (3.0% * 0.40 = 1.20%).",
          C: "Distractor C assumes 100% loss given default (3.0%)."
        }
      },
      {
        id: 611,
        losCode: "LOS 27.c",
        stem: "Which of the following bond covenants is classified as an affirmative covenant?",
        options: {
          A: "The issuer must maintain insurance on key operating collateral assets",
          B: "The issuer cannot issue additional senior debt with a debt-to-equity ratio above 3.0x",
          C: "The issuer is prohibited from paying dividends exceeding 50% of net income"
        },
        correctOption: "A",
        algebraicSolution: "Affirmative covenants specify actions the borrower promises to perform (maintain insurance, pay taxes, provide timely audited financial reports). Negative covenants restrict borrower behavior (limit debt, restrict dividends, ban asset sales).",
        calculatorKeystrokes: "Concept: Affirmative = What issuer MUST do; Negative = What issuer CANNOT do.",
        trapCategory: "Fixed-Income Securities: Defining Elements",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: Maintaining insurance is a required positive action (affirmative covenant).",
          B: "Distractor B is a restrictive negative covenant limiting additional debt.",
          C: "Distractor C is a restrictive negative covenant limiting dividends."
        }
      },
      {
        id: 612,
        losCode: "LOS 29.c",
        stem: "A 3-year zero-coupon bond has a face value of $1,000 and is priced to yield 6.00% annual compound spot return. Its current market price is closest to:",
        options: {
          A: "$839.62",
          B: "$820.00",
          C: "$850.00"
        },
        correctOption: "A",
        algebraicSolution: "Zero-Coupon Price = Par / (1 + r)^N = $1,000 / (1.06)^3 = $1,000 / 1.191016 = $839.619 ~ $839.62.",
        calculatorKeystrokes: "1000 [\\div] (1.06 [y^x] 3) [=] 839.62",
        trapCategory: "Introduction to Fixed-Income Valuation",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "CORRECT: PV = 1,000 / (1.06)^3 = $839.62.",
          B: "Distractor B subtracts 6% * 3 = 18% linearly ($1,000 - $180 = $820).",
          C: "Distractor C rounds compound interest inappropriately."
        }
      },
      {
        id: 613,
        losCode: "LOS 30.g",
        stem: "A portfolio manager holds Bond X (Market Value = $6M, ModDur = 4.0) and Bond Y (Market Value = $4M, ModDur = 9.0). The portfolio's Modified Duration is closest to:",
        options: {
          A: "6.00 years",
          B: "6.50 years",
          C: "5.50 years"
        },
        correctOption: "A",
        algebraicSolution: "Total Portfolio Value = $6M + $4M = $10M. Weight X = 6/10 = 0.60; Weight Y = 4/10 = 0.40. Portfolio Duration = (0.60 * 4.0) + (0.40 * 9.0) = 2.40 + 3.60 = 6.00 years.",
        calculatorKeystrokes: "(0.60 [\\times] 4.0) [+] (0.40 [\\times] 9.0) [=] 6.00",
        trapCategory: "Fixed-Income Risk & Return (Duration & Convexity)",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "CORRECT: Duration = (0.60 * 4.0) + (0.40 * 9.0) = 6.00 years.",
          B: "Distractor B takes a simple unweighted arithmetic average: (4 + 9) / 2 = 6.50 years.",
          C: "Distractor C inverts the weights (0.40 * 4 + 0.60 * 9 = 7.00)."
        }
      },
      {
        id: 614,
        losCode: "LOS 31.e",
        stem: "In residential mortgage-backed securities (RMBS), when market benchmark interest rates drop sharply, mortgage refinancing accelerates, exposing pass-through investors to:",
        options: {
          A: "Contraction risk (reinvesting prepaid principal at lower prevailing yields)",
          B: "Extension risk (holding low coupon bonds for longer than expected)",
          C: "Credit default risk of the government agency guarantor"
        },
        correctOption: "A",
        algebraicSolution: "Contraction risk occurs when interest rates decline: homeowners prepay and refinance their mortgages early, shortening the MBS maturity and forcing investors to reinvest cash flows at lower current rates.",
        calculatorKeystrokes: "Concept: Falling Yields => Accelerated Prepayments => Contraction Risk.",
        trapCategory: "Credit Analysis Fundamentals",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: Falling rates cause refinancing surges, creating contraction risk.",
          B: "Distractor B occurs when interest rates rise and prepayments slow down (extension risk).",
          C: "Distractor C is eliminated in agency RMBS guaranteed by Fannie Mae/Freddie Mac."
        }
      },
      {
        id: 615,
        losCode: "LOS 28.b",
        stem: "If a bond's yield to maturity (YTM) is less than its stated coupon rate, the bond is trading at a:",
        options: {
          A: "Premium (Price > Par value)",
          B: "Discount (Price < Par value)",
          C: "Par (Price = Par value)"
        },
        correctOption: "A",
        algebraicSolution: "When Coupon Rate > YTM, the bond pays a coupon higher than required by current market yields; investors bid up the price above par, causing the bond to trade at a Premium (Price > Par).",
        calculatorKeystrokes: "Rule: Coupon > YTM => Premium Bond (Price > $1,000).",
        trapCategory: "Introduction to Fixed-Income Valuation",
        errorModeDefault: "SIGN_INVERSION",
        distractorAutopsy: {
          A: "CORRECT: Coupon > YTM implies the bond trades at a premium.",
          B: "Distractor B is true when Coupon < YTM (discount bond).",
          C: "Distractor C is true when Coupon = YTM."
        }
      }
    ]
  },

  // ==========================================
  // TOPIC 07: Derivatives (15 Questions)
  // ==========================================
  {
    id: "vignette-07-deriv",
    topicId: "07",
    topicName: "Derivatives",
    subReading: "Derivative Markets, Forward Pricing & Valuation, Option Valuation & Put-Call Parity",
    difficulty: "High Trap",
    vignetteStem: "A quantitative derivatives desk is executing arbitrage monitoring across European options and forwards on Titan Stock. Titan currently trades at $100.00. The 1-year European call with strike $100 trades at $8.50, and 1-year risk-free rate is 5.00% continuously compounded.",
    questions: [
      {
        id: 701,
        losCode: "LOS 34.c",
        stem: "According to Put-Call Parity, the no-arbitrage price of a 1-year European put option with a $100 strike is closest to:",
        options: {
          A: "$3.62",
          B: "$4.88",
          C: "$8.50"
        },
        correctOption: "A",
        algebraicSolution: "PV(X) = 100 * e^(-0.05*1) = 100 * 0.95123 = $95.12. Put-Call Parity: p_0 = c_0 + PV(X) - S_0 = $8.50 + $95.12 - $100.00 = $3.62.",
        calculatorKeystrokes: "8.50 [+] (100 [\\times] [e^{-0.05}]) [-] 100 [=] 3.62",
        trapCategory: "Put-Call Parity Directional Sign Trap",
        errorModeDefault: "SIGN_INVERSION",
        distractorAutopsy: {
          A: "CORRECT: p = c + PV(X) - S = 8.50 + 95.12 - 100.00 = $3.62.",
          B: "Distractor B uses discrete simple compounding 100 / 1.05 = 95.24 - 100 + 8.50 = $3.74 or inverts spot and strike signs.",
          C: "Distractor C assumes call price must equal put price for at-the-money options."
        }
      },
      {
        id: 702,
        losCode: "LOS 33.b",
        stem: "Which of the following positions replicates a synthetic long asset position using options and bonds?",
        options: {
          A: "Long Call + Short Put + Long Zero-Coupon Bond (PV of Strike)",
          B: "Long Call + Long Put + Short Zero-Coupon Bond",
          C: "Short Call + Long Put + Long Zero-Coupon Bond"
        },
        correctOption: "A",
        algebraicSolution: "From Put-Call Parity S_0 = c_0 - p_0 + PV(X). To replicate Long Stock: Long Call (+c) + Short Put (-p) + Lend PV(X) (+Bond).",
        calculatorKeystrokes: "Synthetic Stock = Long Call + Short Put + PV(X)",
        trapCategory: "Put-Call Parity Directional Sign Trap",
        errorModeDefault: "SIGN_INVERSION",
        distractorAutopsy: {
          A: "CORRECT: S_0 = c_0 - p_0 + PV(X) => Long Call + Short Put + Long Bond.",
          B: "Distractor B creates a straddle combined with borrowing.",
          C: "Distractor C creates a synthetic short stock position."
        }
      },
      {
        id: 703,
        losCode: "LOS 33.a",
        stem: "Stock S trades at $50.00. The 6-month risk-free rate is 4.00% annual compounded continuously (r = 0.04, T = 0.50). The no-arbitrage forward price F_0(T) on this non-dividend-paying stock is closest to:",
        options: {
          A: "$51.01",
          B: "$52.00",
          C: "$50.00"
        },
        correctOption: "A",
        algebraicSolution: "Forward Price F_0(T) = S_0 * e^(r * T) = $50.00 * e^(0.04 * 0.5) = $50.00 * e^(0.02) = $50.00 * 1.020201 = $51.01.",
        calculatorKeystrokes: "0.02 [2nd][e^x] [\\times] 50 [=] 51.01",
        trapCategory: "Pricing & Valuation of Forward Commitments",
        errorModeDefault: "PERIODICITY_MISMATCH",
        distractorAutopsy: {
          A: "CORRECT: F = 50 * e^(0.04 * 0.5) = $51.01.",
          B: "Distractor B compounds for a full year T = 1.0 ($50 * e^0.04 = $52.04).",
          C: "Distractor C assumes forward price equals current spot price."
        }
      },
      {
        id: 704,
        losCode: "LOS 33.c",
        stem: "Three months after initiating a 1-year forward contract with forward price F_0 = $100.00, the underlying asset trades at $110.00. If the risk-free rate is 4.00% continuously compounded, the value of the long forward contract V_t (with 9 months remaining) is closest to:",
        options: {
          A: "$12.96",
          B: "$10.00",
          C: "$7.04"
        },
        correctOption: "A",
        algebraicSolution: "Contract Value V_t = S_t - F_0 * e^(-r * (T - t)) = $110.00 - $100.00 * e^(-0.04 * 0.75) = $110.00 - $100.00 * e^(-0.03) = $110.00 - $100.00 * 0.970446 = $110.00 - $97.04 = $12.96.",
        calculatorKeystrokes: "110 [-] (100 [\\times] [-0.03][2nd][e^x]) [=] 12.955",
        trapCategory: "Pricing & Valuation of Forward Commitments",
        errorModeDefault: "SIGN_INVERSION",
        distractorAutopsy: {
          A: "CORRECT: V_t = $110 - $100 * e^(-0.03) = $12.96.",
          B: "Distractor B computes undiscounted price difference ($110 - $100 = $10.00).",
          C: "Distractor C discounts the spot price instead of the forward delivery price."
        }
      },
      {
        id: 705,
        losCode: "LOS 34.a",
        stem: "An investor purchases a European call option with strike price X = $80.00 for a premium of $6.00. At expiration, the underlying asset price is S_T = $92.00. The investor's net profit per share is closest to:",
        options: {
          A: "$6.00",
          B: "$12.00",
          C: "-$6.00"
        },
        correctOption: "A",
        algebraicSolution: "Call Payoff = max(0, S_T - X) = max(0, $92 - $80) = $12.00. Net Profit = Payoff - Premium Paid = $12.00 - $6.00 = $6.00.",
        calculatorKeystrokes: "92 [-] 80 [-] 6 [=] 6.00",
        trapCategory: "Valuation of Contingent Claims (Options)",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "CORRECT: Profit = (92 - 80) - 6 = $6.00.",
          B: "Distractor B reports the gross payoff ($12.00) without deducting the $6.00 premium.",
          C: "Distractor C assumes the option expired out of the money."
        }
      },
      {
        id: 706,
        losCode: "LOS 34.b",
        stem: "An investor purchases a European put option with strike price X = $50.00 for a premium of $4.00. The breakeven underlying asset price at expiration is closest to:",
        options: {
          A: "$46.00",
          B: "$54.00",
          C: "$50.00"
        },
        correctOption: "A",
        algebraicSolution: "For a put option: Breakeven Price = Strike Price - Premium = $50.00 - $4.00 = $46.00. (At S_T = $46, payoff = $50 - $46 = $4.00, netting $0 profit).",
        calculatorKeystrokes: "50 [-] 4 [=] 46.00",
        trapCategory: "Valuation of Contingent Claims (Options)",
        errorModeDefault: "SIGN_INVERSION",
        distractorAutopsy: {
          A: "CORRECT: Put Breakeven = Strike - Premium = 50 - 4 = $46.00.",
          B: "Distractor B adds the premium ($50 + $4 = $54.00), which is the breakeven for a call option.",
          C: "Distractor C ignores the option premium."
        }
      },
      {
        id: 707,
        losCode: "LOS 34.d",
        stem: "Which of the following option strategies represents a Covered Call position?",
        options: {
          A: "Long underlying asset + Short call option",
          B: "Long underlying asset + Long put option",
          C: "Short underlying asset + Long call option"
        },
        correctOption: "A",
        algebraicSolution: "Covered Call = Long Stock (+S) + Short Call (-c). The investor sells upside potential above the strike price in exchange for immediate option premium income.",
        calculatorKeystrokes: "Strategy: Covered Call = Long Asset + Short Call.",
        trapCategory: "Valuation of Contingent Claims (Options)",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: Long asset combined with writing a call option defines a covered call.",
          B: "Distractor B defines a protective put.",
          C: "Distractor C defines a protective short stock position."
        }
      },
      {
        id: 708,
        losCode: "LOS 34.e",
        stem: "A Fiduciary Call strategy consists of which combination of financial instruments?",
        options: {
          A: "Long European Call option + Long Zero-Coupon Bond (PV of strike price)",
          B: "Long underlying asset + Long European Put option",
          C: "Short European Call option + Long Zero-Coupon Bond"
        },
        correctOption: "A",
        algebraicSolution: "Fiduciary Call = Long Call (+c) + Long Zero-Coupon Bond (PV of X). Under Put-Call Parity, its payoff at expiration is max(S_T, X), exactly matching the payoff of a Protective Put (S_0 + p_0).",
        calculatorKeystrokes: "Concept: Fiduciary Call = Long Call + Long Bond [PV(X)].",
        trapCategory: "Valuation of Contingent Claims (Options)",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: Fiduciary call combines a long call with a risk-free bond paying X at expiration.",
          B: "Distractor B defines a protective put.",
          C: "Distractor C is an incomplete arbitrage leg."
        }
      },
      {
        id: 709,
        losCode: "LOS 32.b",
        stem: "Unlike forward contracts, exchange-traded futures contracts are marked to market on a:",
        options: {
          A: "Daily basis with margin balance adjustments",
          B: "Monthly basis with physical commodity delivery",
          C: "Single expiration date settlement basis"
        },
        correctOption: "A",
        algebraicSolution: "Futures contracts trade on centralized exchanges and feature daily mark-to-market settlement, where gains and losses are credited or debited to the trader's margin account daily, virtually eliminating counterparty default risk.",
        calculatorKeystrokes: "Concept: Futures = Daily Mark-to-Market Settlement.",
        trapCategory: "Derivative Instrument Features & Markets",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: Daily mark-to-market settlement is the defining institutional feature of futures.",
          B: "Distractor B is inaccurate; most futures are closed out prior to physical delivery.",
          C: "Distractor C describes forward contracts."
        }
      },
      {
        id: 710,
        losCode: "LOS 33.d",
        stem: "A stock trades at $80.00 and will pay a known cash dividend of $2.00 in 6 months (t = 0.5). If the annual risk-free rate is 5.0% continuously compounded, the 1-year forward price F_0(1) is closest to:",
        options: {
          A: "$82.00",
          B: "$84.10",
          C: "$78.00"
        },
        correctOption: "A",
        algebraicSolution: "PV(Dividend) = $2.00 * e^(-0.05 * 0.5) = $2.00 * 0.97531 = $1.95. Net Spot = $80.00 - $1.95 = $78.05. Forward Price F_0(1) = $78.05 * e^(0.05 * 1) = $78.05 * 1.05127 = $82.05 ~ $82.00.",
        calculatorKeystrokes: "(80 [-] (2 [\\times] [-0.025][2nd][e^x])) [\\times] 0.05[2nd][e^x] [=] 82.05",
        trapCategory: "Pricing & Valuation of Forward Commitments",
        errorModeDefault: "PERIODICITY_MISMATCH",
        distractorAutopsy: {
          A: "CORRECT: F_0 = (S_0 - PV(D)) * e^(r*T) = ($80 - $1.95) * 1.0513 = $82.05.",
          B: "Distractor B ignores the dividend: $80 * e^0.05 = $84.10.",
          C: "Distractor C subtracts dividend without compounding to forward maturity."
        }
      },
      {
        id: 711,
        losCode: "LOS 34.f",
        stem: "In a plain vanilla interest rate swap, the party paying the fixed rate and receiving the floating rate will benefit when:",
        options: {
          A: "Market floating benchmark interest rates rise above the agreed fixed swap rate",
          B: "Market floating benchmark interest rates fall below the agreed fixed swap rate",
          C: "The yield curve becomes inverted and credit spreads widen"
        },
        correctOption: "A",
        algebraicSolution: "The fixed-rate payer receives floating cash flows. When floating benchmark rates rise above the fixed rate, the incoming cash flows exceed the fixed payment obligation, generating net positive cash inflows for the fixed-rate payer.",
        calculatorKeystrokes: "Concept: Fixed Payer / Floating Receiver gains when floating interest rates rise.",
        trapCategory: "Valuation of Contingent Claims (Options)",
        errorModeDefault: "SIGN_INVERSION",
        distractorAutopsy: {
          A: "CORRECT: Rising floating rates increase received cash flows relative to the fixed payment.",
          B: "Distractor B benefits the floating-rate payer (fixed receiver).",
          C: "Distractor C confuses credit spread dynamics with benchmark interest rate swap legs."
        }
      },
      {
        id: 712,
        losCode: "LOS 33.e",
        stem: "At the exact moment of initiating a forward contract, the economic value of the forward contract to both the long and short counterparties is equal to:",
        options: {
          A: "Zero",
          B: "The forward price F_0 discounted to present value",
          C: "The spot price S_0 minus transaction costs"
        },
        correctOption: "A",
        algebraicSolution: "At initiation (t = 0), the forward price F_0 is set so that the present value of the commitment equals current spot price. As a result, no cash changes hands and the initial contract value V_0 is exactly zero for both parties.",
        calculatorKeystrokes: "Concept: Value of forward at initiation V_0 = 0.",
        trapCategory: "Pricing & Valuation of Forward Commitments",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: V_0 = 0 at contract initiation.",
          B: "Distractor B confuses forward price F_0 with forward contract value V_0.",
          C: "Distractor C describes cash spot settlement."
        }
      },
      {
        id: 713,
        losCode: "LOS 34.b",
        stem: "A European call option has strike price X = $60.00 and trades at a premium of $5.00 when the underlying asset trades at $63.00. The call option's intrinsic value and time value are:",
        options: {
          A: "Intrinsic Value = $3.00; Time Value = $2.00",
          B: "Intrinsic Value = $5.00; Time Value = $0.00",
          C: "Intrinsic Value = $0.00; Time Value = $5.00"
        },
        correctOption: "A",
        algebraicSolution: "Intrinsic Value = max(0, S - X) = max(0, $63 - $60) = $3.00. Time Value = Total Option Premium - Intrinsic Value = $5.00 - $3.00 = $2.00.",
        calculatorKeystrokes: "63 [-] 60 [=] 3.00 (Intrinsic); 5.00 [-] 3.00 [=] 2.00 (Time Value)",
        trapCategory: "Valuation of Contingent Claims (Options)",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "CORRECT: Intrinsic value = $3.00; Time value = $2.00.",
          B: "Distractor B treats the entire premium as intrinsic value.",
          C: "Distractor C treats the option as out-of-the-money."
        }
      },
      {
        id: 714,
        losCode: "LOS 32.c",
        stem: "An investor who enters into a short futures contract is obligated to:",
        options: {
          A: "Sell the underlying asset at the agreed futures price at expiration",
          B: "Buy the underlying asset at the agreed futures price at expiration",
          C: "Pay an upfront option premium to maintain the right to sell"
        },
        correctOption: "A",
        algebraicSolution: "A short futures position creates a legally binding obligation to sell (deliver) the underlying asset at the agreed contract price upon expiration (or close out the position prior to delivery).",
        calculatorKeystrokes: "Concept: Short Futures = Obligation to Sell at agreed price.",
        trapCategory: "Derivative Instrument Features & Markets",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: Short futures creates the legal obligation to sell.",
          B: "Distractor B describes a long futures position.",
          C: "Distractor C describes a long put option buyer."
        }
      },
      {
        id: 715,
        losCode: "LOS 34.c",
        stem: "Under Put-Call Parity, if a synthetic long put position is constructed, the required asset combination is:",
        options: {
          A: "Long Call + Long Bond (PV of strike) + Short Stock",
          B: "Long Call + Short Bond + Long Stock",
          C: "Short Call + Long Bond + Long Stock"
        },
        correctOption: "A",
        algebraicSolution: "From Put-Call Parity: p_0 = c_0 + PV(X) - S_0. Therefore, Synthetic Long Put = Long Call (+c) + Long Bond (+PV(X)) + Short Stock (-S).",
        calculatorKeystrokes: "Formula: Synthetic Put = Long Call + PV(X) - Stock",
        trapCategory: "Put-Call Parity Directional Sign Trap",
        errorModeDefault: "SIGN_INVERSION",
        distractorAutopsy: {
          A: "CORRECT: p = c + PV(X) - S => Long Call + Long Bond + Short Stock.",
          B: "Distractor B inverts bond and stock signs.",
          C: "Distractor C creates a synthetic short put position."
        }
      }
    ]
  },

  // ==========================================
  // TOPIC 08: Alternative Investments (15 Questions)
  // ==========================================
  {
    id: "vignette-08-alts",
    topicId: "08",
    topicName: "Alternative Investments",
    subReading: "Hedge Funds, Private Equity, Real Estate Direct Capitalization & Commodities",
    difficulty: "High Trap",
    vignetteStem: "A private wealth family office allocates $10,000,000 to a hedge fund with a '2 and 20' fee structure (2% management fee on beginning-of-year assets, 20% incentive fee net of management fee with a $10,000,000 high-water mark). At year-end, gross fund value increases to $12,500,000.",
    questions: [
      {
        id: 801,
        losCode: "LOS 38.c",
        stem: "The total fees (management fee + incentive fee) earned by the hedge fund manager in Year 1 are closest to:",
        options: {
          A: "$660,000",
          B: "$700,000",
          C: "$500,000"
        },
        correctOption: "A",
        algebraicSolution: "Management Fee = 2% * $10,000,000 = $200,000. Net gain for incentive fee = $12,500,000 - $200,000 - $10,000,000 = $2,300,000. Incentive Fee = 20% * $2,300,000 = $460,000. Total Fee = $200,000 + $460,000 = $660,000.",
        calculatorKeystrokes: "10000000 [\\times] 0.02 [=] 200000 -> (12500000 [-] 200000 [-] 10000000) [\\times] 0.20 [+] 200000 [=] 660,000",
        trapCategory: "Hedge Funds & Fee Calculations",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "CORRECT: Accurately deducts management fee before computing incentive fee: $200k + $460k = $660,000.",
          B: "Distractor B computes the incentive fee gross of management fees: 20% * $2.5M = $500k + $200k = $700,000.",
          C: "Distractor C calculates only the gross incentive fee ($500,000) without adding the management fee."
        }
      },
      {
        id: 802,
        losCode: "LOS 37.b",
        stem: "A commercial office building generates $1,800,000 in potential gross income, with 5% vacancy/credit loss and $610,000 in operating expenses (including property taxes and insurance, but excluding $300,000 in mortgage interest). If market cap rate is 6.50%, estimated value is closest to:",
        options: {
          A: "$16,923,077",
          B: "$12,307,692",
          C: "$18,307,692"
        },
        correctOption: "A",
        algebraicSolution: "Effective Gross Income = $1,800,000 * 0.95 = $1,710,000. Net Operating Income (NOI) = $1,710,000 - $610,000 = $1,100,000 (NOI strictly excludes mortgage financing interest). Property Value = NOI / Cap Rate = $1,100,000 / 0.065 = $16,923,077.",
        calculatorKeystrokes: "(1800000 [\\times] 0.95 [-] 610000) [\\div] 0.065 [=] 16,923,076.92",
        trapCategory: "Real Estate & Infrastructure",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: NOI = $1,710,000 - $610,000 = $1,100,000. Value = $1,100,000 / 0.065 = $16,923,077.",
          B: "Distractor B erroneously subtracts mortgage interest from NOI ($1.1M - $300k = $800k / 0.065 = $12,307,692).",
          C: "Distractor C forgets to deduct operating expenses from gross revenue."
        }
      },
      {
        id: 803,
        losCode: "LOS 36.b",
        stem: "In private equity, the 'clawback' provision requires the General Partner (GP) to:",
        options: {
          A: "Return previously distributed carried interest if overall fund performance later falls below agreed thresholds",
          B: "Reinvest management fees back into portfolio companies experiencing distress",
          C: "Compensate limited partners for capital gains tax liabilities"
        },
        correctOption: "A",
        algebraicSolution: "A clawback provision protects Limited Partners (LPs) by legally requiring the GP to return carried interest distributions received from early profitable deals if subsequent fund investments underperform or fail to meet the preferred hurdle return.",
        calculatorKeystrokes: "Concept: Clawback = GP returns excess carried interest to LPs.",
        trapCategory: "Private Equity & Venture Capital",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: Clawback mandates return of excess carried interest to LPs upon aggregate fund underperformance.",
          B: "Distractor B confuses management fees with carried interest waterfalls.",
          C: "Distractor C is an invented tax concept."
        }
      },
      {
        id: 804,
        losCode: "LOS 38.d",
        stem: "When a commodity futures market is in 'contango', the futures price is higher than the spot price. In this environment, an investor rolling a long futures position forward at expiration will experience a:",
        options: {
          A: "Negative roll yield (buying more expensive longer-dated futures)",
          B: "Positive roll yield (selling expiring futures at a premium)",
          C: "Zero roll yield because convenience yield matches storage costs"
        },
        correctOption: "A",
        algebraicSolution: "Contango: Futures Price > Spot Price (upward-sloping forward curve). When long futures positions are rolled forward, the investor sells the cheaper expiring contract and buys a more expensive later-dated contract, generating a Negative Roll Yield.",
        calculatorKeystrokes: "Rule: Contango => Futures > Spot => Negative Roll Yield on Long Futures.",
        trapCategory: "Commodities & Futures Curves",
        errorModeDefault: "SIGN_INVERSION",
        distractorAutopsy: {
          A: "CORRECT: Rolling long futures upward along a contango curve generates negative roll yield.",
          B: "Distractor B describes backwardation (where roll yield is positive).",
          C: "Distractor C describes a flat forward curve."
        }
      },
      {
        id: 805,
        losCode: "LOS 35.b",
        stem: "Which of the following biases in alternative investment performance indices results from unsuccessful hedge funds dropping out of database reporting?",
        options: {
          A: "Survivorship bias",
          B: "Backfill bias",
          C: "Selection bias"
        },
        correctOption: "A",
        algebraicSolution: "Survivorship bias occurs when closed or liquidated funds with poor historical performance are removed from databases, artificially inflating the reported historical average return of remaining 'surviving' funds.",
        calculatorKeystrokes: "Concept: Survivorship bias = Excluding failed funds inflates benchmark returns.",
        trapCategory: "Overview of Alternative Investments",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: Survivorship bias removes failed funds, overstating average returns.",
          B: "Distractor B occurs when newly added funds backfill past successful returns.",
          C: "Distractor C occurs because reporting to databases is voluntary."
        }
      },
      {
        id: 806,
        losCode: "LOS 37.c",
        stem: "A commercial property sells for $12,000,000 and generates annual gross income of $1,500,000. The property's Gross Income Multiplier (GIM) is closest to:",
        options: {
          A: "8.00x",
          B: "12.50x",
          C: "0.125x"
        },
        correctOption: "A",
        algebraicSolution: "Gross Income Multiplier (GIM) = Sales Price / Gross Income = $12,000,000 / $1,500,000 = 8.00x.",
        calculatorKeystrokes: "12000000 [\\div] 1500000 [=] 8.00",
        trapCategory: "Real Estate & Infrastructure",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "CORRECT: GIM = Price / Gross Income = 12M / 1.5M = 8.00x.",
          B: "Distractor B computes 1 / 0.08 = 12.5x.",
          C: "Distractor C computes Gross Income / Price = 0.125 (12.5%)."
        }
      },
      {
        id: 807,
        losCode: "LOS 36.c",
        stem: "In a Leveraged Buyout (LBO), value creation is primarily driven by:",
        options: {
          A: "Using target company cash flows to pay down acquisition debt, EBITDA growth, and multiple expansion",
          B: "Issuing public common equity at low valuation multiples",
          C: "Eliminating all operating expenses and transferring employees to government contracts"
        },
        correctOption: "A",
        algebraicSolution: "LBOs create equity value through three primary mechanisms: (1) Deleveraging (using target operating cash flows to pay down high acquisition debt), (2) Operational improvements (EBITDA growth), and (3) Multiple expansion at exit.",
        calculatorKeystrokes: "Concept: LBO Value Drivers = Debt Paydown + EBITDA Growth + Multiple Expansion.",
        trapCategory: "Private Equity & Venture Capital",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: Deleveraging, operational efficiency, and exit multiples drive LBO equity returns.",
          B: "Distractor B describes equity dilution.",
          C: "Distractor C is an unrealistic operational premise."
        }
      },
      {
        id: 808,
        losCode: "LOS 36.d",
        stem: "In venture capital financing, which stage of investment is typically used to fund prototype commercial production and initial sales before mass market expansion?",
        options: {
          A: "Early-stage financing",
          B: "Seed-stage financing",
          C: "Mezzanine financing"
        },
        correctOption: "A",
        algebraicSolution: "Seed stage funds initial concept/business plan development. Early-stage financing (Series A/B) funds commercial prototype development and initial market sales. Mezzanine stage prepares the company for an IPO.",
        calculatorKeystrokes: "Concept: Seed = Concept; Early Stage = Prototype/Initial Sales; Mezzanine = Pre-IPO.",
        trapCategory: "Private Equity & Venture Capital",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: Early-stage financing supports prototype commercialization and initial sales.",
          B: "Distractor B funds preliminary business concept validation before commercial production.",
          C: "Distractor C is late-stage bridge financing before public listing."
        }
      },
      {
        id: 809,
        losCode: "LOS 38.b",
        stem: "The total return on a fully collateralized commodity futures contract is composed of which three components?",
        options: {
          A: "Spot price return + Roll yield + Collateral (risk-free) yield",
          B: "Dividend yield + Convenience yield + Capital gains return",
          C: "Spot price return + Storage yield + Franchise margin"
        },
        correctOption: "A",
        algebraicSolution: "Total Commodity Futures Return = Spot Price Return (change in spot price) + Roll Yield (gain/loss from rolling contracts across forward curve) + Collateral Yield (interest earned on posted cash margin).",
        calculatorKeystrokes: "Formula: Commodity Return = Spot Return + Roll Yield + Collateral Yield.",
        trapCategory: "Commodities & Futures Curves",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: Spot return + Roll yield + Collateral yield.",
          B: "Distractor B includes equity dividend concepts.",
          C: "Distractor C invents unapproved yield components."
        }
      },
      {
        id: 810,
        losCode: "LOS 37.d",
        stem: "Compared to brownfield infrastructure investments, greenfield infrastructure investments typically feature:",
        options: {
          A: "Higher construction and development risk with no immediate operating cash flows",
          B: "Lower expected returns and fully operational asset histories",
          C: "Immediate high dividend yields backed by municipal contracts"
        },
        correctOption: "A",
        algebraicSolution: "Greenfield infrastructure involves building new assets from scratch, entailing substantial development, construction, and licensing risks with zero initial cash flows. Brownfield investments involve existing operational assets with predictable cash flow histories.",
        calculatorKeystrokes: "Concept: Greenfield = Construction Risk, No initial cash flows; Brownfield = Operational.",
        trapCategory: "Real Estate & Infrastructure",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: Greenfield projects carry development risk and lack initial operational cash flows.",
          B: "Distractor B describes brownfield infrastructure.",
          C: "Distractor C describes mature contracted brownfield assets."
        }
      },
      {
        id: 811,
        losCode: "LOS 38.a",
        stem: "A hedge fund with $100M in AUM has a 20% incentive fee subject to a 5% soft hurdle rate and an independent high-water mark of $100M. If the fund earns 10% gross return in Year 1 ($10M gain) before management fees, the incentive fee is closest to:",
        options: {
          A: "$2,000,000 (calculated on entire $10M gain because return exceeds soft hurdle)",
          B: "$1,000,000 (calculated only on excess return above 5% hurdle)",
          C: "$0 (because return did not clear hard hurdle thresholds)"
        },
        correctOption: "A",
        algebraicSolution: "Under a soft hurdle rate, once the fund's return clears the hurdle threshold (10% > 5%), the 20% incentive fee is calculated on the ENTIRE profit: 20% * $10,000,000 = $2,000,000. (Under a hard hurdle, it would apply only to the excess above 5%).",
        calculatorKeystrokes: "Soft Hurdle: 0.20 [\\times] 10000000 [=] 2,000,000",
        trapCategory: "Hedge Funds & Fee Calculations",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "CORRECT: Soft hurdle applies incentive fee to total profits once hurdle is exceeded ($2.0M).",
          B: "Distractor B describes a hard hurdle: 20% * ($10M - $5M) = $1,000,000.",
          C: "Distractor C assumes the hurdle was not met."
        }
      },
      {
        id: 812,
        losCode: "LOS 35.c",
        stem: "Alternative investments typically exhibit return distributions characterized by:",
        options: {
          A: "Negative skewness and excess kurtosis (fat tails)",
          B: "Perfect normal distribution with zero skewness",
          C: "Positive skewness with low standard deviation and zero kurtosis"
        },
        correctOption: "A",
        algebraicSolution: "Alternative investment returns (hedge funds, private equity, real estate) frequently exhibit non-normal distributions with negative skewness (frequent small gains and occasional large drawdowns) and leptokurtosis / fat tails.",
        calculatorKeystrokes: "Concept: Alts distributions = Negative Skewness + Fat Tails (Leptokurtosis).",
        trapCategory: "Overview of Alternative Investments",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: Non-normal distributions with asymmetric downside risk and fat tails.",
          B: "Distractor B is standard Gaussian distribution, rarely observed in alts.",
          C: "Distractor C underestimates tail risk."
        }
      },
      {
        id: 813,
        losCode: "LOS 37.a",
        stem: "Appraisal-based real estate index returns tend to underestimate portfolio risk and overestimate diversification benefits because:",
        options: {
          A: "Periodic appraisals cause appraisal smoothing, muting reported return volatility and dampening correlations",
          B: "Appraisers use market mark-to-market prices from public stock exchanges",
          C: "Real estate properties are traded continuously on open electronic order books"
        },
        correctOption: "A",
        algebraicSolution: "Because real estate assets trade infrequently, indices rely on subjective periodic appraisals. Appraisers anchor on historical values, creating appraisal smoothing that artificially lowers standard deviation and dampens correlation with equities.",
        calculatorKeystrokes: "Concept: Appraisal Smoothing = Artificially Low Volatility & Correlations.",
        trapCategory: "Real Estate & Infrastructure",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: Appraisal smoothing understates true volatility and overstates diversification.",
          B: "Distractor B describes public REIT indices.",
          C: "Distractor C is false for direct private real estate."
        }
      },
      {
        id: 814,
        losCode: "LOS 36.a",
        stem: "In private equity fund agreements, committed capital represents:",
        options: {
          A: "The total capital amount limited partners have legally pledged to contribute over the investment period",
          B: "The cash amount already drawn down and invested into operating companies",
          C: "The cumulative profits returned to limited partners net of carried interest"
        },
        correctOption: "A",
        algebraicSolution: "Committed capital is the total legally pledged amount that LPs agree to provide over the fund's investment period (typically 3–5 years). Management fees are commonly charged on committed capital during the initial commitment period.",
        calculatorKeystrokes: "Concept: Committed Capital = Total legally pledged capital.",
        trapCategory: "Private Equity & Venture Capital",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: Committed capital is the total contractual pledge.",
          B: "Distractor B describes invested / called-down capital.",
          C: "Distractor C describes cumulative distributions."
        }
      },
      {
        id: 815,
        losCode: "LOS 38.e",
        stem: "A real estate investment trust (REIT) is best valued using which metric that adjusts net income by adding back depreciation and subtracting gains on property sales?",
        options: {
          A: "Funds From Operations (FFO)",
          B: "Gross Domestic Product (GDP)",
          C: "Earnings Before Interest and Taxes (EBIT)"
        },
        correctOption: "A",
        algebraicSolution: "Funds From Operations (FFO) = Accounting Net Income + Real Estate Depreciation - Gains from Property Sales. FFO provides a clearer operational cash earnings picture by eliminating distortive non-cash real estate depreciation.",
        calculatorKeystrokes: "Formula: FFO = Net Income + Depreciation - Property Sale Gains.",
        trapCategory: "Real Estate & Infrastructure",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: FFO is the standard operational cash metric for REIT valuation.",
          B: "Distractor B is a macroeconomic metric.",
          C: "Distractor C does not adjust for property depreciation."
        }
      }
    ]
  },

  // ==========================================
  // TOPIC 09: Portfolio Construction (15 Questions)
  // ==========================================
  {
    id: "vignette-09-port",
    topicId: "09",
    topicName: "Portfolio Construction",
    subReading: "Portfolio Risk & Return, CAPM, SML vs CML, IPS Governance & Performance Ratios",
    difficulty: "High Trap",
    vignetteStem: "An institutional endowment has a risk-free rate R_f = 4.00% and expected market return E(R_m) = 10.00%. An equity fund manager analyzes Stock Delta, which has an expected return of 13.50% and standard deviation of 24.0%. Market volatility is 15.0%, and correlation is 0.75.",
    questions: [
      {
        id: 901,
        losCode: "LOS 41.c",
        stem: "The beta of Stock Delta and its CAPM required rate of return are closest to:",
        options: {
          A: "Beta = 1.20; Required Return = 11.20%",
          B: "Beta = 1.20; Required Return = 13.50%",
          C: "Beta = 0.47; Required Return = 6.82%"
        },
        correctOption: "A",
        algebraicSolution: "Beta = Correlation * (σ_asset / σ_market) = 0.75 * (24.0% / 15.0%) = 0.75 * 1.60 = 1.20. CAPM Required Return = R_f + Beta * [E(R_m) - R_f] = 4.0% + 1.20 * (10.0% - 4.0%) = 4.0% + 1.20 * (6.0%) = 4.0% + 7.20% = 11.20%.",
        calculatorKeystrokes: "0.75 [\\times] (24 [\\div] 15) [=] 1.20 -> 4 [+] 1.20 [\\times] 6 [=] 11.20%",
        trapCategory: "Beta Ratio Inversion (Market vs Asset Volatility)",
        errorModeDefault: "SIGN_INVERSION",
        distractorAutopsy: {
          A: "CORRECT: Beta = 0.75 * (24/15) = 1.20. Required Return = 4% + 1.20*(6%) = 11.20%.",
          B: "Distractor B confuses the forecast expected return (13.50%) with the CAPM required return.",
          C: "Distractor C inverts the standard deviation ratio (0.75 * 15/24 = 0.46875)."
        }
      },
      {
        id: 902,
        losCode: "LOS 41.d",
        stem: "Based on its expected return of 13.50% and required return of 11.20%, Stock Delta plots relative to the Security Market Line (SML) as:",
        options: {
          A: "Above the SML and is undervalued (generate buy recommendation)",
          B: "Above the SML and is overvalued (generate sell recommendation)",
          C: "Below the SML and is overvalued (generate sell recommendation)"
        },
        correctOption: "A",
        algebraicSolution: "Alpha = Expected Return - Required Return = 13.50% - 11.20% = +2.30% (Positive Alpha). An asset offering higher expected return than required for its systematic beta risk plots ABOVE the SML and is undervalued.",
        calculatorKeystrokes: "13.50 [-] 11.20 [=] +2.30% (Undervalued / Buy)",
        trapCategory: "Underpriced vs Overpriced SML Plot Inversion",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: Expected Return > Required Return => Positive Alpha (+2.30%) => Plots Above SML => Undervalued.",
          B: "Distractor B correctly identifies that it plots above SML but makes polarity inversion concluding overvalued.",
          C: "Distractor C assumes it plots below the SML."
        }
      },
      {
        id: 903,
        losCode: "LOS 41.a",
        stem: "The Capital Market Line (CML) graphs expected return against which measure of risk for efficient portfolios?",
        options: {
          A: "Total risk as measured by standard deviation (σ)",
          B: "Systematic risk as measured by beta (β)",
          C: "Unsystematic idiosyncratic firm-specific variance"
        },
        correctOption: "A",
        algebraicSolution: "The Capital Market Line (CML) graphs expected return against Total Risk (standard deviation σ) and applies strictly to efficient portfolios. The Security Market Line (SML) graphs expected return against Systematic Risk (Beta β) and applies to all securities.",
        calculatorKeystrokes: "Concept: CML = Total Risk (sigma); SML = Systematic Risk (beta).",
        trapCategory: "Portfolio Risk and Return: Part II (CAPM & SML)",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: CML uses total risk standard deviation (σ).",
          B: "Distractor B describes the Security Market Line (SML).",
          C: "Distractor C is diversified away in efficient portfolios."
        }
      },
      {
        id: 904,
        losCode: "LOS 41.e",
        stem: "Portfolio A generated an annualized return of 14.0% with standard deviation of 18.0% and beta of 1.25. If the risk-free rate is 3.0%, the Sharpe Ratio and Treynor Ratio for Portfolio A are closest to:",
        options: {
          A: "Sharpe = 0.611; Treynor = 8.80%",
          B: "Sharpe = 8.80%; Treynor = 0.611",
          C: "Sharpe = 0.778; Treynor = 11.20%"
        },
        correctOption: "A",
        algebraicSolution: "Excess Return = 14.0% - 3.0% = 11.0%. Sharpe Ratio = (R_p - R_f) / σ_p = 11.0% / 18.0% = 0.6111. Treynor Ratio = (R_p - R_f) / β_p = 11.0% / 1.25 = 8.80%.",
        calculatorKeystrokes: "(14 [-] 3) [\\div] 18 [=] 0.6111; (14 [-] 3) [\\div] 1.25 [=] 8.80",
        trapCategory: "Portfolio Risk and Return: Part II (CAPM & SML)",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "CORRECT: Sharpe = 11/18 = 0.611; Treynor = 11/1.25 = 8.80%.",
          B: "Distractor B inverts Sharpe and Treynor metrics.",
          C: "Distractor C uses raw return 14% without subtracting the risk-free rate."
        }
      },
      {
        id: 905,
        losCode: "LOS 41.f",
        stem: "The Sortino ratio is superior to the Sharpe ratio when evaluating portfolios that have:",
        options: {
          A: "Non-normal, positively skewed return distributions with minimal downside volatility",
          B: "Identical upside and downside standard deviations",
          C: "Zero risk-free benchmark returns"
        },
        correctOption: "A",
        algebraicSolution: "The Sortino ratio replaces total standard deviation in the denominator with Downside Semi-Deviation (measuring only returns below a target threshold), preventing managers with high positive upside volatility from being penalized.",
        calculatorKeystrokes: "Concept: Sortino Ratio = (R_p - R_target) / Downside Deviation.",
        trapCategory: "Portfolio Risk and Return: Part II (CAPM & SML)",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: Sortino penalizes only downside volatility, favoring positively skewed portfolios.",
          B: "Distractor B yields identical results between Sharpe and Sortino.",
          C: "Distractor C is irrelevant to denominator risk measures."
        }
      },
      {
        id: 906,
        losCode: "LOS 39.b",
        stem: "When establishing a client's risk tolerance in an Investment Policy Statement (IPS), if a client exhibits high willingness to take risk but has low financial ability to take risk, the portfolio manager should conclude the overall risk tolerance is:",
        options: {
          A: "Low",
          B: "High",
          C: "Moderate (simple average of willingness and ability)"
        },
        correctOption: "A",
        algebraicSolution: "When willingness and ability to bear risk conflict, the lower of the two (ability) must always dominate to protect the client's financial viability and liquidity needs.",
        calculatorKeystrokes: "IPS Rule: Lower of Willingness and Ability dominates overall Risk Tolerance.",
        trapCategory: "Portfolio Management: An Overview",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: Ability to take risk constrains willingness; the lower metric dominates.",
          B: "Distractor B endangers client solvency.",
          C: "Distractor C uses an unapproved averaging shortcut."
        }
      },
      {
        id: 907,
        losCode: "LOS 39.c",
        stem: "In the standard IPS framework, which of the following is categorized as a Constraint (RRTTLLU)?",
        options: {
          A: "Liquidity requirements and Time horizon",
          B: "Return objective and Risk tolerance",
          C: "Benchmark selection and Alpha target"
        },
        correctOption: "A",
        algebraicSolution: "IPS Objectives = Risk and Return. IPS Constraints (RRTTLLU) = Risk, Return (Objectives) + Time horizon, Tax concerns, Liquidity needs, Legal/regulatory factors, Unique circumstances (Constraints).",
        calculatorKeystrokes: "IPS Framework: Objectives = Risk & Return; Constraints = TTLLU.",
        trapCategory: "Portfolio Management: An Overview",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: Liquidity and Time Horizon are primary constraints.",
          B: "Distractor B describes portfolio Objectives.",
          C: "Distractor C describes tactical execution parameters."
        }
      },
      {
        id: 908,
        losCode: "LOS 40.c",
        stem: "The correlation coefficient between two assets is -1.0. By combining these two assets in appropriate weights, an investor can construct a portfolio with:",
        options: {
          A: "Zero portfolio variance (zero risk)",
          B: "Variance equal to the weighted average of individual variances",
          C: "Higher variance than either standalone asset"
        },
        correctOption: "A",
        algebraicSolution: "When ρ = -1.0 (perfect negative correlation), there exists a unique combination of weights w1 = σ2 / (σ1 + σ2) and w2 = 1 - w1 where portfolio standard deviation is exactly zero.",
        calculatorKeystrokes: "Concept: Correlation = -1.0 allows construction of a zero-variance risk-free portfolio.",
        trapCategory: "Portfolio Risk and Return: Part I",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: Perfect negative correlation allows complete elimination of portfolio risk.",
          B: "Distractor B is true only when correlation ρ = +1.0.",
          C: "Distractor C is mathematically impossible."
        }
      },
      {
        id: 909,
        losCode: "LOS 40.d",
        stem: "The set of all portfolios that offer the maximum expected return for a given level of risk (or minimum risk for a given expected return) is called the:",
        options: {
          A: "Efficient Frontier",
          B: "Capital Allocation Line",
          C: "Global Minimum Variance Portfolio"
        },
        correctOption: "A",
        algebraicSolution: "The Efficient Frontier represents the optimal subset of portfolios along the upper boundary of the minimum-variance frontier that maximize expected return for every level of variance.",
        calculatorKeystrokes: "Concept: Efficient Frontier = Maximum return for each risk level.",
        trapCategory: "Portfolio Risk and Return: Part I",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: The efficient frontier is the optimal upper boundary.",
          B: "Distractor B is the straight line combining a risk-free asset with a risky portfolio.",
          C: "Distractor C is the single point with the lowest absolute variance on the frontier."
        }
      },
      {
        id: 910,
        losCode: "LOS 41.b",
        stem: "In a well-diversified portfolio containing 50 individual stocks, the primary determinant of total portfolio risk is:",
        options: {
          A: "Covariance among the individual securities",
          B: "Individual variance of each standalone stock",
          C: "The weighted average dividend yields of the companies"
        },
        correctOption: "A",
        algebraicSolution: "As the number of assets n in a portfolio increases, individual asset variances contribute 1/n to total risk and approach zero, while the n(n-1) pairwise covariance terms dominate total portfolio risk.",
        calculatorKeystrokes: "Rule: In large portfolios, pairwise covariance dominates standalone variance.",
        trapCategory: "Portfolio Risk and Return: Part II (CAPM & SML)",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: Covariance among assets drives large portfolio variance.",
          B: "Distractor B is diversified away as n increases.",
          C: "Distractor C is unrelated to risk variance."
        }
      },
      {
        id: 911,
        losCode: "LOS 41.g",
        stem: "An active fund manager reports a portfolio return of 15.0% and beta of 1.10. If the risk-free rate is 4.0% and the market return is 12.0%, Jensen's Alpha for the fund is closest to:",
        options: {
          A: "+2.20%",
          B: "+3.00%",
          C: "-1.80%"
        },
        correctOption: "A",
        algebraicSolution: "CAPM Required Return = R_f + Beta * [E(R_m) - R_f] = 4.0% + 1.10 * (12.0% - 4.0%) = 4.0% + 1.10 * 8.0% = 4.0% + 8.80% = 12.80%. Jensen's Alpha = Actual Return - Required Return = 15.0% - 12.80% = +2.20%.",
        calculatorKeystrokes: "15.0 [-] (4.0 [+] 1.10 [\\times] (12.0 [-] 4.0)) [=] +2.20%",
        trapCategory: "Portfolio Risk and Return: Part II (CAPM & SML)",
        errorModeDefault: "SIGN_INVERSION",
        distractorAutopsy: {
          A: "CORRECT: Alpha = 15.0% - 12.80% = +2.20%.",
          B: "Distractor B computes excess return over market: 15.0% - 12.0% = +3.00%, ignoring beta risk.",
          C: "Distractor C inverts the alpha sign."
        }
      },
      {
        id: 912,
        losCode: "LOS 39.a",
        stem: "The portfolio management process consists of three continuous, iterative steps in which sequence?",
        options: {
          A: "Planning -> Execution -> Feedback",
          B: "Execution -> Feedback -> Planning",
          C: "Optimization -> Trading -> Rebalancing"
        },
        correctOption: "A",
        algebraicSolution: "The CFA Institute portfolio management process follows: (1) Planning (IPS creation, asset allocation), (2) Execution (portfolio construction, security selection), and (3) Feedback (performance attribution, monitoring, rebalancing).",
        calculatorKeystrokes: "Sequence: Planning -> Execution -> Feedback.",
        trapCategory: "Portfolio Management: An Overview",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: Planning, Execution, and Feedback is the official three-step process.",
          B: "Distractor B is out of chronological order.",
          C: "Distractor C describes tactical trading steps."
        }
      },
      {
        id: 913,
        losCode: "LOS 42.c",
        stem: "Strategic Asset Allocation (SAA) combines the investor's IPS objectives and capital market expectations to establish:",
        options: {
          A: "Long-term target asset class weights designed to achieve client objectives",
          B: "Short-term tactical deviations based on immediate market mispricings",
          C: "Specific stock ticker execution orders for high-frequency trading"
        },
        correctOption: "A",
        algebraicSolution: "Strategic Asset Allocation (SAA) establishes the long-term target asset mix (e.g. 60% equities / 40% bonds) that balances risk and return over the client's investment horizon. Tactical Asset Allocation (TAA) involves short-term deviations.",
        calculatorKeystrokes: "Concept: SAA = Long-term target asset class weights.",
        trapCategory: "Basics of Portfolio Planning and Construction",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: SAA establishes long-term policy asset weights.",
          B: "Distractor B defines Tactical Asset Allocation (TAA).",
          C: "Distractor C defines security selection."
        }
      },
      {
        id: 914,
        losCode: "LOS 41.h",
        stem: "If an asset has a beta of 0.0, according to CAPM, its expected rate of return is equal to:",
        options: {
          A: "The risk-free rate R_f",
          B: "Zero",
          C: "The expected market return E(R_m)"
        },
        correctOption: "A",
        algebraicSolution: "CAPM: E(R) = R_f + Beta * [E(R_m) - R_f]. If Beta = 0, E(R) = R_f + 0 * [E(R_m) - R_f] = R_f.",
        calculatorKeystrokes: "Formula: E(R) = R_f + 0 = R_f.",
        trapCategory: "Portfolio Risk and Return: Part II (CAPM & SML)",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "CORRECT: A zero-beta asset earns the risk-free rate.",
          B: "Distractor B confuses zero systematic risk with zero return.",
          C: "Distractor C is true for a beta = 1.0 asset."
        }
      },
      {
        id: 915,
        losCode: "LOS 40.b",
        stem: "An investor's risk-aversion utility function is U = E(R) - 0.5 * A * σ^2. If risk-aversion parameter A increases, the investor requires:",
        options: {
          A: "A higher expected return for any given increase in portfolio variance",
          B: "A lower expected return for any given increase in portfolio variance",
          C: "Zero variance regardless of return"
        },
        correctOption: "A",
        algebraicSolution: "The risk aversion parameter A measures the penalty an investor places on risk. A higher A means the negative penalty term (0.5 * A * σ^2) is larger, requiring steeper indifference curves and higher expected return for taking on risk.",
        calculatorKeystrokes: "Utility: Higher A => Steeper indifference curve => Demands higher return per unit variance.",
        trapCategory: "Portfolio Risk and Return: Part I",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: Higher A increases the risk penalty, demanding higher compensatory returns.",
          B: "Distractor B describes lower risk aversion.",
          C: "Distractor C describes total risk intolerance."
        }
      }
    ]
  },

  // ==========================================
  // TOPIC 10: Ethics (15 Questions)
  // ==========================================
  {
    id: "vignette-10-ethics",
    topicId: "10",
    topicName: "Ethics",
    subReading: "Code of Ethics, Standards I–VII & GIPS Compliance",
    difficulty: "High Trap",
    vignetteStem: "Sarah Jenkins, CFA, manages discretionary equity portfolios at Apex Wealth. A regional broker provides Apex with in-depth proprietary equity research models and proposes using soft dollar client commissions to purchase Bloomberg terminals for Apex's research analysts and fund travel expenses for Jenkins to attend an annual issuer due diligence symposium in Geneva.",
    questions: [
      {
        id: 1001,
        losCode: "LOS 44.c",
        stem: "Under Standard III(A) Loyalty, Prudence, and Care, which of the proposed expenditures is permissible using client soft dollar brokerage commissions?",
        options: {
          A: "Proprietary equity research models and Bloomberg research data feeds only",
          B: "Bloomberg research terminals and travel expenses to the Geneva symposium",
          C: "All proposed expenditures, provided full written disclosure is made to clients"
        },
        correctOption: "A",
        algebraicSolution: "Soft dollar commissions belong to the client. Under Standard III(A) and CFA Institute Soft Dollar Standards, commissions may ONLY be used to purchase research and brokerage services that directly aid the investment decision-making process for client accounts. Travel expenses and office administrative overhead are strictly prohibited.",
        calculatorKeystrokes: "Conceptual Rule: Soft dollars must directly benefit client investment decisions.",
        trapCategory: "Soft Dollar Beneficiary Distinction",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: Investment research models and data feeds directly benefit client decision-making.",
          B: "Distractor B fails to recognize that travel and lodging expenses cannot be paid with client soft dollars.",
          C: "Distractor C erroneously assumes client disclosure waives core fiduciary prohibitions on misappropriation of brokerage."
        }
      },
      {
        id: 1002,
        losCode: "LOS 45.b",
        stem: "Apex Asset Management claims compliance with the Global Investment Performance Standards (GIPS). An audit reveals that Apex excluded three unprofitable terminated institutional portfolios from its 5-year historical composite track record. Under GIPS rules, this practice:",
        options: {
          A: "Directly breaches GIPS provisions because composites must include all past fee-paying discretionary portfolios, including terminated accounts",
          B: "Is permissible under GIPS provided the portfolios were terminated due to client liquidation rather than manager underperformance",
          C: "Is permissible if the composite presentation clearly discloses the exclusion in a footnote"
        },
        correctOption: "A",
        algebraicSolution: "GIPS standards mandate that composites include all actual, fee-paying, discretionary portfolios managed to that strategy, including terminated accounts for the full duration of their existence to eliminate survivorship bias.",
        calculatorKeystrokes: "Conceptual Rule: GIPS requires inclusion of terminated accounts to prevent survivorship bias.",
        trapCategory: "GIPS Provisions & Composite Construction",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: GIPS strictly requires inclusion of terminated accounts to eliminate survivorship bias.",
          B: "Distractor B invents an unapproved liquidation exemption.",
          C: "Distractor C assumes footnote disclosures can override fundamental GIPS calculation rules."
        }
      },
      {
        id: 1003,
        losCode: "LOS 44.a",
        stem: "Under Standard I(A) Knowledge of the Law, if applicable local securities regulations conflict with the CFA Institute Code and Standards, a member must adhere to the:",
        options: {
          A: "Stricter of the local law or the Code and Standards",
          B: "Local law in all circumstances to avoid jurisdictional penalties",
          C: "CFA Institute Code and Standards regardless of local statutes"
        },
        correctOption: "A",
        algebraicSolution: "Standard I(A) explicitly requires members and candidates to comply with all applicable laws, rules, and regulations and always adhere to the stricter law, rule, or standard that governs their conduct.",
        calculatorKeystrokes: "Rule: Must follow the stricter of local law vs Code & Standards.",
        trapCategory: "Code of Ethics and Standards of Professional Conduct",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: Members must always follow the stricter standard.",
          B: "Distractor B fails if local law is less strict than Code & Standards.",
          C: "Distractor C fails if local law is stricter."
        }
      },
      {
        id: 1004,
        losCode: "LOS 44.b",
        stem: "Standard I(B) Independence and Objectivity permits a research analyst to accept which of the following from a corporate issuer being analyzed?",
        options: {
          A: "Modest, ordinary business meals and standard conference materials during a due diligence visit",
          B: "First-class luxury airfare and resort accommodations for the analyst and spouse",
          C: "Cash bonuses linked directly to issuing a positive 'Buy' recommendation"
        },
        correctOption: "A",
        algebraicSolution: "Under Standard I(B), analysts must maintain independence and objectivity. Modest ordinary business meals and token promotional materials are acceptable. Lavish travel, accommodations, or rating-contingent compensation are severe violations.",
        calculatorKeystrokes: "Rule: Modest business meals permitted; lavish travel or contingent pay strictly prohibited.",
        trapCategory: "Code of Ethics and Standards of Professional Conduct",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: Modest ordinary business meals do not compromise independent judgement.",
          B: "Distractor B breaches independence (analysts must pay for their own commercial travel).",
          C: "Distractor C is an egregious direct conflict of interest."
        }
      },
      {
        id: 1005,
        losCode: "LOS 44.d",
        stem: "Under Standard II(A) Material Nonpublic Information, the Mosaic Theory allows an analyst to trade on investment recommendations derived from:",
        options: {
          A: "Publicly available information combined with non-material nonpublic information",
          B: "Selective advance leaks of quarterly earnings results from the CFO",
          C: "Confidential merger negotiations disclosed during a private social dinner"
        },
        correctOption: "A",
        algebraicSolution: "The Mosaic Theory allows analysts to reach insightful investment conclusions by piecing together public financial disclosures with non-material non-public details (e.g. observing store traffic, supplier lead times), even if the conclusion itself would be material.",
        calculatorKeystrokes: "Concept: Mosaic Theory = Public Info + Non-Material Non-Public Info.",
        trapCategory: "Code of Ethics and Standards of Professional Conduct",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: The Mosaic Theory legitimizes research combining public and non-material non-public data.",
          B: "Distractor B is illegal trading on material non-public insider information.",
          C: "Distractor C is material non-public merger information."
        }
      },
      {
        id: 1006,
        losCode: "LOS 44.e",
        stem: "Under Standard III(B) Fair Dealing, when an investment firm issues a change in stock recommendation from 'Hold' to 'Strong Buy', the firm should:",
        options: {
          A: "Distribute the recommendation simultaneously to all clients for whom the strategy is suitable",
          B: "Execute buy orders for premium institutional clients first before notifying retail clients",
          C: "Allow research analysts to trade personal accounts before disseminating to clients"
        },
        correctOption: "A",
        algebraicSolution: "Standard III(B) requires fair dealing across all clients. Recommendations and trade allocations must be disseminated simultaneously to all clients for whom the strategy is suitable, without favoring premium or institutional tiers.",
        calculatorKeystrokes: "Rule: Fair Dealing = Simultaneous dissemination to all suitable clients.",
        trapCategory: "Code of Ethics and Standards of Professional Conduct",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: Fair dealing requires equal, simultaneous opportunity to act on recommendations.",
          B: "Distractor B violates fair dealing by creating tiered preferential execution.",
          C: "Distractor C violates Standard VI(B) Priority of Transactions (client trades come before personal trades)."
        }
      },
      {
        id: 1007,
        losCode: "LOS 44.f",
        stem: "Under Standard III(C) Suitability, when managing institutional portfolios according to a specific mandate, the portfolio manager must evaluate the suitability of individual securities in the context of the:",
        options: {
          A: "Overall portfolio investment strategy and mandate objectives",
          B: "Standalone volatility of the individual security in isolation",
          C: "Personal wealth holdings of the corporate board members"
        },
        correctOption: "A",
        algebraicSolution: "Standard III(C) mandates that suitability must be judged in the context of the total portfolio's risk-return objectives, constraints, and mandate, rather than evaluating individual assets in isolation.",
        calculatorKeystrokes: "Rule: Suitability must be assessed in Total Portfolio Context.",
        trapCategory: "Code of Ethics and Standards of Professional Conduct",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: Suitability is assessed in the context of the total client portfolio and mandate.",
          B: "Distractor B evaluates assets in isolation, ignoring portfolio diversification effects.",
          C: "Distractor C is irrelevant to institutional account mandates."
        }
      },
      {
        id: 1008,
        losCode: "LOS 44.g",
        stem: "Under Standard IV(A) Loyalty to Employer, an employee planning to resign and start a competing investment firm is permitted to:",
        options: {
          A: "Make preliminary legal arrangements to incorporate the new entity while on personal time",
          B: "Solicit current employer clients to transfer accounts prior to formal resignation",
          C: "Copy client contact lists and proprietary quantitative trading algorithms"
        },
        correctOption: "A",
        algebraicSolution: "Employees may make preliminary administrative preparations (incorporating, leasing space on personal time) before resigning, provided it does not conflict with their employer's business. Soliciting clients or misappropriating proprietary records before departure violates loyalty.",
        calculatorKeystrokes: "Rule: Preliminary setup on personal time is permitted; soliciting clients before resignation is banned.",
        trapCategory: "Code of Ethics and Standards of Professional Conduct",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: Preparing to start a business on personal time without competing is permitted.",
          B: "Distractor B directly breaches the duty of loyalty to the employer.",
          C: "Distractor C constitutes theft of employer trade secrets and property."
        }
      },
      {
        id: 1009,
        losCode: "LOS 44.h",
        stem: "Under Standard V(C) Record Retention, in the absence of local regulatory guidance, CFA Institute recommends that members retain research notes and records supporting investment decisions for at least:",
        options: {
          A: "7 years",
          B: "3 years",
          C: "10 years"
        },
        correctOption: "A",
        algebraicSolution: "Standard V(C) recommends maintaining records for a minimum of 7 years in the absence of specific regulatory mandates.",
        calculatorKeystrokes: "Rule: CFA Institute Record Retention benchmark = Minimum 7 Years.",
        trapCategory: "Code of Ethics and Standards of Professional Conduct",
        errorModeDefault: "FORMULA_SCALAR",
        distractorAutopsy: {
          A: "CORRECT: 7 years is the official CFA Institute recommended retention period.",
          B: "Distractor B is too short under CFA Institute guidelines.",
          C: "Distractor C exceeds the standard recommendation."
        }
      },
      {
        id: 1010,
        losCode: "LOS 44.i",
        stem: "Under Standard VI(B) Priority of Transactions, the required priority order for executing trade transactions is:",
        options: {
          A: "Client transactions first, then Employer transactions, then Personal/Beneficial transactions",
          B: "Personal transactions first, then Client transactions, then Employer transactions",
          C: "Employer transactions first, then Client transactions, then Personal transactions"
        },
        correctOption: "A",
        algebraicSolution: "Standard VI(B) mandates that investment transactions for clients and employers must have priority over transactions in which a member or candidate is the beneficial owner. Priority: (1) Clients, (2) Employer, (3) Personal accounts.",
        calculatorKeystrokes: "Rule: Trade Priority = Clients -> Employer -> Personal Accounts.",
        trapCategory: "Code of Ethics and Standards of Professional Conduct",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: Clients always come first, followed by employer, then personal trades.",
          B: "Distractor B represents illegal front-running.",
          C: "Distractor C improperly puts employer ahead of client fiduciary duties."
        }
      },
      {
        id: 1011,
        losCode: "LOS 44.j",
        stem: "Under Standard VII(A) Conduct as Participants in CFA Institute Programs, which of the following actions constitutes an explicit violation?",
        options: {
          A: "Disclosing specific actual exam questions or curriculum formulas tested on an online forum",
          B: "Expressing professional opinions regarding the difficulty of the CFA examination",
          C: "Participating in study groups to prepare for upcoming exam levels"
        },
        correctOption: "A",
        algebraicSolution: "Standard VII(A) strictly prohibits disclosing confidential exam content, specific exam topics tested, or actual exam questions. Expressing general personal opinions on exam difficulty or study prep is fully permitted.",
        calculatorKeystrokes: "Rule: Disclosing specific exam questions or tested topics is strictly prohibited.",
        trapCategory: "Code of Ethics and Standards of Professional Conduct",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: Revealing confidential exam questions violates Standard VII(A).",
          B: "Distractor B is permitted under CFA Institute guidance.",
          C: "Distractor C is encouraged study behavior."
        }
      },
      {
        id: 1012,
        losCode: "LOS 45.a",
        stem: "Under the Global Investment Performance Standards (GIPS), compliance must be claimed on a:",
        options: {
          A: "Firm-wide basis only",
          B: "Composite-by-composite or single fund basis",
          C: "Individual portfolio manager track record basis"
        },
        correctOption: "A",
        algebraicSolution: "GIPS compliance can only be claimed on a firm-wide basis across all actual fee-paying discretionary assets. A single department, product, or composite cannot claim GIPS compliance in isolation.",
        calculatorKeystrokes: "GIPS Rule: Compliance is strictly FIRM-WIDE.",
        trapCategory: "Introduction to GIPS Standards",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: GIPS compliance must be claimed firm-wide across all managed assets.",
          B: "Distractor B is explicitly prohibited under GIPS provisions.",
          C: "Distractor C violates firm definition rules."
        }
      },
      {
        id: 1013,
        losCode: "LOS 45.c",
        stem: "GIPS verification must be performed by:",
        options: {
          A: "An independent third-party verifier",
          B: "The firm's internal compliance committee",
          C: "The CFA Institute Professional Conduct Program staff"
        },
        correctOption: "A",
        algebraicSolution: "GIPS verification tests whether the firm has complied with composite construction rules on a firm-wide basis and must be conducted by a qualified independent third-party verifier (never internal staff or CFA Institute).",
        calculatorKeystrokes: "GIPS Rule: Verification requires an Independent Third-Party Verifier.",
        trapCategory: "Introduction to GIPS Standards",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: GIPS verification must be conducted by an independent third party.",
          B: "Distractor B cannot provide objective independent verification.",
          C: "Distractor C does not conduct individual firm verifications."
        }
      },
      {
        id: 1014,
        losCode: "LOS 44.k",
        stem: "Under Standard I(C) Misrepresentation, which of the following statements made by an investment advisor to a prospective client is a violation?",
        options: {
          A: "'Our quantitative bond strategy guarantees a minimum annual return of 8.00% without downside risk.'",
          B: "'Past performance is not indicative of future investment returns.'",
          C: "'Our investment team holds CFA charters and complies with the Code and Standards.'"
        },
        correctOption: "A",
        algebraicSolution: "Standard I(C) strictly prohibits guaranteeing performance or promising specific rates of return on risky securities.",
        calculatorKeystrokes: "Rule: Guaranteeing returns on risky investments violates Standard I(C) Misrepresentation.",
        trapCategory: "Code of Ethics and Standards of Professional Conduct",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: Promising guaranteed returns on risky securities is a direct misrepresentation violation.",
          B: "Distractor B is standard required regulatory disclosure.",
          C: "Distractor C is an accurate statement of fact."
        }
      },
      {
        id: 1015,
        losCode: "LOS 44.l",
        stem: "Under Standard II(B) Market Manipulation, which practice is designed to distort market liquidity or inflate security trading volume through simultaneous buying and selling orders with no real change in beneficial ownership?",
        options: {
          A: "Wash trading",
          B: "Front-running",
          C: "Mosaic analysis"
        },
        correctOption: "A",
        algebraicSolution: "Wash trading involves entering matched buying and selling orders with no genuine change in economic ownership to artificially inflate reported trading volume and mislead market participants.",
        calculatorKeystrokes: "Concept: Wash Trading = Fake volume creation with no change in ownership.",
        trapCategory: "Code of Ethics and Standards of Professional Conduct",
        errorModeDefault: "CONCEPTUAL_CONFUSION",
        distractorAutopsy: {
          A: "CORRECT: Wash trading is illegal transaction-based market manipulation.",
          B: "Distractor B is trading ahead of client orders (Standard VI(B)).",
          C: "Distractor C is legitimate fundamental research (Standard II(A))."
        }
      }
    ]
  }
];

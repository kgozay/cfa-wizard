import { CFATopic } from "@/types/cfa";

export const CFA_CURRICULUM: CFATopic[] = [
  {
    id: "01",
    name: "Ethical & Professional Standards",
    shortName: "Ethics",
    weight: "15–20%",
    weightCategory: "HIGH",
    highYieldTrapArea: "Soft dollars, Independence vs. gifts, GIPS composite rules",
    executiveSummary: [
      "Soft Dollar Allocations: Client brokerage belongs to the client; soft dollar purchases must provide direct investment decision-making benefit to the client (e.g., research reports yes, office hardware or rent strictly prohibited).",
      "Independence & Objectivity (Standard I-B): Modest ordinary business meals from corporate issuers are permitted with disclosure, but lavish travel, accommodations, or bonus compensation linked to positive ratings directly breach independence.",
      "GIPS Verification & Composites: GIPS compliance is strictly firm-wide (never on a single department or product); verification cannot be performed by the firm internally and must be conducted by an independent third party.",
      "Material Nonpublic Information (Standard II-A): The Mosaic Theory allows trading on public information combined with non-material nonpublic insights, but trading on selective corporate analyst call leaks constitutes an immediate violation."
    ],
    subReadings: [
      { id: "01-1", readingNumber: 1, title: "Code of Ethics and Standards of Professional Conduct", coreTrap: "Failing to recognize that members must follow the stricter of local law vs Code & Standards." },
      { id: "01-2", readingNumber: 2, title: "Guidance for Standards I–VII", coreTrap: "Treating personal account disclosure after client trades as sufficient when priority was not given." },
      { id: "01-3", readingNumber: 3, title: "Introduction to GIPS Standards", coreTrap: "Claiming GIPS compliance for a single isolated fund or composite instead of the entire firm." },
      { id: "01-4", readingNumber: 4, title: "GIPS Provisions & Composite Construction", coreTrap: "Excluding terminated portfolios from historical composite performance (survivorship bias)." }
    ],
    formulas: [
      {
        id: "gips-composite-twr",
        title: "Time-Weighted Rate of Return (GIPS Linking)",
        latex: "R_{TWR} = \\prod_{t=1}^k (1 + R_t) - 1",
        description: "GIPS mandates daily or monthly valuation and time-weighted returns to eliminate the distortive effect of client cash contributions and withdrawals.",
        calculatorKeystrokes: "[1 + R_1] [\\times] [1 + R_2] ... [-] 1",
      },
      {
        id: "sharpe-ex-post",
        title: "Ex-Post Composite Sharpe Ratio",
        latex: "S_p = \\frac{\\bar{R}_p - \\bar{R}_f}{\\sigma_p}",
        description: "Required under GIPS 3-year annualized ex-post standard deviation disclosures for composite presentation.",
        calculatorKeystrokes: "[DATA] -> Input Returns -> [STAT] -> [2nd][1-V] -> Read \\bar{x} and S_x",
      }
    ]
  },
  {
    id: "02",
    name: "Financial Statement Analysis",
    shortName: "FSA",
    weight: "11–14%",
    weightCategory: "HIGH",
    highYieldTrapArea: "Operating vs. finance lease adjustments, LIFO reserve & inventory conversion",
    executiveSummary: [
      "LIFO to FIFO Conversion: $Inventory_{FIFO} = Inventory_{LIFO} + LIFO\\ Reserve$. COGS adjustment: $COGS_{FIFO} = COGS_{LIFO} - \\Delta LIFO\\ Reserve$. In rising prices, FIFO yields higher net income and higher ending inventory.",
      "Lease Accounting Impact: Finance (IFRS single model / US GAAP finance) leases shift lease expenses from operating cash flow (CFO) to financing cash flow (CFF as principal repayment), artificially boosting CFO and EBITDA.",
      "Capitalized vs Expensed Costs: Capitalizing costs artificially increases current CFO (by shifting outflows to CFI as capex), increases short-term net income, and increases asset turnover in subsequent periods.",
      "Deferred Tax Asset/Liability Reversal: If a Deferred Tax Liability (DTL) is expected never to reverse (due to continuous capital reinvestment and growth), analysts treat it as Equity rather than a liability."
    ],
    subReadings: [
      { id: "02-1", readingNumber: 5, title: "Financial Reporting Mechanics & Statements", coreTrap: "Misclassifying interest received (US GAAP CFO vs IFRS CFO or CFI) and dividends paid." },
      { id: "02-2", readingNumber: 6, title: "Inventories: LIFO, FIFO, and Reserve Adjustments", coreTrap: "Forgetting to multiply LIFO Reserve change by tax rate when calculating retained earnings adjustment." },
      { id: "02-3", readingNumber: 7, title: "Long-Lived Assets & Capitalization vs Expensing", coreTrap: "Overlooking the impact of capitalized interest on CFI outflows and future depreciation." },
      { id: "02-4", readingNumber: 8, title: "Income Taxes & Deferred Tax Liabilities", coreTrap: "Failing to revalue DTL when tax rates change (change immediately impacts income statement)." },
      { id: "02-5", readingNumber: 9, title: "Financial Reporting Quality & Red Flags", coreTrap: "Assuming aggressive revenue recognition only impacts the current period rather than future DSO." }
    ],
    formulas: [
      {
        id: "lifo-reserve-cogs",
        title: "LIFO to FIFO COGS Conversion",
        latex: "COGS_{FIFO} = COGS_{LIFO} - (LIFO\\ Reserve_{end} - LIFO\\ Reserve_{beg})",
        description: "Adjusts cost of goods sold from LIFO to FIFO to enable cross-company comparisons.",
        calculatorKeystrokes: "[COGS_LIFO] [-] [(] [Reserve_end] [-] [Reserve_beg] [)] [=]",
        variables: [
          { name: "COGS (LIFO)", symbol: "COGS_L", defaultVal: 840000, step: 10000 },
          { name: "Ending LIFO Reserve", symbol: "LR_end", defaultVal: 120000, step: 5000 },
          { name: "Beginning LIFO Reserve", symbol: "LR_beg", defaultVal: 95000, step: 5000 }
        ],
        compute: (vars) => {
          const deltaLR = vars.LR_end - vars.LR_beg;
          const cogsFIFO = vars.COGS_L - deltaLR;
          return {
            result: cogsFIFO,
            display: `$${cogsFIFO.toLocaleString()}`,
            keystrokeNotes: `\\Delta LIFO\\ Reserve = +$${deltaLR.toLocaleString()} -> FIFO COGS is lower by $${deltaLR.toLocaleString()}`
          };
        }
      },
      {
        id: "dupont-5way",
        title: "5-Way DuPont ROE Decomposition",
        latex: "ROE = \\left(\\frac{NI}{EBT}\\right) \\times \\left(\\frac{EBT}{EBIT}\\right) \\times \\left(\\frac{EBIT}{Rev}\\right) \\times \\left(\\frac{Rev}{Avg\\ Assets}\\right) \\times \\left(\\frac{Avg\\ Assets}{Avg\\ Equity}\\right)",
        description: "Tax Burden × Interest Burden × Operating Margin × Asset Turnover × Financial Leverage.",
        calculatorKeystrokes: "[TaxBurden] [\\times] [IntBurden] [\\times] [OpMargin] [\\times] [AssetTurnover] [\\times] [Leverage]"
      }
    ]
  },
  {
    id: "03",
    name: "Equity Investments",
    shortName: "Equity",
    weight: "11–14%",
    weightCategory: "HIGH",
    highYieldTrapArea: "Multi-stage DDM terminal values, Free Cash Flow to Equity (FCFE) adjustments",
    executiveSummary: [
      "Multi-stage Gordon Growth Timing Trap: Terminal value at year $n$ represents the value of dividends from $n+1$ onward: $P_n = \\frac{D_{n+1}}{r - g}$. Candidates routinely discount $P_n$ by $(1+r)^{n+1}$ instead of $(1+r)^n$.",
      "FCFE from Net Income: $FCFE = NI + NCC - \\Delta WC - Capex + Net\\ Borrowing$. Net borrowing is added because debt issuance provides fresh cash available to equity holders.",
      "H-Model Valuation: $P_0 = \\frac{D_0(1+g_L)}{r-g_L} + \\frac{D_0 \\cdot H \\cdot (g_S - g_L)}{r - g_L}$ where $H = \\text{Half-life of transition period} = t/2$.",
      "EV/EBITDA Adjustments: Enterprise Value includes Market Cap + Market Value of Debt + Preferred Stock + Minority Interest - Cash & Equivalents. Cash is subtracted because the acquirer inherits the target's cash."
    ],
    subReadings: [
      { id: "03-1", readingNumber: 10, title: "Market Organization and Structure", coreTrap: "Misidentifying call vs continuous trading and order-driven vs price-driven dealer markets." },
      { id: "03-2", readingNumber: 11, title: "Overview of Security Market Indexes", coreTrap: "Price-weighted index (DJIA) stock split divisor adjustments vs Value-weighted (S&P 500)." },
      { id: "03-3", readingNumber: 12, title: "Discounted Dividend Valuation (DDM)", coreTrap: "Using $D_n$ instead of $D_{n+1}$ in the numerator of the terminal value formula." },
      { id: "03-4", readingNumber: 13, title: "Free Cash Flow & Multiplier Valuation", coreTrap: "Forgetting to subtract cash and cash equivalents when calculating Enterprise Value (EV)." }
    ],
    formulas: [
      {
        id: "gordon-growth",
        title: "Gordon Growth Model (Constant Growth DDM)",
        latex: "P_0 = \\frac{D_1}{r - g} = \\frac{D_0(1 + g)}{r - g}",
        description: "Intrinsic value of a dividend-paying stock assuming perpetual constant dividend growth rate g < r.",
        calculatorKeystrokes: "[D_0] [\\times] [(] 1 [+] [g] [)] [\\div] [(] [r] [-] [g] [)] [=]",
        variables: [
          { name: "Current Dividend ($D_0$)", symbol: "D_0", defaultVal: 3.20, step: 0.1 },
          { name: "Cost of Equity ($r$)", symbol: "r", defaultVal: 0.095, step: 0.005, unit: "decimal" },
          { name: "Dividend Growth Rate ($g$)", symbol: "g", defaultVal: 0.045, step: 0.005, unit: "decimal" }
        ],
        compute: (vars) => {
          const d1 = vars.D_0 * (1 + vars.g);
          const p0 = d1 / (vars.r - vars.g);
          return {
            result: p0,
            display: `$${p0.toFixed(2)}`,
            keystrokeNotes: `D_1 = $${d1.toFixed(3)}, Denominator (r-g) = ${(vars.r - vars.g).toFixed(4)}`
          };
        }
      },
      {
        id: "h-model",
        title: "H-Model for Linearly Decaying Growth",
        latex: "P_0 = \\frac{D_0(1 + g_L)}{r - g_L} + \\frac{D_0 \\times H \\times (g_S - g_L)}{r - g_L}",
        description: "Valuation when short-term high growth rate $g_S$ decays linearly over $2H$ years to long-term sustainable growth $g_L$."
      }
    ]
  },
  {
    id: "04",
    name: "Fixed Income",
    shortName: "Fixed Income",
    weight: "11–14%",
    weightCategory: "HIGH",
    highYieldTrapArea: "Effective vs. Modified duration, Convexity adjustments, Spot vs. Forward rates",
    executiveSummary: [
      "Convexity Adjustment Factor of 1/2: Price percentage change formula is $\\frac{\\Delta P}{P} \\approx -ModDur \\cdot \\Delta y + \\frac{1}{2} \\cdot Convexity \\cdot (\\Delta y)^2$. Candidates frequently forget the $1/2$ multiplier on the convexity term.",
      "Modified vs Effective Duration: Modified duration assumes bond cash flows do not change when yields shift. For bonds with embedded options (callable/puttable), Effective Duration must be used.",
      "Annual vs Semi-annual Bond Yields: Semi-annual coupon bond quoted as BEY (Bond Equivalent Yield) = $2 \\times r_{semi}$. Effective Annual Yield $EAY = (1 + r_{semi})^2 - 1 > BEY$.",
      "Forward Rate Notation: In CFA notation, $f(2,1)$ or $2y1y$ is the 1-year forward rate starting 2 years from today. Forward-Spot arbitrage parity: $(1 + S_3)^3 = (1 + S_2)^2(1 + f(2,1))^1$."
    ],
    subReadings: [
      { id: "04-1", readingNumber: 14, title: "Fixed-Income Securities: Defining Elements", coreTrap: "Confusing step-up coupon bonds, PIK notes, and inflation-indexed principal structures." },
      { id: "04-2", readingNumber: 15, title: "Yield and Spread Measures for Fixed-Rate Bonds", coreTrap: "Quoting semi-annual yield without doubling to calculate Bond Equivalent Yield (BEY)." },
      { id: "04-3", readingNumber: 16, title: "Understanding Fixed-Income Risk and Return", coreTrap: "Forgetting the 1/2 scalar in the Taylor series convexity price approximation formula." },
      { id: "04-4", readingNumber: 17, title: "Spot Rates, Forward Rates, and Term Structure", coreTrap: "Inverting spot rate exponent products when solving for forward rates: $(1+S_2)^2(1+f_{2,1}) = (1+S_3)^3$." },
      { id: "04-5", readingNumber: 18, title: "Credit Analysis & Spread Drivers", coreTrap: "Treating structural models (Merton equity as call option) as empirical reduced-form models." }
    ],
    formulas: [
      {
        id: "mod-dur-price-change",
        title: "Full Duration and Convexity Price Percentage Change",
        latex: "\\frac{\\Delta P}{P} \\approx -\\text{AnnModDur} \\times \\Delta y + \\frac{1}{2} \\times \\text{AnnConvexity} \\times (\\Delta y)^2",
        description: "Estimates the percentage price change of a fixed-income instrument for a given yield curve parallel shift Δy.",
        calculatorKeystrokes: "[-][ModDur] [\\times] [\\Delta y] [+] [0.5] [\\times] [Conv] [\\times] [\\Delta y]^2",
        variables: [
          { name: "Modified Duration", symbol: "ModDur", defaultVal: 6.85, step: 0.05 },
          { name: "Annual Convexity", symbol: "Conv", defaultVal: 72.4, step: 0.5 },
          { name: "Yield Shift (\\Delta y)", symbol: "\\Delta y", defaultVal: 0.015, step: 0.001, unit: "+150 bps" }
        ],
        compute: (vars) => {
          const durEffect = -vars.ModDur * vars.Delta_y;
          const convEffect = 0.5 * vars.Conv * Math.pow(vars.Delta_y, 2);
          const totalChange = durEffect + convEffect;
          return {
            result: totalChange * 100,
            display: `${(totalChange * 100).toFixed(3)}%`,
            keystrokeNotes: `Duration Effect: ${(durEffect * 100).toFixed(3)}%, Convexity Bonus: +${(convEffect * 100).toFixed(3)}%`
          };
        }
      },
      {
        id: "forward-spot-parity",
        title: "Forward-Spot Rate Parity",
        latex: "(1 + S_B)^B = (1 + S_A)^A \\times [1 + f(A, B-A)]^{B-A}",
        description: "Derives implied forward rates from spot curve yields to prevent cash-and-carry arbitrage.",
        calculatorKeystrokes: "[(1 + S_3)^3] [\\div] [(1 + S_2)^2] [-] 1 [=]"
      }
    ]
  },
  {
    id: "05",
    name: "Portfolio Management",
    shortName: "Portfolio Mgmt",
    weight: "8–12%",
    weightCategory: "MEDIUM",
    highYieldTrapArea: "CAL vs. CML vs. SML dynamics, Beta derivations, IPS operational constraints",
    executiveSummary: [
      "CML vs SML Metric Axes: Capital Market Line (CML) graphs expected return against Total Risk (Standard Deviation $\\sigma$) and applies ONLY to efficient portfolios. Security Market Line (SML) graphs expected return against Systematic Risk (Beta $\\beta$) and applies to ALL individual securities and portfolios.",
      "Beta Derivation & Correlation: $\\beta_i = \\frac{Cov(R_i, R_m)}{\\sigma_m^2} = \\rho_{i,m} \\cdot \\frac{\\sigma_i}{\\sigma_m}$. Candidates mistakenly divide by $\\sigma_m$ instead of variance $\\sigma_m^2$.",
      "Overpriced vs Underpriced SML Identification: An asset with Expected Return $E(R_i) > \\text{CAPM Required Return}$ plots ABOVE the SML and is UNDERPRICED (buy recommendation). If $E(R_i) < \\text{CAPM}$, it plots BELOW and is OVERPRICED.",
      "IPS Constraints (TTLLU): Time horizon, Taxes, Liquidity, Legal/Regulatory, Unique circumstances. If client has high willingness to take risk but low financial ability (e.g., imminent retirement with small capital base), the portfolio manager MUST prioritize ability and recommend a conservative portfolio."
    ],
    subReadings: [
      { id: "05-1", readingNumber: 19, title: "Portfolio Risk and Return: Part I", coreTrap: "Assuming portfolio standard deviation is the weighted average of individual asset standard deviations." },
      { id: "05-2", readingNumber: 20, title: "Portfolio Risk and Return: Part II (CAPM & SML)", coreTrap: "Using total standard deviation on the horizontal axis of the SML instead of Beta." },
      { id: "05-3", readingNumber: 21, title: "Basics of Portfolio Planning & Construction (IPS)", coreTrap: "Prioritizing psychological risk willingness over factual financial risk ability." }
    ],
    formulas: [
      {
        id: "capm-sml",
        title: "Capital Asset Pricing Model (CAPM / SML)",
        latex: "E(R_i) = R_f + \\beta_i [E(R_m) - R_f]",
        description: "Required return on an individual security or portfolio based on systematic risk (Beta).",
        calculatorKeystrokes: "[R_f] [+] [\\beta_i] [\\times] [(] [E(R_m)] [-] [R_f] [)] [=]",
        variables: [
          { name: "Risk-Free Rate (R_f)", symbol: "R_f", defaultVal: 0.042, step: 0.002, unit: "decimal" },
          { name: "Beta (\\beta)", symbol: "\\beta", defaultVal: 1.35, step: 0.05 },
          { name: "Market Expected Return (E(R_m))", symbol: "R_m", defaultVal: 0.105, step: 0.005, unit: "decimal" }
        ],
        compute: (vars) => {
          const mktPremium = vars.R_m - vars.R_f;
          const er = vars.R_f + vars.Beta * mktPremium;
          return {
            result: er * 100,
            display: `${(er * 100).toFixed(2)}%`,
            keystrokeNotes: `Equity Market Risk Premium [E(R_m) - R_f] = ${(mktPremium * 100).toFixed(2)}%`
          };
        }
      },
      {
        id: "sharpe-treynor-jensen",
        title: "Treynor Ratio & Jensen's Alpha",
        latex: "Treynor = \\frac{\\bar{R}_p - \\bar{R}_f}{\\beta_p}, \\quad \\alpha_p = \\bar{R}_p - [R_f + \\beta_p(R_m - R_f)]",
        description: "Performance metrics evaluating risk-adjusted excess returns per unit of systematic risk."
      }
    ]
  },
  {
    id: "06",
    name: "Alternative Investments",
    shortName: "Alternatives",
    weight: "7–10%",
    weightCategory: "MEDIUM",
    highYieldTrapArea: "Hurdle rate & catch-up fee drag, Contango/Backwardation roll yield",
    executiveSummary: [
      "Private Equity Fee Waterfall & Catch-Up: Incentive fee (20%) is calculated after achieving the hard or soft hurdle rate. In a 'soft hurdle with 100% catch-up', once the hurdle is surpassed, the GP receives 20% of ALL profits from dollar zero, not just profit above the hurdle.",
      "Commodity Futures Total Return: $\\text{Total Return} = \\text{Spot Yield} + \\text{Roll Yield} + \\text{Collateral Yield}$.",
      "Contango vs Backwardation Roll Yield: Backwardation ($F_0 < S_0$) generates POSITIVE roll yield as forward contracts converge upward toward spot. Contango ($F_0 > S_0$) creates NEGATIVE roll yield (buying high, selling low on roll).",
      "Real Estate Cap Rate: $\\text{Cap Rate} = \\frac{NOI_1}{\\text{Property Value}} = r - g$. Depreciation and financing interest are NOT subtracted from Net Operating Income (NOI)."
    ],
    subReadings: [
      { id: "06-1", readingNumber: 22, title: "Overview of Alternative Investments", coreTrap: "Treating alternative investments as liquid assets without liquidity risk premium adjustments." },
      { id: "06-2", readingNumber: 23, title: "Private Equity, Real Estate, and Infrastructure", coreTrap: "Calculating management fee on ending NAV instead of committed capital in early fund years." },
      { id: "06-3", readingNumber: 24, title: "Commodities & Futures Term Structure", coreTrap: "Believing Contango produces positive roll yield when forward prices exceed spot." }
    ],
    formulas: [
      {
        id: "pe-fee-waterfall",
        title: "Hedge Fund 2 & 20 Fee with Hurdle Rate",
        latex: "\\text{Total Fee} = \\text{Mgmt Fee} + \\text{Incentive Fee} = m \\cdot NAV_{beg} + c \\cdot \\max(0, NAV_{end} - NAV_{beg} - \\text{Hurdle})",
        description: "Calculates total compensation fees charged to LPs under independent vs net-of-management fee provisions.",
        calculatorKeystrokes: "[NAV_beg] [\\times] 0.02 [+] [(NAV_gain - Hurdle)] [\\times] 0.20"
      },
      {
        id: "re-cap-rate",
        title: "Real Estate Capitalization Rate Valuation",
        latex: "\\text{Value}_0 = \\frac{\\text{NOI}_1}{\\text{Cap Rate}} = \\frac{\\text{NOI}_1}{r - g}",
        description: "Capitalization approach to real estate property appraisal using next year's Net Operating Income.",
        calculatorKeystrokes: "[NOI_1] [\\div] [CapRate] [=]"
      }
    ]
  },
  {
    id: "07",
    name: "Quantitative Methods",
    shortName: "Quants",
    weight: "6–9%",
    weightCategory: "STANDARD",
    highYieldTrapArea: "Compounding frequency signage traps, Type I & Type II hypothesis errors",
    executiveSummary: [
      "Effective Annual Rate (EAR) vs Nominal Stated: $EAR = (1 + \\frac{r_{s}}{m})^m - 1$. Continuous compounding: $EAR = e^{r_s} - 1$. As compounding frequency increases, EAR increases at a decreasing rate.",
      "BA II Plus Sign Convention: Cash outflows MUST be entered as negative (e.g. $[PV] = -1000$) and inflows positive ($[FV] = 1500$), otherwise the calculator outputs `Error 5` when computing $[I/Y]$ or $[N]$.",
      "Type I vs Type II Errors: Type I Error ($\\alpha$, Significance Level) = Rejecting a true null hypothesis (false positive). Type II Error ($\\beta$) = Failing to reject a false null hypothesis (false negative). Power of a test $= 1 - \\beta$.",
      "Degrees of Freedom: Single sample t-test uses $n - 1$ degrees of freedom. Simple linear regression hypothesis tests on slope coefficient $b_1$ use $n - 2$ degrees of freedom."
    ],
    subReadings: [
      { id: "07-1", readingNumber: 25, title: "The Time Value of Money & Annuities", coreTrap: "Leaving calculator in BGN (Annuity Due) mode when solving an ordinary annuity problem." },
      { id: "07-2", readingNumber: 26, title: "Probability Trees, Bayes' Formula, and Counting", coreTrap: "Mixing up Conditional Probability $P(A|B)$ with Joint Probability $P(AB) = P(A|B)P(B)$." },
      { id: "07-3", readingNumber: 27, title: "Sampling and Estimation", coreTrap: "Using standard normal z-statistic when population variance is unknown with small samples ($n < 30$)." },
      { id: "07-4", readingNumber: 28, title: "Hypothesis Testing & p-Value Interpretation", coreTrap: "Rejecting null when $p\\text{-value} > \\alpha$ (Rule: Reject $H_0$ if and only if $p\\text{-value} \\le \\alpha$)." }
    ],
    formulas: [
      {
        id: "ear-continuous",
        title: "Effective Annual Rate (EAR)",
        latex: "EAR = \\left(1 + \\frac{r}{m}\\right)^m - 1, \\quad EAR_{cont} = e^r - 1",
        description: "Converts stated nominal annual interest rate to effective compounding rate.",
        calculatorKeystrokes: "[2nd][ICONV] -> NOM = [r] -> [ENTER] -> C/Y = [m] -> [ENTER] -> [CPT] EFF",
        variables: [
          { name: "Nominal Annual Rate (r)", symbol: "r", defaultVal: 0.08, step: 0.005, unit: "decimal" },
          { name: "Compounding Periods (m)", symbol: "m", defaultVal: 12, step: 1 }
        ],
        compute: (vars) => {
          const ear = Math.pow(1 + vars.r / vars.m, vars.m) - 1;
          return {
            result: ear * 100,
            display: `${(ear * 100).toFixed(4)}%`,
            keystrokeNotes: `Monthly compounding m=12 -> EAR = ${(ear * 100).toFixed(4)}% vs nominal ${(vars.r * 100).toFixed(2)}%`
          };
        }
      },
      {
        id: "bayes-theorem",
        title: "Bayes' Formula for Conditional Probability",
        latex: "P(E|I) = \\frac{P(I|E) \\times P(E)}{P(I)} = \\frac{P(I|E)P(E)}{P(I|E)P(E) + P(I|E^c)P(E^c)}",
        description: "Updates the prior probability of an event given new conditioning information."
      }
    ]
  },
  {
    id: "08",
    name: "Economics",
    shortName: "Economics",
    weight: "6–9%",
    weightCategory: "STANDARD",
    highYieldTrapArea: "IS-LM curve shifts, FX uncovered/covered parity, Elasticity cross-effects",
    executiveSummary: [
      "Covered Interest Rate Parity (CIP): $\\frac{F_{A/B}}{S_{A/B}} = \\frac{1 + r_A}{1 + r_B}$. The currency with the higher interest rate trades at a forward discount relative to the base currency.",
      "IS-LM Macroeconomic Policy Equilibrium: Expansionary fiscal policy shifts the IS curve right, increasing both output ($Y$) and real interest rates ($r$). Expansionary monetary policy shifts the LM curve right, increasing output ($Y$) but lowering real interest rates ($r$).",
      "Cross-Price Elasticity Sign Conventions: $E_{x,y} > 0$ indicates Substitutes (price increase in Y raises demand for X). $E_{x,y} < 0$ indicates Complements (price increase in Y reduces demand for X).",
      "Kinked Demand Curve Model (Oligopoly): Assumes competitors match price cuts (inelastic demand below kink) but ignore price increases (elastic demand above kink), creating a discontinuous marginal revenue curve."
    ],
    subReadings: [
      { id: "08-1", readingNumber: 29, title: "Topics in Demand and Supply Analysis", coreTrap: "Confusing own-price elasticity of demand $|\\epsilon| > 1$ with income elasticity signs." },
      { id: "08-2", readingNumber: 30, title: "The Firm and Market Structures", coreTrap: "Assuming monopolistic competition firms earn positive economic profits in long-run equilibrium." },
      { id: "08-3", readingNumber: 31, title: "Aggregate Output, Prices, and Economic Growth", coreTrap: "Failing to account for crowding out when expansionary fiscal policy increases real interest rates." },
      { id: "08-4", readingNumber: 32, title: "Currency Exchange Rates & Parity Conditions", coreTrap: "Mixing base currency and price currency in FX quote notations ($P/B$ vs $B/P$)." }
    ],
    formulas: [
      {
        id: "covered-interest-parity",
        title: "Covered Interest Rate Parity (CIP)",
        latex: "F_{P/B} = S_{P/B} \\times \\left[\\frac{1 + r_{Price} \\times (\\text{days}/360)}{1 + r_{Base} \\times (\\text{days}/360)}\\right]",
        description: "Calculates no-arbitrage forward exchange rate between Price currency and Base currency.",
        calculatorKeystrokes: "[S] [\\times] [(] 1 [+] [r_P] [\\times] [days/360] [)] [\\div] [(] 1 [+] [r_B] [\\times] [days/360] [)]",
        variables: [
          { name: "Spot Rate (EUR/USD)", symbol: "S", defaultVal: 1.0850, step: 0.001 },
          { name: "Price Currency Rate (EUR)", symbol: "r_P", defaultVal: 0.035, step: 0.0025, unit: "decimal" },
          { name: "Base Currency Rate (USD)", symbol: "r_B", defaultVal: 0.0525, step: 0.0025, unit: "decimal" }
        ],
        compute: (vars) => {
          const f = vars.S * ((1 + vars.r_P) / (1 + vars.r_B));
          return {
            result: f,
            display: f.toFixed(4),
            keystrokeNotes: `Base currency USD has higher rate -> USD trades at forward discount (F < S = ${f.toFixed(4)})`
          };
        }
      },
      {
        id: "price-elasticity-demand",
        title: "Own-Price Elasticity of Demand",
        latex: "\\epsilon_{p} = \\frac{\\% \\Delta Q_d}{\\% \\Delta P} = \\frac{\\Delta Q}{\\Delta P} \\times \\frac{P}{Q}",
        description: "Sensitivity of quantity demanded to percentage change in own price."
      }
    ]
  },
  {
    id: "09",
    name: "Corporate Issuers",
    shortName: "Corporate Issuers",
    weight: "6–9%",
    weightCategory: "STANDARD",
    highYieldTrapArea: "Flotation costs in WACC, Degree of Total Leverage (DTL) compounding",
    executiveSummary: [
      "Flotation Cost Treatment: Flotation costs must be treated as an initial cash outflow at time $t=0$ ($CF_0 = \\text{Outlay} + \\text{Flotation Cost}$), NOT as an upward adjustment to the ongoing cost of equity $r_e$.",
      "Multiplicative Leverage Compounding: Degree of Total Leverage is the product of operating and financial leverage: $DTL = DOL \\times DFL = \\frac{Q(P-V)}{Q(P-V) - F - C}$.",
      "NPV vs IRR Conflicting Rankings: For mutually exclusive projects with differing scales or cash flow timing, NPV MUST always take precedence over IRR because IRR implicitly assumes reinvestment at the IRR rather than the cost of capital.",
      "Cost of Preferred Stock: $r_p = \\frac{D_p}{P_p}$. Preferred dividends are NOT tax-deductible, so there is NO $(1-t)$ tax shield on preferred stock."
    ],
    subReadings: [
      { id: "09-1", readingNumber: 33, title: "Capital Budgeting & Project Valuation", coreTrap: "Including sunk costs or financing interest expense in project operating cash flows." },
      { id: "09-2", readingNumber: 34, title: "Cost of Capital: WACC and Components", coreTrap: "Applying tax rate (1-t) to cost of preferred stock or cost of common equity." },
      { id: "09-3", readingNumber: 35, title: "Measures of Leverage (DOL, DFL, DTL)", coreTrap: "Adding DOL and DFL together instead of multiplying them: $DTL = DOL \\times DFL$." },
      { id: "09-4", readingNumber: 36, title: "Working Capital & Liquidity Management", coreTrap: "Confusing Cash Conversion Cycle ($DSO + DIO - DPO$) components." }
    ],
    formulas: [
      {
        id: "wacc-formula",
        title: "Weighted Average Cost of Capital (WACC)",
        latex: "WACC = w_d r_d (1 - t) + w_p r_p + w_e r_e",
        description: "Overall required rate of return for the firm using target capital structure weights.",
        calculatorKeystrokes: "[w_d] [\\times] [r_d] [\\times] [(1-t)] [+] [w_p] [\\times] [r_p] [+] [w_e] [\\times] [r_e] [=]",
        variables: [
          { name: "Weight of Debt (w_d)", symbol: "w_d", defaultVal: 0.35, step: 0.05 },
          { name: "Pre-tax Cost of Debt (r_d)", symbol: "r_d", defaultVal: 0.065, step: 0.005, unit: "decimal" },
          { name: "Marginal Tax Rate (t)", symbol: "t", defaultVal: 0.25, step: 0.05, unit: "decimal" },
          { name: "Weight of Equity (w_e)", symbol: "w_e", defaultVal: 0.65, step: 0.05 },
          { name: "Cost of Equity (r_e)", symbol: "r_e", defaultVal: 0.11, step: 0.005, unit: "decimal" }
        ],
        compute: (vars) => {
          const afterTaxDebt = vars.w_d * vars.r_d * (1 - vars.t);
          const equityComponent = vars.w_e * vars.r_e;
          const wacc = afterTaxDebt + equityComponent;
          return {
            result: wacc * 100,
            display: `${(wacc * 100).toFixed(2)}%`,
            keystrokeNotes: `After-tax debt cost: ${(vars.r_d * (1 - vars.t) * 100).toFixed(2)}% (yields ${vars.w_d * 100}% weight)`
          };
        }
      },
      {
        id: "dtl-formula",
        title: "Degree of Total Leverage (DTL)",
        latex: "DTL = DOL \\times DFL = \\frac{\\% \\Delta EPS}{\\% \\Delta Sales} = \\frac{Sales - TVC}{Sales - TVC - FC - Interest}",
        description: "Measures the overall sensitivity of earnings per share to percentage changes in unit sales volume."
      }
    ]
  },
  {
    id: "10",
    name: "Derivatives",
    shortName: "Derivatives",
    weight: "5–8%",
    weightCategory: "STANDARD",
    highYieldTrapArea: "Put-Call Parity synthetic arbitrage, Forward pricing vs. mark-to-market value",
    executiveSummary: [
      "Put-Call Parity Synthetic Creation: $C + \\frac{X}{(1+r)^T} = S + P$. Fiduciary Call (Long Call + Zero-Coupon Bond) equals Protective Put (Long Stock + Long Put). Synthetic Long Stock = Long Call + Short Put + Long Bond.",
      "Forward Pricing ($F_0$) vs Value ($V_t$): Forward price $F_0 = S_0(1+r)^T$ is set at inception so that the contract's initial value $V_0 = 0$. Value during the life of the contract is $V_t = S_t - \\frac{F_0}{(1+r)^{T-t}}$. Candidates confuse the forward price with mark-to-market value.",
      "Cost of Carry Adjustments: When underlying provides cash flow yield $\\gamma$ and incurs storage cost $\\theta$: $F_0 = (S_0 - \\text{PV}(\\gamma) + \\text{PV}(\\theta))(1+r)^T$.",
      "American vs European Option Early Exercise: Early exercise of American call options on non-dividend-paying stocks is NEVER optimal because the holder foregoes time value ($C > S - X$)."
    ],
    subReadings: [
      { id: "10-1", readingNumber: 37, title: "Derivative Markets and Instruments", coreTrap: "Failing to recognize that forward contracts have zero value at inception ($V_0 = 0$)." },
      { id: "10-2", readingNumber: 38, title: "Basics of Derivative Pricing and Valuation", coreTrap: "Confusing forward price $F_0$ with current contract market value $V_t$." },
      { id: "10-3", readingNumber: 39, title: "Option Replication and Put-Call Parity", coreTrap: "Incorrectly rearranging Put-Call Parity equation signs when synthetically replicating positions." },
      { id: "10-4", readingNumber: 40, title: "Swap Contracts and Arbitrage Relationships", coreTrap: "Assuming swap fixed rate changes during the contract life (fixed rate is locked at $t=0$)." }
    ],
    formulas: [
      {
        id: "put-call-parity",
        title: "Put-Call Parity (European Options)",
        latex: "C + \\frac{X}{(1 + r)^T} = S + P",
        description: "Fundamental no-arbitrage relationship linking call options, put options, underlying asset, and risk-free bond.",
        calculatorKeystrokes: "P = C [+] [X / (1+r)^T] [-] S",
        variables: [
          { name: "Stock Price (S)", symbol: "S", defaultVal: 52.00, step: 1.0 },
          { name: "Strike Price (X)", symbol: "X", defaultVal: 50.00, step: 1.0 },
          { name: "Call Price (C)", symbol: "C", defaultVal: 4.80, step: 0.1 },
          { name: "Risk-Free Rate (r)", symbol: "r", defaultVal: 0.05, step: 0.005, unit: "decimal" },
          { name: "Time to Expiry (T)", symbol: "T", defaultVal: 0.5, step: 0.25, unit: "years" }
        ],
        compute: (vars) => {
          const pvStrike = vars.X / Math.pow(1 + vars.r, vars.T);
          const putPrice = vars.C + pvStrike - vars.S;
          return {
            result: putPrice,
            display: `$${putPrice.toFixed(2)}`,
            keystrokeNotes: `PV(Strike) = $${pvStrike.toFixed(2)}, Synthetic Put = Call ($${vars.C.toFixed(2)}) + PV(X) - Stock ($${vars.S.toFixed(2)})`
          };
        }
      },
      {
        id: "forward-mtm-value",
        title: "Forward Contract Mark-to-Market Value",
        latex: "V_t(\\text{Long}) = S_t - \\frac{F_0}{(1 + r)^{T - t}}",
        description: "Calculates the positive or negative mark-to-market value of an existing long forward position at time t."
      }
    ]
  }
];

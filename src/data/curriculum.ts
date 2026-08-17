import { CFATopic } from "@/types/cfa";

export const CFA_CURRICULUM: CFATopic[] = [
  {
    id: "01",
    name: "Quantitative Methods",
    shortName: "Quant",
    weight: "10–12%",
    weightCategory: "HIGH",
    highYieldTrapArea: "EAR compounding periodicity, Annuity Due BGN mode, Hypothesis testing p-values vs critical values",
    executiveSummary: [
      "Effective Annual Rate (EAR): With continuous or periodic compounding, $EAR = (1 + r/m)^m - 1$ and $EAR_{cont} = e^r - 1$. Always verify compounding frequency before inputting into TVM.",
      "Annuity Timing ([BGN] vs [END]): Standard ordinary annuities assume cash flows at the end of periods ($t=1, 2, \\dots$). Annuities due occur at $t=0$; multiply ordinary annuity value by $(1 + r)$ or toggle calculator to [BGN] mode.",
      "Probability Trees & Bayes' Formula: $P(A|B) = \\frac{P(B|A) P(A)}{P(B)}$. Distinguish prior probability $P(A)$ from updated posterior probability $P(A|B)$.",
      "Hypothesis Testing & Significance: Reject $H_0$ when test statistic exceeds critical value, or when $p\\text{-value} \\le \\alpha$. Type I Error = rejecting true null ($\alpha$); Type II Error = failing to reject false null ($\beta$); Power = $1 - \\beta$."
    ],
    subReadings: [
      { id: "01-1", readingNumber: 1, title: "Rates and Returns", losCode: "LOS 1.a-c", losStatement: "Calculate and interpret different measures of return and compounding rates.", coreTrap: "Failing to convert stated annual rate to effective annual rate with m compounding periods." },
      { id: "01-2", readingNumber: 2, title: "Time Value of Money in Finance", losCode: "LOS 2.a-e", losStatement: "Calculate PV, FV, and payments for ordinary annuities and annuities due.", coreTrap: "Calculating lease/retirement cash flows in [END] mode when payments occur at beginning of period." },
      { id: "01-3", readingNumber: 3, title: "Statistical Measures of Asset Returns", losCode: "LOS 3.a-d", losStatement: "Calculate and interpret mean, variance, standard deviation, skewness, and kurtosis.", coreTrap: "Confusing sample variance (dividing by n - 1) with population variance (dividing by N)." },
      { id: "01-4", readingNumber: 4, title: "Probability Trees and Conditional Expectations", losCode: "LOS 4.a-f", losStatement: "Apply Bayes' formula and conditional probability trees to evaluate outcomes.", coreTrap: "Inverting conditional probability conditional statement P(A|B) vs P(B|A)." },
      { id: "01-5", readingNumber: 5, title: "Portfolio Mathematics & Covariance", losCode: "LOS 5.a-c", losStatement: "Calculate portfolio expected return and variance for two-asset portfolios.", coreTrap: "Forgetting the 2 * w1 * w2 * Cov(1,2) interaction term in portfolio variance." },
      { id: "01-6", readingNumber: 6, title: "Hypothesis Testing & Parametric Tests", losCode: "LOS 6.a-g", losStatement: "Formulate null/alternative hypotheses and evaluate t-test, z-test, and F-test statistics.", coreTrap: "Confusing one-tailed critical values (alpha) with two-tailed critical values (alpha / 2)." },
      { id: "01-7", readingNumber: 7, title: "Simple Linear Regression", losCode: "LOS 7.a-e", losStatement: "Interpret regression coefficients, R-squared, standard error of estimate, and ANOVA tables.", coreTrap: "Assuming correlation implies causation, or misinterpreting the intercept as a rate of return." }
    ],
    formulas: [
      {
        id: "quant-ear",
        title: "Effective Annual Rate (EAR)",
        latex: "EAR = \\left(1 + \\frac{r_s}{m}\\right)^m - 1",
        losCode: "LOS 1.b",
        description: "Measures actual annualized compound yield given stated annual rate r_s and m compounding periods per year.",
        calculatorKeystrokes: "[2nd][ICONV] -> NOM = r_s -> [ENTER] -> [↓][↓] -> C/Y = m -> [ENTER] -> [↑] -> [CPT] EFF",
        variables: [
          { name: "Stated Annual Rate (%)", symbol: "r_s", defaultVal: 8.0, step: 0.25, unit: "%" },
          { name: "Compounding Frequency (m)", symbol: "m", defaultVal: 12, step: 1, unit: "periods/yr" }
        ],
        compute: (vars) => {
          const r = vars.r_s / 100;
          const m = vars.m;
          const ear = (Math.pow(1 + r / m, m) - 1) * 100;
          return {
            result: ear.toFixed(4),
            display: `EAR = (1 + ${vars.r_s}% / ${m})^${m} - 1 = ${ear.toFixed(4)}%`,
            keystrokeNotes: `TI BA II Plus: [2nd][ICONV] NOM=${vars.r_s} ENTER, C/Y=${m} ENTER, CPT EFF => ${ear.toFixed(4)}%`
          };
        }
      },
      {
        id: "quant-pv-annuity-due",
        title: "Present Value of Annuity Due",
        latex: "PV_{due} = PV_{ordinary} \\times (1 + r)",
        losCode: "LOS 2.d",
        description: "Values a stream of equal cash flows where payments occur at the beginning of each period (t=0, 1, 2, ...).",
        calculatorKeystrokes: "[2nd][BGN][2nd][SET][2nd][QUIT] -> [N] [I/Y] [PMT] [CPT][PV]",
        variables: [
          { name: "Payment Amount", symbol: "PMT", defaultVal: 1000, step: 50, unit: "$" },
          { name: "Discount Rate (%)", symbol: "r", defaultVal: 6.0, step: 0.5, unit: "%" },
          { name: "Number of Periods", symbol: "n", defaultVal: 5, step: 1, unit: "yrs" }
        ],
        compute: (vars) => {
          const r = vars.r / 100;
          const n = vars.n;
          const pmt = vars.PMT;
          const pvOrd = pmt * ((1 - Math.pow(1 + r, -n)) / r);
          const pvDue = pvOrd * (1 + r);
          return {
            result: pvDue.toFixed(2),
            display: `PV_due = $${pvDue.toFixed(2)} (Ordinary: $${pvOrd.toFixed(2)})`,
            keystrokeNotes: `Toggle BGN: [2nd][BGN][2nd][SET]. Input: N=${n}, I/Y=${vars.r}, PMT=${pmt}, CPT PV => -$${pvDue.toFixed(2)}`
          };
        }
      },
      {
        id: "quant-bayes",
        title: "Bayes' Formula (Posterior Probability)",
        latex: "P(A|B) = \\frac{P(B|A) \\times P(A)}{P(B)}",
        losCode: "LOS 4.d",
        description: "Updates prior probability P(A) of an event given new conditioning information B.",
        calculatorKeystrokes: "P(B|A) [×] P(A) [÷] P(B) [=]"
      },
      {
        id: "quant-t-stat",
        title: "One-Sample t-Statistic",
        latex: "t_{n-1} = \\frac{\\bar{x} - \\mu_0}{s / \\sqrt{n}}",
        losCode: "LOS 6.c",
        description: "Tests hypotheses regarding the population mean when population variance is unknown, using sample standard deviation s.",
        calculatorKeystrokes: "[DATA] -> Input X values -> [STAT] -> Read x̄, s -> Subtract μ₀ -> Divide by (s / √n)"
      }
    ]
  },
  {
    id: "02",
    name: "Economics",
    shortName: "Econ",
    weight: "6–9%",
    weightCategory: "MEDIUM",
    highYieldTrapArea: "Kinked demand curve MR gap, Currency cross-rate bid-ask spreads, Fiscal vs monetary policy interactions",
    executiveSummary: [
      "Market Structures: Perfect competition ($P=MR=MC$), Monopolistic competition (product differentiation, zero long-run economic profit), Oligopoly (kinked demand curve creates price rigidity with MR vertical gap), Monopoly ($MR=MC$, price searcher).",
      "GDP Components & Equality: $GDP = C + I + G + (X - M)$. Fundamental identity: $(S - I) = (G - T) + (X - M)$. A fiscal deficit must be funded by private domestic savings excess or a trade deficit.",
      "Monetary vs Fiscal Policy: Central bank transmission mechanism operates via policy rates, reserve requirements, and open market operations. Fiscal multiplier $= \\frac{1}{1 - MPC(1 - t)}$.",
      "Currency Cross-Rates & Bid-Ask: Base currency rule: When multiplying cross rates $(A/B \\times B/C = A/C)$, Bid cross $= Bid \\times Bid$ and Ask cross $= Ask \\times Ask$. When inverting $(B/A)$, $Bid_{B/A} = 1 / Ask_{A/B}$."
    ],
    subReadings: [
      { id: "02-1", readingNumber: 8, title: "Topics in Demand and Supply Analysis", losCode: "LOS 8.a-e", losStatement: "Calculate and interpret price, cross-price, and income elasticities of demand.", coreTrap: "Confusing elasticity along a linear demand curve (elastic above midpoint, inelastic below)." },
      { id: "02-2", readingNumber: 9, title: "The Firm and Market Structures", losCode: "LOS 9.a-f", losStatement: "Compare market structures and analyze short-run vs long-run profit maximization.", coreTrap: "Assuming monopolistic competition firms earn positive economic profits in the long run." },
      { id: "02-3", readingNumber: 10, title: "Aggregate Output, Prices, and Economic Growth", losCode: "LOS 10.a-g", losStatement: "Explain aggregate demand (AD), short-run aggregate supply (SRAS), and long-run aggregate supply (LRAS).", coreTrap: "Treating stagflation as an AD shift instead of a leftward shift in SRAS." },
      { id: "02-4", readingNumber: 11, title: "Monetary and Fiscal Policy", losCode: "LOS 11.a-f", losStatement: "Analyze roles of central bank tools, inflation targets, fiscal budget deficits, and crowding out.", coreTrap: "Ignoring the crowding-out effect where government deficits drive up real interest rates and reduce private investment." },
      { id: "02-5", readingNumber: 12, title: "Currency Exchange Rates & Cross-Rates", losCode: "LOS 12.a-e", losStatement: "Calculate and interpret currency cross-rates, triangular arbitrage, and forward points.", coreTrap: "Inverting bid-ask spreads incorrectly when calculating the reciprocal exchange rate." }
    ],
    formulas: [
      {
        id: "econ-cross-rate",
        title: "Triangular Currency Cross-Rate with Bid-Ask",
        latex: "\\left(\\frac{A}{C}\\right)_{bid} = \\left(\\frac{A}{B}\\right)_{bid} \\times \\left(\\frac{B}{C}\\right)_{bid}",
        losCode: "LOS 12.c",
        description: "Determines the bid rate for cross-currency pair A/C by chaining market bid quotes.",
        calculatorKeystrokes: "Bid(A/B) [×] Bid(B/C) [=]"
      },
      {
        id: "econ-fiscal-multiplier",
        title: "Fiscal Spending Multiplier",
        latex: "M_{fiscal} = \\frac{1}{1 - MPC(1 - t)}",
        losCode: "LOS 11.d",
        description: "Calculates the total aggregate demand expansion generated by a one-dollar increase in government expenditure, accounting for marginal propensity to consume (MPC) and tax rate t.",
        calculatorKeystrokes: "1 [-] MPC [×] (1 [-] t) [=] [1/x]"
      }
    ]
  },
  {
    id: "03",
    name: "Corporate Finance",
    shortName: "Corp Fin",
    weight: "6–9%",
    weightCategory: "MEDIUM",
    highYieldTrapArea: "NPV vs IRR conflicting rankings, WACC after-tax cost of debt, Operating vs financial leverage interaction",
    executiveSummary: [
      "Capital Budgeting Decision Rules: For mutually exclusive projects, always choose the project with the highest positive Net Present Value (NPV), as IRR assumes reinvestment at IRR (unrealistic) whereas NPV assumes reinvestment at the cost of capital.",
      "Weighted Average Cost of Capital (WACC): $WACC = w_d r_d (1 - t) + w_p r_p + w_e r_e$. Pre-tax cost of debt must be adjusted by $(1 - t)$ because interest expense is tax-deductible under standard corporate codes.",
      "Cost of Equity Estimation: CAPM: $r_e = R_f + \\beta [E(R_m) - R_f]$. Bond Yield Plus Risk Premium: $r_e = r_d + \\text{Risk Premium}$. DDM Approach: $r_e = \\frac{D_1}{P_0} + g$.",
      "Leverage & Breakeven: Degree of Operating Leverage $(DOL) = \\frac{Q(P - V)}{Q(P - V) - F}$. Degree of Financial Leverage $(DFL) = \\frac{EBIT}{EBIT - I}$. Total Leverage $DTL = DOL \\times DFL$."
    ],
    subReadings: [
      { id: "03-1", readingNumber: 13, title: "Corporate Governance & Conflicts", losCode: "LOS 13.a-d", losStatement: "Describe corporate governance structures, stakeholder management, and agency conflicts.", coreTrap: "Confusing shareholder theory with stakeholder theory in ESG evaluations." },
      { id: "03-2", readingNumber: 14, title: "Capital Investments & Capital Allocation", losCode: "LOS 14.a-e", losStatement: "Calculate and interpret NPV, IRR, Payback Period, and Profitability Index.", coreTrap: "Selecting a project based on superior IRR over higher absolute NPV in mutually exclusive projects." },
      { id: "03-3", readingNumber: 15, title: "Working Capital & Liquidity Management", losCode: "LOS 15.a-d", losStatement: "Calculate operating cycle, cash conversion cycle, and liquidity ratios.", coreTrap: "Subtracting days payable outstanding from operating cycle instead of adding days sales outstanding." },
      { id: "03-4", readingNumber: 16, title: "Cost of Capital & Capital Structure", losCode: "LOS 16.a-f", losStatement: "Calculate and interpret WACC, target weights, and marginal cost of capital schedule.", coreTrap: "Omission of the (1 - t) tax shield on pre-tax cost of debt in WACC computations." }
    ],
    formulas: [
      {
        id: "corp-wacc",
        title: "Weighted Average Cost of Capital (WACC)",
        latex: "WACC = w_d r_d (1 - t) + w_p r_p + w_e r_e",
        losCode: "LOS 16.b",
        description: "Blended overall cost of corporate funding incorporating tax-deductibility of interest expenses.",
        calculatorKeystrokes: "w_d [×] r_d [×] (1 [-] t) [+] w_p [×] r_p [+] w_e [×] r_e [=]",
        variables: [
          { name: "Weight Debt (w_d)", symbol: "w_d", defaultVal: 0.40, step: 0.05, unit: "ratio" },
          { name: "Cost of Debt (r_d)", symbol: "r_d", defaultVal: 7.0, step: 0.25, unit: "%" },
          { name: "Tax Rate (t)", symbol: "t", defaultVal: 25.0, step: 1.0, unit: "%" },
          { name: "Weight Equity (w_e)", symbol: "w_e", defaultVal: 0.60, step: 0.05, unit: "ratio" },
          { name: "Cost of Equity (r_e)", symbol: "r_e", defaultVal: 12.0, step: 0.5, unit: "%" }
        ],
        compute: (vars) => {
          const afterTaxDebt = vars.r_d * (1 - vars.t / 100);
          const wacc = vars.w_d * afterTaxDebt + vars.w_e * vars.r_e;
          return {
            result: wacc.toFixed(3),
            display: `WACC = (${vars.w_d} × ${vars.r_d}% × (1 - ${vars.t}%)) + (${vars.w_e} × ${vars.r_e}%) = ${wacc.toFixed(3)}%`,
            keystrokeNotes: `After-tax debt: ${vars.r_d} × (1 - 0.25) = ${afterTaxDebt.toFixed(2)}%. Weighted: (${vars.w_d}×${afterTaxDebt.toFixed(2)}) + (${vars.w_e}×${vars.r_e}) = ${wacc.toFixed(3)}%`
          };
        }
      },
      {
        id: "corp-npv",
        title: "Net Present Value (NPV)",
        latex: "NPV = \\sum_{t=1}^n \\frac{CF_t}{(1 + r)^t} - CF_0",
        losCode: "LOS 14.b",
        description: "Net dollar value added to firm wealth from accepting an investment project.",
        calculatorKeystrokes: "[CF] -> [2nd][CLR WORK] -> CF0 = -CF0 [ENTER] -> C01 = CF1 [ENTER] -> [NPV] -> I = r [ENTER] -> [↓] -> [CPT]"
      }
    ]
  },
  {
    id: "04",
    name: "Financial Statement Analysis",
    shortName: "FSA",
    weight: "11–14%",
    weightCategory: "HIGH",
    highYieldTrapArea: "Operating vs finance lease CFO distortions, LIFO reserve inventory conversions, Deferred tax liability reversal",
    executiveSummary: [
      "LIFO to FIFO Conversion: $Inventory_{FIFO} = Inventory_{LIFO} + \\text{LIFO Reserve}$. COGS adjustment: $COGS_{FIFO} = COGS_{LIFO} - \\Delta \\text{LIFO Reserve}$. In rising prices, FIFO yields higher net income and higher ending inventory.",
      "Lease Accounting Impact (IFRS 16 vs US GAAP): IFRS single model treats all leases as finance leases, shifting lease payments from CFO to CFF (principal portion), artificially boosting CFO and EBITDA.",
      "Capitalized vs Expensed Costs: Capitalizing costs increases current CFO (by reclassifying outflows to CFI as capex), increases short-term net income, and increases asset base.",
      "Deferred Taxes: When tax rate changes, DTA/DTL balances are revalued with the adjustment flowing directly through income statement income tax expense. If DTL is expected never to reverse, treat as Equity."
    ],
    subReadings: [
      { id: "04-1", readingNumber: 17, title: "Financial Reporting Mechanics & Statements", losCode: "LOS 17.a-d", losStatement: "Describe components of income statement, balance sheet, cash flows, and note disclosures.", coreTrap: "Misclassifying interest received (US GAAP CFO vs IFRS CFO or CFI) and dividends paid." },
      { id: "04-2", readingNumber: 18, title: "Inventories: LIFO, FIFO, and Reserve Adjustments", losCode: "LOS 18.a-g", losStatement: "Calculate inventory balances, COGS, and tax impacts under LIFO and FIFO systems.", coreTrap: "Forgetting to multiply LIFO Reserve change by tax rate when calculating retained earnings adjustment." },
      { id: "04-3", readingNumber: 19, title: "Long-Lived Assets & Capitalization vs Expensing", losCode: "LOS 19.a-f", losStatement: "Evaluate financial statement effects of capitalizing versus expensing expenditures.", coreTrap: "Overlooking the impact of capitalized interest on CFI outflows and future depreciation." },
      { id: "04-4", readingNumber: 20, title: "Income Taxes & Deferred Tax Liabilities", losCode: "LOS 20.a-e", losStatement: "Calculate deferred tax assets, liabilities, valuation allowances, and effective tax rates.", coreTrap: "Failing to revalue DTL when tax rates change (the change immediately impacts income statement)." },
      { id: "04-5", readingNumber: 21, title: "Financial Reporting Quality & Red Flags", losCode: "LOS 21.a-e", losStatement: "Identify aggressive revenue recognition and earnings management red flags.", coreTrap: "Assuming aggressive revenue recognition only impacts the current period rather than future DSO." }
    ],
    formulas: [
      {
        id: "fsa-fifo-cogs",
        title: "LIFO to FIFO COGS Conversion",
        latex: "COGS_{FIFO} = COGS_{LIFO} - \\Delta \\text{LIFO Reserve}",
        losCode: "LOS 18.c",
        description: "Adjusts COGS from LIFO to FIFO during inflationary periods to reflect lower historical cost of goods sold.",
        calculatorKeystrokes: "COGS(LIFO) [-] ΔLIFO_Reserve [=]"
      },
      {
        id: "fsa-dupont-5",
        title: "Five-Way DuPont ROE Decomposition",
        latex: "ROE = \\frac{NI}{EBT} \\times \\frac{EBT}{EBIT} \\times \\frac{EBIT}{Rev} \\times \\frac{Rev}{Assets} \\times \\frac{Assets}{Equity}",
        losCode: "LOS 17.d",
        description: "Decomposes Return on Equity into Tax Burden, Interest Burden, Operating Margin, Asset Turnover, and Financial Leverage.",
        calculatorKeystrokes: "Tax_Burden [×] Interest_Burden [×] EBIT_Margin [×] Asset_Turnover [×] Leverage [=]"
      }
    ]
  },
  {
    id: "05",
    name: "Equities",
    shortName: "Equity",
    weight: "11–14%",
    weightCategory: "HIGH",
    highYieldTrapArea: "Gordon Growth terminal timing (D_n vs D_n+1), Multistage DDM horizon discounting, Price multiples denominator adjustments",
    executiveSummary: [
      "Gordon Growth Model: $P_0 = \\frac{D_1}{r - g} = \\frac{D_0 (1 + g)}{r - g}$. Critical Trap: When calculating terminal value at year $n$, the numerator must be $D_{n+1} = D_n (1 + g)$.",
      "Multistage Dividend Discount Model: Sum the present value of explicit dividends over high-growth supernormal phase, plus the present value of the terminal price $P_n$ discounted back to $t=0$ at discount rate $(1+r)^n$.",
      "Market Organization & Orders: Market orders execute immediately at best price; limit orders specify maximum purchase or minimum sale price; stop orders become market orders once stop price is breached.",
      "Market Efficiency & Anomalies: Weak-form (past prices/volume), Semi-strong (all public information), Strong-form (all public and private insider info). If semi-strong holds, fundamental analysis cannot earn abnormal returns."
    ],
    subReadings: [
      { id: "05-1", readingNumber: 22, title: "Market Organization and Structure", losCode: "LOS 22.a-e", losStatement: "Explain financial market structure, order types, leverage/margin calls, and trading mechanisms.", coreTrap: "Calculating margin call price using wrong equity maintenance threshold ratio." },
      { id: "05-2", readingNumber: 23, title: "Security Market Indices", losCode: "LOS 23.a-d", losStatement: "Calculate and compare price-weighted, value-weighted, and equal-weighted index returns.", coreTrap: "Failing to adjust price-weighted index divisor after a stock split." },
      { id: "05-3", readingNumber: 24, title: "Market Efficiency & Anomalies", losCode: "LOS 24.a-d", losStatement: "Distinguish weak, semi-strong, and strong forms of market efficiency.", coreTrap: "Assuming technical analysis can generate abnormal returns in semi-strong efficient markets." },
      { id: "05-4", readingNumber: 25, title: "Discounted Dividend Valuation (DDM)", losCode: "LOS 25.a-f", losStatement: "Calculate intrinsic value using constant growth and multistage dividend discount models.", coreTrap: "Using D_0 instead of D_1 in the Gordon Growth model numerator." },
      { id: "05-5", readingNumber: 26, title: "Relative Valuation Approaches & Price Multiples", losCode: "LOS 26.a-e", losStatement: "Calculate P/E, P/B, P/S, and EV/EBITDA multiples and interpret valuation discrepancies.", coreTrap: "Using trailing earnings P/E when evaluating forward growth expectations." }
    ],
    formulas: [
      {
        id: "equity-gordon-growth",
        title: "Gordon Constant Growth Model",
        latex: "P_0 = \\frac{D_0 (1 + g)}{r - g} = \\frac{D_1}{r - g}",
        losCode: "LOS 25.b",
        description: "Values an equity share assuming perpetual dividend growth at rate g with required return r > g.",
        calculatorKeystrokes: "D0 [×] (1 [+] g) [÷] (r [-] g) [=]",
        variables: [
          { name: "Current Dividend (D_0)", symbol: "D_0", defaultVal: 3.50, step: 0.25, unit: "$" },
          { name: "Required Return (r)", symbol: "r", defaultVal: 10.0, step: 0.5, unit: "%" },
          { name: "Perpetual Growth (g)", symbol: "g", defaultVal: 4.0, step: 0.25, unit: "%" }
        ],
        compute: (vars) => {
          const r = vars.r / 100;
          const g = vars.g / 100;
          const d1 = vars.D_0 * (1 + g);
          const price = d1 / (r - g);
          return {
            result: price.toFixed(2),
            display: `D_1 = $${d1.toFixed(3)}, P_0 = $${d1.toFixed(3)} / (${vars.r}% - ${vars.g}%) = $${price.toFixed(2)}`,
            keystrokeNotes: `TI BA II Plus: ${vars.D_0} × (1 + ${g}) ÷ (${r} - ${g}) = $${price.toFixed(2)}`
          };
        }
      },
      {
        id: "equity-margin-call",
        title: "Margin Call Price Formula",
        latex: "P_{call} = P_0 \\times \\frac{1 - \\text{Initial Margin}}{1 - \\text{Maintenance Margin}}",
        losCode: "LOS 22.c",
        description: "Calculates the stock price at which a long margin investor receives a broker margin call.",
        calculatorKeystrokes: "P0 [×] (1 [-] IM) [÷] (1 [-] MM) [=]"
      }
    ]
  },
  {
    id: "06",
    name: "Fixed Income",
    shortName: "Fixed Inc",
    weight: "11–14%",
    weightCategory: "HIGH",
    highYieldTrapArea: "Semiannual periodicity compounding, Omission of 1/2 convexity multiplier, Macaulay vs Modified duration",
    executiveSummary: [
      "Bond Pricing & Semiannual Convention: Bond price $= \\sum_{t=1}^{2N} \\frac{PMT/2}{(1 + YTM/2)^t} + \\frac{Par}{(1 + YTM/2)^{2N}}$. Always double $N$ and halve $PMT$ and $I/Y$.",
      "Duration Relationships: Macaulay duration is weighted average time to receipt of cash flows; Modified duration $= \\frac{MacDur}{1 + YTM/m}$; Effective duration $= \\frac{P_- - P_+}{2 \\Delta y P_0}$ (required for bonds with embedded options).",
      "Convexity Adjustment: $\\frac{\\Delta P}{P} \\approx -\\text{ModDur} \\times \\Delta y + \\frac{1}{2} \\times \\text{Convexity} \\times (\\Delta y)^2$. Omitting the $\\frac{1}{2}$ multiplier is the most common computational trap.",
      "Spot Rates & Forward Rates: $(1 + S_2)^2 = (1 + S_1)(1 + 1f_1)$. Forward rate $1f_1$ is the 1-year forward rate starting 1 year from today."
    ],
    subReadings: [
      { id: "06-1", readingNumber: 27, title: "Fixed-Income Securities: Defining Elements", losCode: "LOS 27.a-d", losStatement: "Describe fixed-income provisions, covenants, collateral, and cash flow structures.", coreTrap: "Confusing affirmative covenants with negative (restrictive) debt covenants." },
      { id: "06-2", readingNumber: 28, title: "Introduction to Fixed-Income Valuation", losCode: "LOS 28.a-f", losStatement: "Calculate bond prices using spot rates, discount factors, and yield to maturity.", coreTrap: "Failing to divide annual coupon by 2 and multiply maturity years by 2 for semiannual bonds." },
      { id: "06-3", readingNumber: 29, title: "Yield and Spread Measures for Fixed-Rate Bonds", losCode: "LOS 29.a-e", losStatement: "Calculate current yield, yield to call, G-spread, I-spread, and Z-spread.", coreTrap: "Confusing nominal spread over benchmark with zero-volatility (Z-spread) over spot curve." },
      { id: "06-4", readingNumber: 30, title: "Fixed-Income Risk & Return (Duration & Convexity)", losCode: "LOS 30.a-g", losStatement: "Calculate and interpret Macaulay, Modified, and Effective duration and convexity.", coreTrap: "Omission of the 1/2 multiplier in the Taylor series second-order convexity adjustment." },
      { id: "06-5", readingNumber: 31, title: "Credit Analysis Fundamentals", losCode: "LOS 31.a-d", losStatement: "Evaluate corporate and sovereign credit risk using the Four Cs of credit.", coreTrap: "Treating structural subordination as legal pari passu equality across holding company debt." }
    ],
    formulas: [
      {
        id: "fi-bond-price-tvm",
        title: "Semiannual Fixed-Rate Bond Price",
        latex: "PV = \\sum_{t=1}^{2N} \\frac{C/2}{(1 + y/2)^t} + \\frac{Par}{(1 + y/2)^{2N}}",
        losCode: "LOS 28.c",
        description: "Prices standard coupon-paying bonds with semiannual compounding.",
        calculatorKeystrokes: "[2nd][CLR TVM] -> [N] = 2×Years -> [I/Y] = YTM/2 -> [PMT] = Coupon/2 -> [FV] = 1000 -> [CPT][PV]",
        variables: [
          { name: "Years to Maturity", symbol: "Years", defaultVal: 10, step: 1, unit: "yrs" },
          { name: "Annual Coupon (%)", symbol: "Coupon", defaultVal: 6.0, step: 0.25, unit: "%" },
          { name: "Annual YTM (%)", symbol: "YTM", defaultVal: 7.0, step: 0.25, unit: "%" },
          { name: "Par Value", symbol: "Par", defaultVal: 1000, step: 100, unit: "$" }
        ],
        compute: (vars) => {
          const n = vars.Years * 2;
          const r = (vars.YTM / 2) / 100;
          const pmt = (vars.Coupon / 100 * vars.Par) / 2;
          const pvCoupons = pmt * ((1 - Math.pow(1 + r, -n)) / r);
          const pvPar = vars.Par / Math.pow(1 + r, n);
          const price = pvCoupons + pvPar;
          return {
            result: price.toFixed(2),
            display: `Price = $${price.toFixed(2)} (Discount bond, trading below par $${vars.Par})`,
            keystrokeNotes: `TI BA II Plus: N=${n}, I/Y=${vars.YTM / 2}, PMT=${pmt}, FV=${vars.Par} => CPT PV = -$${price.toFixed(2)}`
          };
        }
      },
      {
        id: "fi-duration-convexity-pct",
        title: "Full Duration & Convexity Price Approximation",
        latex: "\\frac{\\Delta P}{P} \\approx -\\text{ModDur} \\times \\Delta y + \\frac{1}{2} \\times \\text{Convexity} \\times (\\Delta y)^2",
        losCode: "LOS 30.e",
        description: "Second-order Taylor series approximation of percentage bond price change given yield change Δy.",
        calculatorKeystrokes: "[-] ModDur [×] Δy [+] (0.5 [×] Convexity [×] Δy²) [=]"
      }
    ]
  },
  {
    id: "07",
    name: "Derivatives",
    shortName: "Derivatives",
    weight: "5–8%",
    weightCategory: "STANDARD",
    highYieldTrapArea: "Put-call parity synthetic positions, Forward commitment pricing vs valuation, Moneyness option intrinsic value",
    executiveSummary: [
      "Put-Call Parity: $S_0 + p_0 = c_0 + PV(X) = c_0 + \\frac{X}{(1+r)^T}$. Fiduciary Call $= c_0 + PV(X)$; Protective Put $= S_0 + p_0$.",
      "Synthetic Positions: Synthetic Call: $c_0 = S_0 + p_0 - PV(X)$ (Long Stock + Long Put + Borrow PV of Strike). Synthetic Put: $p_0 = c_0 + PV(X) - S_0$.",
      "Forward Price vs Value: At initiation ($t=0$), forward value $V_0 = 0$ and forward price $F_0(T) = S_0 (1+r)^T$. During contract life ($t$), forward value $V_t = S_t - PV_{t,T}(F_0)$.",
      "Option Moneyness & Value: Call Option Value $= \\max(0, S_t - X) + \\text{Time Value}$. Put Option Value $= \\max(0, X - S_t) + \\text{Time Value}$."
    ],
    subReadings: [
      { id: "07-1", readingNumber: 32, title: "Derivative Instrument Features & Markets", losCode: "LOS 32.a-d", losStatement: "Describe derivatives characteristics, exchange-traded vs OTC, and margin mechanics.", coreTrap: "Confusing futures daily mark-to-market settlement with forward expiration settlement." },
      { id: "07-2", readingNumber: 33, title: "Pricing & Valuation of Forward Commitments", losCode: "LOS 33.a-e", losStatement: "Calculate forward prices and value forward contracts at initiation, during life, and at expiration.", coreTrap: "Confusing forward price F_0 (fixed at t=0) with forward contract value V_t (changes over time)." },
      { id: "07-3", readingNumber: 34, title: "Valuation of Contingent Claims (Options)", losCode: "LOS 34.a-f", losStatement: "Calculate option payoff, profit, intrinsic value, and apply Put-Call Parity.", coreTrap: "Inverting signs in synthetic option replication under Put-Call Parity." }
    ],
    formulas: [
      {
        id: "deriv-put-call-parity",
        title: "Put-Call Parity",
        latex: "S_0 + p_0 = c_0 + \\frac{X}{(1 + r)^T}",
        losCode: "LOS 34.c",
        description: "Fundamental no-arbitrage relationship connecting European call, put, spot stock, and zero-coupon bond.",
        calculatorKeystrokes: "c0 [+] X [÷] (1 [+] r)^T [-] S0 [=] p0"
      },
      {
        id: "deriv-forward-price",
        title: "Forward Price on Asset with No Income",
        latex: "F_0(T) = S_0 (1 + r)^T",
        losCode: "LOS 33.b",
        description: "No-arbitrage forward price compounded at risk-free rate r over maturity T.",
        calculatorKeystrokes: "S0 [×] (1 [+] r)^T [=]"
      }
    ]
  },
  {
    id: "08",
    name: "Alternative Investments",
    shortName: "Alts",
    weight: "5–8%",
    weightCategory: "STANDARD",
    highYieldTrapArea: "Hedge fund fee 2/20 hurdle rate calculations, Real estate NAV vs cap rate capitalization, Private equity waterfalls",
    executiveSummary: [
      "Hedge Fund Fee Structures: '2 and 20' consists of $2\\%$ management fee (calculated on beginning or ending assets) plus $20\\%$ incentive fee (often subject to High-Water Mark and Hurdle Rate). Critical Trap: Verify if incentive fee is computed net or gross of management fees.",
      "Private Equity Valuation: Leveraged Buyouts (LBOs) utilize significant debt to amplify equity returns. Venture Capital invests across stages (Seed, Early, Expansion, Mezzanine).",
      "Real Estate Valuation: Direct Capitalization: $Value = \\frac{NOI}{Cap\\ Rate}$. Gross Income Multiplier $= \\frac{Sales\\ Price}{Gross\\ Income}$.",
      "Commodities & Futures Curves: Contango: Futures price $>$ Spot price (negative roll yield due to storage costs). Backwardation: Futures price $<$ Spot price (positive roll yield due to convenience yield)."
    ],
    subReadings: [
      { id: "08-1", readingNumber: 35, title: "Overview of Alternative Investments", losCode: "LOS 35.a-d", losStatement: "Compare alternative investments with traditional investments in terms of risk, return, and liquidity.", coreTrap: "Overlooking survivorship and backfill biases in alternative investment benchmark indices." },
      { id: "08-2", readingNumber: 36, title: "Private Equity & Venture Capital", losCode: "LOS 36.a-e", losStatement: "Explain private equity structures, fee waterfalls, LBO mechanics, and exit routes.", coreTrap: "Calculating carried interest before clawback provisions or hurdle rate thresholds." },
      { id: "08-3", readingNumber: 37, title: "Real Estate & Infrastructure", losCode: "LOS 37.a-d", losStatement: "Calculate real estate value using direct capitalization method and gross income multiplier.", coreTrap: "Subtracting financing costs/mortgage interest from NOI (NOI is strictly unlevered operating income)." },
      { id: "08-4", readingNumber: 38, title: "Hedge Funds & Fee Calculations", losCode: "LOS 38.a-e", losStatement: "Calculate management and incentive fees under independent and net-of-fee structures.", coreTrap: "Applying 20% incentive fee to profits below the high-water mark." }
    ],
    formulas: [
      {
        id: "alts-cap-rate",
        title: "Real Estate Direct Capitalization Value",
        latex: "\\text{Property Value} = \\frac{NOI}{\\text{Cap Rate}}",
        losCode: "LOS 37.b",
        description: "Values commercial real estate based on unlevered Net Operating Income (NOI) and market capitalization rate.",
        calculatorKeystrokes: "NOI [÷] Cap_Rate [=]",
        variables: [
          { name: "Net Operating Income ($)", symbol: "NOI", defaultVal: 500000, step: 25000, unit: "$" },
          { name: "Cap Rate (%)", symbol: "CapRate", defaultVal: 6.5, step: 0.25, unit: "%" }
        ],
        compute: (vars) => {
          const val = vars.NOI / (vars.CapRate / 100);
          return {
            result: val.toFixed(0),
            display: `Value = $${vars.NOI.toLocaleString()} / ${vars.CapRate}% = $${Math.round(val).toLocaleString()}`,
            keystrokeNotes: `TI BA II Plus: ${vars.NOI} ÷ ${vars.CapRate / 100} = $${Math.round(val).toLocaleString()}`
          };
        }
      },
      {
        id: "alts-hedge-fund-fee",
        title: "Hedge Fund Incentive Fee (Net of Management Fee)",
        latex: "\\text{Incentive Fee} = \\max\\left(0, \\text{Ending AUM} - \\text{Mgmt Fee} - \\text{HWM}\\right) \\times 20\\%",
        losCode: "LOS 38.c",
        description: "Calculates performance fee after deducting base management fee and verifying High-Water Mark.",
        calculatorKeystrokes: "(End_AUM [-] Mgmt_Fee [-] HWM) [×] 0.20 [=]"
      }
    ]
  },
  {
    id: "09",
    name: "Portfolio Construction",
    shortName: "Portfolio",
    weight: "8–11%",
    weightCategory: "HIGH",
    highYieldTrapArea: "SML vs CML risk metric (Beta vs Total Volatility), Treynor vs Sharpe denominator, Calmar & Sortino downside risk",
    executiveSummary: [
      "CML vs SML: Capital Market Line (CML) graphs Total Risk ($\\sigma$) for efficient portfolios; Security Market Line (SML) graphs Systematic Risk ($\\beta$) for all individual securities and portfolios. Assets above SML are undervalued (positive alpha).",
      "CAPM Equation: $E(R_i) = R_f + \\beta_i [E(R_m) - R_f]$, where $\\beta_i = \\frac{Cov(i,m)}{\\sigma_m^2} = \\frac{\\rho_{i,m} \\sigma_i}{\\sigma_m}$.",
      "Performance Ratios: Sharpe Ratio $= \\frac{R_p - R_f}{\\sigma_p}$ (Total Risk). Treynor Ratio $= \\frac{R_p - R_f}{\\beta_p}$ (Systematic Risk). Sortino Ratio $= \\frac{R_p - R_{target}}{\\text{Downside Deviation}}$.",
      "Investment Policy Statement (IPS): Return objective (required vs desired), Risk tolerance (willingness vs ability - the lower dominates), and Constraints: Liquidity, Time horizon, Tax concerns, Legal/regulatory, Unique circumstances (RRTTLLU)."
    ],
    subReadings: [
      { id: "09-1", readingNumber: 39, title: "Portfolio Management: An Overview", losCode: "LOS 39.a-d", losStatement: "Describe the portfolio management process and individual vs institutional investors.", coreTrap: "Assuming an investor with high willingness to take risk can take high risk when ability is low." },
      { id: "09-2", readingNumber: 40, title: "Portfolio Risk and Return: Part I", losCode: "LOS 40.a-g", losStatement: "Calculate portfolio risk and return, minimum-variance frontier, and utility theory.", coreTrap: "Ignoring the correlation term when calculating standard deviation of a 2-asset portfolio." },
      { id: "09-3", readingNumber: 41, title: "Portfolio Risk and Return: Part II (CAPM & SML)", losCode: "LOS 41.a-h", losStatement: "Apply CAPM, calculate Beta, construct SML, and calculate Sharpe, Treynor, and Jensen's Alpha.", coreTrap: "Concluding that an asset plotting ABOVE the SML is overvalued instead of undervalued." },
      { id: "09-4", readingNumber: 42, title: "Basics of Portfolio Planning and Construction", losCode: "LOS 42.a-f", losStatement: "Describe components of an IPS, asset allocation, and ESG integration.", coreTrap: "Failing to account for client tax status when establishing the return objective." }
    ],
    formulas: [
      {
        id: "port-capm",
        title: "Capital Asset Pricing Model (CAPM)",
        latex: "E(R_i) = R_f + \\beta_i \\left[E(R_m) - R_f\\right]",
        losCode: "LOS 41.c",
        description: "Required rate of return on an asset given its systematic covariance with the market portfolio.",
        calculatorKeystrokes: "Rf [+] β [×] (Rm [-] Rf) [=]",
        variables: [
          { name: "Risk-Free Rate (%)", symbol: "R_f", defaultVal: 4.0, step: 0.25, unit: "%" },
          { name: "Asset Beta", symbol: "Beta", defaultVal: 1.25, step: 0.05, unit: "x" },
          { name: "Expected Market Return (%)", symbol: "R_m", defaultVal: 10.0, step: 0.5, unit: "%" }
        ],
        compute: (vars) => {
          const er = vars.R_f + vars.Beta * (vars.R_m - vars.R_f);
          return {
            result: er.toFixed(2),
            display: `E(R) = ${vars.R_f}% + ${vars.Beta} × (${vars.R_m}% - ${vars.R_f}%) = ${er.toFixed(2)}%`,
            keystrokeNotes: `Market Risk Premium: ${vars.R_m - vars.R_f}%. Required return: ${vars.R_f} + (${vars.Beta} × ${vars.R_m - vars.R_f}) = ${er.toFixed(2)}%`
          };
        }
      },
      {
        id: "port-sharpe",
        title: "Sharpe Ratio",
        latex: "S_p = \\frac{R_p - R_f}{\\sigma_p}",
        losCode: "LOS 41.e",
        description: "Excess return earned per unit of total portfolio volatility (standard deviation).",
        calculatorKeystrokes: "(Rp [-] Rf) [÷] σp [=]"
      }
    ]
  },
  {
    id: "10",
    name: "Ethics",
    shortName: "Ethics",
    weight: "15–20%",
    weightCategory: "HIGH",
    highYieldTrapArea: "Soft dollars allocation rules, Independence & objectivity with corporate gifts, GIPS composite rules",
    executiveSummary: [
      "Soft Dollar Allocations (Standard III-A): Client brokerage belongs to the client; soft dollar purchases must provide direct investment decision-making benefit to the client (research reports: yes; office computer hardware or rent: strictly prohibited).",
      "Independence & Objectivity (Standard I-B): Modest ordinary business meals from corporate issuers are permitted with disclosure, but lavish travel, accommodations, or bonus compensation linked to positive ratings directly breach independence.",
      "GIPS Verification & Composites: GIPS compliance is strictly firm-wide (never on a single department or product); verification cannot be performed by the firm internally and must be conducted by an independent third party.",
      "Material Nonpublic Information (Standard II-A): The Mosaic Theory allows trading on public information combined with non-material nonpublic insights, but trading on selective corporate analyst call leaks constitutes an immediate violation."
    ],
    subReadings: [
      { id: "10-1", readingNumber: 43, title: "Code of Ethics and Standards of Professional Conduct", losCode: "LOS 43.a-c", losStatement: "Describe the structure of the CFA Institute Professional Conduct Program and the Code of Ethics.", coreTrap: "Failing to recognize that members must follow the stricter of local law vs Code & Standards." },
      { id: "10-2", readingNumber: 44, title: "Guidance for Standards I–VII", losCode: "LOS 44.a-g", losStatement: "Demonstrate application of Standards I(A) through VII(B) to complex real-world ethical dilemmas.", coreTrap: "Treating personal account disclosure after client trades as sufficient when priority was not given." },
      { id: "10-3", readingNumber: 45, title: "Introduction to GIPS Standards", losCode: "LOS 45.a-e", losStatement: "Explain the scope, purpose, definition of a firm, and composite construction rules under GIPS.", coreTrap: "Claiming GIPS compliance for a single isolated fund or composite instead of the entire firm." },
      { id: "10-4", readingNumber: 46, title: "GIPS Provisions & Composite Construction", losCode: "LOS 46.a-d", losStatement: "Apply GIPS presentation standards, benchmark selection, and composite inclusion rules.", coreTrap: "Excluding terminated portfolios from historical composite performance (survivorship bias)." }
    ],
    formulas: [
      {
        id: "gips-composite-twr",
        title: "Time-Weighted Rate of Return (GIPS Linking)",
        latex: "R_{TWR} = \\prod_{t=1}^k (1 + R_t) - 1",
        losCode: "LOS 46.b",
        description: "GIPS mandates daily or monthly valuation and time-weighted returns to eliminate the distortive effect of client cash contributions and withdrawals.",
        calculatorKeystrokes: "(1 [+] R1) [×] (1 [+] R2) ... [-] 1"
      },
      {
        id: "sharpe-ex-post",
        title: "Ex-Post Composite Sharpe Ratio",
        latex: "S_p = \\frac{\\bar{R}_p - \\bar{R}_f}{\\sigma_p}",
        losCode: "LOS 46.c",
        description: "Required under GIPS 3-year annualized ex-post standard deviation disclosures for composite presentation.",
        calculatorKeystrokes: "[DATA] -> Input Returns -> [STAT] -> [2nd][1-V] -> Read x̄ and Sx"
      }
    ]
  }
];

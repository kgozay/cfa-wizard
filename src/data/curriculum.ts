import { CFATopic } from "@/types/cfa";

export const CFA_CURRICULUM: CFATopic[] = [
  {
    id: "01",
    name: "Quantitative Methods",
    shortName: "Quant",
    weight: "11–14%",
    weightCategory: "HIGH",
    highYieldTrapArea: "EAR compounding periodicity, Annuity Due BGN mode, Hypothesis testing p-values vs critical values",
    executiveSummary: [
      "Effective Annual Rate (EAR): With continuous or periodic compounding, $EAR = (1 + r/m)^m - 1$ and $EAR_{cont} = e^r - 1$. Always verify compounding frequency before inputting into TVM.",
      "Annuity Timing ([BGN] vs [END]): Standard ordinary annuities assume cash flows at the end of periods ($t=1, 2, \\dots$). Annuities due occur at $t=0$; multiply ordinary annuity value by $(1 + r)$ or toggle calculator to [BGN] mode.",
      "Probability Trees & Bayes' Formula: $P(A|B) = \\frac{P(B|A) P(A)}{P(B)}$. Distinguish prior probability $P(A)$ from updated posterior probability $P(A|B)$.",
      "Hypothesis Testing & Significance: Reject $H_0$ when test statistic exceeds critical value, or when $p\\text{-value} \\le \\alpha$. Type I Error = rejecting true null ($\alpha$); Type II Error = failing to reject false null ($\beta$); Power = $1 - \\beta$."
    ],
    subReadings: [
      // Official 2027 Level I learning modules (CFA Institute topic outline)
      { id: "01-1", readingNumber: 1, title: "Returns of Financial Assets and Instruments", losCode: "Module 1", losStatement: "Describe and interpret returns, required rates of return, risk-free rates, risk premia and inflation.", coreTrap: "Adding the inflation premium to a real rate additively when the exact (multiplicative) relation is required." },
      { id: "01-2", readingNumber: 2, title: "Types of Financial Returns", losCode: "Module 2", losStatement: "Calculate and compare holding period, arithmetic, geometric, harmonic, gross/net and real returns.", coreTrap: "Using the arithmetic mean instead of the geometric mean for multi-period compound growth." },
      { id: "01-3", readingNumber: 3, title: "Benchmarking Returns", losCode: "Module 3", losStatement: "Calculate money-weighted and time-weighted returns and index values under different weighting methods.", coreTrap: "Using the money-weighted return to evaluate a manager who does not control external cash flows." },
      { id: "01-4", readingNumber: 4, title: "The Time Value of Money in Finance", losCode: "Module 4", losStatement: "Value fixed-income and equity cash flows, infer implied returns and growth, and apply cash flow additivity.", coreTrap: "Leaving the calculator in [END] mode for annuity-due cash flows." },
      { id: "01-5", readingNumber: 5, title: "Statistical Characteristics of Asset Returns", losCode: "Module 5", losStatement: "Calculate central tendency, dispersion, skewness, kurtosis, covariance, correlation, semi-deviation and CV.", coreTrap: "Dividing by n instead of n - 1 for a sample variance." },
      { id: "01-6", readingNumber: 6, title: "Statistical Distributions for Financial Asset Prices and Returns", losCode: "Module 6", losStatement: "Calculate expected values, conditional expectations and apply Bayesian updating.", coreTrap: "Confusing P(A|B) with P(B|A) when updating probabilities." },
      { id: "01-7", readingNumber: 7, title: "Estimation and Hypothesis Testing", losCode: "Module 7", losStatement: "Apply the central limit theorem, confidence intervals, hypothesis tests, Type I/II errors and non-parametric tests.", coreTrap: "Using a one-tailed critical value for a two-tailed test." },
      { id: "01-8", readingNumber: 8, title: "The Return and Risk of a Financial Portfolio", losCode: "Module 8", losStatement: "Calculate portfolio return and risk, the minimum-variance portfolio, CAL and CML.", coreTrap: "Omitting the covariance term from two-asset portfolio variance." },
      { id: "01-9", readingNumber: 9, title: "Simulation of Financial Asset Prices and Returns", losCode: "Module 9", losStatement: "Describe historical simulation, bootstrap resampling and Monte Carlo simulation.", coreTrap: "Assuming historical simulation can capture scenarios that never occurred in the data." },
      { id: "01-10", readingNumber: 10, title: "Applications of Simple Linear Regression in Finance", losCode: "Module 10", losStatement: "Interpret least-squares estimates, assumptions, ANOVA, prediction intervals and CAPM regressions.", coreTrap: "Reading R-squared as SSE/SST instead of 1 - SSE/SST." },
      { id: "01-11", readingNumber: 11, title: "Introduction to Financial Data Science", losCode: "Module 11", losStatement: "Describe how big data, machine learning and AI are used in investment management.", coreTrap: "Confusing supervised learning (labelled data) with unsupervised learning." }
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
      // Official 2027 Level I learning modules (CFA Institute topic outline)
      { id: "02-1", readingNumber: 1, title: "The Firm and Market Structures", losCode: "Module 1", losStatement: "Determine breakeven and shutdown points and compare perfect competition, monopolistic competition, oligopoly and monopoly.", coreTrap: "Shutting down when price is below average total cost rather than below average variable cost." },
      { id: "02-2", readingNumber: 2, title: "Understanding Business Cycles", losCode: "Module 2", losStatement: "Describe business and credit cycles and how economic indicators behave over the cycle.", coreTrap: "Treating lagging indicators (e.g. unemployment duration) as leading indicators." },
      { id: "02-3", readingNumber: 3, title: "Fiscal Policy", losCode: "Module 3", losStatement: "Describe fiscal policy objectives, tools, implementation lags and whether policy is expansionary or contractionary.", coreTrap: "Judging fiscal stance from the budget balance alone without adjusting for the cycle." },
      { id: "02-4", readingNumber: 4, title: "Monetary Policy", losCode: "Module 4", losStatement: "Describe central bank roles, tools, transmission and limits, and interaction with fiscal policy.", coreTrap: "Assuming an open-market purchase drains reserves rather than adding them." },
      { id: "02-5", readingNumber: 5, title: "Introduction to Geopolitics", losCode: "Module 5", losStatement: "Describe cooperation versus competition, globalization, international organizations and geopolitical risk.", coreTrap: "Mixing up the roles of the IMF, World Bank and WTO." },
      { id: "02-6", readingNumber: 6, title: "International Trade", losCode: "Module 6", losStatement: "Describe gains and costs of trade, tariffs, quotas, export subsidies and trading blocs.", coreTrap: "Forgetting that a quota's rent may accrue to foreign exporters rather than the government." },
      { id: "02-7", readingNumber: 7, title: "Capital Flows and the FX Market", losCode: "Module 7", losStatement: "Describe FX market participants, nominal vs real rates, exchange rate regimes and capital controls.", coreTrap: "Calculating the percentage change of the wrong currency in a direct quote." },
      { id: "02-8", readingNumber: 8, title: "Exchange Rate Calculations", losCode: "Module 8", losStatement: "Calculate cross rates and forward rates from interest rate parity, points and premiums.", coreTrap: "Inverting the interest rate ratio when computing a forward rate." }
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
      // Official 2027 Level I learning modules (CFA Institute topic outline)
      { id: "03-1", readingNumber: 1, title: "Organizational Forms, Corporate Issuer Features, and Ownership", losCode: "Module 1", losStatement: "Compare business forms and public versus private corporate issuers.", coreTrap: "Assuming limited partners have unlimited liability." },
      { id: "03-2", readingNumber: 2, title: "Investors and Other Stakeholders", losCode: "Module 2", losStatement: "Compare lender and shareholder claims, stakeholder interests and ESG factors.", coreTrap: "Treating debtholders' payoff as unlimited upside like shareholders'." },
      { id: "03-3", readingNumber: 3, title: "Corporate Governance: Conflicts, Mechanisms, Risks, and Benefits", losCode: "Module 3", losStatement: "Describe principal-agent conflicts, governance mechanisms and the risks of weak governance.", coreTrap: "Assuming board independence alone eliminates agency costs." },
      { id: "03-4", readingNumber: 4, title: "Working Capital and Liquidity", losCode: "Module 4", losStatement: "Explain the cash conversion cycle, liquidity measures and working capital management.", coreTrap: "Adding days payables instead of subtracting it in the cash conversion cycle." },
      { id: "03-5", readingNumber: 5, title: "Capital Investments and Capital Allocation", losCode: "Module 5", losStatement: "Calculate NPV, IRR and ROIC, describe allocation pitfalls and real options.", coreTrap: "Ranking mutually exclusive projects by IRR when NPV and IRR conflict." },
      { id: "03-6", readingNumber: 6, title: "Capital Structure", losCode: "Module 6", losStatement: "Calculate WACC, explain MM propositions and optimal versus target capital structure.", coreTrap: "Forgetting the (1 - t) tax shield on the cost of debt." },
      { id: "03-7", readingNumber: 7, title: "Business Models", losCode: "Module 7", losStatement: "Describe key features and types of business models.", coreTrap: "Confusing a platform (network) model with a traditional pipeline model." }
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
      // Official 2027 Level I learning modules (CFA Institute topic outline)
      { id: "04-1", readingNumber: 1, title: "Introduction to Financial Statement Analysis", losCode: "Module 1", losStatement: "Describe the analysis framework, filings, notes, MD&A, audit reports and other information sources.", coreTrap: "Relying on the audit opinion as a guarantee against fraud." },
      { id: "04-2", readingNumber: 2, title: "Analyzing Income Statements", losCode: "Module 2", losStatement: "Apply revenue and expense recognition, non-recurring items, EPS and common-size analysis.", coreTrap: "Including antidilutive securities in diluted EPS." },
      { id: "04-3", readingNumber: 3, title: "Analyzing Balance Sheets", losCode: "Module 3", losStatement: "Explain reporting for intangibles, goodwill, financial instruments and non-current liabilities.", coreTrap: "Amortizing goodwill instead of testing it for impairment." },
      { id: "04-4", readingNumber: 4, title: "Analyzing Statements of Cash Flows I", losCode: "Module 4", losStatement: "Link the statements and prepare direct and indirect cash flow statements under IFRS and US GAAP.", coreTrap: "Reversing the sign of working capital changes in the indirect method." },
      { id: "04-5", readingNumber: 5, title: "Analyzing Statements of Cash Flows II", losCode: "Module 5", losStatement: "Interpret common-size cash flows and calculate FCFF, FCFE and coverage ratios.", coreTrap: "Adding back pre-tax rather than after-tax interest in FCFF." },
      { id: "04-6", readingNumber: 6, title: "Analysis of Inventories", losCode: "Module 6", losStatement: "Apply lower of cost and NRV and analyze FIFO versus weighted-average effects under inflation.", coreTrap: "Assuming LIFO is permitted under IFRS." },
      { id: "04-7", readingNumber: 7, title: "Analysis of Long-Term Assets", losCode: "Module 7", losStatement: "Compare treatment of purchased, internally developed and acquired intangibles, impairment and derecognition.", coreTrap: "Capitalizing research-phase costs under IFRS." },
      { id: "04-8", readingNumber: 8, title: "Topics in Long-Term Liabilities and Equity", losCode: "Module 8", losStatement: "Explain lease accounting for lessees and lessors, pensions and share-based compensation.", coreTrap: "Treating all lessee leases as off-balance-sheet under IFRS 16." },
      { id: "04-9", readingNumber: 9, title: "Analysis of Income Taxes", losCode: "Module 9", losStatement: "Contrast accounting and taxable profit, deferred taxes and effective, statutory and cash tax rates.", coreTrap: "Recording a DTA where a DTL arises (tax depreciation faster than book)." },
      { id: "04-10", readingNumber: 10, title: "Financial Reporting Quality", losCode: "Module 10", losStatement: "Assess reporting quality, conservative versus aggressive accounting, non-GAAP measures and warning signs.", coreTrap: "Equating high reported earnings with high-quality earnings." },
      { id: "04-11", readingNumber: 11, title: "Financial Analysis Techniques", losCode: "Module 11", losStatement: "Calculate activity, liquidity, solvency and profitability ratios and apply DuPont analysis.", coreTrap: "Using revenue instead of COGS for inventory turnover." },
      { id: "04-12", readingNumber: 12, title: "Introduction to Financial Statement Modeling", losCode: "Module 12", losStatement: "Build sales-based pro forma models and account for analyst biases, competition and inflation.", coreTrap: "Extrapolating short-term growth into the long-term forecast horizon." }
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
      // Official 2027 Level I learning modules (CFA Institute topic outline)
      { id: "05-1", readingNumber: 1, title: "Equity Instrument Features", losCode: "Module 1", losStatement: "Describe types of equity instruments and contrast public and private equity.", coreTrap: "Confusing cumulative preference shares with participating preference shares." },
      { id: "05-2", readingNumber: 2, title: "Equity Jurisdictions, Classes, and the Voting Process", losCode: "Module 2", losStatement: "Describe economic and voting rights across share classes and the proxy voting process.", coreTrap: "Assuming every share class carries one vote per share." },
      { id: "05-3", readingNumber: 3, title: "Equity Issuance and Trading", losCode: "Module 3", losStatement: "Describe primary and secondary markets, trading venues, liquidity measures, float and equity indexes.", coreTrap: "Including restricted insider holdings in free float." },
      { id: "05-4", readingNumber: 4, title: "Sources of Equity Returns", losCode: "Module 4", losStatement: "Describe dividends, buybacks and splits, dividend chronology and price versus total return.", coreTrap: "Buying on the ex-dividend date and expecting to receive the dividend." },
      { id: "05-5", readingNumber: 5, title: "Introduction to Equity Valuation", losCode: "Module 5", losStatement: "Contrast price and value, book value, market cap and EV, and categories of valuation models.", coreTrap: "Treating market capitalization as equivalent to enterprise value." },
      { id: "05-6", readingNumber: 6, title: "Discounted Cash Flow (DCF) and Growth Models", losCode: "Module 6", losStatement: "Value equity with DDM, FCFE, FCFF and multistage models, and value preferred stock.", coreTrap: "Using D0 instead of D1 in the Gordon growth model." },
      { id: "05-7", readingNumber: 7, title: "Relative Value Equity Valuation Approaches", losCode: "Module 7", losStatement: "Use price and EV multiples, comparables, forecasted fundamentals and peer groups.", coreTrap: "Pairing an enterprise value numerator with an equity-level denominator like net income." },
      { id: "05-8", readingNumber: 8, title: "Financial Statement Forecasting in Equity Valuation", losCode: "Module 8", losStatement: "Explain forecast model construction and estimate value from model outputs.", coreTrap: "Forecasting margins that are inconsistent with the company's competitive position." },
      { id: "05-9", readingNumber: 9, title: "Industry and Competitive Analysis", losCode: "Module 9", losStatement: "Classify industries and analyze them with Porter's five forces and PESTLE.", coreTrap: "Treating high industry growth as automatically implying high profitability." },
      { id: "05-10", readingNumber: 10, title: "Company Analysis: Past, Present, and Future", losCode: "Module 10", losStatement: "Evaluate competitive strategy, revenue drivers, profitability, working capital and capital structure.", coreTrap: "Ignoring the capital intensity behind reported growth." },
      { id: "05-11", readingNumber: 11, title: "Equity Analyst Research Reports", losCode: "Module 11", losStatement: "Describe research report elements and compare sell-side and buy-side reports.", coreTrap: "Assuming the same model must give the same value regardless of assumptions." },
      { id: "05-12", readingNumber: 12, title: "The Capital Asset Pricing Model, Market Model, and Other Factor-Based Equity Models", losCode: "Module 12", losStatement: "Use the CAPM and market model for required return and describe APT and multifactor models.", coreTrap: "Multiplying beta by the market return instead of the market risk premium." }
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
      // Official 2027 Level I learning modules (CFA Institute topic outline)
      { id: "06-1", readingNumber: 1, title: "Fixed-Income Instrument Features", losCode: "Module 1", losStatement: "Describe bond features, indentures and affirmative versus negative covenants.", coreTrap: "Classifying a restriction on asset sales as an affirmative covenant." },
      { id: "06-2", readingNumber: 2, title: "Fixed-Income Cash Flows and Types", losCode: "Module 2", losStatement: "Describe cash flow structures and contingency provisions benefiting issuers or investors.", coreTrap: "Assuming a call provision benefits bondholders." },
      { id: "06-3", readingNumber: 3, title: "Fixed-Income Issuance and Trading", losCode: "Module 3", losStatement: "Describe market segments, participants, indexes and primary versus secondary markets.", coreTrap: "Assuming bonds trade mainly on exchanges like equities." },
      { id: "06-4", readingNumber: 4, title: "Fixed-Income Markets for Corporate Issuers", losCode: "Module 4", losStatement: "Compare short-term funding, repos, and investment-grade versus high-yield funding.", coreTrap: "Confusing the repo rate with the haircut." },
      { id: "06-5", readingNumber: 5, title: "Fixed-Income Markets for Government Issuers", losCode: "Module 5", losStatement: "Describe sovereign, non-sovereign, quasi-government and supranational funding.", coreTrap: "Assuming sovereign local-currency debt carries the same default risk as foreign-currency debt." },
      { id: "06-6", readingNumber: 6, title: "Fixed-Income Bond Valuation: Prices and Yields", losCode: "Module 6", losStatement: "Price bonds on and between coupon dates, relate price to coupon, maturity and yield, and use matrix pricing.", coreTrap: "Quoting the full price where the flat (clean) price is required." },
      { id: "06-7", readingNumber: 7, title: "Yield and Yield Spread Measures for Fixed-Rate Bonds", losCode: "Module 7", losStatement: "Convert yields across compounding periods and interpret yield spreads.", coreTrap: "Comparing yields with different periodicities without converting them." },
      { id: "06-8", readingNumber: 8, title: "Yield and Yield Spread Measures for Floating-Rate Instruments", losCode: "Module 8", losStatement: "Interpret quoted and discount margins and money market yields.", coreTrap: "Using a 365-day convention for a money market rate quoted on a 360-day basis." },
      { id: "06-9", readingNumber: 9, title: "The Term Structure of Interest Rates: Spot, Par, and Forward Curves", losCode: "Module 9", losStatement: "Price bonds with spot rates and derive par and forward rates.", coreTrap: "Averaging spot rates instead of compounding them to find a forward rate." },
      { id: "06-10", readingNumber: 10, title: "Interest Rate Risk and Return", losCode: "Module 10", losStatement: "Calculate sources of bond return and relate Macaulay duration to the investment horizon.", coreTrap: "Ignoring reinvestment risk when the horizon is shorter than Macaulay duration." },
      { id: "06-11", readingNumber: 11, title: "Yield-Based Bond Duration Measures and Properties", losCode: "Module 11", losStatement: "Calculate modified duration, money duration and PVBP and how coupon, maturity and yield affect them.", coreTrap: "Assuming a higher coupon increases duration." },
      { id: "06-12", readingNumber: 12, title: "Yield-Based Bond Convexity and Portfolio Properties", losCode: "Module 12", losStatement: "Apply the convexity adjustment and portfolio duration and convexity.", coreTrap: "Subtracting rather than adding the positive convexity adjustment." },
      { id: "06-13", readingNumber: 13, title: "Curve-Based and Empirical Fixed-Income Risk Measures", losCode: "Module 13", losStatement: "Use effective duration and convexity, key rate duration and empirical duration.", coreTrap: "Using modified duration for a callable bond." },
      { id: "06-14", readingNumber: 14, title: "Credit Risk", losCode: "Module 14", losStatement: "Describe probability of default, loss given default, rating agencies and spread drivers.", coreTrap: "Treating expected loss as PD alone instead of PD x LGD." },
      { id: "06-15", readingNumber: 15, title: "Credit Analysis for Government Issuers", losCode: "Module 15", losStatement: "Explain considerations for sovereign and non-sovereign government credit.", coreTrap: "Ignoring a sovereign's ability to print its own currency when assessing local-currency debt." },
      { id: "06-16", readingNumber: 16, title: "Credit Analysis for Corporate Issuers", losCode: "Module 16", losStatement: "Evaluate corporate creditworthiness, credit ratios and seniority rankings.", coreTrap: "Assuming all debt of an issuer receives the same rating regardless of seniority." },
      { id: "06-17", readingNumber: 17, title: "Fixed-Income Securitization", losCode: "Module 17", losStatement: "Explain benefits of securitization and the parties and their roles.", coreTrap: "Thinking the originator keeps the securitized assets on its balance sheet after a true sale." },
      { id: "06-18", readingNumber: 18, title: "Asset-Backed Security (ABS) Instrument and Market Features", losCode: "Module 18", losStatement: "Describe covered bonds, credit enhancement, non-mortgage ABS and CDOs.", coreTrap: "Confusing covered bonds (dynamic pool, recourse to issuer) with standard ABS." },
      { id: "06-19", readingNumber: 19, title: "Mortgage-Backed Security (MBS) Instrument and Market Features", losCode: "Module 19", losStatement: "Describe prepayment risk, time tranching, RMBS, CMOs and CMBS.", coreTrap: "Assuming falling rates reduce prepayments." }
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
    name: "Derivatives and Risk Management",
    shortName: "Derivatives",
    weight: "6–9%",
    weightCategory: "MEDIUM",
    highYieldTrapArea: "Put-call parity synthetic positions, Forward commitment pricing vs valuation, Moneyness option intrinsic value",
    executiveSummary: [
      "Put-Call Parity: $S_0 + p_0 = c_0 + PV(X) = c_0 + \\frac{X}{(1+r)^T}$. Fiduciary Call $= c_0 + PV(X)$; Protective Put $= S_0 + p_0$.",
      "Synthetic Positions: Synthetic Call: $c_0 = S_0 + p_0 - PV(X)$ (Long Stock + Long Put + Borrow PV of Strike). Synthetic Put: $p_0 = c_0 + PV(X) - S_0$.",
      "Forward Price vs Value: At initiation ($t=0$), forward value $V_0 = 0$ and forward price $F_0(T) = S_0 (1+r)^T$. During contract life ($t$), forward value $V_t = S_t - PV_{t,T}(F_0)$.",
      "Option Moneyness & Value: Call Option Value $= \\max(0, S_t - X) + \\text{Time Value}$. Put Option Value $= \\max(0, X - S_t) + \\text{Time Value}$."
    ],
    subReadings: [
      // Official 2027 Level I learning modules (CFA Institute topic outline)
      { id: "07-1", readingNumber: 1, title: "Derivative Instrument and Derivative Market Features", losCode: "Module 1", losStatement: "Define derivatives and contrast OTC and exchange-traded markets.", coreTrap: "Assuming OTC contracts are standardized and centrally cleared like exchange contracts." },
      { id: "07-2", readingNumber: 2, title: "Forward Commitment and Contingent Claim Features and Instruments", losCode: "Module 2", losStatement: "Compare forwards, futures, swaps, options and credit derivatives and compute option payoffs and profits.", coreTrap: "Forgetting to subtract the premium when computing option profit." },
      { id: "07-3", readingNumber: 3, title: "Derivative Benefits, Risks, and Issuer and Investor Uses", losCode: "Module 3", losStatement: "Describe benefits and risks of derivatives and how issuers and investors use them.", coreTrap: "Treating hedging with derivatives as eliminating all risk." },
      { id: "07-4", readingNumber: 4, title: "Arbitrage, Replication, and the Cost of Carry in Pricing Derivatives", losCode: "Module 4", losStatement: "Explain arbitrage, replication and the cost of carry.", coreTrap: "Pricing a forward from the expected future spot price instead of the cost of carry." },
      { id: "07-5", readingNumber: 5, title: "Pricing and Valuation of Forward Contracts and for an Underlying with Varying Maturities", losCode: "Module 5", losStatement: "Distinguish forward price and value at initiation, during the life and at expiration; interest rate forwards.", coreTrap: "Thinking a forward contract has non-zero value at initiation." },
      { id: "07-6", readingNumber: 6, title: "Pricing and Valuation of Futures Contracts", losCode: "Module 6", losStatement: "Compare forward and futures prices and explain why they differ.", coreTrap: "Ignoring daily mark-to-market settlement of futures." },
      { id: "07-7", readingNumber: 7, title: "Pricing and Valuation of Interest Rate and Other Swaps", losCode: "Module 7", losStatement: "Relate swaps to a series of forwards and contrast swap price and value.", coreTrap: "Assuming each implied forward in a swap has zero value at initiation." },
      { id: "07-8", readingNumber: 8, title: "Pricing and Valuation of Options", losCode: "Module 8", losStatement: "Explain exercise value, moneyness, time value and factors affecting option value.", coreTrap: "Assuming higher volatility lowers option value." },
      { id: "07-9", readingNumber: 9, title: "Option Replication Using Put\u2013Call Parity", losCode: "Module 9", losStatement: "Apply put\u2013call parity and put\u2013call forward parity for European options.", coreTrap: "Using the undiscounted strike in put\u2013call parity." },
      { id: "07-10", readingNumber: 10, title: "Valuing a Derivative Using a One-Period Binomial Model", losCode: "Module 10", losStatement: "Value a derivative with a one-period binomial model and explain risk neutrality.", coreTrap: "Using real-world probabilities instead of risk-neutral probabilities." }
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
    weight: "6–9%",
    weightCategory: "MEDIUM",
    highYieldTrapArea: "Hedge fund fee 2/20 hurdle rate calculations, Real estate NAV vs cap rate capitalization, Private equity waterfalls",
    executiveSummary: [
      "Hedge Fund Fee Structures: '2 and 20' consists of $2\\%$ management fee (calculated on beginning or ending assets) plus $20\\%$ incentive fee (often subject to High-Water Mark and Hurdle Rate). Critical Trap: Verify if incentive fee is computed net or gross of management fees.",
      "Private Equity Valuation: Leveraged Buyouts (LBOs) utilize significant debt to amplify equity returns. Venture Capital invests across stages (Seed, Early, Expansion, Mezzanine).",
      "Real Estate Valuation: Direct Capitalization: $Value = \\frac{NOI}{Cap\\ Rate}$. Gross Income Multiplier $= \\frac{Sales\\ Price}{Gross\\ Income}$.",
      "Commodities & Futures Curves: Contango: Futures price $>$ Spot price (negative roll yield due to storage costs). Backwardation: Futures price $<$ Spot price (positive roll yield due to convenience yield)."
    ],
    subReadings: [
      // Official 2027 Level I learning modules (CFA Institute topic outline)
      { id: "08-1", readingNumber: 1, title: "Alternative Investment Features, Methods, and Structures", losCode: "Module 1", losStatement: "Describe categories, direct, co-investment and fund investing, and ownership and fee structures.", coreTrap: "Assuming co-investment requires paying full fund-level fees." },
      { id: "08-2", readingNumber: 2, title: "Alternative Investment Performance and Returns", losCode: "Module 2", losStatement: "Appraise performance and calculate returns before and after fees.", coreTrap: "Charging the incentive fee on gross gains when it is based on gains net of the management fee." },
      { id: "08-3", readingNumber: 3, title: "Investments in Private Capital: Equity and Debt", losCode: "Module 3", losStatement: "Explain private equity and private debt features and diversification benefits.", coreTrap: "Treating mezzanine debt as senior secured debt." },
      { id: "08-4", readingNumber: 4, title: "Real Estate and Infrastructure", losCode: "Module 4", losStatement: "Explain features and investment characteristics of real estate and infrastructure.", coreTrap: "Valuing property by multiplying NOI by the cap rate instead of dividing." },
      { id: "08-5", readingNumber: 5, title: "Natural Resources", losCode: "Module 5", losStatement: "Explain raw land, timberland, farmland and commodities and their risk, return and diversification.", coreTrap: "Ignoring roll yield when explaining commodity futures returns." },
      { id: "08-6", readingNumber: 6, title: "Hedge Funds", losCode: "Module 6", losStatement: "Explain hedge fund features, vehicles and sources of risk, return and diversification.", coreTrap: "Ignoring lockups and redemption notice periods when assessing liquidity." },
      { id: "08-7", readingNumber: 7, title: "Introduction to Digital Assets", losCode: "Module 7", losStatement: "Describe distributed ledger applications and the features, vehicles and risks of digital assets.", coreTrap: "Confusing permissioned with permissionless networks." }
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
    weight: "8–12%",
    weightCategory: "HIGH",
    highYieldTrapArea: "SML vs CML risk metric (Beta vs Total Volatility), Treynor vs Sharpe denominator, Calmar & Sortino downside risk",
    executiveSummary: [
      "CML vs SML: Capital Market Line (CML) graphs Total Risk ($\\sigma$) for efficient portfolios; Security Market Line (SML) graphs Systematic Risk ($\\beta$) for all individual securities and portfolios. Assets above SML are undervalued (positive alpha).",
      "CAPM Equation: $E(R_i) = R_f + \\beta_i [E(R_m) - R_f]$, where $\\beta_i = \\frac{Cov(i,m)}{\\sigma_m^2} = \\frac{\\rho_{i,m} \\sigma_i}{\\sigma_m}$.",
      "Performance Ratios: Sharpe Ratio $= \\frac{R_p - R_f}{\\sigma_p}$ (Total Risk). Treynor Ratio $= \\frac{R_p - R_f}{\\beta_p}$ (Systematic Risk). Sortino Ratio $= \\frac{R_p - R_{target}}{\\text{Downside Deviation}}$.",
      "Investment Policy Statement (IPS): Return objective (required vs desired), Risk tolerance (willingness vs ability - the lower dominates), and Constraints: Liquidity, Time horizon, Tax concerns, Legal/regulatory, Unique circumstances (RRTTLLU)."
    ],
    subReadings: [
      // Official 2027 Level I learning modules (CFA Institute topic outline)
      { id: "09-1", readingNumber: 1, title: "Portfolio Risk and Return: Part I", losCode: "Module 1", losStatement: "Explain risk aversion, utility, portfolio variance, diversification and the efficient frontier.", coreTrap: "Assuming correlation of +1 still provides diversification benefits." },
      { id: "09-2", readingNumber: 2, title: "Portfolio Risk and Return: Part II", losCode: "Module 2", losStatement: "Explain CAL, CML, systematic risk, beta, CAPM, SML and the Sharpe, Treynor, M2 and Jensen's alpha measures.", coreTrap: "Expecting a return premium for diversifiable risk." },
      { id: "09-3", readingNumber: 3, title: "Portfolio Management: An Overview", losCode: "Module 3", losStatement: "Describe the portfolio approach, process, investor types, pension plans and pooled products.", coreTrap: "Placing the risk of a defined contribution plan on the sponsor rather than the participant." },
      { id: "09-4", readingNumber: 4, title: "Basics of Portfolio Planning and Construction", losCode: "Module 4", losStatement: "Describe the IPS, objectives, willingness versus ability to take risk, constraints and ESG integration.", coreTrap: "Letting high willingness override low ability to take risk." },
      { id: "09-5", readingNumber: 5, title: "The Behavioral Biases of Individuals", losCode: "Module 5", losStatement: "Compare cognitive errors and emotional biases and their market implications.", coreTrap: "Classifying loss aversion as a cognitive error rather than an emotional bias." },
      { id: "09-6", readingNumber: 6, title: "Introduction to Risk Management", losCode: "Module 6", losStatement: "Define risk governance, risk tolerance, risk budgeting and methods for modifying risk.", coreTrap: "Equating risk management with risk minimization." }
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
    name: "Ethical and Professional Standards",
    shortName: "Ethics",
    weight: "10–15%",
    weightCategory: "HIGH",
    highYieldTrapArea: "Soft dollars allocation rules, Independence & objectivity with corporate gifts, GIPS composite rules",
    executiveSummary: [
      "Soft Dollar Allocations (Standard III-A): Client brokerage belongs to the client; soft dollar purchases must provide direct investment decision-making benefit to the client (research reports: yes; office computer hardware or rent: strictly prohibited).",
      "Independence & Objectivity (Standard I-B): Modest ordinary business meals from corporate issuers are permitted with disclosure, but lavish travel, accommodations, or bonus compensation linked to positive ratings directly breach independence.",
      "GIPS Verification & Composites: GIPS compliance is strictly firm-wide (never on a single department or product); verification cannot be performed by the firm internally and must be conducted by an independent third party.",
      "Material Nonpublic Information (Standard II-A): The Mosaic Theory allows trading on public information combined with non-material nonpublic insights, but trading on selective corporate analyst call leaks constitutes an immediate violation."
    ],
    subReadings: [
      // Official 2027 Level I learning modules (CFA Institute topic outline)
      { id: "10-1", readingNumber: 1, title: "Ethics and Trust in the Investment Profession", losCode: "Module 1", losStatement: "Explain ethics, professionalism, challenges to ethical behavior and a framework for ethical decisions.", coreTrap: "Assuming that legal conduct is always ethical." },
      { id: "10-2", readingNumber: 2, title: "Code of Ethics and Standards of Professional Conduct", losCode: "Module 2", losStatement: "Describe the Professional Conduct Program and the components of the Code and Standards.", coreTrap: "Thinking a violation finding requires a criminal conviction." },
      { id: "10-3", readingNumber: 3, title: "Guidance for Standard I: Professionalism", losCode: "Module 3", losStatement: "Apply standards on knowledge of the law, independence, misrepresentation, misconduct and competence.", coreTrap: "Following local law when the Code and Standards are stricter." },
      { id: "10-4", readingNumber: 4, title: "Guidance for Standard II: Integrity of Capital Markets", losCode: "Module 4", losStatement: "Apply standards on material nonpublic information and market manipulation.", coreTrap: "Treating mosaic theory as permitting the use of material nonpublic information." },
      { id: "10-5", readingNumber: 5, title: "Guidance for Standard III: Duties to Clients", losCode: "Module 5", losStatement: "Apply standards on loyalty, fair dealing, suitability, performance presentation and confidentiality.", coreTrap: "Placing the employer's interests ahead of clients'." },
      { id: "10-6", readingNumber: 6, title: "Guidance for Standard IV: Duties to Employers", losCode: "Module 6", losStatement: "Apply standards on loyalty, additional compensation and supervisors' responsibilities.", coreTrap: "Taking client lists when leaving an employer." },
      { id: "10-7", readingNumber: 7, title: "Guidance for Standard V: Investment Analysis, Recommendations, and Actions", losCode: "Module 7", losStatement: "Apply standards on diligence and reasonable basis, communication and record retention.", coreTrap: "Presenting opinions as facts in client communications." },
      { id: "10-8", readingNumber: 8, title: "Guidance for Standard VI: Conflicts of Interest", losCode: "Module 8", losStatement: "Apply standards on disclosure of conflicts, priority of transactions and referral fees.", coreTrap: "Trading personal accounts ahead of clients." },
      { id: "10-9", readingNumber: 9, title: "Guidance for Standard VII: Responsibilities as a CFA Institute Member or CFA Candidate", losCode: "Module 9", losStatement: "Apply standards on conduct in the CFA Program and references to the designation.", coreTrap: "Using \"CFA\" as a noun or implying superior performance from the designation." },
      { id: "10-10", readingNumber: 10, title: "Application of the Code and Standards: Level I", losCode: "Module 10", losStatement: "Evaluate practices and conduct against the Code and Standards.", coreTrap: "Missing that one action can violate more than one standard." }
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

/** Short official module label ("Module 4") for a 2027 learning module title. */
export function moduleCodeFor(topicId: string, moduleTitle: string): string {
  const modules = CFA_CURRICULUM.find((topic) => topic.id === topicId)?.subReadings || [];
  const index = modules.findIndex((module) => module.title === moduleTitle);
  if (index < 0) throw new Error(`Unknown 2027 learning module for topic ${topicId}: ${moduleTitle}`);
  return `Module ${index + 1}`;
}

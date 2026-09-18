export interface LOSGuide {
  losCode: string;
  title: string;
  coreConcept: string;
  formulaLatex?: string;
  formulaExplanation?: string;
  calculatorGuide?: {
    summary: string;
    keystrokes: string;
    keyRegisters: string[];
  };
  workedExample: {
    scenario: string;
    question: string;
    solutionSteps: string[];
    finalAnswer: string;
  };
  trapMatrix: {
    trapName: string;
    examinerDistractor: string;
    remediationRule: string;
  }[];
}

export interface TopicGuide {
  topicId: string;
  topicName: string;
  weight: string;
  highYieldTheme: string;
  firstPrinciplesSummary: string;
  losGuides: LOSGuide[];
}

export const CFA_TOPIC_GUIDES: TopicGuide[] = [
  {
    topicId: "01",
    topicName: "Quantitative Methods",
    weight: "10–12%",
    highYieldTheme: "Time Value of Money, Compounding Frequencies, and Statistical Return Estimators",
    firstPrinciplesSummary:
      "All quantitative finance is built on discounting uncertain future cash flows to the present. The two fundamental dimensions are compounding periodicity (converting nominal rates to Effective Annual Rates) and sample dispersion versus population variance.",
    losGuides: [
      {
        losCode: "LOS 1.b",
        title: "Effective Annual Rate (EAR) & Compounding Dynamics",
        coreConcept:
          "Stated nominal annual interest rates ignore intra-year compounding. When interest is credited m times per year, each period earns interest on interest. Continuous compounding is the mathematical limit as m approaches infinity.",
        formulaLatex: "\\text{EAR} = \\left(1 + \\frac{r_{\\text{stated}}}{m}\\right)^m - 1 \\quad \\text{and} \\quad \\text{EAR}_{\\text{continuous}} = e^{r} - 1",
        formulaExplanation:
          "r_stated is the annual percentage rate (APR), m is the compounding frequency per year (12 for monthly, 4 for quarterly, 2 for semiannual), and e is Euler's constant (~2.71828).",
        calculatorGuide: {
          summary: "Use the built-in [2nd][ICONV] worksheet or power key [y^x].",
          keystrokes: "[2nd][ICONV] -> NOM = 8.4 [ENTER] -> [Down] -> C/Y = 12 [ENTER] -> [Down] -> [CPT] EFF => 8.731%",
          keyRegisters: ["NOM = Stated rate", "EFF = Effective rate", "C/Y = Compounding frequency per year"],
        },
        workedExample: {
          scenario: "An institutional certificate of deposit advertises a stated nominal yield of 8.40% compounded monthly.",
          question: "Calculate the exact Effective Annual Rate (EAR) an endowment will realize over 1 year.",
          solutionSteps: [
            "Identify stated rate r = 0.0840 and compounding frequency m = 12.",
            "Compute periodic rate: r/m = 0.0840 / 12 = 0.0070 (0.70% per month).",
            "Compound across 12 periods: (1 + 0.0070)^12 = 1.087311.",
            "Subtract principal factor 1: 1.087311 - 1 = 0.087311 = 8.731%.",
          ],
          finalAnswer: "EAR = 8.731%",
        },
        trapMatrix: [
          {
            trapName: "Arithmetic Compounding Trap",
            examinerDistractor: "Examiners present 8.40% as an option, which completely ignores intra-year interest on interest.",
            remediationRule: "EAR is ALWAYS strictly greater than the stated nominal rate whenever m > 1.",
          },
          {
            trapName: "Continuous vs Discrete Inversion",
            examinerDistractor: "Using e^0.084 - 1 = 8.763% when monthly compounding was specified.",
            remediationRule: "Check compounding frequency: only use e^r if question explicitly specifies 'continuously compounded'.",
          },
        ],
      },
      {
        losCode: "LOS 2.a",
        title: "Annuity Due vs Ordinary Annuity Valuation",
        coreConcept:
          "An ordinary annuity pays at the END of each period (t = 1, 2, ... n). An annuity due pays at the BEGINNING of each period (t = 0, 1, ... n-1). Because every cash flow in an annuity due is received one period earlier, its Present Value is exactly equal to Ordinary PV multiplied by (1 + r).",
        formulaLatex: "\\text{PV}_{\\text{Due}} = \\text{PV}_{\\text{Ordinary}} \\times (1 + r)",
        formulaExplanation:
          "Every individual cash flow earns an additional period of compound interest under the beginning-of-period convention.",
        calculatorGuide: {
          summary: "Toggle the BGN annunciator on the TI BA II Plus.",
          keystrokes: "[2nd][BGN] -> [2nd][SET] -> [2nd][QUIT] -> Display shows 'BGN' in top right.",
          keyRegisters: ["N = Number of periods", "I/Y = Periodic rate %", "PMT = Payment per period", "PV = Present Value"],
        },
        workedExample: {
          scenario: "A lease agreement requires 5 annual upfront lease payments of $40,000 discounted at 7.0%.",
          question: "Calculate the capitalized Present Value of the lease liability.",
          solutionSteps: [
            "Compute standard ordinary annuity PV: N=5, I/Y=7, PMT=40000, FV=0 -> CPT PV = $164,007.82.",
            "Scale by beginning-of-period factor (1 + 0.07): $164,007.82 * 1.07 = $175,488.37.",
            "Alternatively, set BA II+ to BGN mode and compute directly.",
          ],
          finalAnswer: "PV_Due = $175,488.37",
        },
        trapMatrix: [
          {
            trapName: "BGN Register Residue",
            examinerDistractor: "Leaving calculator in BGN mode for subsequent ordinary bond or loan questions.",
            remediationRule: "Always reset to END mode immediately after completing annuity due questions: [2nd][BGN][2nd][SET][2nd][QUIT].",
          },
        ],
      },
    ],
  },
  {
    topicId: "02",
    topicName: "Economics",
    weight: "6–9%",
    highYieldTheme: "Market Structures, Fiscal Multiplier, and Currency Cross-Rates with Bid-Ask Spreads",
    firstPrinciplesSummary:
      "Economics examines resource allocation across firm market structures and macroeconomic equilibrium. Core competencies focus on profit maximization where MR = MC, fiscal crowding-out mechanisms, and triangular currency arbitrage with bid-ask spreads.",
    losGuides: [
      {
        losCode: "LOS 8.b",
        title: "Price Elasticity of Demand & Revenue Dynamics",
        coreConcept:
          "Price elasticity of demand measures the percentage change in quantity demanded relative to a percentage change in price. Along a linear downward-sloping demand curve, elasticity varies from perfectly elastic at the vertical intercept to perfectly inelastic at the horizontal intercept, passing through unitary elasticity at the midpoint where total revenue is maximized.",
        formulaLatex: "\\epsilon_{P} = \\frac{\\% \\Delta Q}{\\% \\Delta P} = \\left(\\frac{\\Delta Q}{\\Delta P}\\right) \\times \\left(\\frac{P}{Q}\\right)",
        formulaExplanation:
          "If |epsilon_p| > 1 (elastic), price cuts increase total revenue. If |epsilon_p| < 1 (inelastic), price hikes increase total revenue. Total revenue is maximized when |epsilon_p| = 1.",
        calculatorGuide: {
          summary: "Use standard arithmetic or percentage keys to compute slope and ratio.",
          keystrokes: "P [÷] Q [×] (Delta Q [÷] Delta P) [=]",
          keyRegisters: ["P = Current price", "Q = Quantity demanded at price P"],
        },
        workedExample: {
          scenario: "A firm faces a linear market demand curve given by Q = 1,200 - 4P. The current market price is P = $100.",
          question: "Calculate the own-price elasticity of demand and determine whether the firm should raise or lower price to increase total revenue.",
          solutionSteps: [
            "Compute current quantity: Q = 1,200 - 4(100) = 800 units.",
            "Determine demand slope: dQ/dP = -4.",
            "Calculate point price elasticity: (-4) * (100 / 800) = -0.50.",
            "Since |epsilon_p| = 0.50 < 1.0, demand is inelastic. Raising prices increases total revenue.",
          ],
          finalAnswer: "Elasticity = -0.50 (Inelastic; firm should raise price to increase revenue)",
        },
        trapMatrix: [
          {
            trapName: "Constant Elasticity Fallacy",
            examinerDistractor: "Assuming the slope of a linear demand curve (-4) represents a constant elasticity everywhere.",
            remediationRule: "Slope is constant along a straight line, but elasticity ALWAYS changes as P/Q changes.",
          },
          {
            trapName: "Inelastic Revenue Inverse",
            examinerDistractor: "Recommending a price decrease when demand is inelastic to gain revenue.",
            remediationRule: "When demand is inelastic (|e| < 1), percentage decrease in volume is smaller than percentage price gain, so increasing price raises total revenue.",
          },
        ],
      },
      {
        losCode: "LOS 12.c",
        title: "Currency Cross-Rates with Bid-Ask Spreads & Inversions",
        coreConcept:
          "Currencies are quoted as Price/Base (A/B). To cross rates A/B and B/C to get A/C: Bid(A/C) = Bid(A/B) * Bid(B/C) and Ask(A/C) = Ask(A/B) * Ask(B/C). When taking the reciprocal quote (B/A), Bid(B/A) = 1 / Ask(A/B) and Ask(B/A) = 1 / Bid(A/B).",
        formulaLatex: "\\left(\\frac{A}{C}\\right)_{\\text{bid}} = \\left(\\frac{A}{B}\\right)_{\\text{bid}} \\times \\left(\\frac{B}{C}\\right)_{\\text{bid}} \\quad \\text{and} \\quad \\left(\\frac{B}{A}\\right)_{\\text{bid}} = \\frac{1}{\\left(\\frac{A}{B}\\right)_{\\text{ask}}}",
        formulaExplanation:
          "The dealer always buys the base currency low (at the bid) and sells it high (at the ask). You always get the worse rate in any transaction.",
        calculatorGuide: {
          summary: "Chain multiplication for direct cross; use [1/x] for currency inversion.",
          keystrokes: "Ask rate [1/x] [=] => gives Bid for the inverted quote",
          keyRegisters: ["Bid is ALWAYS strictly lower than Ask"],
        },
        workedExample: {
          scenario: "A FX dealer provides quotes: USD/EUR = 1.0820 - 1.0825 and JPY/USD = 155.10 - 155.20.",
          question: "Calculate the JPY/EUR bid rate available to an arbitrageur.",
          solutionSteps: [
            "We need JPY/EUR bid = (JPY/USD bid) * (USD/EUR bid).",
            "Identify JPY/USD bid = 155.10.",
            "Identify USD/EUR bid = 1.0820.",
            "Multiply bids: 155.10 * 1.0820 = 167.8182.",
          ],
          finalAnswer: "JPY/EUR Bid = 167.82",
        },
        trapMatrix: [
          {
            trapName: "Inverted Bid-Ask Reciprocal Trap",
            examinerDistractor: "Computing Bid(B/A) as 1 / Bid(A/B), which results in a bid higher than the ask.",
            remediationRule: "Bid is always the reciprocal of the ASK: Bid(B/A) = 1 / Ask(A/B).",
          },
        ],
      },
    ],
  },
  {
    topicId: "03",
    topicName: "Corporate Issuers",
    weight: "6–9%",
    highYieldTheme: "Capital Budgeting (NPV vs IRR), WACC After-Tax Debt Shield, and Total Leverage",
    firstPrinciplesSummary:
      "Corporate finance centers on maximizing firm shareholder value through optimal capital allocation, working capital efficiency, and financing mix. When project cash flow timing creates conflicting NPV and IRR rankings, NPV rules absolutely.",
    losGuides: [
      {
        losCode: "LOS 14.b",
        title: "Capital Budgeting: Net Present Value (NPV) vs Internal Rate of Return (IRR)",
        coreConcept:
          "Net Present Value (NPV) is the present value of all cash inflows minus the present value of all cash outflows discounted at the opportunity cost of capital. Internal Rate of Return (IRR) is the discount rate equating NPV to zero. For mutually exclusive projects with differing cash flow patterns or scale, NPV is the superior criterion because it assumes realistic reinvestment at the cost of capital.",
        formulaLatex: "\\text{NPV} = \\sum_{t=0}^n \\frac{\\text{CF}_t}{(1 + r)^t} \\quad \\text{and} \\quad \\sum_{t=0}^n \\frac{\\text{CF}_t}{(1 + \\text{IRR})^t} = 0",
        formulaExplanation:
          "Accept any independent project if NPV > 0 (or IRR > r). For mutually exclusive projects, always select the project with the highest positive NPV.",
        calculatorGuide: {
          summary: "Use the [CF] and [NPV] / [IRR] worksheets on the TI BA II Plus.",
          keystrokes: "[CF] -> [2nd][CLR WORK] -> CF0 = -100 [ENTER] -> [Down] C01 = 35 [ENTER] -> F01 = 4 [ENTER] -> [NPV] -> I = 9 [ENTER] -> [Down] -> [CPT] => 13.39 -> [IRR] -> [CPT] => 14.96%",
          keyRegisters: ["CF0 = Initial outlay (negative)", "C0x = Cash flow", "F0x = Frequency", "I = Discount rate %"],
        },
        workedExample: {
          scenario: "Project Alpha requires an immediate capital outlay of $100,000 and generates cash flows of $35,000 annually for 4 years. The company's required hurdle rate is 9.0%.",
          question: "Calculate the project's NPV and IRR. Should management accept the project?",
          solutionSteps: [
            "Compute PV of inflows: N=4, I/Y=9, PMT=35000, FV=0 -> CPT PV = $113,390.13.",
            "Subtract initial investment: $113,390.13 - $100,000 = +$13,390.13 (NPV).",
            "Calculate IRR: N=4, PV=-100000, PMT=35000, FV=0 -> CPT I/Y = 14.96% (IRR).",
            "Since NPV > 0 and IRR (14.96%) > hurdle rate (9.0%), accept Project Alpha.",
          ],
          finalAnswer: "NPV = +$13,390.13, IRR = 14.96% (Accept Project)",
        },
        trapMatrix: [
          {
            trapName: "IRR Mutually Exclusive Seduction",
            examinerDistractor: "Selecting a smaller project with a 30% IRR over a larger project with a 20% IRR that delivers $2M higher absolute NPV.",
            remediationRule: "Always prioritize highest NPV for mutually exclusive projects. IRR does not account for investment scale.",
          },
        ],
      },
      {
        losCode: "LOS 16.c",
        title: "Weighted Average Cost of Capital (WACC) & After-Tax Debt Shield",
        coreConcept:
          "WACC represents the marginal opportunity cost of capital across all capital structure components. Because interest on debt is tax-deductible under corporate tax codes, the effective pre-tax cost of debt must be multiplied by (1 - t). Preferred stock and common equity dividends receive NO tax deduction.",
        formulaLatex: "\\text{WACC} = w_d r_d (1 - t) + w_p r_p + w_e r_e",
        formulaExplanation:
          "w_d, w_p, w_e are target market value weights summing to 1.0. r_d is before-tax cost of debt, t is corporate tax rate, r_p is cost of preferred, and r_e is cost of common equity.",
        calculatorGuide: {
          summary: "Compute after-tax cost of debt r_d * (1 - t), then sum weighted terms.",
          keystrokes: "w_d [×] r_d [×] (1 [-] t) [+] w_p [×] r_p [+] w_e [×] r_e [=]",
          keyRegisters: ["Weights must always be based on MARKET values, not book values"],
        },
        workedExample: {
          scenario: "A corporation has a target capital structure of 40% debt, 10% preferred stock, and 50% common equity. Its before-tax cost of debt is 6.5%, cost of preferred stock is 7.0%, cost of equity is 11.5%, and marginal corporate tax rate is 25%.",
          question: "Calculate the firm's Weighted Average Cost of Capital (WACC).",
          solutionSteps: [
            "Calculate after-tax cost of debt: 6.5% * (1 - 0.25) = 4.875%.",
            "Debt component: 0.40 * 4.875% = 1.950%.",
            "Preferred component: 0.10 * 7.00% = 0.700%.",
            "Equity component: 0.50 * 11.50% = 5.750%.",
            "Sum components: 1.950% + 0.700% + 5.750% = 8.400%.",
          ],
          finalAnswer: "WACC = 8.40%",
        },
        trapMatrix: [
          {
            trapName: "Preferred Stock Tax Shield Trap",
            examinerDistractor: "Multiplying the cost of preferred stock by (1 - t).",
            remediationRule: "Preferred dividends are paid from after-tax earnings and provide NO tax deduction. Only debt interest is tax-sheltered.",
          },
        ],
      },
    ],
  },
  {
    topicId: "04",
    topicName: "Financial Statement Analysis",
    weight: "11–14%",
    highYieldTheme: "LIFO vs FIFO Inversions, Lease Capitalization, and GAAP vs IFRS Cash Flows",
    firstPrinciplesSummary:
      "Financial reporting analysis centers on understanding how accounting discretion alters earnings quality, balance sheet solvency, and cash flow classifications. Economic reality must be reconstructed by reversing accounting conventions.",
    losGuides: [
      {
        losCode: "LOS 17.a",
        title: "LIFO Reserve to FIFO Economic Transformation",
        coreConcept:
          "In an inflationary environment, LIFO reports lower inventory, higher Cost of Goods Sold (COGS), and lower pre-tax income than FIFO. To convert a LIFO firm to FIFO for comparative analysis, add the LIFO Reserve to inventory, deduct changes in LIFO reserve from COGS, and recognize deferred tax liabilities.",
        formulaLatex: "\\text{Inventory}_{\\text{FIFO}} = \\text{Inventory}_{\\text{LIFO}} + \\text{LIFO Reserve} \\quad \\text{and} \\quad \\text{COGS}_{\\text{FIFO}} = \\text{COGS}_{\\text{LIFO}} - \\Delta \\text{LIFO Reserve}",
        formulaExplanation:
          "Retained Earnings under FIFO increases by LIFO Reserve * (1 - Tax Rate).",
        calculatorGuide: {
          summary: "Perform balance sheet equity adjustment for after-tax inventory uplift.",
          keystrokes: "LIFO_Reserve [\\times] (1 [-] Tax_Rate) [=] After_Tax_Equity_Uplift",
          keyRegisters: ["Inventory = +LIFO Reserve", "Deferred Taxes = +LIFO Reserve * T", "Retained Earnings = +LIFO Reserve * (1 - T)"],
        },
        workedExample: {
          scenario: "A manufacturing firm reports LIFO Inventory of $1,200,000, LIFO Reserve of $350,000 (up from $300,000 last year), and LIFO COGS of $4,500,000 under a 25% tax rate.",
          question: "Determine FIFO Inventory and FIFO COGS.",
          solutionSteps: [
            "FIFO Inventory = LIFO Inventory + LIFO Reserve = $1,200,000 + $350,000 = $1,550,000.",
            "Delta LIFO Reserve = $350,000 - $300,000 = +$50,000.",
            "FIFO COGS = LIFO COGS - Delta LIFO Reserve = $4,500,000 - $50,000 = $4,450,000.",
          ],
          finalAnswer: "FIFO Inventory = $1,550,000; FIFO COGS = $4,450,000",
        },
        trapMatrix: [
          {
            trapName: "COGS Delta Sign Reversal",
            examinerDistractor: "Adding the change in LIFO reserve to COGS instead of subtracting it ($4,550,000).",
            remediationRule: "FIFO sells older, cheaper goods in inflation; therefore FIFO COGS MUST be lower than LIFO COGS.",
          },
        ],
      },
      {
        losCode: "LOS 20.b",
        title: "IFRS vs US GAAP Cash Flow Classification",
        coreConcept:
          "Under US GAAP, Interest Received, Dividends Received, and Interest Paid are strictly Operating (CFO). Only Dividends Paid is Financing (CFF). Under IFRS, firms have flexibility: Interest/Dividends Received can be CFO or CFI; Interest/Dividends Paid can be CFO or CFF.",
        formulaLatex: "\\text{US GAAP:} \\quad \\text{Int Paid} \\in \\text{CFO}, \\; \\text{Div Paid} \\in \\text{CFF}, \\; \\text{Int/Div Rec} \\in \\text{CFO}",
        formulaExplanation:
          "IFRS permits classifying interest paid as CFF, which artificially inflates CFO relative to US GAAP.",
        calculatorGuide: {
          summary: "Adjust CFO for comparability across jurisdictions.",
          keystrokes: "\\text{Adjusted CFO (US GAAP)} = \\text{IFRS CFO} - \\text{Interest Paid (if in CFF)}",
          keyRegisters: ["US GAAP: Strict operating rule", "IFRS: Flexible presentation choice"],
        },
        workedExample: {
          scenario: "An IFRS firm reports CFO of $800,000, including $120,000 of interest paid classified as CFF.",
          question: "Calculate the comparable CFO under US GAAP rules.",
          solutionSteps: [
            "Under US GAAP, interest paid MUST be included in CFO as an operating outflow.",
            "Adjusted CFO = $800,000 - $120,000 = $680,000.",
          ],
          finalAnswer: "Adjusted CFO = $680,000",
        },
        trapMatrix: [
          {
            trapName: "Dividends Paid Misclassification",
            examinerDistractor: "Assuming Dividends Paid is CFO under US GAAP.",
            remediationRule: "Under US GAAP, Dividends Paid is ALWAYS CFF (Financing).",
          },
        ],
      },
    ],
  },
  {
    topicId: "05",
    topicName: "Equity Investments",
    weight: "11–14%",
    highYieldTheme: "Gordon Growth Dividend Discount Model (DDM), Margin Call Trigger Price, and Index Weighting Mechanics",
    firstPrinciplesSummary:
      "Equity valuation estimates fundamental intrinsic value through discounted expected dividends/cash flows and peer comparative multiples. Understanding leverage dynamics (initial vs maintenance margin) and market microstructure is vital.",
    losGuides: [
      {
        losCode: "LOS 22.d",
        title: "Margin Call Trigger Price in Leveraged Long Positions",
        coreConcept:
          "When purchasing equity on margin, the investor borrows part of the purchase price from the broker. If the stock price declines, equity as a percentage of total market value drops. A margin call occurs when equity falls below the maintenance margin requirement.",
        formulaLatex: "P_{\\text{margin call}} = P_0 \\times \\frac{1 - \\text{Initial Margin}}{1 - \\text{Maintenance Margin}}",
        formulaExplanation:
          "P_0 is initial purchase price. The numerator represents the borrowed loan amount per dollar of initial price; the denominator represents the broker's loan exposure threshold per dollar of current price.",
        calculatorGuide: {
          summary: "Use standard arithmetic: (1 - IM) / (1 - MM) multiplied by P_0.",
          keystrokes: "P_0 [×] (1 [-] IM) [÷] (1 [-] MM) [=]",
          keyRegisters: ["Initial Margin = Upfront equity %", "Maintenance Margin = Minimum required equity %"],
        },
        workedExample: {
          scenario: "An investor buys 1,000 shares of stock at $50.00 per share with an initial margin requirement of 50% and a maintenance margin requirement of 30%.",
          question: "Calculate the stock price below which the investor will receive a margin call.",
          solutionSteps: [
            "Initial loan per share = $50.00 * (1 - 0.50) = $25.00.",
            "At margin call price P, equity % = (P - $25.00) / P = 0.30.",
            "Rearrange: P * (1 - 0.30) = $25.00 => P * 0.70 = $25.00.",
            "Solve for P: P = $25.00 / 0.70 = $35.714.",
          ],
          finalAnswer: "Margin Call Price = $35.71",
        },
        trapMatrix: [
          {
            trapName: "Denominator Maintenance Margin Inversion",
            examinerDistractor: "Dividing by 0.30 instead of (1 - 0.30), arriving at $83.33.",
            remediationRule: "Maintenance margin is the equity fraction; the debt fraction remaining is (1 - Maintenance Margin).",
          },
        ],
      },
      {
        losCode: "LOS 25.b",
        title: "Gordon Growth Constant Growth Dividend Discount Model",
        coreConcept:
          "The Gordon Growth Model values a stock by discounting a dividend stream that grows indefinitely at a constant sustainable rate g. The critical input is next year's expected dividend D_1, which equals D_0 * (1 + g).",
        formulaLatex: "P_0 = \\frac{D_1}{r_e - g} = \\frac{D_0 (1 + g)}{r_e - g}",
        formulaExplanation:
          "r_e is the required rate of return on equity, g is the constant perpetual dividend growth rate (sustainable g = ROE * b, where b is retention rate).",
        calculatorGuide: {
          summary: "Compute D_1, then divide by the net spread (r_e - g).",
          keystrokes: "D_0 [×] (1 [+] g) [÷] (r_e [-] g) [=]",
          keyRegisters: ["r_e MUST be strictly greater than g"],
        },
        workedExample: {
          scenario: "A company just paid an annual dividend of $2.50 per share (D_0). Dividends are projected to grow perpetually at 4.50% per year. The required rate of return on equity is 9.00%.",
          question: "Calculate the intrinsic value of the company's common stock.",
          solutionSteps: [
            "Calculate next period dividend D_1: $2.50 * (1 + 0.045) = $2.6125.",
            "Determine discount rate spread: r_e - g = 0.090 - 0.045 = 0.045.",
            "Calculate intrinsic value: P_0 = $2.6125 / 0.045 = $58.055.",
          ],
          finalAnswer: "Intrinsic Value P_0 = $58.06",
        },
        trapMatrix: [
          {
            trapName: "D_0 vs D_1 Timing Trap",
            examinerDistractor: "Using $2.50 in the numerator: $2.50 / 0.045 = $55.56.",
            remediationRule: "If the problem states the company 'just paid' or 'currently pays', that is D_0. You MUST multiply by (1 + g) to find D_1.",
          },
        ],
      },
    ],
  },
  {
    topicId: "06",
    topicName: "Fixed Income",
    weight: "11–14%",
    highYieldTheme: "Duration, Convexity Approximations, and Yield-to-Maturity Mechanics",
    firstPrinciplesSummary:
      "Bond prices and interest rates share an inverse, non-linear relationship. Modified duration provides a first-order linear approximation of price changes, while convexity provides the second-order curvature adjustment.",
    losGuides: [
      {
        losCode: "LOS 27.c",
        title: "Total Estimated Price Change with Duration & Convexity",
        coreConcept:
          "Duration alone underestimates bond price increases when yields fall and overestimates price drops when yields rise. Adding the second-order convexity term corrects for the curvature of the price-yield curve.",
        formulaLatex: "\\% \\Delta \\text{Price} \\approx -\\text{ModDur} \\times \\Delta y + \\frac{1}{2} \\times \\text{Convexity} \\times (\\Delta y)^2",
        formulaExplanation:
          "ModDur is Modified Duration, Delta y is the change in yield in decimals (e.g., +150 bps = 0.0150), and Convexity is the second derivative measure.",
        calculatorGuide: {
          summary: "Calculate linear duration component, then add 0.5 * Convexity * dy^2.",
          keystrokes: "-7.4 [\\times] 0.015 [=] -0.111 [+] (0.5 [\\times] 68.0 [\\times] 0.015 [x^2]) [=] -0.10335 (-10.335%)",
          keyRegisters: ["Duration component is negative for yield increase", "Convexity term is ALWAYS positive"],
        },
        workedExample: {
          scenario: "A bond has Modified Duration of 7.40 and Convexity of 68.0. Yields increase by 150 basis points (+1.50%).",
          question: "Estimate the total percentage change in the bond's full price.",
          solutionSteps: [
            "Convert yield change: Delta y = +0.0150.",
            "Linear duration impact: -7.40 * 0.0150 = -0.1110 (-11.10%).",
            "Convexity adjustment: 0.5 * 68.0 * (0.0150)^2 = 34.0 * 0.000225 = +0.00765 (+0.765%).",
            "Total percentage price change: -11.10% + 0.765% = -10.335%.",
          ],
          finalAnswer: "% Delta Price = -10.335%",
        },
        trapMatrix: [
          {
            trapName: "Missing 1/2 Taylor Series Scalar",
            examinerDistractor: "Forgetting the 1/2 factor, adding full 68.0 * (0.015)^2 = +1.53%, resulting in -9.57%.",
            remediationRule: "ALWAYS multiply convexity by 1/2 in the percentage price change formula.",
          },
        ],
      },
    ],
  },
  {
    topicId: "07",
    topicName: "Derivatives",
    weight: "5–8%",
    highYieldTheme: "Put-Call Parity Synthetic Equivalence, Forward Pricing vs Valuation, and Futures Mark-to-Market",
    firstPrinciplesSummary:
      "Derivatives derive value from an underlying commitment or claim. The cornerstone of pricing is the no-arbitrage principle: two portfolios with identical payoff profiles in all future states must have identical values today.",
    losGuides: [
      {
        losCode: "LOS 34.e",
        title: "Put-Call Parity & Synthetic Asset Replication",
        coreConcept:
          "Put-Call Parity defines the equilibrium relationship between the prices of European call and put options with the same strike X and expiration T. A fiduciary call (call plus risk-free zero-coupon bond) creates the exact same payoff as a protective put (stock plus put option). Any imbalance presents a risk-free arbitrage opportunity.",
        formulaLatex: "S_0 + P_0 = C_0 + \\frac{X}{(1 + r)^T}",
        formulaExplanation:
          "S_0 is spot price, P_0 is put price, C_0 is call price, X is strike price discounted at risk-free rate r over time T.",
        calculatorGuide: {
          summary: "Discount the strike price X / (1 + r)^T, then rearrange terms to solve for the missing asset.",
          keystrokes: "C_0 [+] X [÷] (1 [+] r)^T [-] S_0 [=] => solves for Put price P_0",
          keyRegisters: ["Applies ONLY to European-style options with identical X and T"],
        },
        workedExample: {
          scenario: "A stock trades at $60.00. A 1-year European call option with a strike price of $60.00 trades at $6.50. The 1-year continuously compounded or discrete risk-free rate is 5.0%.",
          question: "Calculate the no-arbitrage price of a 1-year European put option with the same strike price.",
          solutionSteps: [
            "Discount strike: PV(X) = $60.00 / (1.05)^1 = $57.1429.",
            "Fiduciary call value = C_0 + PV(X) = $6.50 + $57.1429 = $63.6429.",
            "By Put-Call Parity: S_0 + P_0 = $63.6429.",
            "Solve for P_0: P_0 = $63.6429 - $60.00 = $3.6429.",
          ],
          finalAnswer: "Put Price P_0 = $3.64",
        },
        trapMatrix: [
          {
            trapName: "Synthetic Asset Sign Inversion",
            examinerDistractor: "Constructing synthetic stock as Long Call + Long Put, or misplacing the bond term.",
            remediationRule: "Remember: S + P = C + Bond. Therefore Synthetic Stock S = C - P + Bond; Synthetic Call C = S + P - Bond.",
          },
        ],
      },
      {
        losCode: "LOS 33.b",
        title: "Forward Contract Pricing vs Value During Life",
        coreConcept:
          "At contract initiation (t = 0), the forward price F_0 is set so that the value of the forward contract is zero (V_0 = 0). Over time (at t > 0), as spot prices and interest rates move, the forward price remains fixed, but the value of the contract V_t fluctuates based on spot price and the discounted forward price.",
        formulaLatex: "F_0(T) = S_0 (1 + r)^T \\quad \\text{and} \\quad V_t(T) = S_t - \\frac{F_0(T)}{(1 + r)^{T - t}}",
        formulaExplanation:
          "F_0 is the contracted forward delivery price. V_t is the present monetary gain or loss to the long position holder at time t prior to expiration.",
        calculatorGuide: {
          summary: "Discount F_0 by remaining time (T - t) and subtract from current spot S_t.",
          keystrokes: "S_t [-] (F_0 [÷] (1 [+] r)^(T [-] t)) [=]",
          keyRegisters: ["At initiation V_0 = 0", "At expiration V_T = S_T - F_0"],
        },
        workedExample: {
          scenario: "An investor entered a 1-year forward contract to purchase an equity index at forward price F_0 = $1,050. Six months later (t = 0.5), the index spot price is $1,100 and the risk-free rate is 4.0% annualized.",
          question: "Calculate the market value of this forward contract to the long position at the 6-month mark.",
          solutionSteps: [
            "Remaining time to expiration: T - t = 0.5 years.",
            "Discount factor: (1.04)^0.5 = 1.019804.",
            "Present value of forward price: $1,050 / 1.019804 = $1,029.61.",
            "Contract value to long: V_t = $1,100 - $1,029.61 = +$70.39.",
          ],
          finalAnswer: "Contract Value V_t = +$70.39",
        },
        trapMatrix: [
          {
            trapName: "Forward Price vs Value Confusion",
            examinerDistractor: "Answering $1,050 when asked for contract value, or stating value is 0 during the contract's life.",
            remediationRule: "Forward price F_0 is fixed at initiation. Contract value V_t is zero ONLY at t=0; thereafter it changes continuously.",
          },
        ],
      },
    ],
  },
  {
    topicId: "08",
    topicName: "Alternative Investments",
    weight: "7–10%",
    highYieldTheme: "Hedge Fund Fee Mechanics with High-Water Marks, Real Estate Direct Capitalization (NOI), and PE Waterfalls",
    firstPrinciplesSummary:
      "Alternative investments provide diversification, unique factor exposures, and illiquidity premiums. Mastery requires understanding asymmetric fee structures (2 and 20 net vs independent, hurdle rates, high-water marks) and unlevered Net Operating Income (NOI).",
    losGuides: [
      {
        losCode: "LOS 38.c",
        title: "Hedge Fund Fee Calculations: 2 & 20 with High-Water Mark",
        coreConcept:
          "Hedge funds typically charge a base management fee (e.g., 2% of beginning or ending AUM) plus an incentive/performance fee (e.g., 20% of net profits). Under a High-Water Mark (HWM) clause, performance fees can only be charged on profits that exceed the highest net asset value previously attained, protecting investors from paying fees on recovery of prior losses.",
        formulaLatex: "\\text{Incentive Fee} = \\max\\left(0, \\text{AUM}_{\\text{end}} - \\text{HWM}\\right) \\times 20\\%",
        formulaExplanation:
          "Always confirm whether the incentive fee is calculated on gross returns or net of the management fee.",
        calculatorGuide: {
          summary: "Compute management fee first; subtract management fee if specified 'net of management fees'.",
          keystrokes: "(AUM_end [-] HWM) [×] 0.20 [=]",
          keyRegisters: ["If AUM_end <= HWM, incentive fee is exactly 0"],
        },
        workedExample: {
          scenario: "A hedge fund begins Year 1 with $100M and ends Year 1 at $120M (new HWM = $120M). In Year 2, the fund drops to $110M. In Year 3, the fund rebounds to $130M. The fund charges a 2% management fee on beginning AUM and a 20% incentive fee net of management fees with a strict HWM.",
          question: "Calculate the total fees paid by investors in Year 3.",
          solutionSteps: [
            "Beginning Year 3 AUM = $110M. Management fee = 2% * $110M = $2.2M.",
            "Gross Year 3 ending value = $130M. Ending value net of mgmt fee = $130M - $2.2M = $127.8M.",
            "Relevant High-Water Mark from Year 1 = $120M.",
            "Net profit above HWM = $127.8M - $120M = $7.8M.",
            "Incentive fee = 20% * $7.8M = $1.56M.",
            "Total Year 3 fees = $2.2M + $1.56M = $3.76M.",
          ],
          finalAnswer: "Total Year 3 Fees = $3.76M (Mgmt: $2.2M, Incentive: $1.56M)",
        },
        trapMatrix: [
          {
            trapName: "Loss Recovery Double-Dipping Trap",
            examinerDistractor: "Applying 20% incentive fee to the entire Year 3 gain ($130M - $110M = $20M gain => $4M incentive fee).",
            remediationRule: "The fund must recoup previous drawdowns to exceed the $120M HWM before any incentive fee can be earned.",
          },
        ],
      },
      {
        losCode: "LOS 37.b",
        title: "Real Estate Direct Capitalization (Cap Rate & NOI)",
        coreConcept:
          "The direct capitalization method estimates the market value of an income-generating real estate property by dividing its projected first-year Net Operating Income (NOI) by an appropriate market capitalization rate. NOI is strictly an UNLEVERED cash flow measure reflecting operations before debt service and taxes.",
        formulaLatex: "V_0 = \\frac{\\text{NOI}_1}{\\text{Cap Rate}} \\quad \\text{where} \\quad \\text{NOI} = \\text{EGI} - \\text{Operating Expenses}",
        formulaExplanation:
          "Effective Gross Income (EGI) = Potential Gross Income (PGI) - Vacancy and Collection Losses + Other Income. Operating expenses exclude mortgage payments and depreciation.",
        calculatorGuide: {
          summary: "Calculate NOI_1 and divide by decimal cap rate.",
          keystrokes: "NOI_1 [÷] CapRate_decimal [=]",
          keyRegisters: ["NEVER subtract mortgage interest or debt service from NOI"],
        },
        workedExample: {
          scenario: "A commercial office building has Potential Gross Income of $1,500,000, expected vacancy and credit loss of 8%, annual property operating expenses of $480,000, and annual mortgage interest of $150,000. Market capitalization rate is 7.00%.",
          question: "Calculate the property value using the direct capitalization method.",
          solutionSteps: [
            "Compute Effective Gross Income: $1,500,000 * (1 - 0.08) = $1,380,000.",
            "Compute NOI: $1,380,000 - $480,000 = $900,000 (do NOT deduct mortgage interest).",
            "Calculate property value: V_0 = $900,000 / 0.0700 = $12,857,143.",
          ],
          finalAnswer: "Property Value = $12,857,143",
        },
        trapMatrix: [
          {
            trapName: "Mortgage Debt Financing Trap",
            examinerDistractor: "Subtracting $150,000 mortgage interest from NOI, giving NOI = $750,000 and value = $10,714,286.",
            remediationRule: "NOI is completely independent of how the property is financed. Financing costs are financing cash flows, NOT property operating expenses.",
          },
        ],
      },
    ],
  },
  {
    topicId: "09",
    topicName: "Portfolio Management",
    weight: "8–11%",
    highYieldTheme: "Two-Asset Portfolio Variance, Capital Asset Pricing Model (CAPM) & SML, and Risk-Adjusted Ratios",
    firstPrinciplesSummary:
      "Portfolio theory formalizes diversification through covariance. Systematic risk (Beta) alone is priced by the market under equilibrium. The Security Market Line (SML) defines required returns, where assets plotting above the SML are undervalued.",
    losGuides: [
      {
        losCode: "LOS 40.d",
        title: "Two-Asset Portfolio Expected Return and Variance",
        coreConcept:
          "Portfolio expected return is the weighted average of individual asset returns. Portfolio variance depends on individual variances, asset weights, and the covariance (or correlation coefficient) between the assets. As long as correlation rho < +1.0, portfolio standard deviation is strictly less than the weighted average standard deviation, yielding a diversification benefit.",
        formulaLatex: "\\sigma_p^2 = w_1^2 \\sigma_1^2 + w_2^2 \\sigma_2^2 + 2 w_1 w_2 \\rho_{1,2} \\sigma_1 \\sigma_2",
        formulaExplanation:
          "w_1 and w_2 are portfolio weights (w_1 + w_2 = 1.0). rho_{1,2} is correlation between -1.0 and +1.0.",
        calculatorGuide: {
          summary: "Compute each term and sum into memory: term1 + term2 + 2*w1*w2*Cov.",
          keystrokes: "w1 [x^2] [×] s1 [x^2] [M+] -> w2 [x^2] [×] s2 [x^2] [M+] -> 2 [×] w1 [×] w2 [×] rho [×] s1 [×] s2 [M+] -> [RCL] [√x]",
          keyRegisters: ["Square root the variance to get portfolio standard deviation"],
        },
        workedExample: {
          scenario: "An asset manager constructs a portfolio with 60% invested in Stock A (sigma = 18%) and 40% invested in Bond B (sigma = 8%). The correlation coefficient between Stock A and Bond B is 0.20.",
          question: "Calculate the standard deviation of the two-asset portfolio.",
          solutionSteps: [
            "Term 1 (Asset A): (0.60)^2 * (0.18)^2 = 0.36 * 0.0324 = 0.011664.",
            "Term 2 (Asset B): (0.40)^2 * (0.08)^2 = 0.16 * 0.0064 = 0.001024.",
            "Term 3 (Covariance): 2 * 0.60 * 0.40 * 0.20 * 0.18 * 0.08 = 0.0013824.",
            "Portfolio variance sigma_p^2 = 0.011664 + 0.001024 + 0.0013824 = 0.0140704.",
            "Portfolio standard deviation sigma_p = sqrt(0.0140704) = 0.1186 = 11.86%.",
          ],
          finalAnswer: "Portfolio Standard Deviation = 11.86%",
        },
        trapMatrix: [
          {
            trapName: "Missing 2x Cross-Product Factor",
            examinerDistractor: "Adding w1*w2*Cov instead of 2*w1*w2*Cov, yielding an understated variance.",
            remediationRule: "The covariance term MUST have the factor of 2 because Cov(A,B) equals Cov(B,A).",
          },
        ],
      },
      {
        losCode: "LOS 41.e",
        title: "Capital Asset Pricing Model (CAPM) & Security Market Line (SML)",
        coreConcept:
          "The CAPM asserts that the expected return of an asset equals the risk-free rate plus a risk premium proportional to systematic risk (Beta). The SML graphs expected return against Beta. If an analyst forecasts a return higher than the CAPM required return, the asset plots ABOVE the SML, has positive Jensen's Alpha, and is UNDERVALUED (attractive buy).",
        formulaLatex: "E(R_i) = R_f + \\beta_i \\left[E(R_m) - R_f\\right] \\quad \\text{and} \\quad \\alpha_i = R_{i,\\text{forecast}} - E(R_i)",
        formulaExplanation:
          "R_f is risk-free rate, beta_i = Cov(i,m) / Var(m), [E(R_m) - R_f] is market risk premium.",
        calculatorGuide: {
          summary: "Compute market risk premium first, scale by Beta, and add R_f.",
          keystrokes: "E(R_m) [-] R_f [×] Beta [+] R_f [=]",
          keyRegisters: ["Check whether question gives Market Return or Market Risk Premium"],
        },
        workedExample: {
          scenario: "The risk-free rate is 3.5% and the expected return on the market is 9.5%. An analyst assesses Stock XYZ with a Beta of 1.30 and forecasts its return over the next year to be 12.0%.",
          question: "Calculate the required return under CAPM and determine if the stock is overvalued or undervalued.",
          solutionSteps: [
            "Calculate market risk premium: 9.5% - 3.5% = 6.0%.",
            "Calculate required return: E(R) = 3.5% + 1.30 * 6.0% = 3.5% + 7.8% = 11.3%.",
            "Compare forecast to required return: Forecast (12.0%) > Required (11.3%).",
            "Jensen's Alpha = 12.0% - 11.3% = +0.70%.",
            "Since expected return exceeds required return, the stock plots above the SML and is undervalued.",
          ],
          finalAnswer: "Required Return = 11.30%; Stock is Undervalued (Alpha = +0.70%)",
        },
        trapMatrix: [
          {
            trapName: "SML Overvalued/Undervalued Inversion",
            examinerDistractor: "Concluding the stock is 'overvalued' because its expected return is higher than the market.",
            remediationRule: "If Return > Required Return (plots ABOVE SML), price is too low to deliver that return, hence UNDERVALUED.",
          },
        ],
      },
    ],
  },
  {
    topicId: "10",
    topicName: "Ethical & Professional Standards",
    weight: "15–20%",
    highYieldTheme: "Code of Ethics, Standards of Professional Conduct I-VII, and GIPS Compliance",
    firstPrinciplesSummary:
      "Ethics carries the highest single weight on Level 1. The fundamental mandate is fiduciary duty to clients above employers and self. If applicable local law conflicts with the Code and Standards, members must adhere to the stricter regulation.",
    losGuides: [
      {
        losCode: "LOS 43.a",
        title: "Standard I(A) Knowledge of the Law & Strict Rule Adherence",
        coreConcept:
          "Members and candidates must understand and comply with all applicable laws, rules, and regulations. In any conflict between local law and the CFA Institute Code and Standards, members MUST adhere to the MORE STRICT law, rule, or standard.",
        formulaLatex: "\\text{Rule of Precedence:} \\quad \\text{Standard} = \\max(\\text{Local Law}, \\text{CFA Institute Code & Standards})",
        formulaExplanation:
          "You can never justify unethical conduct by citing that local law did not specifically prohibit it.",
        workedExample: {
          scenario: "A portfolio manager operates in Country X where local securities law permits accepting undisclosed personal gifts up to $5,000 from brokers. CFA Standard I(B) prohibits accepting gifts that compromise independence.",
          question: "Which rule must the member follow?",
          solutionSteps: [
            "Compare local law (permissive up to $5,000) against CFA Standards (strict prohibition without employer consent).",
            "Identify the stricter standard: CFA Institute Standard I(B).",
            "The member must refuse the gift or obtain explicit written employer consent prior to acceptance.",
          ],
          finalAnswer: "Must follow the stricter CFA Institute Standard.",
        },
        trapMatrix: [
          {
            trapName: "Local Law Defense Fallacy",
            examinerDistractor: "Choosing 'The manager is in compliance because Country X law explicitly permits the transaction.'",
            remediationRule: "Local legality never overrides the higher fiduciary threshold of CFA Standards.",
          },
        ],
      },
    ],
  },
];

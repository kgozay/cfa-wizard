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

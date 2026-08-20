import { NextRequest, NextResponse } from "next/server";
import { VignetteSet, VignetteQuestion, OptionKey, ErrorMode } from "@/types/cfa";
import { CFA_CURRICULUM } from "@/data/curriculum";
import { CFA_VIGNETTES } from "@/data/vignettes";

interface GenerationRequest {
  topicId?: string;
  difficulty?: "Standard" | "High Trap" | "Institutional";
  customPrompt?: string;
  questionCount?: number;
  errorModeTarget?: string;
}

/**
 * Procedural Question Bank & Dynamic Generator
 * Covers all 10 CFA Curriculum Tracks with deep financial formulas,
 * calculator keystrokes, and distractor autopsy reasoning.
 */
function generateProceduralVignette(
  topicId: string,
  difficulty: "Standard" | "High Trap" | "Institutional",
  customPrompt: string,
  targetCount: number = 5
): VignetteSet {
  const topic = CFA_CURRICULUM.find((t) => t.id === topicId) || CFA_CURRICULUM[0];
  const timestamp = Date.now();
  const vignetteId = `ai-vignette-${topic.id}-${timestamp}`;

  const cleanPrompt = customPrompt ? customPrompt.trim() : "";
  const scenarioContext = cleanPrompt
    ? ` The investment committee is conducting a focused scenario drill targeting: "${cleanPrompt}".`
    : ` The investment committee is stress-testing models under standard market conditions.`;

  // Get matching base vignette from CFA_VIGNETTES for reference questions if needed
  const baseVignette = CFA_VIGNETTES.find((v) => v.topicId === topic.id);

  let stem = "";
  let questions: VignetteQuestion[] = [];

  switch (topic.id) {
    case "01": {
      // Track 01: Quantitative Methods
      const rate = 8.4;
      const periods = 6;
      const pmt = 50000;
      const rDec = rate / 100;
      const pvOrd = pmt * ((1 - Math.pow(1 + rDec, -periods)) / rDec);
      const pvDue = pvOrd * (1 + rDec);
      const ear = (Math.pow(1 + rDec / 12, 12) - 1) * 100;

      stem = `An institutional asset allocation team at Apex Capital is designing parametric cash flow and TVM models for a university endowment client.${scenarioContext} The committee evaluates nominal compounding rates, annuity disbursement schedules, conditional Bayesian event probabilities, and regression estimators across global asset classes.`;

      const qBank: VignetteQuestion[] = [
        {
          id: 1,
          losCode: "LOS 1.b",
          stem: `A fixed-income instrument offers a nominal annual stated rate of ${rate.toFixed(2)}% compounded monthly. What is the Effective Annual Rate (EAR)?`,
          options: {
            A: `${rate.toFixed(3)}%`,
            B: `${ear.toFixed(3)}%`,
            C: `${(Math.exp(rDec) * 100 - 100).toFixed(3)}%`,
          },
          correctOption: "B",
          algebraicSolution: `EAR = \\left(1 + \\frac{r_s}{m}\\right)^m - 1 = \\left(1 + \\frac{${rDec}}{12}\\right)^{12} - 1 = ${ear.toFixed(3)}\\%`,
          calculatorKeystrokes: `[2nd][ICONV] -> NOM = ${rate.toFixed(2)} [ENTER] -> [↓][↓] -> C/Y = 12 [ENTER] -> [↑] -> [CPT] EFF => ${ear.toFixed(3)}%`,
          trapCategory: "Compounding Periodicity Conversion",
          errorModeDefault: "PERIODICITY_MISMATCH",
          distractorAutopsy: {
            A: "Distractor A ignores monthly compounding and treats the nominal stated rate as the effective rate.",
            B: "Correct. Accurately applies (1 + r/m)^m - 1 = " + ear.toFixed(3) + "%.",
            C: "Distractor C assumes continuous exponential compounding e^r - 1.",
          },
        },
        {
          id: 2,
          losCode: "LOS 2.d",
          stem: `The endowment commits to making ${periods} annual payments of $${pmt.toLocaleString()} each, with the first grant disbursed immediately at t = 0. At an annual discount rate of ${rate.toFixed(2)}%, the present value of this annuity due is closest to:`,
          options: {
            A: `$${Math.round(pvOrd).toLocaleString()}`,
            B: `$${Math.round(pvDue).toLocaleString()}`,
            C: `$${Math.round(pvDue * (1 + rDec)).toLocaleString()}`,
          },
          correctOption: "B",
          algebraicSolution: `PV_{\\text{due}} = PMT \\times \\left[\\frac{1 - (1+r)^{-N}}{r}\\right] \\times (1+r) = \\$${pmt.toLocaleString()} \\times \\left[\\frac{1 - (1+${rDec})^{-${periods}}}{${rDec}}\\right] \\times (1+${rDec}) = \\$${Math.round(pvDue).toLocaleString()}`,
          calculatorKeystrokes: `[2nd][BGN] -> [2nd][SET] -> [2nd][QUIT] -> [N]=${periods} -> [I/Y]=${rate} -> [PMT]=-${pmt} -> [FV]=0 -> [CPT][PV] => $${Math.round(pvDue).toLocaleString()}`,
          trapCategory: "Annuity Timing Convention (BGN vs. END Mode)",
          errorModeDefault: "BA2_MODE",
          distractorAutopsy: {
            A: "Distractor A leaves the calculator in [END] mode, omitting the (1 + r) front-load factor.",
            B: "Correct. Accurately computes present value of annuity due in [BGN] mode.",
            C: "Distractor C over-compounds by multiplying by (1 + r)^2.",
          },
        },
        {
          id: 3,
          losCode: "LOS 4.d",
          stem: "An analyst estimates a 30% prior probability of recession P(R) = 0.30. In a recession, a tech stock has an 80% probability of reducing capital expenditures P(CapEx|R) = 0.80; in an expansion, the probability is 20% P(CapEx|E) = 0.20. If the firm reduces CapEx, the updated posterior probability of recession P(R|CapEx) is closest to:",
          options: {
            A: "63.2%",
            B: "30.0%",
            C: "80.0%",
          },
          correctOption: "A",
          algebraicSolution: `P(\\text{CapEx}) = (0.30 \\times 0.80) + (0.70 \\times 0.20) = 0.24 + 0.14 = 0.38 \\newline P(R|\\text{CapEx}) = \\frac{0.24}{0.38} = 63.16\\% \\approx 63.2\\%`,
          calculatorKeystrokes: `0.30 [×] 0.80 [=] 0.24 [STO] 1 -> 0.70 [×] 0.20 [+] [RCL] 1 [=] 0.38 [STO] 2 -> [RCL] 1 [÷] [RCL] 2 [=] 0.6316`,
          trapCategory: "Bayes' Formula Conditional Inversion",
          errorModeDefault: "CONCEPTUAL_CONFUSION",
          distractorAutopsy: {
            A: "Correct. Bayes' Formula: P(R|CapEx) = P(CapEx|R)*P(R) / P(CapEx) = 0.24 / 0.38 = 63.2%.",
            B: "Distractor B mistakenly uses the unconditional prior probability (30%).",
            C: "Distractor C confuses the conditional probability P(CapEx|R) with the posterior P(R|CapEx).",
          },
        },
        {
          id: 4,
          losCode: "LOS 6.c",
          stem: "A sample of 25 monthly mutual fund returns yields a sample mean return of 1.20% and sample standard deviation of 2.00%. Testing the null hypothesis H_0: μ = 0.50% against H_a: μ ≠ 0.50% at the 5% significance level (two-tailed critical t = 2.064 with 24 df), the test statistic and conclusion are:",
          options: {
            A: "t = 1.75; Fail to reject H_0",
            B: "t = 1.75; Reject H_0",
            C: "t = 2.064; Reject H_0",
          },
          correctOption: "A",
          algebraicSolution: `\\text{SE} = \\frac{s}{\\sqrt{n}} = \\frac{2.00\\%}{\\sqrt{25}} = 0.40\\% \\newline t = \\frac{1.20\\% - 0.50\\%}{0.40\\%} = 1.75. \\text{ Since } |1.75| < 2.064, \\text{ fail to reject } H_0.`,
          calculatorKeystrokes: `(1.20 [-] 0.50) [÷] (2.00 [÷] 5) [=] 1.75`,
          trapCategory: "Hypothesis Testing Critical Region & Decision Rule",
          errorModeDefault: "FORMULA_SCALAR",
          distractorAutopsy: {
            A: "Correct. The calculated t-statistic of 1.75 is inside the non-rejection region [-2.064, +2.064].",
            B: "Distractor B inverts the decision rule by rejecting when the test statistic is below critical threshold.",
            C: "Distractor C confuses the critical value with the test statistic.",
          },
        },
        {
          id: 5,
          losCode: "LOS 7.c",
          stem: "In a single-factor linear regression of portfolio returns, the Total Sum of Squares (SST) is 500 and the Sum of Squared Errors (SSE) is 150. The Coefficient of Determination (R²) is closest to:",
          options: {
            A: "0.700",
            B: "0.300",
            C: "0.450",
          },
          correctOption: "A",
          algebraicSolution: `R^2 = 1 - \\frac{\\text{SSE}}{\\text{SST}} = 1 - \\frac{150}{500} = 1 - 0.30 = 0.700`,
          calculatorKeystrokes: `1 [-] (150 [÷] 500) [=] 0.700`,
          trapCategory: "R-squared vs. Unexplained Variation (SSE/SST)",
          errorModeDefault: "SIGN_INVERSION",
          distractorAutopsy: {
            A: "Correct. R² = 1 - (SSE / SST) = 1 - 0.30 = 0.70 (70% of variation is explained).",
            B: "Distractor B computes the unexplained proportion SSE/SST = 0.30.",
            C: "Distractor C miscalculates the variance ratio.",
          },
        },
      ];
      questions = qBank;
      break;
    }

    case "02": {
      // Track 02: Economics
      const spotEURUSD = 1.085;
      const spotGBPUSD = 1.272;
      const impliedEURGBP = (spotEURUSD / spotGBPUSD).toFixed(4);
      const quotedEURGBP = "0.8650";

      stem = `An international macroeconomic strategy desk is assessing FX arbitrage, aggregate supply-demand shocks, and monetary policy impacts.${scenarioContext} Current market spot rates quote EUR/USD at ${spotEURUSD} and GBP/USD at ${spotGBPUSD}. A major dealer offers EUR/GBP at ${quotedEURGBP}.`;

      const qBank: VignetteQuestion[] = [
        {
          id: 1,
          losCode: "LOS 12.b",
          stem: `The implied cross-rate for EUR/GBP (base currency GBP, price currency EUR) from the interbank quotes is closest to:`,
          options: {
            A: impliedEURGBP,
            B: (spotGBPUSD / spotEURUSD).toFixed(4),
            C: (spotEURUSD * spotGBPUSD).toFixed(4),
          },
          correctOption: "A",
          algebraicSolution: `\\frac{\\text{EUR}}{\\text{GBP}} = \\frac{\\text{EUR/USD}}{\\text{GBP/USD}} = \\frac{${spotEURUSD}}{${spotGBPUSD}} = ${impliedEURGBP}`,
          calculatorKeystrokes: `${spotEURUSD} [÷] ${spotGBPUSD} [=] ${impliedEURGBP}`,
          trapCategory: "Currency Cross-Rate Base/Price Inversion",
          errorModeDefault: "SIGN_INVERSION",
          distractorAutopsy: {
            A: `Correct. Implied EUR/GBP = (EUR/USD) / (GBP/USD) = ${spotEURUSD} / ${spotGBPUSD} = ${impliedEURGBP}.`,
            B: "Distractor B inverts the quotient to calculate GBP/EUR instead of EUR/GBP.",
            C: "Distractor C erroneously multiplies the dollar rates.",
          },
        },
        {
          id: 2,
          losCode: "LOS 12.d",
          stem: `Comparing the dealer's quoted EUR/GBP (${quotedEURGBP}) to the theoretical cross-rate (${impliedEURGBP}), an arbitrageur can generate riskless profit by:`,
          options: {
            A: "Selling EUR and buying GBP from the dealer, since the dealer overvalues EUR relative to GBP.",
            B: "Buying EUR and selling GBP from the dealer, since the dealer undervalues EUR relative to GBP.",
            C: "No arbitrage is possible because the discrepancy is within transaction band.",
          },
          correctOption: "A",
          algebraicSolution: `\\text{Quoted EUR/GBP} (${quotedEURGBP}) > \\text{Implied} (${impliedEURGBP}) \\implies \\text{EUR is overpriced at dealer; sell EUR to dealer.}`,
          calculatorKeystrokes: "N/A — FX Arbitrage Condition",
          trapCategory: "Triangular Arbitrage Directional Flow",
          errorModeDefault: "CONCEPTUAL_CONFUSION",
          distractorAutopsy: {
            A: "Correct. The dealer is paying more GBP per EUR than theoretical fair value; sell EUR to the dealer.",
            B: "Distractor B misidentifies the overvalued currency in the pair.",
            C: "Distractor C overlooks the significant pricing discrepancy.",
          },
        },
        {
          id: 3,
          losCode: "LOS 9.b",
          stem: "In an oligopoly market structure characterized by a kinked demand curve, why does the firm's price remain rigid even when marginal costs fluctuate within a certain range?",
          options: {
            A: "The marginal revenue curve has a vertical discontinuity at the prevailing market price.",
            B: "Competitors match price increases but ignore price cuts.",
            C: "The firm operates under perfect price discrimination.",
          },
          correctOption: "A",
          algebraicSolution: "\\text{Kinked Demand Theory: } \\text{Demand is elastic above price and inelastic below, producing a vertical gap in MR.}",
          calculatorKeystrokes: "N/A — Oligopoly Market Mechanics",
          trapCategory: "Kinked Demand Curve Marginal Revenue Gap",
          errorModeDefault: "CONCEPTUAL_CONFUSION",
          distractorAutopsy: {
            A: "Correct. The kink in demand creates a vertical gap in the MR curve, allowing MC to shift without altering the profit-maximizing price.",
            B: "Distractor B reverses competitor behavior (rivals match price cuts, but ignore price increases).",
            C: "Distractor C describes first-degree price discrimination in monopolies.",
          },
        },
        {
          id: 4,
          losCode: "LOS 10.d",
          stem: "An economy experiences a sharp sudden surge in energy import prices accompanied by stagnant GDP growth and rising inflation (stagflation). In the AD/AS framework, this is represented by:",
          options: {
            A: "A leftward (inward) shift in the Short-Run Aggregate Supply (SRAS) curve.",
            B: "A rightward (outward) shift in the Aggregate Demand (AD) curve.",
            C: "A leftward (inward) shift in the Aggregate Demand (AD) curve.",
          },
          correctOption: "A",
          algebraicSolution: "\\text{Stagflation: } \\text{Negative supply shock shifts SRAS left, increasing price level while reducing real GDP.}",
          calculatorKeystrokes: "N/A — Macroeconomic Equilibrium",
          trapCategory: "Supply Shock vs. Demand Shift in Stagflation",
          errorModeDefault: "CONCEPTUAL_CONFUSION",
          distractorAutopsy: {
            A: "Correct. Cost-push energy shocks shift SRAS left, driving inflation up and output down.",
            B: "Distractor B would increase GDP, which contradicts stagflation.",
            C: "Distractor C would decrease inflation, which contradicts stagflation.",
          },
        },
        {
          id: 5,
          losCode: "LOS 11.e",
          stem: "When a government runs large fiscal budget deficits funded by domestic borrowing, the 'crowding-out' effect describes how:",
          options: {
            A: "Increased government demand for loanable funds drives up real interest rates, reducing private investment.",
            B: "Central bank open market purchases cause hyperinflation.",
            C: "Export demand surges due to domestic currency depreciation.",
          },
          correctOption: "A",
          algebraicSolution: "\\text{Crowding-Out: } \\text{Deficit borrowing } \\uparrow \\implies \\text{Real rates } \\uparrow \\implies \\text{Private investment } \\downarrow.",
          calculatorKeystrokes: "N/A — Fiscal Policy Multiplier",
          trapCategory: "Crowding-Out Mechanism in Fiscal Expansion",
          errorModeDefault: "CONCEPTUAL_CONFUSION",
          distractorAutopsy: {
            A: "Correct. Deficit financing increases competition for capital, pushing up interest rates and crowding out private sector capex.",
            B: "Distractor B confuses fiscal debt issuance with central bank quantitative easing.",
            C: "Distractor C ignores the upward pressure on domestic currency from higher real yields.",
          },
        },
      ];
      questions = qBank;
      break;
    }

    case "03": {
      // Track 03: Corporate Issuers
      const costD = 6.0;
      const costE = 12.0;
      const taxRate = 0.25;
      const wacc = 0.4 * costD * (1 - taxRate) + 0.6 * costE;

      stem = `A corporate finance committee is reviewing capital allocation strategies, corporate governance protocols, and target debt-equity structures.${scenarioContext} The corporation maintains a target capital structure of 40% debt and 60% equity. Marginal tax rate is 25%, pre-tax cost of debt is ${costD.toFixed(1)}%, and cost of equity is ${costE.toFixed(1)}%. Investment bankers levy a 5% flotation cost on new equity issues.`;

      const qBank: VignetteQuestion[] = [
        {
          id: 1,
          losCode: "LOS 16.a",
          stem: "The corporation's Weighted Average Cost of Capital (WACC) is closest to:",
          options: {
            A: `${wacc.toFixed(2)}%`,
            B: `${(0.4 * costD + 0.6 * costE).toFixed(2)}%`,
            C: `${(wacc + 0.6 * 5.0).toFixed(2)}%`,
          },
          correctOption: "A",
          algebraicSolution: `WACC = w_d r_d (1 - t) + w_e r_e = 0.40 \\times 6.0\\% \\times (1 - 0.25) + 0.60 \\times 12.0\\% = 1.80\\% + 7.20\\% = ${wacc.toFixed(2)}\\%`,
          calculatorKeystrokes: `0.4 [×] 6.0 [×] 0.75 [+] 0.6 [×] 12.0 [=] ${wacc.toFixed(2)}%`,
          trapCategory: "Omission of the Debt Tax Shield (1 - t) in WACC",
          errorModeDefault: "FORMULA_SCALAR",
          distractorAutopsy: {
            A: `Correct. WACC = 0.40*6%*(1 - 0.25) + 0.60*12% = ${wacc.toFixed(2)}%.`,
            B: "Distractor B omits the interest tax deduction on debt.",
            C: "Distractor C incorrectly incorporates flotation costs directly into the ongoing WACC discount rate.",
          },
        },
        {
          id: 2,
          losCode: "LOS 16.f",
          stem: "Under official CFA curriculum standards, how should equity flotation costs be treated in capital budgeting analysis?",
          options: {
            A: "As an initial cash outflow added to the project's net investment cost at t = 0.",
            B: "As an ongoing upward adjustment to the discount rate (WACC) across the project life.",
            C: "As an amortized operating deduction on the income statement.",
          },
          correctOption: "A",
          algebraicSolution: "\\text{Correct Treatment: } \\text{Flotation costs are a lump-sum initial outflow at } t=0, \\text{ not an ongoing WACC markup.}",
          calculatorKeystrokes: "N/A — Capital Budgeting Standard",
          trapCategory: "Flotation Cost Capitalization vs. Discount Rate Inflation",
          errorModeDefault: "CONCEPTUAL_CONFUSION",
          distractorAutopsy: {
            A: "Correct. Flotation costs are a one-time cash outflow at t = 0 and must not inflate ongoing WACC.",
            B: "Distractor B incorrectly inflates the ongoing WACC, perpetually penalizing distant cash flows.",
            C: "Distractor C improperly treats equity issuance financing fees as operational expenses.",
          },
        },
        {
          id: 3,
          losCode: "LOS 14.c",
          stem: "When evaluating two mutually exclusive investment projects with different scales and non-normal cash flows where NPV and IRR give conflicting project rankings, the manager should:",
          options: {
            A: "Select the project with the highest Net Present Value (NPV).",
            B: "Select the project with the highest Internal Rate of Return (IRR).",
            C: "Average the NPV and IRR rankings equally.",
          },
          correctOption: "A",
          algebraicSolution: "\\text{Decision Rule: } \\text{NPV directly measures expected shareholder wealth addition and always supersedes IRR.}",
          calculatorKeystrokes: "N/A — Capital Budgeting Decision Rule",
          trapCategory: "NPV vs. IRR Conflict in Mutually Exclusive Projects",
          errorModeDefault: "CONCEPTUAL_CONFUSION",
          distractorAutopsy: {
            A: "Correct. NPV measures absolute shareholder wealth creation; IRR assumes reinvestment at IRR which may be unrealistic.",
            B: "Distractor B falls into the IRR ranking trap for mutually exclusive projects.",
            C: "Distractor C uses an invalid ad-hoc averaging methodology.",
          },
        },
        {
          id: 4,
          losCode: "LOS 15.b",
          stem: "A company has Days Sales Outstanding (DSO) of 45 days, Days of Inventory on Hand (DOH) of 60 days, and Days Payable Outstanding (DPO) of 35 days. Its Cash Conversion Cycle (CCC) is:",
          options: {
            A: "70 days",
            B: "140 days",
            C: "50 days",
          },
          correctOption: "A",
          algebraicSolution: `\\text{CCC} = \\text{DSO} + \\text{DOH} - \\text{DPO} = 45 + 60 - 35 = 70 \\text{ days}`,
          calculatorKeystrokes: `45 [+] 60 [-] 35 [=] 70`,
          trapCategory: "Working Capital Cash Conversion Cycle Signage",
          errorModeDefault: "SIGN_INVERSION",
          distractorAutopsy: {
            A: "Correct. CCC = DSO + DOH - DPO = 45 + 60 - 35 = 70 days.",
            B: "Distractor B adds DPO instead of subtracting it (45 + 60 + 35 = 140 days).",
            C: "Distractor C subtracts DSO incorrectly.",
          },
        },
        {
          id: 5,
          losCode: "LOS 13.b",
          stem: "In corporate governance and stakeholder management, a dual-class share structure where founders hold super-voting shares primarily introduces:",
          options: {
            A: "An agency conflict where voting control is disconnected from economic equity exposure.",
            B: "An immediate violation of international IFRS disclosure standards.",
            C: "Elimination of all hostile takeover risks without governance drawbacks.",
          },
          correctOption: "A",
          algebraicSolution: "\\text{Dual Class Conflict: } \\text{Entrenches controlling founders by granting voting dominance disproportionate to capital risk.}",
          calculatorKeystrokes: "N/A — Corporate Governance Framework",
          trapCategory: "Dual-Class Share Governance Entrenchment",
          errorModeDefault: "CONCEPTUAL_CONFUSION",
          distractorAutopsy: {
            A: "Correct. Super-voting shares separate control from economic ownership, increasing principal-agent agency risks.",
            B: "Distractor B assumes dual-class shares are illegal under accounting standards.",
            C: "Distractor C ignores the substantial entrenchment risk to minority shareholders.",
          },
        },
      ];
      questions = qBank;
      break;
    }

    case "04": {
      // Track 04: Financial Statement Analysis
      const cogsLIFO = 4200000;
      const begReserve = 320000;
      const endReserve = 540000;
      const deltaReserve = endReserve - begReserve;
      const fifoCOGS = cogsLIFO - deltaReserve;
      const reAdj = endReserve * 0.75;

      stem = `A financial statement analyst is conducting forensic accounting and conversion restatements for a US GAAP manufacturing firm.${scenarioContext} In an inflationary environment, the company reports LIFO COGS of $${cogsLIFO.toLocaleString()}, beginning LIFO Reserve of $${begReserve.toLocaleString()}, ending LIFO Reserve of $${endReserve.toLocaleString()}, and a 25% tax rate.`;

      const qBank: VignetteQuestion[] = [
        {
          id: 1,
          losCode: "LOS 18.c",
          stem: "Zenith's Cost of Goods Sold (COGS) under FIFO for the year would be closest to:",
          options: {
            A: `$${fifoCOGS.toLocaleString()}`,
            B: `$${(cogsLIFO + deltaReserve).toLocaleString()}`,
            C: `$${(cogsLIFO - endReserve).toLocaleString()}`,
          },
          correctOption: "A",
          algebraicSolution: `\\Delta \\text{LIFO Reserve} = \\$${endReserve.toLocaleString()} - \\$${begReserve.toLocaleString()} = \\$${deltaReserve.toLocaleString()} \\newline \\text{COGS(FIFO)} = \\text{COGS(LIFO)} - \\Delta \\text{Reserve} = \\$${cogsLIFO.toLocaleString()} - \\$${deltaReserve.toLocaleString()} = \\$${fifoCOGS.toLocaleString()}`,
          calculatorKeystrokes: `${cogsLIFO} [-] (${endReserve} [-] ${begReserve}) [=] ${fifoCOGS}`,
          trapCategory: "LIFO Reserve Change Directional Sign",
          errorModeDefault: "SIGN_INVERSION",
          distractorAutopsy: {
            A: `Correct. In inflation, FIFO assigns older lower costs: COGS(FIFO) = $${cogsLIFO.toLocaleString()} - $${deltaReserve.toLocaleString()} = $${fifoCOGS.toLocaleString()}.`,
            B: "Distractor B adds the reserve change instead of subtracting it.",
            C: "Distractor C subtracts the entire ending reserve rather than the single-year change.",
          },
        },
        {
          id: 2,
          losCode: "LOS 18.e",
          stem: "The cumulative restatement adjustment to ending Retained Earnings upon converting from LIFO to FIFO is closest to an increase of:",
          options: {
            A: `$${reAdj.toLocaleString()}`,
            B: `$${(deltaReserve * 0.75).toLocaleString()}`,
            C: `$${endReserve.toLocaleString()}`,
          },
          correctOption: "A",
          algebraicSolution: `\\text{Cumulative Retained Earnings Restatement} = \\text{Ending LIFO Reserve} \\times (1 - t) = \\$${endReserve.toLocaleString()} \\times 0.75 = \\$${reAdj.toLocaleString()}`,
          calculatorKeystrokes: `${endReserve} [×] 0.75 [=] ${reAdj}`,
          trapCategory: "Cumulative vs. Single-Period LIFO Reserve Tax Adjustment",
          errorModeDefault: "FORMULA_SCALAR",
          distractorAutopsy: {
            A: `Correct. Cumulative Retained Earnings adjustment = Ending Reserve * (1 - t) = $${endReserve.toLocaleString()} * 0.75 = $${reAdj.toLocaleString()}.`,
            B: "Distractor B uses the single-period ΔReserve * 0.75, which represents current year net income impact.",
            C: "Distractor C ignores the deferred tax liability adjustment.",
          },
        },
        {
          id: 3,
          losCode: "LOS 17.d",
          stem: "Under US GAAP compared to IFRS, how are interest paid, interest received, and dividends received classified on the Statement of Cash Flows?",
          options: {
            A: "US GAAP mandates all three as Operating Cash Flow (CFO); IFRS permits Operating, Investing, or Financing discretion.",
            B: "US GAAP mandates interest paid as Financing (CFF) and interest received as Investing (CFI).",
            C: "Both US GAAP and IFRS require identical classifications across all cash flows.",
          },
          correctOption: "A",
          algebraicSolution: "\\text{GAAP vs IFRS: } \\text{US GAAP strictly requires interest received, interest paid, and dividends received in CFO.}",
          calculatorKeystrokes: "N/A — GAAP vs. IFRS Taxonomy",
          trapCategory: "Cash Flow Classification (US GAAP vs. IFRS)",
          errorModeDefault: "GAAP_VS_IFRS",
          distractorAutopsy: {
            A: "Correct. US GAAP strictly mandates all three in CFO; IFRS allows flexibility between CFO/CFI/CFF.",
            B: "Distractor B confuses US GAAP rules with discretionary IFRS options.",
            C: "Distractor C incorrectly claims US GAAP and IFRS cash flow rules are identical.",
          },
        },
        {
          id: 4,
          losCode: "LOS 20.c",
          stem: "When a statutory corporate income tax rate increase is enacted into law, how does a company with an existing Deferred Tax Liability (DTL) account for this change?",
          options: {
            A: "The DTL is revalued upward immediately, resulting in an additional income tax expense on the current income statement.",
            B: "The DTL is left unchanged until the temporary difference actually reverses.",
            C: "The adjustment is recorded directly to Other Comprehensive Income (OCI) without impacting net income.",
          },
          correctOption: "A",
          algebraicSolution: "\\text{DTL Rate Increase: } \\Delta \\text{DTL} = \\text{Temporary Difference} \\times \\Delta t \\implies \\text{Higher tax expense in period of enactment.}",
          calculatorKeystrokes: "N/A — Deferred Tax Accounting",
          trapCategory: "Deferred Tax Liability Revaluation on Tax Rate Change",
          errorModeDefault: "CONCEPTUAL_CONFUSION",
          distractorAutopsy: {
            A: "Correct. Under both US GAAP and IFRS, DTLs are adjusted for rate changes in the period of enactment through profit & loss.",
            B: "Distractor B ignores the mandatory balance sheet liability revaluation requirement.",
            C: "Distractor C incorrectly bypasses the income statement.",
          },
        },
        {
          id: 5,
          losCode: "LOS 21.b",
          stem: "An analyst suspects aggressive earnings management. If a firm capitalizes routine software maintenance expenditures rather than expensing them immediately, in the current period this will:",
          options: {
            A: "Overstate current Net Income and overstate Operating Cash Flow (CFO), while understating Investing Cash Flow (CFI).",
            B: "Understate current Net Income and understate Operating Cash Flow (CFO).",
            C: "Have zero impact on cash flows because cash paid remains identical.",
          },
          correctOption: "A",
          algebraicSolution: "\\text{Capitalizing: } \\text{Decreases OpEx (} \\uparrow \\text{NI}), \\text{shifts outflow from CFO to CFI (} \\uparrow \\text{CFO, } \\downarrow \\text{CFI).}",
          calculatorKeystrokes: "N/A — Capitalizing vs. Expensing Mechanics",
          trapCategory: "Capitalizing vs. Expensing Cash Flow Reclassification",
          errorModeDefault: "CONCEPTUAL_CONFUSION",
          distractorAutopsy: {
            A: "Correct. Capitalizing avoids an immediate expense (boosting NI & CFO) and records the outflow as capital expenditure in CFI.",
            B: "Distractor B gets the directional earnings effect completely inverted.",
            C: "Distractor C ignores the CFO vs. CFI cash flow statement reclassification.",
          },
        },
      ];
      questions = qBank;
      break;
    }

    case "05": {
      // Track 05: Equity Investments
      const d0 = 2.4;
      const g = 0.05;
      const rReq = 0.09;
      const d1 = d0 * (1 + g);
      const p0 = d1 / (rReq - g);

      stem = `An institutional equity research team is valuing common equities using discounted cash flow, dividend discount models, and market structure analytics.${scenarioContext} Alpha Utilities recently paid an annual dividend of $${d0.toFixed(2)} per share ($D_0$). Dividends are projected to grow indefinitely at a constant rate of ${(g * 100).toFixed(1)}%, with a required return on equity of ${(rReq * 100).toFixed(1)}%.`;

      const qBank: VignetteQuestion[] = [
        {
          id: 1,
          losCode: "LOS 25.b",
          stem: "The intrinsic value per share of Alpha Utilities using the Gordon Growth Model is closest to:",
          options: {
            A: `$${p0.toFixed(2)}`,
            B: `$${(d0 / (rReq - g)).toFixed(2)}`,
            C: `$${(d1 / rReq).toFixed(2)}`,
          },
          correctOption: "A",
          algebraicSolution: `P_0 = \\frac{D_1}{r - g} = \\frac{D_0 \\times (1+g)}{r - g} = \\frac{\\$${d0.toFixed(2)} \\times 1.05}{0.09 - 0.05} = \\frac{\\$${d1.toFixed(3)}}{0.04} = \\$${p0.toFixed(2)}`,
          calculatorKeystrokes: `${d0} [×] ${(1 + g)} [÷] (${rReq} [-] ${g}) [=] $${p0.toFixed(2)}`,
          trapCategory: "D0 vs. D1 Timing in Gordon Growth Model",
          errorModeDefault: "SIGN_INVERSION",
          distractorAutopsy: {
            A: `Correct. Intrinsic value P_0 = D_1 / (r - g) = ($${d0} * 1.05) / 0.04 = $${p0.toFixed(2)}.`,
            B: "Distractor B mistakenly uses historical dividend D_0 in the numerator instead of expected dividend D_1.",
            C: "Distractor C omits growth in the denominator, treating the security as a zero-growth perpetuity.",
          },
        },
        {
          id: 2,
          losCode: "LOS 25.f",
          stem: "If Alpha Utilities generates a Return on Equity (ROE) of 12.0% and maintains a dividend payout ratio of 60%, its sustainable growth rate (g) is closest to:",
          options: {
            A: "4.80%",
            B: "7.20%",
            C: "12.00%",
          },
          correctOption: "A",
          algebraicSolution: `g = b \\times \\text{ROE} = (1 - \\text{Payout Ratio}) \\times \\text{ROE} = (1 - 0.60) \\times 12.0\\% = 0.40 \\times 12.0\\% = 4.80\\%`,
          calculatorKeystrokes: `(1 [-] 0.60) [×] 12 [=] 4.80%`,
          trapCategory: "Retention Rate (b) vs. Payout Ratio in Sustainable Growth",
          errorModeDefault: "FORMULA_SCALAR",
          distractorAutopsy: {
            A: "Correct. Sustainable growth g = (1 - Payout) * ROE = 0.40 * 12% = 4.80%.",
            B: "Distractor B multiplies ROE by the payout ratio (0.60 * 12% = 7.20%).",
            C: "Distractor C assumes 100% earnings retention.",
          },
        },
        {
          id: 3,
          losCode: "LOS 22.c",
          stem: "An investor buys 1,000 shares of stock on margin at $50 per share with an initial margin requirement of 50% and a maintenance margin requirement of 30%. The price at which a margin call will be triggered is closest to:",
          options: {
            A: "$35.71",
            B: "$25.00",
            C: "$15.00",
          },
          correctOption: "A",
          algebraicSolution: `P_{\\text{margin call}} = \\frac{P_0 \\times (1 - \\text{Initial Margin})}{1 - \\text{Maintenance Margin}} = \\frac{\\$50 \\times (1 - 0.50)}{1 - 0.30} = \\frac{\\$25}{0.70} = \\$35.71`,
          calculatorKeystrokes: `50 [×] (1 [-] 0.50) [÷] (1 [-] 0.30) [=] 35.71`,
          trapCategory: "Margin Call Trigger Price Formula",
          errorModeDefault: "FORMULA_SCALAR",
          distractorAutopsy: {
            A: "Correct. Margin call price = P_0 * (1 - IM) / (1 - MM) = $25 / 0.70 = $35.71.",
            B: "Distractor B computes the initial equity per share ($25.00).",
            C: "Distractor C calculates $50 * (0.50 - 0.30) without proper denominator weighting.",
          },
        },
        {
          id: 4,
          losCode: "LOS 23.b",
          stem: "In a price-weighted equity index, when a component stock undergoes a 2-for-1 stock split, how is the index divisor adjusted to maintain continuity?",
          options: {
            A: "The divisor is decreased so that the index value immediately after the split matches the pre-split value.",
            B: "The divisor is increased to offset the lower nominal share price.",
            C: "The divisor remains unchanged because total index market capitalization is unaffected.",
          },
          correctOption: "A",
          algebraicSolution: "\\text{Price-Weighted Divisor: } \\text{Sum of lower post-split prices requires a smaller divisor to keep index level constant.}",
          calculatorKeystrokes: "N/A — Index Construction Mechanics",
          trapCategory: "Price-Weighted Index Divisor Adjustment Polarity",
          errorModeDefault: "SIGN_INVERSION",
          distractorAutopsy: {
            A: "Correct. Because the post-split share price is lower, the denominator (divisor) must decrease to maintain the same index value.",
            B: "Distractor B inverts the direction of the divisor adjustment.",
            C: "Distractor C confuses price-weighted indices with market-cap-weighted indices.",
          },
        },
        {
          id: 5,
          losCode: "LOS 24.b",
          stem: "According to the Efficient Market Hypothesis (EMH), in a semi-strong form efficient market, which investment strategy CANNOT consistently generate abnormal risk-adjusted returns?",
          options: {
            A: "Both fundamental analysis and technical analysis.",
            B: "Technical analysis only; fundamental analysis will consistently outperform.",
            C: "Insider trading on private material non-public information.",
          },
          correctOption: "A",
          algebraicSolution: "\\text{Semi-Strong EMH: } \\text{Prices reflect all historical market data AND all publicly available information.}",
          calculatorKeystrokes: "N/A — Efficient Market Hypothesis",
          trapCategory: "Weak vs. Semi-Strong vs. Strong Form EMH Boundaries",
          errorModeDefault: "CONCEPTUAL_CONFUSION",
          distractorAutopsy: {
            A: "Correct. In semi-strong markets, all public information (financial statements, news) and price history are already priced in, rendering both technical and fundamental analysis ineffective for abnormal returns.",
            B: "Distractor B describes weak-form efficiency.",
            C: "Distractor C describes strong-form efficiency.",
          },
        },
      ];
      questions = qBank;
      break;
    }

    case "06": {
      // Track 06: Fixed Income
      const modDur = 6.4;
      const conv = 58.0;
      const deltaY = 0.01;
      const priceChange = -modDur * deltaY + 0.5 * conv * Math.pow(deltaY, 2);
      const priceChangePct = (priceChange * 100).toFixed(3);

      stem = `A fixed-income risk officer is stress-testing an institutional sovereign bond portfolio under interest rate volatility shocks.${scenarioContext} The benchmark portfolio has an effective modified duration of ${modDur} years and an annual convexity of ${conv}. Yield curves are modeled for an instantaneous parallel upward yield shift of +100 bps (+1.00%).`;

      const qBank: VignetteQuestion[] = [
        {
          id: 1,
          losCode: "LOS 30.e",
          stem: `Using both modified duration (${modDur}) and convexity (${conv}), the estimated percentage price change of the bond portfolio is closest to:`,
          options: {
            A: `${priceChangePct}%`,
            B: `-${(modDur * 1.0).toFixed(3)}%`,
            C: `-${(modDur - conv * 0.0001 * 100).toFixed(3)}%`,
          },
          correctOption: "A",
          algebraicSolution: `\\frac{\\Delta P}{P} \\approx -\\text{ModDur} \\times \\Delta y + \\frac{1}{2} \\times \\text{Conv} \\times (\\Delta y)^2 \\newline = -${modDur} \\times 0.01 + 0.5 \\times ${conv} \\times (0.01)^2 = -0.064 + 0.0029 = ${priceChangePct}\\%`,
          calculatorKeystrokes: `[-] ${modDur} [×] 0.01 [+] (0.5 [×] ${conv} [×] 0.01 [x^2]) [=] ${priceChangePct}%`,
          trapCategory: "Omission of the 1/2 Convexity Scalar Factor",
          errorModeDefault: "FORMULA_SCALAR",
          distractorAutopsy: {
            A: `Correct. Accurately applies %ΔP = -ModDur*(Δy) + 0.5*Convexity*(Δy)^2 = ${priceChangePct}%.`,
            B: "Distractor B uses only linear duration (-6.400%), omitting the positive convexity cushion.",
            C: "Distractor C omits the 1/2 factor in the Taylor series expansion.",
          },
        },
        {
          id: 2,
          losCode: "LOS 28.b",
          stem: "When interest rate volatility rises significantly, the price of a callable bond relative to an otherwise identical option-free straight bond will:",
          options: {
            A: "Exhibit negative convexity and underperform as yields drop toward the strike price.",
            B: "Exhibit increased positive convexity and outperform an option-free bond in all market environments.",
            C: "Maintain identical price sensitivity because call options only affect maturity dates.",
          },
          correctOption: "A",
          algebraicSolution: "\\text{Callable Bond Dynamics: } \\text{Value} = \\text{Straight Bond} - \\text{Call Option.} \\text{ High volatility increases call value, capping bond price gains.}",
          calculatorKeystrokes: "N/A — Embedded Option Dynamics",
          trapCategory: "Callable vs. Putable Bond Convexity Distortion",
          errorModeDefault: "CONCEPTUAL_CONFUSION",
          distractorAutopsy: {
            A: "Correct. Callable bonds exhibit negative convexity at lower yields because the issuer's incentive to call caps price appreciation.",
            B: "Distractor B confuses callable bonds with putable bonds (putable bonds exhibit enhanced positive convexity).",
            C: "Distractor C ignores the asymmetric optionality embedded in callable debt.",
          },
        },
        {
          id: 3,
          losCode: "LOS 29.c",
          stem: "In fixed-income spread analysis, the Zero-Volatility Spread (Z-spread) is defined as:",
          options: {
            A: "The constant spread that must be added to each spot rate on the benchmark yield curve to discount bond cash flows to current market price.",
            B: "The spread over the on-the-run government benchmark bond yield to maturity.",
            C: "The spread on a credit default swap with zero counterparty risk.",
          },
          correctOption: "A",
          algebraicSolution: "\\text{Z-spread: } P = \\sum_{t=1}^N \\frac{CF_t}{(1 + z_t + Z)^t} \\text{ where } z_t \\text{ is the spot rate at period } t.",
          calculatorKeystrokes: "N/A — Fixed Income Spread Taxonomy",
          trapCategory: "Nominal Spread vs. Z-spread vs. OAS",
          errorModeDefault: "CONCEPTUAL_CONFUSION",
          distractorAutopsy: {
            A: "Correct. Z-spread is the single constant basis point spread added to the entire zero-coupon spot curve.",
            B: "Distractor B defines the nominal G-spread or benchmark yield spread.",
            C: "Distractor C confuses cash bond spreads with derivative CDS spreads.",
          },
        },
        {
          id: 4,
          losCode: "LOS 28.c",
          stem: "A 10-year annual bond with a par value of $1,000 pays a 6.0% annual coupon and has a Yield to Maturity (YTM) of 7.0%. The price of the bond is closest to:",
          options: {
            A: "$929.76",
            B: "$1,000.00",
            C: "$1,073.60",
          },
          correctOption: "A",
          algebraicSolution: `PV = 60 \\times \\left[\\frac{1 - (1.07)^{-10}}{0.07}\\right] + \\frac{1000}{(1.07)^{10}} = \\$421.41 + \\$508.35 = \\$929.76`,
          calculatorKeystrokes: `[2nd][CLR TVM] -> N=10 -> I/Y=7 -> PMT=60 -> FV=1000 -> [CPT][PV] => -929.76`,
          trapCategory: "Bond Pricing at Discount (Coupon < YTM)",
          errorModeDefault: "BA2_MODE",
          distractorAutopsy: {
            A: "Correct. Because Coupon (6%) < YTM (7%), the bond trades at a discount ($929.76).",
            B: "Distractor B represents par pricing when Coupon = YTM.",
            C: "Distractor C computes a premium bond price (inverting coupon and YTM).",
          },
        },
        {
          id: 5,
          losCode: "LOS 31.b",
          stem: "In credit analysis, what does the concept of 'structural subordination' describe when a corporate parent holding company issues debt alongside operating subsidiaries?",
          options: {
            A: "Operating subsidiary debt has prior claim to the cash flows and assets of the operating subsidiary over holding company debt.",
            B: "Holding company debt automatically ranks pari passu with operating subsidiary debt.",
            C: "Subordinated debt is converted into common equity during bankruptcy.",
          },
          correctOption: "A",
          algebraicSolution: "\\text{Structural Subordination: } \\text{Holding company debt is structurally junior because operating debt has direct first lien on operating assets.}",
          calculatorKeystrokes: "N/A — Credit Priority Taxonomy",
          trapCategory: "Structural Subordination in Holding Company Debt",
          errorModeDefault: "CONCEPTUAL_CONFUSION",
          distractorAutopsy: {
            A: "Correct. Subsidiary debt has first claim on operating cash flows; the parent only receives remaining residual dividends.",
            B: "Distractor B assumes legal pari passu equality across distinct legal corporate entities.",
            C: "Distractor C describes convertible debt restructuring.",
          },
        },
      ];
      questions = qBank;
      break;
    }

    case "07": {
      // Track 07: Derivatives
      const spotS = 100;
      const strikeK = 100;
      const callC = 8.5;
      const rRiskFree = 0.05;
      const timeT = 1.0;
      const pvStrike = strikeK / Math.pow(1 + rRiskFree, timeT);
      const putP = (callC + pvStrike - spotS).toFixed(2);

      stem = `A quantitative derivatives trading desk is structuring European options, evaluating forward commitments, and implementing synthetic replication strategies.${scenarioContext} A non-dividend-paying stock trades at $${spotS}. A 1-year European call option with strike $${strikeK} trades at $${callC.toFixed(2)}. The 1-year annual risk-free rate is ${(rRiskFree * 100).toFixed(1)}%.`;

      const qBank: VignetteQuestion[] = [
        {
          id: 1,
          losCode: "LOS 34.d",
          stem: "Under Put-Call Parity, the theoretical no-arbitrage price of an otherwise identical 1-year European put option is closest to:",
          options: {
            A: `$${putP}`,
            B: `$${(parseFloat(putP) + strikeK * 0.05).toFixed(2)}`,
            C: `$${(callC - 5.0).toFixed(2)}`,
          },
          correctOption: "A",
          algebraicSolution: `P_0 = C_0 + \\frac{K}{(1+r)^T} - S_0 = \\$${callC.toFixed(2)} + \\frac{\\$${strikeK}}{1.05} - \\$${spotS} = \\$${callC.toFixed(2)} + \\$${pvStrike.toFixed(2)} - \\$${spotS} = \\$${putP}`,
          calculatorKeystrokes: `${callC} [+] (${strikeK} [÷] 1.05) [-] ${spotS} [=] $${putP}`,
          trapCategory: "Put-Call Parity Discount Factor Omission",
          errorModeDefault: "FORMULA_SCALAR",
          distractorAutopsy: {
            A: `Correct. Put-Call Parity: P = C + PV(K) - S = $${callC} + $${pvStrike.toFixed(2)} - $${spotS} = $${putP}.`,
            B: "Distractor B uses nominal undiscounted strike K ($100) instead of PV(K) ($95.24).",
            C: "Distractor C calculates simple intrinsic difference without time value discounting.",
          },
        },
        {
          id: 2,
          losCode: "LOS 34.a",
          stem: "At contract initiation (t = 0), the economic value of a standard forward contract to the long party is:",
          options: {
            A: "Zero, because the forward price is set such that the contract has zero initial value.",
            B: "Equal to the agreed forward price multiplied by the risk-free rate.",
            C: "Equal to the current spot price minus the present value of storage costs.",
          },
          correctOption: "A",
          algebraicSolution: "\\text{Forward Value at Initiation: } V_0(\\text{Forward}) = 0.",
          calculatorKeystrokes: "N/A — Forward Value at Initiation",
          trapCategory: "Forward Price vs. Forward Value Confusion",
          errorModeDefault: "CONCEPTUAL_CONFUSION",
          distractorAutopsy: {
            A: "Correct. By definition, the forward price F_0(T) is calibrated so that the initial contract value V_0 = 0.",
            B: "Distractor B confuses forward contract price with forward contract value.",
            C: "Distractor C confuses spot asset value with contract market value.",
          },
        },
        {
          id: 3,
          losCode: "LOS 34.c",
          stem: "Under Put-Call Parity, a synthetic long stock position is replicated by combining:",
          options: {
            A: "Long Call + Short Put + Long Zero-Coupon Risk-Free Bond [PV(X)].",
            B: "Long Put + Short Call + Long Zero-Coupon Risk-Free Bond [PV(X)].",
            C: "Long Call + Long Put + Short Stock.",
          },
          correctOption: "A",
          algebraicSolution: "S_0 = C_0 - P_0 + PV(X) \\implies \\text{Long Call, Short Put, and Long Bond.}",
          calculatorKeystrokes: "N/A — Synthetic Replication Identity",
          trapCategory: "Synthetic Asset Replication Signage in Put-Call Parity",
          errorModeDefault: "SIGN_INVERSION",
          distractorAutopsy: {
            A: "Correct. Rearranging S_0 + P_0 = C_0 + PV(X) yields S_0 = C_0 - P_0 + PV(X).",
            B: "Distractor B creates a synthetic short stock position.",
            C: "Distractor C describes a straddle overlay rather than stock replication.",
          },
        },
        {
          id: 4,
          losCode: "LOS 33.b",
          stem: "A stock trading at $80 pays no dividends. If the continuous risk-free interest rate is 4.0% per annum, the 6-month forward price is closest to:",
          options: {
            A: "$81.62",
            B: "$83.26",
            C: "$80.00",
          },
          correctOption: "A",
          algebraicSolution: `F_0(T) = S_0 e^{rT} = \\$80 \\times e^{0.04 \\times 0.5} = \\$80 \\times e^{0.02} = \\$80 \\times 1.0202 = \\$81.62`,
          calculatorKeystrokes: `80 [×] (0.04 [×] 0.5 [2nd][e^x]) [=] 81.62`,
          trapCategory: "Forward Pricing Time Horizon Scaling (T = 0.5 yrs)",
          errorModeDefault: "PERIODICITY_MISMATCH",
          distractorAutopsy: {
            A: "Correct. F_0 = S_0 * e^(r*T) = $80 * e^(0.04*0.5) = $81.62.",
            B: "Distractor B uses a full 1-year maturity (T = 1.0) instead of 6 months (T = 0.5).",
            C: "Distractor C assumes forward price equals spot price.",
          },
        },
        {
          id: 5,
          losCode: "LOS 32.c",
          stem: "What key structural feature fundamentally distinguishes exchange-traded futures contracts from over-the-counter (OTC) forward contracts?",
          options: {
            A: "Daily cash mark-to-market settlement with a central clearinghouse novation, eliminating private counterparty default risk.",
            B: "Futures contracts are customized privately between two institutional parties.",
            C: "Futures contracts have zero margin requirements.",
          },
          correctOption: "A",
          algebraicSolution: "\\text{Futures Mechanics: } \\text{Standardized terms, central clearinghouse, daily mark-to-market settlement.}",
          calculatorKeystrokes: "N/A — Futures vs. Forwards Mechanics",
          trapCategory: "Futures Daily Mark-to-Market vs. Forward Expiration Settlement",
          errorModeDefault: "CONCEPTUAL_CONFUSION",
          distractorAutopsy: {
            A: "Correct. Futures feature daily mark-to-market settlement and central clearing novation to virtually eliminate default risk.",
            B: "Distractor B describes OTC forward contracts.",
            C: "Distractor C is incorrect because futures mandate initial and maintenance margins.",
          },
        },
      ];
      questions = qBank;
      break;
    }

    case "08": {
      // Track 08: Alternative Investments
      const commCap = 50000000;

      stem = `An institutional endowment allocator is conducting due diligence on private equity waterfalls, real estate direct capitalization, and hedge fund fee terms.${scenarioContext} The allocator reviews a private equity partnership with committed capital of $${(commCap / 1000000).toFixed(0)}M, an American (deal-by-deal) waterfall, an 8% preferred return, and a 20% carried interest with clawback provisions.`;

      const qBank: VignetteQuestion[] = [
        {
          id: 1,
          losCode: "LOS 36.c",
          stem: "Under an American (deal-by-deal) waterfall compared to a European (whole-fund) waterfall, carried interest distributions to the General Partner (GP) are:",
          options: {
            A: "Distributed earlier as individual profitable deals are exited, exposing the GP to potential clawback liabilities.",
            B: "Deferred until Limited Partners (LPs) receive 100% of their total contributed capital across all deals.",
            C: "Capped at 2% of annual committed capital regardless of profit realizations.",
          },
          correctOption: "A",
          algebraicSolution: "\\text{American Waterfall: } \\text{Deal-by-deal carry payments create clawback risk if later investments incur losses.}",
          calculatorKeystrokes: "N/A — Private Equity Waterfall Structure",
          trapCategory: "American vs. European Waterfall Carried Interest Timing",
          errorModeDefault: "CONCEPTUAL_CONFUSION",
          distractorAutopsy: {
            A: "Correct. American deal-by-deal waterfalls distribute carry on early winners before total fund capital is returned, exposing the GP to clawback if subsequent deals fail.",
            B: "Distractor B describes a European (whole-fund) waterfall.",
            C: "Distractor C confuses carried interest with management fees.",
          },
        },
        {
          id: 2,
          losCode: "LOS 37.b",
          stem: "In direct real estate valuation, the Capitalization Rate (Cap Rate) is defined as:",
          options: {
            A: "Net Operating Income (NOI) divided by Property Value (Sales Price).",
            B: "Gross Rental Income minus Debt Service divided by Equity Invested.",
            C: "Net Income after Taxes and Depreciation divided by Property Value.",
          },
          correctOption: "A",
          algebraicSolution: "\\text{Cap Rate} = \\frac{\\text{Net Operating Income (NOI)}}{\\text{Property Value}}",
          calculatorKeystrokes: "N/A — Real Estate Direct Capitalization",
          trapCategory: "NOI vs. Cash Flow After Debt Service in Cap Rate",
          errorModeDefault: "FORMULA_SCALAR",
          distractorAutopsy: {
            A: "Correct. Cap Rate = NOI / Property Value. NOI is strictly unlevered operating income.",
            B: "Distractor B describes equity cash-on-cash return, which subtracts financing debt service.",
            C: "Distractor C incorrectly subtracts non-cash depreciation and income taxes.",
          },
        },
        {
          id: 3,
          losCode: "LOS 38.c",
          stem: "A hedge fund with $100M in initial AUM ends the year at $120M. It charges a '2 and 20' fee structure (2% management fee on end-of-year capital, 20% incentive fee net of management fee) with a High-Water Mark of $100M. Total fees earned by the manager are:",
          options: {
            A: "$5.92M ($2.40M management fee + $3.52M incentive fee)",
            B: "$6.40M ($2.40M management fee + $4.00M incentive fee)",
            C: "$4.00M ($4.00M incentive fee only)",
          },
          correctOption: "A",
          algebraicSolution: `\\text{Mgmt Fee} = \\$120M \\times 2\\% = \\$2.40M \\newline \\text{Net Profit} = \\$120M - \\$2.40M - \\$100M = \\$17.60M \\newline \\text{Incentive Fee} = \\$17.60M \\times 20\\% = \\$3.52M \\newline \\text{Total Fees} = \\$2.40M + \\$3.52M = \\$5.92M`,
          calculatorKeystrokes: `120 [×] 0.02 [=] 2.40 [STO] 1 -> (120 [-] [RCL] 1 [-] 100) [×] 0.20 [+] [RCL] 1 [=] 5.92`,
          trapCategory: "Hedge Fund Incentive Fee Net vs. Gross of Management Fee",
          errorModeDefault: "FORMULA_SCALAR",
          distractorAutopsy: {
            A: "Correct. Management fee = $2.40M. Net profit = $120M - $2.40M - $100M = $17.60M. Incentive fee = 20% * $17.60M = $3.52M. Total = $5.92M.",
            B: "Distractor B computes the incentive fee gross of management fee (20% * $20M = $4.00M).",
            C: "Distractor C ignores the management fee.",
          },
        },
        {
          id: 4,
          losCode: "LOS 35.c",
          stem: "When commodity futures markets are in 'contango' (futures price > spot price), an investor executing a continuous long rolling futures strategy will experience:",
          options: {
            A: "Negative roll yield due to buying higher-priced distant contracts to replace expiring contracts.",
            B: "Positive roll yield due to high convenience yield exceeding storage costs.",
            C: "Zero roll yield because futures and spot converge at expiration.",
          },
          correctOption: "A",
          algebraicSolution: "\\text{Contango: } F_0 > S_0 \\implies \\text{Rolling long futures results in negative roll yield (buying high, settling lower).}",
          calculatorKeystrokes: "N/A — Commodity Futures Curves",
          trapCategory: "Contango vs. Backwardation Roll Yield Sign",
          errorModeDefault: "SIGN_INVERSION",
          distractorAutopsy: {
            A: "Correct. In contango, upward-sloping futures curves produce negative roll yield as longer-dated contracts are purchased at a premium.",
            B: "Distractor B describes backwardation where roll yield is positive.",
            C: "Distractor C ignores the continuous roll cost across contract expiration cycles.",
          },
        },
        {
          id: 5,
          losCode: "LOS 35.a",
          stem: "A primary historical bias that inflates reported historical returns and understates reported volatility in alternative investment benchmark indices is:",
          options: {
            A: "Survivorship bias and backfill bias.",
            B: "Look-ahead bias and time-period bias.",
            C: "Sampling error and non-response bias.",
          },
          correctOption: "A",
          algebraicSolution: "\\text{Index Biases: } \\text{Failed funds drop out (survivorship bias) and successful track records are retroactively added (backfill bias).}",
          calculatorKeystrokes: "N/A — Alternative Investment Benchmark Biases",
          trapCategory: "Survivorship and Backfill Bias in Hedge Fund Benchmarks",
          errorModeDefault: "CONCEPTUAL_CONFUSION",
          distractorAutopsy: {
            A: "Correct. Survivorship bias excludes failed funds, and backfill bias only includes new funds with stellar prior track records.",
            B: "Distractor B describes quantitative backtesting model errors.",
            C: "Distractor C describes survey sampling flaws.",
          },
        },
      ];
      questions = qBank;
      break;
    }

    case "09": {
      // Track 09: Portfolio Construction
      const rf = 4.0;
      const rm = 10.0;
      const beta = 1.25;
      const er = rf + beta * (rm - rf);
      const actualR = 13.0;
      const alpha = actualR - er;

      stem = `A multi-asset portfolio management team is evaluating asset allocation, Capital Asset Pricing Model (CAPM) expectations, and risk-adjusted performance attribution.${scenarioContext} Benchmark parameters quote the risk-free rate at ${rf.toFixed(1)}%, expected return on the market portfolio at ${rm.toFixed(1)}%, and an active portfolio with beta of ${beta.toFixed(2)} and actual annual return of ${actualR.toFixed(1)}%.`;

      const qBank: VignetteQuestion[] = [
        {
          id: 1,
          losCode: "LOS 41.c",
          stem: "According to the Capital Asset Pricing Model (CAPM), the expected return of the active portfolio is closest to:",
          options: {
            A: `${er.toFixed(2)}%`,
            B: `${(beta * rm).toFixed(2)}%`,
            C: `${(rf + beta * rm).toFixed(2)}%`,
          },
          correctOption: "A",
          algebraicSolution: `E(R) = R_f + \\beta [E(R_m) - R_f] = ${rf}\\% + ${beta} \\times [${rm}\\% - ${rf}\\%] = ${rf}\\% + ${beta} \\times 6.0\\% = ${er.toFixed(2)}\\%`,
          calculatorKeystrokes: `${rf} [+] (${beta} [×] (${rm} [-] ${rf})) [=] ${er.toFixed(2)}%`,
          trapCategory: "Market Risk Premium [E(Rm) - Rf] vs. Market Return [E(Rm)]",
          errorModeDefault: "FORMULA_SCALAR",
          distractorAutopsy: {
            A: `Correct. CAPM E(R) = ${rf}% + ${beta}*(${rm}% - ${rf}%) = ${er.toFixed(2)}%.`,
            B: "Distractor B multiplies beta by market return directly, omitting the risk-free rate.",
            C: "Distractor C fails to subtract R_f from R_m in the equity risk premium.",
          },
        },
        {
          id: 2,
          losCode: "LOS 41.f",
          stem: `The portfolio's Jensen's Alpha (α) relative to its CAPM benchmark is closest to:`,
          options: {
            A: `+${alpha.toFixed(2)}%`,
            B: `-${alpha.toFixed(2)}%`,
            C: `+${(actualR - rm).toFixed(2)}%`,
          },
          correctOption: "A",
          algebraicSolution: `\\alpha_p = R_p - E(R_p) = ${actualR.toFixed(2)}\\% - ${er.toFixed(2)}\\% = +${alpha.toFixed(2)}\\%`,
          calculatorKeystrokes: `${actualR.toFixed(1)} [-] ${er.toFixed(2)} [=] +${alpha.toFixed(2)}%`,
          trapCategory: "Sign Direction in Jensen's Alpha Outperformance",
          errorModeDefault: "SIGN_INVERSION",
          distractorAutopsy: {
            A: `Correct. Jensen's Alpha = Actual Return (${actualR}%) - CAPM Expected Return (${er.toFixed(2)}%) = +${alpha.toFixed(2)}%.`,
            B: "Distractor B inverts the sign (-1.50%).",
            C: "Distractor C compares actual return to unadjusted market return.",
          },
        },
        {
          id: 3,
          losCode: "LOS 41.a",
          stem: "In modern portfolio theory, what fundamental distinction separates the Capital Market Line (CML) from the Security Market Line (SML)?",
          options: {
            A: "The CML uses Total Risk (standard deviation σ) on the x-axis for efficient portfolios; the SML uses Systematic Risk (Beta β) for all securities and portfolios.",
            B: "The CML applies to all individual assets; the SML applies exclusively to the market portfolio.",
            C: "The SML is only valid when markets are inefficient.",
          },
          correctOption: "A",
          algebraicSolution: "\\text{CML vs SML: } \\text{CML: } E(R) \\text{ vs } \\sigma_p. \\quad \\text{SML: } E(R) \\text{ vs } \\beta_i.",
          calculatorKeystrokes: "N/A — Capital Market Line vs. Security Market Line",
          trapCategory: "CML vs. SML Risk Metric (Standard Deviation vs. Beta)",
          errorModeDefault: "CONCEPTUAL_CONFUSION",
          distractorAutopsy: {
            A: "Correct. CML plots total standard deviation for efficient portfolios; SML plots beta for all individual assets and portfolios.",
            B: "Distractor B reverses the asset scope of CML and SML.",
            C: "Distractor C misinterprets SML pricing equilibrium.",
          },
        },
        {
          id: 4,
          losCode: "LOS 41.e",
          stem: "Portfolio A has an expected return of 12.0%, standard deviation of 16.0%, and Beta of 1.20. With a risk-free rate of 4.0%, its Sharpe Ratio and Treynor Ratio are:",
          options: {
            A: "Sharpe = 0.50; Treynor = 6.67%",
            B: "Sharpe = 6.67%; Treynor = 0.50",
            C: "Sharpe = 0.75; Treynor = 10.00%",
          },
          correctOption: "A",
          algebraicSolution: `\\text{Sharpe} = \\frac{12\\% - 4\\%}{16\\%} = \\frac{8\\%}{16\\%} = 0.50 \\newline \\text{Treynor} = \\frac{12\\% - 4\\%}{1.20} = \\frac{8\\%}{1.20} = 6.67\\%`,
          calculatorKeystrokes: `(12 [-] 4) [÷] 16 [=] 0.50 -> (12 [-] 4) [÷] 1.20 [=] 6.67`,
          trapCategory: "Sharpe (Total Volatility) vs. Treynor (Beta) Denominator",
          errorModeDefault: "FORMULA_SCALAR",
          distractorAutopsy: {
            A: "Correct. Sharpe = (12 - 4) / 16 = 0.50. Treynor = (12 - 4) / 1.20 = 6.67%.",
            B: "Distractor B swaps the Sharpe and Treynor definitions.",
            C: "Distractor C fails to subtract the risk-free rate from the numerator.",
          },
        },
        {
          id: 5,
          losCode: "LOS 42.c",
          stem: "When constructing an Investment Policy Statement (IPS), if a wealthy individual investor expresses high willingness to take financial risk but has very low ability to bear risk (due to imminent retirement liquidity needs), the advisor should categorize the client's overall risk tolerance as:",
          options: {
            A: "Low, because objective ability to bear risk always constrains subjective willingness.",
            B: "High, because subjective willingness takes legal precedence.",
            C: "Moderate, by averaging willingness and ability.",
          },
          correctOption: "A",
          algebraicSolution: "\\text{IPS Risk Rule: } \\text{When willingness and ability conflict, the lower of the two dominates.}",
          calculatorKeystrokes: "N/A — IPS Risk Tolerance Framework",
          trapCategory: "Willingness vs. Ability to Bear Risk Hierarchy",
          errorModeDefault: "CONCEPTUAL_CONFUSION",
          distractorAutopsy: {
            A: "Correct. The lower of willingness and ability always governs the portfolio risk mandate.",
            B: "Distractor B risks severe financial insolvency by ignoring actual liquidity capacity.",
            C: "Distractor C uses an invalid averaging heuristic.",
          },
        },
      ];
      questions = qBank;
      break;
    }

    case "10": {
      // Track 10: Ethics
      stem = `Elena Rostova, CFA, is a senior portfolio manager at Valmont Asset Management, managing both institutional accounts and pooled funds.${scenarioContext} A prominent client offers Elena an independent corporate directorship paying $50,000 annually plus executive private travel. Separately, Elena discovers an internal memo indicating Valmont will initiate a massive block trade in Nexa Tech tomorrow morning.`;

      const qBank: VignetteQuestion[] = [
        {
          id: 1,
          losCode: "LOS 1.b",
          stem: "Under Standard IV(B) Additional Compensation Arrangements, Elena may accept the client's board position and compensation ONLY IF:",
          options: {
            A: "She obtains advance written consent from both Valmont Asset Management and the client prior to accepting the engagement.",
            B: "She notifies Valmont in writing within 30 days after accepting the board seat, provided all fees are disclosed.",
            C: "She donates all director compensation to an independent charity and recuses herself from voting.",
          },
          correctOption: "A",
          algebraicSolution: "\\text{Standard IV(B) Mandate: } \\text{Requires advance written consent from all relevant employers/parties before acceptance.}",
          calculatorKeystrokes: "N/A — Ethics Analytical Framework",
          trapCategory: "Written Notice vs. Advance Written Consent",
          errorModeDefault: "READING_MISINTERPRETATION",
          distractorAutopsy: {
            A: "Correct. Standard IV(B) explicitly mandates prior written consent from all parties before accepting additional compensation that creates a potential conflict of interest.",
            B: "Distractor B confuses Standard IV(A) post-facto notification with Standard IV(B)'s strict advance written consent requirement.",
            C: "Distractor C is incorrect because donating fees does not waive the obligation to obtain prior written consent.",
          },
        },
        {
          id: 2,
          losCode: "LOS 1.f",
          stem: "Regarding the pending Nexa Tech transaction, which action by Elena is strictly mandated under Standard VI(B) Priority of Transactions?",
          options: {
            A: "She must give client execution absolute priority over Valmont's proprietary account and her own personal transactions.",
            B: "She may place her personal trade concurrently if Valmont executes via an algorithmic dark pool.",
            C: "She can purchase Nexa Tech shares for her personal account as long as her trade size is under 1,000 shares.",
          },
          correctOption: "A",
          algebraicSolution: "\\text{Priority Hierarchy: } \\text{Client Accounts} > \\text{Employer Accounts} > \\text{Personal Accounts.}",
          calculatorKeystrokes: "N/A — Ethics Priority Hierarchy",
          trapCategory: "Personal Trade Execution Priority",
          errorModeDefault: "CONCEPTUAL_CONFUSION",
          distractorAutopsy: {
            A: "Correct. Standard VI(B) requires transactions for clients and employers to have absolute priority over personal transactions.",
            B: "Distractor B incorrectly assumes execution venue or algorithmic methods create exceptions to Priority of Transactions.",
            C: "Distractor C assumes an arbitrary de minimis trade size threshold exists, which is strictly prohibited under front-running rules.",
          },
        },
        {
          id: 3,
          losCode: "LOS 1.c",
          stem: "Under Standard I(C) Misrepresentation, which of the following actions constitutes a direct ethical violation?",
          options: {
            A: "Guaranteeing a client a specific rate of return on an investment portfolio that includes risky securities.",
            B: "Providing historical audited return statistics prepared in accordance with GIPS standards.",
            C: "Disclosing the standard error and limitations of a quantitative risk model in the client presentation.",
          },
          correctOption: "A",
          algebraicSolution: "\\text{Standard I(C): } \\text{Members and candidates must not guarantee returns on risky investments or misstate capability.}",
          calculatorKeystrokes: "N/A — Ethics Standard I(C)",
          trapCategory: "Guaranteed Performance Misrepresentation",
          errorModeDefault: "CONCEPTUAL_CONFUSION",
          distractorAutopsy: {
            A: "Correct. Standard I(C) strictly prohibits guaranteeing performance or returns on risky assets.",
            B: "Distractor B is standard compliant behavior.",
            C: "Distractor C is exemplary professional disclosure.",
          },
        },
        {
          id: 4,
          losCode: "LOS 1.a",
          stem: "Under Standard I(A) Knowledge of the Law, when applicable local law or regulation conflicts with the CFA Institute Code and Standards, members and candidates must:",
          options: {
            A: "Comply with the more strict law, rule, or regulation.",
            B: "Always comply with the Code and Standards regardless of whether local law is stricter.",
            C: "Follow the local law in all circumstances to avoid domestic regulatory penalties.",
          },
          correctOption: "A",
          algebraicSolution: "\\text{Standard I(A): } \\text{Must maintain knowledge of and comply with the stricter of applicable law or the Code and Standards.}",
          calculatorKeystrokes: "N/A — Ethics Standard I(A)",
          trapCategory: "Knowledge of the Law Strictness Rule",
          errorModeDefault: "CONCEPTUAL_CONFUSION",
          distractorAutopsy: {
            A: "Correct. Standard I(A) mandates adherence to whichever rule is stricter between local law and the CFA Code and Standards.",
            B: "Distractor B fails when local law is stricter than the Code.",
            C: "Distractor C fails when the Code and Standards are stricter than lax local laws.",
          },
        },
        {
          id: 5,
          losCode: "LOS 1.e",
          stem: "Under Standard III(A) Loyalty, Prudence, and Care, soft dollar brokerage commissions generated from client portfolio trades belong to:",
          options: {
            A: "The client, and must be used exclusively to benefit the client (e.g. proprietary research).",
            B: "The investment management firm as compensation for order routing.",
            C: "The individual portfolio manager as discretionary performance compensation.",
          },
          correctOption: "A",
          algebraicSolution: "\\text{Standard III(A): } \\text{Soft dollars are the property of the client and can only be used for research that benefits clients.}",
          calculatorKeystrokes: "N/A — Soft Dollar Commission Rules",
          trapCategory: "Soft Dollar Client Ownership Rule",
          errorModeDefault: "CONCEPTUAL_CONFUSION",
          distractorAutopsy: {
            A: "Correct. Soft dollar credits belong strictly to clients and must directly benefit the investment decision-making process.",
            B: "Distractor B misallocates client assets to the management firm.",
            C: "Distractor C is a severe fiduciary breach.",
          },
        },
      ];
      questions = qBank;
      break;
    }

    default: {
      // Fallback
      stem = `An investment committee evaluates diagnostic models for ${topic.name}.${scenarioContext} Current market conditions require analyzing the primary trap mechanism: ${topic.highYieldTrapArea}.`;
      questions = (baseVignette?.questions || []).slice(0, 5).map((q, idx) => ({
        ...q,
        id: idx + 1,
      }));
    }
  }

  // Slice or adjust questions based on requested count (default 5)
  const finalCount = Math.min(Math.max(2, targetCount), questions.length);
  const slicedQuestions = questions.slice(0, finalCount).map((q, idx) => ({
    ...q,
    id: idx + 1,
  }));

  return {
    id: vignetteId,
    topicId: topic.id,
    topicName: topic.name,
    subReading: topic.subReadings[0]?.title || "Institutional Diagnostics",
    difficulty,
    vignetteStem: stem,
    questions: slicedQuestions,
  };
}

/**
 * Optional Google Gemini API Dynamic Generator
 */
async function generateWithGemini(
  apiKey: string,
  topic: typeof CFA_CURRICULUM[0],
  difficulty: string,
  customPrompt: string,
  questionCount: number
): Promise<VignetteSet | null> {
  try {
    const prompt = `You are a CFA Charterholder and senior CFA Exam item writer.
Create a realistic CFA Level 1 Institutional Case Vignette and exactly ${questionCount} multiple-choice questions for:
Topic ID: ${topic.id}
Topic Name: ${topic.name}
Weight: ${topic.weight}
Difficulty: ${difficulty}
High Yield Trap Focus: ${topic.highYieldTrapArea}
${customPrompt ? `Candidate Custom Focus / Scenario: "${customPrompt}"` : ""}

Generate a JSON object matching this exact schema:
{
  "id": "ai-vignette-${topic.id}-${Date.now()}",
  "topicId": "${topic.id}",
  "topicName": "${topic.name}",
  "subReading": "${topic.subReadings[0]?.title || topic.name}",
  "difficulty": "${difficulty}",
  "vignetteStem": "A rich 3-4 sentence institutional case scenario description...",
  "questions": [
    {
      "id": 1,
      "losCode": "LOS ${topic.id}.a",
      "stem": "Question stem...",
      "options": {
        "A": "Option A text",
        "B": "Option B text",
        "C": "Option C text"
      },
      "correctOption": "A",
      "algebraicSolution": "LaTeX mathematical derivation...",
      "calculatorKeystrokes": "TI BA II Plus keystrokes sequence...",
      "trapCategory": "Name of primary trap",
      "errorModeDefault": "FORMULA_SCALAR",
      "distractorAutopsy": {
        "A": "Why A is correct or incorrect",
        "B": "Why B is a trap",
        "C": "Why C is a trap"
      }
    }
  ]
}
Return ONLY pure JSON. No markdown backticks, no markdown fence.`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!res.ok) return null;
    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return null;

    const parsed = JSON.parse(rawText);
    if (parsed && parsed.questions && Array.isArray(parsed.questions)) {
      return parsed as VignetteSet;
    }
    return null;
  } catch (err) {
    console.warn("Gemini generation failed, falling back to procedural engine:", err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: GenerationRequest = await req.json();
    const {
      topicId = "01",
      difficulty = "High Trap",
      customPrompt = "",
      questionCount = 5,
    } = body;

    const topic = CFA_CURRICULUM.find((t) => t.id === topicId) || CFA_CURRICULUM[0];
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    let vignette: VignetteSet | null = null;

    if (apiKey) {
      vignette = await generateWithGemini(apiKey, topic, difficulty, customPrompt, questionCount);
    }

    if (!vignette) {
      vignette = generateProceduralVignette(topic.id, difficulty, customPrompt, questionCount);
    }

    return NextResponse.json({ vignette, success: true });
  } catch (error) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate dynamic vignette" }, { status: 500 });
  }
}

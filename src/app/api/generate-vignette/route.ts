import { NextRequest, NextResponse } from "next/server";
import { VignetteSet, VignetteQuestion } from "@/types/cfa";
import { CFA_CURRICULUM } from "@/data/curriculum";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      topicId = "01",
      difficulty = "High Trap",
      customPrompt = "",
      errorModeTarget = "",
    } = body;

    const topic = CFA_CURRICULUM.find((t) => t.id === topicId) || CFA_CURRICULUM[0];
    const timestamp = Date.now();
    const vignetteId = `ai-vignette-${topicId}-${timestamp}`;

    let vignette: VignetteSet;

    switch (topicId) {
      case "01": {
        // Track 01: Ethical & Professional Standards
        vignette = {
          id: vignetteId,
          topicId: "01",
          topicName: "Ethical & Professional Standards",
          subReading: "Code of Ethics, Standards of Professional Conduct & GIPS",
          difficulty: difficulty as "Standard" | "High Trap" | "Institutional",
          vignetteStem: `Elena Rostova, CFA, is a senior portfolio manager at Valmont Asset Management. Valmont manages segregated institutional accounts and three pooled mutual funds. A prominent client invites Elena to join their corporate board of directors and offers $50,000 in annual director fees plus private jet travel for investment conferences. Separately, Elena discovers an internal memo showing Valmont plans to initiate a large buy order in Nexa Tech tomorrow morning.${customPrompt ? ` Special context: ${customPrompt}` : ""}`,
          questions: [
            {
              id: 1,
              losCode: "LOS 1.b",
              stem: "Under Standard IV(B) Additional Compensation Arrangements, Elena may accept the client's board position and compensation ONLY IF:",
              options: {
                A: "She obtains written consent from both Valmont Asset Management and the client prior to accepting the engagement.",
                B: "She notifies Valmont in writing within 30 days after accepting the board seat, provided the fees are fully disclosed.",
                C: "She donates all director compensation to an independent charity and recuses herself from voting.",
              },
              correctOption: "A",
              algebraicSolution: "\\text{Standard IV(B) Requirement: } \\text{Advance written consent from all relevant employers/clients before accepting compensation that creates potential conflict.}",
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
                A: "She must prioritize client execution over Valmont's proprietary account and her own personal transactions.",
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
          ],
        };
        break;
      }

      case "02": {
        // Track 02: Quantitative Methods (Parametric TVM & Statistics)
        const rate = (6.0 + (timestamp % 4) * 0.5).toFixed(2);
        const periods = 5 + (timestamp % 5);
        const pmt = 10000 + (timestamp % 5) * 2000;
        const rDec = parseFloat(rate) / 100;
        const pvEnd = pmt * ((1 - Math.pow(1 + rDec, -periods)) / rDec);
        const pvBgn = pvEnd * (1 + rDec);

        vignette = {
          id: vignetteId,
          topicId: "02",
          topicName: "Quantitative Methods",
          subReading: "Time Value of Money & Probability Distributions",
          difficulty: difficulty as "Standard" | "High Trap" | "Institutional",
          vignetteStem: `An institutional wealth advisor is designing a structured annuity contract for an endowment client. The contract guarantees ${periods} annual payments of $${pmt.toLocaleString()} each, with the first payment disbursed immediately today (t = 0). The prevailing annual discount rate is ${rate}%.${customPrompt ? ` Parameter notes: ${customPrompt}` : ""}`,
          questions: [
            {
              id: 1,
              losCode: "LOS 6.c",
              stem: `The present value (PV) of this immediate annuity-due stream today is closest to:`,
              options: {
                A: `$${Math.round(pvBgn).toLocaleString()}`,
                B: `$${Math.round(pvEnd).toLocaleString()}`,
                C: `$${Math.round(pvEnd * (1 - rDec)).toLocaleString()}`,
              },
              correctOption: "A",
              algebraicSolution: `PV_{\\text{Annuity Due}} = PMT \\times \\left[\\frac{1 - (1+r)^{-N}}{r}\\right] \\times (1+r) = \\$${pmt.toLocaleString()} \\times \\left[\\frac{1 - (1+${rDec})^{-${periods}}}{${rDec}}\\right] \\times (1+${rDec}) = \\$${Math.round(pvBgn).toLocaleString()}`,
              calculatorKeystrokes: `[2nd][BGN] -> [2nd][SET] -> [2nd][QUIT] -> N = ${periods} -> I/Y = ${rate} -> PMT = -${pmt} -> FV = 0 -> [CPT][PV] => $${Math.round(pvBgn).toLocaleString()}`,
              trapCategory: "Annuity Timing Convention (BGN vs. END Mode)",
              errorModeDefault: "BA2_MODE",
              distractorAutopsy: {
                A: `Correct. In Annuity Due (first payment at t=0), PV = PV(Ordinary Annuity) * (1 + r) = $${Math.round(pvBgn).toLocaleString()}.`,
                B: `Distractor B leaves the calculator in [END] mode, omitting the (1 + r) front-load factor and returning $${Math.round(pvEnd).toLocaleString()}.`,
                C: `Distractor C incorrectly divides or deducts discount rate rather than multiplying by (1 + r).`,
              },
            },
            {
              id: 2,
              losCode: "LOS 7.e",
              stem: `If a portfolio has an annual stated nominal rate of ${rate}% compounded monthly, its Effective Annual Rate (EAR) is closest to:`,
              options: {
                A: `${(Math.pow(1 + rDec / 12, 12) * 100 - 100).toFixed(2)}%`,
                B: `${rate}%`,
                C: `${(rDec * 12 * 100).toFixed(2)}%`,
              },
              correctOption: "A",
              algebraicSolution: `EAR = \\left(1 + \\frac{r_{\\text{stated}}}{m}\\right)^m - 1 = \\left(1 + \\frac{${rDec}}{12}\\right)^{12} - 1 = ${(Math.pow(1 + rDec / 12, 12) * 100 - 100).toFixed(2)}\\%`,
              calculatorKeystrokes: `[2nd][ICONV] -> NOM = ${rate} [ENTER] -> C/Y = 12 [ENTER] -> [↑] -> [CPT][EFF] => ${(Math.pow(1 + rDec / 12, 12) * 100 - 100).toFixed(2)}%`,
              trapCategory: "Periodic Rate Compounding Omission",
              errorModeDefault: "PERIODICITY_MISMATCH",
              distractorAutopsy: {
                A: `Correct. EAR = (1 + ${rate}%/12)^12 - 1 = ${(Math.pow(1 + rDec / 12, 12) * 100 - 100).toFixed(2)}%.`,
                B: `Distractor B assumes nominal stated annual rate equals effective compound rate.`,
                C: `Distractor C multiplies nominal rate by 12 rather than compounding.`,
              },
            },
          ],
        };
        break;
      }

      case "03": {
        // Track 03: Economics (Cross Rates & Triangular Arbitrage)
        const spotEURUSD = 1.0850;
        const spotGBPUSD = 1.2720;
        const impliedEURGBP = (spotEURUSD / spotGBPUSD).toFixed(4);
        const quotedEURGBP = 0.8650;

        vignette = {
          id: vignetteId,
          topicId: "03",
          topicName: "Economics",
          subReading: "Currency Exchange Rates, Cross-Rates & Arbitrage",
          difficulty: difficulty as "Standard" | "High Trap" | "Institutional",
          vignetteStem: `A foreign exchange algorithmic trading desk observes the following spot quotes in the interbank market:
• EUR/USD = ${spotEURUSD}
• GBP/USD = ${spotGBPUSD}
• Dealer Quote EUR/GBP = ${quotedEURGBP}
The desk has a $10,000,000 credit facility to execute triangular arbitrage.${customPrompt ? ` Strategy notes: ${customPrompt}` : ""}`,
          questions: [
            {
              id: 1,
              losCode: "LOS 13.b",
              stem: "The cross-rate implied by the interbank quotes for EUR/GBP (base currency GBP, price currency EUR) is closest to:",
              options: {
                A: `${impliedEURGBP}`,
                B: `${(spotGBPUSD / spotEURUSD).toFixed(4)}`,
                C: `${(spotEURUSD * spotGBPUSD).toFixed(4)}`,
              },
              correctOption: "A",
              algebraicSolution: `\\frac{\\text{EUR}}{\\text{GBP}} = \\frac{\\text{EUR}}{\\text{USD}} \\times \\frac{\\text{USD}}{\\text{GBP}} = \\frac{\\text{EUR/USD}}{\\text{GBP/USD}} = \\frac{${spotEURUSD}}{${spotGBPUSD}} = ${impliedEURGBP}`,
              calculatorKeystrokes: `${spotEURUSD} [÷] ${spotGBPUSD} [=] ${impliedEURGBP}`,
              trapCategory: "Base Currency Inversion in FX Cross Rates",
              errorModeDefault: "SIGN_INVERSION",
              distractorAutopsy: {
                A: `Correct. Implied EUR/GBP = (EUR/USD) / (GBP/USD) = 1.0850 / 1.2720 = ${impliedEURGBP}.`,
                B: `Distractor B inverts the quotient to calculate GBP/EUR instead of EUR/GBP (${(spotGBPUSD / spotEURUSD).toFixed(4)}).`,
                C: `Distractor C incorrectly multiplies the rates (${(spotEURUSD * spotGBPUSD).toFixed(4)}).`,
              },
            },
            {
              id: 2,
              losCode: "LOS 13.d",
              stem: `Given that the dealer quotes EUR/GBP at ${quotedEURGBP} against the theoretical cross rate of ${impliedEURGBP}, the dealer has:`,
              options: {
                A: `Overvalued the EUR relative to GBP, creating an arbitrage profit by selling EUR to the dealer.`,
                B: `Undervalued the EUR relative to GBP, creating an arbitrage profit by buying EUR from the dealer.`,
                C: `Quoted fair value with zero arbitrage opportunities.`,
              },
              correctOption: "A",
              algebraicSolution: `\\text{Quoted EUR/GBP} (${quotedEURGBP}) > \\text{Implied Cross Rate} (${impliedEURGBP}) \\implies \\text{EUR is overvalued in dealer quote.}`,
              calculatorKeystrokes: "N/A — Valuation Comparison",
              trapCategory: "Misidentifying Overvalued Currency in Triangular Arbitrage",
              errorModeDefault: "CONCEPTUAL_CONFUSION",
              distractorAutopsy: {
                A: `Correct. Dealer is paying ${quotedEURGBP} GBP per EUR vs true value of ${impliedEURGBP}, meaning EUR is overpriced at the dealer.`,
                B: `Distractor B misidentifies which currency is trading at a premium.`,
                C: `Distractor C overlooks the significant discrepancy between market quotes.`,
              },
            },
          ],
        };
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

        vignette = {
          id: vignetteId,
          topicId: "04",
          topicName: "Financial Statement Analysis",
          subReading: "Inventories: LIFO to FIFO Restatements & Reserve Dynamics",
          difficulty: difficulty as "Standard" | "High Trap" | "Institutional",
          vignetteStem: `Zenith Manufacturing reports under US GAAP using LIFO inventory valuation. In a period of steady input price inflation, Zenith reports:
• LIFO COGS: $${cogsLIFO.toLocaleString()}
• Beginning LIFO Reserve: $${begReserve.toLocaleString()}
• Ending LIFO Reserve: $${endReserve.toLocaleString()}
• Corporate Tax Rate: 25%${customPrompt ? ` Mandate focus: ${customPrompt}` : ""}`,
          questions: [
            {
              id: 1,
              losCode: "LOS 18.c",
              stem: "Under FIFO, Zenith's Cost of Goods Sold (COGS) for the year would be closest to:",
              options: {
                A: `$${fifoCOGS.toLocaleString()}`,
                B: `$${(cogsLIFO + deltaReserve).toLocaleString()}`,
                C: `$${(cogsLIFO - endReserve).toLocaleString()}`,
              },
              correctOption: "A",
              algebraicSolution: `\\Delta \\text{LIFO Reserve} = \\$${endReserve.toLocaleString()} - \\$${begReserve.toLocaleString()} = \\$${deltaReserve.toLocaleString()} \\newline \\text{COGS(FIFO)} = \\text{COGS(LIFO)} - \\Delta \\text{LIFO Reserve} = \\$${cogsLIFO.toLocaleString()} - \\$${deltaReserve.toLocaleString()} = \\$${fifoCOGS.toLocaleString()}`,
              calculatorKeystrokes: `${cogsLIFO} [-] (${endReserve} [-] ${begReserve}) [=] ${fifoCOGS}`,
              trapCategory: "LIFO Reserve Change Directional Sign",
              errorModeDefault: "SIGN_INVERSION",
              distractorAutopsy: {
                A: `Correct. In inflation, FIFO assigns older lower costs: COGS(FIFO) = $${cogsLIFO.toLocaleString()} - $${deltaReserve.toLocaleString()} = $${fifoCOGS.toLocaleString()}.`,
                B: `Distractor B incorrectly adds the reserve change instead of subtracting it ($${(cogsLIFO + deltaReserve).toLocaleString()}).`,
                C: `Distractor C deducts the entire ending reserve rather than the single-year change.`,
              },
            },
            {
              id: 2,
              losCode: "LOS 18.e",
              stem: "The cumulative adjustment to Zenith's ending Retained Earnings upon converting from LIFO to FIFO is closest to an increase of:",
              options: {
                A: `$${reAdj.toLocaleString()}`,
                B: `$${(deltaReserve * 0.75).toLocaleString()}`,
                C: `$${endReserve.toLocaleString()}`,
              },
              correctOption: "A",
              algebraicSolution: `\\text{Cumulative Retained Earnings Adjustment} = \\text{Ending LIFO Reserve} \\times (1 - t) = \\$${endReserve.toLocaleString()} \\times (1 - 0.25) = \\$${reAdj.toLocaleString()}`,
              calculatorKeystrokes: `${endReserve} [\\times] 0.75 [=] ${reAdj}`,
              trapCategory: "Cumulative vs. Single-Period Reserve Tax Adjustment",
              errorModeDefault: "FORMULA_SCALAR",
              distractorAutopsy: {
                A: `Correct. Balance sheet cumulative retained earnings adjustment = Ending LIFO Reserve * (1 - t) = $${reAdj.toLocaleString()}.`,
                B: `Distractor B uses single-period ΔReserve ($${deltaReserve.toLocaleString()}) * 0.75, which is single-year net income impact.`,
                C: `Distractor C fails to adjust for the deferred tax liability.`,
              },
            },
          ],
        };
        break;
      }

      case "05": {
        // Track 05: Corporate Issuers (WACC & Flotation Costs)
        const weightD = 0.4;
        const weightE = 0.6;
        const costD = 6.0;
        const costE = 12.0;
        const taxRate = 0.25;
        const wacc = weightD * costD * (1 - taxRate) + weightE * costE;

        vignette = {
          id: vignetteId,
          topicId: "05",
          topicName: "Corporate Issuers",
          subReading: "Cost of Capital & Capital Structure Decisions",
          difficulty: difficulty as "Standard" | "High Trap" | "Institutional",
          vignetteStem: `A corporate treasurer is evaluating an expansion project requiring an initial capital outlay of $15,000,000. The target capital structure is 40% debt and 60% equity. The pre-tax cost of debt is ${costD}%, the cost of equity is ${costE}%, and the marginal tax rate is 25%. Investment bankers charge a 5% flotation cost on newly issued common equity.${customPrompt ? ` Project details: ${customPrompt}` : ""}`,
          questions: [
            {
              id: 1,
              losCode: "LOS 24.a",
              stem: "The company's Weighted Average Cost of Capital (WACC) is closest to:",
              options: {
                A: `${wacc.toFixed(2)}%`,
                B: `${(weightD * costD + weightE * costE).toFixed(2)}%`,
                C: `${(wacc + 0.6 * 5.0).toFixed(2)}%`,
              },
              correctOption: "A",
              algebraicSolution: `WACC = w_d r_d(1-t) + w_e r_e = 0.40 \\times 6.0\\% \\times (1 - 0.25) + 0.60 \\times 12.0\\% = 1.80\\% + 7.20\\% = ${wacc.toFixed(2)}\\%`,
              calculatorKeystrokes: `0.4 [\\times] 6.0 [\\times] 0.75 [+] 0.6 [\\times] 12.0 [=] ${wacc.toFixed(2)}%`,
              trapCategory: "Omission of Debt Tax Shield in WACC",
              errorModeDefault: "FORMULA_SCALAR",
              distractorAutopsy: {
                A: `Correct. WACC = 0.40*6%*(1-0.25) + 0.60*12% = ${wacc.toFixed(2)}%.`,
                B: `Distractor B omits the interest tax deduction on debt, giving ${(weightD * costD + weightE * costE).toFixed(2)}%.`,
                C: `Distractor C incorrectly incorporates flotation costs directly into the continuous WACC discount rate.`,
              },
            },
            {
              id: 2,
              losCode: "LOS 24.f",
              stem: "Under official CFA Institute curriculum standards, how should the 5% equity flotation costs be treated in capital budgeting?",
              options: {
                A: "As an immediate cash outflow added to the initial project investment outlay at t = 0.",
                B: "As an upward adjustment to the ongoing cost of equity (r_e) over the project's lifetime.",
                C: "As an amortized annual expense deducted from operating cash flows.",
              },
              correctOption: "A",
              algebraicSolution: "\\text{Correct Treatment: } \\text{Flotation costs are a lump-sum initial outflow at } t=0, \\text{ not an ongoing adjustment to WACC.}",
              calculatorKeystrokes: "N/A — Capital Budgeting Standard",
              trapCategory: "Flotation Cost Capitalization vs. Discount Rate Inflation",
              errorModeDefault: "CONCEPTUAL_CONFUSION",
              distractorAutopsy: {
                A: "Correct. CFA Institute mandates treating flotation costs as an initial cash outflow at t=0 rather than inflating the ongoing discount rate.",
                B: "Distractor B incorrectly inflates the ongoing WACC, which perpetually penalizes cash flows far into the future.",
                C: "Distractor C violates cash flow timing principles.",
              },
            },
          ],
        };
        break;
      }

      case "06": {
        // Track 06: Fixed Income (Duration & Convexity)
        const modDur = 6.40;
        const conv = 58.0;
        const deltaY = 0.01; // +100 bps
        const priceChange = -modDur * deltaY + 0.5 * conv * Math.pow(deltaY, 2);
        const priceChangePct = (priceChange * 100).toFixed(3);

        vignette = {
          id: vignetteId,
          topicId: "06",
          topicName: "Fixed Income",
          subReading: "Yield & Spread Measures / Duration & Convexity Risk",
          difficulty: difficulty as "Standard" | "High Trap" | "Institutional",
          vignetteStem: `A fixed-income risk officer is stress-testing an institutional sovereign bond portfolio. The portfolio has an effective modified duration of ${modDur} years and an annual convexity of ${conv}. Benchmark yields across the curve are modeled to experience a sudden upward parallel shock of +100 bps (+1.00%).${customPrompt ? ` Portfolio details: ${customPrompt}` : ""}`,
          questions: [
            {
              id: 1,
              losCode: "LOS 30.e",
              stem: `Using both modified duration (${modDur}) and convexity (${conv}), the estimated percentage price change of the portfolio is closest to:`,
              options: {
                A: `${priceChangePct}%`,
                B: `-${(modDur * 1.0).toFixed(3)}%`,
                C: `-${(modDur - conv * 0.0001 * 100).toFixed(3)}%`,
              },
              correctOption: "A",
              algebraicSolution: `\\frac{\\Delta P}{P} \\approx -\\text{ModDur} \\times \\Delta y + \\frac{1}{2} \\times \\text{Conv} \\times (\\Delta y)^2 \\newline = -${modDur} \\times 0.01 + 0.5 \\times ${conv} \\times (0.01)^2 = -0.064 + 0.0029 = ${priceChangePct}\\%`,
              calculatorKeystrokes: `[-] ${modDur} [\\times] 0.01 [+] (0.5 [\\times] ${conv} [\\times] 0.01 [x^2]) [=] ${priceChangePct}%`,
              trapCategory: "Omission of the 1/2 Convexity Scalar Factor",
              errorModeDefault: "FORMULA_SCALAR",
              distractorAutopsy: {
                A: `Correct. Accurately applies %ΔP = -ModDur*(Δy) + 0.5*Convexity*(Δy)^2 = ${priceChangePct}%.`,
                B: `Distractor B uses only linear duration (-${(modDur * 1.0).toFixed(3)}%), omitting the positive convexity cushion.`,
                C: `Distractor C omits the 1/2 factor in the Taylor series expansion.`,
              },
            },
            {
              id: 2,
              losCode: "LOS 28.b",
              stem: "When interest rate volatility increases, the price of a bond with an embedded call option relative to an option-free bond will:",
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
                A: "Correct. Callable bonds exhibit negative convexity at low yields because the issuer's incentive to call caps price appreciation.",
                B: "Distractor B confuses callable bonds with putable bonds (putable bonds exhibit enhanced positive convexity).",
                C: "Distractor C ignores the asymmetric optionality embedded in callable debt.",
              },
            },
          ],
        };
        break;
      }

      case "07": {
        // Track 07: Derivatives (Put-Call Parity)
        const spotS = 100;
        const strikeK = 100;
        const callC = 8.50;
        const rRiskFree = 0.05;
        const timeT = 1.0;
        const pvStrike = strikeK / Math.pow(1 + rRiskFree, timeT);
        const putP = (callC + pvStrike - spotS).toFixed(2);

        vignette = {
          id: vignetteId,
          topicId: "07",
          topicName: "Derivatives",
          subReading: "Arbitrage & Put-Call Parity Foundations",
          difficulty: difficulty as "Standard" | "High Trap" | "Institutional",
          vignetteStem: `A quantitative derivatives trader evaluates 1-year European options on a non-dividend-paying stock trading at $${spotS}. A European call with strike price $${strikeK} trades at $${callC.toFixed(2)}. The 1-year risk-free rate is 5.0% (annual compounding).${customPrompt ? ` Deriv notes: ${customPrompt}` : ""}`,
          questions: [
            {
              id: 1,
              losCode: "LOS 34.d",
              stem: `Under Put-Call Parity, the theoretical price of an otherwise identical 1-year European put option is closest to:`,
              options: {
                A: `$${putP}`,
                B: `$${(parseFloat(putP) + strikeK * 0.05).toFixed(2)}`,
                C: `$${(callC - 5.0).toFixed(2)}`,
              },
              correctOption: "A",
              algebraicSolution: `P_0 = C_0 + \\frac{K}{(1+r)^T} - S_0 = \\$${callC.toFixed(2)} + \\frac{\\$${strikeK}}{(1+0.05)^1} - \\$${spotS} = \\$${callC.toFixed(2)} + \\$${pvStrike.toFixed(2)} - \\$${spotS} = \\$${putP}`,
              calculatorKeystrokes: `${callC} [+] (${strikeK} [÷] 1.05) [-] ${spotS} [=] $${putP}`,
              trapCategory: "Put-Call Parity Discount Factor Omission",
              errorModeDefault: "FORMULA_SCALAR",
              distractorAutopsy: {
                A: `Correct. Put-Call Parity: P = C + PV(K) - S = $${callC} + $${pvStrike.toFixed(2)} - $${spotS} = $${putP}.`,
                B: `Distractor B uses nominal undiscounted strike K ($100) instead of PV(K) ($${pvStrike.toFixed(2)}).`,
                C: `Distractor C assumes simple intrinsic differences without compounding.`,
              },
            },
            {
              id: 2,
              losCode: "LOS 34.a",
              stem: "At initiation (t = 0), the value of a newly executed forward contract to the long party is:",
              options: {
                A: "Zero, because the forward price is set such that the contract has zero initial economic value.",
                B: "Equal to the agreed forward price multiplied by the risk-free rate.",
                C: "Equal to the spot price of the underlying minus present value of storage costs.",
              },
              correctOption: "A",
              algebraicSolution: "\\text{Forward Contract Value at Initiation: } V_0(\\text{Forward}) = 0.",
              calculatorKeystrokes: "N/A — Forward Value at Initiation",
              trapCategory: "Forward Price vs. Forward Value Confusion",
              errorModeDefault: "CONCEPTUAL_CONFUSION",
              distractorAutopsy: {
                A: "Correct. By definition, forward price F_0(T) is calibrated so that initial forward value V_0 = 0.",
                B: "Distractor B confuses forward contract price with forward contract value.",
                C: "Distractor C confuses spot valuation with the net zero contract value.",
              },
            },
          ],
        };
        break;
      }

      case "08": {
        // Track 08: Alternative Investments (Private Equity Waterfalls)
        vignette = {
          id: vignetteId,
          topicId: "08",
          topicName: "Alternative Investments",
          subReading: "Private Equity, Real Estate & Fee Structures",
          difficulty: difficulty as "Standard" | "High Trap" | "Institutional",
          vignetteStem: `An endowment invests $50,000,000 in a private equity fund with a '2 and 20' fee structure (2% management fee, 20% carried interest incentive fee). The fund terms specify an 8% preferred return (hurdle rate) with an American (deal-by-deal) waterfall versus European (whole-fund) waterfall, subject to a clawback provision.${customPrompt ? ` Mandate terms: ${customPrompt}` : ""}`,
          questions: [
            {
              id: 1,
              losCode: "LOS 38.c",
              stem: "Under an American (deal-by-deal) waterfall compared to a European (whole-fund) waterfall, carried interest distributions to the GP are:",
              options: {
                A: "Paid out earlier as individual profitable investments are exited, increasing the risk of clawback.",
                B: "Deferred until LPs receive their entire original committed capital plus preferred return across all deals.",
                C: "Capped at 2% of annual committed capital regardless of deal profitability.",
              },
              correctOption: "A",
              algebraicSolution: "\\text{American Waterfall: } \\text{Carried interest paid on individual deal profits, creating clawback liability if later deals lose money.}",
              calculatorKeystrokes: "N/A — Alternative Fee Waterfall",
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
              losCode: "LOS 39.a",
              stem: "In direct real estate valuation, the Capitalization Rate (Cap Rate) is defined as:",
              options: {
                A: "Net Operating Income (NOI) divided by Property Value.",
                B: "Gross Rental Income minus Debt Service divided by Equity Invested.",
                C: "Net Income after Taxes and Depreciation divided by Property Value.",
              },
              correctOption: "A",
              algebraicSolution: "\\text{Cap Rate} = \\frac{\\text{Net Operating Income (NOI)}}{\\text{Property Value (Sales Price)}}",
              calculatorKeystrokes: "N/A — Real Estate Cap Rate Formula",
              trapCategory: "NOI vs. Cash Flow After Debt Service in Cap Rate",
              errorModeDefault: "FORMULA_SCALAR",
              distractorAutopsy: {
                A: "Correct. Cap Rate = NOI / Value. NOI excludes financing costs (interest/debt service) and income taxes.",
                B: "Distractor B describes equity cash-on-cash return, which improperly subtracts debt service.",
                C: "Distractor C incorrectly subtracts non-cash depreciation and income taxes.",
              },
            },
          ],
        };
        break;
      }

      case "09": {
        // Track 09: Equity Investments (Gordon Growth Model)
        const d0 = 2.40;
        const g = 0.05; // 5%
        const rReq = 0.09; // 9%
        const d1 = d0 * (1 + g);
        const p0 = d1 / (rReq - g);

        vignette = {
          id: vignetteId,
          topicId: "09",
          topicName: "Equity Investments",
          subReading: "Equity Valuation: Discounted Dividend Valuation",
          difficulty: difficulty as "Standard" | "High Trap" | "Institutional",
          vignetteStem: `An equity research analyst is valuing shares of Alpha Utilities using the Gordon Growth constant dividend discount model. Alpha just paid an annual dividend of $${d0.toFixed(2)} per share ($D_0$). Dividends are expected to grow indefinitely at a constant sustainable growth rate of ${g * 100}%. The required rate of return on equity is ${rReq * 100}%.${customPrompt ? ` Equity notes: ${customPrompt}` : ""}`,
          questions: [
            {
              id: 1,
              losCode: "LOS 36.b",
              stem: `The intrinsic value per share of Alpha Utilities is closest to:`,
              options: {
                A: `$${p0.toFixed(2)}`,
                B: `$${(d0 / (rReq - g)).toFixed(2)}`,
                C: `$${(d1 / rReq).toFixed(2)}`,
              },
              correctOption: "A",
              algebraicSolution: `P_0 = \\frac{D_1}{r - g} = \\frac{D_0 \\times (1+g)}{r - g} = \\frac{\\$${d0.toFixed(2)} \\times (1 + ${g})}{${rReq} - ${g}} = \\frac{\\$${d1.toFixed(3)}}{${(rReq - g).toFixed(2)}} = \\$${p0.toFixed(2)}`,
              calculatorKeystrokes: `${d0} [\\times] ${(1 + g)} [÷] (${rReq} [-] ${g}) [=] $${p0.toFixed(2)}`,
              trapCategory: "D0 vs. D1 Dividend Timing in Gordon Growth",
              errorModeDefault: "SIGN_INVERSION",
              distractorAutopsy: {
                A: `Correct. Using next period's expected dividend D_1 = $${d0} * 1.05 = $${d1.toFixed(3)}, P_0 = $${d1.toFixed(3)} / (0.09 - 0.05) = $${p0.toFixed(2)}.`,
                B: `Distractor B mistakenly uses the historical dividend D_0 ($${d0.toFixed(2)}) in the numerator, producing $${(d0 / (rReq - g)).toFixed(2)}.`,
                C: `Distractor C omits growth in the denominator, treating the stock as a zero-growth perpetuity.`,
              },
            },
            {
              id: 2,
              losCode: "LOS 36.f",
              stem: "If Alpha's Return on Equity (ROE) is 12% and its dividend payout ratio is 60%, its sustainable growth rate (g) is closest to:",
              options: {
                A: "4.80%",
                B: "7.20%",
                C: "12.00%",
              },
              correctOption: "A",
              algebraicSolution: `g = b \\times \\text{ROE} = (1 - \\text{Payout Ratio}) \\times \\text{ROE} = (1 - 0.60) \\times 12\\% = 0.40 \\times 12\\% = 4.80\\%`,
              calculatorKeystrokes: `(1 [-] 0.60) [\\times] 12 [=] 4.80%`,
              trapCategory: "Retention Rate (b) vs. Payout Rate in Sustainable Growth",
              errorModeDefault: "FORMULA_SCALAR",
              distractorAutopsy: {
                A: "Correct. Sustainable growth g = (1 - Payout) * ROE = 0.40 * 12% = 4.80%.",
                B: "Distractor B mistakenly multiplies ROE by the Payout Ratio (0.60 * 12% = 7.20%).",
                C: "Distractor C assumes 100% earnings retention.",
              },
            },
          ],
        };
        break;
      }

      case "10": {
        // Track 10: Portfolio Management (CAPM & Sharpe/Treynor)
        const rf = 4.0;
        const rm = 10.0;
        const beta = 1.25;
        const er = rf + beta * (rm - rf);

        vignette = {
          id: vignetteId,
          topicId: "10",
          topicName: "Portfolio Management",
          subReading: "Portfolio Risk & Return: CAPM, SML & Risk-Adjusted Ratios",
          difficulty: difficulty as "Standard" | "High Trap" | "Institutional",
          vignetteStem: `A pension consultant is analyzing performance metrics for an active equity portfolio. The risk-free rate is ${rf.toFixed(2)}%, the expected return on the market portfolio is ${rm.toFixed(2)}%, and the active portfolio has a beta of ${beta.toFixed(2)} with an annualized standard deviation of 18.0%. Over the past year, the portfolio delivered an actual return of 13.0%.${customPrompt ? ` Mandate notes: ${customPrompt}` : ""}`,
          questions: [
            {
              id: 1,
              losCode: "LOS 42.c",
              stem: `According to the Capital Asset Pricing Model (CAPM), the portfolio's expected return is closest to:`,
              options: {
                A: `${er.toFixed(2)}%`,
                B: `${(beta * rm).toFixed(2)}%`,
                C: `${(rf + beta * rm).toFixed(2)}%`,
              },
              correctOption: "A",
              algebraicSolution: `E(R_i) = R_f + \\beta_i [E(R_m) - R_f] = ${rf}\\% + ${beta} \\times [${rm}\\% - ${rf}\\%] = ${rf}\\% + ${beta} \\times 6.0\\% = ${er.toFixed(2)}\\%`,
              calculatorKeystrokes: `${rf} [+] (${beta} [\\times] (${rm} [-] ${rf})) [=] ${er.toFixed(2)}%`,
              trapCategory: "Market Risk Premium [E(Rm) - Rf] vs. Market Return [E(Rm)]",
              errorModeDefault: "FORMULA_SCALAR",
              distractorAutopsy: {
                A: `Correct. CAPM E(R) = ${rf}% + ${beta}*(${rm}% - ${rf}%) = ${er.toFixed(2)}%.`,
                B: `Distractor B uses beta * market return (${beta} * ${rm}% = ${(beta * rm).toFixed(2)}%), ignoring the risk-free rate.`,
                C: `Distractor C fails to subtract R_f from R_m in the equity risk premium.`,
              },
            },
            {
              id: 2,
              losCode: "LOS 42.f",
              stem: `The portfolio's Jensen's Alpha (α) relative to its CAPM benchmark is closest to:`,
              options: {
                A: `+${(13.0 - er).toFixed(2)}%`,
                B: `-${(13.0 - er).toFixed(2)}%`,
                C: `+${(13.0 - rm).toFixed(2)}%`,
              },
              correctOption: "A",
              algebraicSolution: `\\alpha_p = R_p - E(R_p) = 13.00\\% - ${er.toFixed(2)}\\% = +${(13.0 - er).toFixed(2)}\\%`,
              calculatorKeystrokes: `13.0 [-] ${er.toFixed(2)} [=] +${(13.0 - er).toFixed(2)}%`,
              trapCategory: "Sign Direction in Jensen's Alpha Outperformance",
              errorModeDefault: "SIGN_INVERSION",
              distractorAutopsy: {
                A: `Correct. Jensen's Alpha = Actual Return (13%) - CAPM Expected Return (${er.toFixed(2)}%) = +${(13.0 - er).toFixed(2)}%.`,
                B: `Distractor B inverts the sign (-${(13.0 - er).toFixed(2)}%).`,
                C: `Distractor C compares actual return to the unadjusted market return (${rm}%).`,
              },
            },
          ],
        };
        break;
      }

      default: {
        // Safe fallback
        vignette = {
          id: vignetteId,
          topicId: topic.id,
          topicName: topic.name,
          subReading: topic.subReadings[0]?.title || "Core Financial Mechanics",
          difficulty: difficulty as "Standard" | "High Trap" | "Institutional",
          vignetteStem: `An investment committee evaluates diagnostic models for ${topic.name}. Current conditions require analyzing the primary trap mechanism: ${topic.highYieldTrapArea}.${customPrompt ? ` Focus: ${customPrompt}` : ""}`,
          questions: [
            {
              id: 1,
              losCode: topic.subReadings[0]?.losCode || `LOS ${topic.id}.a`,
              stem: `Regarding the high-yield trap in ${topic.name}, which statement is most accurate?`,
              options: {
                A: topic.executiveSummary[0] || "Financial standards mandate applying economic substance over form.",
                B: "Materiality thresholds below 5% exempt practitioners from consistency rules.",
                C: "Retroactive classification shifts are permitted without footnote disclosure.",
              },
              correctOption: "A",
              algebraicSolution: `\\text{Institutional Rule: } ${topic.executiveSummary[0] || "Maintain standard compliance."}`,
              calculatorKeystrokes: topic.formulas[0]?.calculatorKeystrokes || "N/A — Qualitative Framework",
              trapCategory: "Conceptual Misalignment",
              errorModeDefault: "CONCEPTUAL_CONFUSION",
              distractorAutopsy: {
                A: "Correct. Directly targets the high-probability curriculum standard.",
                B: "Incorrect. Strict compliance forbids arbitrary materiality exemptions.",
                C: "Incorrect. Violates financial reporting integrity principles.",
              },
            },
            {
              id: 2,
              losCode: topic.subReadings[1]?.losCode || `LOS ${topic.id}.b`,
              stem: `The most critical diagnostic safeguard for ${topic.name} is:`,
              options: {
                A: topic.executiveSummary[1] || "Verify that all timing conventions and cash flow parameters align.",
                B: "Treating non-operating adjustments as immediate equity dividends.",
                C: "Reversing historical amortization schedules without balance sheet restatement.",
              },
              correctOption: "A",
              algebraicSolution: `\\text{Diagnostic Principle: } ${topic.executiveSummary[1] || "Ensure formula scalar fidelity."}`,
              calculatorKeystrokes: topic.formulas[1]?.calculatorKeystrokes || "N/A — Qualitative Principle",
              trapCategory: "Mathematical Omission",
              errorModeDefault: "FORMULA_SCALAR",
              distractorAutopsy: {
                A: "Correct. Accurately addresses the core trap mechanism.",
                B: "Incorrect. Violates accounting matching principles.",
                C: "Incorrect. Distorts balance sheet integrity.",
              },
            },
          ],
        };
      }
    }

    return NextResponse.json({ vignette, success: true });
  } catch (error) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate dynamic vignette" }, { status: 500 });
  }
}

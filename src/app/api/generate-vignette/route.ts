import { NextRequest, NextResponse } from "next/server";
import { VignetteSet } from "@/types/cfa";
import { CFA_CURRICULUM } from "@/data/curriculum";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topicId = "06", difficulty = "High Trap", customPrompt = "" } = body;

    const topic = CFA_CURRICULUM.find((t) => t.id === topicId) || CFA_CURRICULUM[0];

    const timestamp = Date.now();
    const vignetteId = `custom-vignette-${topicId}-${timestamp}`;

    let generatedVignette: VignetteSet;

    if (topicId === "06") {
      // Track 06: Fixed Income parametric scenario
      const coupon = (5.0 + (timestamp % 4) * 0.5).toFixed(2);
      const maturity = 4 + (timestamp % 4);
      const price = (960 + (timestamp % 35)).toFixed(2);
      const ytm = (6.2 + (timestamp % 5) * 0.18).toFixed(2);
      const modDur = (maturity * 0.82).toFixed(2);
      const conv = (maturity * 6.5).toFixed(2);

      generatedVignette = {
        id: vignetteId,
        topicId: "06",
        topicName: "Fixed Income",
        subReading: "Yield & Spread Measures / Duration & Convexity Risk",
        difficulty: difficulty as "Standard" | "High Trap" | "Institutional",
        vignetteStem: `A quantitative fixed-income desk is pricing an institutional portfolio holding a ${maturity}-year annual-pay senior corporate bond. The bond has a par value of $1,000, carries a ${coupon}% annual coupon, and currently trades at $${price}. Benchmark yield curves shift upward by 100 bps (+1.00%), and the bond has an estimated annual modified duration of ${modDur} years with convexity of ${conv}.${customPrompt ? ` Special mandate note: ${customPrompt}` : ""}`,
        questions: [
          {
            id: 1,
            losCode: "LOS 28.c",
            stem: `The yield-to-maturity (YTM) of the ${maturity}-year corporate bond is closest to:`,
            options: {
              A: `${coupon}%`,
              B: `${ytm}%`,
              C: `${(parseFloat(ytm) + 0.75).toFixed(2)}%`,
            },
            correctOption: "B",
            algebraicSolution: `\\text{Bond Price: } PV = \\sum_{t=1}^{${maturity}} \\frac{${(parseFloat(coupon) * 10).toFixed(0)}}{(1+r)^t} + \\frac{1000}{(1+r)^{${maturity}}} = \\$${price} \\implies YTM = ${ytm}\\%`,
            calculatorKeystrokes: `[2nd][CLR TVM] -> N = ${maturity} -> PV = -${price} -> PMT = ${(parseFloat(coupon) * 10).toFixed(0)} -> FV = 1000 -> [CPT][I/Y] => ${ytm}%`,
            trapCategory: "Bond Semiannual Yield Convention",
            errorModeDefault: "PERIODICITY_MISMATCH",
            distractorAutopsy: {
              A: `Assumes the bond trades at par where YTM = coupon rate (${coupon}%). Because price $${price} < $1,000, YTM must exceed coupon.`,
              B: `Correct. Using TVM registers N=${maturity}, PV=-${price}, PMT=${(parseFloat(coupon) * 10).toFixed(0)}, FV=1000 yields YTM = ${ytm}%.`,
              C: `Calculated by misadjusting intra-year compounding frequencies.`,
            },
          },
          {
            id: 2,
            losCode: "LOS 30.e",
            stem: `Using both modified duration (${modDur}) and convexity (${conv}), the estimated percentage price change after a +100 bps (+1.00%) yield increase is closest to:`,
            options: {
              A: `-${(parseFloat(modDur) - 0.5 * parseFloat(conv) * 0.0001 * 100).toFixed(3)}%`,
              B: `-${parseFloat(modDur).toFixed(3)}%`,
              C: `-${(parseFloat(modDur) - parseFloat(conv) * 0.0001 * 100).toFixed(3)}%`,
            },
            correctOption: "A",
            algebraicSolution: `\\frac{\\Delta P}{P} \\approx -\\text{ModDur} \\times \\Delta y + \\frac{1}{2} \\times \\text{Conv} \\times (\\Delta y)^2 \\newline = -${modDur} \\times 0.01 + 0.5 \\times ${conv} \\times (0.01)^2 = -${(parseFloat(modDur) - 0.5 * parseFloat(conv) * 0.0001 * 100).toFixed(3)}\\%`,
            calculatorKeystrokes: `[-] ${modDur} [\\times] 0.01 [+] (0.5 [\\times] ${conv} [\\times] 0.01 [x^2]) [=]`,
            trapCategory: "Omission of the 1/2 Convexity Scalar Factor",
            errorModeDefault: "FORMULA_SCALAR",
            distractorAutopsy: {
              A: `Correct. Accurately applies %ΔP = -ModDur*(Δy) + 0.5*Convexity*(Δy)^2.`,
              B: `Distractor B uses only linear duration (-${parseFloat(modDur).toFixed(3)}%), omitting the positive convexity cushion.`,
              C: `Distractor C omits the 1/2 multiplier in the second-order Taylor series convexity adjustment.`,
            },
          },
        ],
      };
    } else if (topicId === "04") {
      // Track 04: Financial Statement Analysis parametric scenario
      const cogsLIFO = (3500000 + (timestamp % 20) * 50000).toLocaleString();
      const begReserve = (280000 + (timestamp % 10) * 15000).toLocaleString();
      const endReserve = (460000 + (timestamp % 10) * 20000).toLocaleString();
      const deltaReserve = (parseInt(endReserve.replace(/,/g, "")) - parseInt(begReserve.replace(/,/g, ""))).toLocaleString();
      const fifoCOGS = (parseInt(cogsLIFO.replace(/,/g, "")) - parseInt(deltaReserve.replace(/,/g, ""))).toLocaleString();
      const reAdj = (parseInt(endReserve.replace(/,/g, "")) * 0.75).toLocaleString();

      generatedVignette = {
        id: vignetteId,
        topicId: "04",
        topicName: "Financial Statement Analysis",
        subReading: "Inventories: LIFO, FIFO, and Reserve Adjustments",
        difficulty: difficulty as "Standard" | "High Trap" | "Institutional",
        vignetteStem: `A financial analyst is evaluating Apex Heavy Industries, which reports under US GAAP using LIFO inventory valuation in an inflationary environment. For the current fiscal year, Apex reports LIFO COGS of $${cogsLIFO}, Beginning LIFO Reserve of $${begReserve}, and Ending LIFO Reserve of $${endReserve}. The marginal corporate tax rate is 25%.${customPrompt ? ` Note: ${customPrompt}` : ""}`,
        questions: [
          {
            id: 1,
            losCode: "LOS 18.c",
            stem: `If Apex had reported under FIFO, its Cost of Goods Sold (COGS) for the fiscal year would be closest to:`,
            options: {
              A: `$${fifoCOGS}`,
              B: `$${(parseInt(cogsLIFO.replace(/,/g, "")) + parseInt(deltaReserve.replace(/,/g, ""))).toLocaleString()}`,
              C: `$${(parseInt(cogsLIFO.replace(/,/g, "")) - parseInt(endReserve.replace(/,/g, ""))).toLocaleString()}`,
            },
            correctOption: "A",
            algebraicSolution: `\\Delta \\text{LIFO Reserve} = \\$${endReserve} - \\$${begReserve} = \\$${deltaReserve}. \\newline \\text{COGS(FIFO)} = \\text{COGS(LIFO)} - \\Delta \\text{LIFO Reserve} = \\$${cogsLIFO} - \\$${deltaReserve} = \\$${fifoCOGS}.`,
            calculatorKeystrokes: `${cogsLIFO.replace(/,/g, "")} [-] (${endReserve.replace(/,/g, "")} [-] ${begReserve.replace(/,/g, "")}) [=] ${fifoCOGS}`,
            trapCategory: "LIFO Reserve Change Directional Sign",
            errorModeDefault: "SIGN_INVERSION",
            distractorAutopsy: {
              A: `Correct. In rising prices, FIFO assigns earlier lower costs: COGS = $${cogsLIFO} - $${deltaReserve} = $${fifoCOGS}.`,
              B: `Distractor B adds the delta reserve instead of subtracting it ($${cogsLIFO} + $${deltaReserve}).`,
              C: `Distractor C subtracts the entire ending reserve rather than the single-period change.`,
            },
          },
          {
            id: 2,
            losCode: "LOS 18.e",
            stem: `The cumulative adjustment to Apex's ending Retained Earnings upon converting from LIFO to FIFO at year-end is closest to an increase of:`,
            options: {
              A: `$${reAdj}`,
              B: `$${(parseInt(deltaReserve.replace(/,/g, "")) * 0.75).toLocaleString()}`,
              C: `$${endReserve}`,
            },
            correctOption: "A",
            algebraicSolution: `\\text{Cumulative Retained Earnings Adjustment} = \\text{Ending LIFO Reserve} \\times (1 - t) = \\$${endReserve} \\times (1 - 0.25) = \\$${reAdj}.`,
            calculatorKeystrokes: `${endReserve.replace(/,/g, "")} [\\times] 0.75 [=] ${reAdj}`,
            trapCategory: "Cumulative vs. Single-Period Reserve Tax Adjustment",
            errorModeDefault: "FORMULA_SCALAR",
            distractorAutopsy: {
              A: `Correct. Cumulative retained earnings adjustment = Ending LIFO Reserve * (1 - t) = $${endReserve} * 0.75 = $${reAdj}.`,
              B: `Distractor B uses single-period ΔReserve ($${deltaReserve}) * 0.75, which is single-period net income change, not balance sheet cumulative retained earnings.`,
              C: `Distractor C uses the gross ending reserve without deducting cumulative deferred taxes.`,
            },
          },
        ],
      };
    } else {
      // General dynamic generator for remaining curriculum tracks
      const baseSubReading = topic.subReadings[0]?.title || "Core Financial Mechanics";
      generatedVignette = {
        id: vignetteId,
        topicId: topic.id,
        topicName: topic.name,
        subReading: baseSubReading,
        difficulty: difficulty as "Standard" | "High Trap" | "Institutional",
        vignetteStem: `An investment committee at an institutional asset management firm is reviewing analytical frameworks and risk models for Track ${topic.id} (${topic.name}). Current economic indicators point to heightened market volatility and shifting regulatory standards. The committee must evaluate high-yield trap conditions regarding: ${topic.highYieldTrapArea}.${customPrompt ? ` Mandate focus: ${customPrompt}` : ""}`,
        questions: [
          {
            id: 1,
            losCode: topic.subReadings[0]?.losCode || `LOS ${topic.id}.a`,
            stem: `Under official CFA Institute standards for ${topic.name}, which statement regarding ${topic.highYieldTrapArea.split(",")[0]} is most accurate?`,
            options: {
              A: `${topic.executiveSummary[0] || "Financial reporting and valuation standards mandate consistent application of economic substance over legal form."}`,
              B: `The practitioner may ignore cross-period adjustments if financial materiality is below 5%.`,
              C: `The standard permits retroactive classification shifts without explicit footnote disclosure.`,
            },
            correctOption: "A",
            algebraicSolution: `\\text{Institutional Rule: } ${topic.executiveSummary[0] || "Apply canonical CFA curriculum standards without omitting timing adjustments."}`,
            calculatorKeystrokes: topic.formulas[0]?.calculatorKeystrokes || "N/A — Qualitative Analytical Framework",
            trapCategory: "Conceptual Misalignment",
            errorModeDefault: "CONCEPTUAL_CONFUSION",
            distractorAutopsy: {
              A: "Correct. Accurately reflects high-yield curriculum standard rules and avoids the primary trap area.",
              B: "Incorrect. CFA Institute standards strictly forbid arbitrary materiality thresholds for intentional classification distortions.",
              C: "Incorrect. Retroactive reclassifications without transparent reconciliation violate reporting integrity.",
            },
          },
          {
            id: 2,
            losCode: topic.subReadings[1]?.losCode || `LOS ${topic.id}.b`,
            stem: `Regarding the high-yield trap area in ${topic.name}, the most critical diagnostic adjustment required is:`,
            options: {
              A: `${topic.executiveSummary[1] || "Verify that all compounding periodicities, discount factors, and cash flow timing conventions are properly aligned."}`,
              B: "Treating all non-operating adjustments as immediate direct equity dividends.",
              C: "Reversing historical amortization schedules without balance sheet restatement.",
            },
            correctOption: "A",
            algebraicSolution: `\\text{Trap Avoidance Principle: } ${topic.executiveSummary[1] || "Ensure complete formula scalar fidelity and timing synchronization."}`,
            calculatorKeystrokes: topic.formulas[1]?.calculatorKeystrokes || "N/A — Qualitative Diagnostic Principle",
            trapCategory: "Mathematical Omission",
            errorModeDefault: "FORMULA_SCALAR",
            distractorAutopsy: {
              A: "Correct. Directly targets the high-probability candidate trap identified in official Level 1 diagnostic curricula.",
              B: "Incorrect. Misclassifies balance sheet asset modifications as cash dividend distributions.",
              C: "Incorrect. Violates matching and double-entry accounting integrity principles.",
            },
          },
        ],
      };
    }

    return NextResponse.json({ vignette: generatedVignette, success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate dynamic vignette" }, { status: 500 });
  }
}

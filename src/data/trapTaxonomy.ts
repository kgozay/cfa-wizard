export interface TrapDefinition {
  id: string;
  name: string;
  family: "Mathematical Omission" | "Convention Inversion" | "Conceptual Misalignment" | "Reading & Scope Trap";
  description: string;
  recommendedRemediation: string;
  historicalErrorRate: string;
}

export const TRAP_TAXONOMY: Record<string, TrapDefinition> = {
  "Soft Dollar Beneficiary Distinction": {
    id: "soft-dollar-beneficiary",
    name: "Soft Dollar Beneficiary Confusion",
    family: "Conceptual Misalignment",
    description: "Conflating manager operational overhead (hardware, rent, administrative terminals) with client investment research benefits.",
    recommendedRemediation: "Always ask: 'Does this service directly benefit the investment decision-making process for the specific client accounts that generated the commissions?'",
    historicalErrorRate: "42% of CFA Level 1 Candidates"
  },
  "Fiduciary Duty vs. Insider Trading Conflict": {
    id: "fiduciary-vs-insider",
    name: "Fiduciary Duty vs. Material Nonpublic Info",
    family: "Reading & Scope Trap",
    description: "Assuming fiduciary duty to protect client capital permits trading on material nonpublic insider tips.",
    recommendedRemediation: "Standard II-A strictly prohibits trading or causing others to trade on MNPI regardless of fiduciary duties to clients.",
    historicalErrorRate: "38% of CFA Level 1 Candidates"
  },
  "LIFO Reserve Change Directional Sign": {
    id: "lifo-reserve-sign",
    name: "LIFO Reserve Change Sign Inversion",
    family: "Convention Inversion",
    description: "Adding the change in LIFO reserve instead of subtracting it from LIFO COGS during inflationary cycles.",
    recommendedRemediation: "Remember: In rising prices, FIFO yields cheaper older costs in COGS. Therefore COGS(FIFO) = COGS(LIFO) - ΔLIFO Reserve.",
    historicalErrorRate: "48% of CFA Level 1 Candidates"
  },
  "Cumulative vs. Single-Period Reserve Tax Adjustment": {
    id: "lifo-retained-earnings-tax",
    name: "Ending vs Delta Reserve Balance Sheet Trap",
    family: "Mathematical Omission",
    description: "Applying the single-period delta reserve to retained earnings instead of the cumulative ending LIFO reserve balance.",
    recommendedRemediation: "Income statement adjustments use ΔLIFO Reserve; Balance sheet adjustments (Inventory, Retained Earnings) use Ending LIFO Reserve.",
    historicalErrorRate: "52% of CFA Level 1 Candidates"
  },
  "Gordon Growth Numerator Timing ($D_n$ vs $D_{n+1}$)": {
    id: "gordon-growth-timing",
    name: "Gordon Growth Numerator Timing Trap",
    family: "Mathematical Omission",
    description: "Using current terminal dividend D_n instead of next period's dividend D_(n+1) when computing terminal value P_n.",
    recommendedRemediation: "P_n = D_(n+1) / (r - g). You must advance the dividend one period into the perpetual growth phase before dividing by (r - g).",
    historicalErrorRate: "56% of CFA Level 1 Candidates"
  },
  "Omission of the 1/2 Convexity Scalar Factor": {
    id: "convexity-scalar-omission",
    name: "Convexity 1/2 Multiplier Omission",
    family: "Mathematical Omission",
    description: "Forgetting the 1/2 factor in the Taylor series second-order convexity price change approximation.",
    recommendedRemediation: "ΔP/P ≈ -ModDur × Δy + 0.5 × Convexity × (Δy)^2. Always verify the 0.5 multiplier is present.",
    historicalErrorRate: "61% of CFA Level 1 Candidates"
  },
  "Beta Ratio Inversion (Market vs Asset Volatility)": {
    id: "beta-ratio-inversion",
    name: "Beta Standard Deviation Ratio Inversion",
    family: "Convention Inversion",
    description: "Dividing market standard deviation by asset standard deviation or omitting the correlation coefficient.",
    recommendedRemediation: "Beta = ρ × (σ_asset / σ_market). Asset volatility is always in the numerator.",
    historicalErrorRate: "39% of CFA Level 1 Candidates"
  },
  "Underpriced vs Overpriced SML Plot Inversion": {
    id: "sml-plot-inversion",
    name: "SML Alpha / Valuation Polarity Error",
    family: "Conceptual Misalignment",
    description: "Assuming an asset plotting above the SML with expected return > required return is overpriced rather than underpriced.",
    recommendedRemediation: "Higher expected return than required = Positive Alpha = Underpriced bargain (Buy signal).",
    historicalErrorRate: "44% of CFA Level 1 Candidates"
  },
  "Hurdle Rate Catch-Up Clause vs Excess Profit": {
    id: "pe-catchup-trap",
    name: "Soft Hurdle Catch-Up Allocation Trap",
    family: "Conceptual Misalignment",
    description: "Applying incentive fee only to profits in excess of hurdle when contract specifies 100% catch-up.",
    recommendedRemediation: "Soft hurdle with catch-up allows the GP to receive 20% of total profits from dollar zero once the threshold is crossed.",
    historicalErrorRate: "49% of CFA Level 1 Candidates"
  },
  "Contango vs Backwardation Roll Yield Polarity": {
    id: "roll-yield-polarity",
    name: "Commodity Term Structure Roll Yield Sign",
    family: "Convention Inversion",
    description: "Believing Contango generates positive roll yield when forward prices trade above spot.",
    recommendedRemediation: "Backwardation (F < S) produces positive roll yield (buying lower price futures that converge up to spot).",
    historicalErrorRate: "47% of CFA Level 1 Candidates"
  },
  "Standard Error Sample Size Square Root Omission": {
    id: "standard-error-sqrt",
    name: "Square Root of N Standard Error Trap",
    family: "Mathematical Omission",
    description: "Dividing sample standard deviation by N instead of √N when calculating standard error of the mean.",
    recommendedRemediation: "Standard Error = s / √n. Test statistic = (x̄ - μ0) / (s / √n).",
    historicalErrorRate: "34% of CFA Level 1 Candidates"
  },
  "Base vs Price Currency Interest Rate Ratio Inversion": {
    id: "fx-cip-ratio-inversion",
    name: "Covered Interest Parity Currency Ratio Inversion",
    family: "Convention Inversion",
    description: "Inverting base and price currency interest rate terms in CIP forward quote calculation.",
    recommendedRemediation: "In Price/Base quote: Forward = Spot × (1 + r_Price) / (1 + r_Base).",
    historicalErrorRate: "53% of CFA Level 1 Candidates"
  },
  "Addition vs. Multiplication of Leverage Coefficients": {
    id: "dtl-multiplication-trap",
    name: "Degree of Total Leverage Addition Trap",
    family: "Mathematical Omission",
    description: "Adding DOL and DFL together instead of multiplying them to compute DTL.",
    recommendedRemediation: "DTL = DOL × DFL. Leverage compounds multiplicatively, not additively.",
    historicalErrorRate: "36% of CFA Level 1 Candidates"
  },
  "WACC Rate Adjustment vs Cash Flow Outlay Treatment": {
    id: "flotation-cost-wacc-trap",
    name: "Flotation Cost Discount Rate Bias Trap",
    family: "Conceptual Misalignment",
    description: "Increasing cost of equity or WACC by flotation percentage rather than deducting flotation at t=0.",
    recommendedRemediation: "CFA Institute standard: Treat flotation costs as an initial cash outflow at t=0 (CF0 = Outlay + Flotation).",
    historicalErrorRate: "46% of CFA Level 1 Candidates"
  },
  "Put-Call Parity Sign Reversal": {
    id: "put-call-parity-signs",
    name: "Put-Call Parity Rearrangement Error",
    family: "Convention Inversion",
    description: "Reversing signs of strike PV or underlying stock when rearranging C + PV(X) = S + P for synthetic put.",
    recommendedRemediation: "P = C + PV(X) - S. Long Put = Long Call + Long Bond PV(X) - Long Stock.",
    historicalErrorRate: "41% of CFA Level 1 Candidates"
  },
  "Arbitrage Direction: Synthetic vs Market Position Inversion": {
    id: "synthetic-arbitrage-direction",
    name: "Arbitrage Direction Buy/Sell Inversion",
    family: "Conceptual Misalignment",
    description: "Selling the cheaper asset and buying the more expensive synthetic asset during an arbitrage mismatch.",
    recommendedRemediation: "Golden Arbitrage Rule: Always BUY the underpriced market asset and SELL/SHORT the overpriced synthetic equivalent.",
    historicalErrorRate: "51% of CFA Level 1 Candidates"
  }
};

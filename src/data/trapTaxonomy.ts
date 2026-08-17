import { ErrorMode } from "@/types/cfa";

export interface TrapDefinition {
  id: string;
  name: string;
  family: "Mathematical Omission" | "Convention Inversion" | "Conceptual Misalignment" | "Reading & Scope Trap" | "Accounting Standards";
  errorMode: ErrorMode;
  description: string;
  recommendedRemediation: string;
  historicalErrorRate: string;
  keystrokeTrapNote?: string;
}

export const ERROR_MODE_LABELS: Record<ErrorMode, { label: string; description: string; badgeColor: string }> = {
  SIGN_INVERSION: {
    label: "Sign Convention Inversion",
    description: "Reversed positive/negative cash flow signs (e.g. PV vs FV or cash outflow vs inflow).",
    badgeColor: "bg-red-500/20 text-red-400 border-red-500/40"
  },
  BA2_MODE: {
    label: "BA II Plus Mode Mismatch",
    description: "Calculated in [END] mode instead of [BGN] mode (or wrong P/Y setting).",
    badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/40"
  },
  PERIODICITY_MISMATCH: {
    label: "Periodicity / Compounding Frequency",
    description: "Forgot to divide annual yield by m (e.g., semiannual coupon / 2) or multiply periods (N * m).",
    badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/40"
  },
  GAAP_VS_IFRS: {
    label: "IFRS vs. US GAAP Treatment",
    description: "Confused interest/dividend cash flow classification or inventory valuation reversal rules.",
    badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/40"
  },
  FORMULA_SCALAR: {
    label: "Formula Scalar / Multiplier Omission",
    description: "Omitted critical factor (e.g. 0.5 in convexity approximation or (1 - t) in after-tax cost of debt).",
    badgeColor: "bg-orange-500/20 text-orange-400 border-orange-500/40"
  },
  CONCEPTUAL_CONFUSION: {
    label: "Core Conceptual Misunderstanding",
    description: "Confused related financial metrics (e.g. Modified Duration vs Effective Duration, SML vs CML).",
    badgeColor: "bg-pink-500/20 text-pink-400 border-pink-500/40"
  },
  READING_MISINTERPRETATION: {
    label: "Vignette Premise Misread",
    description: "Overlooked key qualifier (e.g. 'least likely', 'ex-dividend date', 'excluding tax effect').",
    badgeColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/40"
  },
  UNSPECIFIED: {
    label: "General Calculation Error",
    description: "Uncategorized execution or algebraic slip.",
    badgeColor: "bg-zinc-500/20 text-zinc-400 border-zinc-500/40"
  }
};

export const TRAP_TAXONOMY: Record<string, TrapDefinition> = {
  "Soft Dollar Beneficiary Distinction": {
    id: "soft-dollar-beneficiary",
    name: "Soft Dollar Beneficiary Confusion",
    family: "Conceptual Misalignment",
    errorMode: "CONCEPTUAL_CONFUSION",
    description: "Conflating manager operational overhead (hardware, rent, administrative terminals) with client investment research benefits.",
    recommendedRemediation: "Always ask: 'Does this service directly benefit the investment decision-making process for the specific client accounts that generated the commissions?'",
    historicalErrorRate: "42% of CFA Level 1 Candidates"
  },
  "Fiduciary Duty vs. Insider Trading Conflict": {
    id: "fiduciary-vs-insider",
    name: "Fiduciary Duty vs. Material Nonpublic Info",
    family: "Reading & Scope Trap",
    errorMode: "CONCEPTUAL_CONFUSION",
    description: "Assuming fiduciary duty to protect client capital permits trading on material nonpublic insider tips.",
    recommendedRemediation: "Standard II-A strictly prohibits trading or causing others to trade on MNPI regardless of fiduciary duties to clients.",
    historicalErrorRate: "38% of CFA Level 1 Candidates"
  },
  "LIFO Reserve Change Directional Sign": {
    id: "lifo-reserve-sign",
    name: "LIFO Reserve Change Sign Inversion",
    family: "Convention Inversion",
    errorMode: "SIGN_INVERSION",
    description: "Adding the change in LIFO reserve instead of subtracting it from LIFO COGS during inflationary cycles.",
    recommendedRemediation: "Remember: In rising prices, FIFO yields cheaper older costs in COGS. Therefore COGS(FIFO) = COGS(LIFO) - ΔLIFO Reserve.",
    historicalErrorRate: "48% of CFA Level 1 Candidates"
  },
  "Cumulative vs. Single-Period Reserve Tax Adjustment": {
    id: "lifo-retained-earnings-tax",
    name: "Ending vs Delta Reserve Balance Sheet Trap",
    family: "Mathematical Omission",
    errorMode: "FORMULA_SCALAR",
    description: "Applying the single-period delta reserve to retained earnings instead of the cumulative ending LIFO reserve balance.",
    recommendedRemediation: "Income statement adjustments use ΔLIFO Reserve; Balance sheet adjustments (Inventory, Retained Earnings) use Ending LIFO Reserve.",
    historicalErrorRate: "52% of CFA Level 1 Candidates"
  },
  "Gordon Growth Numerator Timing ($D_n$ vs $D_{n+1}$)": {
    id: "gordon-growth-timing",
    name: "Gordon Growth Numerator Timing Trap",
    family: "Mathematical Omission",
    errorMode: "PERIODICITY_MISMATCH",
    description: "Using current terminal dividend D_n instead of next period's dividend D_(n+1) when computing terminal value P_n.",
    recommendedRemediation: "P_n = D_(n+1) / (r - g) = D_n * (1 + g) / (r - g). You must advance the dividend one period into the perpetual growth phase.",
    historicalErrorRate: "56% of CFA Level 1 Candidates"
  },
  "Omission of the 1/2 Convexity Scalar Factor": {
    id: "convexity-scalar-omission",
    name: "Convexity 1/2 Multiplier Omission",
    family: "Mathematical Omission",
    errorMode: "FORMULA_SCALAR",
    description: "Forgetting the 1/2 factor in the Taylor series second-order convexity price change approximation.",
    recommendedRemediation: "ΔP/P ≈ -ModDur × Δy + 0.5 × Convexity × (Δy)^2. Always verify the 0.5 multiplier is present.",
    historicalErrorRate: "61% of CFA Level 1 Candidates"
  },
  "Beta Ratio Inversion (Market vs Asset Volatility)": {
    id: "beta-ratio-inversion",
    name: "Beta Standard Deviation Ratio Inversion",
    family: "Convention Inversion",
    errorMode: "SIGN_INVERSION",
    description: "Dividing market standard deviation by asset standard deviation or omitting the correlation coefficient.",
    recommendedRemediation: "Beta = ρ × (σ_asset / σ_market). Asset volatility is always in the numerator.",
    historicalErrorRate: "39% of CFA Level 1 Candidates"
  },
  "Underpriced vs Overpriced SML Plot Inversion": {
    id: "sml-plot-inversion",
    name: "SML Alpha / Valuation Polarity Error",
    family: "Conceptual Misalignment",
    errorMode: "CONCEPTUAL_CONFUSION",
    description: "Concluding that an asset plotting ABOVE the Security Market Line (SML) is overvalued rather than undervalued.",
    recommendedRemediation: "Above SML = Expected Return > Required Return (CAPM) => Positive Alpha => Undervalued / BUY.",
    historicalErrorRate: "47% of CFA Level 1 Candidates"
  },
  "Effective Annual Rate Compounding Periodicity": {
    id: "ear-compounding-periodicity",
    name: "EAR vs Stated Nominal Rate Periodicity Trap",
    family: "Mathematical Omission",
    errorMode: "PERIODICITY_MISMATCH",
    description: "Failing to compound monthly or daily periods using EAR = (1 + r/m)^m - 1.",
    recommendedRemediation: "On TI BA II Plus: [2nd][ICONV] -> NOM = stated rate, C/Y = compounding frequency -> [CPT] EFF.",
    historicalErrorRate: "44% of CFA Level 1 Candidates",
    keystrokeTrapNote: "Use [2nd][ICONV] for rapid error-free rate conversion."
  },
  "Annuity Due Mode Timing Trap ([BGN] vs [END])": {
    id: "annuity-due-timing",
    name: "Annuity Due Timing Trap",
    family: "Convention Inversion",
    errorMode: "BA2_MODE",
    description: "Computing lease payments or retirement contributions in standard [END] mode when cash flows occur at the beginning of the period.",
    recommendedRemediation: "Toggle [2nd][BGN][2nd][SET] before computing. Remember to toggle back to [END] afterward!",
    historicalErrorRate: "59% of CFA Level 1 Candidates",
    keystrokeTrapNote: "Press [2nd][BGN][2nd][SET] to switch between BGN and END."
  },
  "Bond Semiannual Yield Convention": {
    id: "bond-semiannual-yield",
    name: "Semiannual Coupon & Rate Doubling Trap",
    family: "Mathematical Omission",
    errorMode: "PERIODICITY_MISMATCH",
    description: "Inputting the annual YTM directly as I/Y or forgetting that N must be doubled (N = Years * 2) for semiannual bonds.",
    recommendedRemediation: "For semiannual bonds: N = Years * 2, PMT = (Coupon * Par) / 2, I/Y = Annual YTM / 2. To get YTM from I/Y: Multiply by 2.",
    historicalErrorRate: "53% of CFA Level 1 Candidates"
  },
  "WACC After-Tax Cost of Debt Trap": {
    id: "wacc-tax-shield",
    name: "WACC Cost of Debt (1 - t) Omission",
    family: "Mathematical Omission",
    errorMode: "FORMULA_SCALAR",
    description: "Using pre-tax cost of debt r_d in WACC instead of after-tax cost r_d * (1 - t).",
    recommendedRemediation: "WACC = w_d * r_d * (1 - t) + w_p * r_p + w_e * r_e. Interest is tax-deductible; dividends are not.",
    historicalErrorRate: "41% of CFA Level 1 Candidates"
  },
  "IFRS vs US GAAP Lease CFO Classification": {
    id: "lease-cfo-gaap-ifrs",
    name: "Lease Cash Flow Reporting Discrepancy",
    family: "Accounting Standards",
    errorMode: "GAAP_VS_IFRS",
    description: "Assuming operating lease payments under US GAAP and IFRS 16 have identical cash flow statement impacts.",
    recommendedRemediation: "IFRS 16 splits lease payment into Financing (principal) and Operating/Financing (interest), artificially inflating CFO relative to US GAAP operating leases.",
    historicalErrorRate: "64% of CFA Level 1 Candidates"
  },
  "Put-Call Parity Directional Sign Trap": {
    id: "put-call-parity-signs",
    name: "Put-Call Parity Synthetic Position Signs",
    family: "Convention Inversion",
    errorMode: "SIGN_INVERSION",
    description: "Inverting signs in synthetic replication: c + PV(X) = p + S_0.",
    recommendedRemediation: "Synthetic Long Call: c = p + S_0 - PV(X) (Long Put + Long Stock + Borrow PV of Strike).",
    historicalErrorRate: "51% of CFA Level 1 Candidates"
  }
};

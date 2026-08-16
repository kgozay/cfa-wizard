import { VignetteSet } from "@/types/cfa";

export const CFA_VIGNETTES: VignetteSet[] = [
  {
    id: "vignette-01-ethics",
    topicId: "01",
    topicName: "Ethical & Professional Standards",
    subReading: "Guidance for Standards I–VII & Soft Dollar Allocation",
    difficulty: "High Trap",
    vignetteStem: "Elena Rostova, CFA, is a senior portfolio manager at Apex Asset Management managing institutional pension mandates. A broker-dealer, Zenith Securities, offers Elena an arrangement where Apex directs client equity trades to Zenith at standard commissions. In return, Zenith agrees to provide Apex with specialized macroeconomic econometric models, Bloomberg terminal software subscriptions for all portfolio managers, and tickets to an annual offshore investment symposium with paid luxury resort accommodations.",
    questions: [
      {
        id: 1,
        stem: "Under the CFA Institute Standards of Professional Conduct regarding Soft Dollar Practices (Standard III-A: Loyalty, Prudence, and Care), which of the following services offered by Zenith is most acceptable for Elena to receive using client brokerage commissions?",
        options: {
          A: "Bloomberg terminal software subscriptions for all portfolio managers.",
          B: "Specialized macroeconomic econometric research models.",
          C: "Luxury resort accommodations for the investment symposium."
        },
        correctOption: "B",
        algebraicSolution: "\\text{Soft Dollar Test: } \\text{Benefit must directly aid the investment decision-making process for the specific client accounts generating brokerage.} \\newline \\text{Economic research models provide direct analytical decision support. Office subscriptions and travel expenses are manager overhead.}",
        calculatorKeystrokes: "N/A — Qualitative Standard III-A / Soft Dollar Beneficiary Framework",
        trapCategory: "Soft Dollar Beneficiary Distinction",
        distractorAutopsy: {
          A: "Incorrect. General office overhead, hardware, and routine terminal subscriptions benefit the investment management firm generally and cannot be financed using client soft dollar brokerage credits.",
          B: "Correct. Proprietary econometric models and fundamental investment research directly assist in portfolio decision-making for client accounts, meeting the primary beneficiary standard.",
          C: "Incorrect. Luxury travel and resort lodging constitute personal and firm benefits that breach fiduciary duty (Standard III-A) and independence (Standard I-B)."
        }
      },
      {
        id: 2,
        stem: "Suppose Elena attends the investment symposium at Apex's expense. During a dinner, the CFO of an issuer held across Apex's portfolios informs Elena that next quarter's revenue will fall 35% below consensus estimates due to an unannounced supply chain collapse. Under Standard II-A (Material Nonpublic Information), Elena's most appropriate course of action is to:",
        options: {
          A: "Immediately liquidate the issuer's shares across all client portfolios to prevent fiduciary losses.",
          B: "Refrain from trading or causing others to trade in the issuer's securities and urge company management to publicly disclose the information.",
          C: "Incorporate the private revenue disclosure into her proprietary multi-factor mosaic model before executing rebalancing trades."
        },
        correctOption: "B",
        algebraicSolution: "\\text{Standard II-A Rule: } \\text{Trading on material nonpublic information is strictly forbidden regardless of fiduciary duties.} \\newline \\text{Action: Urge management public disclosure while maintaining a trading freeze.}",
        calculatorKeystrokes: "N/A — Standard II-A Material Nonpublic Information Protocol",
        trapCategory: "Fiduciary Duty vs. Insider Trading Conflict",
        distractorAutopsy: {
          A: "Incorrect. Even though portfolio managers owe a duty of loyalty to clients, Standard II-A strictly prohibits trading on material nonpublic information; fiduciary duty never supersedes legal and ethical insider trading prohibitions.",
          B: "Correct. When in possession of material nonpublic information directly from corporate insiders, the member must not trade, must isolate the information behind ethical walls, and must encourage corporate disclosure.",
          C: "Incorrect. The Mosaic Theory permits piecing together non-material nonpublic information with public data, but the explicit revenue guidance leak is material on its own; utilizing it is a direct violation."
        }
      }
    ]
  },
  {
    id: "vignette-02-fsa",
    topicId: "02",
    topicName: "Financial Statement Analysis",
    subReading: "Inventories: LIFO Reserve & Lease Capitalization",
    difficulty: "Institutional",
    vignetteStem: "Vanguard Industrial Corp. reports under US GAAP and uses the LIFO inventory valuation method during a period of persistent 6% annual input price inflation. For the fiscal year ended 2025, Vanguard reports COGS of $1,450,000 and ending inventory of $620,000. Vanguard's footnote disclosures indicate that the LIFO reserve was $180,000 on January 1, 2025, and increased to $245,000 on December 31, 2025. Vanguard's corporate marginal tax rate is 25%.",
    questions: [
      {
        id: 1,
        stem: "If Vanguard had reported its financial statements under the FIFO method instead of LIFO, its Cost of Goods Sold (COGS) for fiscal year 2025 would be closest to:",
        options: {
          A: "$1,385,000",
          B: "$1,450,000",
          C: "$1,515,000"
        },
        correctOption: "A",
        algebraicSolution: "\\text{LIFO to FIFO COGS Adjustment Formula:} \\newline COGS_{FIFO} = COGS_{LIFO} - \\Delta LIFO\\ Reserve \\newline \\Delta LIFO\\ Reserve = 245,000 - 180,000 = +\\$65,000 \\newline COGS_{FIFO} = 1,450,000 - 65,000 = \\$1,385,000",
        calculatorKeystrokes: "1450000 [-] [(] 245000 [-] 180000 [)] [=] => 1,385,000",
        trapCategory: "LIFO Reserve Change Directional Sign",
        distractorAutopsy: {
          A: "Correct. During inflation, ending LIFO reserve expands (+$65,000). FIFO assigns earlier, cheaper inventory to COGS, so FIFO COGS equals LIFO COGS minus the change in LIFO reserve ($1,450,000 - $65,000 = $1,385,000).",
          B: "Incorrect. Assumes no adjustment is required, ignoring the $65,000 expansion in the LIFO reserve.",
          C: "Incorrect. The candidate erroneously added the change in LIFO reserve ($1,450,000 + $65,000 = $1,515,000), which would only occur in a deflationary environment where FIFO COGS exceeds LIFO COGS."
        }
      },
      {
        id: 2,
        stem: "The cumulative adjustment to Vanguard's retained earnings to reflect the FIFO conversion on December 31, 2025, is most likely an increase of:",
        options: {
          A: "$48,750",
          B: "$183,750",
          C: "$245,000"
        },
        correctOption: "B",
        algebraicSolution: "\\text{Cumulative Retained Earnings Adjustment:} \\newline \\Delta Retained\\ Earnings = LIFO\\ Reserve_{ending} \\times (1 - t) \\newline \\Delta Retained\\ Earnings = 245,000 \\times (1 - 0.25) = 245,000 \\times 0.75 = \\$183,750",
        calculatorKeystrokes: "245000 [\\times] [(] 1 [-] 0.25 [)] [=] => 183,750",
        trapCategory: "Cumulative vs. Single-Period Reserve Tax Adjustment",
        distractorAutopsy: {
          A: "Incorrect. Calculated using only the current period change in reserve after tax: $\\Delta LIFO\\ Reserve \\times (1 - t) = 65,000 \\times 0.75 = \\$48,750$. Retained earnings on the balance sheet is a cumulative stock measure, requiring the ending total reserve.",
          B: "Correct. On the balance sheet, ending inventory increases by the full ending LIFO reserve ($245,000). Cumulative deferred taxes increase by $t \\times LIFO\\ Reserve = 245,000 \\times 0.25 = \\$61,250$, leaving an after-tax increase to retained earnings of $245,000 \\times 0.75 = \\$183,750$.",
          C: "Incorrect. Assumes the full pre-tax ending reserve increases retained earnings, failing to deduct the tax liability component ($245,000 \\times 0.25 = \\$61,250$)."
        }
      }
    ]
  },
  {
    id: "vignette-03-equity",
    topicId: "03",
    topicName: "Equity Investments",
    subReading: "Discounted Dividend Valuation & Multi-Stage DDM",
    difficulty: "High Trap",
    vignetteStem: "An equity research analyst is valuing Helios Energy using a two-stage dividend discount model (DDM). Helios just paid an annual dividend of $D_0 = \\$2.50$ per share. Dividends are projected to grow at a supernormal rate of 12.0% per year for the next 2 years (Years 1 and 2), after which growth will decelerate permanently to a constant sustainable rate of 4.0% per year beginning in Year 3. The analyst estimates Helios' required rate of return on equity to be 9.0%.",
    questions: [
      {
        id: 1,
        stem: "The terminal value of Helios Energy stock at the end of Year 2 ($P_2$) using the Gordon Growth Model is closest to:",
        options: {
          A: "$62.72",
          B: "$65.23",
          C: "$67.84"
        },
        correctOption: "B",
        algebraicSolution: "\\text{Step 1: Compute dividends for Years 1, 2, and 3:} \\newline D_1 = 2.50 \\times (1 + 0.12) = \\$2.80 \\newline D_2 = 2.80 \\times (1 + 0.12) = 2.50 \\times (1.12)^2 = \\$3.136 \\newline D_3 = D_2 \\times (1 + g_L) = 3.136 \\times (1 + 0.04) = \\$3.26144 \\newline \\text{Step 2: Terminal Value at } t=2: \\newline P_2 = \\frac{D_3}{r - g_L} = \\frac{3.26144}{0.09 - 0.04} = \\frac{3.26144}{0.05} = \\$65.2288 \\approx \\$65.23",
        calculatorKeystrokes: "2.50 [\\times] 1.12 [\\times] 1.12 [\\times] 1.04 [\\div] 0.05 [=] => 65.2288",
        trapCategory: "Gordon Growth Numerator Timing ($D_n$ vs $D_{n+1}$)",
        distractorAutopsy: {
          A: "Incorrect. The candidate used $D_2$ instead of $D_3$ in the numerator: $P_2 = \\frac{D_2}{r - g} = \\frac{3.136}{0.05} = \\$62.72$. This is the classic CFA trap of failing to advance dividend growth to the perpetual growth phase.",
          B: "Correct. The Gordon growth model requires next year's dividend in the numerator ($D_3 = D_2 \\times 1.04 = \\$3.26144$). Dividing by $(r - g) = (0.09 - 0.04) = 0.05$ yields $P_2 = \\$65.23$.",
          C: "Incorrect. Computed by compounding $D_2$ by the supernormal rate of 12% ($D_3 = 3.136 \\times 1.12 = \\$3.512$), yielding $P_2 = \\frac{3.512}{0.05} = \\$70.24$, then discounting incorrectly."
        }
      },
      {
        id: 2,
        stem: "The total intrinsic value per share of Helios Energy stock today ($P_0$) is closest to:",
        options: {
          A: "$57.48",
          B: "$60.10",
          C: "$62.55"
        },
        correctOption: "A",
        algebraicSolution: "\\text{Discount all cash flows to } t=0 \\text{ at } r = 9\\%: \\newline P_0 = \\frac{D_1}{(1+r)^1} + \\frac{D_2 + P_2}{(1+r)^2} \\newline P_0 = \\frac{2.80}{1.09} + \\frac{3.136 + 65.2288}{(1.09)^2} = 2.5688 + \\frac{68.3648}{1.1881} = 2.5688 + 57.5413 = \\$60.11 \\newline \\text{Using exact cash flow registers:} \\newline CF_0 = 0, \\; CF_1 = 2.80, \\; CF_2 = 3.136 + 65.2288 = 68.3648, \\; I = 9\\% \\implies NPV = \\$60.11",
        calculatorKeystrokes: "[CF] -> [2nd][CLR WORK] -> CF0 = 0 [ENTER] -> C01 = 2.80 [ENTER] -> C02 = 68.3648 [ENTER] -> [NPV] -> I = 9 [ENTER] -> [CPT] => 60.11",
        trapCategory: "Terminal Value Discounting Period Mismatch",
        distractorAutopsy: {
          A: "Incorrect. The candidate mistakenly discounted the terminal value $P_2$ over 3 periods instead of 2 periods: $\\frac{2.80}{1.09} + \\frac{3.136}{(1.09)^2} + \\frac{65.23}{(1.09)^3} = 2.569 + 2.639 + 50.369 = \\$55.58$.",
          B: "Correct. Discounting Year 1 dividend ($2.80 / 1.09 = \\$2.57$) and combined Year 2 cash flow ($[3.136 + 65.23] / 1.09^2 = \\$57.54$) produces an intrinsic price today of $P_0 = \\$60.11$.",
          C: "Incorrect. The candidate added $D_0 = \\$2.50$ into the valuation stream or forgot to discount $D_2$ and $P_2$ over two years."
        }
      }
    ]
  },
  {
    id: "vignette-04-fixed-income",
    topicId: "04",
    topicName: "Fixed Income",
    subReading: "Understanding Fixed-Income Risk & Convexity Adjustments",
    difficulty: "Institutional",
    vignetteStem: "A fixed-income portfolio manager at Citadel Capital oversees an institutional mandate holding a 5-year option-free annual corporate bond with a par value of $1,000 and a 6.00% annual coupon. The bond is currently trading at a market price of $980.00. Analytical models estimate that the bond has an Annual Modified Duration of 4.25 years and an Annual Convexity of 24.50. The Federal Reserve unexpectedly adjusts monetary policy, causing benchmark yields to rise immediately by 150 basis points (+1.50%).",
    questions: [
      {
        id: 1,
        stem: "Using both duration and convexity, the estimated percentage price change of the bond following the 150 bps yield increase is closest to:",
        options: {
          A: "-6.38%",
          B: "-6.10%",
          C: "-5.82%"
        },
        correctOption: "B",
        algebraicSolution: "\\text{Percentage Price Change Formula:} \\newline \\frac{\\Delta P}{P} \\approx -\\text{AnnModDur} \\times \\Delta y + \\frac{1}{2} \\times \\text{AnnConvexity} \\times (\\Delta y)^2 \\newline \\text{Duration Effect} = -4.25 \\times (+0.0150) = -0.06375 \\; (-6.375\\%) \\newline \\text{Convexity Effect} = \\frac{1}{2} \\times 24.50 \\times (0.0150)^2 = 0.5 \\times 24.50 \\times 0.000225 = +0.002756 \\; (+0.276\\%) \\newline \\frac{\\Delta P}{P} \\approx -6.375\\% + 0.276\\% = -6.099\\% \\approx -6.10\\%",
        calculatorKeystrokes: "[-] 4.25 [\\times] 0.015 [+] 0.5 [\\times] 24.50 [\\times] [(] 0.015 [x^2] [)] [=] => -0.06099 (-6.10%)",
        trapCategory: "Omission of the 1/2 Convexity Scalar Factor",
        distractorAutopsy: {
          A: "Incorrect. This represents the linear duration-only approximation ($-4.25 \\times 0.015 = -6.38\\%$), ignoring the positive convexity adjustment that dampens price declines.",
          B: "Correct. The duration effect creates a $-6.375\\%$ drop, which is cushioned by the positive convexity term of $+\\frac{1}{2}(24.50)(0.015)^2 = +0.276\\%$, resulting in a net $-6.10\\%$ price change.",
          C: "Incorrect. The candidate forgot the $\\frac{1}{2}$ factor in the convexity term: $-6.375\\% + (24.50)(0.015)^2 = -6.375\\% + 0.551\\% = -5.82\\%$. Forgetting the $1/2$ is one of the most frequent CFA traps."
        }
      },
      {
        id: 2,
        stem: "The Yield-to-Maturity (YTM) of the 5-year annual corporate bond prior to the interest rate shock is closest to:",
        options: {
          A: "6.00%",
          B: "6.48%",
          C: "6.85%"
        },
        correctOption: "B",
        algebraicSolution: "\\text{Solve for YTM on TI BA II Plus:} \\newline N = 5, \\; PV = -980.00, \\; PMT = 60, \\; FV = 1000 \\newline \\text{Compute } I/Y \\implies 6.48\\%",
        calculatorKeystrokes: "[2nd][CLR TVM] -> N = 5 -> PV = -980 [ENTER] -> PMT = 60 [ENTER] -> FV = 1000 [ENTER] -> [CPT] [I/Y] => 6.48%",
        trapCategory: "Bond Price Sign Inversion ($PV$ vs $FV$)",
        distractorAutopsy: {
          A: "Incorrect. Assumes bond trades at par where YTM = coupon (6.00%). Because the bond trades at a discount ($980 < $1,000), YTM must exceed the coupon rate.",
          B: "Correct. Using the TI BA II Plus TVM registers with $N=5$, $PV=-980$, $PMT=60$, $FV=1000$, and computing $[I/Y]$ yields $6.48\\%$.",
          C: "Incorrect. Calculated by treating the annual bond as semi-annual with $N=10$ and $PMT=30$ without proper rate conversion."
        }
      }
    ]
  },
  {
    id: "vignette-05-portfolio",
    topicId: "05",
    topicName: "Portfolio Management",
    subReading: "Capital Asset Pricing Model (CAPM) & SML Analysis",
    difficulty: "High Trap",
    vignetteStem: "An equity analyst at BlackRock is evaluating three technology stocks against the Capital Asset Pricing Model (CAPM). The risk-free rate is currently 4.0%, and the expected return on the broad market index is 10.0%. The analyst's proprietary research generates the following forecasts for Zenith Technologies:\n- Expected Return $E(R_z) = 13.5\\%$\n- Stock Standard Deviation $\\sigma_z = 28.0\\%$\n- Market Standard Deviation $\\sigma_m = 16.0\\%$\n- Correlation with the Market $\\rho_{z,m} = 0.75$",
    questions: [
      {
        id: 1,
        stem: "The Beta ($\\beta$) of Zenith Technologies relative to the market index is closest to:",
        options: {
          A: "0.75",
          B: "1.31",
          C: "1.75"
        },
        correctOption: "B",
        algebraicSolution: "\\text{Beta Derivation Formula:} \\newline \\beta_z = \\frac{Cov(R_z, R_m)}{\\sigma_m^2} = \\rho_{z,m} \\times \\frac{\\sigma_z}{\\sigma_m} \\newline \\beta_z = 0.75 \\times \\frac{0.28}{0.16} = 0.75 \\times 1.75 = 1.3125 \\approx 1.31",
        calculatorKeystrokes: "0.75 [\\times] 0.28 [\\div] 0.16 [=] => 1.3125",
        trapCategory: "Beta Ratio Inversion (Market vs Asset Volatility)",
        distractorAutopsy: {
          A: "Incorrect. The candidate assumed Beta equals the correlation coefficient $\\rho_{z,m} = 0.75$, ignoring relative asset and market standard deviations.",
          B: "Correct. Beta is the correlation multiplied by the ratio of the asset's standard deviation to the market's standard deviation: $0.75 \\times (28\\% / 16\\%) = 1.3125$.",
          C: "Incorrect. The candidate calculated the standard deviation ratio $\\sigma_z / \\sigma_m = 28 / 16 = 1.75$ without multiplying by the correlation coefficient $\\rho = 0.75$."
        }
      },
      {
        id: 2,
        stem: "Based on the CAPM, Zenith Technologies is most accurately described as:",
        options: {
          A: "Underpriced, plotting above the Security Market Line (SML).",
          B: "Fairly priced, plotting directly on the Capital Market Line (CML).",
          C: "Overpriced, plotting below the Security Market Line (SML)."
        },
        correctOption: "A",
        algebraicSolution: "\\text{CAPM Required Return: } \\newline R_{req} = R_f + \\beta_z [E(R_m) - R_f] \\newline R_{req} = 0.04 + 1.3125 \\times (0.10 - 0.04) = 0.04 + 1.3125 \\times 0.06 = 0.04 + 0.07875 = 11.875\\% \\newline \\text{Comparison: } E(R_z) = 13.5\\% > R_{req} = 11.875\\% \\newline \\text{Conclusion: Asset provides excess return } (\\alpha = +1.625\\%) \\implies \\text{Plots ABOVE SML } \\implies \\text{UNDERPRICED (Buy)}",
        calculatorKeystrokes: "0.04 [+] 1.3125 [\\times] 0.06 [=] => 0.11875 (11.88%)",
        trapCategory: "Underpriced vs Overpriced SML Plot Inversion",
        distractorAutopsy: {
          A: "Correct. The CAPM required return is $11.88\\%$. Because the analyst's expected return ($13.50\\%$) exceeds required return, the stock offers positive alpha ($+1.625\\%$) and plots above the SML, meaning it is underpriced in the market.",
          B: "Incorrect. The CML applies exclusively to efficient total portfolios, not individual securities. Individual stocks must be evaluated against the SML.",
          C: "Incorrect. Candidates often mistakenly think higher expected return means the asset is 'too expensive' (overpriced). In finance, an asset expected to return more than its risk warrants is a bargain (underpriced)."
        }
      }
    ]
  },
  {
    id: "vignette-06-alts",
    topicId: "06",
    topicName: "Alternative Investments",
    subReading: "Hedge Fund Fee Waterfalls & Commodity Roll Yield",
    difficulty: "High Trap",
    vignetteStem: "Alpha Capital operates a global macro hedge fund with $200 million in Assets Under Management (AUM) at the beginning of the year. The fund charges a standard '2 and 20' fee structure (2% management fee, 20% incentive fee). The management fee is calculated on beginning-of-year AUM. The incentive fee is calculated net of the management fee and is subject to a 5% soft hurdle rate with 100% catch-up. At the end of the year, the fund's portfolio value before fees is $230 million.",
    questions: [
      {
        id: 1,
        stem: "The total fee (management fee plus incentive fee) earned by Alpha Capital for the year is closest to:",
        options: {
          A: "$8.00 million",
          B: "$9.20 million",
          C: "$10.00 million"
        },
        correctOption: "B",
        algebraicSolution: "\\text{Step 1: Management Fee} = 2\\% \\times \\$200\\text{M} = \\$4.00\\text{M} \\newline \\text{Step 2: Gross Profit Net of Mgmt Fee} = \\$230\\text{M} - \\$200\\text{M} - \\$4.00\\text{M} = \\$26.00\\text{M} \\newline \\text{Step 3: Hurdle Check} = 5\\% \\times \\$200\\text{M} = \\$10.00\\text{M}. \\; \\text{Since } \\$26\\text{M} > \\$10\\text{M}, \\text{hurdle is satisfied.} \\newline \\text{Step 4: 100\\% Catch-up Rule} \\implies \\text{GP receives 20\\% of the entire net profit } (\\$26.00\\text{M}): \\newline \\text{Incentive Fee} = 20\\% \\times \\$26.00\\text{M} = \\$5.20\\text{M} \\newline \\text{Total Fee} = \\text{Mgmt Fee} + \\text{Incentive Fee} = \\$4.00\\text{M} + \\$5.20\\text{M} = \\$9.20\\text{M}",
        calculatorKeystrokes: "200 [\\times] 0.02 [=] 4.0; [(] 30 [-] 4 [)] [\\times] 0.20 [=] 5.2; 4 [+] 5.2 [=] 9.20",
        trapCategory: "Hurdle Rate Catch-Up Clause vs Excess Profit",
        distractorAutopsy: {
          A: "Incorrect. Assumes a hard hurdle rate without catch-up where incentive fee applies only to profits above the 5% hurdle: $4.00\\text{M} + 20\\% \\times (26\\text{M} - 10\\text{M}) = 4.00 + 3.20 = \\$7.20\\text{M}$.",
          B: "Correct. Because the contract specifies a soft hurdle with 100% catch-up, once the 5% threshold is crossed, the 20% incentive fee applies to the entire $26M net profit ($5.20M). Adding the $4.00M management fee yields $9.20M.",
          C: "Incorrect. The candidate calculated fees gross of the management fee: $4.00\\text{M} + 20\\% \\times \\$30\\text{M} = \\$10.00\\text{M}$, ignoring the requirement that incentive fees be calculated net of management fees."
        }
      },
      {
        id: 2,
        stem: "An investor in crude oil futures observes that the current spot price is $78.00/bbl, while the 3-month futures contract trades at $74.50/bbl. The term structure of the commodity is in:",
        options: {
          A: "Contango, generating negative roll yield for a long futures position.",
          B: "Backwardation, generating positive roll yield for a long futures position.",
          C: "Backwardation, generating negative roll yield for a long futures position."
        },
        correctOption: "B",
        algebraicSolution: "\\text{Term Structure Condition: } F_0 = \\$74.50 < S_0 = \\$78.00 \\newline \\implies \\text{Backwardation (Inverted Market)}. \\newline \\text{Roll Yield for Long Futures: } \\text{As time passes, } F_t \\to S_t \\text{ (converges upward)}. \\newline \\text{Roll Yield} = \\frac{S_0 - F_0}{F_0} > 0 \\implies \\text{Positive Roll Yield}.",
        calculatorKeystrokes: "78 [-] 74.50 [=] +3.50 (Positive Roll)",
        trapCategory: "Contango vs Backwardation Roll Yield Polarity",
        distractorAutopsy: {
          A: "Incorrect. Contango occurs when futures prices exceed spot prices ($F_0 > S_0$), which causes negative roll yield when rolling expiring contracts to higher-priced contracts.",
          B: "Correct. When futures trade below spot ($F_0 < S_0$), the curve is in backwardation. Long futures holders benefit from positive roll yield as the lower-priced futures converge upward toward spot at expiration.",
          C: "Incorrect. While backwardation is identified correctly, backwardation generates positive—not negative—roll yield for long positions."
        }
      }
    ]
  },
  {
    id: "vignette-07-quants",
    topicId: "07",
    topicName: "Quantitative Methods",
    subReading: "Hypothesis Testing, Time Value of Money & Compounding",
    difficulty: "Institutional",
    vignetteStem: "A quantitative research analyst tests whether the average excess return of an algorithmic momentum strategy is statistically significantly greater than zero. Using 64 monthly observations ($n = 64$), the sample mean excess return is $\\bar{x} = 0.75\\%$ per month with a sample standard deviation of $s = 2.40\\%$. The analyst tests at the 5% significance level ($\\alpha = 0.05$). Separately, a high-net-worth client deposits $500,000 into a private credit vehicle earning a nominal stated annual rate of 8.00% compounded quarterly.",
    questions: [
      {
        id: 1,
        stem: "The calculated test statistic for the momentum strategy hypothesis test ($H_0: \\mu \\le 0 \\text{ vs. } H_a: \\mu > 0$) is closest to:",
        options: {
          A: "1.25",
          B: "2.50",
          C: "3.13"
        },
        correctOption: "B",
        algebraicSolution: "\\text{Standard Error of the Mean: } \\newline s_{\\bar{x}} = \\frac{s}{\\sqrt{n}} = \\frac{2.40\\%}{\\sqrt{64}} = \\frac{2.40\\%}{8} = 0.30\\% \\newline \\text{Test Statistic (t-statistic): } \\newline t_{calc} = \\frac{\\bar{x} - \\mu_0}{s_{\\bar{x}}} = \\frac{0.75\\% - 0\\%}{0.30\\%} = 2.50",
        calculatorKeystrokes: "0.75 [\\div] [(] 2.40 [\\div] [\\sqrt{64}] [)] [=] => 2.50",
        trapCategory: "Standard Error Sample Size Square Root Omission",
        distractorAutopsy: {
          A: "Incorrect. The candidate divided sample mean by the full sample standard deviation without dividing by $\\sqrt{n}$: $\\frac{0.75}{2.40} = 0.3125$, then multiplied by 4.",
          B: "Correct. Standard error is $s / \\sqrt{n} = 2.40\\% / 8 = 0.30\\%$. Dividing the sample mean ($0.75\\%$) by standard error ($0.30\\%$) yields a test statistic of $t = 2.50$.",
          C: "Incorrect. The candidate incorrectly divided by degrees of freedom $\\sqrt{n-1} = \\sqrt{63}$ in the numerator or flipped the standard error formula."
        }
      },
      {
        id: 2,
        stem: "The Effective Annual Rate (EAR) earned on the client's quarterly-compounded credit vehicle is closest to:",
        options: {
          A: "8.00%",
          B: "8.24%",
          C: "8.33%"
        },
        correctOption: "B",
        algebraicSolution: "\\text{Effective Annual Rate Formula: } \\newline EAR = \\left(1 + \\frac{r_s}{m}\\right)^m - 1 \\newline EAR = \\left(1 + \\frac{0.08}{4}\\right)^4 - 1 = (1 + 0.02)^4 - 1 = (1.02)^4 - 1 = 1.082432 - 1 = 8.2432\\% \\approx 8.24\\%",
        calculatorKeystrokes: "[2nd][ICONV] -> NOM = 8 [ENTER] -> C/Y = 4 [ENTER] -> [CPT] EFF => 8.2432%",
        trapCategory: "Compounding Frequency Inversion ($m=4$ vs $m=12$)",
        distractorAutopsy: {
          A: "Incorrect. This is the nominal stated rate (8.00%), which ignores the positive effect of quarterly interest compounding.",
          B: "Correct. Compounding at $2\\%$ per quarter for 4 quarters produces an effective annual yield of $(1.02)^4 - 1 = 8.2432\\%$.",
          C: "Incorrect. Calculated assuming monthly compounding ($m=12$): $(1 + 0.08/12)^{12} - 1 = 8.30\\%$ or continuous compounding $e^{0.08} - 1 = 8.33\\%$."
        }
      }
    ]
  },
  {
    id: "vignette-08-econ",
    topicId: "08",
    topicName: "Economics",
    subReading: "Currency Exchange Rates & IS-LM Monetary/Fiscal Policy",
    difficulty: "High Trap",
    vignetteStem: "A foreign exchange strategist at UBS is analyzing foreign exchange quotations. The current spot exchange rate between the Euro and US Dollar is quoted as EUR/USD = 1.1000 (meaning $1.1000 USD per 1 EUR). The 1-year risk-free interest rate in the United States is 5.00%, while the 1-year risk-free interest rate in the Eurozone is 2.00%. Separately, the government enacts an aggressive expansionary fiscal stimulus while the central bank maintains a restrictive tight monetary policy.",
    questions: [
      {
        id: 1,
        stem: "Under Covered Interest Rate Parity (CIP), the 1-year no-arbitrage forward exchange rate (EUR/USD) is closest to:",
        options: {
          A: "1.0686",
          B: "1.1000",
          C: "1.1324"
        },
        correctOption: "C",
        algebraicSolution: "\\text{Covered Interest Parity Formula (Price/Base):} \\newline \\text{Quote is EUR/USD, where USD is Price Currency and EUR is Base Currency.} \\newline F_{\\text{USD/EUR}} = S_{\\text{USD/EUR}} \\times \\left[\\frac{1 + r_{\\text{USD}}}{1 + r_{\\text{EUR}}}\\right] \\newline F = 1.1000 \\times \\left[\\frac{1 + 0.05}{1 + 0.02}\\right] = 1.1000 \\times \\frac{1.05}{1.02} = 1.1000 \\times 1.02941 = 1.13235 \\approx 1.1324",
        calculatorKeystrokes: "1.1000 [\\times] 1.05 [\\div] 1.02 [=] => 1.1324",
        trapCategory: "Base vs Price Currency Interest Rate Ratio Inversion",
        distractorAutopsy: {
          A: "Incorrect. The candidate inverted the interest rate ratio: $1.1000 \\times \\frac{1.02}{1.05} = 1.0686$. In EUR/USD notation, USD is the price currency (numerator) and EUR is base currency (denominator).",
          B: "Incorrect. Assumes forward rate equals spot rate, which would only hold if both countries had identical interest rates.",
          C: "Correct. Because the price currency (USD) carries a higher interest rate (5%) than the base currency EUR (2%), the base currency EUR must appreciate forward to $1.1324 to eliminate covered interest arbitrage."
        }
      },
      {
        id: 2,
        stem: "According to the IS-LM framework, the simultaneous combination of expansionary fiscal policy and restrictive monetary policy will most likely cause real interest rates to:",
        options: {
          A: "Increase, while the net effect on real output (GDP) is ambiguous.",
          B: "Decrease, while real output unambiguously increases.",
          C: "Remain unchanged, while real output decreases."
        },
        correctOption: "A",
        algebraicSolution: "\\text{IS Curve (Fiscal Stimulus): } \\text{Shifts Right } \\implies Y \\uparrow, \\; r \\uparrow \\newline \\text{LM Curve (Tight Monetary): } \\text{Shifts Left } \\implies Y \\downarrow, \\; r \\uparrow \\newline \\text{Combined Effect: } \\newline \\text{Real Interest Rate } (r): \\text{Both policies push interest rates UP } \\implies r \\uparrow \\text{ (Unambiguous increase)} \\newline \\text{Real Output } (Y): \\text{Opposing forces } (\\uparrow \\text{ vs } \\downarrow) \\implies \\text{Ambiguous effect}",
        calculatorKeystrokes: "N/A — IS-LM Matrix Shift Interaction",
        trapCategory: "IS-LM Curve Shift Intersection Ambiguity",
        distractorAutopsy: {
          A: "Correct. Expansionary fiscal policy increases aggregate demand (IS right, pushing r up), while tight monetary policy reduces liquidity (LM left, pushing r up). Both forces compound to increase interest rates, while their opposite effects on output leave GDP ambiguous.",
          B: "Incorrect. Expansionary fiscal and tight monetary policies both drive interest rates higher, not lower.",
          C: "Incorrect. Interest rates experience a strong compounding upward shift rather than remaining unchanged."
        }
      }
    ]
  },
  {
    id: "vignette-09-corp",
    topicId: "09",
    topicName: "Corporate Issuers",
    subReading: "Measures of Leverage (DOL, DFL, DTL) & WACC Flotation Costs",
    difficulty: "Standard",
    vignetteStem: "Apex Robotics is evaluating a major expansion project requiring an initial capital expenditure of $10 million. The company's target capital structure is 40% debt and 60% common equity. Apex's pre-tax cost of debt is 6.50%, the marginal corporate tax rate is 25%, and the required return on equity is 12.00%. To fund the equity portion, Apex must issue new shares incurring a flotation cost of 4.0%. Separately, Apex's operating data reveals a Degree of Operating Leverage (DOL) of 2.20 and a Degree of Financial Leverage (DFL) of 1.50 at current production levels.",
    questions: [
      {
        id: 1,
        stem: "Apex Robotics' Degree of Total Leverage (DTL) is closest to:",
        options: {
          A: "3.30",
          B: "3.70",
          C: "0.70"
        },
        correctOption: "A",
        algebraicSolution: "\\text{Degree of Total Leverage Formula: } \\newline DTL = DOL \\times DFL \\newline DTL = 2.20 \\times 1.50 = 3.30 \\newline \\text{Interpretation: A 1\\% increase in sales yields a 3.30\\% increase in EPS.}",
        calculatorKeystrokes: "2.20 [\\times] 1.50 [=] => 3.30",
        trapCategory: "Addition vs. Multiplication of Leverage Coefficients",
        distractorAutopsy: {
          A: "Correct. Total leverage is the multiplicative product of operating and financial leverage: $DTL = DOL \\times DFL = 2.20 \\times 1.50 = 3.30$.",
          B: "Incorrect. The candidate added the two leverage metrics ($2.20 + 1.50 = 3.70$), which violates the compounding definition of total leverage.",
          C: "Incorrect. The candidate subtracted DFL from DOL ($2.20 - 1.50 = 0.70$)."
        }
      },
      {
        id: 2,
        stem: "Under recommended CFA Institute methodology, the 4.0% equity flotation cost on the expansion project should be accounted for by:",
        options: {
          A: "Increasing the cost of equity ($r_e$) in the WACC calculation by 4.0%.",
          B: "Adding the total flotation cost ($4.0\\% \\times \\$6\\text{M} = \\$240,000$) as an initial cash outflow at time $t=0$.",
          C: "Amortizing the flotation cost over the operating life of the machine as a non-cash expense."
        },
        correctOption: "B",
        algebraicSolution: "\\text{CFA Institute Recommended Flotation Cost Rule:} \\newline \\text{Flotation costs are a lump-sum financing cost paid at inception.} \\newline CF_0 = -(\\text{CapEx Outlay} + \\text{Equity Flotation Cost}) = -(\\$10,000,000 + 0.04 \\times \\$6,000,000) = -\\$10,240,000 \\newline \\text{Adjusting WACC upward improperly penalizes long-term perpetual project cash flows.}",
        calculatorKeystrokes: "10000000 [+] [(] 0.60 [\\times] 10000000 [\\times] 0.04 [)] [=] => 10,240,000",
        trapCategory: "WACC Rate Adjustment vs Cash Flow Outlay Treatment",
        distractorAutopsy: {
          A: "Incorrect. Adjusting the discount rate upward overstates the cost of flotation across all future cash flows and biases NPV against longer-lived projects.",
          B: "Correct. Flotation costs represent a one-time cash outflow at project inception ($t=0$). The equity portion is $\$6\text{M}$, so flotation cost is $\$240,000$, added directly to $CF_0$.",
          C: "Incorrect. Flotation costs cannot be amortized as an operating expense under standard capital budgeting methodology."
        }
      }
    ]
  },
  {
    id: "vignette-10-derivatives",
    topicId: "10",
    topicName: "Derivatives",
    subReading: "Put-Call Parity & Synthetic Asset Replication",
    difficulty: "High Trap",
    vignetteStem: "A derivatives arbitrage trader at Jane Street monitors 6-month European options on Nova Corp stock. Nova Corp currently trades at $S_0 = \\$65.00$ and does not pay dividends. A 6-month European call option with a strike price of $X = \\$60.00$ trades at $C = \\$8.50$. The continuously compounded risk-free rate is 4.00% (or discretely 4.00% annual, $PV(X) = 60 / (1.04)^{0.5} = \\$58.835$). The trader discovers that a 6-month European put option with the identical $60 strike trades in the market for $P = \\$1.80$.",
    questions: [
      {
        id: 1,
        stem: "Based on Put-Call Parity ($C + PV(X) = S + P$), the theoretical no-arbitrage price of the European put option is closest to:",
        options: {
          A: "$1.80",
          B: "$2.34",
          C: "$3.50"
        },
        correctOption: "B",
        algebraicSolution: "\\text{Put-Call Parity Formula: } C + \\frac{X}{(1+r)^T} = S + P \\newline \\text{Rearrange for Put Price } P: \\newline P = C + \\frac{X}{(1+r)^T} - S \\newline PV(X) = \\frac{60}{(1 + 0.04)^{0.5}} = \\frac{60}{1.01980} = \\$58.835 \\newline P = 8.50 + 58.835 - 65.00 = 67.335 - 65.00 = \\$2.335 \\approx \\$2.34",
        calculatorKeystrokes: "8.50 [+] [(] 60 [\\div] [(] 1.04 [\\sqrt{x}] [)] [)] [-] 65 [=] => 2.335",
        trapCategory: "Put-Call Parity Sign Reversal",
        distractorAutopsy: {
          A: "Incorrect. This is the market trading price of the put ($1.80), which represents an underpriced market mispricing rather than the theoretical parity price.",
          B: "Correct. Rearranging Put-Call Parity yields $P = C + PV(X) - S = 8.50 + 58.835 - 65.00 = \\$2.335 \\approx \\$2.34$.",
          C: "Incorrect. The candidate used undiscounted strike price $X = \\$60$: $8.50 + 60.00 - 65.00 = \\$3.50$, forgetting to discount the strike back to present value."
        }
      },
      {
        id: 2,
        stem: "To exploit the mispricing where the market put trades at $1.80 (below theoretical value $2.34), the trader should execute which of the following arbitrage transactions?",
        options: {
          A: "Buy market Put ($1.80), Buy Stock ($65), Short Call ($8.50), and Issue Zero-Coupon Bond.",
          B: "Buy market Put ($1.80), Buy Stock ($65), Short Call ($8.50), and Buy Zero-Coupon Bond.",
          C: "Sell market Put ($1.80), Short Stock ($65), Buy Call ($8.50), and Buy Zero-Coupon Bond."
        },
        correctOption: "A",
        algebraicSolution: "\\text{Arbitrage Rule: Buy Underpriced, Sell Overpriced.} \\newline \\text{Synthetic Put Value} = \\$2.34 > \\text{Market Put} = \\$1.80 \\implies \\text{Market Put is CHEAP, Synthetic Put is EXPENSIVE.} \\newline \\text{Action: } \\newline \\text{1. Buy Cheap Market Put } (+P) \\newline \\text{2. Sell Expensive Synthetic Put } (-[C + PV(X) - S]) = -C - PV(X) + S \\newline \\implies \\text{Buy Market Put, Buy Stock, Short Call, Borrow/Issue Bond } PV(X). \\newline \\text{Initial Cash Flow Arbitrage Profit: } \\newline +C - P - S + PV(X) = +8.50 - 1.80 - 65.00 + 58.835 = +\\$0.535 \\text{ risk-free profit per share.}",
        calculatorKeystrokes: "8.50 [-] 1.80 [-] 65.00 [+] 58.835 [=] => +0.535 Arbitrage Profit",
        trapCategory: "Arbitrage Direction: Synthetic vs Market Position Inversion",
        distractorAutopsy: {
          A: "Correct. Because the market put is underpriced ($1.80 < $2.34), the trader buys the market put and sells the synthetic put (Long Stock + Short Call + Borrow PV of Strike), locking in a guaranteed risk-free profit of $0.535 per share.",
          B: "Incorrect. Buying the zero-coupon bond means lending money rather than borrowing, which reverses the cash flow needed to finance the position.",
          C: "Incorrect. This strategy sells the underpriced put and buys the overpriced synthetic put, resulting in an immediate arbitrage loss."
        }
      }
    ]
  }
];

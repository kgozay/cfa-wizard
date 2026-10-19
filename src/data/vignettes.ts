import { VignetteSet } from "@/types/cfa";
import { TOPIC_01_QUANT } from "./bank/topic01";
import { TOPIC_02_ECONOMICS } from "./bank/topic02";
import { TOPIC_03_CORPORATE_FINANCE } from "./bank/topic03";
import { TOPIC_04_FSA } from "./bank/topic04";
import { TOPIC_05_EQUITY } from "./bank/topic05";
import { TOPIC_06_FIXED_INCOME } from "./bank/topic06";
import { TOPIC_07_DERIVATIVES } from "./bank/topic07";
import { TOPIC_08_ALTERNATIVES } from "./bank/topic08";
import { TOPIC_09_PORTFOLIO } from "./bank/topic09";
import { TOPIC_10_ETHICS } from "./bank/topic10";

/**
 * The authored bank, one set per topic. Every item is standalone: all the data
 * a question needs lives in its own stem, so it can be shown in drills, sprints,
 * mocks and review alike. The set stem is descriptive context only and must not
 * contain data (enforced by the integrity tests).
 */
export const CFA_VIGNETTES: VignetteSet[] = [
  {
    id: "vignette-01-quant",
    topicId: "01",
    topicName: "Quantitative Methods",
    subReading: "Rates & Returns, TVM, Statistics, Probability, Hypothesis Testing, Regression & Simulation",
    difficulty: "High Trap",
    vignetteStem: "An asset management analyst is converting quoted rates, valuing cash flow streams, summarising return distributions, and testing hypotheses about fund performance.",
    questions: TOPIC_01_QUANT,
  },
  {
    id: "vignette-02-econ",
    topicId: "02",
    topicName: "Economics",
    subReading: "Demand & Supply, Market Structures, Business Cycles, Monetary & Fiscal Policy, Trade & Currency Exchange Rates",
    difficulty: "Institutional",
    vignetteStem: "A global macro strategy desk is assessing demand elasticities, market structures, the business cycle, policy settings, trade flows and currency markets.",
    questions: TOPIC_02_ECONOMICS,
  },
  {
    id: "vignette-03-corpfin",
    topicId: "03",
    topicName: "Corporate Finance",
    subReading: "Governance, Capital Budgeting, Working Capital, Cost of Capital & Capital Structure",
    difficulty: "High Trap",
    vignetteStem: "A manufacturer's finance team is reviewing its governance arrangements, evaluating capital projects, managing liquidity, and estimating its cost of capital.",
    questions: TOPIC_03_CORPORATE_FINANCE,
  },
  {
    id: "vignette-04-fsa",
    topicId: "04",
    topicName: "Financial Statement Analysis",
    subReading: "Reporting Mechanics, Inventories, Long-Lived Assets, Taxes, Liabilities & Analysis",
    difficulty: "High Trap",
    vignetteStem: "An equity analyst is adjusting reported financial statements for accounting choices and comparing companies that report under IFRS and US GAAP.",
    questions: TOPIC_04_FSA,
  },
  {
    id: "vignette-05-equity",
    topicId: "05",
    topicName: "Equities",
    subReading: "Market Organization, Indices, Market Efficiency, Industry & Company Analysis, Valuation",
    difficulty: "High Trap",
    vignetteStem: "An equity research analyst is reviewing trading mechanics, index construction, market efficiency evidence and valuation models for a coverage universe.",
    questions: TOPIC_05_EQUITY,
  },
  {
    id: "vignette-06-fixedinc",
    topicId: "06",
    topicName: "Fixed Income",
    subReading: "Bond Features, Pricing, Yields & Spreads, Term Structure, Duration & Convexity, Credit & Securitization",
    difficulty: "Institutional",
    vignetteStem: "A fixed income portfolio manager is pricing bonds, measuring interest rate risk, and monitoring credit quality and securitized holdings.",
    questions: TOPIC_06_FIXED_INCOME,
  },
  {
    id: "vignette-07-deriv",
    topicId: "07",
    topicName: "Derivatives",
    subReading: "Derivative Markets, Forwards & Futures, Swaps, Options, Put-Call Parity & the Binomial Model",
    difficulty: "High Trap",
    vignetteStem: "A derivatives desk is pricing forwards, futures, swaps and options and checking quoted prices against no-arbitrage relationships.",
    questions: TOPIC_07_DERIVATIVES,
  },
  {
    id: "vignette-08-alts",
    topicId: "08",
    topicName: "Alternative Investments",
    subReading: "Hedge Funds, Private Capital, Real Estate & Infrastructure, Natural Resources & Digital Assets",
    difficulty: "High Trap",
    vignetteStem: "A family office is evaluating fee structures, valuation methods and risk characteristics across its alternative investment allocations.",
    questions: TOPIC_08_ALTERNATIVES,
  },
  {
    id: "vignette-09-port",
    topicId: "09",
    topicName: "Portfolio Construction",
    subReading: "Portfolio Risk & Return, CAPM, IPS & Planning, Behavioral Finance & Risk Management",
    difficulty: "High Trap",
    vignetteStem: "An endowment's investment team is drafting its policy statement, building efficient portfolios, evaluating managers and setting risk limits.",
    questions: TOPIC_09_PORTFOLIO,
  },
  {
    id: "vignette-10-ethics",
    topicId: "10",
    topicName: "Ethics",
    subReading: "Code of Ethics, Standards I–VII & GIPS",
    difficulty: "High Trap",
    vignetteStem: "Investment professionals at several firms face situations that test the CFA Institute Code of Ethics, the Standards of Professional Conduct and the GIPS standards.",
    questions: TOPIC_10_ETHICS,
  },
];

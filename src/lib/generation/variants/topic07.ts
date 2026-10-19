import { between, money, num, pct } from "../format";
import { numericVariant } from "./dsl";

const signedMoney = (x: number) => money(x, 2);

export const TOPIC_07_VARIANTS = [
  numericVariant({
    key: "der-put-call-parity",
    topicId: "07",
    losCode: "LOS 34.c",
    trap: "Put-Call Parity Directional Sign Trap",
    error: "FORMULA_SCALAR",
    inputs: (r) => ({ s: between(r, 60, 140, 1), call: between(r, 4, 14, 0.25), rate: between(r, 2, 6, 0.5) }),
    example: { s: 100, call: 8.5, rate: 5 },
    stem: (v) => `A non-dividend-paying stock trades at ${money(v.s, 2)}. A 1-year European call with a ${money(v.s)} strike trades at ${money(v.call, 2)} and the 1-year rate is ${pct(v.rate)} continuously compounded. By put-call parity, the 1-year European put with the same strike is closest to:`,
    answer: (v) => v.call + v.s * Math.exp(-v.rate / 100) - v.s,
    format: signedMoney,
    correctWhy: "p = c + PV(X) - S, discounting the strike continuously.",
    distractors: [
      { value: (v) => v.call + v.s / (1 + v.rate / 100) - v.s, why: "Discounts the strike with annual compounding." },
      { value: (v) => v.call, why: "Assumes an at-the-money put must equal the call." },
    ],
    solution: (v) => `PV(X) = ${num(v.s)} × e^(-${num(v.rate / 100, 3)}) = ${num(v.s * Math.exp(-v.rate / 100))}. p = ${num(v.call)} + ${num(v.s * Math.exp(-v.rate / 100))} - ${num(v.s)} = ${money(v.call + v.s * Math.exp(-v.rate / 100) - v.s, 2)}.`,
    keystrokes: () => "c [+] X × e^(-rT) [-] S [=]",
  }),
  numericVariant({
    key: "der-forward-continuous",
    topicId: "07",
    losCode: "LOS 33.a",
    trap: "Pricing & Valuation of Forward Commitments",
    error: "PERIODICITY_MISMATCH",
    inputs: (r) => ({ s: between(r, 20, 120, 1), rate: between(r, 2, 6, 0.5), t: 0.5 }),
    example: { s: 50, rate: 4, t: 0.5 },
    stem: (v) => `A non-dividend-paying stock trades at ${money(v.s, 2)}. The continuously compounded risk-free rate is ${pct(v.rate)}. The no-arbitrage 6-month forward price is closest to:`,
    answer: (v) => v.s * Math.exp((v.rate / 100) * v.t),
    format: signedMoney,
    correctWhy: "F = S × e^(rT) with T = 0.5.",
    distractors: [
      { value: (v) => v.s * Math.exp(v.rate / 100), why: "Compounds for a full year instead of six months." },
      { value: (v) => v.s, why: "Assumes the forward equals spot." },
    ],
    solution: (v) => `${num(v.s)} × e^(${num(v.rate / 100, 3)} × 0.5) = ${money(v.s * Math.exp((v.rate / 100) * v.t), 2)}.`,
    keystrokes: (v) => `${num((v.rate / 100) * v.t, 4)} [2nd][e^x] [×] ${v.s} [=]`,
  }),
  numericVariant({
    key: "der-forward-value-midlife",
    topicId: "07",
    losCode: "LOS 33.c",
    trap: "Pricing & Valuation of Forward Commitments",
    error: "FORMULA_SCALAR",
    inputs: (r) => {
      const f0 = between(r, 50, 150, 5);
      return { f0, st: f0 + between(r, 2, 15, 1), rate: between(r, 2, 6, 0.5), remaining: 0.75 };
    },
    example: { f0: 100, st: 110, rate: 4, remaining: 0.75 },
    stem: (v) => `Three months after a 1-year forward was set at ${money(v.f0, 2)}, the underlying trades at ${money(v.st, 2)}. The risk-free rate is ${pct(v.rate)} continuously compounded. The value of the long position is closest to:`,
    answer: (v) => v.st - v.f0 * Math.exp((-v.rate / 100) * v.remaining),
    format: signedMoney,
    correctWhy: "V = S_t - F_0 × e^(-r(T - t)).",
    distractors: [
      { value: (v) => v.st - v.f0, why: "Uses the undiscounted price difference." },
      { value: (v) => v.st * Math.exp((-v.rate / 100) * v.remaining) - v.f0, why: "Discounts the spot price instead of the forward price." },
    ],
    solution: (v) => `${num(v.st)} - ${num(v.f0)} × e^(-${num(v.rate / 100, 3)} × 0.75) = ${money(v.st - v.f0 * Math.exp((-v.rate / 100) * v.remaining), 2)}.`,
    keystrokes: () => "S [-] F0 × e^(-r(T - t)) [=]",
  }),
  numericVariant({
    key: "der-call-profit",
    topicId: "07",
    losCode: "LOS 34.a",
    trap: "Option Payoffs and Profits",
    error: "FORMULA_SCALAR",
    inputs: (r) => {
      const x = between(r, 30, 120, 5);
      const prem = between(r, 2, 8, 0.5);
      return { x, prem, st: x + prem + between(r, 1, 10, 0.5) };
    },
    example: { x: 80, prem: 6, st: 92 },
    stem: (v) => `An investor buys a European call with a ${money(v.x, 2)} strike for ${money(v.prem, 2)}. At expiration the stock is at ${money(v.st, 2)}. The net profit per share is closest to:`,
    answer: (v) => v.st - v.x - v.prem,
    format: signedMoney,
    correctWhy: "Profit = payoff - premium.",
    distractors: [
      { value: (v) => v.st - v.x, why: "Reports the payoff without deducting the premium." },
      { value: (v) => -v.prem, why: "Assumes the option expired out of the money." },
    ],
    solution: (v) => `Payoff = ${num(v.st)} - ${num(v.x)} = ${num(v.st - v.x)}; profit = ${money(v.st - v.x - v.prem, 2)}.`,
    keystrokes: () => "max(0, S - X) [-] premium [=]",
  }),
  numericVariant({
    key: "der-put-breakeven",
    topicId: "07",
    losCode: "LOS 34.b",
    trap: "Option Breakeven",
    error: "SIGN_INVERSION",
    inputs: (r) => ({ x: between(r, 20, 120, 5), prem: between(r, 1, 9, 0.5) }),
    example: { x: 50, prem: 4 },
    stem: (v) => `An investor buys a European put with a ${money(v.x, 2)} strike for ${money(v.prem, 2)}. The breakeven price at expiration is closest to:`,
    answer: (v) => v.x - v.prem,
    format: signedMoney,
    correctWhy: "Put breakeven = strike - premium.",
    distractors: [
      { value: (v) => v.x + v.prem, why: "Adds the premium, which is the call breakeven." },
      { value: (v) => v.x, why: "Ignores the premium." },
    ],
    solution: (v) => `${num(v.x)} - ${num(v.prem)} = ${money(v.x - v.prem, 2)}.`,
    keystrokes: () => "X [-] premium [=]",
  }),
  numericVariant({
    key: "der-forward-dividend",
    topicId: "07",
    losCode: "LOS 33.d",
    trap: "Pricing & Valuation of Forward Commitments",
    error: "FORMULA_SCALAR",
    inputs: (r) => ({ s: between(r, 40, 150, 5), d: between(r, 1, 4, 0.5), rate: between(r, 2, 6, 0.5) }),
    example: { s: 80, d: 2, rate: 5 },
    stem: (v) => `A stock trades at ${money(v.s, 2)} and will pay a ${money(v.d, 2)} dividend in 6 months. The risk-free rate is ${pct(v.rate, 1)} continuously compounded. The 1-year forward price is closest to:`,
    answer: (v) => (v.s - v.d * Math.exp((-v.rate / 100) * 0.5)) * Math.exp(v.rate / 100),
    format: signedMoney,
    correctWhy: "Subtracts the PV of the dividend from spot, then carries forward.",
    distractors: [
      { value: (v) => v.s * Math.exp(v.rate / 100), why: "Ignores the dividend." },
      { value: (v) => v.s - v.d, why: "Subtracts the dividend but never carries the net spot price forward." },
    ],
    solution: (v) => `PV(D) = ${num(v.d * Math.exp((-v.rate / 100) * 0.5), 4)}. F = (${num(v.s)} - PV(D)) × e^(${num(v.rate / 100, 3)}) = ${money((v.s - v.d * Math.exp((-v.rate / 100) * 0.5)) * Math.exp(v.rate / 100), 2)}.`,
    keystrokes: () => "(S [-] D × e^(-rt)) [×] e^(rT) [=]",
  }),
  numericVariant({
    key: "der-intrinsic-time-value",
    topicId: "07",
    losCode: "LOS 34.b",
    trap: "Valuation of Contingent Claims (Options)",
    error: "CONCEPTUAL_CONFUSION",
    inputs: (r) => {
      const x = between(r, 30, 100, 5);
      const iv = between(r, 1, 6, 1);
      return { x, s: x + iv, prem: iv + between(r, 1, 4, 1) };
    },
    example: { x: 60, s: 63, prem: 5 },
    stem: (v) => `A European call with a ${money(v.x, 2)} strike trades at ${money(v.prem, 2)} when the underlying is at ${money(v.s, 2)}. Its intrinsic value and time value are:`,
    answer: (v) => v.s - v.x,
    format: (x, v) => `Intrinsic Value = ${money(x, 2)}; Time Value = ${money(v.prem - x, 2)}`,
    correctWhy: "Intrinsic value = S - X; time value = premium - intrinsic value.",
    distractors: [
      { value: (v) => v.prem, text: (x) => `Intrinsic Value = ${money(x, 2)}; Time Value = $0.00`, why: "Treats the whole premium as intrinsic value." },
      { value: () => 0, text: (x, v) => `Intrinsic Value = ${money(x, 2)}; Time Value = ${money(v.prem, 2)}`, why: "Treats the option as out of the money." },
    ],
    solution: (v) => `Intrinsic = ${num(v.s)} - ${num(v.x)} = ${num(v.s - v.x)}; time value = ${num(v.prem)} - ${num(v.s - v.x)} = ${num(v.prem - v.s + v.x)}.`,
    keystrokes: () => "max(0, S - X); premium [-] intrinsic",
  }),
  numericVariant({
    key: "der-carry-cost",
    topicId: "07",
    losCode: "LOS 33.c",
    trap: "Cost of Carry (Storage Costs)",
    error: "SIGN_INVERSION",
    inputs: (r) => ({ s: between(r, 50, 200, 5), cost: between(r, 1, 6, 0.5), rate: between(r, 2, 7, 0.5) }),
    example: { s: 100, cost: 3, rate: 5 },
    stem: (v) => `A commodity trades at ${money(v.s)}. Storage costs of ${money(v.cost, 2)} are payable in 6 months and the annual risk-free rate is ${pct(v.rate, 1)} (annual compounding). The 1-year forward price is closest to:`,
    answer: (v) => (v.s + v.cost / Math.sqrt(1 + v.rate / 100)) * (1 + v.rate / 100),
    format: signedMoney,
    correctWhy: "Adds the PV of storage costs to spot, then carries forward at the risk-free rate.",
    distractors: [
      { value: (v) => v.s * (1 + v.rate / 100), why: "Ignores the storage cost." },
      { value: (v) => v.s * (1 + v.rate / 100) - v.cost * Math.sqrt(1 + v.rate / 100), why: "Treats storage as a benefit that lowers the forward price." },
    ],
    solution: (v) => `PV(cost) = ${num(v.cost / Math.sqrt(1 + v.rate / 100), 3)}. F = (${v.s} + PV) × ${num(1 + v.rate / 100, 3)} = ${money((v.s + v.cost / Math.sqrt(1 + v.rate / 100)) * (1 + v.rate / 100), 2)}.`,
    keystrokes: () => "(S [+] PV(costs)) [×] (1 + r) [=]",
  }),
  numericVariant({
    key: "der-fx-forward",
    topicId: "07",
    losCode: "LOS 33.d",
    trap: "FX Forward Pricing",
    error: "SIGN_INVERSION",
    inputs: (r) => ({ spot: between(r, 1.02, 1.3, 0.005), rUsd: between(r, 2, 6, 0.5), rEur: between(r, 0.5, 4, 0.5) }),
    example: { spot: 1.1, rUsd: 4, rEur: 2 },
    stem: (v) => `The spot USD/EUR rate is ${num(v.spot, 4)}. One-year rates are ${pct(v.rUsd, 1)} for dollars and ${pct(v.rEur, 1)} for euros (annual compounding). The 1-year forward rate (USD/EUR) is closest to:`,
    answer: (v) => (v.spot * (1 + v.rUsd / 100)) / (1 + v.rEur / 100),
    format: (x) => num(x, 4),
    correctWhy: "The price currency's (USD) rate goes in the numerator.",
    distractors: [
      { value: (v) => (v.spot * (1 + v.rEur / 100)) / (1 + v.rUsd / 100), why: "Inverts the interest rate ratio." },
      { value: (v) => v.spot * (1 + (v.rUsd - v.rEur) / 100), why: "Applies the rate differential linearly." },
    ],
    solution: (v) => `${num(v.spot, 4)} × ${num(1 + v.rUsd / 100, 3)} / ${num(1 + v.rEur / 100, 3)} = ${num((v.spot * (1 + v.rUsd / 100)) / (1 + v.rEur / 100), 4)}.`,
    keystrokes: () => "S [×] (1 + r_price) [÷] (1 + r_base) [=]",
  }),
  numericVariant({
    key: "der-fra-settlement",
    topicId: "07",
    losCode: "LOS 33.e",
    trap: "Forward Rate Agreements",
    error: "PERIODICITY_MISMATCH",
    inputs: (r) => {
      const fixed = between(r, 2, 6, 0.25);
      return { notional: between(r, 5, 50, 5), fixed, mrr: fixed + between(r, 0.25, 1.5, 0.25) };
    },
    example: { notional: 10, fixed: 4, mrr: 4.5 },
    stem: (v) => `A company is long a 3×6 FRA on ${money(v.notional * 1e6)} notional at ${pct(v.fixed)}. At expiration, 90-day MRR is ${pct(v.mrr)} (360-day year). The payment it receives at the start of the 90-day period is closest to:`,
    answer: (v) => (v.notional * 1e6 * ((v.mrr - v.fixed) / 100) * 0.25) / (1 + (v.mrr / 100) * 0.25),
    format: (x) => money(x),
    correctWhy: "Discounts the end-of-period interest difference at the realised rate.",
    distractors: [
      { value: (v) => v.notional * 1e6 * ((v.mrr - v.fixed) / 100) * 0.25, why: "Does not discount the settlement." },
      { value: (v) => v.notional * 1e6 * ((v.mrr - v.fixed) / 100), why: "Uses a full year of interest." },
    ],
    solution: (v) => `Difference = ${money(v.notional * 1e6 * ((v.mrr - v.fixed) / 100) * 0.25)}; discounted by ${num(1 + (v.mrr / 100) * 0.25, 5)}.`,
    keystrokes: () => "Notional × (MRR - fixed) × 90/360 [÷] (1 + MRR × 90/360) [=]",
  }),
  numericVariant({
    key: "der-forward-value",
    topicId: "07",
    losCode: "LOS 33.b",
    trap: "Pricing & Valuation of Forward Commitments",
    error: "FORMULA_SCALAR",
    inputs: (r) => {
      const f0 = between(r, 60, 140, 5);
      return { f0, s: f0 + between(r, 2, 10, 1), d: between(r, 1, 4, 0.5), rate: between(r, 2, 6, 0.5) };
    },
    example: { f0: 100, s: 105, d: 3, rate: 5 },
    stem: (v) => `Six months before expiration, a long forward on a stock has a forward price of ${money(v.f0)}. The stock trades at ${money(v.s)} and will pay a ${money(v.d)} dividend in 3 months. The risk-free rate is ${pct(v.rate, 1)} (continuous). The value of the long position is closest to:`,
    answer: (v) => v.s - v.d * Math.exp((-v.rate / 100) * 0.25) - v.f0 * Math.exp((-v.rate / 100) * 0.5),
    format: signedMoney,
    correctWhy: "Removes the PV of the dividend and discounts the forward price.",
    distractors: [
      { value: (v) => v.s - v.f0, why: "Ignores discounting and the dividend." },
      { value: (v) => v.s - v.f0 * Math.exp((-v.rate / 100) * 0.5), why: "Ignores the dividend the long does not receive." },
    ],
    solution: (v) => `${v.s} - ${v.d}e^(-${num((v.rate / 100) * 0.25, 4)}) - ${v.f0}e^(-${num((v.rate / 100) * 0.5, 4)}).`,
    keystrokes: () => "S [-] PV(D) [-] PV(F0) [=]",
  }),
  numericVariant({
    key: "der-call-lower-bound",
    topicId: "07",
    losCode: "LOS 34.c",
    trap: "Option Value Bounds",
    error: "FORMULA_SCALAR",
    inputs: (r) => {
      const x = between(r, 30, 100, 5);
      return { x, s: x + between(r, 1, 6, 1), rate: between(r, 2, 6, 0.5) };
    },
    example: { x: 50, s: 52, rate: 4 },
    stem: (v) => `A non-dividend-paying stock trades at ${money(v.s)}. A 6-month European call has a strike of ${money(v.x)} and the continuously compounded rate is ${pct(v.rate, 1)}. The lower bound on the call's value is closest to:`,
    answer: (v) => v.s - v.x * Math.exp((-v.rate / 100) * 0.5),
    format: signedMoney,
    correctWhy: "Lower bound = S - PV(X).",
    distractors: [
      { value: (v) => v.s - v.x, why: "Uses the undiscounted strike." },
      { value: () => 0, why: "Ignores that the call is in the money." },
    ],
    solution: (v) => `${v.s} - ${v.x}e^(-${num((v.rate / 100) * 0.5, 4)}) = ${money(v.s - v.x * Math.exp((-v.rate / 100) * 0.5), 2)}.`,
    keystrokes: () => "S [-] X × e^(-rT) [=]",
  }),
  numericVariant({
    key: "der-put-call-forward",
    topicId: "07",
    losCode: "LOS 34.e",
    trap: "Put-Call-Forward Parity",
    error: "FORMULA_SCALAR",
    inputs: (r) => {
      const x = between(r, 50, 150, 5);
      return { x, f: x + between(r, 1, 8, 1), call: between(r, 5, 12, 0.5), rate: between(r, 2, 6, 0.5) };
    },
    example: { x: 100, f: 105, call: 6, rate: 5 },
    stem: (v) => `A 1-year forward on a stock is priced at ${money(v.f)}. A 1-year European call with a ${money(v.x)} strike costs ${money(v.call, 2)} and the continuously compounded rate is ${pct(v.rate, 1)}. By put-call-forward parity, the put with the same strike is closest to:`,
    answer: (v) => v.call - (v.f - v.x) * Math.exp(-v.rate / 100),
    format: signedMoney,
    correctWhy: "p = c - PV(F - X).",
    distractors: [
      { value: (v) => v.call - (v.f - v.x), why: "Uses the undiscounted difference." },
      { value: (v) => v.call + (v.f - v.x) * Math.exp(-v.rate / 100), why: "Adds the discounted difference instead of subtracting it." },
    ],
    solution: (v) => `${num(v.call)} - (${v.f} - ${v.x})e^(-${num(v.rate / 100, 3)}) = ${money(v.call - (v.f - v.x) * Math.exp(-v.rate / 100), 2)}.`,
    keystrokes: () => "c [-] (F - X) × e^(-rT) [=]",
  }),
  numericVariant({
    key: "der-risk-neutral-prob",
    topicId: "07",
    losCode: "LOS 34.f",
    trap: "Binomial Option Valuation",
    error: "FORMULA_SCALAR",
    inputs: (r) => ({ s: 50, up: between(r, 56, 65, 1), down: between(r, 40, 46, 1), rate: between(r, 2, 6, 1) }),
    example: { s: 50, up: 60, down: 44, rate: 5 },
    stem: (v) => `In a one-period binomial model, a stock at $${v.s} can rise to $${v.up} or fall to $${v.down}. The risk-free rate for the period is ${v.rate}%. The risk-neutral probability of an up move is closest to:`,
    answer: (v) => (1 + v.rate / 100 - v.down / v.s) / (v.up / v.s - v.down / v.s),
    format: (x) => num(x, 3),
    correctWhy: "π = (1 + r - d) / (u - d).",
    distractors: [
      { value: () => 0.5, why: "Assumes equal up and down probabilities." },
      { value: (v) => 1 - (1 + v.rate / 100 - v.down / v.s) / (v.up / v.s - v.down / v.s), why: "Reports the probability of a down move." },
    ],
    solution: (v) => `u = ${num(v.up / v.s, 3)}, d = ${num(v.down / v.s, 3)}. π = (${num(1 + v.rate / 100, 3)} - ${num(v.down / v.s, 3)}) / (${num(v.up / v.s, 3)} - ${num(v.down / v.s, 3)}).`,
    keystrokes: () => "(1 + r [-] d) [÷] (u [-] d) [=]",
  }),
  numericVariant({
    key: "der-binomial-call",
    topicId: "07",
    losCode: "LOS 34.f",
    trap: "Binomial Option Valuation",
    error: "PERIODICITY_MISMATCH",
    inputs: (r) => {
      const up = between(r, 56, 65, 1);
      return { s: 50, up, down: between(r, 40, 46, 1), rate: between(r, 2, 6, 1), x: between(r, 50, up - 2, 1) };
    },
    example: { s: 50, up: 60, down: 44, rate: 5, x: 52 },
    stem: (v) => `A stock at $${v.s} can rise to $${v.up} or fall to $${v.down} in one period; the risk-free rate is ${v.rate}% per period. The value of a one-period European call with a $${v.x} strike is closest to:`,
    answer: (v) => (((1 + v.rate / 100 - v.down / v.s) / (v.up / v.s - v.down / v.s)) * (v.up - v.x)) / (1 + v.rate / 100),
    format: signedMoney,
    correctWhy: "Discounts the risk-neutral expected payoff at the risk-free rate.",
    distractors: [
      { value: (v) => ((1 + v.rate / 100 - v.down / v.s) / (v.up / v.s - v.down / v.s)) * (v.up - v.x), why: "Does not discount the expected payoff." },
      { value: (v) => 0.5 * (v.up - v.x), why: "Weights outcomes 50/50 and does not discount." },
    ],
    solution: (v) => `π = ${num((1 + v.rate / 100 - v.down / v.s) / (v.up / v.s - v.down / v.s), 4)}; payoffs ${v.up - v.x} and 0. c = π × ${v.up - v.x} / ${num(1 + v.rate / 100, 2)}.`,
    keystrokes: () => "π [×] up payoff [÷] (1 + r) [=]",
  }),
  numericVariant({
    key: "der-hedge-ratio",
    topicId: "07",
    losCode: "LOS 34.f",
    trap: "Binomial Hedge Ratio",
    error: "FORMULA_SCALAR",
    inputs: (r) => {
      const up = between(r, 56, 70, 1);
      return { up, down: between(r, 38, 46, 1), x: between(r, 50, up - 2, 1) };
    },
    example: { up: 60, down: 44, x: 52 },
    stem: (v) => `A stock can move to $${v.up} or $${v.down} in one period. A call with a $${v.x} strike pays $${v.up - v.x} or $0. The hedge ratio (shares per call) is closest to:`,
    answer: (v) => (v.up - v.x) / (v.up - v.down),
    format: (x) => num(x, 3),
    correctWhy: "Divides the spread in option payoffs by the spread in stock prices.",
    distractors: [
      { value: (v) => (v.up - v.x) / v.up, why: "Divides the up payoff by the up price." },
      { value: (v) => (v.up - v.down) / (v.up - v.x), why: "Inverts the ratio." },
    ],
    solution: (v) => `${v.up - v.x} / (${v.up} - ${v.down}) = ${num((v.up - v.x) / (v.up - v.down), 3)}.`,
    keystrokes: () => "(c+ [-] c-) [÷] (S+ [-] S-) [=]",
  }),
  numericVariant({
    key: "der-short-put-profit",
    topicId: "07",
    losCode: "LOS 34.b",
    trap: "Option Payoffs and Profits",
    error: "SIGN_INVERSION",
    inputs: (r) => {
      const x = between(r, 30, 100, 5);
      const prem = between(r, 1, 5, 0.5);
      return { x, prem, st: x - prem - between(r, 1, 6, 0.5) };
    },
    example: { x: 40, prem: 3, st: 35 },
    stem: (v) => `An investor writes a put with a ${money(v.x)} strike for a ${money(v.prem, 2)} premium. At expiration the stock is at ${money(v.st, 2)}. The writer's profit per share is closest to:`,
    answer: (v) => v.prem - (v.x - v.st),
    format: signedMoney,
    correctWhy: "Nets the premium received against the payoff owed.",
    distractors: [
      { value: (v) => v.prem, why: "Assumes the put expires worthless." },
      { value: (v) => -(v.x - v.st), why: "Ignores the premium received." },
    ],
    solution: (v) => `${num(v.prem)} - (${v.x} - ${num(v.st)}) = ${money(v.prem - (v.x - v.st), 2)}.`,
    keystrokes: () => "Premium [-] (X [-] S) [=]",
  }),
  numericVariant({
    key: "der-covered-call-max",
    topicId: "07",
    losCode: "LOS 34.e",
    trap: "Covered Call Payoff",
    error: "FORMULA_SCALAR",
    inputs: (r) => {
      const s = between(r, 30, 100, 5);
      return { s, x: s + between(r, 2, 10, 1), prem: between(r, 1, 4, 0.5) };
    },
    example: { s: 50, x: 55, prem: 2 },
    stem: (v) => `An investor buys a stock at ${money(v.s)} and sells a call with a ${money(v.x)} strike for ${money(v.prem, 2)}. The maximum profit per share at expiration is:`,
    answer: (v) => v.x - v.s + v.prem,
    format: signedMoney,
    correctWhy: "Gain up to the strike plus the premium received.",
    distractors: [
      { value: (v) => v.prem, why: "Counts only the premium." },
      { value: (v) => v.x - v.s, why: "Ignores the premium." },
    ],
    solution: (v) => `(${v.x} - ${v.s}) + ${num(v.prem)} = ${money(v.x - v.s + v.prem, 2)}.`,
    keystrokes: () => "(X [-] S0) [+] premium [=]",
  }),
  numericVariant({
    key: "der-protective-put-loss",
    topicId: "07",
    losCode: "LOS 34.e",
    trap: "Protective Put Payoff",
    error: "FORMULA_SCALAR",
    inputs: (r) => {
      const s = between(r, 30, 100, 5);
      return { s, x: s - between(r, 2, 10, 1), prem: between(r, 1, 5, 0.5) };
    },
    example: { s: 60, x: 55, prem: 3 },
    stem: (v) => `An investor buys a stock at ${money(v.s)} and a put with a ${money(v.x)} strike for ${money(v.prem, 2)}. The maximum loss per share at expiration is:`,
    answer: (v) => v.s - v.x + v.prem,
    format: signedMoney,
    correctWhy: "Gap between purchase price and strike plus the premium paid.",
    distractors: [
      { value: (v) => v.prem, why: "Counts only the premium." },
      { value: (v) => v.s + v.prem, why: "Is the total invested, which the put prevents from being lost." },
    ],
    solution: (v) => `(${v.s} - ${v.x}) + ${num(v.prem)} = ${money(v.s - v.x + v.prem, 2)}.`,
    keystrokes: () => "(S0 [-] X) [+] premium [=]",
  }),
  numericVariant({
    key: "der-swap-rate",
    topicId: "07",
    losCode: "LOS 33.g",
    trap: "Swap Pricing",
    error: "FORMULA_SCALAR",
    inputs: (r) => {
      const s1 = between(r, 1.5, 4, 0.5);
      const s2 = s1 + between(r, 0.25, 0.75, 0.25);
      return { s: [s1, s2, s2 + between(r, 0.25, 0.75, 0.25)] };
    },
    example: { s: [3, 3.5, 4] },
    stem: (v) => `Spot rates are ${pct(v.s[0], 1)} (1 year), ${pct(v.s[1], 1)} (2 years) and ${pct(v.s[2], 1)} (3 years), annual compounding. The fixed rate on a 3-year annual-pay swap is closest to:`,
    answer: (v) => {
      const dfs = v.s.map((s, i) => 1 / (1 + s / 100) ** (i + 1));
      return ((1 - dfs[2]) / dfs.reduce((a, b) => a + b, 0)) * 100;
    },
    format: (x) => pct(x),
    correctWhy: "Solves for the par rate: (1 - DF3) / ΣDF.",
    distractors: [
      { value: (v) => v.s.reduce((a, b) => a + b, 0) / 3, why: "Averages the spot rates." },
      { value: (v) => v.s[2], why: "Uses the 3-year spot rate, which exceeds the par rate on a rising curve." },
    ],
    solution: () => "DF_t = 1/(1 + S_t)^t; swap rate = (1 - DF3) / (DF1 + DF2 + DF3).",
    keystrokes: () => "(1 [-] DF3) [÷] (DF1 [+] DF2 [+] DF3) [=]",
  }),
  numericVariant({
    key: "der-variation-margin",
    topicId: "07",
    losCode: "LOS 32.b",
    trap: "Futures Margin Mechanics",
    error: "FORMULA_SCALAR",
    inputs: (r) => {
      const im = between(r, 4000, 8000, 500);
      return { units: 1000, f0: between(r, 40, 80, 1), drop: between(r, 2.5, 5, 0.25), deposit: im + between(r, 500, 2000, 500), im, mm: im * 0.75 };
    },
    example: { units: 1000, f0: 50, drop: 3.5, deposit: 7000, im: 6000, mm: 4500 },
    stem: (v) => `A trader buys one futures contract on ${v.units} units at ${money(v.f0, 2)} and deposits ${money(v.deposit)}. Initial margin is ${money(v.im)} and maintenance margin is ${money(v.mm)}. The futures price falls to ${money(v.f0 - v.drop, 2)}. The variation margin required is closest to:`,
    answer: (v) => Math.max(0, v.im - (v.deposit - v.units * v.drop)),
    format: (x) => money(x),
    correctWhy: "Restores the account to the initial margin once it falls below maintenance.",
    distractors: [
      { value: (v) => Math.max(0, v.mm - (v.deposit - v.units * v.drop)), why: "Restores the account only to the maintenance margin." },
      { value: (v) => v.units * v.drop, why: "Deposits the full loss, ignoring the excess margin in the account." },
    ],
    solution: (v) => `Balance = ${v.deposit} - ${v.units * v.drop} = ${v.deposit - v.units * v.drop}. Deposit = ${v.im} - ${v.deposit - v.units * v.drop}.`,
    keystrokes: () => "Initial margin [-] balance after loss [=]",
  }),
  numericVariant({
    key: "der-index-forward",
    topicId: "07",
    losCode: "LOS 33.c",
    trap: "Forward Pricing with a Dividend Yield",
    error: "SIGN_INVERSION",
    inputs: (r) => ({ s: between(r, 1000, 5000, 100), rate: between(r, 2, 6, 0.5), q: between(r, 1, 3, 0.5) }),
    example: { s: 2000, rate: 4, q: 2 },
    stem: (v) => `An equity index is at ${num(v.s, 0)}. Its continuous dividend yield is ${pct(v.q, 1)} and the continuous risk-free rate is ${pct(v.rate, 1)}. The 6-month forward price is closest to:`,
    answer: (v) => v.s * Math.exp(((v.rate - v.q) / 100) * 0.5),
    format: (x) => num(x),
    correctWhy: "Carries the index at the risk-free rate minus the dividend yield.",
    distractors: [
      { value: (v) => v.s * Math.exp((v.rate / 100) * 0.5), why: "Ignores the dividend yield." },
      { value: (v) => v.s * Math.exp(((v.rate + v.q) / 100) * 0.5), why: "Adds the dividend yield instead of subtracting it." },
    ],
    solution: (v) => `${num(v.s, 0)} × e^((${num(v.rate / 100, 3)} - ${num(v.q / 100, 3)}) × 0.5) = ${num(v.s * Math.exp(((v.rate - v.q) / 100) * 0.5))}.`,
    keystrokes: () => "S [×] e^((r - δ)T) [=]",
  }),
  numericVariant({
    key: "der-swap-payment",
    topicId: "07",
    losCode: "LOS 33.g",
    trap: "Swap Payoff Direction",
    error: "SIGN_INVERSION",
    inputs: (r) => {
      const fixed = between(r, 2.5, 6, 0.25);
      return { notional: between(r, 10, 100, 10), fixed, mrr: fixed - between(r, 0.25, 1.5, 0.25) };
    },
    example: { notional: 50, fixed: 4.5, mrr: 3.75 },
    stem: (v) => `A company pays fixed at ${pct(v.fixed)} and receives MRR on a ${money(v.notional)} million swap with semiannual payments (30/360). MRR for the period was ${pct(v.mrr)}. The net payment is closest to:`,
    answer: (v) => (v.notional * 1e6 * ((v.fixed - v.mrr) / 100)) / 2,
    format: (x) => `Company pays ${money(x)}`,
    correctWhy: "The fixed payer pays the net difference when fixed exceeds floating.",
    distractors: [
      { value: (v) => (v.notional * 1e6 * ((v.fixed - v.mrr) / 100)) / 2, text: (x) => `Company receives ${money(x)}`, why: "Reverses the direction of the net payment." },
      { value: (v) => v.notional * 1e6 * ((v.fixed - v.mrr) / 100), text: (x) => `Company pays ${money(x)}`, why: "Uses a full year of interest for a semiannual period." },
    ],
    solution: (v) => `${money(v.notional * 1e6)} × (${num(v.fixed)}% - ${num(v.mrr)}%) × 0.5 = ${money((v.notional * 1e6 * ((v.fixed - v.mrr) / 100)) / 2)}.`,
    keystrokes: () => "Notional [×] (fixed - floating) [×] 0.5 [=]",
  }),
  numericVariant({
    key: "der-put-call-parity-discrete",
    topicId: "07",
    losCode: "LOS 34.e",
    trap: "Put-Call Parity Directional Sign Trap",
    error: "FORMULA_SCALAR",
    inputs: (r) => {
      const x = between(r, 30, 100, 2);
      return { x, s: x + between(r, -4, 6, 1), put: between(r, 2, 8, 0.5), rate: between(r, 2, 6, 0.5) };
    },
    example: { x: 48, s: 50, put: 4, rate: 4 },
    stem: (v) => `A stock trades at ${money(v.s)}, a 1-year European put with a ${money(v.x)} strike costs ${money(v.put, 2)} and the 1-year rate is ${pct(v.rate, 1)} (annual compounding). By put-call parity, the 1-year call with the same strike should be priced closest to:`,
    answer: (v) => v.put + v.s - v.x / (1 + v.rate / 100),
    format: signedMoney,
    correctWhy: "c = p + S - PV(X).",
    distractors: [
      { value: (v) => v.put + v.s - v.x, why: "Uses the undiscounted strike." },
      { value: (v) => v.put - v.s + v.x / (1 + v.rate / 100), why: "Reverses the signs of the stock and strike terms." },
    ],
    solution: (v) => `${num(v.put)} + ${v.s} - ${v.x} / ${num(1 + v.rate / 100, 3)} = ${money(v.put + v.s - v.x / (1 + v.rate / 100), 2)}.`,
    keystrokes: () => "p [+] S [-] X [÷] (1 + r) [=]",
  }),
  numericVariant({
    key: "der-short-forward-payoff",
    topicId: "07",
    losCode: "LOS 32.c",
    trap: "Forward Payoffs",
    error: "SIGN_INVERSION",
    inputs: (r) => {
      const f = between(r, 50, 100, 1);
      return { units: between(r, 500, 5000, 500), f, st: f + between(r, 2, 12, 1) };
    },
    example: { units: 1000, f: 80, st: 86 },
    stem: (v) => `A trader is short a forward to sell ${v.units.toLocaleString("en-US")} barrels of oil at ${money(v.f)} per barrel. At expiration the spot price is ${money(v.st)}. The trader's payoff is closest to:`,
    answer: (v) => (v.f - v.st) * v.units,
    format: (x) => money(x),
    correctWhy: "The short loses when spot ends above the forward price.",
    distractors: [
      { value: (v) => (v.st - v.f) * v.units, why: "Is the long position's payoff." },
      { value: (v) => -v.st * v.units, why: "Treats the whole spot value as a loss." },
    ],
    solution: (v) => `(${v.f} - ${v.st}) × ${v.units} = ${money((v.f - v.st) * v.units)}.`,
    keystrokes: () => "(F [-] S_T) [×] quantity [=]",
  }),
  numericVariant({
    key: "der-long-put-profit",
    topicId: "07",
    losCode: "LOS 34.b",
    trap: "Option Payoffs and Profits",
    error: "FORMULA_SCALAR",
    inputs: (r) => {
      const x = between(r, 40, 120, 5);
      const prem = between(r, 2, 7, 0.5);
      return { x, prem, st: x - prem - between(r, 1, 10, 1) };
    },
    example: { x: 70, prem: 5, st: 58 },
    stem: (v) => `An investor buys a put with a ${money(v.x)} strike for ${money(v.prem, 2)}. At expiration the stock is at ${money(v.st, 2)}. The investor's profit per share is:`,
    answer: (v) => v.x - v.st - v.prem,
    format: signedMoney,
    correctWhy: "Subtracts the premium from the payoff.",
    distractors: [
      { value: (v) => v.x - v.st, why: "Reports the payoff without subtracting the premium." },
      { value: (v) => -v.prem, why: "Assumes the put expired worthless." },
    ],
    solution: (v) => `(${v.x} - ${num(v.st)}) - ${num(v.prem)} = ${money(v.x - v.st - v.prem, 2)}.`,
    keystrokes: () => "(X [-] S_T) [-] premium [=]",
  }),
  numericVariant({
    key: "der-binomial-put",
    topicId: "07",
    losCode: "LOS 34.f",
    trap: "Binomial Option Valuation",
    error: "FORMULA_SCALAR",
    inputs: (r) => {
      const down = between(r, 40, 46, 1);
      return { s: 50, up: between(r, 56, 65, 1), down, rate: between(r, 2, 6, 1), x: between(r, down + 2, 54, 1) };
    },
    example: { s: 50, up: 60, down: 44, rate: 5, x: 52 },
    stem: (v) => `A stock at $${v.s} can rise to $${v.up} or fall to $${v.down} in one period; the risk-free rate is ${v.rate}% per period. The value of a one-period European put with a $${v.x} strike is closest to:`,
    answer: (v) => ((1 - (1 + v.rate / 100 - v.down / v.s) / (v.up / v.s - v.down / v.s)) * (v.x - v.down)) / (1 + v.rate / 100),
    format: signedMoney,
    correctWhy: "Discounts the risk-neutral expected payoff.",
    distractors: [
      { value: (v) => (0.5 * (v.x - v.down)) / (1 + v.rate / 100), why: "Weights outcomes 50/50 instead of using risk-neutral probabilities." },
      { value: (v) => (1 - (1 + v.rate / 100 - v.down / v.s) / (v.up / v.s - v.down / v.s)) * (v.x - v.down), why: "Does not discount." },
    ],
    solution: (v) => `1 - π = ${num(1 - (1 + v.rate / 100 - v.down / v.s) / (v.up / v.s - v.down / v.s), 4)}; down payoff ${v.x - v.down}; discount at ${num(1 + v.rate / 100, 2)}.`,
    keystrokes: () => "(1 - π) [×] down payoff [÷] (1 + r) [=]",
  }),
];

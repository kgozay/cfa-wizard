import { between, money, num, pct, pick } from "../format";
import { numericVariant } from "./dsl";

/** "$4.4 million", "$10 million": up to two decimals, trailing zeros dropped. */
const millionsShort = (x: number) => `$${Number(num(x, 2))} million`;
const multiple = (x: number) => `${num(x)}x`;
const percentWhole = (x: number) => `${num(x, 0)}%`;

export const TOPIC_08_VARIANTS = [
  numericVariant({
    key: "alt-fees-net-of-management",
    topicId: "08",
    losCode: "LOS 38.c",
    trap: "Hedge Funds & Fee Calculations",
    error: "FORMULA_SCALAR",
    inputs: (r) => ({ invest: between(r, 5, 50, 1) * 1e6, gross: between(r, 8, 30, 0.5), mgmt: pick(r, [1, 1.5, 2]), incentive: pick(r, [15, 20]) }),
    example: { invest: 10_000_000, gross: 25, mgmt: 2, incentive: 20 },
    stem: (v) => `A hedge fund charges a ${num(v.mgmt, 1)}% management fee on beginning-of-year assets and a ${v.incentive}% incentive fee calculated net of the management fee, subject to a high-water mark of ${money(v.invest)}. An investor allocates ${money(v.invest)} at the start of the year, and the fund's gross value at year-end is ${money(v.invest * (1 + v.gross / 100))}. Total fees for the year are closest to:`,
    answer: (v) => {
      const fee = v.invest * (v.mgmt / 100);
      return fee + (v.incentive / 100) * (v.invest * (v.gross / 100) - fee);
    },
    format: (x) => money(x),
    correctWhy: "Deducts the management fee from the gain before computing the incentive fee, then adds both fees.",
    distractors: [
      { value: (v) => v.invest * (v.mgmt / 100) + (v.incentive / 100) * v.invest * (v.gross / 100), why: "Computes the incentive fee on the gain gross of the management fee." },
      { value: (v) => (v.incentive / 100) * v.invest * (v.gross / 100), why: "Reports only the gross incentive fee and leaves out the management fee." },
    ],
    solution: (v) => {
      const fee = v.invest * (v.mgmt / 100);
      const gain = v.invest * (v.gross / 100) - fee;
      return `Management fee = ${num(v.mgmt, 1)}% × ${money(v.invest)} = ${money(fee)}. Gain net of the management fee = ${money(gain)}. Incentive fee = ${v.incentive}% × ${money(gain)} = ${money((v.incentive / 100) * gain)}. Total = ${money(fee + (v.incentive / 100) * gain)}.`;
    },
    keystrokes: (v) => `${v.invest} [×] ${v.mgmt / 100} [=] -> (end value [-] fee [-] ${v.invest}) [×] ${v.incentive / 100} [+] fee [=]`,
  }),
  numericVariant({
    key: "alt-noi-cap-value",
    topicId: "08",
    losCode: "LOS 37.b",
    trap: "Real Estate & Infrastructure",
    error: "CONCEPTUAL_CONFUSION",
    inputs: (r) => {
      const pgi = between(r, 1, 3, 0.05) * 1e6;
      const vacancy = between(r, 3, 10, 1);
      const opex = Math.round((pgi * between(r, 0.25, 0.4, 0.01)) / 10_000) * 10_000;
      const noi = pgi * (1 - vacancy / 100) - opex;
      return { pgi, vacancy, opex, interest: Math.round((noi * between(r, 0.15, 0.35, 0.01)) / 10_000) * 10_000, cap: between(r, 5, 9, 0.25) };
    },
    example: { pgi: 1_800_000, vacancy: 5, opex: 610_000, interest: 300_000, cap: 6.5 },
    stem: (v) => `A commercial office building generates ${money(v.pgi)} in potential gross income, with ${v.vacancy}% vacancy/credit loss and ${money(v.opex)} in operating expenses (including property taxes and insurance, but excluding ${money(v.interest)} in mortgage interest). If market cap rate is ${pct(v.cap)}, estimated value is closest to:`,
    answer: (v) => (v.pgi * (1 - v.vacancy / 100) - v.opex) / (v.cap / 100),
    format: (x) => money(x),
    correctWhy: "NOI = effective gross income - operating expenses; value = NOI / cap rate.",
    distractors: [
      { value: (v) => (v.pgi * (1 - v.vacancy / 100) - v.opex - v.interest) / (v.cap / 100), why: "Subtracts mortgage interest, a financing cost that NOI excludes." },
      { value: (v) => (v.pgi - v.opex) / (v.cap / 100), why: "Ignores the vacancy and credit loss." },
    ],
    solution: (v) => {
      const egi = v.pgi * (1 - v.vacancy / 100);
      return `EGI = ${money(v.pgi)} × ${num(1 - v.vacancy / 100)} = ${money(egi)}. NOI = ${money(egi)} - ${money(v.opex)} = ${money(egi - v.opex)}. Value = ${money(egi - v.opex)} / ${num(v.cap / 100, 4)} = ${money((egi - v.opex) / (v.cap / 100))}.`;
    },
    keystrokes: (v) => `(${v.pgi} [×] ${num(1 - v.vacancy / 100)} [-] ${v.opex}) [÷] ${num(v.cap / 100, 4)} [=]`,
  }),
  numericVariant({
    key: "alt-gim",
    topicId: "08",
    losCode: "LOS 37.c",
    trap: "Real Estate & Infrastructure",
    error: "FORMULA_SCALAR",
    inputs: (r) => ({ income: between(r, 0.5, 4, 0.05) * 1e6, mult: pick(r, [6, 6.5, 7, 7.5, 8, 8.5, 9, 11, 12, 12.5, 13, 14]) }),
    example: { income: 1_500_000, mult: 8 },
    stem: (v) => `A commercial property sells for ${money(v.income * v.mult)} and generates annual gross income of ${money(v.income)}. The property's Gross Income Multiplier (GIM) is closest to:`,
    answer: (v) => v.mult,
    format: multiple,
    correctWhy: "GIM = price / gross income.",
    distractors: [
      { value: (v) => 100 / v.mult, why: "Turns the income yield (gross income / price, in percent) into a multiple." },
      { value: (v) => 1 / v.mult, text: (x) => `${num(x, 3)}x`, why: "Divides gross income by price, which is the income yield, not the multiplier." },
    ],
    solution: (v) => `GIM = ${money(v.income * v.mult)} / ${money(v.income)} = ${multiple(v.mult)}.`,
    keystrokes: (v) => `${v.income * v.mult} [÷] ${v.income} [=] ${num(v.mult)}`,
  }),
  numericVariant({
    key: "alt-soft-hurdle",
    topicId: "08",
    losCode: "LOS 38.a",
    trap: "Hedge Funds & Fee Calculations",
    error: "FORMULA_SCALAR",
    inputs: (r) => {
      const hurdle = between(r, 3, 8, 1);
      return { aum: between(r, 50, 500, 10), hurdle, ret: hurdle + between(r, 1, 12, 0.5), incentive: 20 };
    },
    example: { aum: 100, hurdle: 5, ret: 10, incentive: 20 },
    stem: (v) => `A hedge fund with $${v.aum} million of assets charges no management fee and a ${v.incentive}% incentive fee subject to a ${v.hurdle}% soft hurdle rate. The fund starts the year at its high-water mark and earns a ${num(v.ret, 1)}% return. The incentive fee for the year is closest to:`,
    answer: (v) => (v.incentive / 100) * (v.ret / 100) * v.aum * 1e6,
    format: (x) => money(x),
    correctWhy: (v) => `The ${num(v.ret, 1)}% return clears the ${v.hurdle}% soft hurdle, so the fee applies to the entire gain.`,
    distractors: [
      { value: (v) => (v.incentive / 100) * ((v.ret - v.hurdle) / 100) * v.aum * 1e6, why: "Applies a hard hurdle, charging the fee only on the return above the hurdle." },
      { value: () => 0, why: "Assumes the hurdle was not met; the return exceeds it." },
    ],
    solution: (v) => `Soft hurdle met, so fee = ${v.incentive}% × ${num(v.ret, 1)}% × $${v.aum} million = ${money((v.incentive / 100) * (v.ret / 100) * v.aum * 1e6)}.`,
    keystrokes: (v) => `${v.incentive / 100} [×] ${num((v.ret / 100) * v.aum * 1e6, 0)} [=]`,
  }),
  numericVariant({
    key: "alt-hwm",
    topicId: "08",
    losCode: "LOS 35.d",
    trap: "Hedge Funds & Fee Calculations",
    error: "FORMULA_SCALAR",
    inputs: (r) => {
      const start = between(r, 60, 300, 10);
      return { start, low: Math.round(start * (1 - between(r, 5, 30, 1) / 100)), end: start + between(r, 2, 30, 1), incentive: pick(r, [15, 20]) };
    },
    example: { start: 100, low: 90, end: 112, incentive: 20 },
    stem: (v) => `A hedge fund charges a ${v.incentive}% incentive fee (no management fee) subject to a high-water mark. An investor's $${v.start} million account falls to $${v.low} million in Year 1 and rises to $${v.end} million (before fees) in Year 2. The incentive fee for Year 2 is closest to:`,
    answer: (v) => (v.incentive / 100) * (v.end - v.start),
    format: millionsShort,
    correctWhy: "Charges the fee only on gains above the previous peak value.",
    distractors: [
      { value: (v) => (v.incentive / 100) * (v.end - v.low), why: (v) => `Charges the fee on the whole Year 2 gain from $${v.low} million, ignoring the high-water mark.` },
      { value: () => 0, why: "Assumes no fee because of the Year 1 loss; the fund is now above its high-water mark." },
    ],
    solution: (v) => `No fee is paid in Year 1. In Year 2 the fee applies only to value above the $${v.start} million high-water mark: ${v.incentive}% × (${v.end} - ${v.start}) = ${millionsShort((v.incentive / 100) * (v.end - v.start))}.`,
    keystrokes: (v) => `${v.incentive / 100} [×] (${v.end} [-] ${v.start}) [=]`,
  }),
  numericVariant({
    key: "alt-pe-committed-fee",
    topicId: "08",
    losCode: "LOS 35.d",
    trap: "Private Equity Fee Base",
    error: "READING_MISINTERPRETATION",
    inputs: (r) => {
      const committed = between(r, 200, 1000, 100);
      return { committed, called: Math.round((committed * between(r, 20, 80, 10)) / 100), rate: pick(r, [1.5, 2, 2.5]) };
    },
    example: { committed: 500, called: 200, rate: 2 },
    stem: (v) => `A private equity fund has $${v.committed} million of committed capital, of which $${v.called} million has been called. It charges a ${num(v.rate, 1)}% annual management fee on committed capital during the investment period. The annual management fee is closest to:`,
    answer: (v) => (v.rate / 100) * v.committed,
    format: millionsShort,
    correctWhy: "Applies the fee to committed capital, as the terms state.",
    distractors: [
      { value: (v) => (v.rate / 100) * v.called, why: "Applies the fee to called (invested) capital rather than committed capital." },
      { value: (v) => (v.rate / 100) * (v.committed + v.called), why: "Applies the fee to committed and called capital combined, double counting." },
    ],
    solution: (v) => `Fee = ${num(v.rate, 1)}% × committed capital = ${num(v.rate, 1)}% × ${v.committed} = ${millionsShort((v.rate / 100) * v.committed)}.`,
    keystrokes: (v) => `${v.rate / 100} [×] ${v.committed} [=]`,
  }),
  numericVariant({
    key: "alt-tvpi",
    topicId: "08",
    losCode: "LOS 35.e",
    trap: "Private Equity Performance Multiples",
    error: "FORMULA_SCALAR",
    inputs: (r) => {
      for (;;) {
        const paid = between(r, 50, 500, 10);
        const dist = Math.round(paid * between(r, 0.2, 1, 0.05));
        const nav = Math.round(paid * between(r, 0.3, 1.2, 0.05));
        if (num(dist / paid) !== num(nav / paid)) return { paid, dist, nav };
      }
    },
    example: { paid: 100, dist: 60, nav: 90 },
    stem: (v) => `A private equity fund's LPs have paid in $${v.paid} million. They have received distributions of $${v.dist} million, and the fund's remaining net asset value is $${v.nav} million. The total value to paid-in capital (TVPI) multiple is closest to:`,
    answer: (v) => (v.dist + v.nav) / v.paid,
    format: multiple,
    correctWhy: "Adds distributions and residual value, divided by paid-in capital.",
    distractors: [
      { value: (v) => v.dist / v.paid, why: "Is DPI, which ignores the remaining NAV." },
      { value: (v) => v.nav / v.paid, why: "Is RVPI, which ignores distributions already made." },
    ],
    solution: (v) => `TVPI = (${v.dist} + ${v.nav}) / ${v.paid} = ${multiple((v.dist + v.nav) / v.paid)}. DPI (${multiple(v.dist / v.paid)}) counts only realised distributions.`,
    keystrokes: (v) => `(${v.dist} [+] ${v.nav}) [÷] ${v.paid} [=]`,
  }),
  numericVariant({
    key: "alt-re-dcf",
    topicId: "08",
    losCode: "LOS 37.e",
    trap: "Real Estate DCF Valuation",
    error: "PERIODICITY_MISMATCH",
    inputs: (r) => {
      const cap = between(r, 5, 8, 0.25);
      return { noi1: between(r, 300, 900, 10) * 1000, step: between(r, 5, 20, 5) * 1000, cap, disc: cap + between(r, 0.5, 2.5, 0.25) };
    },
    example: { noi1: 500_000, step: 10_000, cap: 7, disc: 8 },
    stem: (v) => `A property's NOI is expected to be ${money(v.noi1)}, ${money(v.noi1 + v.step)} and ${money(v.noi1 + 2 * v.step)} in Years 1–3, and ${money(v.noi1 + 3 * v.step)} in Year 4. The analyst assumes a terminal cap rate of ${pct(v.cap)} applied to Year 4 NOI and a discount rate of ${pct(v.disc)}. The property's value is closest to:`,
    answer: (v) => {
      const d = 1 + v.disc / 100;
      const tv = (v.noi1 + 3 * v.step) / (v.cap / 100);
      return [0, 1, 2].reduce((sum, t) => sum + (v.noi1 + t * v.step) / Math.pow(d, t + 1), 0) + tv / Math.pow(d, 3);
    },
    format: (x) => money(x),
    correctWhy: "Discounts the NOI and the terminal value at the discount rate.",
    distractors: [
      { value: (v) => (v.noi1 + 3 * v.step) / (v.cap / 100), why: "Reports the undiscounted terminal value." },
      { value: (v) => v.noi1 / (v.disc / 100), why: "Capitalises Year 1 NOI at the discount rate, ignoring growth and the cap rate assumption." },
    ],
    solution: (v) => {
      const tv = (v.noi1 + 3 * v.step) / (v.cap / 100);
      return `Terminal value at t = 3 = ${money(v.noi1 + 3 * v.step)} / ${num(v.cap / 100, 4)} = ${money(tv)}. Value = PV of Years 1–3 NOI plus PV of the terminal value at ${pct(v.disc)}.`;
    },
    keystrokes: (v) => `[CF] C01 = ${v.noi1}, C02 = ${v.noi1 + v.step}, C03 = ${v.noi1 + 2 * v.step} + TV -> [NPV] I = ${v.disc}`,
  }),
  numericVariant({
    key: "alt-implied-cap-rate",
    topicId: "08",
    losCode: "LOS 37.e",
    trap: "Real Estate & Infrastructure",
    error: "FORMULA_SCALAR",
    inputs: (r) => {
      const price = between(r, 8, 60, 1);
      return { price, noi: Number((price * (between(r, 4, 9, 0.25) / 100)).toFixed(2)), growth: between(r, 1, 3, 0.5) };
    },
    example: { price: 16, noi: 1.2, growth: 2 },
    stem: (v) => `A comparable office building recently sold for $${v.price} million and generates net operating income of $${num(v.noi)} million, which is expected to grow at ${num(v.growth, 1)}% a year. The implied cap rate is closest to:`,
    answer: (v) => (v.noi / v.price) * 100,
    format: (x) => pct(x),
    correctWhy: "Divides current NOI by the transaction price.",
    distractors: [
      { value: (v) => (v.price / v.noi), why: "Inverts the ratio (value / NOI, as a percentage)." },
      { value: (v) => (v.noi / v.price) * 100 + v.growth, why: "Adds the growth rate to the cap rate, which gives a discount rate, not a cap rate." },
    ],
    solution: (v) => `Cap rate = NOI / value = ${num(v.noi)} / ${v.price} = ${pct((v.noi / v.price) * 100)}. Adding growth would give the discount rate.`,
    keystrokes: (v) => `${num(v.noi)} [÷] ${v.price} [=]`,
  }),
  numericVariant({
    key: "alt-levered-return",
    topicId: "08",
    losCode: "LOS 37.b",
    trap: "Leverage in Real Estate",
    error: "FORMULA_SCALAR",
    inputs: (r) => {
      const rate = between(r, 3, 7, 0.5);
      return { price: between(r, 0.5, 5, 0.1) * 1e6, ltv: between(r, 40, 80, 5), rate, total: rate + between(r, 1.5, 8, 0.5) };
    },
    example: { price: 1_000_000, ltv: 60, rate: 5, total: 10 },
    stem: (v) => `An investor buys a ${money(v.price)} property with ${money(v.price * (1 - v.ltv / 100))} of equity and a ${money(v.price * (v.ltv / 100))} loan at ${num(v.rate, 1)}% interest. In the first year, the property's total return (income and appreciation) is ${num(v.total, 1)}%. The investor's return on equity is closest to:`,
    answer: (v) => ((v.total / 100) * v.price - (v.rate / 100) * v.price * (v.ltv / 100)) / (v.price * (1 - v.ltv / 100)) * 100,
    format: (x) => pct(x),
    correctWhy: "Subtracts the interest cost and divides by the equity invested.",
    distractors: [
      { value: (v) => v.total, why: "Ignores leverage and reports the unlevered property return." },
      { value: (v) => ((v.total / 100) * v.price) / (v.price * (1 - v.ltv / 100)) * 100, why: "Divides the gross gain by equity and ignores the interest cost." },
    ],
    solution: (v) => {
      const gain = (v.total / 100) * v.price;
      const interest = (v.rate / 100) * v.price * (v.ltv / 100);
      const equity = v.price * (1 - v.ltv / 100);
      return `Property gain = ${money(gain)}. Interest = ${money(interest)}. Equity return = (${money(gain)} - ${money(interest)}) / ${money(equity)} = ${pct(((gain - interest) / equity) * 100)}.`;
    },
    keystrokes: () => "(gain [-] interest) [÷] equity [=]",
  }),
  numericVariant({
    key: "alt-roll-backwardation",
    topicId: "08",
    losCode: "LOS 38.f",
    trap: "Commodities & Futures Curves",
    error: "SIGN_INVERSION",
    inputs: (r) => {
      const expiring = between(r, 40, 120, 1);
      return { expiring, next: expiring - between(r, 1, 6, 0.5) };
    },
    example: { expiring: 52, next: 50 },
    stem: (v) => `A commodity futures curve is in backwardation: the expiring contract converges to ${money(v.expiring)} while the next contract trades at ${money(v.next, v.next % 1 ? 2 : 0)}. An investor rolling a long position from the expiring contract to the next one earns a roll return closest to:`,
    answer: (v) => ((v.expiring - v.next) / v.next) * 100,
    format: (x) => pct(x),
    correctWhy: "Rolling into a cheaper contract gives a positive roll return.",
    distractors: [
      { value: (v) => (-(v.expiring - v.next) / v.next) * 100, why: "Applies the contango sign; in backwardation the roll is positive." },
      { value: () => 0, why: "A sloped curve gives a non-zero roll return." },
    ],
    solution: (v) => `Roll return = (${v.expiring} - ${v.next}) / ${v.next} = ${pct(((v.expiring - v.next) / v.next) * 100)}.`,
    keystrokes: (v) => `(${v.expiring} [-] ${v.next}) [÷] ${v.next} [=]`,
  }),
  numericVariant({
    key: "alt-commodity-total-return",
    topicId: "08",
    losCode: "LOS 38.b",
    trap: "Commodities & Futures Curves",
    error: "SIGN_INVERSION",
    inputs: (r) => {
      for (;;) {
        const v = { spot: between(r, -4, 8, 0.5), roll: between(r, -4, -0.5, 0.5), collateral: between(r, 1, 5, 0.5) };
        if (v.roll + v.collateral !== 0) return v;
      }
    },
    example: { spot: 3, roll: -1.5, collateral: 4 },
    stem: (v) => `Over a year, a fully collateralised commodity futures position has a spot price return of ${pct(v.spot, 1)}, a roll return of ${pct(v.roll, 1)} and a collateral return of ${pct(v.collateral, 1)}. Its total return is closest to:`,
    answer: (v) => v.spot + v.roll + v.collateral,
    format: (x) => pct(x),
    correctWhy: "Adds all three components, including the negative roll return.",
    distractors: [
      { value: (v) => v.spot, why: "Counts only the spot price return." },
      { value: (v) => v.spot - v.roll + v.collateral, why: "Treats the negative roll return as positive." },
    ],
    solution: (v) => `Total return = ${pct(v.spot, 1)} + (${pct(v.roll, 1)}) + ${pct(v.collateral, 1)} = ${pct(v.spot + v.roll + v.collateral)}.`,
    keystrokes: (v) => `${v.spot} [+] ${v.roll} [+] ${v.collateral} [=]`,
  }),
  numericVariant({
    key: "alt-fund-of-funds-fees",
    topicId: "08",
    losCode: "LOS 35.d",
    trap: "Fund-of-Funds Fee Layers",
    error: "FORMULA_SCALAR",
    inputs: (r) => ({ gross: between(r, 10, 25, 0.5), mgmt: pick(r, [1.5, 2]) }),
    example: { gross: 15, mgmt: 2 },
    stem: (v) => `An underlying hedge fund earns a ${pct(v.gross, 1)} gross return and charges '${num(v.mgmt, 1).replace(".0", "")} and 20' (incentive fee net of the management fee). A fund of funds charges '1 and 10' on its return after the underlying fees (also net of its management fee). The fund-of-funds investor's net return is closest to:`,
    answer: (v) => ((v.gross - v.mgmt) * 0.8 - 1) * 0.9,
    format: (x) => pct(x),
    correctWhy: "Applies both layers of management and incentive fees.",
    distractors: [
      { value: (v) => (v.gross - v.mgmt) * 0.8, why: "Stops after the underlying fund's fees and ignores the second fee layer." },
      { value: (v) => v.gross - v.mgmt - 0.2 * v.gross - 1, why: "Subtracts fees as flat percentages of the gross return and drops the second incentive fee." },
    ],
    solution: (v) => {
      const hf = (v.gross - v.mgmt) * 0.8;
      return `Hedge fund: ${pct(v.gross, 1)} - ${pct(v.mgmt, 1)} = ${pct(v.gross - v.mgmt)}; after the 20% incentive fee, net = ${pct(hf)}. Fund of funds: ${pct(hf)} - 1% = ${pct(hf - 1)}; after the 10% incentive fee, net = ${pct((hf - 1) * 0.9)}.`;
    },
    keystrokes: (v) => `${v.gross} [-] ${v.mgmt} [=] [×] 0.8 [=] [-] 1 [=] [×] 0.9 [=]`,
  }),
  numericVariant({
    key: "alt-net-exposure",
    topicId: "08",
    losCode: "LOS 38.c",
    trap: "Hedge Fund Exposure Measures",
    error: "FORMULA_SCALAR",
    inputs: (r) => ({ capital: between(r, 20, 500, 20), longPct: between(r, 100, 180, 5), shortPct: between(r, 20, 90, 5) }),
    example: { capital: 100, longPct: 130, shortPct: 70 },
    stem: (v) => `An equity long/short hedge fund with $${v.capital} million of capital holds $${(v.capital * v.longPct) / 100} million of long positions and $${(v.capital * v.shortPct) / 100} million of short positions. Its net exposure is closest to:`,
    answer: (v) => v.longPct - v.shortPct,
    format: percentWhole,
    correctWhy: "Subtracts shorts from longs and divides by capital.",
    distractors: [
      { value: (v) => v.longPct + v.shortPct, why: "Is gross exposure (long plus short)." },
      { value: (v) => v.longPct, why: "Counts only the long book." },
    ],
    solution: (v) => `Net exposure = (long - short) / capital = ${percentWhole(v.longPct - v.shortPct)}. Gross exposure is ${percentWhole(v.longPct + v.shortPct)}.`,
    keystrokes: (v) => `(${(v.capital * v.longPct) / 100} [-] ${(v.capital * v.shortPct) / 100}) [÷] ${v.capital} [=]`,
  }),
  numericVariant({
    key: "alt-vc-pre-money",
    topicId: "08",
    losCode: "LOS 36.d",
    trap: "Venture Capital Valuation",
    error: "FORMULA_SCALAR",
    inputs: (r) => ({ invest: between(r, 1, 20, 0.5) * 1e6, share: pick(r, [10, 15, 20, 25, 30, 40]) }),
    example: { invest: 4_000_000, share: 25 },
    stem: (v) => `A venture capital fund invests ${money(v.invest)} in a start-up in exchange for ${v.share}% of its shares after the investment. The start-up's pre-money valuation is closest to:`,
    answer: (v) => v.invest / (v.share / 100) - v.invest,
    format: (x) => money(x),
    correctWhy: "Subtracts the new money from the post-money valuation.",
    distractors: [
      { value: (v) => v.invest / (v.share / 100), why: "Is the post-money valuation, which includes the new investment." },
      { value: (v) => v.invest * (v.share / 100), why: "Multiplies the investment by the ownership share." },
    ],
    solution: (v) => `Post-money value = ${money(v.invest)} / ${num(v.share / 100)} = ${money(v.invest / (v.share / 100))}. Pre-money = post-money - investment = ${money(v.invest / (v.share / 100) - v.invest)}.`,
    keystrokes: (v) => `${v.invest} [÷] ${v.share / 100} [-] ${v.invest} [=]`,
  }),
  numericVariant({
    key: "alt-hard-hurdle",
    topicId: "08",
    losCode: "LOS 35.d",
    trap: "Hedge Funds & Fee Calculations",
    error: "FORMULA_SCALAR",
    inputs: (r) => {
      const hurdle = between(r, 3, 8, 1);
      return { aum: between(r, 50, 500, 10), hurdle, ret: hurdle + between(r, 1, 12, 0.5) };
    },
    example: { aum: 100, hurdle: 6, ret: 12 },
    stem: (v) => `A hedge fund with $${v.aum} million earns a ${num(v.ret, 1).replace(".0", "")}% return. There is no management fee, and the 20% incentive fee is subject to a ${v.hurdle}% hard hurdle. The incentive fee is closest to:`,
    answer: (v) => 0.2 * ((v.ret - v.hurdle) / 100) * v.aum,
    format: (x) => `$${num(x)} million`,
    correctWhy: "Charges the incentive fee only on the return above the hard hurdle.",
    distractors: [
      { value: (v) => 0.2 * (v.ret / 100) * v.aum, why: "Applies the fee to the whole return, which is the soft-hurdle treatment." },
      { value: () => 0, why: "The return exceeds the hurdle, so a fee is due." },
    ],
    solution: (v) => `With a hard hurdle, the fee applies only to the return above ${v.hurdle}%: 20% × (${num(v.ret, 1)}% - ${v.hurdle}%) × $${v.aum} million = $${num(0.2 * ((v.ret - v.hurdle) / 100) * v.aum)} million.`,
    keystrokes: (v) => `0.2 [×] ${num((v.ret - v.hurdle) / 100, 3)} [×] ${v.aum} [=]`,
  }),
  numericVariant({
    key: "alt-roll-contango",
    topicId: "08",
    losCode: "LOS 38.f",
    trap: "Commodities & Futures Curves",
    error: "SIGN_INVERSION",
    inputs: (r) => {
      const expiring = between(r, 40, 120, 1);
      return { expiring, next: expiring + between(r, 1, 6, 1) };
    },
    example: { expiring: 78, next: 80 },
    stem: (v) => `An investor rolls a long oil futures position. The expiring contract is sold at ${money(v.expiring)}, and the next contract is bought at ${money(v.next)}. The roll return for this roll is closest to:`,
    answer: (v) => ((v.expiring - v.next) / v.next) * 100,
    format: (x) => pct(x),
    correctWhy: "Selling low and buying high on the curve gives a negative roll return.",
    distractors: [
      { value: (v) => ((v.next - v.expiring) / v.next) * 100, why: "Gets the sign wrong; rolling into a more expensive contract loses." },
      { value: () => 0, why: "Ignores the difference between the two contract prices." },
    ],
    solution: (v) => `Roll return = (${v.expiring} - ${v.next}) / ${v.next} = ${pct(((v.expiring - v.next) / v.next) * 100)}. Contango produces a negative roll return.`,
    keystrokes: (v) => `(${v.expiring} [-] ${v.next}) [÷] ${v.next} [=]`,
  }),
  numericVariant({
    key: "alt-noi-build",
    topicId: "08",
    losCode: "LOS 37.e",
    trap: "Net Operating Income",
    error: "FORMULA_SCALAR",
    inputs: (r) => {
      const pgi = between(r, 1, 5, 0.05) * 1e6;
      return {
        pgi,
        vacancy: between(r, 3, 12, 1),
        other: between(r, 10, 150, 5) * 1000,
        opex: Math.round((pgi * between(r, 0.3, 0.45, 0.01)) / 10_000) * 10_000,
        debt: Math.round((pgi * between(r, 0.1, 0.2, 0.01)) / 10_000) * 10_000,
      };
    },
    example: { pgi: 2_400_000, vacancy: 8, other: 50_000, opex: 900_000, debt: 400_000 },
    stem: (v) => `A property has potential gross rental income of ${money(v.pgi)}, a vacancy and collection loss of ${v.vacancy}%, other income of ${money(v.other)} and operating expenses of ${money(v.opex)}. Debt service is ${money(v.debt)}. Net operating income is closest to:`,
    answer: (v) => v.pgi * (1 - v.vacancy / 100) + v.other - v.opex,
    format: (x) => money(x),
    correctWhy: "Adjusts for vacancy, adds other income, and deducts operating expenses.",
    distractors: [
      { value: (v) => v.pgi * (1 - v.vacancy / 100) + v.other - v.opex - v.debt, why: "Subtracts debt service, which NOI excludes." },
      { value: (v) => v.pgi + v.other - v.opex, why: "Ignores the vacancy and collection loss." },
    ],
    solution: (v) => {
      const egi = v.pgi * (1 - v.vacancy / 100) + v.other;
      return `Effective gross income = ${money(v.pgi)} × ${num(1 - v.vacancy / 100)} + ${money(v.other)} = ${money(egi)}. NOI = ${money(egi)} - ${money(v.opex)} = ${money(egi - v.opex)}. Debt service is a financing cost and is excluded from NOI.`;
    },
    keystrokes: (v) => `${v.pgi} [×] ${num(1 - v.vacancy / 100)} [+] ${v.other} [-] ${v.opex} [=]`,
  }),
  numericVariant({
    key: "alt-lbo-moic",
    topicId: "08",
    losCode: "LOS 36.c",
    trap: "Leveraged Buyout Returns",
    error: "FORMULA_SCALAR",
    inputs: (r) => ({ ev: between(r, 100, 1000, 50), debtPct: between(r, 40, 70, 10), exitMult: between(r, 1.05, 1.6, 0.05) }),
    example: { ev: 250, debtPct: 60, exitMult: 1.2 },
    stem: (v) => {
      const debt = (v.ev * v.debtPct) / 100;
      return `A private equity fund buys a company for $${v.ev} million, funded with $${v.ev - debt} million of equity and $${debt} million of debt. Five years later it sells for $${Math.round(v.ev * v.exitMult)} million and repays the $${debt} million of debt (no debt was repaid earlier). The multiple on the equity invested is closest to:`;
    },
    answer: (v) => (Math.round(v.ev * v.exitMult) - (v.ev * v.debtPct) / 100) / (v.ev - (v.ev * v.debtPct) / 100),
    format: multiple,
    correctWhy: "Divides equity proceeds after repaying debt by the equity invested.",
    distractors: [
      { value: (v) => Math.round(v.ev * v.exitMult) / v.ev, why: "Is the unlevered multiple on the whole enterprise value." },
      { value: (v) => Math.round(v.ev * v.exitMult) / (v.ev - (v.ev * v.debtPct) / 100), why: "Divides the sale price by equity without repaying the debt." },
    ],
    solution: (v) => {
      const debt = (v.ev * v.debtPct) / 100;
      const exit = Math.round(v.ev * v.exitMult);
      return `Equity proceeds = ${exit} - ${debt} = ${exit - debt}. MOIC = ${exit - debt} / ${v.ev - debt} = ${multiple((exit - debt) / (v.ev - debt))}. The unlevered gain on the enterprise is only ${multiple(exit / v.ev)}.`;
    },
    keystrokes: () => "(exit value [-] debt) [÷] equity [=]",
  }),
];

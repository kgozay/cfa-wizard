import type { OptionKey } from "@/types/cfa";

/** Expected value(s) for each option, in the units the option displays. */
export type Expected = number | number[];
export type Verifier = () => Record<OptionKey, Expected>;

export const pct = (x: number) => x * 100;

/** Present value of an ordinary annuity. */
export const annuityPV = (pmt: number, r: number, n: number) => (pmt * (1 - Math.pow(1 + r, -n))) / r;

/** Future value of an ordinary annuity. */
export const annuityFV = (pmt: number, r: number, n: number) => (pmt * (Math.pow(1 + r, n) - 1)) / r;

/** Payment on an amortizing loan (end-of-period payments). */
export const annuityPMT = (pv: number, r: number, n: number) => (pv * r) / (1 - Math.pow(1 + r, -n));

/** Price of an option-free bond: coupon per period, yield per period, periods, face. */
export const bondPrice = (coupon: number, y: number, n: number, face = 1000) =>
  annuityPV(coupon, y, n) + face / Math.pow(1 + y, n);

/** Net present value with cash flows starting at t = 0. */
export const npv = (r: number, flows: number[]) => flows.reduce((sum, cf, t) => sum + cf / Math.pow(1 + r, t), 0);

/** Solves f(x) = 0 by bisection on [lo, hi]; f must change sign. */
export const solve = (f: (x: number) => number, lo: number, hi: number) => {
  let a = lo;
  let b = hi;
  const fa = f(a);
  for (let i = 0; i < 200; i++) {
    const m = (a + b) / 2;
    if (Math.sign(f(m)) === Math.sign(fa)) a = m;
    else b = m;
  }
  return (a + b) / 2;
};

export const irr = (flows: number[]) => solve((r) => npv(r, flows), -0.99, 10);

export const bondYield = (price: number, coupon: number, n: number, face = 1000) =>
  solve((y) => bondPrice(coupon, y, n, face) - price, 1e-9, 1);

/** Standard normal CDF (Abramowitz & Stegun 26.2.17, |error| < 7.5e-8). */
export const normCdf = (z: number) => {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989422804014327 * Math.exp((-z * z) / 2);
  const p =
    d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return z >= 0 ? 1 - p : p;
};

export const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

export const sampleVariance = (xs: number[]) => {
  const m = mean(xs);
  return xs.reduce((a, x) => a + (x - m) ** 2, 0) / (xs.length - 1);
};

/** Macaulay duration of an annual-pay bond, in years. */
export const macaulay = (coupon: number, y: number, n: number, face = 1000) => {
  const price = bondPrice(coupon, y, n, face);
  let weighted = 0;
  for (let t = 1; t <= n; t++) {
    const cf = coupon + (t === n ? face : 0);
    weighted += (t * cf) / Math.pow(1 + y, t);
  }
  return weighted / price;
};

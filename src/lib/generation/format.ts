/** Small formatting and sampling helpers shared by the question templates. */

export const pick = <T,>(rand: () => number, values: readonly T[]): T => values[Math.floor(rand() * values.length)];

/** A random value on a grid from min to max (inclusive) with the given step. */
export const between = (rand: () => number, min: number, max: number, step: number) => {
  const steps = Math.round((max - min) / step);
  return Number((min + Math.round(rand() * steps) * step).toFixed(6));
};

/** Rounds half away from zero, absorbing binary floating-point error (66.12499999… -> 66.13). */
const round = (value: number, decimals: number) => {
  const factor = Math.pow(10, decimals);
  return Math.round((Math.abs(value) * factor) * (1 + 1e-12)) / factor * Math.sign(value);
};

export const money = (value: number, decimals = 0) =>
  `${round(value, decimals) < 0 ? "-" : ""}$${Math.abs(round(value, decimals)).toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;

export const pct = (value: number, decimals = 2) => `${round(value, decimals).toFixed(decimals)}%`;

export const num = (value: number, decimals = 2) => round(value, decimals).toFixed(decimals);

export const millions = (value: number) => `${money(value, 1)} million`;

/** Thousands separators without a currency sign. */
export const int = (value: number) => Math.round(value).toLocaleString("en-US");

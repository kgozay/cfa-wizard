/**
 * Extracts the numbers a candidate sees in an answer option, e.g.
 * "$241,986" -> [241986], "t = 1.75; Fail to reject H_0" -> [1.75],
 * "-10.335%" -> [-10.335]. Subscripted symbols (H_0, S_2) and exponents
 * (%^2) are ignored so they are not mistaken for values.
 */
export interface DisplayedNumber {
  value: number;
  decimals: number;
}

export function extractDisplayedNumbers(text: string): DisplayedNumber[] {
  const cleaned = text
    .replace(/\b[A-Za-z]+_\{?[A-Za-z0-9]+\}?/g, " ")
    .replace(/\^\d+/g, " ");
  const pattern = /(^|[^\w.])([-−+]?)\$?(\d{1,3}(?:,\d{3})+|\d+)(\.\d+)?/g;
  const numbers: DisplayedNumber[] = [];
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(cleaned)) !== null) {
    const [, , sign, whole, fraction = ""] = match;
    const magnitude = Number(`${whole.replace(/,/g, "")}${fraction}`);
    numbers.push({
      value: sign === "-" || sign === "−" ? -magnitude : magnitude,
      decimals: fraction ? fraction.length - 1 : 0,
    });
  }
  return numbers;
}

/** True when `expected` rounds to the value displayed with its precision. */
export function matchesDisplayed(displayed: DisplayedNumber, expected: number): boolean {
  const tolerance = 0.5 * Math.pow(10, -displayed.decimals) + 1e-9 * Math.max(1, Math.abs(expected));
  return Math.abs(displayed.value - expected) <= tolerance;
}

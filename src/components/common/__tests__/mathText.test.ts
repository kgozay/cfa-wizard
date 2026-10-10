import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { FormattedMathText } from "../KaTeXRenderer";

const render = (text: string) => renderToStaticMarkup(React.createElement(FormattedMathText, { text }));

describe("FormattedMathText", () => {
  it("renders plain-text subscripts and superscripts", () => {
    const html = render("Test H_0: b_1 = 0 with σ_1 = 15% and R^2 = 0.70.");
    expect(html).toContain("H<sub");
    expect(html).toContain(">0</sub>");
    expect(html).toContain("σ<sub");
    expect(html).toContain("R<sup");
    expect(html).not.toContain("H_0");
  });

  it("keeps currency amounts as text", () => {
    const html = render("The payment is $50,000 and the price is $980.00.");
    expect(html).toContain("$50,000");
    expect(html).not.toContain("katex");
  });

  it("typesets bare LaTeX solutions instead of showing the source", () => {
    const html = render("R^2 = 1 - \\frac{150}{500} = 0.700");
    expect(html).toContain("katex");
    expect(html).toContain("mfrac");
  });
});

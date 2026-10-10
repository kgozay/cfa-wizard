"use client";

import React, { useMemo } from "react";
import katex from "katex";

interface KaTeXRendererProps {
  math: string;
  block?: boolean;
  className?: string;
}

export const KaTeXRenderer: React.FC<KaTeXRendererProps> = ({
  math,
  block = false,
  className = "",
}) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: block,
        throwOnError: false,
        output: "htmlAndMathml",
      });
    } catch {
      return `<span class="text-danger font-mono text-xs">${math}</span>`;
    }
  }, [math, block]);

  if (block) {
    return (
      <div
        className={`overflow-x-auto py-2.5 px-3 my-2 rounded bg-background border border-control text-foreground text-center select-all font-mono text-sm ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span
      className={`inline-block px-1 select-all ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

// Bare LaTeX (no $ delimiters) used by some generated solutions, e.g. "\\frac{a}{b} \\times c"
const BARE_LATEX_PATTERN = /\\(frac|times|left|right|text|newline|sqrt|approx|cdot|div|le|ge|neq)\b/;
// Plain-text notation: H_0, b_{1}, σ_1, x^2, (1.065)^-6
const SCRIPT_PATTERN = /([A-Za-z0-9)\]σμρβαΔ])(_|\^)(\{([^}]+)\}|(-?[A-Za-z0-9]+(?:\.[0-9]+)?))/g;

function renderPlainText(content: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  SCRIPT_PATTERN.lastIndex = 0;
  while ((match = SCRIPT_PATTERN.exec(content)) !== null) {
    const [, base, marker, , braced, bare] = match;
    // Leave identifiers like snake_case_words alone
    const script = braced ?? bare;
    if (marker === "_" && /^[a-z]{4,}$/.test(script)) continue;
    nodes.push(content.slice(lastIndex, match.index) + base);
    const Tag = marker === "_" ? "sub" : "sup";
    nodes.push(<Tag key={`${keyPrefix}-${match.index}`} className="text-[0.75em]">{script}</Tag>);
    lastIndex = SCRIPT_PATTERN.lastIndex;
  }
  nodes.push(content.slice(lastIndex));
  return nodes;
}

interface FormattedMathTextProps {
  text: string;
  className?: string;
}

/**
 * FormattedMathText parses mixed text containing inline LaTeX ($...$) and block LaTeX ($$...$$),
 * while intelligently preserving normal currency values ($500, $1,000, $980.00).
 */
export const FormattedMathText: React.FC<FormattedMathTextProps> = ({
  text,
  className = "",
}) => {
  const parts = useMemo(() => {
    if (!text) return [];

    // Only unescaped $ delimit math; "\\$" inside bare LaTeX is a literal dollar sign
    if (!/(^|[^\\])\$/.test(text) && BARE_LATEX_PATTERN.test(text)) {
      return text
        .split("\\newline")
        .map((line) => ({ type: "block-math" as const, content: line.trim() }))
        .filter((line) => line.content.length > 0);
    }

    // Regex explanation:
    // 1. Matches $$...$$ for display math
    // 2. Matches $...$ for inline math where the content inside is not just a currency figure (e.g. not $500 or $1,000)
    // Matches $...$ that contains math expressions
    const regex = /(\$\$[\s\S]+?\$\$|\$(?!\d+(?:[.,]\d+)*(?:\s|\b|$))[^$\n]+?\$)/g;

    const result: Array<{ type: "text" | "inline-math" | "block-math"; content: string }> = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      // Push preceding normal text if any
      if (match.index > lastIndex) {
        result.push({
          type: "text",
          content: text.slice(lastIndex, match.index),
        });
      }

      const matchText = match[0];
      if (matchText.startsWith("$$") && matchText.endsWith("$$")) {
        result.push({
          type: "block-math",
          content: matchText.slice(2, -2).trim(),
        });
      } else if (matchText.startsWith("$") && matchText.endsWith("$")) {
        result.push({
          type: "inline-math",
          content: matchText.slice(1, -1).trim(),
        });
      }

      lastIndex = regex.lastIndex;
    }

    // Push remaining text
    if (lastIndex < text.length) {
      result.push({
        type: "text",
        content: text.slice(lastIndex),
      });
    }

    return result;
  }, [text]);

  return (
    <span className={`leading-relaxed ${className}`}>
      {parts.map((part, idx) => {
        if (part.type === "block-math") {
          return <KaTeXRenderer key={idx} math={part.content} block />;
        }
        if (part.type === "inline-math") {
          return (
            <KaTeXRenderer
              key={idx}
              math={part.content}
              block={false}
              className="align-middle inline-flex items-center text-foreground font-normal"
            />
          );
        }
        return <React.Fragment key={idx}>{renderPlainText(part.content, String(idx))}</React.Fragment>;
      })}
    </span>
  );
};

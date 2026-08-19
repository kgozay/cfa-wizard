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
      return `<span class="text-red-400 font-mono text-xs">${math}</span>`;
    }
  }, [math, block]);

  if (block) {
    return (
      <div
        className={`overflow-x-auto py-2.5 px-3 my-2 rounded bg-[#09090B] border border-[#1F1F23] text-editorial-white text-center select-all font-mono text-sm ${className}`}
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
              className="align-middle inline-flex items-center text-zinc-100 font-normal"
            />
          );
        }
        return <React.Fragment key={idx}>{part.content}</React.Fragment>;
      })}
    </span>
  );
};

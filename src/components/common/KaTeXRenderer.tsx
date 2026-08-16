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

"use client";

import React from "react";

interface KeystrokeBadgeProps {
  label: string;
  variant?: "primary" | "secondary" | "compute" | "tvm" | "value" | "result";
  onClick?: () => void;
  className?: string;
}

export const KeystrokeBadge: React.FC<KeystrokeBadgeProps> = ({
  label,
  variant = "primary",
  onClick,
  className = "",
}) => {
  const getStyle = () => {
    switch (variant) {
      case "secondary": // [2nd]
        return "bg-[#EAB308]/20 border-[#EAB308]/50 text-[#FACC15] hover:bg-[#EAB308]/30 shadow-[0_0_8px_rgba(234,179,8,0.15)]";
      case "compute": // [CPT]
        return "bg-brand-lime/20 border-brand-lime/50 text-brand-lime hover:bg-brand-lime/30 shadow-[0_0_10px_rgba(216,255,62,0.2)]";
      case "tvm": // N, I/Y, PV, PMT, FV
        return "bg-[#18181B] border-[#3F3F46] text-[#E4E4E7] hover:border-brand-lime/40 hover:text-white";
      case "value":
        return "bg-[#0D0D0F] border-[#27272A] text-brand-lime font-mono";
      case "result":
        return "bg-brand-lime text-black font-bold border-brand-lime shadow-lime-sm";
      default:
        return "bg-[#121215] border-[#27272A] text-[#D4D4D8] hover:border-[#3F3F46]";
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`inline-flex items-center justify-center font-mono text-xs px-2.5 py-1 rounded-[4px] border transition-all duration-150 active:scale-95 select-none ${getStyle()} ${className}`}
    >
      {label}
    </button>
  );
};

export const KeystrokeSequence: React.FC<{ sequence: string; className?: string }> = ({
  sequence,
  className = "",
}) => {
  // Parse sequence string into segments
  const tokens = sequence.split("->").map((t) => t.trim());

  return (
    <div className={`flex flex-wrap items-center gap-1.5 font-mono text-xs ${className}`}>
      {tokens.map((token, idx) => {
        const isResult = token.includes("=>") || token.includes("Result");
        const isCompute = token.includes("[CPT]");
        const isSecond = token.includes("[2nd]");
        const isTVM = /\[(N|I\/Y|PV|PMT|FV|CF|NPV|IRR)\]|N\s*=|PV\s*=|PMT\s*=|FV\s*=|I\/Y\s*=/.test(token);

        let variant: "primary" | "secondary" | "compute" | "tvm" | "value" | "result" = "primary";
        if (isResult) variant = "result";
        else if (isCompute) variant = "compute";
        else if (isSecond) variant = "secondary";
        else if (isTVM) variant = "tvm";

        return (
          <React.Fragment key={idx}>
            <KeystrokeBadge label={token} variant={variant} />
            {idx < tokens.length - 1 && (
              <span className="text-editorial-dim text-[11px] px-0.5 select-none">→</span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

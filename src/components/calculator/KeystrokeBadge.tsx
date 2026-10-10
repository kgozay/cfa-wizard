"use client";

import React, { useState } from "react";
import { Check, Copy, Calculator } from "lucide-react";
import { useCFAStore } from "@/store/useCFAStore";
import { sound } from "@/components/common/SoundEffects";

interface KeystrokeBadgeProps {
  label: string;
  variant?: "primary" | "secondary" | "compute" | "tvm" | "worksheet" | "scientific" | "operator" | "value" | "result";
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
      case "secondary": // [2nd], [SET], [QUIT]
        return "bg-warning/20 border-warning/60 text-warning hover:bg-warning/30 shadow-[0_0_8px_rgba(234,179,8,0.2)] font-bold";
      case "compute": // [CPT], [ENTER]
        return "bg-accent/20 border-accent/60 text-accent hover:bg-accent/30 shadow-[0_0_10px_rgba(216,255,62,0.2)] font-bold";
      case "tvm": // [N], [I/Y], [PV], [PMT], [FV], [CLR TVM]
        return "bg-surface-raised border-control text-white hover:border-accent/50 font-bold";
      case "worksheet": // [ICONV], [CF], [NPV], [IRR], [DATA], [STAT], [BGN]
        return "bg-warning/10 border-warning/40 text-warning hover:bg-warning/20 font-bold";
      case "scientific": // [y^x], [√x], [x²], [1/x], [LN], [e^x], [STO], [RCL]
        return "bg-info/50 border-info/50 text-info hover:bg-info/50 font-bold";
      case "operator": // [×], [÷], [+], [-], [=], [+/-]
        return "bg-surface-raised border-control text-info hover:border-info/40 font-bold";
      case "result":
        return "bg-accent text-black font-semibold border-accent ";
      case "value":
        return "bg-background-elevated border-control text-foreground font-mono";
      default:
        return "bg-surface-interactive border-control text-muted-strong hover:border-control-boundary-hover";
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`inline-flex items-center justify-center font-mono text-[11px] sm:text-xs px-2 sm:px-2.5 py-1 rounded-[5px] border transition-all duration-150 active:scale-95 select-none ${getStyle()} ${className}`}
    >
      {label}
    </button>
  );
};

function sanitizeKeystrokeText(str: string): string {
  return str
    .replace(/\\times/g, "×")
    .replace(/\\div/g, "÷")
    .replace(/\\Delta/g, "Δ")
    .replace(/\\beta/g, "β")
    .replace(/\\sigma/g, "σ")
    .replace(/\\mu_0/g, "μ₀")
    .replace(/\\mu/g, "μ")
    .replace(/\\bar\{x\}/g, "x̄")
    .replace(/\\sqrt\{n\}/g, "√n")
    .replace(/\\sqrt/g, "√")
    .replace(/_\{([^}]+)\}/g, " ($1)")
    .replace(/_([A-Za-z0-9]+)/g, " ($1)")
    .replace(/\\/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseKeystrokes(raw: string): string[] {
  if (!raw) return [];
  
  // Clean raw LaTeX & escape artifacts first
  const sanitized = sanitizeKeystrokeText(raw);

  // If string contains explicit flow arrows (-> or =>)
  const segments = sanitized.split(/\s*->\s*|\s*=>\s*/);
  const tokens: string[] = [];

  for (const seg of segments) {
    const trimmedSeg = seg.trim();
    if (!trimmedSeg) continue;

    // Check if segment is a compound string of multiple bracketed keys like "[Bid (A/B)] [×] [Bid (B/C)] [=]" or "[2nd][ICONV]"
    const bracketMatches = trimmedSeg.match(/\[[^\]]+\]|[^\[\]\s]+(?:\s*=\s*[^\[\]\s]+)?/g);
    
    if (
      bracketMatches &&
      bracketMatches.length > 1 &&
      !trimmedSeg.toLowerCase().startsWith("input") &&
      !trimmedSeg.toLowerCase().startsWith("read") &&
      !trimmedSeg.toLowerCase().startsWith("subtract") &&
      !trimmedSeg.toLowerCase().startsWith("divide")
    ) {
      bracketMatches.forEach((b) => {
        const t = b.trim();
        if (t) tokens.push(t);
      });
    } else {
      tokens.push(trimmedSeg);
    }
  }

  return tokens;
}

export const KeystrokeSequence: React.FC<{ sequence: string; className?: string }> = ({
  sequence,
  className = "",
}) => {
  const { setCalculatorOpen, soundEnabled } = useCFAStore();
  const [copied, setCopied] = useState<boolean>(false);

  const tokens = parseKeystrokes(sequence);

  const handleCopy = () => {
    if (soundEnabled) sound.playKeyClick();
    const cleanText = tokens.join(" → ");
    navigator.clipboard.writeText(cleanText || sequence);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenCalculator = () => {
    if (soundEnabled) sound.playNodeSwitch();
    setCalculatorOpen(true);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Visual Step-by-Step Keystroke Badges */}
      <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
        {tokens.map((token, idx) => {
          const upper = token.toUpperCase();
          const isResult = token.includes("=>") || token.includes("Result") || (idx === tokens.length - 1 && /^[0-9.-]+%?$/.test(token.trim()));
          const isCompute = upper.includes("[CPT]") || upper.includes("[ENTER]") || upper.includes("CPT") || upper.includes("ENTER");
          const isSecond = upper.includes("[2ND]") || upper.includes("2ND") || upper.includes("[SET]") || upper.includes("[QUIT]");
          const isTVM = /\[(N|I\/Y|PV|PMT|FV|CLR TVM|P\/Y|C\/Y)\]|^[NIPFV]\s*=|I\/Y\s*=|PMT\s*=|CLR TVM/.test(upper);
          const isWorksheet = /\[(ICONV|CF|NPV|IRR|DATA|STAT|BGN|1-V|AMORT)\]|NOM\s*=|C01\s*=|CF0\s*=|C\/Y\s*=/.test(upper);
          const isSci = /\[(Y\^X|√X|X²|X\^2|1\/X|LN|E\^X|STO|RCL|MOD)\]|\^|√|STO|RCL/.test(upper);
          const isOp = /^\[?([+×÷\-=]|[-+]|\/\-)\]?$/.test(token) || token === "×" || token === "÷" || token === "+" || token === "-" || token === "=";

          let variant: "primary" | "secondary" | "compute" | "tvm" | "worksheet" | "scientific" | "operator" | "value" | "result" = "value";
          if (isResult) variant = "result";
          else if (isCompute) variant = "compute";
          else if (isSecond) variant = "secondary";
          else if (isTVM) variant = "tvm";
          else if (isWorksheet) variant = "worksheet";
          else if (isSci) variant = "scientific";
          else if (isOp) variant = "operator";

          return (
            <React.Fragment key={idx}>
              <KeystrokeBadge label={token} variant={variant} />
              {idx < tokens.length - 1 && (
                <span className="text-muted text-[11px] px-0.5 select-none font-bold">→</span>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Quick Action Dock */}
      <div className="flex items-center gap-3 pt-1 font-mono text-[10px] text-muted">
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
          title="Copy exact step-by-step keystroke path"
        >
          {copied ? <Check className="w-3 h-3 text-accent" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? "COPIED" : "COPY PATH"}</span>
        </button>

        <span className="text-muted">|</span>

        <button
          type="button"
          onClick={handleOpenCalculator}
          className="flex items-center gap-1 text-warning hover:text-white transition-colors cursor-pointer font-bold"
          title="Open Texas Instruments BA II Plus Emulator (Layered z-70)"
        >
          <Calculator className="w-3 h-3" />
          <span>OPEN IN BA II+</span>
        </button>
      </div>
    </div>
  );
};

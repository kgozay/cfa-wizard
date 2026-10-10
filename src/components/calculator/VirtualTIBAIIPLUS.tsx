"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, Cpu, Minimize2, Maximize2, PanelRight } from "lucide-react";
import { useCFAStore } from "@/store/useCFAStore";
import { sound } from "@/components/common/SoundEffects";

export const VirtualTIBAIIPLUS: React.FC = () => {
  const { isCalculatorOpen, setCalculatorOpen, calculatorMode, setCalculatorMode, soundEnabled } = useCFAStore();

  // LCD Display State
  const [displayValue, setDisplayValue] = useState<string>("0.0000");
  const [activeSecondary, setActiveSecondary] = useState<boolean>(false);
  const [computeMode, setComputeMode] = useState<boolean>(false);
  const [isBgnMode, setIsBgnMode] = useState<boolean>(false);
  
  // Operator & Arithmetic State
  const [lastOperator, setLastOperator] = useState<string | null>(null);
  const [storedOperand, setStoredOperand] = useState<number | null>(null);
  const [waitingForNewInput, setWaitingForNewInput] = useState<boolean>(true);

  // Memory Registers (0-9)
  const [memoryRegisters, setMemoryRegisters] = useState<Record<number, number>>({
    0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0
  });
  const [pendingMemoryAction, setPendingMemoryAction] = useState<"STO" | "RCL" | null>(null);

  // Parentheses evaluation stack
  const [parenStack, setParenStack] = useState<{ operand: number | null; operator: string | null }[]>([]);

  // TVM Registers
  const [tvmN, setTvmN] = useState<number>(0);
  const [tvmIY, setTvmIY] = useState<number>(0);
  const [tvmPV, setTvmPV] = useState<number>(0);
  const [tvmPMT, setTvmPMT] = useState<number>(0);
  const [tvmFV, setTvmFV] = useState<number>(0);

  // Status message in LCD subline
  const [statusLine, setStatusLine] = useState<string>("Ready");

  const playClick = useCallback(() => {
    if (soundEnabled) sound.playKeyClick();
  }, [soundEnabled]);

  const computeBasic = useCallback((a: number, b: number, op: string): number => {
    switch (op) {
      case "+": return a + b;
      case "-": return a - b;
      case "×": return a * b;
      case "÷": return b !== 0 ? a / b : NaN;
      case "^": 
      case "y^x": {
        if (a < 0 && !Number.isInteger(b)) return NaN;
        return Math.pow(a, b);
      }
      default: return b;
    }
  }, []);

  const handleDigit = useCallback((digit: string) => {
    playClick();

    // Check if we are waiting for a memory slot digit (0-9)
    if (pendingMemoryAction) {
      const slot = parseInt(digit, 10);
      if (!isNaN(slot) && slot >= 0 && slot <= 9) {
        if (pendingMemoryAction === "STO") {
          const currentVal = parseFloat(displayValue);
          setMemoryRegisters((prev) => ({ ...prev, [slot]: currentVal }));
          setStatusLine(`STORED IN MEMORY [M${slot}] = ${currentVal.toFixed(4)}`);
        } else if (pendingMemoryAction === "RCL") {
          const val = memoryRegisters[slot] ?? 0;
          setDisplayValue(val.toFixed(4));
          setStatusLine(`RECALLED FROM MEMORY [M${slot}] = ${val.toFixed(4)}`);
          setWaitingForNewInput(true);
        }
        setPendingMemoryAction(null);
        return;
      }
    }

    if (waitingForNewInput || displayValue === "0.0000" || displayValue === "0" || displayValue === "Error") {
      setDisplayValue(digit === "." ? "0." : digit);
      setWaitingForNewInput(false);
    } else {
      if (digit === "." && displayValue.includes(".")) return;
      setDisplayValue(displayValue + digit);
    }
  }, [displayValue, memoryRegisters, pendingMemoryAction, playClick, waitingForNewInput]);

  const handleClear = useCallback(() => {
    playClick();
    setDisplayValue("0.0000");
    setWaitingForNewInput(true);
    setComputeMode(false);
    setActiveSecondary(false);
    setPendingMemoryAction(null);
    setStoredOperand(null);
    setLastOperator(null);
    setParenStack([]);
    setStatusLine("DISPLAY & WORKINGS CLEARED");
  }, [playClick]);

  const handleClearTVM = useCallback(() => {
    playClick();
    setTvmN(0);
    setTvmIY(0);
    setTvmPV(0);
    setTvmPMT(0);
    setTvmFV(0);
    setActiveSecondary(false);
    setStatusLine("TVM REGISTERS RESET (0.00)");
  }, [playClick]);

  const handleToggleBGN = useCallback(() => {
    playClick();
    setIsBgnMode((prev) => !prev);
    setActiveSecondary(false);
    setStatusLine(!isBgnMode ? "MODE: [BGN] ANNUITY DUE ACTIVE" : "MODE: [END] ORDINARY ANNUITY ACTIVE");
  }, [isBgnMode, playClick]);

  const handleToggleSign = useCallback(() => {
    playClick();
    const val = parseFloat(displayValue);
    if (!isNaN(val)) {
      setDisplayValue((-val).toString());
    }
  }, [displayValue, playClick]);

  // Scientific Unary Functions (√x, x^2, 1/x, LN, e^x, %)
  const handleUnaryOp = useCallback((op: "sqrt" | "sqr" | "recip" | "ln" | "exp" | "pct") => {
    playClick();
    const currentVal = parseFloat(displayValue);
    if (isNaN(currentVal)) return;

    let result = 0;
    let desc = "";

    switch (op) {
      case "sqrt":
        if (currentVal < 0) {
          setDisplayValue("Error");
          setStatusLine("ERROR: NEGATIVE ROOT (x >= 0 REQUIRED)");
          setWaitingForNewInput(true);
          return;
        }
        result = Math.sqrt(currentVal);
        desc = `√(${currentVal}) = ${result.toFixed(4)}`;
        break;
      case "sqr":
        result = Math.pow(currentVal, 2);
        desc = `(${currentVal})² = ${result.toFixed(4)}`;
        break;
      case "recip":
        if (currentVal === 0) {
          setDisplayValue("Error");
          setStatusLine("ERROR: DIVISION BY ZERO (1/0)");
          setWaitingForNewInput(true);
          return;
        }
        result = 1 / currentVal;
        desc = `1/(${currentVal}) = ${result.toFixed(4)}`;
        break;
      case "ln":
        if (currentVal <= 0) {
          setDisplayValue("Error");
          setStatusLine("ERROR: DOMAIN (ln(x) REQUIRES x > 0)");
          setWaitingForNewInput(true);
          return;
        }
        result = Math.log(currentVal);
        desc = `ln(${currentVal}) = ${result.toFixed(4)}`;
        break;
      case "exp":
        result = Math.exp(currentVal);
        desc = `e^(${currentVal}) = ${result.toFixed(4)}`;
        break;
      case "pct":
        result = currentVal / 100;
        desc = `${currentVal}% = ${result.toFixed(4)}`;
        break;
    }

    setDisplayValue(result.toFixed(4));
    setStatusLine(desc);
    setWaitingForNewInput(true);
  }, [displayValue, playClick]);

  // Binary operations (+, -, ×, ÷, y^x)
  const handleOperation = useCallback((op: string) => {
    playClick();
    const currentVal = parseFloat(displayValue);

    if (waitingForNewInput && storedOperand !== null) {
      setLastOperator(op);
      setStatusLine(`OP: ${op}`);
      return;
    }

    if (storedOperand === null) {
      setStoredOperand(currentVal);
      setStatusLine(`${currentVal.toFixed(4)} ${op}`);
    } else if (lastOperator) {
      const result = computeBasic(storedOperand, currentVal, lastOperator);
      if (isNaN(result) || !isFinite(result)) {
        setDisplayValue("Error");
        setStatusLine("MATH ERROR");
        setStoredOperand(null);
        setLastOperator(null);
        setWaitingForNewInput(true);
        return;
      }
      setStoredOperand(result);
      setDisplayValue(result.toFixed(4));
      setStatusLine(`${result.toFixed(4)} ${op}`);
    }
    setLastOperator(op);
    setWaitingForNewInput(true);
  }, [computeBasic, displayValue, lastOperator, playClick, storedOperand, waitingForNewInput]);

  const handleEquals = useCallback(() => {
    playClick();
    if (storedOperand !== null && lastOperator) {
      const currentVal = parseFloat(displayValue);
      const result = computeBasic(storedOperand, currentVal, lastOperator);
      if (isNaN(result) || !isFinite(result)) {
        setDisplayValue("Error");
        setStatusLine("MATH ERROR // DIVISION BY ZERO OR DOMAIN");
      } else {
        setDisplayValue(result.toFixed(4));
        setStatusLine(`EVAL: ${storedOperand.toFixed(4)} ${lastOperator} ${currentVal.toFixed(4)} = ${result.toFixed(4)}`);
      }
      setStoredOperand(null);
      setLastOperator(null);
      setWaitingForNewInput(true);
    }
  }, [computeBasic, displayValue, lastOperator, playClick, storedOperand]);

  // Parentheses grouping
  const handleOpenParen = useCallback(() => {
    playClick();
    setParenStack((prev) => [...prev, { operand: storedOperand, operator: lastOperator }]);
    setStoredOperand(null);
    setLastOperator(null);
    setWaitingForNewInput(true);
    setStatusLine(`OPEN PARENTHESIS (LEVEL ${parenStack.length + 1})`);
  }, [lastOperator, parenStack.length, playClick, storedOperand]);

  const handleCloseParen = useCallback(() => {
    playClick();
    if (parenStack.length === 0) return;

    let currentVal = parseFloat(displayValue);
    if (storedOperand !== null && lastOperator) {
      currentVal = computeBasic(storedOperand, currentVal, lastOperator);
    }

    const previousLevel = parenStack[parenStack.length - 1];
    setParenStack((prev) => prev.slice(0, prev.length - 1));

    if (previousLevel.operand !== null && previousLevel.operator) {
      const combined = computeBasic(previousLevel.operand, currentVal, previousLevel.operator);
      setStoredOperand(combined);
      setDisplayValue(combined.toFixed(4));
      setLastOperator(null);
      setStatusLine(`RESOLVED GROUP = ${combined.toFixed(4)}`);
    } else {
      setStoredOperand(currentVal);
      setDisplayValue(currentVal.toFixed(4));
      setLastOperator(null);
      setStatusLine(`RESOLVED GROUP = ${currentVal.toFixed(4)}`);
    }
    setWaitingForNewInput(true);
  }, [computeBasic, displayValue, lastOperator, parenStack, playClick, storedOperand]);

  // Memory Key Handling (STO / RCL)
  const handleMemoryKey = useCallback((type: "STO" | "RCL") => {
    playClick();
    setPendingMemoryAction(type);
    setStatusLine(`${type}: PRESS DIGIT [0-9] TO SELECT REGISTER`);
  }, [playClick]);

  // TVM Handling with BGN / END support & Newton-Raphson I/Y
  const handleTVMKey = useCallback((key: "N" | "I/Y" | "PV" | "PMT" | "FV") => {
    playClick();
    const currentVal = parseFloat(displayValue);

    if (computeMode) {
      setComputeMode(false);
      let computed = 0;
      const r = tvmIY / 100;
      const bgnMultiplier = isBgnMode ? (1 + r) : 1;

      switch (key) {
        case "PV": {
          if (r === 0) {
            computed = -(tvmPMT * tvmN + tvmFV);
          } else {
            const factor = Math.pow(1 + r, -tvmN);
            const pmtPV = tvmPMT * ((1 - factor) / r) * bgnMultiplier;
            const fvPV = tvmFV * factor;
            computed = -(pmtPV + fvPV);
          }
          setTvmPV(computed);
          setDisplayValue(computed.toFixed(4));
          setStatusLine(`CPT PV = ${computed.toFixed(4)} ${isBgnMode ? "[BGN]" : "[END]"}`);
          break;
        }
        case "FV": {
          if (r === 0) {
            computed = -(tvmPV + tvmPMT * tvmN);
          } else {
            const compound = Math.pow(1 + r, tvmN);
            const pmtFV = tvmPMT * ((compound - 1) / r) * bgnMultiplier;
            const pvFV = tvmPV * compound;
            computed = -(pvFV + pmtFV);
          }
          setTvmFV(computed);
          setDisplayValue(computed.toFixed(4));
          setStatusLine(`CPT FV = ${computed.toFixed(4)} ${isBgnMode ? "[BGN]" : "[END]"}`);
          break;
        }
        case "PMT": {
          if (r === 0) {
            computed = -(tvmPV + tvmFV) / (tvmN || 1);
          } else {
            const factor = Math.pow(1 + r, -tvmN);
            const denominator = ((1 - factor) / r) * bgnMultiplier;
            computed = denominator !== 0 ? -(tvmPV + tvmFV * factor) / denominator : 0;
          }
          setTvmPMT(computed);
          setDisplayValue(computed.toFixed(4));
          setStatusLine(`CPT PMT = ${computed.toFixed(4)} ${isBgnMode ? "[BGN]" : "[END]"}`);
          break;
        }
        case "N": {
          if (r === 0) {
            computed = tvmPMT !== 0 ? -(tvmPV + tvmFV) / tvmPMT : 0;
          } else {
            const adjPMT = tvmPMT * bgnMultiplier;
            const num = adjPMT - tvmFV * r;
            const den = adjPMT + tvmPV * r;
            if (num > 0 && den > 0 && Math.log(1 + r) !== 0) {
              computed = Math.log(num / den) / Math.log(1 + r);
            } else {
              computed = 0;
            }
          }
          setTvmN(computed);
          setDisplayValue(computed.toFixed(4));
          setStatusLine(`CPT N = ${computed.toFixed(4)}`);
          break;
        }
        case "I/Y": {
          // Newton-Raphson approximation for YTM / I/Y
          let rate = 0.06; // 6% initial guess
          for (let iter = 0; iter < 45; iter++) {
            const mult = isBgnMode ? (1 + rate) : 1;
            const factor = Math.pow(1 + rate, -tvmN);
            const pmtTerm = (rate === 0) ? tvmPMT * tvmN : tvmPMT * mult * ((1 - factor) / rate);
            const fvTerm = tvmFV * factor;
            const pvCalc = pmtTerm + fvTerm;
            const diff = pvCalc + tvmPV;
            if (Math.abs(diff) < 0.00001) break;
            
            const dRate = 0.0001;
            const factor2 = Math.pow(1 + rate + dRate, -tvmN);
            const mult2 = isBgnMode ? (1 + rate + dRate) : 1;
            const pmtTerm2 = tvmPMT * mult2 * ((1 - factor2) / (rate + dRate));
            const fvTerm2 = tvmFV * factor2;
            const pvCalc2 = pmtTerm2 + fvTerm2;
            const dPv = (pvCalc2 - pvCalc) / dRate;
            if (dPv === 0) break;
            rate = rate - diff / dPv;
          }
          const finalPercent = rate * 100;
          setTvmIY(finalPercent);
          setDisplayValue(finalPercent.toFixed(4));
          setStatusLine(`CPT I/Y = ${finalPercent.toFixed(4)}%`);
          break;
        }
      }
      setWaitingForNewInput(true);
    } else {
      switch (key) {
        case "N": setTvmN(currentVal); setStatusLine(`STORED: N = ${currentVal}`); break;
        case "I/Y": setTvmIY(currentVal); setStatusLine(`STORED: I/Y = ${currentVal}%`); break;
        case "PV": setTvmPV(currentVal); setStatusLine(`STORED: PV = ${currentVal}`); break;
        case "PMT": setTvmPMT(currentVal); setStatusLine(`STORED: PMT = ${currentVal}`); break;
        case "FV": setTvmFV(currentVal); setStatusLine(`STORED: FV = ${currentVal}`); break;
      }
      setWaitingForNewInput(true);
    }
  }, [computeMode, displayValue, isBgnMode, playClick, tvmFV, tvmIY, tvmN, tvmPMT, tvmPV]);

  // Keyboard shortcut listener for physical calculator typing
  useEffect(() => {
    if (!isCalculatorOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === "Escape") {
        setCalculatorOpen(false);
        return;
      }

      if (e.key >= "0" && e.key <= "9") {
        handleDigit(e.key);
      } else if (e.key === ".") {
        handleDigit(".");
      } else if (e.key === "+") {
        handleOperation("+");
      } else if (e.key === "-") {
        handleOperation("-");
      } else if (e.key === "*" || e.key === "x" || e.key === "X") {
        handleOperation("×");
      } else if (e.key === "/") {
        e.preventDefault();
        handleOperation("÷");
      } else if (e.key === "^") {
        handleOperation("^");
      } else if (e.key === "s" || e.key === "S") {
        handleUnaryOp("sqrt");
      } else if (e.key === "Enter" || e.key === "=") {
        e.preventDefault();
        handleEquals();
      } else if (e.key === "Backspace") {
        setDisplayValue((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
      } else if (e.key === "c" || e.key === "C") {
        handleClear();
      } else if (e.key === "(") {
        handleOpenParen();
      } else if (e.key === ")") {
        handleCloseParen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isCalculatorOpen,
    handleDigit,
    handleOperation,
    handleUnaryOp,
    handleEquals,
    handleClear,
    handleOpenParen,
    handleCloseParen,
    setCalculatorOpen,
  ]);

  if (!isCalculatorOpen || calculatorMode === "closed") return null;

  // Minimized Widget Pill
  if (calculatorMode === "minimized") {
    return (
      <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
        <button
          onClick={() => {
            playClick();
            setCalculatorMode("floating");
          }}
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-background-elevated border border-accent/40 hover:border-accent text-white font-mono text-xs shadow-2xl transition-all active:scale-95 group hover:"
        >
          <div className="w-5 h-5 rounded bg-accent/20 border border-accent/40 flex items-center justify-center text-accent">
            <Cpu className="w-3 h-3" />
          </div>
          <div className="text-left">
            <span className="text-[10px] text-muted block font-bold">TI BA II+ [K]</span>
            <span className="text-accent font-semibold text-sm">{displayValue}</span>
          </div>
          <Maximize2 className="w-3.5 h-3.5 text-muted group-hover:text-white ml-1" />
        </button>
      </div>
    );
  }

  const loadPreset = (type: "bond" | "annuity-end" | "annuity-bgn" | "compound" | "volatility") => {
    playClick();
    if (type === "bond") {
      setIsBgnMode(false);
      setTvmN(5);
      setTvmPV(-980.0);
      setTvmPMT(60.0);
      setTvmFV(1000.0);
      setTvmIY(6.48);
      setDisplayValue("6.4800");
      setStatusLine("LOADED: 5-Yr 6% Bond @ $980 -> YTM = 6.48%");
    } else if (type === "annuity-end") {
      setIsBgnMode(false);
      setTvmN(6);
      setTvmIY(6.5);
      setTvmPMT(50000);
      setTvmFV(0);
      setTvmPV(-241986.08);
      setDisplayValue("-241986.08");
      setStatusLine("LOADED: 6-Yr $50k [END] PV = $241,986.08");
    } else if (type === "annuity-bgn") {
      setIsBgnMode(true);
      setTvmN(6);
      setTvmIY(6.5);
      setTvmPMT(50000);
      setTvmFV(0);
      setTvmPV(-257715.18);
      setDisplayValue("-257715.18");
      setStatusLine("LOADED: 6-Yr $50k [BGN] PV = $257,715.18");
    } else if (type === "compound") {
      setStoredOperand(1.084);
      setLastOperator("^");
      setDisplayValue("12");
      const res = Math.pow(1.084, 12);
      setDisplayValue(res.toFixed(4));
      setStatusLine("LOADED: (1.084)^12 = 2.6288");
    } else if (type === "volatility") {
      const res = Math.sqrt(68.0);
      setDisplayValue(res.toFixed(4));
      setStatusLine("LOADED: √(68.0 Variance) = 8.2462 (Std Dev)");
    }
    setWaitingForNewInput(true);
  };

  const isDocked = calculatorMode === "docked";

  return (
    <div
      className={
        isDocked
          ? "fixed top-14 right-0 bottom-0 w-[420px] max-w-[100vw] bg-background-elevated border-l border-control shadow-2xl z-50 flex flex-col font-sans overflow-hidden animate-in slide-in-from-right duration-200"
          : "fixed bottom-4 right-4 z-50 w-[440px] max-w-[calc(100vw-32px)] max-h-[90vh] bg-background-elevated border border-control rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] p-4 sm:p-5 flex flex-col font-sans overflow-y-auto animate-in fade-in slide-in-from-bottom-3 duration-200"
      }
    >
      {/* Top Header Bar */}
      <div className={`flex items-center justify-between pb-3 border-b border-control select-none ${isDocked ? "p-4" : ""}`}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-accent/20 border border-accent/40 flex items-center justify-center text-accent">
            <Cpu className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-mono text-xs font-bold tracking-wider text-white flex items-center gap-1.5">
              <span>TI BA II PLUS</span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-warning/20 text-warning border border-warning/30">
                PRO
              </span>
            </span>
          </div>
        </div>

        {/* Window Controls */}
        <div className="flex items-center gap-1">
          {/* Dock / Float Switcher */}
          <button
            onClick={() => {
              playClick();
              setCalculatorMode(isDocked ? "floating" : "docked");
            }}
            className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-surface-raised transition-colors"
            title={isDocked ? "Switch to Floating Window" : "Dock to Right Panel"}
          >
            <PanelRight className={`w-3.5 h-3.5 ${isDocked ? "text-accent" : ""}`} />
          </button>

          {/* Minimize */}
          <button
            onClick={() => {
              playClick();
              setCalculatorMode("minimized");
            }}
            className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-surface-raised transition-colors"
            title="Minimize to Pill"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>

          {/* Close */}
          <button
            onClick={() => {
              playClick();
              setCalculatorOpen(false);
            }}
            className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-surface-raised transition-colors"
            title="Close Emulator (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className={isDocked ? "p-4 overflow-y-auto flex-1 flex flex-col justify-between" : ""}>
        {/* LCD Screen Display */}
        <div className="my-3 p-3 sm:p-4 rounded-xl bg-background border border-control relative flex flex-col justify-between shadow-inner">
          {/* LCD Top Annunciator Indicators */}
          <div className="flex items-center justify-between text-[10px] font-mono tracking-widest text-muted select-none pb-1 border-b border-divider">
            <span className={activeSecondary ? "text-warning font-bold" : "opacity-25"}>2nd</span>
            <span className={computeMode ? "text-accent font-bold" : "opacity-25"}>CPT</span>
            <span className={pendingMemoryAction ? "text-info font-bold" : "opacity-25"}>
              {pendingMemoryAction ? pendingMemoryAction : "MEM"}
            </span>
            <span className={parenStack.length > 0 ? "text-purple-400 font-bold" : "opacity-25"}>
              PAREN ({parenStack.length})
            </span>
            <span className={isBgnMode ? "text-warning font-bold px-1 rounded bg-warning/10 border border-warning/30" : "opacity-40"}>
              {isBgnMode ? "BGN" : "END"}
            </span>
          </div>

          {/* Main LCD Numbers */}
          <div className="text-right font-mono text-2xl sm:text-3xl font-bold tracking-tight text-white my-2 sm:my-3 overflow-x-auto select-all">
            {displayValue}
          </div>

          {/* LCD Status line */}
          <div className="text-right text-[11px] font-mono text-accent/90 truncate font-semibold">
            {statusLine}
          </div>
        </div>

        {/* TVM Registers Snapshot Bar */}
        <div className="grid grid-cols-5 gap-1 mb-3 p-2 bg-surface-interactive rounded-lg border border-control text-center font-mono text-[10px]">
          <div>
            <span className="text-muted block">N</span>
            <span className="text-white font-bold">{tvmN}</span>
          </div>
          <div>
            <span className="text-muted block">I/Y</span>
            <span className="text-accent font-bold">{tvmIY.toFixed(2)}%</span>
          </div>
          <div>
            <span className="text-muted block">PV</span>
            <span className="text-white font-bold">{tvmPV.toFixed(1)}</span>
          </div>
          <div>
            <span className="text-muted block">PMT</span>
            <span className="text-white font-bold">{tvmPMT.toFixed(1)}</span>
          </div>
          <div>
            <span className="text-muted block">FV</span>
            <span className="text-white font-bold">{tvmFV.toFixed(1)}</span>
          </div>
        </div>

        {/* TI BA II Plus Key Matrix */}
        <div className="space-y-1.5 sm:space-y-2">
          
          {/* Row 1: CPT, 2nd, BGN/SET, CLR TVM, CLR */}
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            <button
              onClick={() => { playClick(); setComputeMode(!computeMode); }}
              className={`py-2 px-1 rounded-lg text-xs font-mono font-bold border transition-all ${
                computeMode
                  ? "bg-accent text-black border-accent "
                  : "bg-surface-raised text-accent border-accent/40 hover:bg-accent/10"
              }`}
            >
              CPT
            </button>
            <button
              onClick={() => { playClick(); setActiveSecondary(!activeSecondary); }}
              className={`py-2 px-1 rounded-lg text-xs font-mono font-bold border transition-all ${
                activeSecondary
                  ? "bg-warning text-black border-warning"
                  : "bg-surface-raised text-warning border-warning/40 hover:bg-warning/10"
              }`}
            >
              2nd
            </button>
            <button
              onClick={handleToggleBGN}
              className={`py-2 px-1 rounded-lg text-xs font-mono font-bold border transition-all ${
                isBgnMode
                  ? "bg-warning/20 text-warning border-warning/50"
                  : "bg-surface-raised text-muted-strong border-control hover:text-white"
              }`}
              title="Toggle Annuity Timing ([BGN] vs [END])"
            >
              {isBgnMode ? "BGN" : "END"}
            </button>
            <button
              onClick={activeSecondary ? handleClearTVM : () => handleOperation("÷")}
              className={`py-2 px-1 rounded-lg text-xs font-mono border transition-all ${
                activeSecondary
                  ? "bg-warning/20 text-warning border-warning/40 font-bold"
                  : "bg-surface-raised text-white border-control hover:border-control-boundary-hover"
              }`}
              title={activeSecondary ? "Reset All TVM Registers" : "Divide"}
            >
              {activeSecondary ? "CLR TVM" : "÷"}
            </button>
            <button
              onClick={handleClear}
              className="py-2 px-1 rounded-lg text-xs font-mono font-bold bg-danger/40 text-danger border border-danger/50 hover:bg-danger/40 transition-colors"
            >
              CLR
            </button>
          </div>

          {/* Row 2: TVM Row [N], [I/Y], [PV], [PMT], [FV] */}
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {(["N", "I/Y", "PV", "PMT", "FV"] as const).map((key) => (
              <button
                key={key}
                onClick={() => handleTVMKey(key)}
                className={`py-2 px-1 rounded-lg text-xs font-mono font-bold border transition-all active:scale-95 ${
                  computeMode
                    ? "bg-accent/10 border-accent text-accent animate-pulse"
                    : "bg-surface-interactive text-white border-control hover:border-accent hover:text-accent"
                }`}
              >
                {key}
              </button>
            ))}
          </div>

          {/* Row 3: Scientific Functions (y^x, √x, x², 1/x, LN / e^x) */}
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            <button
              onClick={() => handleOperation("^")}
              className="py-2 px-1 rounded-lg text-xs font-mono font-bold bg-surface-interactive text-info border border-info/30 hover:bg-info/10 hover:border-info active:scale-95 transition-all"
              title="Power of: y^x (e.g. 1.084^12)"
            >
              y<sup>x</sup>
            </button>
            <button
              onClick={() => handleUnaryOp(activeSecondary ? "sqr" : "sqrt")}
              className="py-2 px-1 rounded-lg text-xs font-mono font-bold bg-surface-interactive text-info border border-info/30 hover:bg-info/10 hover:border-info active:scale-95 transition-all"
              title={activeSecondary ? "Square: x²" : "Square Root: √x"}
            >
              {activeSecondary ? "x²" : "√x"}
            </button>
            <button
              onClick={() => handleUnaryOp("sqr")}
              className="py-2 px-1 rounded-lg text-xs font-mono font-bold bg-surface-interactive text-info border border-info/30 hover:bg-info/10 hover:border-info active:scale-95 transition-all"
              title="Square: x²"
            >
              x²
            </button>
            <button
              onClick={() => handleUnaryOp("recip")}
              className="py-2 px-1 rounded-lg text-xs font-mono font-bold bg-surface-interactive text-info border border-info/30 hover:bg-info/10 hover:border-info active:scale-95 transition-all"
              title="Reciprocal: 1/x"
            >
              1/x
            </button>
            <button
              onClick={() => handleUnaryOp(activeSecondary ? "exp" : "ln")}
              className="py-2 px-1 rounded-lg text-xs font-mono font-bold bg-surface-interactive text-info border border-info/30 hover:bg-info/10 hover:border-info active:scale-95 transition-all"
              title={activeSecondary ? "Exponential: e^x" : "Natural Log: LN"}
            >
              {activeSecondary ? "e^x" : "LN"}
            </button>
          </div>

          {/* Row 4: Memory & Parentheses (STO, RCL, (, ), %) */}
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            <button
              onClick={() => handleMemoryKey("STO")}
              className={`py-2 px-1 rounded-lg text-xs font-mono font-bold border transition-all ${
                pendingMemoryAction === "STO"
                  ? "bg-info/30 text-info border-info animate-pulse"
                  : "bg-surface-interactive text-muted-strong border-control hover:text-white"
              }`}
              title="Store to Memory [0-9]"
            >
              STO
            </button>
            <button
              onClick={() => handleMemoryKey("RCL")}
              className={`py-2 px-1 rounded-lg text-xs font-mono font-bold border transition-all ${
                pendingMemoryAction === "RCL"
                  ? "bg-info/30 text-info border-info animate-pulse"
                  : "bg-surface-interactive text-muted-strong border-control hover:text-white"
              }`}
              title="Recall from Memory [0-9]"
            >
              RCL
            </button>
            <button
              onClick={handleOpenParen}
              className="py-2 px-1 rounded-lg text-xs font-mono font-bold bg-surface-interactive text-muted-strong border border-control hover:text-white"
              title="Open Parenthesis ("
            >
              (
            </button>
            <button
              onClick={handleCloseParen}
              className="py-2 px-1 rounded-lg text-xs font-mono font-bold bg-surface-interactive text-muted-strong border border-control hover:text-white"
              title="Close Parenthesis )"
            >
              )
            </button>
            <button
              onClick={() => handleUnaryOp("pct")}
              className="py-2 px-1 rounded-lg text-xs font-mono font-bold bg-surface-interactive text-muted-strong border border-control hover:text-white"
              title="Percent % (/100)"
            >
              %
            </button>
          </div>

          {/* Numeric Keypad Grid 4x4 */}
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2 pt-1">
            {/* 7 8 9 × */}
            <button onClick={() => handleDigit("7")} className="py-2.5 rounded-lg font-mono text-sm sm:text-base font-bold bg-surface-interactive text-white border border-control hover:bg-surface-raised active:scale-95 transition-all">7</button>
            <button onClick={() => handleDigit("8")} className="py-2.5 rounded-lg font-mono text-sm sm:text-base font-bold bg-surface-interactive text-white border border-control hover:bg-surface-raised active:scale-95 transition-all">8</button>
            <button onClick={() => handleDigit("9")} className="py-2.5 rounded-lg font-mono text-sm sm:text-base font-bold bg-surface-interactive text-white border border-control hover:bg-surface-raised active:scale-95 transition-all">9</button>
            <button onClick={() => handleOperation("×")} className="py-2.5 rounded-lg font-mono text-sm sm:text-base font-bold bg-surface-raised text-white border border-control hover:bg-surface-raised active:scale-95 transition-all">×</button>

            {/* 4 5 6 - */}
            <button onClick={() => handleDigit("4")} className="py-2.5 rounded-lg font-mono text-sm sm:text-base font-bold bg-surface-interactive text-white border border-control hover:bg-surface-raised active:scale-95 transition-all">4</button>
            <button onClick={() => handleDigit("5")} className="py-2.5 rounded-lg font-mono text-sm sm:text-base font-bold bg-surface-interactive text-white border border-control hover:bg-surface-raised active:scale-95 transition-all">5</button>
            <button onClick={() => handleDigit("6")} className="py-2.5 rounded-lg font-mono text-sm sm:text-base font-bold bg-surface-interactive text-white border border-control hover:bg-surface-raised active:scale-95 transition-all">6</button>
            <button onClick={() => handleOperation("-")} className="py-2.5 rounded-lg font-mono text-sm sm:text-base font-bold bg-surface-raised text-white border border-control hover:bg-surface-raised active:scale-95 transition-all">-</button>

            {/* 1 2 3 + */}
            <button onClick={() => handleDigit("1")} className="py-2.5 rounded-lg font-mono text-sm sm:text-base font-bold bg-surface-interactive text-white border border-control hover:bg-surface-raised active:scale-95 transition-all">1</button>
            <button onClick={() => handleDigit("2")} className="py-2.5 rounded-lg font-mono text-sm sm:text-base font-bold bg-surface-interactive text-white border border-control hover:bg-surface-raised active:scale-95 transition-all">2</button>
            <button onClick={() => handleDigit("3")} className="py-2.5 rounded-lg font-mono text-sm sm:text-base font-bold bg-surface-interactive text-white border border-control hover:bg-surface-raised active:scale-95 transition-all">3</button>
            <button onClick={() => handleOperation("+")} className="py-2.5 rounded-lg font-mono text-sm sm:text-base font-bold bg-surface-raised text-white border border-control hover:bg-surface-raised active:scale-95 transition-all">+</button>

            {/* 0 . +/- = */}
            <button onClick={() => handleDigit("0")} className="py-2.5 rounded-lg font-mono text-sm sm:text-base font-bold bg-surface-interactive text-white border border-control hover:bg-surface-raised active:scale-95 transition-all">0</button>
            <button onClick={() => handleDigit(".")} className="py-2.5 rounded-lg font-mono text-sm sm:text-base font-bold bg-surface-interactive text-white border border-control hover:bg-surface-raised active:scale-95 transition-all">.</button>
            <button onClick={handleToggleSign} className="py-2.5 rounded-lg font-mono text-xs font-bold bg-surface-raised text-foreground border border-control hover:bg-surface-raised active:scale-95 transition-all">+/-</button>
            <button onClick={handleEquals} className="py-2.5 rounded-lg font-mono text-sm sm:text-base font-semibold bg-accent text-black border border-accent hover:bg-accent-strong active:scale-95 flex items-center justify-center">=</button>
          </div>
        </div>

        {/* Quick Presets Bar */}
        <div className="mt-3 pt-3 border-t border-control flex items-center justify-between text-xs font-mono">
          <span className="text-muted text-[11px] uppercase font-bold">Presets:</span>
          <div className="flex gap-1 flex-wrap justify-end">
            <button
              onClick={() => loadPreset("compound")}
              className="px-2 py-1 rounded bg-surface-raised text-info hover:text-white border border-info/30 text-[11px] font-medium"
              title="Calculate 1.084^12"
            >
              y<sup>x</sup> Power
            </button>
            <button
              onClick={() => loadPreset("volatility")}
              className="px-2 py-1 rounded bg-surface-raised text-info hover:text-white border border-info/30 text-[11px] font-medium"
              title="Calculate √68.0 Variance"
            >
              √x Root
            </button>
            <button
              onClick={() => loadPreset("bond")}
              className="px-2 py-1 rounded bg-surface-raised text-muted-strong hover:text-white border border-control hover:border-accent/40 text-[11px] font-medium"
            >
              Bond YTM
            </button>
            <button
              onClick={() => loadPreset("annuity-bgn")}
              className="px-2 py-1 rounded bg-surface-raised text-warning/90 hover:text-warning border border-control hover:border-warning/40 text-[11px] font-medium"
            >
              [BGN] Due
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

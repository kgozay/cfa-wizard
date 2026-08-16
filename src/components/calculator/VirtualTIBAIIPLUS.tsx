"use client";

import React, { useState } from "react";
import { X, RotateCcw, Cpu, ChevronRight, HelpCircle } from "lucide-react";
import { useCFAStore } from "@/store/useCFAStore";
import { sound } from "@/components/common/SoundEffects";

export const VirtualTIBAIIPLUS: React.FC = () => {
  const { isCalculatorOpen, setCalculatorOpen, soundEnabled } = useCFAStore();
  
  // LCD Display State
  const [displayValue, setDisplayValue] = useState<string>("0.0000");
  const [activeSecondary, setActiveSecondary] = useState<boolean>(false);
  const [computeMode, setComputeMode] = useState<boolean>(false);
  const [lastOperator, setLastOperator] = useState<string | null>(null);
  const [storedOperand, setStoredOperand] = useState<number | null>(null);
  const [waitingForNewInput, setWaitingForNewInput] = useState<boolean>(true);
  
  // TVM Registers
  const [tvmN, setTvmN] = useState<number>(5);
  const [tvmIY, setTvmIY] = useState<number>(6.0);
  const [tvmPV, setTvmPV] = useState<number>(-980);
  const [tvmPMT, setTvmPMT] = useState<number>(60);
  const [tvmFV, setTvmFV] = useState<number>(1000);
  
  // Status message in LCD subline
  const [statusLine, setStatusLine] = useState<string>("READY // TVM REGISTERS ACTIVE");

  if (!isCalculatorOpen) return null;

  const playClick = () => {
    if (soundEnabled) sound.playKeyClick();
  };

  const handleDigit = (digit: string) => {
    playClick();
    if (waitingForNewInput || displayValue === "0.0000" || displayValue === "0") {
      setDisplayValue(digit === "." ? "0." : digit);
      setWaitingForNewInput(false);
    } else {
      if (digit === "." && displayValue.includes(".")) return;
      setDisplayValue(displayValue + digit);
    }
  };

  const handleClear = () => {
    playClick();
    setDisplayValue("0.0000");
    setWaitingForNewInput(true);
    setComputeMode(false);
    setActiveSecondary(false);
    setStatusLine("DISPLAY CLEARED");
  };

  const handleClearTVM = () => {
    playClick();
    setTvmN(0);
    setTvmIY(0);
    setTvmPV(0);
    setTvmPMT(0);
    setTvmFV(0);
    setActiveSecondary(false);
    setStatusLine("TVM REGISTERS RESET (0.00)");
  };

  const handleToggleSign = () => {
    playClick();
    const val = parseFloat(displayValue);
    if (!isNaN(val)) {
      setDisplayValue((-val).toString());
    }
  };

  const handleOperation = (op: string) => {
    playClick();
    const currentVal = parseFloat(displayValue);
    if (storedOperand === null) {
      setStoredOperand(currentVal);
    } else if (lastOperator) {
      const result = computeBasic(storedOperand, currentVal, lastOperator);
      setStoredOperand(result);
      setDisplayValue(result.toFixed(4));
    }
    setLastOperator(op);
    setWaitingForNewInput(true);
  };

  const computeBasic = (a: number, b: number, op: string): number => {
    switch (op) {
      case "+": return a + b;
      case "-": return a - b;
      case "×": return a * b;
      case "÷": return b !== 0 ? a / b : 0;
      default: return b;
    }
  };

  const handleEquals = () => {
    playClick();
    if (storedOperand !== null && lastOperator) {
      const currentVal = parseFloat(displayValue);
      const result = computeBasic(storedOperand, currentVal, lastOperator);
      setDisplayValue(result.toFixed(4));
      setStoredOperand(null);
      setLastOperator(null);
      setWaitingForNewInput(true);
      setStatusLine(`EVAL = ${result.toFixed(4)}`);
    }
  };

  // TVM Handling
  const handleTVMKey = (key: "N" | "I/Y" | "PV" | "PMT" | "FV") => {
    playClick();
    const currentVal = parseFloat(displayValue);

    if (computeMode) {
      // COMPUTE REQUESTED REGISTER
      setComputeMode(false);
      let computed = 0;
      switch (key) {
        case "PV": {
          // PV = - (PMT * [1 - (1+r)^-N]/r + FV * (1+r)^-N)
          const r = (tvmIY / 100);
          if (r === 0) {
            computed = -(tvmPMT * tvmN + tvmFV);
          } else {
            const factor = Math.pow(1 + r, -tvmN);
            computed = -(tvmPMT * ((1 - factor) / r) + tvmFV * factor);
          }
          setTvmPV(computed);
          setDisplayValue(computed.toFixed(4));
          setStatusLine(`CPT PV = ${computed.toFixed(4)}`);
          break;
        }
        case "FV": {
          const r = (tvmIY / 100);
          if (r === 0) {
            computed = -(tvmPV + tvmPMT * tvmN);
          } else {
            const compound = Math.pow(1 + r, tvmN);
            computed = -(tvmPV * compound + tvmPMT * ((compound - 1) / r));
          }
          setTvmFV(computed);
          setDisplayValue(computed.toFixed(4));
          setStatusLine(`CPT FV = ${computed.toFixed(4)}`);
          break;
        }
        case "PMT": {
          const r = (tvmIY / 100);
          const factor = Math.pow(1 + r, -tvmN);
          computed = -(tvmPV + tvmFV * factor) / ((1 - factor) / r);
          setTvmPMT(computed);
          setDisplayValue(computed.toFixed(4));
          setStatusLine(`CPT PMT = ${computed.toFixed(4)}`);
          break;
        }
        case "N": {
          // Approximate N via log
          const r = tvmIY / 100;
          computed = Math.log((tvmPMT - tvmFV * r) / (tvmPMT + tvmPV * r)) / Math.log(1 + r);
          setTvmN(computed);
          setDisplayValue(computed.toFixed(4));
          setStatusLine(`CPT N = ${computed.toFixed(4)}`);
          break;
        }
        case "I/Y": {
          // Newton-Raphson approximation for YTM / I/Y
          let rate = 0.05; // 5% initial guess
          for (let iter = 0; iter < 30; iter++) {
            const factor = Math.pow(1 + rate, -tvmN);
            const pvCalc = (rate === 0) ? (tvmPMT * tvmN + tvmFV) : (tvmPMT * (1 - factor) / rate + tvmFV * factor);
            const diff = pvCalc + tvmPV;
            if (Math.abs(diff) < 0.0001) break;
            // derivative approximation
            const dFactor = -tvmN * Math.pow(1 + rate, -tvmN - 1);
            const dPv = tvmPMT * (-factor / rate - (1 - factor) / (rate * rate)) + tvmFV * dFactor;
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
      // STORE VALUE INTO REGISTER
      switch (key) {
        case "N": setTvmN(currentVal); setStatusLine(`STORED: N = ${currentVal}`); break;
        case "I/Y": setTvmIY(currentVal); setStatusLine(`STORED: I/Y = ${currentVal}%`); break;
        case "PV": setTvmPV(currentVal); setStatusLine(`STORED: PV = ${currentVal}`); break;
        case "PMT": setTvmPMT(currentVal); setStatusLine(`STORED: PMT = ${currentVal}`); break;
        case "FV": setTvmFV(currentVal); setStatusLine(`STORED: FV = ${currentVal}`); break;
      }
      setWaitingForNewInput(true);
    }
  };

  const loadPreset = (type: "bond" | "annuity" | "mortgage") => {
    playClick();
    if (type === "bond") {
      setTvmN(5);
      setTvmPV(-980.0);
      setTvmPMT(60.0);
      setTvmFV(1000.0);
      setTvmIY(6.48);
      setDisplayValue("6.4800");
      setStatusLine("LOADED: 5-Yr 6% Bond @ $980 -> YTM = 6.48%");
    } else if (type === "annuity") {
      setTvmN(10);
      setTvmIY(7.0);
      setTvmPMT(5000);
      setTvmFV(0);
      setTvmPV(-35117.91);
      setDisplayValue("-35117.91");
      setStatusLine("LOADED: 10-Yr $5k Annuity @ 7% PV = $35,117.91");
    }
    setWaitingForNewInput(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-[420px] bg-[#0E0E12] border border-[#27272A] rounded-xl shadow-2xl p-5 relative overflow-hidden flex flex-col font-sans">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1F1F23]">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-brand-lime" />
            <span className="font-mono text-xs font-semibold tracking-wider text-white">
              TI BA II PLUS // EMULATOR
            </span>
          </div>
          <button
            onClick={() => { playClick(); setCalculatorOpen(false); }}
            className="p-1 rounded text-editorial-muted hover:text-white hover:bg-[#1F1F23] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* LCD Screen Display */}
        <div className="my-4 p-4 rounded-lg bg-[#09090B] border border-[#27272A] relative flex flex-col justify-between shadow-inner">
          {/* LCD Top Indicators */}
          <div className="flex items-center justify-between text-[10px] font-mono tracking-widest text-editorial-dim select-none">
            <span className={activeSecondary ? "text-[#FACC15] font-bold" : "opacity-30"}>2nd</span>
            <span className={computeMode ? "text-brand-lime font-bold" : "opacity-30"}>COMPUTE</span>
            <span className="opacity-70">DEC = 4</span>
            <span className="opacity-70">BGN=OFF</span>
          </div>

          {/* Main LCD Numbers */}
          <div className="text-right font-mono text-3xl font-bold tracking-tight text-white my-2 overflow-x-auto select-all">
            {displayValue}
          </div>

          {/* LCD Status line */}
          <div className="text-right text-[11px] font-mono text-brand-lime/80 truncate">
            {statusLine}
          </div>
        </div>

        {/* TVM Registers Snapshot */}
        <div className="grid grid-cols-5 gap-1.5 mb-4 p-2 bg-[#121215] rounded border border-[#1F1F23] text-center font-mono text-[10px]">
          <div>
            <span className="text-editorial-dim block">N</span>
            <span className="text-white font-semibold">{tvmN}</span>
          </div>
          <div>
            <span className="text-editorial-dim block">I/Y</span>
            <span className="text-white font-semibold">{tvmIY.toFixed(2)}%</span>
          </div>
          <div>
            <span className="text-editorial-dim block">PV</span>
            <span className="text-white font-semibold">{tvmPV.toFixed(1)}</span>
          </div>
          <div>
            <span className="text-editorial-dim block">PMT</span>
            <span className="text-white font-semibold">{tvmPMT.toFixed(1)}</span>
          </div>
          <div>
            <span className="text-editorial-dim block">FV</span>
            <span className="text-white font-semibold">{tvmFV.toFixed(1)}</span>
          </div>
        </div>

        {/* TI BA II Plus Physical Key Matrix */}
        <div className="space-y-2">
          
          {/* Function Keys Row 1 */}
          <div className="grid grid-cols-5 gap-2">
            <button
              onClick={() => { playClick(); setComputeMode(!computeMode); }}
              className={`py-2 px-1 rounded text-xs font-mono font-bold border transition-all ${
                computeMode
                  ? "bg-brand-lime text-black border-brand-lime shadow-lime-sm"
                  : "bg-[#18181B] text-brand-lime border-brand-lime/40 hover:bg-brand-lime/10"
              }`}
            >
              CPT
            </button>
            <button
              onClick={() => { playClick(); setActiveSecondary(!activeSecondary); }}
              className={`py-2 px-1 rounded text-xs font-mono font-bold border transition-all ${
                activeSecondary
                  ? "bg-[#EAB308] text-black border-[#EAB308]"
                  : "bg-[#18181B] text-[#FACC15] border-[#EAB308]/40 hover:bg-[#EAB308]/10"
              }`}
            >
              2nd
            </button>
            <button
              onClick={activeSecondary ? handleClearTVM : () => handleOperation("÷")}
              className="py-2 px-1 rounded text-xs font-mono bg-[#18181B] text-editorial-white border border-[#27272A] hover:border-editorial-muted"
            >
              {activeSecondary ? "CLR TVM" : "÷"}
            </button>
            <button
              onClick={() => handleOperation("×")}
              className="py-2 px-1 rounded text-xs font-mono bg-[#18181B] text-editorial-white border border-[#27272A] hover:border-editorial-muted"
            >
              ×
            </button>
            <button
              onClick={handleClear}
              className="py-2 px-1 rounded text-xs font-mono bg-red-950/40 text-red-400 border border-red-900/50 hover:bg-red-900/40"
            >
              CLR
            </button>
          </div>

          {/* TVM Row: [N], [I/Y], [PV], [PMT], [FV] */}
          <div className="grid grid-cols-5 gap-2">
            {(["N", "I/Y", "PV", "PMT", "FV"] as const).map((key) => (
              <button
                key={key}
                onClick={() => handleTVMKey(key)}
                className="py-2 px-1 rounded text-xs font-mono font-bold bg-[#141418] text-white border border-[#3F3F46] hover:border-brand-lime hover:text-brand-lime active:scale-95 transition-all"
              >
                {key}
              </button>
            ))}
          </div>

          {/* Numeric Keypad Grid */}
          <div className="grid grid-cols-4 gap-2 pt-2">
            {/* 7 8 9 - */}
            <button onClick={() => handleDigit("7")} className="py-2.5 rounded font-mono text-sm bg-[#121215] text-white border border-[#27272A] hover:bg-[#1A1A20]">7</button>
            <button onClick={() => handleDigit("8")} className="py-2.5 rounded font-mono text-sm bg-[#121215] text-white border border-[#27272A] hover:bg-[#1A1A20]">8</button>
            <button onClick={() => handleDigit("9")} className="py-2.5 rounded font-mono text-sm bg-[#121215] text-white border border-[#27272A] hover:bg-[#1A1A20]">9</button>
            <button onClick={() => handleOperation("-")} className="py-2.5 rounded font-mono text-sm bg-[#18181B] text-white border border-[#27272A] hover:bg-[#222228]">-</button>

            {/* 4 5 6 + */}
            <button onClick={() => handleDigit("4")} className="py-2.5 rounded font-mono text-sm bg-[#121215] text-white border border-[#27272A] hover:bg-[#1A1A20]">4</button>
            <button onClick={() => handleDigit("5")} className="py-2.5 rounded font-mono text-sm bg-[#121215] text-white border border-[#27272A] hover:bg-[#1A1A20]">5</button>
            <button onClick={() => handleDigit("6")} className="py-2.5 rounded font-mono text-sm bg-[#121215] text-white border border-[#27272A] hover:bg-[#1A1A20]">6</button>
            <button onClick={() => handleOperation("+")} className="py-2.5 rounded font-mono text-sm bg-[#18181B] text-white border border-[#27272A] hover:bg-[#222228]">+</button>

            {/* 1 2 3 = */}
            <button onClick={() => handleDigit("1")} className="py-2.5 rounded font-mono text-sm bg-[#121215] text-white border border-[#27272A] hover:bg-[#1A1A20]">1</button>
            <button onClick={() => handleDigit("2")} className="py-2.5 rounded font-mono text-sm bg-[#121215] text-white border border-[#27272A] hover:bg-[#1A1A20]">2</button>
            <button onClick={() => handleDigit("3")} className="py-2.5 rounded font-mono text-sm bg-[#121215] text-white border border-[#27272A] hover:bg-[#1A1A20]">3</button>
            <button onClick={handleEquals} className="py-2.5 row-span-2 rounded font-mono text-sm font-bold bg-brand-lime text-black border border-brand-lime hover:bg-brand-neon active:scale-95 shadow-lime-sm flex items-center justify-center">=</button>

            {/* 0 . +/- */}
            <button onClick={() => handleDigit("0")} className="py-2.5 rounded font-mono text-sm bg-[#121215] text-white border border-[#27272A] hover:bg-[#1A1A20]">0</button>
            <button onClick={() => handleDigit(".")} className="py-2.5 rounded font-mono text-sm bg-[#121215] text-white border border-[#27272A] hover:bg-[#1A1A20]">.</button>
            <button onClick={handleToggleSign} className="py-2.5 rounded font-mono text-xs bg-[#18181B] text-editorial-white border border-[#27272A] hover:bg-[#222228]">+/-</button>
          </div>
        </div>

        {/* Quick Presets Bar */}
        <div className="mt-4 pt-3 border-t border-[#1F1F23] flex items-center justify-between text-xs font-mono">
          <span className="text-editorial-dim text-[11px]">PRESETS:</span>
          <div className="flex gap-2">
            <button
              onClick={() => loadPreset("bond")}
              className="px-2 py-1 rounded bg-[#18181B] text-editorial-steely hover:text-white border border-[#27272A] hover:border-brand-lime/40 text-[11px]"
            >
              Bond YTM
            </button>
            <button
              onClick={() => loadPreset("annuity")}
              className="px-2 py-1 rounded bg-[#18181B] text-editorial-steely hover:text-white border border-[#27272A] hover:border-brand-lime/40 text-[11px]"
            >
              Annuity PV
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

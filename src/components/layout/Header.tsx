"use client";

import React, { useEffect, useState } from "react";
import { Calculator, Volume2, VolumeX, BookOpen, AlertTriangle, Sparkles, Terminal } from "lucide-react";
import { useCFAStore } from "@/store/useCFAStore";
import { sound } from "@/components/common/SoundEffects";

export const Header: React.FC = () => {
  const {
    soundEnabled,
    toggleSound,
    setCalculatorOpen,
    setFormulaSheetOpen,
    setTrapLogOpen,
    setAIGeneratorOpen,
    completedTopicIds,
    vignetteResults,
    trapLogs,
  } = useCFAStore();

  const [timeString, setTimeString] = useState<string>("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const utc = now.toUTCString().split(" ").slice(4, 5).join(" ");
      setTimeString(`${utc} UTC`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const totalCompleted = completedTopicIds.length;
  const totalSubmissions = Object.keys(vignetteResults).length;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#09090B]/90 backdrop-blur-md border-b border-[#1F1F23]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        
        {/* Left: Branding & System Micro-Typography */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-brand-lime animate-pulse shadow-[0_0_8px_rgba(216,255,62,0.8)]" />
            <span className="font-mono text-sm font-bold tracking-tight text-white">
              CFA WIZARD
            </span>
          </div>
          <span className="hidden sm:inline-block text-editorial-dim text-xs font-mono select-none">
            //
          </span>
          <span className="hidden sm:inline-block font-mono text-[11px] text-editorial-muted tracking-wider uppercase">
            SYSTEM ARCHITECTURE &apos;26
          </span>
        </div>

        {/* Center: Live Time / Telemetry */}
        <div className="hidden md:flex items-center gap-4 text-xs font-mono text-editorial-dim">
          <div className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-editorial-muted" />
            <span className="text-editorial-steely">{timeString || "00:00:00 UTC"}</span>
          </div>
          <span className="text-[#27272A]">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-editorial-muted">MASTERY:</span>
            <span className="text-brand-lime font-semibold">{totalCompleted}/10 TRACKS</span>
          </div>
          {trapLogs.length > 0 && (
            <>
              <span className="text-[#27272A]">|</span>
              <div className="flex items-center gap-1 text-amber-400 font-mono">
                <AlertTriangle className="w-3 h-3" />
                <span>{trapLogs.length} TRAPS LOGGED</span>
              </div>
            </>
          )}
        </div>

        {/* Right: Quick Tools Dock */}
        <div className="flex items-center gap-2 font-mono text-xs">
          
          {/* AI Generator Button */}
          <button
            onClick={() => {
              if (soundEnabled) sound.playKeyClick();
              setAIGeneratorOpen(true);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-brand-lime/10 text-brand-lime border border-brand-lime/30 hover:bg-brand-lime/20 transition-all active:scale-95"
            title="On-Demand AI Vignette Generator"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-semibold">AI GEN</span>
          </button>

          {/* Formula Sheet */}
          <button
            onClick={() => {
              if (soundEnabled) sound.playKeyClick();
              setFormulaSheetOpen(true);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-[#121215] text-editorial-steely border border-[#27272A] hover:text-white hover:border-[#3F3F46] transition-all active:scale-95"
            title="KaTeX Formula Matrix"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden md:inline">FORMULAS</span>
          </button>

          {/* Trap Radar */}
          <button
            onClick={() => {
              if (soundEnabled) sound.playKeyClick();
              setTrapLogOpen(true);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-[#121215] text-editorial-steely border border-[#27272A] hover:text-white hover:border-[#3F3F46] transition-all active:scale-95"
            title="Candidate Trap Diagnostic Log"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">TRAP RADAR</span>
          </button>

          {/* TI BA II Plus */}
          <button
            onClick={() => {
              if (soundEnabled) sound.playKeyClick();
              setCalculatorOpen(true);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#18181B] text-[#E4E4E7] border border-[#3F3F46] hover:border-brand-lime/60 hover:text-brand-lime transition-all active:scale-95"
            title="Texas Instruments BA II Plus Emulator"
          >
            <Calculator className="w-3.5 h-3.5 text-brand-lime" />
            <span className="font-mono font-bold text-[11px]">BA II+</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-1.5 rounded bg-[#121215] text-editorial-muted hover:text-white border border-[#27272A] transition-all"
            title={soundEnabled ? "Mute Terminal Audio" : "Enable Terminal Audio"}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-brand-lime" /> : <VolumeX className="w-3.5 h-3.5 text-editorial-dim" />}
          </button>

        </div>

      </div>
    </header>
  );
};

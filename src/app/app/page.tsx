"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calculator,
  BookOpen,
  AlertTriangle,
  Sparkles,
  Zap,
  Layers,
  ChevronRight,
  Target,
  Clock,
  ShieldCheck,
  CheckCircle,
  Play,
  RotateCcw,
  Sliders,
  Award,
  Volume2,
  VolumeX,
  FileText,
  Radar,
  RefreshCw,
  Keyboard,
  HelpCircle,
  Settings,
  ChevronDown,
} from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { CurriculumIndexTable } from "@/components/dashboard/CurriculumIndexTable";
import { VignetteEngine } from "@/components/vignette/VignetteEngine";
import { ExecutiveBriefingModal } from "@/components/briefing/ExecutiveBriefingModal";
import { VirtualTIBAIIPLUS } from "@/components/calculator/VirtualTIBAIIPLUS";
import { TrapLogModal } from "@/components/tools/TrapLogModal";
import { FormulaSheetModal } from "@/components/tools/FormulaSheetModal";
import { AIVignetteGeneratorModal } from "@/components/tools/AIVignetteGeneratorModal";
import { InterleavedSprintModal } from "@/components/sprint/InterleavedSprintModal";
import { LeitnerTrapDeckModal } from "@/components/spaced/LeitnerTrapDeckModal";
import { KeyboardShortcutsModal } from "@/components/common/KeyboardShortcutsModal";
import { useCFAStore } from "@/store/useCFAStore";
import { CFA_CURRICULUM } from "@/data/curriculum";
import { CFA_VIGNETTES } from "@/data/vignettes";
import { sound } from "@/components/common/SoundEffects";

export default function DiagnosticCockpitPage() {
  const {
    activeVignetteId,
    completedTopicIds,
    inProgressTopicId,
    activeTopicId,
    selectTopic,
    startVignetteDrill,
    vignetteResults,
    trapLogs,
    drillQuestionCount,
    setDrillQuestionCount,
    isPacingTimerEnabled,
    togglePacingTimer,
    isCalculatorOpen,
    isFormulaSheetOpen,
    isTrapLogOpen,
    isAIGeneratorOpen,
    isBriefingModalOpen,
    isSprintModalOpen,
    isLeitnerDeckOpen,
    isShortcutsOpen,
    setSprintModalOpen,
    setLeitnerDeckOpen,
    setCalculatorOpen,
    setFormulaSheetOpen,
    setTrapLogOpen,
    setAIGeneratorOpen,
    setShortcutsOpen,
    soundEnabled,
    toggleSound,
    resetProgress,
  } = useCFAStore();

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = React.useRef<HTMLDivElement>(null);

  // Close settings on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const totalCompleted = completedTopicIds.length;
  const resultsList = Object.values(vignetteResults);
  const totalQuestionsSolved = resultsList.reduce((acc, r) => acc + (r.total || 2), 0);
  const totalCorrect = resultsList.reduce((acc, r) => acc + r.score, 0);
  const accuracy = totalQuestionsSolved > 0 ? Math.round((totalCorrect / totalQuestionsSolved) * 100) : 0;
  
  // Calculate Trap Immunity Index
  const trapImmunityPct =
    totalQuestionsSolved > 0
      ? Math.max(0, 100 - Math.round((trapLogs.length / totalQuestionsSolved) * 100))
      : 100;

  const currentActiveTopic =
    CFA_CURRICULUM.find((t) => t.id === (activeTopicId || inProgressTopicId)) || CFA_CURRICULUM[0];

  // Global Keyboard Shortcuts Listener for zero-latency ergonomics
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Never intercept when actively typing in input / textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key.toUpperCase();

      // Escape closes any active top modal
      if (e.key === "Escape") {
        if (isSettingsOpen) setIsSettingsOpen(false);
        else if (isShortcutsOpen) setShortcutsOpen(false);
        else if (isFormulaSheetOpen) setFormulaSheetOpen(false);
        else if (isTrapLogOpen) setTrapLogOpen(false);
        else if (isAIGeneratorOpen) setAIGeneratorOpen(false);
        else if (isSprintModalOpen) setSprintModalOpen(false);
        else if (isLeitnerDeckOpen) setLeitnerDeckOpen(false);
        else if (isCalculatorOpen) setCalculatorOpen(false);
        return;
      }

      // Hotkey: ? / Shift+/ -> Keyboard Shortcuts HUD
      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        if (soundEnabled) sound.playNodeSwitch();
        setShortcutsOpen(!isShortcutsOpen);
        return;
      }

      // Hotkey: M -> Toggle Audio
      if (key === "M" && !e.metaKey && !e.ctrlKey) {
        toggleSound();
        return;
      }

      // Hotkey: K or C -> BA II+ Calculator
      if ((key === "K" || key === "C") && !e.metaKey && !e.ctrlKey) {
        if (soundEnabled) sound.playNodeSwitch();
        setCalculatorOpen(!isCalculatorOpen);
        return;
      }

      // Hotkey: F -> Formula Sheet
      if (key === "F" && !e.metaKey && !e.ctrlKey) {
        if (soundEnabled) sound.playNodeSwitch();
        setFormulaSheetOpen(!isFormulaSheetOpen);
        return;
      }

      // Hotkey: R -> Recall (Leitner Deck)
      if (key === "R" && !e.metaKey && !e.ctrlKey) {
        if (soundEnabled) sound.playNodeSwitch();
        setLeitnerDeckOpen(!isLeitnerDeckOpen);
        return;
      }

      // Hotkey: S -> Interleaved Sprint
      if (key === "S" && !e.metaKey && !e.ctrlKey) {
        if (soundEnabled) sound.playNodeSwitch();
        setSprintModalOpen(!isSprintModalOpen);
        return;
      }

      // Hotkey: G -> AI Vignette Generator
      if (key === "G" && !e.metaKey && !e.ctrlKey) {
        if (soundEnabled) sound.playNodeSwitch();
        setAIGeneratorOpen(!isAIGeneratorOpen);
        return;
      }

      // Hotkey: T -> Trap Radar Log
      if (key === "T" && !e.metaKey && !e.ctrlKey) {
        if (soundEnabled) sound.playNodeSwitch();
        setTrapLogOpen(!isTrapLogOpen);
        return;
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [
    isCalculatorOpen,
    isFormulaSheetOpen,
    isTrapLogOpen,
    isAIGeneratorOpen,
    isSprintModalOpen,
    isLeitnerDeckOpen,
    isShortcutsOpen,
    isSettingsOpen,
    setCalculatorOpen,
    setFormulaSheetOpen,
    setTrapLogOpen,
    setAIGeneratorOpen,
    setSprintModalOpen,
    setLeitnerDeckOpen,
    setShortcutsOpen,
    soundEnabled,
    toggleSound,
  ]);

  return (
    <main className="min-h-screen flex flex-col bg-[#09090B] text-white selection:bg-brand-lime selection:text-black font-sans">
      
      {/* 56px Symmetrical Institutional HUD Header Bar */}
      <div className="w-full bg-[#0B0B0E]/95 backdrop-blur-md border-b border-[#1F1F23] sticky top-0 z-40">
        <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-5 lg:px-6 h-14 flex items-center justify-between font-mono text-xs gap-2">
          
          {/* Zone 1 (Left): Brand & Cockpit Badge */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Link href="/" className="flex items-center gap-2 hover:opacity-85 transition-opacity">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-lime animate-pulse shadow-lime-sm shrink-0" />
              <span className="font-extrabold tracking-tight text-white text-sm sm:text-base whitespace-nowrap">
                CFA WIZARD
              </span>
            </Link>
            <span className="text-zinc-500 select-none hidden md:inline">//</span>
            <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded bg-[#141418] border border-[#27272A] text-[10px] text-zinc-300 uppercase tracking-wider font-bold whitespace-nowrap">
              STUDY COCKPIT
            </span>
          </div>

          {/* Zone 2 (Center): Symmetrical Telemetry HUD Pill */}
          <div className="hidden lg:flex items-center gap-3 xl:gap-4 text-xs whitespace-nowrap px-3 py-1.5 rounded-lg bg-[#0E0E12] border border-[#1F1F23] shadow-sm shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-400 text-xs font-semibold">PROGRESS:</span>
              <span className="text-brand-lime font-bold">{totalCompleted}/10</span>
            </div>

            <span className="text-[#27272A]">|</span>

            <div className="flex items-center gap-1.5" title="Target Benchmark: 70%">
              <span className="text-zinc-400 text-xs font-semibold">ACCURACY:</span>
              <span className={`font-bold ${accuracy >= 70 ? "text-brand-lime" : "text-amber-400"}`}>
                {accuracy}%
              </span>
            </div>

            <span className="text-[#27272A]">|</span>

            <div className="flex items-center gap-1.5">
              <span className="text-zinc-400 text-xs font-semibold">RETENTION:</span>
              <span className="text-brand-lime font-bold">{trapImmunityPct}%</span>
            </div>
          </div>

          {/* Zone 3 (Right): Grouped Controls, Tool Dock & Utilities */}
          <div className="flex items-center gap-1.5 shrink-0">
            
            {/* Cluster A: Drill Configuration */}
            <div className="flex items-center bg-[#141418] border border-[#27272A] p-0.5 rounded-lg text-xs whitespace-nowrap">
              {([2, 5, 10, 15] as const).map((cnt) => (
                <button
                  key={cnt}
                  onClick={() => {
                    if (soundEnabled) sound.playKeyClick();
                    setDrillQuestionCount(cnt);
                  }}
                  className={`px-2 py-0.5 rounded font-bold transition-all text-xs ${
                    drillQuestionCount === cnt
                      ? "bg-brand-lime text-black shadow-lime-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {cnt}Q
                </button>
              ))}
            </div>

            {/* Pacing Timer Toggle */}
            <button
              onClick={() => {
                if (soundEnabled) sound.playKeyClick();
                togglePacingTimer();
              }}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs border font-bold transition-all whitespace-nowrap ${
                isPacingTimerEnabled
                  ? "bg-brand-lime/10 text-brand-lime border-brand-lime/40"
                  : "bg-[#141418] text-zinc-400 border-[#27272A] hover:text-white"
              }`}
              title="Toggle 90-second exam timer per question"
            >
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>{isPacingTimerEnabled ? "90s" : "OFF"}</span>
            </button>

            {/* Cluster B: Core Workspace Tools (Desktop/Tablet) */}
            <div className="hidden md:flex items-center gap-1 pl-1 border-l border-[#1F1F23]">
              
              {/* BA II+ Calculator */}
              <button
                onClick={() => {
                  if (soundEnabled) sound.playNodeSwitch();
                  setCalculatorOpen(true);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#141418] hover:bg-[#1C1C22] text-amber-300 border border-[#27272A] hover:border-amber-400/40 text-xs font-bold transition-all whitespace-nowrap"
                title="Texas Instruments BA II Plus Emulator (Hotkey: K)"
              >
                <Calculator className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden xl:inline">BA II+</span>
                <span className="text-[10px] px-1 rounded bg-[#222228] text-amber-400/90 border border-[#2D2D35]">K</span>
              </button>

              {/* Formulas Sheet */}
              <button
                onClick={() => {
                  if (soundEnabled) sound.playNodeSwitch();
                  setFormulaSheetOpen(true);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#141418] hover:bg-[#1C1C22] text-cyan-300 border border-[#27272A] hover:border-cyan-400/40 text-xs font-bold transition-all whitespace-nowrap"
                title="LaTeX Formula Reference & Sandboxes (Hotkey: F)"
              >
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden 2xl:inline">FORMULAS</span>
                <span className="hidden xl:inline 2xl:hidden">FORM</span>
                <span className="text-[10px] px-1 rounded bg-[#222228] text-cyan-400/90 border border-[#2D2D35]">F</span>
              </button>

              {/* Leitner Recall Deck */}
              <button
                onClick={() => {
                  if (soundEnabled) sound.playNodeSwitch();
                  setLeitnerDeckOpen(true);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#141418] hover:bg-[#1C1C22] text-brand-lime border border-[#27272A] hover:border-brand-lime/40 text-xs font-bold transition-all whitespace-nowrap"
                title="Spaced Repetition Trap Vault (Hotkey: R)"
              >
                <Layers className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden 2xl:inline">RECALL</span>
                <span className="hidden xl:inline 2xl:hidden">REC</span>
                <span className="text-[10px] px-1 rounded bg-[#222228] text-brand-lime/90 border border-[#2D2D35]">R</span>
              </button>

              {/* Interleaved Sprint */}
              <button
                onClick={() => {
                  if (soundEnabled) sound.playNodeSwitch();
                  setSprintModalOpen(true);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold transition-all whitespace-nowrap"
                title="10-Question Interleaved Multi-Track Sprint (Hotkey: S)"
              >
                <Zap className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden 2xl:inline">SPRINT</span>
                <span className="hidden xl:inline 2xl:hidden">SPRT</span>
                <span className="text-[10px] px-1 rounded bg-[#222228] text-amber-400/90 border border-[#2D2D35]">S</span>
              </button>
            </div>

            {/* AI Generator Button (Always visible on all screens) */}
            <button
              onClick={() => {
                if (soundEnabled) sound.playNodeSwitch();
                setAIGeneratorOpen(true);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-lime/10 hover:bg-brand-lime/20 text-brand-lime border border-brand-lime/40 text-xs font-bold transition-all whitespace-nowrap active:scale-95 shadow-lime-sm"
              title="Generate Dynamic Custom Vignettes with AI (Hotkey: G)"
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden 2xl:inline">AI SCENARIOS</span>
              <span className="hidden sm:inline 2xl:hidden">AI LAB</span>
              <span className="text-[10px] px-1 rounded bg-[#222228] text-brand-lime/90 border border-[#2D2D35]">G</span>
            </button>

            {/* Cluster C: Unified Settings & Utilities Dropdown Menu */}
            <div className="relative pl-1 border-l border-[#1F1F23]" ref={settingsRef}>
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={`p-1.5 rounded-lg border transition-all flex items-center gap-1 ${
                  isSettingsOpen
                    ? "bg-[#1C1C22] text-brand-lime border-brand-lime/40"
                    : "bg-[#141418] text-zinc-300 border-[#27272A] hover:text-white"
                }`}
                title="Settings & Study Utilities"
              >
                <Settings className="w-4 h-4" />
                {trapLogs.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                )}
              </button>

              {/* Settings Dropdown Popover */}
              {isSettingsOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#0E0E12] border border-[#27272A] rounded-xl shadow-2xl p-2 z-50 font-mono text-xs space-y-1 animate-in fade-in duration-150">
                  <div className="px-3 py-1.5 text-[10px] text-zinc-500 font-bold uppercase tracking-wider border-b border-[#1F1F23]">
                    STUDY COCKPIT UTILITIES
                  </div>

                  {/* Trap Radar */}
                  <button
                    onClick={() => {
                      if (soundEnabled) sound.playNodeSwitch();
                      setIsSettingsOpen(false);
                      setTrapLogOpen(true);
                    }}
                    className="w-full px-3 py-2 rounded-lg flex items-center justify-between hover:bg-[#18181D] text-left text-zinc-200 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span>Trap Radar Log [T]</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-[#18181B] text-amber-400 font-bold text-[10px]">
                      {trapLogs.length}
                    </span>
                  </button>

                  {/* Keyboard Shortcuts */}
                  <button
                    onClick={() => {
                      if (soundEnabled) sound.playNodeSwitch();
                      setIsSettingsOpen(false);
                      setShortcutsOpen(true);
                    }}
                    className="w-full px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-[#18181D] text-left text-zinc-200 transition-colors"
                  >
                    <Keyboard className="w-4 h-4 text-brand-lime" />
                    <span>Keyboard HUD [?]</span>
                  </button>

                  {/* Sound Audio Toggle */}
                  <button
                    onClick={() => {
                      toggleSound();
                    }}
                    className="w-full px-3 py-2 rounded-lg flex items-center justify-between hover:bg-[#18181D] text-left text-zinc-200 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {soundEnabled ? (
                        <Volume2 className="w-4 h-4 text-brand-lime" />
                      ) : (
                        <VolumeX className="w-4 h-4 text-zinc-400" />
                      )}
                      <span>Audio Effects [M]</span>
                    </div>
                    <span className={`text-[10px] font-bold ${soundEnabled ? "text-brand-lime" : "text-zinc-400"}`}>
                      {soundEnabled ? "ON" : "MUTED"}
                    </span>
                  </button>

                  <div className="border-t border-[#1F1F23] my-1" />

                  {/* Reset Session */}
                  <button
                    onClick={() => {
                      setIsSettingsOpen(false);
                      setIsResetConfirmOpen(true);
                    }}
                    className="w-full px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-red-950/30 text-left text-red-400 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Reset Progress Session</span>
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Mobile Tools Quick-Access Strip (Visible on mobile screens) */}
      <div className="flex md:hidden items-center gap-2 px-3 py-2 bg-[#09090B] border-b border-[#1F1F23] overflow-x-auto font-mono text-xs whitespace-nowrap">
        <button
          onClick={() => {
            if (soundEnabled) sound.playNodeSwitch();
            setAIGeneratorOpen(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-lime text-black font-extrabold text-xs shrink-0 active:scale-95 shadow-lime-glow"
        >
          <Sparkles className="w-3.5 h-3.5 fill-black" />
          <span>AI SCENARIOS</span>
        </button>

        <button
          onClick={() => {
            if (soundEnabled) sound.playNodeSwitch();
            setCalculatorOpen(true);
          }}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#141418] text-amber-300 border border-[#27272A] text-xs font-bold shrink-0 active:scale-95"
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>BA II+</span>
        </button>

        <button
          onClick={() => {
            if (soundEnabled) sound.playNodeSwitch();
            setFormulaSheetOpen(true);
          }}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#141418] text-cyan-300 border border-[#27272A] text-xs font-bold shrink-0 active:scale-95"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>FORMULAS</span>
        </button>

        <button
          onClick={() => {
            if (soundEnabled) sound.playNodeSwitch();
            setLeitnerDeckOpen(true);
          }}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#141418] text-brand-lime border border-[#27272A] text-xs font-bold shrink-0 active:scale-95"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>RECALL</span>
        </button>

        <button
          onClick={() => {
            if (soundEnabled) sound.playNodeSwitch();
            setSprintModalOpen(true);
          }}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-400/10 text-amber-300 border border-amber-400/30 text-xs font-bold shrink-0 active:scale-95"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>SPRINT</span>
        </button>

        <button
          onClick={() => {
            if (soundEnabled) sound.playNodeSwitch();
            setTrapLogOpen(true);
          }}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#141418] text-amber-400 border border-[#27272A] text-xs font-bold shrink-0 active:scale-95"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>TRAP RADAR ({trapLogs.length})</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1">
        {activeVignetteId ? (
          /* Active Vignette Problem & Diagnostic Autopsy Session */
          <VignetteEngine />
        ) : (
          /* High-Yield Workspace Matrix */
          <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
            
            {/* Unified Horizontal 10-Track Stepper with High Contrast */}
            <div className="w-full bg-[#0B0B0E] border border-[#1F1F23] rounded-xl p-3.5 sm:p-4 font-mono shadow-lg">
              <div className="flex items-center justify-between text-xs text-zinc-400 font-bold uppercase tracking-wider mb-3">
                <span className="text-zinc-300">OFFICIAL 10 CFA LEVEL 1 CURRICULUM TRACKS (150 UNIQUE QUESTIONS)</span>
                <span className="hidden sm:inline text-brand-lime font-semibold">CLICK TRACK TO INSPECT &amp; DRILL</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
                {CFA_CURRICULUM.map((topic) => {
                  const isCompleted = completedTopicIds.includes(topic.id);
                  const isCurrent = (activeTopicId || inProgressTopicId) === topic.id;

                  return (
                    <button
                      key={topic.id}
                      onClick={() => {
                        if (soundEnabled) sound.playNodeSwitch();
                        selectTopic(topic.id);
                      }}
                      className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between min-h-[68px] sm:min-h-[74px] ${
                        isCurrent
                          ? "bg-brand-lime/15 border-brand-lime text-white shadow-lime-sm font-extrabold"
                          : isCompleted
                          ? "bg-[#0E0E12] border-brand-lime/40 text-zinc-200 hover:border-brand-lime/70 hover:bg-[#121216]"
                          : "bg-[#0E0E12] border-[#222226] text-zinc-300 hover:border-[#3F3F46] hover:bg-[#141418]"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-bold ${isCurrent ? "text-brand-lime" : "text-zinc-400"}`}>[{topic.id}]</span>
                        {isCompleted && <CheckCircle className="w-3.5 h-3.5 text-brand-lime" />}
                      </div>
                      <div>
                        <div className="font-bold text-xs truncate text-white">{topic.shortName}</div>
                        <div className="text-[11px] text-zinc-400 font-medium">{topic.weight}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Interactive Table & Track Details */}
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-lime shadow-lime-sm" />
                  <span className="text-white font-bold uppercase tracking-wider text-sm">
                    CURRENT TRACK: {currentActiveTopic.id} // {currentActiveTopic.name} ({currentActiveTopic.weight})
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => {
                      if (soundEnabled) sound.playNodeSwitch();
                      const v = CFA_VIGNETTES.find((item) => item.topicId === currentActiveTopic.id) || CFA_VIGNETTES[0];
                      startVignetteDrill(v.id);
                    }}
                    className="px-4 py-2.5 rounded-lg bg-brand-lime text-black font-extrabold flex items-center gap-2 hover:bg-brand-lime/90 shadow-lime-glow transition-all active:scale-[0.98] text-xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                    <span>DRILL {drillQuestionCount}Q VIGNETTES</span>
                  </button>

                  <button
                    onClick={() => {
                      if (soundEnabled) sound.playNodeSwitch();
                      setAIGeneratorOpen(true);
                    }}
                    className="px-3.5 py-2.5 rounded-lg bg-[#141418] hover:bg-[#1C1C22] text-brand-lime border border-brand-lime/40 font-bold flex items-center gap-1.5 transition-all active:scale-[0.98] text-xs"
                    title="Generate Custom Scenarios for this track"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI SCENARIO LAB</span>
                  </button>
                </div>
              </div>

              <CurriculumIndexTable />
            </div>

          </div>
        )}
      </div>

      {/* Mobile Tools Quick-Access Strip (Visible on mobile screens) */}
      <div className="flex md:hidden items-center gap-2 px-3 py-2 bg-[#09090B] border-b border-[#1F1F23] overflow-x-auto font-mono text-xs whitespace-nowrap">
        <button
          onClick={() => {
            if (soundEnabled) sound.playNodeSwitch();
            setAIGeneratorOpen(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-lime text-black font-extrabold text-[11px] shrink-0 active:scale-95 shadow-lime-glow"
        >
          <Sparkles className="w-3.5 h-3.5 fill-black" />
          <span>AI SCENARIOS</span>
        </button>

        <button
          onClick={() => {
            if (soundEnabled) sound.playNodeSwitch();
            setCalculatorOpen(true);
          }}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#141418] text-amber-300 border border-[#27272A] text-[11px] font-bold shrink-0 active:scale-95"
        >
          <Calculator className="w-3 h-3" />
          <span>BA II+</span>
        </button>

        <button
          onClick={() => {
            if (soundEnabled) sound.playNodeSwitch();
            setFormulaSheetOpen(true);
          }}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#141418] text-cyan-300 border border-[#27272A] text-[11px] font-bold shrink-0 active:scale-95"
        >
          <FileText className="w-3 h-3" />
          <span>FORMULAS</span>
        </button>

        <button
          onClick={() => {
            if (soundEnabled) sound.playNodeSwitch();
            setLeitnerDeckOpen(true);
          }}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#141418] text-brand-lime border border-[#27272A] text-[11px] font-bold shrink-0 active:scale-95"
        >
          <Layers className="w-3 h-3" />
          <span>RECALL</span>
        </button>

        <button
          onClick={() => {
            if (soundEnabled) sound.playNodeSwitch();
            setSprintModalOpen(true);
          }}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-400/10 text-amber-300 border border-amber-400/30 text-[11px] font-bold shrink-0 active:scale-95"
        >
          <Zap className="w-3 h-3" />
          <span>SPRINT</span>
        </button>

        <button
          onClick={() => {
            if (soundEnabled) sound.playNodeSwitch();
            setShortcutsOpen(true);
          }}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#141418] text-editorial-dim hover:text-white border border-[#27272A] text-[11px] font-bold shrink-0 active:scale-95"
        >
          <Keyboard className="w-3 h-3" />
          <span>HOTKEYS</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1">
        {activeVignetteId ? (
          /* Active Vignette Problem & Diagnostic Autopsy Session */
          <VignetteEngine />
        ) : (
          /* High-Yield Workspace Matrix */
          <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
            
            {/* Unified Horizontal 10-Track Stepper */}
            <div className="w-full bg-[#0B0B0E] border border-[#1F1F23] rounded-xl p-3 sm:p-4 font-mono">
              <div className="flex items-center justify-between text-xs text-editorial-dim uppercase tracking-wider mb-3">
                <span>OFFICIAL 10 CFA LEVEL 1 CURRICULUM TRACKS (15 UNIQUE QS PER TRACK)</span>
                <span className="hidden sm:inline">SELECT TRACK TO INSPECT &amp; DRILL</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
                {CFA_CURRICULUM.map((topic) => {
                  const isCompleted = completedTopicIds.includes(topic.id);
                  const isCurrent = (activeTopicId || inProgressTopicId) === topic.id;

                  return (
                    <button
                      key={topic.id}
                      onClick={() => {
                        if (soundEnabled) sound.playNodeSwitch();
                        selectTopic(topic.id);
                      }}
                      className={`p-2 sm:p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between min-h-[64px] sm:min-h-[70px] ${
                        isCurrent
                          ? "bg-brand-lime/10 border-brand-lime text-white shadow-lime-sm"
                          : isCompleted
                          ? "bg-[#0E0E12] border-brand-lime/30 text-zinc-300 hover:border-brand-lime/60"
                          : "bg-[#0E0E12] border-[#1F1F23] text-zinc-400 hover:border-[#3F3F46] hover:bg-[#141418]"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold">[{topic.id}]</span>
                        {isCompleted && <CheckCircle className="w-3 h-3 text-brand-lime" />}
                      </div>
                      <div>
                        <div className="font-bold text-[11px] truncate">{topic.shortName}</div>
                        <div className="text-[9px] text-editorial-dim">{topic.weight}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Interactive Table & Track Details */}
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-lime" />
                  <span className="text-white font-bold uppercase tracking-wider">
                    CURRENT TRACK: {currentActiveTopic.id} // {currentActiveTopic.name} ({currentActiveTopic.weight})
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => {
                      if (soundEnabled) sound.playNodeSwitch();
                      const v = CFA_VIGNETTES.find((item) => item.topicId === currentActiveTopic.id) || CFA_VIGNETTES[0];
                      startVignetteDrill(v.id);
                    }}
                    className="px-4 py-2 rounded-lg bg-brand-lime text-black font-extrabold flex items-center gap-2 hover:bg-brand-lime/90 shadow-lime-glow transition-all active:scale-[0.98]"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                    <span>DRILL {drillQuestionCount}Q VIGNETTES</span>
                  </button>

                  <button
                    onClick={() => {
                      if (soundEnabled) sound.playNodeSwitch();
                      setAIGeneratorOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-lg bg-[#141418] hover:bg-[#1C1C22] text-brand-lime border border-brand-lime/40 font-bold flex items-center gap-1.5 transition-all active:scale-[0.98]"
                    title="Generate Custom Scenarios for this track"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI SCENARIO</span>
                  </button>
                </div>
              </div>

              <CurriculumIndexTable />
            </div>

          </div>
        )}
      </div>

      {/* Confirmation Modal for Reset Session */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-[#0E0E12] border border-[#27272A] rounded-xl p-6 max-w-md w-full space-y-4 font-sans shadow-2xl">
            <div className="flex items-center gap-2 font-mono text-xs text-red-400 font-bold uppercase">
              <AlertTriangle className="w-4 h-4" />
              <span>RESET SESSION PROGRESS</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Are you sure you want to reset all completed tracks, diagnostic scores, trap logs, and Leitner flashcard boxes? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 font-mono text-xs pt-2">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-[#18181B] text-zinc-300 border border-[#27272A] hover:text-white"
              >
                CANCEL
              </button>
              <button
                onClick={() => {
                  resetProgress();
                  setIsResetConfirmOpen(false);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold"
              >
                CONFIRM RESET
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Tool Modals */}
      <ExecutiveBriefingModal />
      <VirtualTIBAIIPLUS />
      <TrapLogModal />
      <FormulaSheetModal />
      <AIVignetteGeneratorModal />
      <InterleavedSprintModal />
      <LeitnerTrapDeckModal />
      <KeyboardShortcutsModal />

      {/* Footer */}
      <Footer />
    </main>
  );
}

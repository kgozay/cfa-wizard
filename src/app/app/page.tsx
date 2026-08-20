"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calculator,
  Clock,
  Volume2,
  VolumeX,
  FileText,
  RefreshCw,
  Keyboard,
  Settings,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { CurrentAssignmentCard } from "@/components/dashboard/CurrentAssignmentCard";
import { CurriculumTracksGrid } from "@/components/dashboard/CurriculumTracksGrid";
import { ScenarioSimulatorStudio } from "@/components/dashboard/ScenarioSimulatorStudio";
import { SpacedRecallSprintsView } from "@/components/dashboard/SpacedRecallSprintsView";
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
import { sound } from "@/components/common/SoundEffects";

export default function DiagnosticCockpitPage() {
  const {
    activeVignetteId,
    completedTopicIds,
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
    setBriefingModalOpen,
    setShortcutsOpen,
    selectTopic,
    soundEnabled,
    toggleSound,
    resetProgress,
  } = useCFAStore();

  const [activeTab, setActiveTab] = useState<"tracks" | "simulator" | "recall">("tracks");
  const [simulatorInitialTopicId, setSimulatorInitialTopicId] = useState<string>("01");
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
  const totalQuestionsSolved = resultsList.reduce((acc, r) => acc + (r.total || (r.submissions ? r.submissions.length : 5)), 0);
  const totalCorrect = resultsList.reduce((acc, r) => acc + r.score, 0);
  const accuracy = totalQuestionsSolved > 0 ? Math.round((totalCorrect / totalQuestionsSolved) * 100) : 0;
  
  // Calculate Trap Immunity Index
  const trapImmunityPct =
    totalQuestionsSolved > 0
      ? Math.max(0, 100 - Math.round((trapLogs.length / totalQuestionsSolved) * 100))
      : 100;

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

      // Hotkey: G -> Open Simulator Tab
      if (key === "G" && !e.metaKey && !e.ctrlKey) {
        if (soundEnabled) sound.playNodeSwitch();
        setActiveTab("simulator");
        return;
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [
    isSettingsOpen,
    isShortcutsOpen,
    isFormulaSheetOpen,
    isTrapLogOpen,
    isAIGeneratorOpen,
    isSprintModalOpen,
    isLeitnerDeckOpen,
    isCalculatorOpen,
    soundEnabled,
    setShortcutsOpen,
    toggleSound,
    setCalculatorOpen,
    setFormulaSheetOpen,
    setLeitnerDeckOpen,
    setSprintModalOpen,
  ]);

  const handleOpenBriefing = (topicId: string) => {
    if (soundEnabled) sound.playNodeSwitch();
    selectTopic(topicId);
    setBriefingModalOpen(true);
  };

  const handleOpenScenarioSimulator = (topicId: string) => {
    if (soundEnabled) sound.playNodeSwitch();
    setSimulatorInitialTopicId(topicId);
    setActiveTab("simulator");
  };

  const handleReturnToMatrix = () => {
    if (soundEnabled) sound.playKeyClick();
    useCFAStore.setState({ activeVignetteId: null });
  };

  return (
    <main className="min-h-screen flex flex-col bg-[#09090B] text-white selection:bg-brand-lime selection:text-black font-sans">
      
      {/* Institutional Top Navbar (56px) */}
      <div className="w-full bg-[#0B0B0E]/95 backdrop-blur-md border-b border-[#1F1F23] sticky top-0 z-40">
        <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-5 lg:px-6 h-14 flex items-center justify-between font-mono text-xs gap-2">
          
          {/* Left: Brand / Terminal Indicator */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Link href="/" className="flex items-center gap-2 hover:opacity-85 transition-opacity">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-lime animate-pulse shadow-lime-sm shrink-0" />
              <span className="font-extrabold tracking-tight text-white text-sm sm:text-base whitespace-nowrap">
                CFA WIZARD
              </span>
            </Link>
            <span className="text-zinc-600 select-none hidden md:inline">//</span>
            <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded bg-[#141418] border border-[#27272A] text-[10px] text-zinc-300 uppercase tracking-wider font-bold whitespace-nowrap">
              STUDY TERMINAL
            </span>
          </div>

          {/* Center: Real-Time Telemetry Data Pill */}
          <div className="hidden lg:flex items-center gap-3 xl:gap-4 text-xs whitespace-nowrap px-3.5 py-1.5 rounded-lg bg-[#0E0E12] border border-[#1F1F23] shadow-sm shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-400 text-xs font-semibold">PROGRESS:</span>
              <span className="text-brand-lime font-bold">{totalCompleted}/10 TRACKS</span>
            </div>

            <span className="text-[#27272A]">|</span>

            <div className="flex items-center gap-1.5" title="Target Benchmark: 70%">
              <span className="text-zinc-400 text-xs font-semibold">ACCURACY:</span>
              <span className={`font-bold ${accuracy >= 70 ? "text-brand-lime" : accuracy > 0 ? "text-amber-400" : "text-zinc-400"}`}>
                {accuracy}%
              </span>
            </div>

            <span className="text-[#27272A]">|</span>

            <div className="flex items-center gap-1.5">
              <span className="text-zinc-400 text-xs font-semibold">RETENTION:</span>
              <span className="text-brand-lime font-bold">{trapImmunityPct}%</span>
            </div>
          </div>

          {/* Right: Core Tools & Settings */}
          <div className="flex items-center gap-1.5 shrink-0">
            
            {/* Question Count Selector */}
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
              title="Toggle 90-second exam pacing timer"
            >
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>{isPacingTimerEnabled ? "90s" : "OFF"}</span>
            </button>

            {/* BA II+ Calculator */}
            <button
              onClick={() => {
                if (soundEnabled) sound.playNodeSwitch();
                setCalculatorOpen(true);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#141418] hover:bg-[#1C1C22] text-amber-300 border border-[#27272A] hover:border-amber-400/40 text-xs font-bold transition-all whitespace-nowrap"
              title="TI BA II Plus Calculator (Hotkey: K)"
            >
              <Calculator className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">BA II+</span>
              <span className="text-[10px] px-1 rounded bg-[#222228] text-amber-400/90 border border-[#2D2D35]">K</span>
            </button>

            {/* Formula Reference */}
            <button
              onClick={() => {
                if (soundEnabled) sound.playNodeSwitch();
                setFormulaSheetOpen(true);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#141418] hover:bg-[#1C1C22] text-cyan-300 border border-[#27272A] hover:border-cyan-400/40 text-xs font-bold transition-all whitespace-nowrap"
              title="Formula Sheet & Equation Reference (Hotkey: F)"
            >
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">FORMULAS</span>
              <span className="text-[10px] px-1 rounded bg-[#222228] text-cyan-400/90 border border-[#2D2D35]">F</span>
            </button>

            {/* Settings & Utilities Menu */}
            <div className="relative" ref={settingsRef}>
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

              {isSettingsOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#0E0E12] border border-[#27272A] rounded-xl shadow-2xl p-2 z-50 font-mono text-xs space-y-1 animate-in fade-in duration-150">
                  <div className="px-3 py-1.5 text-[10px] text-zinc-500 font-bold uppercase tracking-wider border-b border-[#1F1F23]">
                    STUDY TERMINAL SETTINGS
                  </div>

                  {/* Candidate Trap Radar */}
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
                      <span>Candidate Trap Radar</span>
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
                    <span>Keyboard Speed Keys [?]</span>
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
                      <span>Audio Feedback</span>
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

      {/* Main Content Area */}
      <div className="flex-1">
        {activeVignetteId ? (
          /* Active Vignette Problem & Diagnostic Autopsy Session */
          <div className="w-full">
            <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 pt-4">
              <button
                onClick={handleReturnToMatrix}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141418] hover:bg-[#1C1C22] text-zinc-300 hover:text-white border border-[#27272A] font-mono text-xs font-bold transition-all mb-3"
              >
                <ArrowLeft className="w-4 h-4 text-brand-lime" />
                <span>RETURN TO STUDY TERMINAL</span>
              </button>
            </div>
            <VignetteEngine />
          </div>
        ) : (
          /* Structured Study Terminal Dashboard */
          <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
            
            {/* 1. Hero "Current Assignment" Command Card */}
            <CurrentAssignmentCard
              onOpenBriefing={handleOpenBriefing}
              onOpenScenarioSimulator={handleOpenScenarioSimulator}
            />

            {/* 2. Structured 3-Tab Segmented Navigation Bar */}
            <div className="w-full bg-[#0B0B0E] border border-[#1F1F23] rounded-xl p-1.5 font-mono text-xs flex items-center gap-1 shadow-md">
              <button
                onClick={() => {
                  if (soundEnabled) sound.playKeyClick();
                  setActiveTab("tracks");
                }}
                className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-center transition-all ${
                  activeTab === "tracks"
                    ? "bg-brand-lime text-black shadow-lime-sm"
                    : "text-zinc-400 hover:text-white hover:bg-[#141418]"
                }`}
              >
                01. CURRICULUM TRACKS (10)
              </button>

              <button
                onClick={() => {
                  if (soundEnabled) sound.playKeyClick();
                  setActiveTab("simulator");
                }}
                className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-center transition-all ${
                  activeTab === "simulator"
                    ? "bg-brand-lime text-black shadow-lime-sm"
                    : "text-zinc-400 hover:text-white hover:bg-[#141418]"
                }`}
              >
                02. SCENARIO SIMULATOR
              </button>

              <button
                onClick={() => {
                  if (soundEnabled) sound.playKeyClick();
                  setActiveTab("recall");
                }}
                className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-center transition-all ${
                  activeTab === "recall"
                    ? "bg-brand-lime text-black shadow-lime-sm"
                    : "text-zinc-400 hover:text-white hover:bg-[#141418]"
                }`}
              >
                03. SPACED RECALL &amp; SPRINTS
              </button>
            </div>

            {/* 3. Active Tab View Switcher */}
            <div>
              {activeTab === "tracks" && (
                <CurriculumTracksGrid
                  onOpenBriefing={handleOpenBriefing}
                  onOpenScenarioSimulator={handleOpenScenarioSimulator}
                />
              )}

              {activeTab === "simulator" && (
                <ScenarioSimulatorStudio
                  initialTopicId={simulatorInitialTopicId}
                />
              )}

              {activeTab === "recall" && (
                <SpacedRecallSprintsView
                  onOpenScenarioSimulator={handleOpenScenarioSimulator}
                />
              )}
            </div>

          </div>
        )}
      </div>

      {/* Confirmation Modal for Reset Session */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 font-mono">
          <div className="bg-[#0E0E12] border border-[#27272A] rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-xs text-red-400 font-bold uppercase">
              <AlertTriangle className="w-4 h-4" />
              <span>RESET SESSION PROGRESS</span>
            </div>
            <p className="text-xs text-zinc-300 font-sans leading-relaxed">
              Are you sure you want to reset all completed tracks, diagnostic scores, error logs, and Leitner flashcard boxes? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 text-xs pt-2">
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

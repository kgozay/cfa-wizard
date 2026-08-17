"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { Header } from "@/components/layout/Header";
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
    setSprintModalOpen,
    setLeitnerDeckOpen,
    setCalculatorOpen,
    setFormulaSheetOpen,
    setTrapLogOpen,
    setAIGeneratorOpen,
    soundEnabled,
    toggleSound,
    resetProgress,
  } = useCFAStore();

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

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

  return (
    <main className="min-h-screen flex flex-col bg-[#09090B] text-white selection:bg-brand-lime selection:text-black font-sans">
      
      {/* 48px Slim Diagnostic HUD Header Strip */}
      <div className="w-full bg-[#0B0B0E] border-b border-[#1F1F23] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between font-mono text-xs">
          
          {/* Brand & Mode */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-lime animate-pulse shadow-lime-sm" />
              <span className="font-bold tracking-tight text-white">CFA WIZARD</span>
            </Link>
            <span className="text-editorial-dim select-none hidden sm:inline">//</span>
            <span className="text-[11px] text-editorial-muted tracking-wider uppercase hidden sm:inline">
              STUDY COCKPIT
            </span>
          </div>

          {/* Center Telemetry: Progress, MPS, Trap Immunity */}
          <div className="hidden lg:flex items-center gap-6 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="text-editorial-dim">PROGRESS:</span>
              <span className="text-brand-lime font-bold">{totalCompleted}/10 TRACKS</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-editorial-dim">MPS ACCURACY:</span>
              <span className={`font-bold ${accuracy >= 70 ? "text-brand-lime" : "text-amber-400"}`}>
                {accuracy}% (Benchmark: 70%)
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-editorial-dim">TRAP IMMUNITY:</span>
              <span className="text-brand-lime font-bold">{trapImmunityPct}%</span>
            </div>
          </div>

          {/* Right Tools & Interleaved Quick Triggers */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Question Count Selector (2, 5, 10, 15) */}
            <div className="flex items-center bg-[#141418] border border-[#27272A] p-0.5 rounded-lg text-[10px]">
              <span className="text-editorial-dim px-1 hidden sm:inline">DRILL:</span>
              {([2, 5, 10, 15] as const).map((cnt) => (
                <button
                  key={cnt}
                  onClick={() => {
                    if (soundEnabled) sound.playKeyClick();
                    setDrillQuestionCount(cnt);
                  }}
                  className={`px-1.5 py-0.5 rounded font-bold transition-all ${
                    drillQuestionCount === cnt
                      ? "bg-brand-lime text-black"
                      : "text-editorial-dim hover:text-white"
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
              className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] sm:text-[11px] border transition-all ${
                isPacingTimerEnabled
                  ? "bg-brand-lime/10 text-brand-lime border-brand-lime/40"
                  : "bg-[#141418] text-editorial-dim border-[#27272A] hover:text-white"
              }`}
              title="Toggle 90-second per question exam timer"
            >
              <Clock className="w-3 h-3 shrink-0" />
              <span>{isPacingTimerEnabled ? "90s" : "OFF"}</span>
            </button>

            {/* AI Generator Modal Trigger */}
            <button
              onClick={() => {
                if (soundEnabled) sound.playNodeSwitch();
                setAIGeneratorOpen(true);
              }}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#141418] hover:bg-[#1C1C22] text-zinc-300 border border-[#27272A] text-[10px] sm:text-[11px] font-bold transition-all"
              title="Generate Dynamic Custom Vignettes"
            >
              <Sparkles className="w-3 h-3 text-brand-lime shrink-0" />
              <span className="hidden xl:inline">AI SCENARIOS</span>
            </button>

            {/* Formula Sheet Trigger */}
            <button
              onClick={() => {
                if (soundEnabled) sound.playNodeSwitch();
                setFormulaSheetOpen(true);
              }}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#141418] hover:bg-[#1C1C22] text-zinc-300 border border-[#27272A] text-[10px] sm:text-[11px] font-bold transition-all"
              title="Open LaTeX Formula Sheet & Sandboxes"
            >
              <FileText className="w-3 h-3 text-cyan-400 shrink-0" />
              <span className="hidden xl:inline">FORMULAS</span>
            </button>

            {/* BA II+ Calculator Trigger */}
            <button
              onClick={() => {
                if (soundEnabled) sound.playNodeSwitch();
                setCalculatorOpen(true);
              }}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#141418] hover:bg-[#1C1C22] text-zinc-300 border border-[#27272A] text-[10px] sm:text-[11px] font-bold transition-all"
              title="Open TI BA II Plus Emulator (Hotkey: K)"
            >
              <Calculator className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="hidden xl:inline">BA II+</span>
            </button>

            {/* 10-Q Interleaved Sprint Trigger */}
            <button
              onClick={() => {
                if (soundEnabled) sound.playNodeSwitch();
                setSprintModalOpen(true);
              }}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] sm:text-[11px] font-bold transition-all"
            >
              <Zap className="w-3 h-3 shrink-0" />
              <span className="hidden sm:inline">CROSS SPRINT</span>
            </button>

            {/* Leitner Trap Deck Trigger */}
            <button
              onClick={() => {
                if (soundEnabled) sound.playNodeSwitch();
                setLeitnerDeckOpen(true);
              }}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg bg-[#141418] hover:bg-[#1C1C22] text-brand-lime border border-[#27272A] text-[10px] sm:text-[11px] font-bold transition-all"
            >
              <Layers className="w-3 h-3 shrink-0" />
              <span className="hidden sm:inline">TRAP DECK</span>
            </button>

            {/* Trap Radar Trigger */}
            <button
              onClick={() => {
                if (soundEnabled) sound.playNodeSwitch();
                setTrapLogOpen(true);
              }}
              className="p-1.5 rounded-lg bg-[#141418] text-editorial-dim hover:text-amber-400 border border-[#27272A]"
              title="Trap Radar Log"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
            </button>

            {/* Audio Toggle */}
            <button
              onClick={toggleSound}
              className="p-1.5 rounded-lg bg-[#141418] text-editorial-dim hover:text-white border border-[#27272A]"
              title={soundEnabled ? "Mute Sound Effects" : "Enable Sound Effects"}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-brand-lime" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>

            {/* Reset Session Trigger */}
            <button
              onClick={() => setIsResetConfirmOpen(true)}
              className="p-1.5 rounded-lg bg-[#141418] text-editorial-dim hover:text-red-400 border border-[#27272A]"
              title="Reset Study Progress"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

          </div>

        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1">
        {activeVignetteId ? (
          /* Active Vignette Problem & Diagnostic Autopsy Session */
          <VignetteEngine />
        ) : (
          /* High-Yield Workspace Matrix */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            
            {/* Unified Horizontal 10-Track Stepper */}
            <div className="w-full bg-[#0B0B0E] border border-[#1F1F23] rounded-xl p-4 font-mono">
              <div className="flex items-center justify-between text-xs text-editorial-dim uppercase tracking-wider mb-3">
                <span>OFFICIAL 10 CFA LEVEL 1 CURRICULUM TRACKS (15 UNIQUE QS PER TRACK)</span>
                <span>SELECT TRACK TO INSPECT & DRILL</span>
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
                      className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between min-h-[70px] ${
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

      {/* Footer */}
      <Footer />
    </main>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calculator,
  Volume2,
  VolumeX,
  FileText,
  RefreshCw,
  Keyboard,
  Settings,
  AlertTriangle,
  Award,
  BookOpen,
  Cloud,
} from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { CurrentAssignmentCard } from "@/components/dashboard/CurrentAssignmentCard";
import { CurriculumTracksGrid } from "@/components/dashboard/CurriculumTracksGrid";
import { ScenarioSimulatorStudio } from "@/components/dashboard/ScenarioSimulatorStudio";
import { SpacedRecallSprintsView } from "@/components/dashboard/SpacedRecallSprintsView";
import { AnalyticsDashboardView } from "@/components/analytics/AnalyticsDashboardView";
import { VignetteEngine } from "@/components/vignette/VignetteEngine";
import { ExecutiveBriefingModal } from "@/components/briefing/ExecutiveBriefingModal";
import { VirtualTIBAIIPLUS } from "@/components/calculator/VirtualTIBAIIPLUS";
import { TrapLogModal } from "@/components/tools/TrapLogModal";
import { FormulaSheetModal } from "@/components/tools/FormulaSheetModal";
import { AIVignetteGeneratorModal } from "@/components/tools/AIVignetteGeneratorModal";
import { InterleavedSprintModal } from "@/components/sprint/InterleavedSprintModal";
import { LeitnerTrapDeckModal } from "@/components/spaced/LeitnerTrapDeckModal";
import { KeyboardShortcutsModal } from "@/components/common/KeyboardShortcutsModal";
import { MockExamModal } from "@/components/mock/MockExamModal";
import { TopicLearningHubModal } from "@/components/learn/TopicLearningHubModal";
import { AuthSyncModal } from "@/components/auth/AuthSyncModal";
import { useCFAStore } from "@/store/useCFAStore";
import { sound } from "@/components/common/SoundEffects";

export default function DiagnosticCockpitPage() {
  const {
    activeVignetteId,
    trapLogs,
    isCalculatorOpen,
    isFormulaSheetOpen,
    isTrapLogOpen,
    isAIGeneratorOpen,
    isSprintModalOpen,
    isLeitnerDeckOpen,
    isShortcutsOpen,
    isMockExamOpen,
    isLearnHubOpen,
    isAuthSyncOpen,
    setMockExamOpen,
    setLearnHubOpen,
    setAuthSyncOpen,
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

  const [activeTab, setActiveTab] = useState<"tracks" | "simulator" | "recall" | "analytics">("tracks");
  const [simulatorInitialTopicId, setSimulatorInitialTopicId] = useState<string>("01");
  const [learnHubInitialTopicId, setLearnHubInitialTopicId] = useState<string>("01");
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

  return (
    <main className="min-h-screen flex flex-col bg-[#0F1213] text-white selection:bg-brand-lime selection:text-black font-sans">
      <header className="sticky top-0 z-40 w-full border-b border-[#252B2C] bg-[#0F1213]/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex min-h-11 items-center gap-3 rounded-lg pr-2 text-white">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-brand-lime" />
            <span className="text-base font-semibold tracking-[-0.01em]">CFA Wizard</span>
            <span className="hidden text-sm text-[#8E9894] sm:inline">Level I study</span>
          </Link>

          <nav aria-label="Study tools" className="hidden items-center gap-1 md:flex">
            <button
              onClick={() => {
                if (soundEnabled) sound.playNodeSwitch();
                setLearnHubInitialTopicId(useCFAStore.getState().activeTopicId || "01");
                setLearnHubOpen(true);
              }}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium text-[#C1C7C4] hover:bg-[#1A1F20] hover:text-white"
            >
              <BookOpen className="h-4 w-4" />
              Learn
            </button>
            <button
              onClick={() => setCalculatorOpen(true)}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium text-[#C1C7C4] hover:bg-[#1A1F20] hover:text-white"
            >
              <Calculator className="h-4 w-4" />
              Calculator
            </button>
            <button
              onClick={() => setFormulaSheetOpen(true)}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium text-[#C1C7C4] hover:bg-[#1A1F20] hover:text-white"
            >
              <FileText className="h-4 w-4" />
              Formulas
            </button>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={() => {
                if (soundEnabled) sound.playNodeSwitch();
                setMockExamOpen(true);
              }}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#343B3B] px-3 text-sm font-semibold text-white transition-colors hover:bg-[#1A1F20]"
            >
              <Award className="h-4 w-4" />
              <span className="hidden sm:inline">Mock exam</span>
              <span className="sm:hidden">Mock</span>
            </button>

            <div className="relative" ref={settingsRef}>
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                aria-expanded={isSettingsOpen}
                aria-controls="study-tools-menu"
                aria-label="Open study tools and settings"
                className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border transition-colors ${
                  isSettingsOpen
                    ? "border-brand-lime/50 bg-brand-lime/10 text-brand-lime"
                    : "border-[#343B3B] text-[#C1C7C4] hover:bg-[#1A1F20] hover:text-white"
                }`}
              >
                <Settings className="h-5 w-5" />
              </button>

              {isSettingsOpen && (
                <div id="study-tools-menu" className="absolute right-0 z-50 mt-2 w-72 space-y-1 rounded-2xl border border-[#343B3B] bg-[#171B1C] p-2 text-sm shadow-2xl">
                  <p className="px-3 py-2 text-sm font-semibold text-white">Study tools</p>

                  <button
                    onClick={() => {
                      setIsSettingsOpen(false);
                      setLearnHubInitialTopicId(useCFAStore.getState().activeTopicId || "01");
                      setLearnHubOpen(true);
                    }}
                    className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-[#D4D9D6] hover:bg-[#202526] md:hidden"
                  >
                    <BookOpen className="h-4 w-4" />
                    Learning hub
                  </button>
                  <button
                    onClick={() => {
                      setIsSettingsOpen(false);
                      setCalculatorOpen(true);
                    }}
                    className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-[#D4D9D6] hover:bg-[#202526] md:hidden"
                  >
                    <Calculator className="h-4 w-4" />
                    BA II Plus calculator
                  </button>
                  <button
                    onClick={() => {
                      setIsSettingsOpen(false);
                      setFormulaSheetOpen(true);
                    }}
                    className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-[#D4D9D6] hover:bg-[#202526] md:hidden"
                  >
                    <FileText className="h-4 w-4" />
                    Formula reference
                  </button>

                  <button
                    onClick={() => {
                      setIsSettingsOpen(false);
                      setTrapLogOpen(true);
                    }}
                    className="flex min-h-11 w-full items-center justify-between rounded-xl px-3 text-left text-[#D4D9D6] hover:bg-[#202526]"
                  >
                    <span className="flex items-center gap-3"><AlertTriangle className="h-4 w-4" />Mistake review</span>
                    <span className="text-sm text-[#A8B0AD]">{trapLogs.length}</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsSettingsOpen(false);
                      setShortcutsOpen(true);
                    }}
                    className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-[#D4D9D6] hover:bg-[#202526]"
                  >
                    <Keyboard className="h-4 w-4" />
                    Keyboard shortcuts
                  </button>
                  <button
                    onClick={toggleSound}
                    className="flex min-h-11 w-full items-center justify-between rounded-xl px-3 text-left text-[#D4D9D6] hover:bg-[#202526]"
                  >
                    <span className="flex items-center gap-3">
                      {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                      Sound
                    </span>
                    <span className="text-sm text-[#A8B0AD]">{soundEnabled ? "On" : "Off"}</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsSettingsOpen(false);
                      setAuthSyncOpen(true);
                    }}
                    className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-[#D4D9D6] hover:bg-[#202526]"
                  >
                    <Cloud className="h-4 w-4" />
                    Backup and sync
                  </button>

                  <div className="my-1 border-t border-[#2A3031]" />
                  <button
                    onClick={() => {
                      setIsSettingsOpen(false);
                      setIsResetConfirmOpen(true);
                    }}
                    className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-red-300 hover:bg-red-950/30"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reset study progress
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1">
        {activeVignetteId ? (
          <div className="w-full">
            <VignetteEngine />
          </div>
        ) : (
          <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <CurrentAssignmentCard
              onOpenBriefing={handleOpenBriefing}
              onOpenScenarioSimulator={handleOpenScenarioSimulator}
            />

            <div
              role="tablist"
              aria-label="Study views"
              className="grid w-full grid-cols-2 gap-1 rounded-2xl border border-[#293031] bg-[#15191A] p-1.5 sm:grid-cols-4"
            >
              <button
                role="tab"
                aria-selected={activeTab === "tracks"}
                onClick={() => {
                  if (soundEnabled) sound.playKeyClick();
                  setActiveTab("tracks");
                }}
                className={`min-h-11 rounded-xl px-3 text-sm font-semibold text-center transition-colors ${
                  activeTab === "tracks"
                    ? "bg-[#E4E9E6] text-[#111515]"
                    : "text-[#AAB2AE] hover:bg-[#202627] hover:text-white"
                }`}
              >
                Study
              </button>

              <button
                role="tab"
                aria-selected={activeTab === "simulator"}
                onClick={() => {
                  if (soundEnabled) sound.playKeyClick();
                  setActiveTab("simulator");
                }}
                className={`min-h-11 rounded-xl px-3 text-sm font-semibold text-center transition-colors ${
                  activeTab === "simulator"
                    ? "bg-[#E4E9E6] text-[#111515]"
                    : "text-[#AAB2AE] hover:bg-[#202627] hover:text-white"
                }`}
              >
                Custom practice
              </button>

              <button
                role="tab"
                aria-selected={activeTab === "recall"}
                onClick={() => {
                  if (soundEnabled) sound.playKeyClick();
                  setActiveTab("recall");
                }}
                className={`min-h-11 rounded-xl px-3 text-sm font-semibold text-center transition-colors ${
                  activeTab === "recall"
                    ? "bg-[#E4E9E6] text-[#111515]"
                    : "text-[#AAB2AE] hover:bg-[#202627] hover:text-white"
                }`}
              >
                Review
              </button>

              <button
                role="tab"
                aria-selected={activeTab === "analytics"}
                onClick={() => {
                  if (soundEnabled) sound.playKeyClick();
                  setActiveTab("analytics");
                }}
                className={`min-h-11 rounded-xl px-3 text-sm font-semibold text-center transition-colors ${
                  activeTab === "analytics"
                    ? "bg-[#E4E9E6] text-[#111515]"
                    : "text-[#AAB2AE] hover:bg-[#202627] hover:text-white"
                }`}
              >
                Progress
              </button>
            </div>

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

              {activeTab === "analytics" && (
                <AnalyticsDashboardView
                  onOpenScenarioSimulator={handleOpenScenarioSimulator}
                  onOpenLearnHub={(topicId) => {
                    if (soundEnabled) sound.playNodeSwitch();
                    setLearnHubInitialTopicId(topicId);
                    setLearnHubOpen(true);
                  }}
                />
              )}
            </div>

          </div>
        )}
      </div>

      {/* Confirmation Modal for Reset Session */}
      {isResetConfirmOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-progress-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
        >
          <div className="w-full max-w-md space-y-4 rounded-2xl border border-[#343B3B] bg-[#171B1C] p-6 shadow-2xl">
            <div id="reset-progress-title" className="flex items-center gap-2 font-semibold text-red-300">
              <AlertTriangle className="w-4 h-4" />
              <span>Reset study progress?</span>
            </div>
            <p className="text-sm leading-relaxed text-[#BCC4C0]">
              This removes completed topics, practice scores, mistake history, and review cards. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 text-sm">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="min-h-11 rounded-xl border border-[#343B3B] px-4 font-medium text-[#D4D9D6] hover:bg-[#202627] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetProgress();
                  setIsResetConfirmOpen(false);
                }}
                className="min-h-11 rounded-xl bg-red-600 px-4 font-semibold text-white hover:bg-red-500"
              >
                Reset progress
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
      <MockExamModal isOpen={isMockExamOpen} onClose={() => setMockExamOpen(false)} />
      <TopicLearningHubModal
        isOpen={isLearnHubOpen}
        onClose={() => setLearnHubOpen(false)}
        initialTopicId={learnHubInitialTopicId}
      />
      <AuthSyncModal isOpen={isAuthSyncOpen} onClose={() => setAuthSyncOpen(false)} />

      {/* Footer */}
      <Footer />
    </main>
  );
}

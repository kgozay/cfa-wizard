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
import { CFAWizardMark } from "@/components/brand/CFAWizardMark";
import { TopicContextBar } from "@/components/common/TopicContextBar";
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

  const TABS = [
    { id: "tracks" as const, label: "Study" },
    { id: "simulator" as const, label: "Practice" },
    { id: "recall" as const, label: "Review" },
    { id: "analytics" as const, label: "Progress" },
  ];
  const tabRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  const handleTabKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex = -1;
    if (e.key === "ArrowRight") {
      nextIndex = (index + 1) % TABS.length;
    } else if (e.key === "ArrowLeft") {
      nextIndex = (index - 1 + TABS.length) % TABS.length;
    } else if (e.key === "Home") {
      nextIndex = 0;
    } else if (e.key === "End") {
      nextIndex = TABS.length - 1;
    }

    if (nextIndex !== -1) {
      e.preventDefault();
      const nextTab = TABS[nextIndex];
      setActiveTab(nextTab.id);
      tabRefs.current[nextIndex]?.focus();
      if (soundEnabled) sound.playKeyClick();
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-background text-foreground selection:bg-accent selection:text-accent-ink font-sans">
      <header className="sticky top-0 z-40 w-full glass-shell">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex min-h-11 items-center gap-3 rounded-lg pr-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <CFAWizardMark className="h-5 w-5" />
            <span className="text-base font-bold tracking-tight text-foreground">CFA Wizard</span>
            <span className="hidden text-xs font-medium text-muted sm:inline">Level I study</span>
          </Link>

          <nav aria-label="Study tools" className="hidden items-center gap-1 md:flex">
            <button
              onClick={() => {
                if (soundEnabled) sound.playNodeSwitch();
                setLearnHubInitialTopicId(useCFAStore.getState().activeTopicId || "01");
                setLearnHubOpen(true);
              }}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium text-muted hover:bg-surface-interactive hover:text-foreground transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              Learn
            </button>
            <button
              onClick={() => setCalculatorOpen(true)}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium text-muted hover:bg-surface-interactive hover:text-foreground transition-colors"
            >
              <Calculator className="h-4 w-4" />
              Calculator
            </button>
            <button
              onClick={() => setFormulaSheetOpen(true)}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium text-muted hover:bg-surface-interactive hover:text-foreground transition-colors"
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
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-surface-interactive/60 px-3.5 text-sm font-semibold text-foreground transition-all hover:bg-surface-interactive hover:border-accent/40 active:scale-[0.98]"
            >
              <Award className="h-4 w-4 text-accent" />
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
                    ? "border-accent/50 bg-accent/10 text-accent"
                    : "border-border text-muted hover:bg-surface-interactive hover:text-foreground"
                }`}
              >
                <Settings className="h-5 w-5" />
              </button>

              {isSettingsOpen && (
                <div id="study-tools-menu" className="absolute right-0 z-50 mt-2 w-72 space-y-1 rounded-2xl border border-border bg-surface-raised p-2 text-sm shadow-2xl">
                  <p className="px-3 py-2 text-sm font-semibold text-foreground">Study tools</p>

                  <button
                    onClick={() => {
                      setIsSettingsOpen(false);
                      setLearnHubInitialTopicId(useCFAStore.getState().activeTopicId || "01");
                      setLearnHubOpen(true);
                    }}
                    className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-muted-strong hover:bg-surface-interactive md:hidden"
                  >
                    <BookOpen className="h-4 w-4" />
                    Learning hub
                  </button>
                  <button
                    onClick={() => {
                      setIsSettingsOpen(false);
                      setCalculatorOpen(true);
                    }}
                    className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-muted-strong hover:bg-surface-interactive md:hidden"
                  >
                    <Calculator className="h-4 w-4" />
                    BA II Plus calculator
                  </button>
                  <button
                    onClick={() => {
                      setIsSettingsOpen(false);
                      setFormulaSheetOpen(true);
                    }}
                    className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-muted-strong hover:bg-surface-interactive md:hidden"
                  >
                    <FileText className="h-4 w-4" />
                    Formula reference
                  </button>

                  <button
                    onClick={() => {
                      setIsSettingsOpen(false);
                      setTrapLogOpen(true);
                    }}
                    className="flex min-h-11 w-full items-center justify-between rounded-xl px-3 text-left text-muted-strong hover:bg-surface-interactive"
                  >
                    <span className="flex items-center gap-3"><AlertTriangle className="h-4 w-4 text-warning" />Mistake review</span>
                    <span className="text-sm font-mono text-muted tabular-nums">{trapLogs.length}</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsSettingsOpen(false);
                      setShortcutsOpen(true);
                    }}
                    className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-muted-strong hover:bg-surface-interactive"
                  >
                    <Keyboard className="h-4 w-4" />
                    Keyboard shortcuts
                  </button>
                  <button
                    onClick={toggleSound}
                    className="flex min-h-11 w-full items-center justify-between rounded-xl px-3 text-left text-muted-strong hover:bg-surface-interactive"
                  >
                    <span className="flex items-center gap-3">
                      {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-muted" />}
                      Sound
                    </span>
                    <span className="text-sm text-muted">{soundEnabled ? "On" : "Off"}</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsSettingsOpen(false);
                      setAuthSyncOpen(true);
                    }}
                    className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-muted-strong hover:bg-surface-interactive"
                  >
                    <Cloud className="h-4 w-4" />
                    Backup and sync
                  </button>

                  <div className="my-1 border-t border-border" />
                  <button
                    onClick={() => {
                      setIsSettingsOpen(false);
                      setIsResetConfirmOpen(true);
                    }}
                    className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-danger hover:bg-danger/10"
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
            {activeTab === "tracks" ? (
              <CurrentAssignmentCard
                onOpenBriefing={handleOpenBriefing}
                onOpenScenarioSimulator={handleOpenScenarioSimulator}
              />
            ) : (
              <TopicContextBar
                onStartPractice={() => handleOpenScenarioSimulator(useCFAStore.getState().activeTopicId || "01")}
              />
            )}

            <div
              role="tablist"
              aria-label="Study views"
              className="grid w-full grid-cols-4 gap-1 rounded-xl glass-shell p-1.5"
            >
              {TABS.map((tab, idx) => {
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    ref={(el) => {
                      tabRefs.current[idx] = el;
                    }}
                    role="tab"
                    id={`tab-${tab.id}`}
                    aria-controls={`tabpanel-${tab.id}`}
                    aria-selected={isSelected}
                    tabIndex={isSelected ? 0 : -1}
                    onKeyDown={(e) => handleTabKeyDown(e, idx)}
                    onClick={() => {
                      if (soundEnabled) sound.playKeyClick();
                      setActiveTab(tab.id);
                    }}
                    className={`relative min-h-[44px] rounded-lg px-2 py-2.5 text-center text-xs sm:text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                      isSelected
                        ? "bg-surface-interactive text-accent shadow-sm"
                        : "text-muted hover:bg-surface-interactive/60 hover:text-foreground active:scale-[0.98]"
                    }`}
                  >
                    <span className="truncate">{tab.label}</span>
                    {isSelected && (
                      <span
                        aria-hidden="true"
                        className="absolute bottom-1 left-3 right-3 sm:left-6 sm:right-6 h-[2px] rounded-full bg-accent transition-all duration-150"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div
              role="tabpanel"
              id={`tabpanel-${activeTab}`}
              aria-labelledby={`tab-${activeTab}`}
            >
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

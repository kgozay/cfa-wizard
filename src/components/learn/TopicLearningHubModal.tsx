"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  BookOpen,
  X,
  Sparkles,
  Cpu,
  AlertTriangle,
  Calculator,
  ArrowRight,
  Eye,
  EyeOff } from "lucide-react";
import { CFA_TOPIC_GUIDES, TopicGuide, LOSGuide } from "@/data/topicGuides";
import { KaTeXRenderer } from "@/components/common/KaTeXRenderer";
import { KeystrokeSequence } from "@/components/calculator/KeystrokeBadge";
import { useCFAStore } from "@/store/useCFAStore";
import { CFA_CURRICULUM } from "@/data/curriculum";
import { sound } from "@/components/common/SoundEffects";

interface TopicLearningHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopicId?: string;
}

export const TopicLearningHubModal: React.FC<TopicLearningHubModalProps> = ({
  isOpen,
  onClose,
  initialTopicId = "01" }) => {
  const {
    soundEnabled,
    startVignetteDrill,
    setCalculatorMode } = useCFAStore();

  const [activeTopicId, setActiveTopicId] = useState<string>(initialTopicId);
  const [activeLOSIndex, setActiveLOSIndex] = useState<number>(0);
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (initialTopicId) {
      setActiveTopicId(initialTopicId);
      setActiveLOSIndex(0);
    }
  }, [initialTopicId, isOpen]);

  const currentGuide: TopicGuide = useMemo(() => {
    const found = CFA_TOPIC_GUIDES.find((g) => g.topicId === activeTopicId);
    if (found) return found;

    const cur = CFA_CURRICULUM.find((t) => t.id === activeTopicId);
    if (!cur) return CFA_TOPIC_GUIDES[0];

    return {
      topicId: cur.id,
      topicName: cur.name,
      weight: cur.weight,
      highYieldTheme: cur.highYieldTrapArea,
      firstPrinciplesSummary: cur.executiveSummary[0] || cur.highYieldTrapArea,
      losGuides: cur.subReadings.map((sr) => ({
        losCode: sr.losCode || `LOS ${sr.readingNumber}`,
        title: sr.title,
        coreConcept: sr.losStatement || sr.title,
        workedExample: {
          scenario: `Assessment context focusing on ${sr.title}.`,
          question: `How should a candidate apply principles for ${sr.title}?`,
          solutionSteps: [
            `Analyze the core framework: ${sr.losStatement || sr.title}`,
            `Identify and eliminate common distractor trap: ${sr.coreTrap || "Unverified assumption"}`,
          ],
          finalAnswer: `Apply the explicit requirements specified under ${sr.losCode || "core LOS"}.` },
        trapMatrix: [
          {
            trapName: "Common trap",
            examinerDistractor: sr.coreTrap || "Common misinterpretation of rule or calculation",
            remediationRule: `Review ${sr.title} principles and verify against LOS requirements.` },
        ] })) };
  }, [activeTopicId]);

  if (!isOpen) return null;

  const currentLOS: LOSGuide = currentGuide.losGuides[activeLOSIndex] || currentGuide.losGuides[0];

  const isSolutionRevealed = !!revealedSolutions[`${currentGuide.topicId}-${currentLOS.losCode}`];

  const toggleSolutionReveal = () => {
    if (soundEnabled) sound.playKeyClick();
    const key = `${currentGuide.topicId}-${currentLOS.losCode}`;
    setRevealedSolutions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleLaunchDrill = () => {
    if (soundEnabled) sound.playSuccessChime();
    startVignetteDrill(activeTopicId);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="learn-hub-title"
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
    >
      <div className="liquid-glass-card rounded-2xl max-w-6xl w-full h-[92vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        
        {/* Top Header Bar */}
        <header className="h-16 px-4 sm:px-6 bg-white/[0.02] border-b border-white/[0.04] flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-accent/20 flex items-center justify-center text-accent font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span id="learn-hub-title" className="text-xs font-bold text-white">
                  Learning hub
                </span>
                <span className="px-1.5 py-0.2 rounded bg-accent/10 border border-accent/30 text-accent tabular-nums text-[10px] font-bold">
                  Concepts and worked examples
                </span>
              </div>
              <p className="text-[11px] text-muted tabular-nums">
                Concepts, calculator keystrokes and common traps for each topic
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (soundEnabled) sound.playKeyClick();
                setCalculatorMode("floating");
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-interactive hover:bg-surface-raised text-warning border border-control tabular-nums text-xs font-bold transition-all"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Calculator</span>
            </button>

            <button
              onClick={onClose}
              aria-label="Close learning hub"
              className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-muted hover:text-white hover:bg-surface-raised transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left Sidebar: Topic Selector */}
          <aside className="w-full md:w-64 bg-background border-r border-control p-3 space-y-1.5 overflow-y-auto shrink-0 select-none">
            <span className="text-[11px] text-muted font-bold px-2 py-1 block">
              Curriculum Tracks:
            </span>

            {CFA_CURRICULUM.map((topic) => {
              const isSelected = topic.id === activeTopicId;
              return (
                <button
                  key={topic.id}
                  onClick={() => {
                    if (soundEnabled) sound.playKeyClick();
                    setActiveTopicId(topic.id);
                    setActiveLOSIndex(0);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 tabular-nums text-xs ${
                    isSelected
                      ? "bg-accent/15 border-accent text-white "
                      : "bg-background-elevated border-transparent text-muted hover:text-foreground hover:bg-surface-interactive"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className={`font-bold ${
                        isSelected ? "text-accent" : "text-muted"
                      }`}
                    >
                      [{topic.id}]
                    </span>
                    <span className="truncate font-sans font-medium text-xs">
                      {topic.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted shrink-0 tabular-nums">
                    {topic.weight}
                  </span>
                </button>
              );
            })}
          </aside>

          {/* Right Main Learning Area */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 bg-background-elevated">
            
            {/* Topic Header Hero Banner */}
            <div className="p-6 bg-gradient-to-r from-surface-interactive via-surface-interactive to-surface border border-control rounded-2xl space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-accent text-accent-ink text-xs font-semibold">
                    TRACK {currentGuide.topicId}
                  </span>
                  <span className="text-xs tabular-nums text-muted">
                    Exam weight {currentGuide.weight}
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded bg-surface-raised text-accent tabular-nums text-[11px] border border-accent/30">
                  {currentGuide.highYieldTheme}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                {currentGuide.topicName}
              </h1>

              <p className="text-xs sm:text-sm text-muted-strong font-sans leading-relaxed">
                {currentGuide.firstPrinciplesSummary}
              </p>
            </div>

            {/* LOS Selection Tabs */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <span>Learning outcomes</span>
                </h2>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 tabular-nums text-xs">
                {currentGuide.losGuides.map((los, idx) => (
                  <button
                    key={los.losCode}
                    onClick={() => {
                      if (soundEnabled) sound.playKeyClick();
                      setActiveLOSIndex(idx);
                    }}
                    className={`px-3.5 py-2 rounded-xl border transition-all whitespace-nowrap flex items-center gap-2 ${
                      activeLOSIndex === idx
                        ? "bg-accent text-accent-ink font-bold border-accent "
                        : "bg-surface-interactive text-muted border-control hover:text-white"
                    }`}
                  >
                    <span>{los.losCode}</span>
                    <span className="text-[11px] font-normal truncate max-w-[180px]">
                      {los.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Detailed Concept Module */}
            <div className="space-y-6 bg-background-elevated border border-control rounded-2xl p-6">
              
              {/* Concept Title & Core Theory */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 tabular-nums text-xs text-accent font-bold">
                  <span>{currentLOS.losCode}</span>
                  <span>{"//"}</span>
                  <span>{currentLOS.title}</span>
                </div>
                <p className="text-sm text-foreground font-sans leading-relaxed">
                  {currentLOS.coreConcept}
                </p>
              </div>

              {/* Mathematical Formulation (LaTeX) */}
              {currentLOS.formulaLatex && (
                <div className="p-4 bg-surface-interactive border border-accent/30 rounded-xl space-y-2">
                  <span className="text-[11px] font-bold text-accent block">
                    Formula:
                  </span>
                  <div className="py-2 overflow-x-auto text-white">
                    <KaTeXRenderer math={currentLOS.formulaLatex} block />
                  </div>
                  {currentLOS.formulaExplanation && (
                    <p className="text-xs text-muted font-sans leading-relaxed pt-1 border-t border-white/5">
                      {currentLOS.formulaExplanation}
                    </p>
                  )}
                </div>
              )}

              {/* Texas Instruments BA II Plus Keystroke Masterclass */}
              {currentLOS.calculatorGuide && (
                <div className="p-4 bg-surface-interactive border border-warning/30 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-warning flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5" />
                      <span>BA II Plus keystrokes</span>
                    </span>
                    <span className="text-[10px] tabular-nums text-muted">
                      Step by step
                    </span>
                  </div>

                  <p className="text-xs text-muted-strong font-sans">
                    {currentLOS.calculatorGuide.summary}
                  </p>

                  <div className="p-2.5 bg-background rounded-lg border border-control">
                    <KeystrokeSequence sequence={currentLOS.calculatorGuide.keystrokes} />
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {currentLOS.calculatorGuide.keyRegisters.map((reg, rIdx) => (
                      <span
                        key={rIdx}
                        className="px-2 py-0.5 rounded bg-surface-raised text-muted-strong tabular-nums text-[10px] border border-control"
                      >
                        {reg}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Concrete Worked Exam Scenario */}
              <div className="p-5 bg-surface-interactive border border-control rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-accent" />
                    <span>Worked example</span>
                  </span>
                  <button
                    onClick={toggleSolutionReveal}
                    className="flex items-center gap-1 text-xs tabular-nums font-bold text-accent hover:underline"
                  >
                    {isSolutionRevealed ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Hide worked solution</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Show worked solution</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-2 text-xs sm:text-sm text-foreground font-sans leading-relaxed">
                  <p className="font-medium text-muted-strong">{currentLOS.workedExample.scenario}</p>
                  <p className="text-accent font-semibold">{currentLOS.workedExample.question}</p>
                </div>

                {/* Revealable Solution Proof */}
                {isSolutionRevealed && (
                  <div className="p-4 bg-background border border-accent/40 rounded-xl space-y-3 animate-in fade-in duration-150">
                    <span className="text-[11px] font-bold text-accent block">
                      Worked solution:
                    </span>
                    <ol className="space-y-1.5 list-decimal list-inside text-xs text-muted-strong font-sans">
                      {currentLOS.workedExample.solutionSteps.map((step, sIdx) => (
                        <li key={sIdx} className="leading-relaxed">
                          {step}
                        </li>
                      ))}
                    </ol>
                    <div className="pt-2 border-t border-control flex items-center justify-between tabular-nums text-xs font-bold text-white">
                      <span>Result:</span>
                      <span className="text-accent text-sm">
                        {currentLOS.workedExample.finalAnswer}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Pitfall Avoidance Matrix */}
              {currentLOS.trapMatrix && currentLOS.trapMatrix.length > 0 && (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-danger flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Common traps</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentLOS.trapMatrix.map((t, tIdx) => (
                      <div
                        key={tIdx}
                        className="p-4 bg-surface-interactive border border-danger/30 rounded-xl space-y-2 tabular-nums text-xs"
                      >
                        <div className="font-bold text-danger text-[11px]">
                          {t.trapName}
                        </div>
                        <p className="text-muted-strong font-sans text-xs leading-relaxed">
                          <span className="text-muted">Examiner Setup:</span> {t.examinerDistractor}
                        </p>
                        <div className="pt-1.5 border-t border-danger/20 text-accent font-sans text-xs font-medium">
                          Rule: {t.remediationRule}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Call to Action: Launch Focused Drill */}
            <div className="p-6 bg-gradient-to-r from-accent/10 via-surface-interactive to-surface border border-accent/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white font-sans">
                  Ready to test your comprehension under exam conditions?
                </h3>
                <p className="text-xs text-muted font-sans mt-0.5">
                  Launch a surgical diagnostic drill targeting Topic {currentGuide.topicId} with full autopsies.
                </p>
              </div>

              <button
                onClick={handleLaunchDrill}
                className="px-6 py-3 rounded-xl bg-accent hover:bg-accent-strong text-accent-ink tabular-nums text-xs font-semibold transition-all active:scale-[0.99] flex items-center gap-2 shrink-0"
              >
                <span>Practise {currentGuide.topicName}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

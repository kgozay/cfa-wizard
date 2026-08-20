"use client";

import React, { useState } from "react";
import {
  BookOpen,
  X,
  Sparkles,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Calculator,
  ArrowRight,
  HelpCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { CFA_TOPIC_GUIDES, TopicGuide, LOSGuide } from "@/data/topicGuides";
import { FormattedMathText, KaTeXRenderer } from "@/components/common/KaTeXRenderer";
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
  initialTopicId = "01",
}) => {
  const {
    soundEnabled,
    startVignetteDrill,
    setCalculatorMode,
  } = useCFAStore();

  const [activeTopicId, setActiveTopicId] = useState<string>(initialTopicId);
  const [activeLOSIndex, setActiveLOSIndex] = useState<number>(0);
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const currentGuide: TopicGuide =
    CFA_TOPIC_GUIDES.find((g) => g.topicId === activeTopicId) || CFA_TOPIC_GUIDES[0];

  const currentCurriculumTopic = CFA_CURRICULUM.find((t) => t.id === activeTopicId);
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
    const vigId = `vignette-${activeTopicId}-${
      activeTopicId === "01"
        ? "quant"
        : activeTopicId === "04"
        ? "fsa"
        : activeTopicId === "06"
        ? "fixedinc"
        : "ethics"
    }`;
    startVignetteDrill(vigId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#0A0A0D] border border-[#27272A] rounded-2xl max-w-6xl w-full h-[92vh] flex flex-col shadow-[0_25px_70px_rgba(0,0,0,0.95)] overflow-hidden font-sans">
        
        {/* Top Header Bar */}
        <header className="h-16 px-4 sm:px-6 bg-[#0E0E12] border-b border-[#1F1F23] flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-lime/20 border border-brand-lime/40 flex items-center justify-center text-brand-lime font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                  CFA® INSTITUTIONAL LEARNING HUB
                </span>
                <span className="px-1.5 py-0.2 rounded bg-brand-lime/10 border border-brand-lime/30 text-brand-lime font-mono text-[10px] font-bold">
                  FIRST-PRINCIPLES
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">
                Concept Derivations • Keystroke Mechanics • Pitfall Avoidance Matrix
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (soundEnabled) sound.playKeyClick();
                setCalculatorMode("floating");
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141418] hover:bg-[#1C1C22] text-amber-300 border border-[#27272A] font-mono text-xs font-bold transition-all"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>BA II+ EMULATOR</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#1A1A20] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left Sidebar: Topic Selector */}
          <aside className="w-full md:w-64 bg-[#08080A] border-r border-[#1F1F23] p-3 space-y-1.5 overflow-y-auto shrink-0 select-none">
            <span className="text-[11px] font-mono text-zinc-400 uppercase font-bold px-2 py-1 block">
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
                  className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 font-mono text-xs ${
                    isSelected
                      ? "bg-brand-lime/15 border-brand-lime text-white shadow-lime-sm"
                      : "bg-[#0E0E12] border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-[#141418]"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className={`font-bold ${
                        isSelected ? "text-brand-lime" : "text-zinc-400"
                      }`}
                    >
                      [{topic.id}]
                    </span>
                    <span className="truncate font-sans font-medium text-xs">
                      {topic.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400 shrink-0 font-mono">
                    {topic.weight}
                  </span>
                </button>
              );
            })}
          </aside>

          {/* Right Main Learning Area */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 bg-[#0B0B0E]">
            
            {/* Topic Header Hero Banner */}
            <div className="p-6 bg-gradient-to-r from-[#121218] via-[#0E0E14] to-[#0A0A0E] border border-[#222228] rounded-2xl space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-brand-lime text-black font-mono text-xs font-extrabold uppercase">
                    TRACK {currentGuide.topicId}
                  </span>
                  <span className="text-xs font-mono text-zinc-400">
                    EXAM WEIGHT: {currentGuide.weight}
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded bg-[#18181F] text-brand-lime font-mono text-[11px] border border-brand-lime/30">
                  {currentGuide.highYieldTheme}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {currentGuide.topicName}
              </h1>

              <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed">
                {currentGuide.firstPrinciplesSummary}
              </p>
            </div>

            {/* LOS Selection Tabs */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-lime" />
                  <span>Learning Outcome Statements (LOS Focus)</span>
                </h2>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 font-mono text-xs">
                {currentGuide.losGuides.map((los, idx) => (
                  <button
                    key={los.losCode}
                    onClick={() => {
                      if (soundEnabled) sound.playKeyClick();
                      setActiveLOSIndex(idx);
                    }}
                    className={`px-3.5 py-2 rounded-xl border transition-all whitespace-nowrap flex items-center gap-2 ${
                      activeLOSIndex === idx
                        ? "bg-brand-lime text-black font-bold border-brand-lime shadow-lime-sm"
                        : "bg-[#121216] text-zinc-400 border-[#222226] hover:text-white"
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
            <div className="space-y-6 bg-[#0E0E12] border border-[#1F1F23] rounded-2xl p-6">
              
              {/* Concept Title & Core Theory */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-mono text-xs text-brand-lime font-bold">
                  <span>{currentLOS.losCode}</span>
                  <span>//</span>
                  <span>{currentLOS.title}</span>
                </div>
                <p className="text-sm text-zinc-200 font-sans leading-relaxed">
                  {currentLOS.coreConcept}
                </p>
              </div>

              {/* Mathematical Formulation (LaTeX) */}
              {currentLOS.formulaLatex && (
                <div className="p-4 bg-[#121218] border border-brand-lime/30 rounded-xl space-y-2">
                  <span className="text-[11px] font-mono font-bold text-brand-lime uppercase block">
                    Canonical Mathematical Formulation:
                  </span>
                  <div className="py-2 overflow-x-auto text-white">
                    <KaTeXRenderer math={currentLOS.formulaLatex} block />
                  </div>
                  {currentLOS.formulaExplanation && (
                    <p className="text-xs text-zinc-400 font-sans leading-relaxed pt-1 border-t border-white/5">
                      {currentLOS.formulaExplanation}
                    </p>
                  )}
                </div>
              )}

              {/* Texas Instruments BA II Plus Keystroke Masterclass */}
              {currentLOS.calculatorGuide && (
                <div className="p-4 bg-[#101016] border border-amber-400/30 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-300 uppercase flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5" />
                      <span>TI BA II Plus Exam Workflow</span>
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      Standardized Keystroke Path
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 font-sans">
                    {currentLOS.calculatorGuide.summary}
                  </p>

                  <div className="p-2.5 bg-[#09090C] rounded-lg border border-[#27272A]">
                    <KeystrokeSequence sequence={currentLOS.calculatorGuide.keystrokes} />
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {currentLOS.calculatorGuide.keyRegisters.map((reg, rIdx) => (
                      <span
                        key={rIdx}
                        className="px-2 py-0.5 rounded bg-[#18181F] text-zinc-300 font-mono text-[10px] border border-[#27272A]"
                      >
                        {reg}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Concrete Worked Exam Scenario */}
              <div className="p-5 bg-[#121217] border border-[#222228] rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-brand-lime" />
                    <span>Worked CFA-Grade Practice Scenario</span>
                  </span>
                  <button
                    onClick={toggleSolutionReveal}
                    className="flex items-center gap-1 text-xs font-mono font-bold text-brand-lime hover:underline"
                  >
                    {isSolutionRevealed ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>HIDE DERIVATION</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>REVEAL SOLUTION PROOF</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-2 text-xs sm:text-sm text-zinc-200 font-sans leading-relaxed">
                  <p className="font-medium text-zinc-300">{currentLOS.workedExample.scenario}</p>
                  <p className="text-brand-lime font-semibold">{currentLOS.workedExample.question}</p>
                </div>

                {/* Revealable Solution Proof */}
                {isSolutionRevealed && (
                  <div className="p-4 bg-[#09090C] border border-brand-lime/40 rounded-xl space-y-3 animate-in fade-in duration-150">
                    <span className="text-[11px] font-mono font-bold text-brand-lime uppercase block">
                      Step-by-Step Algebraic Derivation:
                    </span>
                    <ol className="space-y-1.5 list-decimal list-inside text-xs text-zinc-300 font-sans">
                      {currentLOS.workedExample.solutionSteps.map((step, sIdx) => (
                        <li key={sIdx} className="leading-relaxed">
                          {step}
                        </li>
                      ))}
                    </ol>
                    <div className="pt-2 border-t border-[#1F1F24] flex items-center justify-between font-mono text-xs font-bold text-white">
                      <span>FINAL CANONICAL RESULT:</span>
                      <span className="text-brand-lime text-sm">
                        {currentLOS.workedExample.finalAnswer}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Pitfall Avoidance Matrix */}
              {currentLOS.trapMatrix && currentLOS.trapMatrix.length > 0 && (
                <div className="space-y-3">
                  <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Pitfall Avoidance Matrix (Examiner Distractor Traps)</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentLOS.trapMatrix.map((t, tIdx) => (
                      <div
                        key={tIdx}
                        className="p-4 bg-[#140F0F] border border-red-500/30 rounded-xl space-y-2 font-mono text-xs"
                      >
                        <div className="font-bold text-red-300 text-[11px] uppercase">
                          {t.trapName}
                        </div>
                        <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                          <span className="text-zinc-400">Examiner Setup:</span> {t.examinerDistractor}
                        </p>
                        <div className="pt-1.5 border-t border-red-500/20 text-brand-lime font-sans text-xs font-medium">
                          Rule: {t.remediationRule}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Call to Action: Launch Focused Drill */}
            <div className="p-6 bg-gradient-to-r from-brand-lime/10 via-[#121216] to-[#0A0A0D] border border-brand-lime/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white font-sans">
                  Ready to test your comprehension under exam conditions?
                </h3>
                <p className="text-xs text-zinc-400 font-sans mt-0.5">
                  Launch a surgical diagnostic drill targeting Topic {currentGuide.topicId} with full autopsies.
                </p>
              </div>

              <button
                onClick={handleLaunchDrill}
                className="px-6 py-3 rounded-xl bg-brand-lime hover:bg-brand-neon text-black font-mono text-xs font-extrabold shadow-lime-glow transition-all active:scale-[0.99] flex items-center gap-2 shrink-0"
              >
                <span>DRILL TOPIC {currentGuide.topicId} NOW</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

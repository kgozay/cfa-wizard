"use client";

import React, { useState } from "react";
import { X, Play, BookOpen, Calculator, Sparkles, CheckCircle2, ChevronRight } from "lucide-react";
import { CFA_CURRICULUM } from "@/data/curriculum";
import { CFA_VIGNETTES } from "@/data/vignettes";
import { useCFAStore } from "@/store/useCFAStore";
import { KaTeXRenderer } from "@/components/common/KaTeXRenderer";
import { KeystrokeSequence } from "@/components/calculator/KeystrokeBadge";
import { sound } from "@/components/common/SoundEffects";

export const ExecutiveBriefingModal: React.FC = () => {
  const {
    activeTopicId,
    setActiveBriefing,
    isBriefingModalOpen,
    startVignetteDrill,
    setCalculatorOpen,
    soundEnabled,
  } = useCFAStore();

  const [sandboxInputs, setSandboxInputs] = useState<Record<string, number>>({});

  if (!isBriefingModalOpen || !activeTopicId) return null;

  const topic = CFA_CURRICULUM.find((t) => t.id === activeTopicId) || CFA_CURRICULUM[0];
  const activeVignette = CFA_VIGNETTES.find((v) => v.topicId === topic.id) || CFA_VIGNETTES[0];

  const handleLaunchDrill = () => {
    if (soundEnabled) sound.playNodeSwitch();
    startVignetteDrill(activeVignette.id);
  };

  const handleClose = () => {
    if (soundEnabled) sound.playKeyClick();
    setActiveBriefing(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-[#0B0B0E] border border-[#27272A] rounded-xl shadow-2xl overflow-hidden flex flex-col font-sans max-h-[90vh]">
        
        {/* Top Header */}
        <div className="p-5 border-b border-[#1F1F23] bg-[#0E0E12] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-brand-lime px-2 py-0.5 rounded bg-brand-lime/10 border border-brand-lime/30">
              TRACK {topic.id}
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {topic.name}
              </h2>
              <span className="text-xs font-mono text-editorial-dim">
                EXECUTIVE BRIEFING // WEIGHT: {topic.weight}
              </span>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-editorial-muted hover:text-white hover:bg-[#1F1F23] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-8 overflow-y-auto">
          
          {/* Section 1: Executive Summary Bullet Points */}
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-brand-lime tracking-wider uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>HIGH-YIELD EXECUTIVE SUMMARY & TRAP MATRIX</span>
            </div>
            
            <div className="grid gap-3">
              {topic.executiveSummary.map((bullet, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-lg bg-[#121215] border border-[#1F1F23] flex items-start gap-3"
                >
                  <div className="w-5 h-5 rounded bg-[#18181B] border border-[#27272A] flex items-center justify-center text-editorial-muted font-mono text-xs shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-xs sm:text-sm text-editorial-steely leading-relaxed">
                    {bullet}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Formulas & Texas Instruments BA II Plus Keystroke Badges */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 font-mono text-xs text-editorial-muted tracking-wider uppercase">
                <Calculator className="w-3.5 h-3.5 text-brand-lime" />
                <span>FORMULA & TI BA II PLUS KEYSTROKE MATRIX</span>
              </div>
              <button
                onClick={() => {
                  if (soundEnabled) sound.playKeyClick();
                  setCalculatorOpen(true);
                }}
                className="text-xs font-mono text-brand-lime hover:underline flex items-center gap-1"
              >
                <span>Launch BA II+ Emulator</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-4">
              {topic.formulas.map((f) => (
                <div
                  key={f.id}
                  className="p-4 rounded-xl bg-[#09090B] border border-[#1F1F23] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-white">
                      {f.title}
                    </h4>
                    <span className="font-mono text-[10px] text-editorial-dim">
                      {f.id}
                    </span>
                  </div>

                  {/* Math Formula Display */}
                  <KaTeXRenderer math={f.latex} block />

                  {/* Description */}
                  <p className="text-xs text-editorial-steely">
                    {f.description}
                  </p>

                  {/* Calculator Keystroke Sequence */}
                  {f.calculatorKeystrokes && (
                    <div className="pt-2 border-t border-[#18181B] space-y-1.5">
                      <div className="font-mono text-[10px] text-editorial-dim uppercase">
                        TI BA II PLUS KEYSTROKE WORKFLOW:
                      </div>
                      <KeystrokeSequence sequence={f.calculatorKeystrokes} />
                    </div>
                  )}

                  {/* Interactive Sandbox for Formulas with Variables */}
                  {f.variables && f.compute && (
                    <div className="mt-3 pt-3 border-t border-[#18181B] bg-[#121215]/80 p-3 rounded-lg font-mono text-xs">
                      <div className="text-[11px] font-bold text-brand-lime mb-2 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3" />
                        <span>LIVE FORMULA SANDBOX:</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                        {f.variables.map((v) => {
                          const val = sandboxInputs[v.symbol] !== undefined ? sandboxInputs[v.symbol] : v.defaultVal;
                          return (
                            <div key={v.symbol} className="bg-[#09090B] p-2 rounded border border-[#27272A]">
                              <span className="text-[10px] text-editorial-dim block">{v.name}</span>
                              <div className="flex items-center gap-2 mt-1">
                                <input
                                  type="number"
                                  step={v.step || 0.01}
                                  value={val}
                                  onChange={(e) =>
                                    setSandboxInputs({
                                      ...sandboxInputs,
                                      [v.symbol]: parseFloat(e.target.value) || 0,
                                    })
                                  }
                                  className="w-full bg-[#18181B] border border-[#3F3F46] rounded px-2 py-0.5 text-xs text-white font-mono"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Result Box */}
                      {(() => {
                        const currentVars: Record<string, number> = {};
                        f.variables.forEach((v) => {
                          currentVars[v.symbol] = sandboxInputs[v.symbol] !== undefined ? sandboxInputs[v.symbol] : v.defaultVal;
                        });
                        const out = f.compute(currentVars);
                        return (
                          <div className="flex items-center justify-between p-2 rounded bg-brand-lime/10 border border-brand-lime/30 text-xs">
                            <span className="text-white font-medium">COMPUTED OUTPUT:</span>
                            <span className="text-brand-lime font-bold text-sm">{out.display}</span>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#1F1F23] bg-[#0E0E12] flex items-center justify-between gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-lg font-mono text-xs text-editorial-muted hover:text-white border border-[#27272A] hover:bg-[#18181B] transition-all"
          >
            RETURN TO DASHBOARD
          </button>
          
          <button
            onClick={handleLaunchDrill}
            className="px-5 py-2.5 rounded-lg bg-brand-lime text-black font-mono text-xs font-bold flex items-center gap-2 hover:bg-brand-neon active:scale-95 transition-all shadow-lime-sm"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>LAUNCH 2-QUESTION VIGNETTE DRILL</span>
          </button>
        </div>

      </div>
    </div>
  );
};

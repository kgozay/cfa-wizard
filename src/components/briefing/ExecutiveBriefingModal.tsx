"use client";

import React, { useState } from "react";
import { X, Play, Calculator, Sparkles, ChevronRight } from "lucide-react";
import { CFA_CURRICULUM } from "@/data/curriculum";
import { CFA_VIGNETTES } from "@/data/vignettes";
import { useCFAStore } from "@/store/useCFAStore";
import { KaTeXRenderer, FormattedMathText } from "@/components/common/KaTeXRenderer";
import { KeystrokeSequence } from "@/components/calculator/KeystrokeBadge";
import { sound } from "@/components/common/SoundEffects";

export const ExecutiveBriefingModal: React.FC = () => {
  const {
    activeTopicId,
    setActiveBriefing,
    isBriefingModalOpen,
    startVignetteDrill,
    setCalculatorOpen,
    drillQuestionCount,
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
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="executive-briefing-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="w-full max-w-4xl liquid-glass-card rounded-2xl shadow-2xl overflow-hidden flex flex-col font-sans max-h-[90vh]">
        
        {/* Top Header */}
        <div className="p-5 border-b border-white/[0.04] bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="tabular-nums text-xs font-bold text-accent px-2.5 py-0.5 rounded-full bg-accent/15">
              TRACK {topic.id}
            </span>
            <div>
              <h2 id="executive-briefing-title" className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {topic.name}
              </h2>
              <span className="text-xs tabular-nums text-slate-400">
                Topic overview · exam weight {topic.weight}
              </span>
            </div>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close executive briefing"
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-white glass-pill-btn transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-8 overflow-y-auto">
          
          {/* Section 1: Executive Summary Bullet Points */}
          <div>
            <div className="flex items-center gap-2 text-xs text-accent mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Key points and common traps</span>
            </div>
            
            <div className="grid gap-3">
              {topic.executiveSummary.map((bullet, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.04] flex items-start gap-3"
                >
                  <div className="w-5 h-5 rounded-lg bg-white/[0.04] flex items-center justify-center text-slate-400 tabular-nums text-xs shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    <FormattedMathText text={bullet} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Formulas & Texas Instruments BA II Plus Keystroke Badges */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs text-muted">
                <Calculator className="w-3.5 h-3.5 text-accent" />
                <span>Formulas and BA II Plus keystrokes</span>
              </div>
              <button
                onClick={() => {
                  if (soundEnabled) sound.playKeyClick();
                  setCalculatorOpen(true);
                }}
                className="text-xs tabular-nums text-accent hover:underline flex items-center gap-1"
              >
                <span>Open calculator</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-4">
              {topic.formulas.map((f) => (
                <div
                  key={f.id}
                  className="p-4 rounded-xl bg-background border border-control space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-white">
                      {f.title}
                    </h4>
                    <span className="tabular-nums text-[10px] text-muted">
                      {f.id}
                    </span>
                  </div>

                  {/* Math Formula Display */}
                  <KaTeXRenderer math={f.latex} block />

                  {/* Description */}
                  <div className="text-xs text-muted-strong">
                    <FormattedMathText text={f.description} />
                  </div>

                  {/* Calculator Keystroke Sequence */}
                  {f.calculatorKeystrokes && (
                    <div className="pt-2 border-t border-divider space-y-1.5">
                      <div className="text-[10px] text-muted">
                        BA II Plus keystrokes:
                      </div>
                      <KeystrokeSequence sequence={f.calculatorKeystrokes} />
                    </div>
                  )}

                  {/* Interactive Sandbox for Formulas with Variables */}
                  {f.variables && f.compute && (
                    <div className="mt-3 pt-3 border-t border-divider bg-surface-interactive p-3 rounded-lg tabular-nums text-xs">
                      <div className="text-[11px] font-bold text-accent mb-2 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3" />
                        <span>Try it:</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                        {f.variables.map((v) => {
                          const val = sandboxInputs[v.symbol] !== undefined ? sandboxInputs[v.symbol] : v.defaultVal;
                          return (
                            <div key={v.symbol} className="bg-background p-2 rounded border border-control">
                              <span className="text-[10px] text-muted block">{v.name}</span>
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
                                  className="w-full bg-surface-raised border border-control rounded px-2 py-0.5 text-xs text-white tabular-nums"
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
                          <div className="flex items-center justify-between p-2 rounded bg-accent/10 border border-accent/30 text-xs">
                            <span className="text-white font-medium">Result:</span>
                            <span className="text-accent font-bold text-sm">{out.display}</span>
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
        <div className="p-4 border-t border-white/[0.04] bg-white/[0.02] flex items-center justify-between gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2.5 rounded-xl tabular-nums text-xs text-slate-400 hover:text-white glass-pill-btn transition-all"
          >
            Back to dashboard
          </button>
          
          <button
            onClick={handleLaunchDrill}
            className="lime-btn-primary px-5 py-2.5 rounded-xl tabular-nums text-xs font-bold flex items-center gap-2 transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start {drillQuestionCount}-question practice</span>
          </button>
        </div>

      </div>
    </div>
  );
};

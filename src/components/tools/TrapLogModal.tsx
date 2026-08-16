"use client";

import React from "react";
import { X, AlertTriangle, ShieldCheck, Trash2, ArrowRight } from "lucide-react";
import { useCFAStore } from "@/store/useCFAStore";
import { TRAP_TAXONOMY } from "@/data/trapTaxonomy";
import { sound } from "@/components/common/SoundEffects";
import { FormattedMathText } from "@/components/common/KaTeXRenderer";

export const TrapLogModal: React.FC = () => {
  const { isTrapLogOpen, setTrapLogOpen, trapLogs, startVignetteDrill, selectTopic, soundEnabled } = useCFAStore();

  if (!isTrapLogOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-[#0B0B0E] border border-[#27272A] rounded-xl shadow-2xl overflow-hidden flex flex-col font-sans max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-[#1F1F23] bg-[#0E0E12] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                CANDIDATE TRAP RADAR & WEAK-AREA LOG
              </h3>
              <span className="font-mono text-xs text-editorial-dim">
                REAL-TIME DIAGNOSTIC REVISION OF CANDIDATE DISTRACTOR CHOICES
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              if (soundEnabled) sound.playKeyClick();
              setTrapLogOpen(false);
            }}
            className="p-1.5 rounded-lg text-editorial-muted hover:text-white hover:bg-[#1F1F23] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto">
          
          {trapLogs.length === 0 ? (
            <div className="p-12 text-center space-y-3 bg-[#09090B] border border-[#1F1F23] rounded-xl">
              <ShieldCheck className="w-10 h-10 text-brand-lime mx-auto" />
              <h4 className="text-base font-semibold text-white">
                Zero High-Yield Traps Logged
              </h4>
              <p className="text-xs text-editorial-steely max-w-md mx-auto">
                You have not fallen for any distractor traps in your completed diagnostic sets yet. Keep drilling vignettes to uncover weak spots.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {trapLogs.map((entry) => {
                const taxonomy = TRAP_TAXONOMY[entry.trapName];

                return (
                  <div
                    key={entry.id}
                    className="p-4 rounded-xl bg-[#09090B] border border-[#1F1F23] space-y-3 font-sans text-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#18181B] font-mono text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-bold border border-amber-500/30">
                          {entry.trapName}
                        </span>
                        <span className="text-editorial-muted">
                          Track {entry.topicId} • {entry.topicName}
                        </span>
                      </div>
                      <span className="text-editorial-dim text-[10px]">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <div>
                      <div className="text-white font-medium block mb-1">
                        &quot;<FormattedMathText text={entry.questionStem} />&quot;
                      </div>
                      <div className="flex items-center gap-3 font-mono text-[11px] mt-1">
                        <span className="text-red-400">
                          Selected: <strong>Option {entry.selectedOption}</strong>
                        </span>
                        <span className="text-editorial-dim">|</span>
                        <span className="text-brand-lime">
                          Key: <strong>Option {entry.correctOption}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded bg-[#121215] border border-[#27272A] text-editorial-steely leading-relaxed">
                      <span className="font-mono text-[10px] text-amber-400 font-semibold block mb-0.5">
                        DISTRACTOR AUTOPSY:
                      </span>
                      <FormattedMathText text={entry.autopsyExplanation} />
                    </div>

                    {taxonomy && (
                      <div className="text-[11px] text-editorial-muted font-mono">
                        💡 <strong>Remediation:</strong> <FormattedMathText text={taxonomy.recommendedRemediation} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1F1F23] bg-[#0E0E12] flex items-center justify-between font-mono text-xs">
          <span className="text-editorial-dim">
            Total Traps Recorded: {trapLogs.length}
          </span>
          <button
            onClick={() => {
              if (soundEnabled) sound.playKeyClick();
              setTrapLogOpen(false);
            }}
            className="px-4 py-2 rounded-lg bg-[#18181B] text-white hover:text-brand-lime border border-[#3F3F46]"
          >
            CLOSE
          </button>
        </div>

      </div>
    </div>
  );
};

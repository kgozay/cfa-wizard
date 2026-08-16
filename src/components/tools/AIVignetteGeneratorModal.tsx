"use client";

import React, { useState } from "react";
import { X, Sparkles, Wand2, Play, AlertCircle, Loader2 } from "lucide-react";
import { CFA_CURRICULUM } from "@/data/curriculum";
import { useCFAStore } from "@/store/useCFAStore";
import { sound } from "@/components/common/SoundEffects";
import { VignetteSet } from "@/types/cfa";

export const AIVignetteGeneratorModal: React.FC = () => {
  const { isAIGeneratorOpen, setAIGeneratorOpen, addCustomVignette, inProgressTopicId, soundEnabled } = useCFAStore();
  
  const [selectedTopicId, setSelectedTopicId] = useState<string>(inProgressTopicId || "04");
  const [difficulty, setDifficulty] = useState<"Standard" | "High Trap" | "Institutional">("High Trap");
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  if (!isAIGeneratorOpen) return null;

  const topic = CFA_CURRICULUM.find((t) => t.id === selectedTopicId) || CFA_CURRICULUM[3];

  const handleGenerate = async () => {
    if (soundEnabled) sound.playKeyClick();
    setIsGenerating(true);

    try {
      const res = await fetch("/api/generate-vignette", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicId: selectedTopicId,
          difficulty,
          customPrompt,
        }),
      });

      const data = await res.json();
      if (data.vignette) {
        if (soundEnabled) sound.playNodeSwitch();
        addCustomVignette(data.vignette as VignetteSet);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-200 font-sans">
      <div className="w-full max-w-2xl bg-[#0B0B0E] border border-[#27272A] rounded-xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-[#1F1F23] bg-[#0E0E12] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-lime/10 border border-brand-lime/40 flex items-center justify-center text-brand-lime">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                ON-DEMAND AI VIGNETTE GENERATOR
              </h3>
              <span className="font-mono text-xs text-editorial-dim">
                SYNTHESIZE REALISTIC 2-QUESTION INSTITUTIONAL VIGNETTE SETS
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              if (soundEnabled) sound.playKeyClick();
              setAIGeneratorOpen(false);
            }}
            className="p-1.5 rounded-lg text-editorial-muted hover:text-white hover:bg-[#1F1F23] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <div className="p-6 space-y-5">
          
          {/* Target Track Selector */}
          <div>
            <label className="block font-mono text-xs font-semibold text-white mb-2 uppercase tracking-wide">
              1. Select Curriculum Track:
            </label>
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="w-full bg-[#09090B] border border-[#27272A] rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:border-brand-lime/50"
            >
              {CFA_CURRICULUM.map((t) => (
                <option key={t.id} value={t.id}>
                  Track {t.id}: {t.name} ({t.weight})
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Setting */}
          <div>
            <label className="block font-mono text-xs font-semibold text-white mb-2 uppercase tracking-wide">
              2. Trap Rigor & Difficulty:
            </label>
            <div className="grid grid-cols-3 gap-2 font-mono text-xs">
              {(["Standard", "High Trap", "Institutional"] as const).map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setDifficulty(diff)}
                  className={`py-2 px-3 rounded-lg border text-center font-medium transition-all ${
                    difficulty === diff
                      ? "bg-brand-lime text-black font-bold border-brand-lime shadow-lime-sm"
                      : "bg-[#121215] text-editorial-muted border-[#27272A] hover:text-white"
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Trap Area Context Banner */}
          <div className="p-3.5 rounded-lg bg-[#121215] border border-[#1F1F23] flex items-start gap-2.5 text-xs">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-mono text-[11px] font-bold text-amber-400 block">
                PRIMARY TARGET TRAP IN FOCUS:
              </span>
              <p className="text-editorial-steely text-xs mt-0.5">
                {topic.highYieldTrapArea}
              </p>
            </div>
          </div>

          {/* Optional Prompt Refinement */}
          <div>
            <label className="block font-mono text-xs font-semibold text-white mb-2 uppercase tracking-wide">
              3. Custom Scenario Focus (Optional):
            </label>
            <input
              type="text"
              placeholder="e.g. Callable bond yield shock, LIFO liquidation in high inflation..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="w-full bg-[#09090B] border border-[#27272A] rounded-lg p-2.5 text-xs text-white placeholder:text-editorial-dim focus:outline-none focus:border-brand-lime/50 font-mono"
            />
          </div>

        </div>

        {/* Footer CTA */}
        <div className="p-4 border-t border-[#1F1F23] bg-[#0E0E12] flex items-center justify-between font-mono text-xs">
          <button
            onClick={() => setAIGeneratorOpen(false)}
            className="px-4 py-2 rounded-lg text-editorial-muted hover:text-white"
          >
            CANCEL
          </button>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-5 py-2.5 rounded-lg bg-brand-lime text-black font-bold flex items-center gap-2 hover:bg-brand-neon active:scale-95 transition-all shadow-lime-sm disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>GENERATING VIGNETTE...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>SYNTHESIZE & LAUNCH DRILL</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

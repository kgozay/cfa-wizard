"use client";

import React, { useState } from "react";
import { Wand2, Loader2, AlertCircle, Play, CheckCircle2, ArrowRight } from "lucide-react";
import { CFA_CURRICULUM } from "@/data/curriculum";
import { useCFAStore } from "@/store/useCFAStore";
import { sound } from "@/components/common/SoundEffects";
import { VignetteSet } from "@/types/cfa";

interface ScenarioSimulatorStudioProps {
  initialTopicId?: string;
}

const PRESET_CHIPS = [
  "Callable bond yield shock & negative convexity",
  "LIFO liquidation in inflationary environment",
  "Put-call parity theoretical pricing & synthetic stocks",
  "Crowding-out mechanism during fiscal expansion",
  "Bayes' formula with conditional prior updates",
  "Dual-class shares & corporate governance entrenchment",
  "American vs European private equity waterfalls & clawback",
];

export const ScenarioSimulatorStudio: React.FC<ScenarioSimulatorStudioProps> = ({
  initialTopicId,
}) => {
  const {
    activeTopicId,
    inProgressTopicId,
    weakAreaTargetTopic,
    drillQuestionCount,
    setDrillQuestionCount,
    addCustomVignette,
    soundEnabled,
  } = useCFAStore();

  const [selectedTopicId, setSelectedTopicId] = useState<string>(
    initialTopicId || weakAreaTargetTopic || activeTopicId || inProgressTopicId || "01"
  );
  const [difficulty, setDifficulty] = useState<"Standard" | "High Trap" | "Institutional">("High Trap");
  const [questionCount, setQuestionCount] = useState<2 | 5 | 10>(
    (drillQuestionCount === 15 ? 10 : (drillQuestionCount as 2 | 5 | 10)) || 5
  );
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const topic = CFA_CURRICULUM.find((t) => t.id === selectedTopicId) || CFA_CURRICULUM[0];

  const handleSynthesize = async () => {
    if (soundEnabled) sound.playKeyClick();
    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/generate-vignette", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicId: selectedTopicId,
          difficulty,
          customPrompt,
          questionCount,
        }),
      });

      const data = await res.json();
      if (data.vignette) {
        if (soundEnabled) sound.playNodeSwitch();
        setDrillQuestionCount(questionCount === 10 ? 10 : (questionCount as 2 | 5));
        addCustomVignette(data.vignette as VignetteSet);
      } else {
        setErrorMessage(data.error || "Failed to synthesize scenario. Please retry.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Network error during scenario generation. Please retry.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full bg-[#0B0B0E] border border-[#27272A] rounded-xl p-5 sm:p-7 space-y-6 font-mono shadow-xl">
      
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#1F1F23]">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span>SCENARIO SIMULATOR STUDIO</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-brand-lime/10 border border-brand-lime/30 text-brand-lime font-mono font-bold">
              DYNAMIC ENGINE
            </span>
          </h3>
          <p className="text-xs text-zinc-400 font-sans mt-0.5">
            Synthesize custom CFA Level 1 vignettes with targeted institutional trap variations
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Step 1: Curriculum Track */}
          <div>
            <label className="block text-xs font-bold text-white mb-2 uppercase tracking-wide">
              1. Select Curriculum Track:
            </label>
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="w-full bg-[#09090B] border border-[#27272A] rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:border-brand-lime"
            >
              {CFA_CURRICULUM.map((t) => (
                <option key={t.id} value={t.id}>
                  Track {t.id}: {t.name} ({t.weight})
                </option>
              ))}
            </select>
          </div>

          {/* Step 2 & 3: Question Count and Rigor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Question Count */}
            <div>
              <label className="block text-xs font-bold text-white mb-2 uppercase tracking-wide">
                2. Question Count:
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {([2, 5, 10] as const).map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setQuestionCount(cnt)}
                    className={`py-2 px-2 rounded-lg border text-center font-bold transition-all text-xs ${
                      questionCount === cnt
                        ? "bg-brand-lime text-black border-brand-lime shadow-lime-sm"
                        : "bg-[#121215] text-zinc-400 border-[#27272A] hover:text-white"
                    }`}
                  >
                    {cnt}Q SET
                  </button>
                ))}
              </div>
            </div>

            {/* Trap Rigor */}
            <div>
              <label className="block text-xs font-bold text-white mb-2 uppercase tracking-wide">
                3. Trap Rigor:
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {(["Standard", "High Trap", "Institutional"] as const).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`py-2 px-1.5 rounded-lg border text-center font-semibold transition-all text-[11px] truncate ${
                      difficulty === diff
                        ? "bg-brand-lime text-black font-bold border-brand-lime shadow-lime-sm"
                        : "bg-[#121215] text-zinc-400 border-[#27272A] hover:text-white"
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Step 4: Custom Scenario Prompt */}
          <div>
            <label className="block text-xs font-bold text-white mb-2 uppercase tracking-wide">
              4. Custom Scenario Focus (Optional):
            </label>
            <input
              type="text"
              placeholder="e.g. Callable bond yield shock, LIFO liquidation, cross-rate triangular arbitrage..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="w-full bg-[#09090B] border border-[#27272A] rounded-lg p-3 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-brand-lime font-mono"
            />
            
            {/* Suggestion Chips */}
            <div className="mt-2.5 space-y-1.5">
              <span className="text-[11px] text-zinc-500 font-sans block">
                Quick Scenario Presets:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_CHIPS.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCustomPrompt(chip)}
                    className="px-2 py-1 rounded bg-[#121215] hover:bg-[#1C1C22] text-zinc-400 hover:text-zinc-200 border border-[#27272A] text-[11px] font-sans transition-colors"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Error message banner */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-900/50 text-red-300 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

        </div>

        {/* Right Column: Scenario Context & Launch CTA (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4 bg-[#08080A] border border-[#1F1F23] rounded-xl p-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-[#18181B] pb-2">
              <span className="font-bold text-white">SIMULATION CONFIGURATION</span>
              <span className="text-brand-lime font-semibold">{questionCount} QUESTIONS</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#141418]">
                <span className="text-zinc-400">Selected Track:</span>
                <span className="text-white font-bold truncate max-w-[200px]">[{topic.id}] {topic.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#141418]">
                <span className="text-zinc-400">Exam Weight:</span>
                <span className="text-white font-bold">{topic.weight}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#141418]">
                <span className="text-zinc-400">Pacing Allocation:</span>
                <span className="text-brand-lime font-bold">{questionCount * 90}s ({((questionCount * 90) / 60).toFixed(1)} mins)</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#101014] border border-amber-400/20 text-xs">
              <span className="font-bold text-amber-300 block mb-0.5">
                PRIMARY TARGET TRAP:
              </span>
              <p className="text-zinc-300 font-sans text-xs">
                {topic.highYieldTrapArea}
              </p>
            </div>
          </div>

          <button
            onClick={handleSynthesize}
            disabled={isGenerating}
            className="w-full py-3.5 px-4 rounded-lg bg-brand-lime hover:bg-brand-neon text-black font-extrabold text-xs tracking-wider flex items-center justify-center gap-2 transition-all shadow-lime-glow active:scale-95 disabled:opacity-50 uppercase"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>SYNTHESIZING {questionCount}Q SCENARIO...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-black" />
                <span>SYNTHESIZE &amp; LAUNCH DRILL</span>
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
};

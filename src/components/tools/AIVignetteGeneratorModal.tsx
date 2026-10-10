"use client";

import React, { useState } from "react";
import { X, Sparkles, Wand2, AlertCircle, Loader2 } from "lucide-react";
import { CFA_CURRICULUM } from "@/data/curriculum";
import { useCFAStore } from "@/store/useCFAStore";
import { sound } from "@/components/common/SoundEffects";
import { VignetteSet } from "@/types/cfa";
import { useAccessibleDialog } from "@/hooks/useAccessibleDialog";

export const AIVignetteGeneratorModal: React.FC = () => {
  const {
    isAIGeneratorOpen,
    setAIGeneratorOpen,
    addCustomVignette,
    inProgressTopicId,
    activeTopicId,
    weakAreaTargetTopic,
    drillQuestionCount,
    setDrillQuestionCount,
    soundEnabled,
  } = useCFAStore();
  
  const [selectedTopicId, setSelectedTopicId] = useState<string>(
    weakAreaTargetTopic || activeTopicId || inProgressTopicId || "01"
  );
  const [difficulty, setDifficulty] = useState<"Standard" | "High Trap" | "Institutional">("High Trap");
  const [questionCount, setQuestionCount] = useState<2 | 5 | 10>(
    (drillQuestionCount === 15 ? 10 : (drillQuestionCount as 2 | 5 | 10)) || 5
  );
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const dialogRef = useAccessibleDialog<HTMLDivElement>(isAIGeneratorOpen, () => setAIGeneratorOpen(false));

  React.useEffect(() => {
    if (weakAreaTargetTopic) {
      setSelectedTopicId(weakAreaTargetTopic);
    }
  }, [weakAreaTargetTopic]);

  if (!isAIGeneratorOpen) return null;

  const topic = CFA_CURRICULUM.find((t) => t.id === selectedTopicId) || CFA_CURRICULUM[0];

  const handleGenerate = async () => {
    if (soundEnabled) sound.playKeyClick();
    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/generate-vignette", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicId: selectedTopicId,
          mode: "case-study",
          difficulty: difficulty === "High Trap" ? "high-trap" : difficulty === "Institutional" ? "institutional" : "standard",
          focus: customPrompt || undefined,
          questionCount,
        }),
      });

      const data = await res.json();
      if (res.ok && data.vignette) {
        if (soundEnabled) sound.playNodeSwitch();
        setDrillQuestionCount(questionCount === 10 ? 10 : (questionCount as 2 | 5));
        addCustomVignette(data.vignette as VignetteSet);
      } else {
        setErrorMessage(data.error || "Failed to generate scenario. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Network error during scenario generation. Please retry.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      ref={dialogRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-lab-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-200 font-sans"
    >
      <div className="w-full max-w-2xl liquid-glass-card rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-white/[0.04] bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 id="ai-lab-title" className="text-base sm:text-lg font-bold text-white tracking-tight">
                Generate a practice set
              </h3>
              <span className="tabular-nums text-xs text-slate-400">
                New questions for any topic. Generated questions don&apos;t count toward readiness.
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              if (soundEnabled) sound.playKeyClick();
              setAIGeneratorOpen(false);
            }}
            aria-label="Close scenario lab"
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-muted hover:text-white hover:bg-surface-raised transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          
          {/* Target Track Selector */}
          <div>
            <label className="block text-xs font-bold text-white mb-2">
              1. Select Curriculum Track:
            </label>
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="w-full bg-background border border-control rounded-lg p-2.5 text-xs text-white tabular-nums focus:outline-none focus:border-accent"
            >
              {CFA_CURRICULUM.map((t) => (
                <option key={t.id} value={t.id}>
                  Track {t.id}: {t.name} ({t.weight})
                </option>
              ))}
            </select>
          </div>

          {/* Question Count & Difficulty Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Question Count */}
            <div>
              <label className="block text-xs font-bold text-white mb-2">
                2. Question Count:
              </label>
              <div className="grid grid-cols-3 gap-2 tabular-nums text-xs">
                {([2, 5, 10] as const).map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setQuestionCount(cnt)}
                    className={`py-2 px-3 rounded-lg border text-center font-semibold transition-all ${
                      questionCount === cnt
                        ? "bg-accent text-accent-ink font-bold border-accent "
                        : "bg-surface-interactive text-muted border-control hover:text-white"
                    }`}
                  >
                    {cnt}Q SET
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Setting */}
            <div>
              <label className="block text-xs font-bold text-white mb-2">
                3. Trap Rigor:
              </label>
              <div className="grid grid-cols-3 gap-2 tabular-nums text-xs">
                {(["Standard", "High Trap", "Institutional"] as const).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`py-2 px-2 rounded-lg border text-center font-semibold transition-all text-[11px] truncate ${
                      difficulty === diff
                        ? "bg-accent text-accent-ink font-bold border-accent "
                        : "bg-surface-interactive text-muted border-control hover:text-white"
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Trap Area Context Banner */}
          <div className="p-3.5 rounded-lg bg-surface-interactive border border-warning/30 flex items-start gap-2.5 text-xs">
            <AlertCircle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
            <div>
              <span className="tabular-nums text-xs font-bold text-warning block">
                PRIMARY TARGET TRAP IN FOCUS ({topic.shortName.toUpperCase()}):
              </span>
              <p className="text-foreground text-xs mt-0.5 leading-relaxed">
                {topic.highYieldTrapArea}
              </p>
            </div>
          </div>

          {/* Optional Prompt Refinement */}
          <div>
            <label className="block text-xs font-bold text-white mb-2">
              4. Custom Scenario Focus (Tailor the scenario &amp; questions):
            </label>
            <input
              type="text"
              placeholder="e.g. Callable bond yield shock, LIFO liquidation, put-call parity arbitrage..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="w-full bg-background border border-control rounded-lg p-2.5 text-xs text-white placeholder:text-muted focus:outline-none focus:border-accent tabular-nums"
            />
            <span className="text-[11px] text-muted tabular-nums mt-1 block">
              Leave blank for a comprehensive high-yield track drill, or specify custom asset classes / market conditions.
            </span>
          </div>

          {/* Error message banner */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-danger/40 border border-danger/50 text-danger text-xs tabular-nums flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-danger shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

        </div>

        {/* Footer CTA */}
        <div className="p-4 border-t border-control bg-background-elevated flex items-center justify-between tabular-nums text-xs">
          <button
            onClick={() => setAIGeneratorOpen(false)}
            className="px-4 py-2 rounded-lg text-muted hover:text-white"
          >
            Cancel
          </button>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-5 py-2.5 rounded-lg bg-accent text-accent-ink font-bold flex items-center gap-2 hover:bg-accent-strong active:scale-95 transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>SYNTHESIZING {questionCount}Q VIGNETTE...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Generate and start</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

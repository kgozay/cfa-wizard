"use client";

import React, { useState, useEffect } from "react";
import { Loader2, AlertCircle, Play } from "lucide-react";
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

  useEffect(() => {
    if (initialTopicId) {
      setSelectedTopicId(initialTopicId);
    }
  }, [initialTopicId]);

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
        setErrorMessage(data.error || "Failed to generate scenario. Please retry.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Network error during scenario generation. Please retry.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full surface-panel rounded-2xl p-5 sm:p-7 space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-divider">
        <div>
          <h3 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
            <span>Custom practice studio</span>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-accent/15 text-accent font-mono font-semibold">
              Dynamic generator
            </span>
          </h3>
          <p className="text-xs sm:text-sm text-muted mt-0.5">
            Create custom CFA Level I vignettes with targeted exam traps and difficulty settings.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Step 1: Curriculum Track */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Select curriculum topic
            </label>
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="w-full bg-surface-solid border border-control rounded-lg p-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:border-accent"
            >
              {CFA_CURRICULUM.map((t) => (
                <option key={t.id} value={t.id}>
                  Topic {t.id}: {t.name} ({t.weight})
                </option>
              ))}
            </select>
          </div>

          {/* Step 2 & 3: Question Count and Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Question Count */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Question count
              </label>
              <div className="grid grid-cols-3 gap-2">
                {([2, 5, 10] as const).map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setQuestionCount(cnt)}
                    className={`min-h-[44px] px-2 rounded-lg text-center text-xs font-semibold transition-all ${
                      questionCount === cnt
                        ? "bg-accent text-accent-ink"
                        : "bg-surface-interactive text-muted hover:text-foreground hover:bg-surface-raised"
                    }`}
                  >
                    {cnt} questions
                  </button>
                ))}
              </div>
            </div>

            {/* Trap Rigor */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Difficulty
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["Standard", "High Trap", "Institutional"] as const).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`min-h-[44px] px-1.5 rounded-lg text-center text-xs font-semibold transition-all truncate ${
                      difficulty === diff
                        ? "bg-accent text-accent-ink"
                        : "bg-surface-interactive text-muted hover:text-foreground hover:bg-surface-raised"
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
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Scenario focus (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Callable bond yield shock, LIFO liquidation, cross-rate triangular arbitrage..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="w-full bg-surface-solid border border-control rounded-lg p-2.5 text-xs sm:text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent"
            />

            {/* Suggestion Chips */}
            <div className="mt-2.5 space-y-1.5">
              <span className="text-xs text-muted block">
                Suggested scenario topics:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_CHIPS.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCustomPrompt(chip)}
                    className="px-2.5 py-1 rounded-md bg-surface-interactive hover:bg-surface-raised text-muted hover:text-foreground text-xs transition-colors"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Error message banner */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Right Column: Scenario Context & Launch CTA (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4 rounded-xl bg-surface-raised p-4 sm:p-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-muted pb-2 border-b border-divider">
              <span className="font-semibold text-foreground">Configuration summary</span>
              <span className="font-mono text-accent font-semibold">{questionCount} questions</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-divider">
                <span className="text-muted">Selected topic:</span>
                <span className="text-foreground font-medium truncate max-w-[200px]">[{topic.id}] {topic.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-divider">
                <span className="text-muted">Exam weight:</span>
                <span className="font-mono text-foreground">{topic.weight}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-divider">
                <span className="text-muted">Pacing guideline:</span>
                <span className="font-mono text-foreground">{questionCount * 90}s ({((questionCount * 90) / 60).toFixed(1)} mins)</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-surface-interactive/60 text-xs">
              <span className="font-semibold text-warning block mb-1">
                Primary target trap:
              </span>
              <p className="text-muted-strong text-xs leading-relaxed">
                {topic.highYieldTrapArea}
              </p>
            </div>
          </div>

          <button
            onClick={handleSynthesize}
            disabled={isGenerating}
            className="w-full min-h-[44px] py-3 px-4 rounded-xl bg-accent hover:bg-accent-strong text-accent-ink font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating {questionCount}-question practice set...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Generate practice set</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

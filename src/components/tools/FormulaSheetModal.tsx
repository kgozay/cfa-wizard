"use client";

import React, { useState } from "react";
import { X, Search, BookOpen, Calculator } from "lucide-react";
import { CFA_CURRICULUM } from "@/data/curriculum";
import { KaTeXRenderer, FormattedMathText } from "@/components/common/KaTeXRenderer";
import { KeystrokeSequence } from "@/components/calculator/KeystrokeBadge";
import { useCFAStore } from "@/store/useCFAStore";
import { sound } from "@/components/common/SoundEffects";

export const FormulaSheetModal: React.FC = () => {
  const { isFormulaSheetOpen, setFormulaSheetOpen, setCalculatorOpen, soundEnabled } = useCFAStore();
  const [search, setSearch] = useState<string>("");
  const [selectedTopicId, setSelectedTopicId] = useState<string>("ALL");

  if (!isFormulaSheetOpen) return null;

  // Flatten all formulas
  const allFormulas = CFA_CURRICULUM.flatMap((topic) =>
    topic.formulas.map((f) => ({
      ...f,
      topicId: topic.id,
      topicName: topic.name,
    }))
  );

  const filtered = allFormulas.filter((f) => {
    const matchesTopic = selectedTopicId === "ALL" || f.topicId === selectedTopicId;
    const matchesSearch =
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      f.description.toLowerCase().includes(search.toLowerCase()) ||
      f.latex.toLowerCase().includes(search.toLowerCase());
    return matchesTopic && matchesSearch;
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="formula-sheet-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-4xl liquid-glass-card rounded-2xl shadow-2xl overflow-hidden flex flex-col font-sans max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-white/[0.04] bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-accent/15 flex items-center justify-center text-accent">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 id="formula-sheet-title" className="text-base sm:text-lg font-bold text-white tracking-tight">
                Formula sheet
              </h3>
              <span className="tabular-nums text-xs text-slate-400">
                Key formulas and BA II Plus keystrokes for all ten Level I topics
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              if (soundEnabled) sound.playKeyClick();
              setFormulaSheetOpen(false);
            }}
            aria-label="Close formula matrix"
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-muted hover:text-white hover:bg-surface-raised transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="p-4 border-b border-control bg-background flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search equations, keystrokes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-interactive border border-control rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-muted focus:outline-none focus:border-accent/50 tabular-nums"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto tabular-nums text-xs pb-1 sm:pb-0">
            <button
              onClick={() => {
                if (soundEnabled) sound.playKeyClick();
                setSelectedTopicId("ALL");
              }}
              className={`px-2.5 py-1 rounded text-[11px] ${
                selectedTopicId === "ALL"
                  ? "bg-accent text-accent-ink font-bold"
                  : "bg-surface-raised text-muted hover:text-white border border-control"
              }`}
            >
              ALL
            </button>
            {CFA_CURRICULUM.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  if (soundEnabled) sound.playKeyClick();
                  setSelectedTopicId(t.id);
                }}
                className={`px-2 py-1 rounded text-[11px] whitespace-nowrap ${
                  selectedTopicId === t.id
                    ? "bg-accent text-accent-ink font-bold"
                    : "bg-surface-raised text-muted hover:text-white border border-control"
                }`}
              >
                {t.shortName}
              </button>
            ))}
          </div>
        </div>

        {/* Formulas Grid */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {filtered.map((f) => (
            <div
              key={f.id}
              className="p-4 rounded-xl bg-background border border-control space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-divider">
                <div>
                  <span className="text-[10px] text-accent block">
                    Track {f.topicId} • {f.topicName}
                  </span>
                  <h4 className="text-sm font-semibold text-white mt-0.5">
                    {f.title}
                  </h4>
                </div>
                <span className="tabular-nums text-xs text-muted">
                  {f.id}
                </span>
              </div>

              <KaTeXRenderer math={f.latex} block />

              <div className="text-xs text-muted-strong">
                <FormattedMathText text={f.description} />
              </div>

              {f.calculatorKeystrokes && (
                <div className="pt-2 border-t border-divider">
                  <div className="text-[10px] text-muted mb-1.5">
                    BA II Plus keystrokes:
                  </div>
                  <KeystrokeSequence sequence={f.calculatorKeystrokes} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-control bg-background-elevated flex items-center justify-between tabular-nums text-xs">
          <span className="text-muted">
            Showing {filtered.length} high-yield formulas
          </span>
          <button
            onClick={() => {
              if (soundEnabled) sound.playKeyClick();
              setCalculatorOpen(true);
            }}
            className="px-3.5 py-1.5 rounded bg-surface-raised text-white hover:text-accent border border-control flex items-center gap-1.5"
          >
            <Calculator className="w-3.5 h-3.5 text-accent" />
            <span>Open calculator</span>
          </button>
        </div>

      </div>
    </div>
  );
};

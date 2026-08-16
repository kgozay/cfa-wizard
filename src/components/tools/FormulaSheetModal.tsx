"use client";

import React, { useState } from "react";
import { X, Search, BookOpen, Calculator, Copy, Check } from "lucide-react";
import { CFA_CURRICULUM } from "@/data/curriculum";
import { KaTeXRenderer } from "@/components/common/KaTeXRenderer";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-[#0B0B0E] border border-[#27272A] rounded-xl shadow-2xl overflow-hidden flex flex-col font-sans max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-[#1F1F23] bg-[#0E0E12] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-lime/10 border border-brand-lime/30 flex items-center justify-center text-brand-lime">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                HIGH-YIELD FORMULA & KEYSTROKE MATRIX
              </h3>
              <span className="font-mono text-xs text-editorial-dim">
                ALL 10 CFA LEVEL 1 TOPICS // KATEX EQUATIONS & TI BA II PLUS SEQUENCES
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              if (soundEnabled) sound.playKeyClick();
              setFormulaSheetOpen(false);
            }}
            className="p-1.5 rounded-lg text-editorial-muted hover:text-white hover:bg-[#1F1F23] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="p-4 border-b border-[#1F1F23] bg-[#09090B] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-editorial-dim" />
            <input
              type="text"
              placeholder="Search equations, keystrokes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#121215] border border-[#27272A] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-editorial-dim focus:outline-none focus:border-brand-lime/50 font-mono"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto font-mono text-xs pb-1 sm:pb-0">
            <button
              onClick={() => {
                if (soundEnabled) sound.playKeyClick();
                setSelectedTopicId("ALL");
              }}
              className={`px-2.5 py-1 rounded text-[11px] ${
                selectedTopicId === "ALL"
                  ? "bg-brand-lime text-black font-bold"
                  : "bg-[#18181B] text-editorial-muted hover:text-white border border-[#27272A]"
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
                    ? "bg-brand-lime text-black font-bold"
                    : "bg-[#18181B] text-editorial-muted hover:text-white border border-[#27272A]"
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
              className="p-4 rounded-xl bg-[#09090B] border border-[#1F1F23] space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#18181B]">
                <div>
                  <span className="font-mono text-[10px] text-brand-lime block uppercase">
                    Track {f.topicId} • {f.topicName}
                  </span>
                  <h4 className="text-sm font-semibold text-white mt-0.5">
                    {f.title}
                  </h4>
                </div>
                <span className="font-mono text-xs text-editorial-dim">
                  {f.id}
                </span>
              </div>

              <KaTeXRenderer math={f.latex} block />

              <p className="text-xs text-editorial-steely">
                {f.description}
              </p>

              {f.calculatorKeystrokes && (
                <div className="pt-2 border-t border-[#18181B]">
                  <div className="font-mono text-[10px] text-editorial-dim uppercase mb-1.5">
                    TI BA II PLUS KEYSTROKES:
                  </div>
                  <KeystrokeSequence sequence={f.calculatorKeystrokes} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1F1F23] bg-[#0E0E12] flex items-center justify-between font-mono text-xs">
          <span className="text-editorial-dim">
            Showing {filtered.length} high-yield formulas
          </span>
          <button
            onClick={() => {
              if (soundEnabled) sound.playKeyClick();
              setCalculatorOpen(true);
            }}
            className="px-3.5 py-1.5 rounded bg-[#18181B] text-white hover:text-brand-lime border border-[#3F3F46] flex items-center gap-1.5"
          >
            <Calculator className="w-3.5 h-3.5 text-brand-lime" />
            <span>Open BA II+</span>
          </button>
        </div>

      </div>
    </div>
  );
};

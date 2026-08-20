"use client";

import React, { useState } from "react";
import { X, AlertTriangle, ShieldCheck, Trash2, ArrowRight, Search, Filter, Cpu, Sparkles } from "lucide-react";
import { useCFAStore } from "@/store/useCFAStore";
import { TRAP_TAXONOMY } from "@/data/trapTaxonomy";
import { sound } from "@/components/common/SoundEffects";
import { FormattedMathText } from "@/components/common/KaTeXRenderer";

export const TrapLogModal: React.FC = () => {
  const {
    isTrapLogOpen,
    setTrapLogOpen,
    trapLogs,
    deleteTrapLogEntry,
    clearAllTrapLogs,
    soundEnabled,
    setAIGeneratorOpen,
    setWeakAreaTargetTopic,
  } = useCFAStore();

  const [selectedTopicFilter, setSelectedTopicFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  if (!isTrapLogOpen) return null;

  const filteredLogs = trapLogs.filter((entry) => {
    const matchesTopic = selectedTopicFilter === "ALL" || entry.topicId === selectedTopicFilter;
    const matchesSearch =
      searchQuery.trim() === "" ||
      entry.questionStem.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.trapName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.topicName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTopic && matchesSearch;
  });

  const handleLaunchTargetedAI = () => {
    if (soundEnabled) sound.playNodeSwitch();
    // Pick the most common missed topic or the first filtered log's topic
    const targetTopicId = filteredLogs[0]?.topicId || trapLogs[0]?.topicId || "01";
    setWeakAreaTargetTopic(targetTopicId);
    setTrapLogOpen(false);
    setAIGeneratorOpen(true);
  };

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
                CANDIDATE TRAP RADAR &amp; WEAK-AREA LOG
              </h3>
              <span className="font-mono text-xs text-zinc-400">
                REAL-TIME DIAGNOSTIC REVISION OF CANDIDATE DISTRACTOR CHOICES
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {trapLogs.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm("Are you sure you want to clear all logged traps?")) {
                    clearAllTrapLogs();
                  }
                }}
                className="px-2.5 py-1.5 rounded-lg bg-red-950/30 text-red-400 border border-red-900/40 hover:bg-red-900/40 text-xs font-mono flex items-center gap-1"
                title="Clear All Traps"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">CLEAR ALL</span>
              </button>
            )}
            <button
              onClick={() => {
                if (soundEnabled) sound.playKeyClick();
                setTrapLogOpen(false);
              }}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#1F1F23] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="px-6 py-3 border-b border-[#1F1F23] bg-[#0E0E12] flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
          <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-[#121215] border border-[#27272A] px-3 py-1.5 rounded-lg">
            <Search className="w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search traps, stems, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-white text-xs w-full placeholder:text-zinc-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={selectedTopicFilter}
              onChange={(e) => setSelectedTopicFilter(e.target.value)}
              className="bg-[#121215] text-white border border-[#27272A] rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-brand-lime"
            >
              <option value="ALL">All Tracks (01-10)</option>
              <option value="01">Topic 01: Ethics</option>
              <option value="02">Topic 02: Quantitative Methods</option>
              <option value="03">Topic 03: Economics</option>
              <option value="04">Topic 04: FSA</option>
              <option value="05">Topic 05: Corporate Issuers</option>
              <option value="06">Topic 06: Fixed Income</option>
              <option value="07">Topic 07: Derivatives</option>
              <option value="08">Topic 08: Alternative Investments</option>
              <option value="09">Topic 09: Equity Investments</option>
              <option value="10">Topic 10: Portfolio Management</option>
            </select>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          
          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center space-y-3 bg-[#09090B] border border-[#1F1F23] rounded-xl">
              <ShieldCheck className="w-10 h-10 text-brand-lime mx-auto" />
              <h4 className="text-base font-semibold text-white">
                {trapLogs.length === 0 ? "Zero High-Yield Traps Logged" : "No Matching Traps Found"}
              </h4>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                {trapLogs.length === 0
                  ? "You have not fallen for any distractor traps in your completed diagnostic sets yet. Keep drilling vignettes to uncover weak spots."
                  : "Try clearing your search query or switching to All Tracks."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((entry) => {
                const taxonomy = TRAP_TAXONOMY[entry.trapName];
                const userSelection = entry.userChoice || entry.selectedOption || "A";

                return (
                  <div
                    key={entry.id}
                    className="p-4 rounded-xl bg-[#09090B] border border-[#1F1F23] space-y-3 font-sans text-xs hover:border-[#2E2E35] transition-all"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#18181B] font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-bold border border-amber-500/30">
                          {entry.trapName}
                        </span>
                        <span className="text-zinc-400">
                          Track {entry.topicId} &bull; {entry.topicName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-500 text-[11px]">
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </span>
                        <button
                          onClick={() => deleteTrapLogEntry(entry.id)}
                          className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                          title="Delete from Trap Log"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="text-white font-medium block mb-1">
                        &quot;<FormattedMathText text={entry.questionStem} />&quot;
                      </div>
                      <div className="flex items-center gap-3 font-mono text-xs mt-1">
                        <span className="text-red-400 font-bold">
                          Selected: Option {userSelection}
                        </span>
                        <span className="text-zinc-600">|</span>
                        <span className="text-brand-lime font-bold">
                          Key: Option {entry.correctOption}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded bg-[#121215] border border-[#27272A] text-zinc-200 leading-relaxed">
                      <span className="font-mono text-[11px] text-amber-400 font-bold block mb-0.5">
                        DISTRACTOR AUTOPSY:
                      </span>
                      <FormattedMathText text={entry.autopsyExplanation} />
                    </div>

                    {entry.calculatorKeystrokes && (
                      <div className="p-2.5 rounded bg-[#141418] border border-[#27272A] flex items-center gap-2 font-mono text-xs text-amber-300">
                        <Cpu className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>TI BA II+: {entry.calculatorKeystrokes}</span>
                      </div>
                    )}

                    {taxonomy && (
                      <div className="text-xs text-zinc-300 font-mono flex items-start gap-1.5">
                        <span className="text-brand-lime font-bold shrink-0">REMEDIATION:</span>
                        <FormattedMathText text={taxonomy.recommendedRemediation} />
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
          <span className="text-zinc-400">
            Showing {filteredLogs.length} of {trapLogs.length} Traps
          </span>
          
          <div className="flex items-center gap-2">
            {trapLogs.length > 0 && (
              <button
                onClick={handleLaunchTargetedAI}
                className="px-4 py-2 rounded-lg bg-brand-lime text-black font-bold flex items-center gap-1.5 hover:bg-brand-neon shadow-lime-sm transition-all active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                <span>REMEDIATE WEAK AREAS WITH AI</span>
              </button>
            )}

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
    </div>
  );
};

"use client";

import React, { useState } from "react";
import { X, AlertTriangle, ShieldCheck, Trash2, Search, Filter, Cpu, Sparkles } from "lucide-react";
import { useCFAStore } from "@/store/useCFAStore";
import { CFA_CURRICULUM } from "@/data/curriculum";
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
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="trap-log-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-4xl liquid-glass-card rounded-2xl shadow-2xl overflow-hidden flex flex-col font-sans max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-white/[0.04] bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-warning/10 flex items-center justify-center text-warning">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 id="trap-log-title" className="text-base sm:text-lg font-bold text-white tracking-tight">
                Mistake log
              </h3>
              <span className="tabular-nums text-xs text-muted">
                Every question you missed, with why the answer you chose was wrong
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
                className="px-2.5 py-1.5 rounded-lg bg-danger/30 text-danger border border-danger/40 hover:bg-danger/40 text-xs tabular-nums flex items-center gap-1"
                title="Clear All Traps"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear all</span>
              </button>
            )}
            <button
              onClick={() => {
                if (soundEnabled) sound.playKeyClick();
                setTrapLogOpen(false);
              }}
              aria-label="Close trap log"
              className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-muted hover:text-white hover:bg-surface-raised transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="px-6 py-3 border-b border-control bg-background-elevated flex flex-wrap items-center justify-between gap-3 tabular-nums text-xs">
          <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-surface-interactive border border-control px-3 py-1.5 rounded-lg">
            <Search className="w-3.5 h-3.5 text-muted" />
            <input
              type="text"
              placeholder="Search traps, stems, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-white text-xs w-full placeholder:text-muted"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-muted" />
            <select
              aria-label="Filter mistakes by topic"
              value={selectedTopicFilter}
              onChange={(e) => setSelectedTopicFilter(e.target.value)}
              className="bg-surface-interactive text-white border border-control rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-accent"
            >
              <option value="ALL">All topics</option>
              {CFA_CURRICULUM.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.id} · {topic.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          
          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center space-y-3 bg-background border border-control rounded-xl">
              <ShieldCheck className="w-10 h-10 text-accent mx-auto" />
              <h4 className="text-base font-semibold text-white">
                {trapLogs.length === 0 ? "Zero High-Yield Traps Logged" : "No Matching Traps Found"}
              </h4>
              <p className="text-xs text-muted max-w-md mx-auto">
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
                    className="p-4 rounded-xl bg-background border border-control space-y-3 font-sans text-xs hover:border-control-boundary-hover transition-all"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-divider tabular-nums text-xs">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-warning/10 text-warning font-bold border border-warning/30">
                          {entry.trapName}
                        </span>
                        <span className="text-muted">
                          Track {entry.topicId} &bull; {entry.topicName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted text-[11px]">
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </span>
                        <button
                          onClick={() => deleteTrapLogEntry(entry.id)}
                          className="p-1 rounded text-muted hover:text-danger hover:bg-danger/30 transition-colors"
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
                      <div className="flex items-center gap-3 tabular-nums text-xs mt-1">
                        <span className="text-danger font-bold">
                          Selected: Option {userSelection}
                        </span>
                        <span className="text-muted">|</span>
                        <span className="text-accent font-bold">
                          Key: Option {entry.correctOption}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded bg-surface-interactive border border-control text-foreground leading-relaxed">
                      <span className="tabular-nums text-[11px] text-warning font-bold block mb-0.5">
                        Why it&apos;s wrong:
                      </span>
                      <FormattedMathText text={entry.autopsyExplanation} />
                    </div>

                    {entry.calculatorKeystrokes && (
                      <div className="p-2.5 rounded bg-surface-interactive border border-control flex items-center gap-2 tabular-nums text-xs text-warning">
                        <Cpu className="w-3.5 h-3.5 text-warning shrink-0" />
                        <span>TI BA II+: {entry.calculatorKeystrokes}</span>
                      </div>
                    )}

                    {taxonomy && (
                      <div className="text-xs text-muted-strong tabular-nums flex items-start gap-1.5">
                        <span className="text-accent font-bold shrink-0">REMEDIATION:</span>
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
        <div className="p-4 border-t border-control bg-background-elevated flex items-center justify-between tabular-nums text-xs">
          <span className="text-muted">
            Showing {filteredLogs.length} of {trapLogs.length} Traps
          </span>
          
          <div className="flex items-center gap-2">
            {trapLogs.length > 0 && (
              <button
                onClick={handleLaunchTargetedAI}
                className="px-4 py-2 rounded-lg bg-accent text-accent-ink font-bold flex items-center gap-1.5 hover:bg-accent-strong transition-all active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                <span>Generate practice for weak areas</span>
              </button>
            )}

            <button
              onClick={() => {
                if (soundEnabled) sound.playKeyClick();
                setTrapLogOpen(false);
              }}
              className="px-4 py-2 rounded-lg bg-surface-raised text-white hover:text-accent border border-control"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

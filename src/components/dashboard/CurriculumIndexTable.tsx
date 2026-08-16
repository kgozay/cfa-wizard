"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, FileText, Play, BookOpen, AlertCircle, Search, Filter } from "lucide-react";
import { CFA_CURRICULUM } from "@/data/curriculum";
import { CFA_VIGNETTES } from "@/data/vignettes";
import { useCFAStore } from "@/store/useCFAStore";
import { sound } from "@/components/common/SoundEffects";

export const CurriculumIndexTable: React.FC = () => {
  const {
    completedTopicIds,
    inProgressTopicId,
    activeTopicId,
    selectTopic,
    setActiveBriefing,
    startVignetteDrill,
    soundEnabled,
  } = useCFAStore();

  const [expandedTopicId, setExpandedTopicId] = useState<string | null>("04");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [weightFilter, setWeightFilter] = useState<string>("ALL");

  const toggleExpand = (id: string) => {
    if (soundEnabled) sound.playKeyClick();
    setExpandedTopicId(expandedTopicId === id ? null : id);
    selectTopic(id);
  };

  const handleOpenBriefing = (topicId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (soundEnabled) sound.playKeyClick();
    setActiveBriefing(topicId);
  };

  const handleLaunchDrill = (topicId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (soundEnabled) sound.playNodeSwitch();
    const v = CFA_VIGNETTES.find((item) => item.topicId === topicId) || CFA_VIGNETTES[0];
    startVignetteDrill(v.id);
  };

  // Filter topics
  const filteredTopics = CFA_CURRICULUM.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.highYieldTrapArea.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subReadings.some((sr) => sr.title.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesWeight =
      weightFilter === "ALL" ||
      (weightFilter === "HIGH" && t.weightCategory === "HIGH") ||
      (weightFilter === "MEDIUM" && t.weightCategory === "MEDIUM") ||
      (weightFilter === "STANDARD" && t.weightCategory === "STANDARD");

    return matchesSearch && matchesWeight;
  });

  return (
    <div className="w-full bg-[#0B0B0E] border border-[#1F1F23] rounded-xl overflow-hidden font-sans">
      
      {/* Search & Filter Header */}
      <div className="p-4 border-b border-[#1F1F23] bg-[#0E0E12] flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-editorial-dim" />
          <input
            type="text"
            placeholder="Search 10 tracks, traps, sub-readings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#09090B] border border-[#27272A] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-editorial-dim focus:outline-none focus:border-brand-lime/50 font-mono"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto font-mono text-xs overflow-x-auto pb-1 sm:pb-0">
          <span className="text-editorial-dim text-[11px] mr-1 hidden lg:inline">WEIGHT:</span>
          {(["ALL", "HIGH", "MEDIUM", "STANDARD"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                if (soundEnabled) sound.playKeyClick();
                setWeightFilter(cat);
              }}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                weightFilter === cat
                  ? "bg-brand-lime text-black font-bold"
                  : "bg-[#18181B] text-editorial-muted hover:text-white border border-[#27272A]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* Edge-to-Edge Minimalist Curriculum Table */}
      <div className="divide-y divide-[#1F1F23]">
        {filteredTopics.map((topic) => {
          const isCompleted = completedTopicIds.includes(topic.id);
          const isInProgress = inProgressTopicId === topic.id;
          const isExpanded = expandedTopicId === topic.id;

          // Status Badge Variant
          let statusText = "READY";
          let statusClass = "text-[#3F3F46] border-[#27272A]";
          if (isCompleted) {
            statusText = "COMPLETED";
            statusClass = "text-editorial-muted border-editorial-dim/30 bg-[#141418]";
          } else if (isInProgress) {
            statusText = "IN PROGRESS";
            statusClass = "text-brand-lime border-brand-lime/50 bg-brand-lime/10 shadow-[0_0_10px_rgba(216,255,62,0.15)]";
          }

          return (
            <div key={topic.id} className="transition-colors hover:bg-[#0E0E12]/80">
              
              {/* Row Header */}
              <div
                onClick={() => toggleExpand(topic.id)}
                className="px-5 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 cursor-pointer select-none"
              >
                {/* Left: Index & Reading Title */}
                <div className="flex items-center gap-3.5">
                  <span className="font-mono text-xs font-bold text-editorial-dim group-hover:text-brand-lime">
                    {topic.id}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-semibold text-white tracking-tight">
                        {topic.name}
                      </h3>
                      {topic.weightCategory === "HIGH" && (
                        <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[10px] font-semibold">
                          HIGH YIELD
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-editorial-muted font-mono mt-0.5">
                      Exam Weight: <span className="text-white font-medium">{topic.weight}</span> • {topic.subReadings.length} Sub-Readings
                    </p>
                  </div>
                </div>

                {/* Right: Status Indicator & Chevron */}
                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                  <div className={`font-mono text-[11px] font-bold px-2.5 py-1 rounded border tracking-wider uppercase ${statusClass}`}>
                    {statusText}
                  </div>
                  <div className="p-1 rounded text-editorial-dim hover:text-white">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

              </div>

              {/* Expandable Sub-Readings & Action Drawer */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-1 bg-[#09090B] border-t border-[#18181B] space-y-4">
                  
                  {/* High Yield Trap Warning Box */}
                  <div className="p-3 rounded-lg bg-[#121215] border border-[#27272A] flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-mono text-[11px] font-bold text-amber-400 uppercase tracking-wide">
                        PRIMARY TRAP MECHANISM
                      </div>
                      <p className="text-xs text-editorial-steely mt-0.5">
                        {topic.highYieldTrapArea}
                      </p>
                    </div>
                  </div>

                  {/* Sub-Readings List */}
                  <div className="space-y-1.5 font-mono text-xs">
                    <div className="text-[11px] text-editorial-dim tracking-wider uppercase mb-1">
                      SUB-READINGS MATRIX:
                    </div>
                    {topic.subReadings.map((sr) => (
                      <div
                        key={sr.id}
                        className="p-2 rounded bg-[#0E0E12] border border-[#1F1F23] flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]"
                      >
                        <div className="flex items-center gap-2 text-white">
                          <span className="text-editorial-dim">#{sr.readingNumber || sr.id}</span>
                          <span>{sr.title}</span>
                        </div>
                        <span className="text-editorial-dim text-[10px] truncate max-w-sm">
                          Trap: {sr.coreTrap}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Action CTAs */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={(e) => handleOpenBriefing(topic.id, e)}
                      className="flex-1 sm:flex-initial px-4 py-2 rounded-lg bg-[#18181B] text-white hover:text-brand-lime border border-[#3F3F46] hover:border-brand-lime/40 font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>EXECUTIVE BRIEFING & FORMULAS</span>
                    </button>
                    <button
                      onClick={(e) => handleLaunchDrill(topic.id, e)}
                      className="flex-1 sm:flex-initial px-4 py-2 rounded-lg bg-brand-lime text-black font-mono text-xs font-bold flex items-center justify-center gap-2 hover:bg-brand-neon active:scale-95 transition-all shadow-lime-sm"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>LAUNCH 2-QUESTION VIGNETTE DRILL</span>
                    </button>
                  </div>

                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
};

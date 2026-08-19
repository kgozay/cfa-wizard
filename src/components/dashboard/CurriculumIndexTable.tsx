"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, FileText, Play, BookOpen, AlertCircle, Search, Filter, Tag } from "lucide-react";
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
    drillQuestionCount,
    soundEnabled,
  } = useCFAStore();

  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(activeTopicId || "01");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [weightFilter, setWeightFilter] = useState<string>("ALL");

  // Keep expandedTopicId in sync with activeTopicId from store
  React.useEffect(() => {
    if (activeTopicId) {
      setExpandedTopicId(activeTopicId);
    }
  }, [activeTopicId]);

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
    <div className="w-full bg-[#0B0B0E] border border-[#1F1F23] rounded-xl overflow-hidden font-sans shadow-lg">
      
      {/* Search & Filter Header */}
      <div className="p-4 border-b border-[#1F1F23] bg-[#0E0E12] flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search 10 tracks, traps, learning modules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#09090B] border border-[#27272A] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-brand-lime/50 font-mono"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto font-mono text-xs overflow-x-auto pb-1 sm:pb-0">
          <span className="text-zinc-400 text-xs font-semibold mr-1 hidden lg:inline">WEIGHT:</span>
          {(["ALL", "HIGH", "MEDIUM", "STANDARD"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                if (soundEnabled) sound.playKeyClick();
                setWeightFilter(cat);
              }}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                weightFilter === cat
                  ? "bg-brand-lime text-black font-bold shadow-lime-sm"
                  : "bg-[#18181B] text-zinc-400 hover:text-white border border-[#27272A]"
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
          const isInProgress = (activeTopicId || inProgressTopicId) === topic.id;
          const isExpanded = expandedTopicId === topic.id;

          let statusText = "READY";
          let statusClass = "text-zinc-400 border-[#27272A] bg-[#121215]";
          if (isCompleted) {
            statusText = "COMPLETED";
            statusClass = "text-brand-lime border-brand-lime/30 bg-brand-lime/10";
          } else if (isInProgress) {
            statusText = "ACTIVE";
            statusClass = "text-brand-lime border-brand-lime/60 bg-brand-lime/15 shadow-lime-sm font-extrabold";
          }

          return (
            <div
              key={topic.id}
              className={`transition-colors ${
                isInProgress ? "bg-[#101014]" : "hover:bg-[#0E0E12]/80"
              }`}
            >
              
              {/* Row Header */}
              <div
                onClick={() => toggleExpand(topic.id)}
                className="px-5 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 cursor-pointer select-none"
              >
                {/* Left: Index & Reading Title */}
                <div className="flex items-center gap-3.5">
                  <span className="font-mono text-xs font-bold text-brand-lime">
                    [{topic.id}]
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-white tracking-tight font-sans">
                        {topic.name}
                      </h3>
                      {topic.weightCategory === "HIGH" && (
                        <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-brand-lime/10 border border-brand-lime/40 text-brand-lime font-mono text-[11px] font-bold">
                          HIGH YIELD
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 font-mono mt-0.5">
                      Weight: <span className="text-white font-semibold">{topic.weight}</span> &bull; {topic.subReadings.length} Modules &bull; {topic.formulas.length} Formulas
                    </p>
                  </div>
                </div>

                {/* Right: Status Indicator & Chevron */}
                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                  <div className={`font-mono text-xs font-bold px-3 py-1 rounded border tracking-wider uppercase ${statusClass}`}>
                    {statusText}
                  </div>
                  <div className="p-1.5 rounded text-zinc-400 hover:text-white">
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-brand-lime" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

              </div>

              {/* Expandable Sub-Readings & Action Drawer */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 bg-[#09090B] border-t border-[#18181B] space-y-4 animate-in fade-in duration-150">
                  
                  {/* High Yield Trap Warning Box */}
                  <div className="p-3.5 rounded-lg bg-[#141418] border border-amber-400/30 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-mono text-xs font-bold text-amber-400 uppercase tracking-wide">
                        PRIMARY TRAP MECHANISM
                      </div>
                      <p className="text-xs text-zinc-200 mt-0.5 leading-relaxed">
                        {topic.highYieldTrapArea}
                      </p>
                    </div>
                  </div>

                  {/* Sub-Readings List with LOS Codes */}
                  <div className="space-y-2 font-mono text-xs">
                    <div className="text-xs text-zinc-400 font-bold tracking-wider uppercase mb-1">
                      OFFICIAL LEARNING MODULES &amp; LOS TAXONOMY:
                    </div>
                    {topic.subReadings.map((sr) => (
                      <div
                        key={sr.id}
                        className="p-3 rounded-lg bg-[#0E0E12] border border-[#1F1F23] hover:border-[#2D2D35] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex items-center gap-2 text-white font-sans font-semibold">
                          {sr.losCode && (
                            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#141418] border border-brand-lime/30 text-brand-lime font-bold">
                              {sr.losCode}
                            </span>
                          )}
                          <span>{sr.title}</span>
                        </div>
                        <span className="text-zinc-400 text-xs font-mono">
                          Trap: <strong className="text-zinc-200">{sr.coreTrap}</strong>
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Action CTAs */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={(e) => handleOpenBriefing(topic.id, e)}
                      className="flex-1 sm:flex-initial px-4 py-2.5 rounded-lg bg-[#18181B] text-white hover:text-brand-lime border border-[#3F3F46] hover:border-brand-lime/40 font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>EXECUTIVE BRIEFING &amp; FORMULAS</span>
                    </button>
                    <button
                      onClick={(e) => handleLaunchDrill(topic.id, e)}
                      className="flex-1 sm:flex-initial px-5 py-2.5 rounded-lg bg-brand-lime text-black font-mono text-xs font-extrabold flex items-center justify-center gap-2 hover:bg-brand-lime/90 active:scale-95 transition-all shadow-lime-sm"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>LAUNCH {drillQuestionCount}-QUESTION VIGNETTE DRILL</span>
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

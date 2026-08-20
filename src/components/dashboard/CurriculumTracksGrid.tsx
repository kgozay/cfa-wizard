"use client";

import React, { useState } from "react";
import { Play, BookOpen, ChevronDown, ChevronUp, CheckCircle2, AlertCircle, FileText, ArrowRight } from "lucide-react";
import { CFA_CURRICULUM } from "@/data/curriculum";
import { CFA_VIGNETTES } from "@/data/vignettes";
import { useCFAStore } from "@/store/useCFAStore";
import { sound } from "@/components/common/SoundEffects";

interface CurriculumTracksGridProps {
  onOpenBriefing: (topicId: string) => void;
  onOpenScenarioSimulator: (topicId: string) => void;
}

export const CurriculumTracksGrid: React.FC<CurriculumTracksGridProps> = ({
  onOpenBriefing,
  onOpenScenarioSimulator,
}) => {
  const {
    completedTopicIds,
    activeTopicId,
    inProgressTopicId,
    selectTopic,
    startVignetteDrill,
    drillQuestionCount,
    vignetteResults,
    soundEnabled,
  } = useCFAStore();

  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);

  const toggleExpand = (topicId: string) => {
    if (soundEnabled) sound.playKeyClick();
    setExpandedTopicId((prev) => (prev === topicId ? null : topicId));
  };

  const handleStartDrill = (topicId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (soundEnabled) sound.playNodeSwitch();
    selectTopic(topicId);
    startVignetteDrill(topicId);
  };

  return (
    <div className="space-y-4 font-mono">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#1F1F23]">
        <div className="flex items-center gap-2">
          <span className="text-white text-xs font-bold uppercase tracking-wider">
            OFFICIAL 10 CFA LEVEL 1 CURRICULUM TRACKS
          </span>
          <span className="text-zinc-600">//</span>
          <span className="text-zinc-400 text-xs">
            150 INSTITUTIONAL DIAGNOSTIC QUESTIONS
          </span>
        </div>
        <div className="text-[11px] text-zinc-400">
          COMPLETED: <strong className="text-brand-lime">{completedTopicIds.length}</strong> / 10 TRACKS
        </div>
      </div>

      {/* Grid of 10 Institutional Track Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-3.5">
        {CFA_CURRICULUM.map((topic) => {
          const isCompleted = completedTopicIds.includes(topic.id);
          const isCurrent = (activeTopicId || inProgressTopicId) === topic.id;
          const isExpanded = expandedTopicId === topic.id;
          const baseVignette = CFA_VIGNETTES.find((v) => v.topicId === topic.id);
          const result = baseVignette ? vignetteResults[baseVignette.id] : undefined;

          return (
            <div
              key={topic.id}
              className={`rounded-xl border transition-all duration-150 overflow-hidden flex flex-col justify-between ${
                isCurrent
                  ? "bg-[#0E0E12] border-brand-lime/40 shadow-lg shadow-black/40 ring-1 ring-brand-lime/20"
                  : isCompleted
                  ? "bg-[#0B0B0E] border-brand-lime/20 hover:border-brand-lime/40"
                  : "bg-[#0B0B0E] border-[#1F1F23] hover:border-[#2E2E36]"
              }`}
            >
              {/* Card Header */}
              <div className="p-4 sm:p-5 flex items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-[#18181D] border border-[#27272A] text-[11px] font-bold text-brand-lime">
                      [{topic.id}]
                    </span>
                    <span className="text-xs text-zinc-400 font-semibold">
                      WEIGHT: <strong className="text-white">{topic.weight}</strong>
                    </span>
                    {topic.weightCategory === "HIGH" && (
                      <span className="px-1.5 py-0.5 rounded bg-brand-lime/10 border border-brand-lime/30 text-brand-lime text-[10px] font-bold">
                        HIGH YIELD
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white font-sans tracking-tight truncate">
                    {topic.name}
                  </h3>

                  <p className="text-xs text-zinc-400 font-sans line-clamp-1">
                    {topic.subReadings.length} Modules &bull; {topic.formulas.length} Formulas &bull; {topic.highYieldTrapArea}
                  </p>
                </div>

                {/* Status Indicator Badge */}
                <div className="shrink-0 flex items-center gap-1.5">
                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-brand-lime/10 border border-brand-lime/30 text-brand-lime text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      MASTERED
                    </span>
                  ) : isCurrent ? (
                    <span className="px-2 py-1 rounded bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[10px] font-bold">
                      ACTIVE
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded bg-[#141418] border border-[#27272A] text-zinc-400 text-[10px] font-semibold">
                      READY
                    </span>
                  )}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="px-4 sm:px-5 py-3 bg-[#08080A] border-t border-[#18181B] flex items-center justify-between gap-2 text-xs">
                <button
                  onClick={() => toggleExpand(topic.id)}
                  className="text-zinc-400 hover:text-white flex items-center gap-1 text-[11px] font-semibold transition-colors"
                >
                  <span>{isExpanded ? "HIDE DETAILS" : "INSPECT MODULES"}</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenBriefing(topic.id)}
                    className="px-2.5 py-1 rounded bg-[#141418] hover:bg-[#1C1C22] text-zinc-300 hover:text-white border border-[#27272A] text-[11px] font-semibold transition-colors"
                    title="2-Min Executive Briefing"
                  >
                    BRIEFING
                  </button>

                  <button
                    onClick={(e) => handleStartDrill(topic.id, e)}
                    className="px-3.5 py-1.5 rounded-lg bg-brand-lime hover:bg-brand-neon text-black font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-lime-sm active:scale-95"
                  >
                    <Play className="w-3 h-3 fill-black" />
                    <span>DRILL {drillQuestionCount}Q</span>
                  </button>
                </div>
              </div>

              {/* Expandable Module Drawer */}
              {isExpanded && (
                <div className="p-4 sm:p-5 bg-[#070709] border-t border-[#18181B] space-y-3 animate-in fade-in duration-150">
                  <div className="p-3 rounded-lg bg-[#101014] border border-amber-400/20 text-xs">
                    <span className="font-bold text-amber-300 block mb-0.5">
                      TARGET TRAP CLASSIFICATION:
                    </span>
                    <p className="text-zinc-300 font-sans text-xs">
                      {topic.highYieldTrapArea}
                    </p>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                      CURRICULUM LEARNING MODULES ({topic.subReadings.length}):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                      {topic.subReadings.map((sub, idx) => (
                        <div
                          key={idx}
                          className="px-2.5 py-1.5 rounded bg-[#0E0E12] border border-[#1F1F23] flex items-center gap-2 text-zinc-300 font-sans"
                        >
                          <span className="font-mono text-[10px] font-bold text-brand-lime shrink-0">
                            [{sub.losCode || sub.id}]
                          </span>
                          <span className="truncate text-xs">{sub.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-400">
                      {topic.formulas.length} Official Formulas Documented
                    </span>
                    <button
                      onClick={() => onOpenScenarioSimulator(topic.id)}
                      className="text-brand-lime hover:underline font-semibold flex items-center gap-1"
                    >
                      <span>Launch Scenario Simulator for Track [{topic.id}]</span>
                      <ArrowRight className="w-3 h-3" />
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

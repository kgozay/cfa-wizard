"use client";

import React from "react";
import { Play, BookOpen, Wand2, AlertCircle, CheckCircle2, ChevronRight } from "lucide-react";
import { useCFAStore } from "@/store/useCFAStore";
import { CFA_CURRICULUM } from "@/data/curriculum";
import { CFA_VIGNETTES } from "@/data/vignettes";
import { sound } from "@/components/common/SoundEffects";

interface CurrentAssignmentCardProps {
  onOpenBriefing: (topicId: string) => void;
  onOpenScenarioSimulator: (topicId: string) => void;
}

export const CurrentAssignmentCard: React.FC<CurrentAssignmentCardProps> = ({
  onOpenBriefing,
  onOpenScenarioSimulator,
}) => {
  const {
    activeTopicId,
    inProgressTopicId,
    completedTopicIds,
    startVignetteDrill,
    drillQuestionCount,
    vignetteResults,
    soundEnabled,
  } = useCFAStore();

  const currentTopicId = activeTopicId || inProgressTopicId || "01";
  const topic = CFA_CURRICULUM.find((t) => t.id === currentTopicId) || CFA_CURRICULUM[0];
  const isCompleted = completedTopicIds.includes(topic.id);
  const baseVignette = CFA_VIGNETTES.find((v) => v.topicId === topic.id);
  const result = baseVignette ? vignetteResults[baseVignette.id] : undefined;

  const handleStartDrill = () => {
    if (soundEnabled) sound.playNodeSwitch();
    startVignetteDrill(topic.id);
  };

  return (
    <div className="w-full bg-[#0B0B0E] border border-[#27272A] rounded-xl p-5 sm:p-6 shadow-xl relative overflow-hidden font-mono">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-lime/[0.03] rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Left Info Column */}
        <div className="space-y-3 max-w-3xl">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-2 py-0.5 rounded bg-[#18181D] border border-[#2D2D35] text-[11px] font-bold text-zinc-300 tracking-wider">
              CURRENT ASSIGNMENT
            </span>
            <span className="text-zinc-600">//</span>
            <span className="text-brand-lime font-bold text-xs tracking-wide">
              TRACK [{topic.id}] OF 10
            </span>
            <span className="text-zinc-600">//</span>
            <span className="text-zinc-400 text-xs font-semibold">
              EXAM WEIGHT: <strong className="text-white">{topic.weight}</strong>
            </span>
            {isCompleted ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-brand-lime/10 border border-brand-lime/40 text-brand-lime text-[10px] font-bold">
                <CheckCircle2 className="w-3 h-3" />
                MASTERED
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[10px] font-bold">
                IN PROGRESS
              </span>
            )}
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-sans tracking-tight">
              {topic.name}
            </h2>
            <p className="text-xs text-zinc-400 font-sans mt-1">
              {topic.subReadings.length} Core Learning Modules &bull; {topic.formulas.length} Formula References &bull; Official CFA Level 1 Item Bank
            </p>
          </div>

          {/* High-Yield Trap Alert Bar */}
          <div className="p-3 rounded-lg bg-[#121215] border border-amber-400/30 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-amber-300">
                PRIMARY TRAP CLASSIFICATION:
              </span>{" "}
              <span className="text-zinc-300 font-sans">
                {topic.highYieldTrapArea}
              </span>
            </div>
          </div>
        </div>

        {/* Right CTA Action Column */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 justify-center">
          
          {/* Primary High-Contrast Start Drill Action */}
          <button
            onClick={handleStartDrill}
            className="px-6 py-3.5 rounded-lg bg-brand-lime hover:bg-brand-neon text-black font-extrabold text-xs tracking-wider flex items-center justify-center gap-2 transition-all shadow-lime-glow active:scale-95 uppercase"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>START {drillQuestionCount}Q VIGNETTE DRILL</span>
          </button>

          {/* Secondary Action Row */}
          <div className="grid grid-cols-2 gap-2 font-mono text-xs">
            <button
              onClick={() => onOpenBriefing(topic.id)}
              className="px-3 py-2 rounded-lg bg-[#141418] hover:bg-[#1C1C22] text-zinc-200 hover:text-white border border-[#27272A] hover:border-zinc-500 font-semibold transition-all flex items-center justify-center gap-1.5 text-[11px]"
              title="2-Minute Executive Summary & Formulas"
            >
              <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
              <span>BRIEFING</span>
            </button>

            <button
              onClick={() => onOpenScenarioSimulator(topic.id)}
              className="px-3 py-2 rounded-lg bg-[#141418] hover:bg-[#1C1C22] text-brand-lime border border-brand-lime/30 hover:border-brand-lime/60 font-semibold transition-all flex items-center justify-center gap-1.5 text-[11px]"
              title="Custom Scenario Simulator"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>SCENARIOS</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

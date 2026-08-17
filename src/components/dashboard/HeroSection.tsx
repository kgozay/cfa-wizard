"use client";

import React from "react";
import { Sparkles, Target, Zap, ShieldCheck, Play } from "lucide-react";
import { useCFAStore } from "@/store/useCFAStore";
import { sound } from "@/components/common/SoundEffects";
import { CFA_VIGNETTES } from "@/data/vignettes";

export const HeroSection: React.FC = () => {
  const {
    completedTopicIds,
    vignetteResults,
    trapLogs,
    startVignetteDrill,
    inProgressTopicId,
    soundEnabled,
  } = useCFAStore();

  const totalCompleted = completedTopicIds.length;
  const resultsList = Object.values(vignetteResults);
  const totalSolved = resultsList.length;
  const totalCorrect = resultsList.reduce((acc, r) => acc + r.score, 0);
  const totalQuestions = resultsList.reduce((acc, r) => acc + (r.total || 2), 0);
  const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const trapsAvoidedRate = totalSolved > 0 ? Math.max(0, 100 - Math.round((trapLogs.length / (totalQuestions || 1)) * 100)) : 100;

  const handleQuickLaunch = () => {
    if (soundEnabled) sound.playNodeSwitch();
    // Find active vignette for current in-progress topic
    const activeV = CFA_VIGNETTES.find((v) => v.topicId === inProgressTopicId) || CFA_VIGNETTES[0];
    startVignetteDrill(activeV.id);
  };

  return (
    <section className="relative pt-8 pb-10 border-b border-[#1F1F23]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Micro Header */}
        <div className="flex items-center gap-2 font-mono text-xs text-editorial-muted tracking-wider uppercase mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-lime" />
          <span>DIAGNOSTIC ENGINE // CFA LEVEL 1 CANDIDATE SUITE</span>
        </div>

        {/* Dual-Tone Large Display Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] max-w-5xl mb-6">
          Advanced quantitative models are redefining Level 1 diagnostic preparation{" "}
          <span className="text-editorial-muted font-normal block sm:inline">
            in real-time.
          </span>
        </h1>

        {/* Editorial Subtitle */}
        <p className="text-sm sm:text-base text-editorial-steely max-w-3xl leading-relaxed mb-8">
          Master high-yield trap mechanisms across all 10 curriculum tracks through 150 unique institutional diagnostic questions, step-by-step Texas Instruments BA II Plus workflows, and surgical Distractor Autopsies.
        </p>

        {/* Telemetry Highlight Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          
          {/* Card 1: Curriculum Track Progress */}
          <div className="p-3 rounded-lg bg-[#0E0E12] border border-[#1F1F23] flex flex-col justify-between">
            <div className="flex items-center justify-between text-editorial-dim mb-1">
              <span>UNITS MASTERED</span>
              <Target className="w-3.5 h-3.5 text-brand-lime" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-white">{totalCompleted}</span>
              <span className="text-editorial-dim">/ 10 Tracks</span>
            </div>
            <div className="w-full bg-[#18181B] h-1 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-brand-lime h-full transition-all duration-500"
                style={{ width: `${(totalCompleted / 10) * 100}%` }}
              />
            </div>
          </div>

          {/* Card 2: Vignette Success Rate */}
          <div className="p-3 rounded-lg bg-[#0E0E12] border border-[#1F1F23] flex flex-col justify-between">
            <div className="flex items-center justify-between text-editorial-dim mb-1">
              <span>DIAGNOSTIC ACCURACY</span>
              <Zap className="w-3.5 h-3.5 text-brand-lime" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-brand-lime">
                {totalSolved > 0 ? `${accuracy}%` : "—"}
              </span>
              <span className="text-editorial-dim">({totalCorrect}/{totalQuestions} Qs)</span>
            </div>
            <span className="text-[10px] text-editorial-dim mt-2 block">
              Target Benchmark: &ge; 70% MPS
            </span>
          </div>

          {/* Card 3: Traps Avoided */}
          <div className="p-3 rounded-lg bg-[#0E0E12] border border-[#1F1F23] flex flex-col justify-between">
            <div className="flex items-center justify-between text-editorial-dim mb-1">
              <span>TRAP IMMUNITY</span>
              <ShieldCheck className="w-3.5 h-3.5 text-brand-lime" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-white">
                {totalSolved > 0 ? `${trapsAvoidedRate}%` : "100%"}
              </span>
              <span className="text-editorial-dim">({trapLogs.length} traps caught)</span>
            </div>
            <span className="text-[10px] text-editorial-dim mt-2 block">
              Distractor Autopsy Logged
            </span>
          </div>

          {/* Card 4: Quick Launch CTA */}
          <div className="p-3 rounded-lg bg-[#141418] border border-brand-lime/30 flex flex-col justify-between hover:border-brand-lime/60 transition-all">
            <div className="flex items-center justify-between text-brand-lime text-[11px] font-semibold">
              <span>ACTIVE DRILL</span>
              <span className="w-2 h-2 rounded-full bg-brand-lime animate-ping" />
            </div>
            <div className="text-xs text-white truncate font-medium mt-1">
              Track {inProgressTopicId} Ready
            </div>
            <button
              onClick={handleQuickLaunch}
              className="mt-2 w-full py-1.5 rounded bg-brand-lime text-black font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-brand-neon active:scale-95 transition-all shadow-lime-sm"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>LAUNCH VIGNETTE</span>
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};

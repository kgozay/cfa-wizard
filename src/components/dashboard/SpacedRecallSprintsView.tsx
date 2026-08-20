"use client";

import React from "react";
import { Layers, Zap, AlertTriangle, Play, CheckCircle2, RotateCcw, ArrowRight, ShieldCheck } from "lucide-react";
import { useCFAStore } from "@/store/useCFAStore";
import { sound } from "@/components/common/SoundEffects";

interface SpacedRecallSprintsViewProps {
  onOpenScenarioSimulator: (topicId: string) => void;
}

export const SpacedRecallSprintsView: React.FC<SpacedRecallSprintsViewProps> = ({
  onOpenScenarioSimulator,
}) => {
  const {
    leitnerCards,
    trapLogs,
    setLeitnerDeckOpen,
    setSprintModalOpen,
    setTrapLogOpen,
    setWeakAreaTargetTopic,
    soundEnabled,
  } = useCFAStore();

  const now = Date.now();
  const box1Cards = leitnerCards.filter((c) => c.box === 1);
  const box2Cards = leitnerCards.filter((c) => c.box === 2);
  const box3Cards = leitnerCards.filter((c) => c.box === 3);
  const dueCards = leitnerCards.filter((c) => new Date(c.nextReviewAt).getTime() <= now);

  const handleLaunchSprint = () => {
    if (soundEnabled) sound.playNodeSwitch();
    setSprintModalOpen(true);
  };

  const handleOpenLeitner = () => {
    if (soundEnabled) sound.playNodeSwitch();
    setLeitnerDeckOpen(true);
  };

  const handleTargetTrapDrill = (topicId: string) => {
    if (soundEnabled) sound.playNodeSwitch();
    setWeakAreaTargetTopic(topicId);
    onOpenScenarioSimulator(topicId);
  };

  return (
    <div className="space-y-6 font-mono">
      
      {/* 2-Column Hub: Spaced Repetition + Sprint Simulator */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Left Column: Leitner Spaced Repetition Vault */}
        <div className="bg-[#0B0B0E] border border-[#27272A] rounded-xl p-5 sm:p-6 space-y-5 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#1F1F23] pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-lime" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  SPACED REPETITION VAULT
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-brand-lime/10 border border-brand-lime/30 text-brand-lime font-bold">
                LEITNER 3-BOX SYSTEM
              </span>
            </div>

            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              Every question you miss during diagnostic drills is automatically isolated into your active memory deck.
            </p>

            {/* Box Metric Stack */}
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-lg bg-[#121215] border border-[#27272A] flex items-center justify-between">
                <div>
                  <span className="text-zinc-300 font-bold block">Box 1: Daily Rapid Review</span>
                  <span className="text-[11px] text-zinc-500 font-sans">Interval: 1 Day</span>
                </div>
                <span className={`px-2.5 py-1 rounded font-bold text-xs ${
                  dueCards.length > 0 ? "bg-amber-400/20 text-amber-300 border border-amber-400/40" : "bg-[#18181B] text-zinc-400"
                }`}>
                  {box1Cards.length} Cards ({dueCards.length} Due)
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[#121215] border border-[#27272A] flex items-center justify-between">
                <div>
                  <span className="text-zinc-300 font-bold block">Box 2: Intermediate Retention</span>
                  <span className="text-[11px] text-zinc-500 font-sans">Interval: 3 Days</span>
                </div>
                <span className="px-2.5 py-1 rounded bg-[#18181B] text-zinc-400 font-bold text-xs">
                  {box2Cards.length} Cards
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[#121215] border border-[#27272A] flex items-center justify-between">
                <div>
                  <span className="text-zinc-300 font-bold block">Box 3: Long-Term Exam Mastery</span>
                  <span className="text-[11px] text-zinc-500 font-sans">Interval: 7 Days</span>
                </div>
                <span className="px-2.5 py-1 rounded bg-brand-lime/10 text-brand-lime border border-brand-lime/30 font-bold text-xs">
                  {box3Cards.length} Mastered
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleOpenLeitner}
            className="w-full py-3 px-4 rounded-lg bg-[#141418] hover:bg-[#1C1C22] text-white hover:text-brand-lime border border-[#27272A] hover:border-brand-lime/50 font-bold text-xs transition-all flex items-center justify-center gap-2"
          >
            <Layers className="w-4 h-4 text-brand-lime" />
            <span>OPEN FLASHCARD REVIEW DECK ({leitnerCards.length})</span>
          </button>
        </div>

        {/* Right Column: Interleaved Sprint Simulator */}
        <div className="bg-[#0B0B0E] border border-[#27272A] rounded-xl p-5 sm:p-6 space-y-5 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#1F1F23] pb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  INTERLEAVED SPRINT DRILL
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/30 text-amber-300 font-bold">
                10-QUESTION EXAM SIMULATOR
              </span>
            </div>

            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              Stress-test your cross-curriculum cognitive switching by tackling 10 randomized high-yield questions sampled across all 10 CFA tracks with strict 90-second exam pacing.
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-2 border-b border-[#18181B]">
                <span className="text-zinc-400">Total Drill Questions:</span>
                <span className="text-white font-bold">10 Randomized Items</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#18181B]">
                <span className="text-zinc-400">Per-Question Time Limit:</span>
                <span className="text-brand-lime font-bold">90 Seconds (15.0 Mins Total)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#18181B]">
                <span className="text-zinc-400">Curriculum Scope:</span>
                <span className="text-white font-bold">All 10 CFA Tracks</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLaunchSprint}
            className="w-full py-3.5 px-4 rounded-lg bg-brand-lime hover:bg-brand-neon text-black font-extrabold text-xs tracking-wider flex items-center justify-center gap-2 transition-all shadow-lime-glow active:scale-95 uppercase"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>LAUNCH 10-QUESTION SPRINT</span>
          </button>
        </div>

      </div>

      {/* Candidate Error Log / Trap Radar Summary Table */}
      <div className="w-full bg-[#0B0B0E] border border-[#27272A] rounded-xl p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#1F1F23] pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              CANDIDATE ERROR LOG ({trapLogs.length} LOGGED TRAPS)
            </h3>
          </div>
          {trapLogs.length > 0 && (
            <button
              onClick={() => setTrapLogOpen(true)}
              className="text-xs text-brand-lime hover:underline font-semibold"
            >
              View Full Error Radar &rarr;
            </button>
          )}
        </div>

        {trapLogs.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-500 font-sans space-y-1">
            <p className="text-zinc-400 font-semibold">No Trap Errors Logged</p>
            <p>Complete vignette drills or sprints to build your personalized distractor error profile.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#18181B] text-xs">
            {trapLogs.slice(0, 5).map((log, idx) => (
              <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-[#18181D] text-brand-lime text-[10px] font-bold">
                      [{log.topicId}]
                    </span>
                    <span className="font-bold text-white">{log.trapCategory || log.trapName}</span>
                    {log.errorMode && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-950/40 border border-red-900/40 text-red-300 font-mono">
                        {log.errorMode}
                      </span>
                    )}
                  </div>
                  <p className="text-zinc-400 font-sans text-[11px] line-clamp-1">
                    {log.autopsyExplanation}
                  </p>
                </div>

                <button
                  onClick={() => handleTargetTrapDrill(log.topicId)}
                  className="shrink-0 px-2.5 py-1 rounded bg-[#141418] hover:bg-[#1C1C22] text-brand-lime border border-brand-lime/30 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                >
                  <span>Practice Target Trap</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

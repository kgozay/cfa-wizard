"use client";

import React from "react";
import { Layers, Zap, AlertTriangle, Play, ArrowRight } from "lucide-react";
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
    <div className="space-y-6">
      {/* 2-Column Hub: Spaced Review + Mixed Sprint */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Spaced Review */}
        <div className="liquid-glass-card rounded-2xl p-6 sm:p-7 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-accent" />
                <h3 className="text-base font-bold text-white">
                  Spaced review
                </h3>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-accent/15 text-accent font-mono font-semibold">
                Leitner system
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Questions you miss during practice sets are automatically routed to your spaced review deck.
            </p>

            {/* Stepped Retention Model */}
            <div className="space-y-2 text-xs">
              <div className="p-3.5 rounded-xl bg-white/[0.03] flex items-center justify-between">
                <div>
                  <span className="text-white font-semibold block">Box 1: Daily review</span>
                  <span className="text-xs text-slate-400 font-mono">Interval: 1 day</span>
                </div>
                <span className={`px-2.5 py-1 rounded-lg font-mono text-xs font-semibold ${
                  dueCards.length > 0 ? "bg-warning/20 text-warning" : "bg-white/[0.04] text-slate-400"
                }`}>
                  {box1Cards.length} cards ({dueCards.length} due)
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] flex items-center justify-between">
                <div>
                  <span className="text-white font-semibold block">Box 2: Intermediate retention</span>
                  <span className="text-xs text-slate-400 font-mono">Interval: 3 days</span>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] text-slate-400 font-mono font-semibold text-xs">
                  {box2Cards.length} cards
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] flex items-center justify-between">
                <div>
                  <span className="text-white font-semibold block">Box 3: Long-term mastery</span>
                  <span className="text-xs text-slate-400 font-mono">Interval: 7 days</span>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-accent/15 text-accent font-mono font-semibold text-xs">
                  {box3Cards.length} mastered
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleOpenLeitner}
            className="glass-pill-btn w-full py-3 px-4 rounded-xl text-white font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
          >
            <Layers className="w-4 h-4 text-accent" />
            <span>Open review deck ({leitnerCards.length} cards)</span>
          </button>
        </div>

        {/* Right Column: Mixed Topic Sprint */}
        <div className="liquid-glass-card rounded-2xl p-6 sm:p-7 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-warning" />
                <h3 className="text-base font-bold text-white">
                  Mixed topic sprint
                </h3>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-warning/15 text-warning font-mono font-semibold">
                10-question set
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Test your cross-curriculum cognitive agility with 10 randomized high-yield questions sampled across all 10 CFA topics with exam pacing.
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-2 border-b border-white/[0.04]">
                <span className="text-slate-400">Questions:</span>
                <span className="text-white font-semibold font-mono">10 randomized items</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/[0.04]">
                <span className="text-slate-400">Target pacing:</span>
                <span className="text-accent font-semibold font-mono">90s per question (15m total)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/[0.04]">
                <span className="text-slate-400">Curriculum scope:</span>
                <span className="text-white font-semibold">All 10 CFA topics</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLaunchSprint}
            className="lime-btn-primary w-full py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start 10-question sprint</span>
          </button>
        </div>
      </div>

      {/* Mistake Review / Trap Autopsy Table */}
      <div className="w-full liquid-glass-card rounded-2xl p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <h3 className="text-base font-bold text-white">
              Mistake review ({trapLogs.length} logged errors)
            </h3>
          </div>
          {trapLogs.length > 0 && (
            <button
              onClick={() => setTrapLogOpen(true)}
              className="text-xs sm:text-sm text-accent hover:underline font-semibold"
            >
              View full error log &rarr;
            </button>
          )}
        </div>

        {trapLogs.length === 0 ? (
          <div className="py-8 text-center text-xs sm:text-sm text-muted space-y-1">
            <p className="text-foreground font-semibold">No mistakes logged yet</p>
            <p>Complete practice questions or sprints to build your personalized error review profile.</p>
          </div>
        ) : (
          <div className="divide-y divide-divider text-xs">
            {trapLogs.slice(0, 5).map((log, idx) => (
              <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-surface-interactive text-accent text-xs font-mono font-semibold">
                      [{log.topicId}]
                    </span>
                    <span className="font-semibold text-foreground">{log.trapCategory || log.trapName}</span>
                    {log.errorMode && (
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-danger/10 text-danger font-mono">
                        {log.errorMode}
                      </span>
                    )}
                  </div>
                  <p className="text-muted text-xs line-clamp-1">
                    {log.autopsyExplanation}
                  </p>
                </div>

                <button
                  onClick={() => handleTargetTrapDrill(log.topicId)}
                  className="shrink-0 min-h-[36px] px-3 py-1.5 rounded-lg bg-surface-interactive hover:bg-surface-raised text-accent text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <span>Practice this trap</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

"use client";

import React from "react";
import { CFA_CURRICULUM } from "@/data/curriculum";
import { useCFAStore } from "@/store/useCFAStore";
import { sound } from "@/components/common/SoundEffects";
import { Check, Sparkles } from "lucide-react";

export const VerticalNodeTracker: React.FC = () => {
  const {
    completedTopicIds,
    inProgressTopicId,
    activeTopicId,
    selectTopic,
    soundEnabled,
  } = useCFAStore();

  const totalCompleted = completedTopicIds.length;

  const handleSelect = (id: string) => {
    if (soundEnabled) sound.playNodeSwitch();
    selectTopic(id);
  };

  return (
    <div className="w-full flex flex-col justify-between p-6 bg-[#0B0B0E] border border-[#1F1F23] rounded-xl font-mono">
      
      {/* Live Counter Display */}
      <div className="mb-6">
        <div className="text-[11px] text-editorial-dim tracking-widest uppercase mb-1">
          CURRICULUM NODE TRACKER
        </div>
        <div className="text-2xl font-extrabold text-white">
          <span className="text-brand-lime font-bold">[{totalCompleted}]</span>{" "}
          <span className="text-editorial-steely font-normal text-lg">of 10 units completed</span>
        </div>
        <p className="text-xs text-editorial-dim mt-1">
          Select any node to inspect track diagnostics and launch target vignette sets.
        </p>
      </div>

      {/* Stacked Minimalist Wireframe Circular Rings */}
      <div className="relative py-4 flex flex-col items-center">
        
        {/* Vertical Connecting Hairline Rule */}
        <div className="absolute left-1/2 -translate-x-1/2 top-4 bottom-4 w-[1px] bg-[#1F1F23] z-0" />

        <div className="w-full space-y-4 relative z-10">
          {CFA_CURRICULUM.map((topic, index) => {
            const isCompleted = completedTopicIds.includes(topic.id);
            const isActive = inProgressTopicId === topic.id || activeTopicId === topic.id;

            return (
              <div
                key={topic.id}
                onClick={() => handleSelect(topic.id)}
                className={`group flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all duration-200 border ${
                  isActive
                    ? "bg-[#141418] border-brand-lime/50 shadow-[0_0_15px_rgba(216,255,62,0.15)]"
                    : "bg-[#09090B]/60 border-transparent hover:border-[#27272A] hover:bg-[#101014]"
                }`}
              >
                {/* Left: Wireframe Ring / Solid Glow Node */}
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center justify-center">
                    {isActive ? (
                      // Vibrant Glowing Solid Electric Lime Circle
                      <div className="w-6 h-6 rounded-full bg-brand-lime flex items-center justify-center shadow-[0_0_16px_rgba(216,255,62,0.8)] animate-pulse">
                        <div className="w-2 h-2 rounded-full bg-black" />
                      </div>
                    ) : isCompleted ? (
                      // Completed Node with Subtle Check
                      <div className="w-6 h-6 rounded-full border-[1.5px] border-editorial-muted/60 bg-[#18181B] flex items-center justify-center text-editorial-muted">
                        <Check className="w-3 h-3 text-editorial-steely" />
                      </div>
                    ) : (
                      // Minimalist Wireframe Hollow Circular Ring (1.5px border)
                      <div className="w-6 h-6 rounded-full border-[1.5px] border-[#27272A] group-hover:border-editorial-muted transition-colors flex items-center justify-center">
                        <span className="text-[10px] text-editorial-dim group-hover:text-editorial-steely">
                          {topic.id}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Topic Title & Index */}
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold tracking-tight text-white group-hover:text-brand-lime transition-colors">
                        {topic.shortName}
                      </span>
                    </div>
                    <span className="text-[10px] text-editorial-dim block">
                      Track {topic.id} • {topic.weight}
                    </span>
                  </div>
                </div>

                {/* Right: State Label */}
                <div className="text-right">
                  {isActive ? (
                    <span className="text-[10px] font-bold text-brand-lime tracking-wider uppercase">
                      ACTIVE
                    </span>
                  ) : isCompleted ? (
                    <span className="text-[10px] text-editorial-muted tracking-wider uppercase">
                      DONE
                    </span>
                  ) : (
                    <span className="text-[10px] text-[#3F3F46] tracking-wider uppercase">
                      READY
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Bottom Track Summary Pill */}
      {activeTopicId && (
        <div className="mt-6 pt-4 border-t border-[#1F1F23] text-xs">
          <div className="text-editorial-dim text-[11px] mb-1">SELECTED TRACK:</div>
          <div className="text-white font-medium text-xs truncate">
            {CFA_CURRICULUM.find((t) => t.id === activeTopicId)?.name}
          </div>
          <div className="text-[10px] text-editorial-muted mt-1 truncate">
            Trap: {CFA_CURRICULUM.find((t) => t.id === activeTopicId)?.highYieldTrapArea}
          </div>
        </div>
      )}

    </div>
  );
};

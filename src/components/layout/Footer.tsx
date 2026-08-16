"use client";

import React from "react";
import { useCFAStore } from "@/store/useCFAStore";

export const Footer: React.FC = () => {
  const { completedTopicIds, inProgressTopicId } = useCFAStore();

  return (
    <footer className="w-full bg-[#09090B] border-t border-[#1F1F23] py-6 px-4 sm:px-6 lg:px-8 mt-16 font-mono text-xs text-editorial-dim">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Technical tracker index */}
        <div className="flex items-center gap-2">
          <span className="text-brand-lime font-bold">TRACKER 001</span>
          <span>—</span>
          <span className="text-editorial-muted">CURRICULUM LAYER {inProgressTopicId} — 10</span>
          <span>—</span>
          <span>VERCEL FULLSTACK RUNTIME</span>
        </div>

        {/* Center note */}
        <div className="text-center text-editorial-dim text-[11px]">
          HIGH-YIELD CFA LEVEL 1 ENGINE // TI BA II PLUS INTEGRATION // REAL-TIME AUTOPSY
        </div>

        {/* Right copyright / metrics */}
        <div className="flex items-center gap-3 text-editorial-muted">
          <span>{completedTopicIds.length}/10 UNITS MASTERED</span>
          <span className="text-[#27272A]">|</span>
          <span className="text-white font-medium">BUILD 2026.08</span>
        </div>

      </div>
    </footer>
  );
};

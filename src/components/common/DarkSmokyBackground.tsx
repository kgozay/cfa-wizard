"use client";

import React from "react";

/**
 * Atmospheric dark smoky mesh background.
 * Provides subtle, organic, slow-drifting charcoal and midnight smoke depth
 * behind liquid glass surfaces with zero green tint or bright colors.
 * Fully GPU-accelerated and accessible (disabled on prefers-reduced-motion).
 */
export const DarkSmokyBackground: React.FC = () => {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
    >
      {/* Smoke Cloud 1: Deep charcoal slate drift */}
      <div className="smoke-orb-1 absolute -top-40 left-[15%] w-[800px] h-[800px] rounded-full bg-slate-800/30 blur-[150px]" />

      {/* Smoke Cloud 2: Dark zinc / obsidian shadow drift */}
      <div className="smoke-orb-2 absolute top-[25%] -right-20 w-[750px] h-[750px] rounded-full bg-zinc-800/25 blur-[160px]" />

      {/* Smoke Cloud 3: Midnight charcoal baseline drift */}
      <div className="smoke-orb-3 absolute -bottom-32 left-[10%] w-[700px] h-[700px] rounded-full bg-slate-900/40 blur-[140px]" />

      {/* Ambient dark veil */}
      <div className="absolute inset-0 bg-[#070a09]/65" />
    </div>
  );
};

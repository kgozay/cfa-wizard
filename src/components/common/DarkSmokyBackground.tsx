"use client";

import React from "react";

/**
 * High-performance atmospheric dark smoky mesh background.
 * Uses pure CSS radial gradients instead of heavy `filter: blur(...)` to guarantee
 * 60fps/120fps hardware acceleration with zero compositor lag on Retina displays.
 * Provides rich, visible charcoal/slate smoke depth behind liquid glass cards.
 */
export const DarkSmokyBackground: React.FC = () => {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
      aria-hidden="true"
    >
      {/* Smoke Cloud 1: Luminous slate-silver plume drifting behind top header and left card */}
      <div
        className="smoke-drift-1 absolute -top-[15%] left-[5%] w-[1200px] h-[1200px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(135, 165, 205, 0.55) 0%, rgba(85, 115, 150, 0.35) 35%, rgba(45, 65, 90, 0.18) 55%, transparent 75%)",
        }}
      />

      {/* Smoke Cloud 2: Charcoal/steel atmospheric plume drifting across center-right & syllabus CTA */}
      <div
        className="smoke-drift-2 absolute top-[8%] -right-[10%] w-[1250px] h-[1250px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(145, 175, 215, 0.50) 0%, rgba(95, 125, 160, 0.32) 38%, rgba(50, 70, 98, 0.16) 58%, transparent 75%)",
        }}
      />

      {/* Smoke Cloud 3: Misty slate wisp drifting diagonally through center workspace & tab bar */}
      <div
        className="smoke-drift-3 absolute top-[30%] left-[8%] w-[1100px] h-[1100px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(125, 155, 195, 0.48) 0%, rgba(80, 110, 145, 0.30) 40%, rgba(40, 60, 85, 0.15) 60%, transparent 75%)",
        }}
      />

      {/* Smoke Cloud 4: Billowing charcoal/steel plume behind curriculum table */}
      <div
        className="smoke-drift-4 absolute -bottom-[15%] right-[2%] w-[1200px] h-[1200px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(140, 170, 210, 0.52) 0%, rgba(90, 120, 155, 0.32) 38%, rgba(48, 68, 92, 0.16) 58%, transparent 75%)",
        }}
      />

      {/* Smoke Cloud 5: Lower-left atmospheric depth plume */}
      <div
        className="smoke-drift-5 absolute -bottom-[10%] -left-[5%] w-[1050px] h-[1050px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(120, 150, 185, 0.45) 0%, rgba(75, 100, 130, 0.28) 40%, rgba(35, 52, 75, 0.14) 60%, transparent 72%)",
        }}
      />

      {/* Very soft cinematic vignette that preserves central workspace focus without dimming the smoke */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, transparent 60%, rgba(9, 10, 15, 0.25) 100%)",
        }}
      />
    </div>
  );
};


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
      {/* Smoke Cloud 1: Deep slate/steel luminous fog drifting slowly from top-left */}
      <div
        className="smoke-drift-1 absolute -top-[15%] left-[5%] w-[1100px] h-[1100px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(58, 77, 105, 0.38) 0%, rgba(35, 48, 68, 0.18) 42%, transparent 72%)",
        }}
      />

      {/* Smoke Cloud 2: Charcoal/zinc atmospheric fog drifting across center-right */}
      <div
        className="smoke-drift-2 absolute top-[20%] -right-[15%] w-[1000px] h-[1000px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(65, 78, 98, 0.32) 0%, rgba(38, 46, 60, 0.14) 45%, transparent 70%)",
        }}
      />

      {/* Smoke Cloud 3: Midnight slate cloud drifting along lower-left */}
      <div
        className="smoke-drift-3 absolute -bottom-[20%] left-[15%] w-[1050px] h-[1050px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(70, 85, 110, 0.34) 0%, rgba(28, 38, 52, 0.12) 48%, transparent 75%)",
        }}
      />

      {/* Soft cinematic vignette that keeps focus on the center glass workspace */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, transparent 40%, rgba(9, 10, 15, 0.75) 100%)",
        }}
      />
    </div>
  );
};


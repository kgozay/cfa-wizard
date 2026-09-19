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
            "radial-gradient(circle, rgba(70, 95, 130, 0.45) 0%, rgba(35, 52, 75, 0.22) 45%, transparent 72%)",
        }}
      />

      {/* Smoke Cloud 2: Charcoal/zinc atmospheric fog drifting across center-right */}
      <div
        className="smoke-drift-2 absolute top-[20%] -right-[15%] w-[1000px] h-[1000px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(80, 95, 120, 0.40) 0%, rgba(42, 52, 70, 0.18) 45%, transparent 70%)",
        }}
      />

      {/* Smoke Cloud 3: Midnight slate cloud drifting along lower-left */}
      <div
        className="smoke-drift-3 absolute -bottom-[20%] left-[15%] w-[1050px] h-[1050px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(75, 100, 135, 0.42) 0%, rgba(32, 45, 62, 0.16) 48%, transparent 75%)",
        }}
      />

      {/* Soft cinematic vignette that keeps focus on the center glass workspace */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, transparent 40%, rgba(9, 10, 15, 0.5) 100%)",
        }}
      />
    </div>
  );
};


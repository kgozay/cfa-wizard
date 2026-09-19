"use client";

import React from "react";

interface CFAWizardMarkProps {
  className?: string;
  size?: number;
}

/**
 * Geometric brand mark for CFA Wizard.
 * Combines a faceted structural 'W' with an ascending data node.
 * Strictly 1-2 solid colors, optimized for 16-24px display.
 */
export const CFAWizardMark: React.FC<CFAWizardMarkProps> = ({
  className = "h-5 w-5",
  size = 20,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      {/* Structural faceted W path */}
      <path
        d="M3 5.5L7.5 18.5L12 9.5L16.5 18.5L21 5.5"
        stroke="var(--accent)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Precision node at the apex indicating focus and progress */}
      <circle
        cx="12"
        cy="9.5"
        r="2"
        fill="var(--accent-strong)"
      />
      {/* Base baseline accent dash */}
      <path
        d="M9.5 20.5H14.5"
        stroke="var(--foreground)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
};

"use client";

import React from "react";

interface TopicProgressRingProps {
  completedCount: number;
  totalCount?: number;
  compact?: boolean;
  className?: string;
}

export const TopicProgressRing: React.FC<TopicProgressRingProps> = ({
  completedCount,
  totalCount = 10,
  compact = false,
  className = "",
}) => {
  const safeCompleted = Math.max(0, Math.min(completedCount, totalCount));
  const fraction = totalCount > 0 ? safeCompleted / totalCount : 0;
  const percentage = Math.round(fraction * 100);

  // Geometry settings
  const size = compact ? 76 : 92;
  const strokeWidth = compact ? 7 : 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - fraction * circumference;

  return (
    <div
      className={`flex items-center gap-4 ${className}`}
      role="img"
      aria-label={`${safeCompleted} of ${totalCount} topics completed (${percentage}%)`}
    >
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg
          className="h-full w-full -rotate-90 transform"
          viewBox={`0 0 ${size} ${size}`}
          aria-hidden="true"
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth={strokeWidth}
          />
          {/* Progress stroke */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-[stroke-dashoffset] duration-500 ease-out"
          />
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-mono text-sm font-bold tracking-tight text-foreground tabular-nums sm:text-base">
            {safeCompleted}/{totalCount}
          </span>
        </div>
      </div>

      <div className="flex flex-col">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted sm:text-xs">
          Curriculum progress
        </span>
        <span className="text-sm font-semibold text-foreground sm:text-base">
          {safeCompleted} of {totalCount} topics completed
        </span>
        <span className="text-xs text-muted">
          {percentage}% syllabus coverage
        </span>
      </div>
    </div>
  );
};

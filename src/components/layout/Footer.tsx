"use client";

import React from "react";
import { useCFAStore } from "@/store/useCFAStore";

export const Footer: React.FC = () => {
  const { completedTopicIds } = useCFAStore();

  return (
    <footer className="mt-14 w-full border-t border-divider px-4 py-7 text-xs sm:text-sm text-muted sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p>CFA Wizard is an independent study tool and is not affiliated with CFA Institute.</p>
        <p><span className="font-mono font-medium text-foreground">{completedTopicIds.length} of 10</span> topics completed</p>
      </div>
    </footer>
  );
};

"use client";

import React, { useEffect } from "react";
import { X, Keyboard, Zap, Calculator } from "lucide-react";
import { useCFAStore } from "@/store/useCFAStore";
import { sound } from "@/components/common/SoundEffects";

export const KeyboardShortcutsModal: React.FC = () => {
  const { isShortcutsOpen, setShortcutsOpen, soundEnabled } = useCFAStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isShortcutsOpen) {
        setShortcutsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isShortcutsOpen, setShortcutsOpen]);

  if (!isShortcutsOpen) return null;

  const handleClose = () => {
    if (soundEnabled) sound.playKeyClick();
    setShortcutsOpen(false);
  };

  const sections = [
    {
      title: "Practice sets and exams",
      icon: <Zap className="w-4 h-4 text-accent" />,
      shortcuts: [
        { keys: ["1", "2", "3"], altKeys: ["A", "B", "C"], description: "Answer the highlighted question" },
        { keys: ["↑", "↓"], description: "Move between questions in a practice set" },
        { keys: ["←", "→"], description: "Previous or next question in a mock exam" },
        { keys: ["F"], description: "Flag the current mock exam question" },
        { keys: ["Enter"], description: "Submit a completed practice set" },
        { keys: ["K"], description: "Show or hide the calculator" },
        { keys: ["Esc"], description: "Close the open dialog (asks first during a mock exam)" },
      ],
    },
    {
      title: "Dashboard",
      icon: <Calculator className="w-4 h-4 text-info" />,
      shortcuts: [
        { keys: ["K"], altKeys: ["C"], description: "Open the BA II Plus calculator" },
        { keys: ["F"], description: "Open the formula sheet" },
        { keys: ["R"], description: "Open the review deck" },
        { keys: ["S"], description: "Start a mixed-topic sprint" },
        { keys: ["G"], description: "Go to the Practice tab" },
      ],
    },
    {
      title: "General",
      icon: <Keyboard className="w-4 h-4 text-warning" />,
      shortcuts: [
        { keys: ["?"], description: "Show or hide this list" },
        { keys: ["M"], description: "Turn sound effects on or off" },
        { keys: ["0-9", "+", "−", "×", "÷"], description: "Type into the calculator while it is open" },
      ],
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-hud-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 font-sans"
    >
      <div className="liquid-glass-card rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/[0.04] bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h2 id="shortcuts-hud-title" className="text-sm font-bold text-white flex items-center gap-2">
                <span>Keyboard shortcuts</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/15 text-accent">
                  Shortcuts
                </span>
              </h2>
              <p className="text-[11px] tabular-nums text-slate-400">
                High-velocity hotkeys for zero-latency CFA study workflows
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            aria-label="Close shortcuts HUD"
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl glass-pill-btn text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts Content */}
        <div className="p-4 sm:p-5 space-y-6 overflow-y-auto flex-1 tabular-nums text-xs">
          {sections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-3">
              <div className="flex items-center gap-2 text-muted font-bold text-[11px] border-b border-divider pb-1.5">
                {section.icon}
                <span>{section.title}</span>
              </div>

              <div className="space-y-2">
                {section.shortcuts.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 p-2 rounded-lg bg-surface-interactive border border-divider hover:border-control-boundary-hover transition-colors"
                  >
                    <div className="text-muted-strong font-sans text-xs">
                      {item.description}
                    </div>
                    <div className="flex items-center gap-1 shrink-0 self-start sm:self-auto">
                      {item.keys.map((k, kIdx) => (
                        <kbd
                          key={kIdx}
                          className="px-2 py-1 rounded bg-surface-raised border border-control text-accent tabular-nums text-[11px] font-bold shadow-sm"
                        >
                          {k}
                        </kbd>
                      ))}
                      {item.altKeys && (
                        <>
                          <span className="text-muted text-[10px] select-none">or</span>
                          {item.altKeys.map((ak, akIdx) => (
                            <kbd
                              key={akIdx}
                              className="px-2 py-1 rounded bg-surface-raised border border-control text-muted-strong tabular-nums text-[11px] font-bold shadow-sm"
                            >
                              {ak}
                            </kbd>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-control bg-background-elevated flex items-center justify-between text-[11px] tabular-nums text-muted">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span>Single-key shortcuts are paused while you type or while an exam or dialog is open</span>
          </span>
          <button
            onClick={handleClose}
            className="px-3 py-1 rounded-lg bg-accent text-accent-ink font-bold hover:bg-accent/90 transition-all"
          >
            Got it (Esc)
          </button>
        </div>

      </div>
    </div>
  );
};

"use client";

import React, { useEffect } from "react";
import { X, Keyboard, Zap, Calculator, BookOpen, Layers, Sparkles, AlertTriangle, Volume2, CornerDownLeft } from "lucide-react";
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
      title: "Active Drill & Exam Flow",
      icon: <Zap className="w-4 h-4 text-brand-lime" />,
      shortcuts: [
        { keys: ["1", "2", "3"], altKeys: ["A", "B", "C"], description: "Select answer choice (A, B, or C)" },
        { keys: ["Space"], altKeys: ["Enter"], description: "Submit diagnostic autopsy or advance" },
        { keys: ["Esc"], description: "Dismiss open tool modal or return to matrix" },
      ],
    },
    {
      title: "Institutional Workspace Tools",
      icon: <Calculator className="w-4 h-4 text-cyan-300" />,
      shortcuts: [
        { keys: ["K"], altKeys: ["C"], description: "Toggle TI BA II Plus Calculator Emulator" },
        { keys: ["F"], description: "Open LaTeX Formula Reference & Sandboxes" },
        { keys: ["R"], description: "Open Spaced Repetition Trap Vault (Leitner)" },
        { keys: ["S"], description: "Launch 10-Track Interleaved Sprint Drill" },
        { keys: ["G"], description: "Launch Dynamic AI Vignette Generator" },
        { keys: ["T"], description: "Inspect Diagnostic Trap Radar & Error Autopsies" },
      ],
    },
    {
      title: "System & Calculator Ergonomics",
      icon: <Keyboard className="w-4 h-4 text-amber-300" />,
      shortcuts: [
        { keys: ["?"], altKeys: ["Shift", "/"], description: "Toggle this Keyboard Shortcuts HUD" },
        { keys: ["M"], description: "Toggle audio chime & click sound effects" },
        { keys: ["^"], description: "Power of function (y^x) in BA II+ Calculator" },
        { keys: ["S"], description: "Square root (√x) in BA II+ Calculator" },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div className="bg-[#0B0B0E] border border-[#27272A] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#1F1F23] bg-[#0E0E12] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-lime/20 border border-brand-lime/40 flex items-center justify-center text-brand-lime">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-mono font-bold text-white tracking-wide uppercase flex items-center gap-2">
                <span>KEYBOARD ERGONOMICS HUD</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-lime/10 text-brand-lime border border-brand-lime/30">
                  SPEED KEYS
                </span>
              </h2>
              <p className="text-[11px] font-mono text-editorial-dim">
                High-velocity hotkeys for zero-latency CFA study workflows
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg bg-[#141418] text-editorial-dim hover:text-white border border-[#27272A] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts Content */}
        <div className="p-4 sm:p-5 space-y-6 overflow-y-auto flex-1 font-mono text-xs">
          {sections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-3">
              <div className="flex items-center gap-2 text-editorial-muted font-bold text-[11px] uppercase tracking-wider border-b border-[#1A1A1E] pb-1.5">
                {section.icon}
                <span>{section.title}</span>
              </div>

              <div className="space-y-2">
                {section.shortcuts.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 p-2 rounded-lg bg-[#121215] border border-[#1E1E22] hover:border-[#2C2C32] transition-colors"
                  >
                    <div className="text-zinc-300 font-sans text-xs">
                      {item.description}
                    </div>
                    <div className="flex items-center gap-1 shrink-0 self-start sm:self-auto">
                      {item.keys.map((k, kIdx) => (
                        <kbd
                          key={kIdx}
                          className="px-2 py-1 rounded bg-[#1C1C22] border border-[#33333A] text-brand-lime font-mono text-[11px] font-bold shadow-sm"
                        >
                          {k}
                        </kbd>
                      ))}
                      {item.altKeys && (
                        <>
                          <span className="text-editorial-dim text-[10px] select-none">or</span>
                          {item.altKeys.map((ak, akIdx) => (
                            <kbd
                              key={akIdx}
                              className="px-2 py-1 rounded bg-[#18181D] border border-[#2B2B32] text-zinc-300 font-mono text-[11px] font-bold shadow-sm"
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
        <div className="p-3 sm:p-4 border-t border-[#1F1F23] bg-[#0E0E12] flex items-center justify-between text-[11px] font-mono text-editorial-dim">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-lime" />
            <span>GLOBAL HOTKEYS ACTIVE THROUGHOUT STUDY COCKPIT</span>
          </span>
          <button
            onClick={handleClose}
            className="px-3 py-1 rounded-lg bg-brand-lime text-black font-bold hover:bg-brand-lime/90 transition-all"
          >
            GOT IT [ESC]
          </button>
        </div>

      </div>
    </div>
  );
};

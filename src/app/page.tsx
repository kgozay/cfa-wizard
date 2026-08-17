"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Calculator,
  Layers,
  Clock,
  Target,
  CheckCircle,
  AlertTriangle,
  Play,
  BookOpen,
  ChevronRight,
  Terminal,
} from "lucide-react";
import { CFA_CURRICULUM } from "@/data/curriculum";
import { TRAP_TAXONOMY, ERROR_MODE_LABELS } from "@/data/trapTaxonomy";
import { KeystrokeSequence } from "@/components/calculator/KeystrokeBadge";
import { FormattedMathText } from "@/components/common/KaTeXRenderer";
import { sound } from "@/components/common/SoundEffects";

export default function LandingPage() {
  const [activeTeaserAnswer, setActiveTeaserAnswer] = useState<string | null>(null);
  const [isTeaserSubmitted, setIsTeaserSubmitted] = useState<boolean>(false);

  const teaserQuestion = {
    stem: "An analyst calculates the 10-year percentage price change for a bond with Modified Duration = 7.40 and Annual Convexity = 68.0 following an instantaneous +150 bps (+1.50%) yield increase. The estimated percentage price change is closest to:",
    options: {
      A: "-11.100%",
      B: "-10.335%",
      C: "-9.570%",
    },
    correct: "B",
    trapNote: "Distractor A omits the positive convexity cushion entirely (-11.10%). Distractor C omits the 1/2 scalar factor in Taylor series second-order convexity (+1.530% instead of +0.765%).",
    keystrokes: "[-] 7.40 [\\times] 0.015 [+] (0.5 [\\times] 68.0 [\\times] 0.015 [x^2]) [=] -10.335%",
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-white selection:bg-brand-lime selection:text-black font-sans">
      
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full bg-[#09090B]/90 backdrop-blur-md border-b border-[#1F1F23]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-brand-lime animate-pulse shadow-lime-sm" />
            <span className="font-mono text-base font-bold tracking-tight text-white">
              CFA WIZARD
            </span>
            <span className="hidden sm:inline text-editorial-dim text-xs font-mono select-none">//</span>
            <span className="hidden sm:inline font-mono text-[11px] text-editorial-muted tracking-wider uppercase">
              INSTITUTIONAL DIAGNOSTIC SUITE
            </span>
          </div>

          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-6 font-mono text-xs text-editorial-dim">
              <a href="#methodology" className="hover:text-white transition-colors">METHODOLOGY</a>
              <a href="#curriculum" className="hover:text-white transition-colors">10 TRACKS</a>
              <a href="#keystrokes" className="hover:text-white transition-colors">BA II+ WORKFLOWS</a>
              <a href="#autopsy" className="hover:text-white transition-colors">DISTRACTOR AUTOPSIES</a>
            </nav>

            <Link
              href="/app"
              className="px-4 py-2 rounded-lg bg-brand-lime text-black font-mono text-xs font-extrabold hover:bg-brand-lime/90 shadow-lime-glow transition-all flex items-center gap-1.5 active:scale-95"
            >
              <span>LAUNCH COCKPIT</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 border-b border-[#1F1F23] overflow-hidden">
        
        {/* Subtle Background Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand-lime/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="max-w-4xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141418] border border-[#27272A] font-mono text-xs text-brand-lime">
              <Sparkles className="w-3.5 h-3.5" />
              <span>OFFICIAL 2026/2027 CURRICULUM DIAGNOSTIC ARCHITECTURE</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
              Stop memorizing answers.{" "}
              <span className="text-brand-lime block sm:inline">
                Diagnose candidate trap mechanics.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-editorial-steely max-w-2xl leading-relaxed">
              CFA Wizard dismantles the 10 official Level 1 curriculum volumes through surgical Distractor Autopsies, Texas Instruments BA II Plus keystroke paths, and adaptive Leitner spaced repetition.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4 font-mono text-xs">
              <Link
                href="/app"
                className="px-6 py-3.5 rounded-xl bg-brand-lime text-black font-extrabold hover:bg-brand-lime/90 shadow-lime-glow transition-all flex items-center gap-2 text-sm"
              >
                <span>ENTER STUDY COCKPIT</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#interactive-teaser"
                className="px-5 py-3.5 rounded-xl bg-[#141418] hover:bg-[#1C1C22] text-zinc-300 border border-[#27272A] font-bold transition-all flex items-center gap-2"
              >
                <span>TEST A LIVE VIGNETTE</span>
                <Play className="w-3.5 h-3.5 fill-current" />
              </a>
            </div>
          </div>

          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16 font-mono text-xs">
            <div className="p-4 rounded-xl bg-[#0E0E12] border border-[#1F1F23]">
              <div className="text-editorial-dim text-[11px] uppercase mb-1">CURRICULUM COVERAGE</div>
              <div className="text-2xl font-extrabold text-white">10 TRACKS</div>
              <div className="text-brand-lime text-[11px] mt-1">100% Official Volumes</div>
            </div>
            <div className="p-4 rounded-xl bg-[#0E0E12] border border-[#1F1F23]">
              <div className="text-editorial-dim text-[11px] uppercase mb-1">EXAM PACING BENCHMARK</div>
              <div className="text-2xl font-extrabold text-white">90s / Q</div>
              <div className="text-editorial-muted text-[11px] mt-1">Customizable Pacer</div>
            </div>
            <div className="p-4 rounded-xl bg-[#0E0E12] border border-[#1F1F23]">
              <div className="text-editorial-dim text-[11px] uppercase mb-1">ERROR TAXONOMY</div>
              <div className="text-2xl font-extrabold text-white">7 ERROR MODES</div>
              <div className="text-brand-lime text-[11px] mt-1">Post-Mortem Logging</div>
            </div>
            <div className="p-4 rounded-xl bg-[#0E0E12] border border-[#1F1F23]">
              <div className="text-editorial-dim text-[11px] uppercase mb-1">BA II PLUS KEYSTROKES</div>
              <div className="text-2xl font-extrabold text-white">1-CLICK PATHS</div>
              <div className="text-editorial-muted text-[11px] mt-1">Built-in Emulator</div>
            </div>
          </div>

        </div>
      </section>

      {/* Interactive Teaser Section */}
      <section id="interactive-teaser" className="py-16 border-b border-[#1F1F23] bg-[#0B0B0E]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-2">
            <span className="font-mono text-xs text-brand-lime uppercase tracking-widest font-bold">
              // LIVE INTERACTIVE SAMPLE DRILL
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Experience the Distractor Autopsy Engine
            </h2>
            <p className="text-xs sm:text-sm text-editorial-steely max-w-xl mx-auto">
              Test your intuition on this Fixed Income convexity question. Select an option to reveal the surgical autopsy.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0E0E12] border border-[#27272A] space-y-6 shadow-2xl">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="px-2 py-0.5 rounded bg-brand-lime/10 border border-brand-lime/30 text-brand-lime font-bold">
                FIXED INCOME // LOS 30.e
              </span>
              <span className="text-editorial-dim">DIFFICULTY: HIGH TRAP</span>
            </div>

            <div className="text-sm text-zinc-100 leading-relaxed font-sans font-medium">
              <FormattedMathText text={teaserQuestion.stem} />
            </div>

            {/* Options */}
            <div className="space-y-2.5 font-mono">
              {(["A", "B", "C"] as const).map((opt) => {
                const isSelected = activeTeaserAnswer === opt;
                const isCorrectKey = teaserQuestion.correct === opt;

                return (
                  <button
                    key={opt}
                    onClick={() => {
                      setActiveTeaserAnswer(opt);
                      setIsTeaserSubmitted(true);
                      if (opt === "B") sound.playSuccessChime();
                      else sound.playWarningBuzz();
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                      isSelected
                        ? isCorrectKey
                          ? "bg-brand-lime/10 border-brand-lime text-white"
                          : "bg-red-500/10 border-red-500/40 text-red-200"
                        : isTeaserSubmitted && isCorrectKey
                        ? "bg-brand-lime/5 border-brand-lime/40 text-brand-lime"
                        : "bg-[#121215] border-[#222226] text-zinc-300 hover:border-[#3F3F46]"
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected && isCorrectKey
                          ? "bg-brand-lime text-black"
                          : isSelected
                          ? "bg-red-500 text-white"
                          : "bg-[#1C1C22] text-zinc-400"
                      }`}
                    >
                      {opt}
                    </span>
                    <span className="text-xs pt-0.5">{teaserQuestion.options[opt]}</span>
                  </button>
                );
              })}
            </div>

            {/* Revealed Autopsy */}
            {isTeaserSubmitted && (
              <div className="p-4 rounded-xl bg-[#141418] border border-brand-lime/40 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-brand-lime font-bold">
                    AUTOPSY DIAGNOSIS: {activeTeaserAnswer === "B" ? "TRAP AVOIDED (+1)" : "TRAP TRIGGERED"}
                  </span>
                  <span className="text-editorial-dim">
                    Error Mode: <strong className="text-orange-400">Formula Scalar Omission</strong>
                  </span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                  {teaserQuestion.trapNote}
                </p>
                <div className="pt-2 border-t border-[#222226]">
                  <span className="text-[11px] font-mono text-editorial-dim block mb-1">
                    TI BA II PLUS KEYSTROKES:
                  </span>
                  <KeystrokeSequence sequence={teaserQuestion.keystrokes} />
                </div>
              </div>
            )}

            <div className="text-center pt-2">
              <Link
                href="/app"
                className="inline-flex items-center gap-2 text-xs font-mono text-brand-lime hover:underline font-bold"
              >
                <span>Launch Full 10-Track Workspace with 150 Unique Diagnostic Questions &rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum Breakdown Section */}
      <section id="curriculum" className="py-20 border-b border-[#1F1F23]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="max-w-3xl space-y-3">
            <span className="font-mono text-xs text-brand-lime uppercase tracking-widest font-bold">
              // COMPLETE CURRICULUM TAXONOMY
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              All 10 Official CFA Level 1 Tracks
            </h2>
            <p className="text-sm text-editorial-steely leading-relaxed">
              Every volume from the 2026/2027 curriculum is fully integrated with official Learning Modules, command-word Learning Outcome Statements (LOS), and authentic distractor autopsies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
            {CFA_CURRICULUM.map((topic) => (
              <div
                key={topic.id}
                className="p-5 rounded-xl bg-[#0B0B0E] border border-[#1F1F23] hover:border-brand-lime/40 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-brand-lime font-bold">TRACK [{topic.id}]</span>
                    <span className="px-2 py-0.5 rounded bg-[#141418] border border-[#27272A] text-editorial-dim">
                      WEIGHT: {topic.weight}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white font-sans">{topic.name}</h3>
                  <p className="text-[11px] text-editorial-dim font-sans leading-relaxed">
                    <strong className="text-editorial-steely">High-Yield Trap:</strong> {topic.highYieldTrapArea}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#18181B] flex items-center justify-between text-[11px]">
                  <span className="text-editorial-muted">{topic.subReadings.length} Learning Modules</span>
                  <Link
                    href="/app"
                    className="text-brand-lime hover:underline font-bold flex items-center gap-1"
                  >
                    <span>Inspect</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-20 bg-[#0B0B0E]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-lime/20 border border-brand-lime/40 flex items-center justify-center text-brand-lime mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Ready to build true trap immunity?
          </h2>

          <p className="text-sm sm:text-base text-editorial-steely max-w-xl mx-auto leading-relaxed">
            Access all 10 tracks, Texas Instruments BA II Plus keystrokes, 90-second exam pacers, and Leitner spaced repetition.
          </p>

          <div className="pt-2">
            <Link
              href="/app"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-brand-lime text-black font-mono text-sm font-extrabold hover:bg-brand-lime/90 shadow-lime-glow transition-all active:scale-95"
            >
              <span>LAUNCH DIAGNOSTIC COCKPIT</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1F1F23] bg-[#070709] py-8 text-center font-mono text-xs text-editorial-dim">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <div className="flex items-center justify-center gap-2 text-editorial-steely">
            <span className="w-2 h-2 rounded-full bg-brand-lime" />
            <span>CFA WIZARD &bull; INSTITUTIONAL LEVEL 1 DIAGNOSTIC ENGINE</span>
          </div>
          <p className="text-[11px] text-editorial-muted">
            CFA Institute does not endorse, promote, or warrant the accuracy or quality of products or services offered by CFA Wizard.
          </p>
        </div>
      </footer>

    </div>
  );
}

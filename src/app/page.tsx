"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Play,
  ChevronRight,
  BookOpen,
  Calculator,
  RotateCcw,
  Check,
} from "lucide-react";
import { CFA_CURRICULUM } from "@/data/curriculum";
import { KeystrokeSequence } from "@/components/calculator/KeystrokeBadge";
import { FormattedMathText } from "@/components/common/KaTeXRenderer";
import { sound } from "@/components/common/SoundEffects";

export default function LandingPage() {
  const heroContainerRef = useRef<HTMLDivElement>(null);
  const [activeTeaserAnswer, setActiveTeaserAnswer] = useState<string | null>(null);
  const [isTeaserSubmitted, setIsTeaserSubmitted] = useState<boolean>(false);

  // Scroll interpolation for 3-Phase Progress-Locked Hero
  const { scrollYProgress } = useScroll({
    target: heroContainerRef,
    offset: ["start start", "end end"],
  });

  // Phase 1 (0.00 - 0.28): The Foundation
  const opacity1 = useTransform(scrollYProgress, [0, 0.18, 0.28], [1, 1, 0]);
  const blur1 = useTransform(scrollYProgress, [0, 0.18, 0.28], [0, 0, 24]);
  const filter1 = useTransform(blur1, (b) => `blur(${b}px)`);
  const y1 = useTransform(scrollYProgress, [0, 0.28], [0, -40]);
  const scale1 = useTransform(scrollYProgress, [0, 0.28], [1, 0.95]);
  const display1 = useTransform(scrollYProgress, (v) => (v <= 0.30 ? "block" : "none"));

  // Phase 2 (0.30 - 0.68): The Mechanics
  const opacity2 = useTransform(scrollYProgress, [0.30, 0.38, 0.58, 0.68], [0, 1, 1, 0]);
  const blur2 = useTransform(scrollYProgress, [0.30, 0.38, 0.58, 0.68], [24, 0, 0, 24]);
  const filter2 = useTransform(blur2, (b) => `blur(${b}px)`);
  const y2 = useTransform(scrollYProgress, [0.30, 0.38, 0.58, 0.68], [40, 0, 0, -40]);
  const scale2 = useTransform(scrollYProgress, [0.30, 0.38, 0.58, 0.68], [0.95, 1, 1, 0.95]);
  const display2 = useTransform(scrollYProgress, (v) => (v > 0.28 && v < 0.70 ? "block" : "none"));

  // Phase 3 (0.70 - 1.00): Active Mastery
  const opacity3 = useTransform(scrollYProgress, [0.70, 0.78, 1.0], [0, 1, 1]);
  const blur3 = useTransform(scrollYProgress, [0.70, 0.78, 1.0], [24, 0, 0]);
  const filter3 = useTransform(blur3, (b) => `blur(${b}px)`);
  const y3 = useTransform(scrollYProgress, [0.70, 0.78, 1.0], [40, 0, 0]);
  const scale3 = useTransform(scrollYProgress, [0.70, 0.78, 1.0], [0.95, 1, 1]);
  const display3 = useTransform(scrollYProgress, (v) => (v >= 0.68 ? "block" : "none"));

  // Progress Bar Width
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const teaserQuestion = {
    stem: "An analyst calculates the estimated percentage price change for an institutional bond with Modified Duration = 7.40 and Annual Convexity = 68.0 following an instantaneous +150 bps (+1.50%) yield increase. The estimated percentage price change using both duration and convexity adjustment is closest to:",
    options: {
      A: "-11.100%",
      B: "-10.335%",
      C: "-9.570%",
    },
    correct: "B",
    explanation:
      "Using the second-order Taylor series approximation: Percentage Price Change ≈ -Modified Duration × Δy + 0.5 × Convexity × (Δy)². The first-order duration drop is -7.40 × 0.015 = -11.100%. The second-order convexity cushion is +0.5 × 68.0 × (0.015)² = +0.765%. Total estimated price change = -11.100% + 0.765% = -10.335%.",
    keystrokes: "[-] 7.40 [\\times] 0.015 [+] (0.5 [\\times] 68.0 [\\times] 0.015 [x^2]) [=] -10.335%",
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-white selection:bg-brand-lime selection:text-black font-sans">
      
      {/* 1. Minimalist Editorial Navigation */}
      <header className="fixed top-0 z-50 w-full bg-[#09090B]/85 backdrop-blur-xl border-b border-[#1F1F23]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-black tracking-widest text-white">
              CFA WIZARD
            </span>
            <span className="hidden sm:inline text-editorial-dim text-xs font-mono select-none">//</span>
            <span className="hidden sm:inline font-mono text-[11px] text-editorial-muted tracking-wider uppercase">
              INSTITUTIONAL LEARNING SUITE
            </span>
          </div>

          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-8 font-mono text-[11px] tracking-wider text-editorial-muted">
              <a href="#methodology" className="hover:text-white transition-colors">METHODOLOGY</a>
              <a href="#curriculum" className="hover:text-white transition-colors">10 TRACKS</a>
              <a href="#diagnostics" className="hover:text-white transition-colors">DIAGNOSTIC LAB</a>
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

      {/* 2. Progress-Locked Hero Scaffold (250vh scroll container) */}
      <section ref={heroContainerRef} className="relative h-[250vh] w-full">
        <div className="sticky top-0 h-screen w-full flex flex-col justify-between overflow-hidden px-6 pt-24 pb-12">
          
          {/* Ambient Financial Manifold Background */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_35%,rgba(216,255,62,0.05),transparent_70%)]" />
            <div className="absolute inset-0 bg-[#09090B]/50 backdrop-blur-[1px]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f2312_1px,transparent_1px),linear-gradient(to_bottom,#1f1f2312_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)]" />
          </div>

          {/* Top Label */}
          <div className="relative z-10 max-w-5xl mx-auto w-full text-center pt-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#121215]/90 border border-[#222226] font-mono text-[11px] text-brand-lime">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-lime" />
              <span>OFFICIAL 2026/2027 CURRICULUM ARCHITECTURE</span>
            </div>
          </div>

          {/* Center Stage: 3 Progress-Locked Narrative Acts */}
          <div className="relative z-10 max-w-4xl mx-auto w-full flex-1 flex items-center justify-center text-center">
            
            {/* Act 1: The Reality */}
            <motion.div
              style={{ opacity: opacity1, filter: filter1, y: y1, scale: scale1, display: display1 }}
              className="absolute inset-x-0 space-y-6 px-4 pointer-events-auto"
            >
              <div className="font-mono text-xs text-editorial-muted tracking-widest uppercase">
                01 // THE CURRICULUM FOUNDATION
              </div>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.06] drop-shadow-sm">
                Master CFA® Level 1{" "}
                <span className="text-brand-lime block sm:inline">from first principles.</span>
              </h1>
              <p className="text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto leading-relaxed">
                10 Official Tracks. 150 Learning Outcome Modules. Build profound financial intuition through structured, step-by-step conceptual deconstruction.
              </p>
            </motion.div>

            {/* Act 2: The Mechanism */}
            <motion.div
              style={{ opacity: opacity2, filter: filter2, y: y2, scale: scale2, display: display2 }}
              className="absolute inset-x-0 space-y-6 px-4 pointer-events-none"
            >
              <div className="font-mono text-xs text-brand-lime tracking-widest uppercase font-bold">
                02 // DEEP CONCEPTUAL MECHANICS
              </div>
              <h2 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.06] drop-shadow-sm">
                Understand the exact mechanics{" "}
                <span className="text-brand-lime block sm:inline">behind every formula.</span>
              </h2>
              <p className="text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto leading-relaxed">
                No surface memorization. Dissect how duration approximations, currency cross-rates, and multi-stage DCF models actually function under real market conditions.
              </p>
            </motion.div>

            {/* Act 3: Active Mastery */}
            <motion.div
              style={{ opacity: opacity3, filter: filter3, y: y3, scale: scale3, display: display3 }}
              className="absolute inset-x-0 space-y-6 px-4"
            >
              <div className="font-mono text-xs text-brand-lime tracking-widest uppercase font-bold">
                03 // TACTILE EXECUTION &amp; RETENTION
              </div>
              <h2 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.06] drop-shadow-sm">
                Active learning through{" "}
                <span className="text-brand-lime block sm:inline">BA II+ workflows &amp; spaced recall.</span>
              </h2>
              <p className="text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto leading-relaxed">
                Seamless Texas Instruments keystroke pipelines, 90-second exam pacers, and adaptive Leitner intervals designed for permanent mastery.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-4 font-mono text-xs">
                <Link
                  href="/app"
                  className="px-6 py-3.5 rounded-xl bg-brand-lime text-black font-extrabold hover:bg-brand-lime/90 shadow-lime-glow transition-all flex items-center gap-2 text-sm active:scale-95"
                >
                  <span>ENTER STUDY COCKPIT</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#diagnostics"
                  className="px-5 py-3.5 rounded-xl bg-[#141418] hover:bg-[#1C1C22] text-zinc-300 border border-[#27272A] font-bold transition-all flex items-center gap-2"
                >
                  <span>TRY SAMPLE DRILL</span>
                  <Play className="w-3.5 h-3.5 fill-current" />
                </a>
              </div>
            </motion.div>

          </div>

          {/* Bottom Progress Tracker Indicator */}
          <div className="relative z-10 max-w-md mx-auto w-full space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-editorial-dim">
              <span>EXPLORE METHODOLOGY</span>
              <span>SCROLL DOWN</span>
            </div>
            <div className="w-full h-1 bg-[#18181B] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-brand-lime rounded-full"
                style={{ width: progressWidth }}
              />
            </div>
          </div>

        </div>
      </section>

      {/* 3. Three-Pillar Learning Showcase */}
      <section id="methodology" className="py-24 border-t border-b border-[#1F1F23] bg-[#0B0B0E]">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          
          <div className="max-w-3xl space-y-3">
            <span className="font-mono text-xs text-brand-lime uppercase tracking-widest font-bold">
              // CORE LEARNING PILLARS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Engineered for Deep Mathematical & Conceptual Mastery
            </h2>
            <p className="text-sm sm:text-base text-editorial-steely leading-relaxed">
              Every tool inside CFA Wizard is calibrated to transition candidates from passive reading to active, permanent comprehension.
            </p>
          </div>

          {/* Roman Numeral Editorial Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
            
            {/* Pillar I */}
            <div className="p-8 rounded-2xl bg-[#0E0E12] border border-[#1F1F23] hover:border-brand-lime/30 transition-all flex flex-col justify-between space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-brand-lime font-bold text-xs pb-3 border-b border-[#18181B]">
                  <span>PILLAR I</span>
                  <span className="text-editorial-dim font-normal">CONCEPT RESOLUTION</span>
                </div>
                <h3 className="text-lg font-bold text-white font-sans">
                  Step-by-Step Diagnostic Engine
                </h3>
                <p className="text-xs text-editorial-steely font-sans leading-relaxed">
                  Deconstruct complex learning modules into granular logical steps. Understand why formulas behave under non-linear conditions and build first-principles intuition before taking mock exams.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#141418] border border-[#222226] space-y-2 text-[11px]">
                <div className="text-white font-bold font-sans">Diagnostic Focus Areas:</div>
                <div className="text-editorial-steely space-y-1.5 font-sans">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-lime" />
                    <span>Taylor Series Convexity Cushions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-lime" />
                    <span>Cross-Rate Triangular Arbitrage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-lime" />
                    <span>IFRS vs US GAAP Lease Transitions</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pillar II */}
            <div className="p-8 rounded-2xl bg-[#0E0E12] border border-[#1F1F23] hover:border-brand-lime/30 transition-all flex flex-col justify-between space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-brand-lime font-bold text-xs pb-3 border-b border-[#18181B]">
                  <span>PILLAR II</span>
                  <span className="text-editorial-dim font-normal">HARDWARE FLUENCY</span>
                </div>
                <h3 className="text-lg font-bold text-white font-sans">
                  Tactile BA II Plus Workflows
                </h3>
                <p className="text-xs text-editorial-steely font-sans leading-relaxed">
                  Bridge theory and calculation with verified Texas Instruments BA II Plus keystroke sequences. Master TVM registers, bond amortizations, and cash flow IRRs without calculator friction.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#141418] border border-[#222226] space-y-2.5 text-[11px]">
                <div className="text-white font-bold font-sans">Verified Keystroke Pipeline:</div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-1 rounded bg-[#1F1F23] text-brand-lime font-bold border border-[#2A2A30]">[2nd]</span>
                  <span className="px-2 py-1 rounded bg-[#1F1F23] text-white font-bold border border-[#2A2A30]">[CLR TVM]</span>
                  <span className="px-2 py-1 rounded bg-[#1F1F23] text-white font-bold border border-[#2A2A30]">[N=10]</span>
                  <span className="px-2 py-1 rounded bg-[#1F1F23] text-white font-bold border border-[#2A2A30]">[I/Y=6]</span>
                  <span className="px-2 py-1 rounded bg-[#1F1F23] text-brand-lime font-bold border border-[#2A2A30]">[CPT] [PV]</span>
                </div>
              </div>
            </div>

            {/* Pillar III */}
            <div className="p-8 rounded-2xl bg-[#0E0E12] border border-[#1F1F23] hover:border-brand-lime/30 transition-all flex flex-col justify-between space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-brand-lime font-bold text-xs pb-3 border-b border-[#18181B]">
                  <span>PILLAR III</span>
                  <span className="text-editorial-dim font-normal">PERMANENT RECALL</span>
                </div>
                <h3 className="text-lg font-bold text-white font-sans">
                  Adaptive Spaced Repetition
                </h3>
                <p className="text-xs text-editorial-steely font-sans leading-relaxed">
                  Solidify formulas and LOS concepts using scientifically scheduled Leitner recall decks. Automatically reschedule difficult quantitative topics right before memory decay sets in.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#141418] border border-[#222226] space-y-2 text-[11px]">
                <div className="flex items-center justify-between text-white font-bold font-sans">
                  <span>Memory Retention Schedule:</span>
                  <span className="text-brand-lime">94% Target</span>
                </div>
                <div className="flex items-center justify-between text-editorial-dim pt-1 border-t border-[#1F1F23]">
                  <span>Day 1</span>
                  <span>&rarr;</span>
                  <span>Day 3</span>
                  <span>&rarr;</span>
                  <span>Day 7</span>
                  <span>&rarr;</span>
                  <span>Day 14</span>
                  <span>&rarr;</span>
                  <span className="text-brand-lime font-bold">Day 30</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 4. Live Interactive Learning & Diagnostic Lab */}
      <section id="diagnostics" className="py-24 border-b border-[#1F1F23] bg-[#09090B]">
        <div className="max-w-5xl mx-auto px-6 space-y-10">
          
          <div className="text-center space-y-3">
            <span className="font-mono text-xs text-brand-lime uppercase tracking-widest font-bold">
              // INTERACTIVE FORMULA LAB
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Experience the Diagnostic Learning Engine
            </h2>
            <p className="text-sm text-editorial-steely max-w-xl mx-auto">
              Test your understanding of this Fixed Income convexity scenario. Select an answer to reveal the step-by-step mathematical derivation.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-[#0E0E12] border border-[#27272A] space-y-6 shadow-2xl">
            
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="px-2.5 py-1 rounded bg-brand-lime/10 border border-brand-lime/30 text-brand-lime font-bold">
                FIXED INCOME // LOS 30.e
              </span>
              <span className="text-editorial-dim font-mono">CALCULATION DERIVATION</span>
            </div>

            <div className="text-sm sm:text-base text-zinc-100 leading-relaxed font-sans font-medium">
              <FormattedMathText text={teaserQuestion.stem} />
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
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
                    className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between gap-3 ${
                      isSelected
                        ? isCorrectKey
                          ? "bg-brand-lime/10 border-brand-lime text-white"
                          : "bg-red-500/10 border-red-500/40 text-red-200"
                        : isTeaserSubmitted && isCorrectKey
                        ? "bg-brand-lime/5 border-brand-lime/40 text-brand-lime"
                        : "bg-[#121215] border-[#222226] text-zinc-300 hover:border-[#3F3F46]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs ${
                          isSelected && isCorrectKey
                            ? "bg-brand-lime text-black"
                            : isSelected
                            ? "bg-red-500 text-white"
                            : "bg-[#1C1C22] text-zinc-400"
                        }`}
                      >
                        {opt}
                      </span>
                      {isSelected && isCorrectKey && (
                        <Check className="w-4 h-4 text-brand-lime" />
                      )}
                    </div>
                    <span className="text-sm font-bold">{teaserQuestion.options[opt]}</span>
                  </button>
                );
              })}
            </div>

            {/* Revealed Step-by-Step Breakdown */}
            {isTeaserSubmitted && (
              <div className="p-6 rounded-xl bg-[#141418] border border-brand-lime/40 space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-brand-lime font-bold">
                    STEP-BY-STEP DERIVATION &amp; ANALYSIS
                  </span>
                  <span className="text-editorial-dim">
                    {activeTeaserAnswer === "B" ? "Answer: Correct" : "Review Derivation Below"}
                  </span>
                </div>
                
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
                  {teaserQuestion.explanation}
                </p>

                <div className="pt-3 border-t border-[#222226]">
                  <span className="text-[11px] font-mono text-editorial-dim block mb-1.5">
                    TEXAS INSTRUMENTS BA II PLUS KEYSTROKE SEQUENCE:
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
                <span>Launch Full 10-Track Learning Workspace with 150 In-Depth Modules &rarr;</span>
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* 5. Official 10-Track Curriculum Index Table */}
      <section id="curriculum" className="py-24 border-b border-[#1F1F23] bg-[#0B0B0E]">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          
          <div className="max-w-3xl space-y-3">
            <span className="font-mono text-xs text-brand-lime uppercase tracking-widest font-bold">
              // COMPLETE CURRICULUM SYLLABUS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              All 10 Official CFA Level 1 Tracks
            </h2>
            <p className="text-sm text-editorial-steely leading-relaxed">
              Every volume from the 2026/2027 curriculum is fully integrated with official Learning Modules, command-word Learning Outcome Statements (LOS), and step-by-step calculation guides.
            </p>
          </div>

          {/* High-Density Editorial Table */}
          <div className="overflow-x-auto rounded-2xl border border-[#1F1F23] bg-[#0E0E12]">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#141418] border-b border-[#1F1F23] text-editorial-dim text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-5 font-bold text-white whitespace-nowrap">Track</th>
                  <th className="py-4 px-5 font-bold text-white whitespace-nowrap">Curriculum Volume</th>
                  <th className="py-4 px-5 whitespace-nowrap">Modules</th>
                  <th className="py-4 px-5 whitespace-nowrap">Exam Weight</th>
                  <th className="py-4 px-5 min-w-[320px]">Core Focus Area</th>
                  <th className="py-4 px-5 text-right whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#18181B]">
                {CFA_CURRICULUM.map((topic, idx) => {
                  const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
                  return (
                    <tr key={topic.id} className="hover:bg-[#141418]/60 transition-colors">
                      <td className="py-4 px-5 text-brand-lime font-bold whitespace-nowrap">
                        {romanNumerals[idx] || topic.id}
                      </td>
                      <td className="py-4 px-5 font-sans font-bold text-white text-sm whitespace-nowrap">
                        {topic.name}
                      </td>
                      <td className="py-4 px-5 text-editorial-steely whitespace-nowrap">
                        {topic.subReadings.length} Modules
                      </td>
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded bg-[#141418] border border-[#27272A] text-zinc-200 font-mono text-xs font-bold whitespace-nowrap leading-none">
                          {topic.weight}
                        </span>
                      </td>
                      <td className="py-4 px-5 font-sans text-editorial-dim text-xs leading-relaxed">
                        {topic.highYieldTrapArea}
                      </td>
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <Link
                          href="/app"
                          className="inline-flex items-center gap-1 text-brand-lime hover:underline font-bold"
                        >
                          <span>Study</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      </section>

      {/* 6. Call to Action Banner */}
      <section className="py-24 bg-[#09090B]">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-lime/15 border border-brand-lime/30 flex items-center justify-center text-brand-lime mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Ready to master the curriculum from first principles?
          </h2>

          <p className="text-sm sm:text-base text-editorial-steely max-w-xl mx-auto leading-relaxed">
            Gain immediate access to all 10 tracks, Texas Instruments BA II Plus keystrokes, 90-second pacing drills, and Leitner spaced repetition.
          </p>

          <div className="pt-2">
            <Link
              href="/app"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-brand-lime text-black font-mono text-sm font-extrabold hover:bg-brand-lime/90 shadow-lime-glow transition-all active:scale-95"
            >
              <span>LAUNCH LEARNING COCKPIT</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Institutional Footer */}
      <footer className="border-t border-[#1F1F23] bg-[#070709] py-8 text-center font-mono text-xs text-editorial-dim">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <div className="flex items-center justify-center gap-2 text-editorial-steely">
            <span className="w-2 h-2 rounded-full bg-brand-lime" />
            <span>CFA WIZARD &bull; INSTITUTIONAL LEVEL 1 LEARNING PLATFORM</span>
          </div>
          <p className="text-[11px] text-editorial-muted">
            CFA Institute does not endorse, promote, or warrant the accuracy or quality of products or services offered by CFA Wizard.
          </p>
        </div>
      </footer>

    </div>
  );
}

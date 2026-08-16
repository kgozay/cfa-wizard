"use client";

import React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/dashboard/HeroSection";
import { VerticalNodeTracker } from "@/components/dashboard/VerticalNodeTracker";
import { CurriculumIndexTable } from "@/components/dashboard/CurriculumIndexTable";
import { VignetteEngine } from "@/components/vignette/VignetteEngine";
import { ExecutiveBriefingModal } from "@/components/briefing/ExecutiveBriefingModal";
import { VirtualTIBAIIPLUS } from "@/components/calculator/VirtualTIBAIIPLUS";
import { TrapLogModal } from "@/components/tools/TrapLogModal";
import { FormulaSheetModal } from "@/components/tools/FormulaSheetModal";
import { AIVignetteGeneratorModal } from "@/components/tools/AIVignetteGeneratorModal";
import { useCFAStore } from "@/store/useCFAStore";

export default function Home() {
  const { activeVignetteId } = useCFAStore();

  return (
    <main className="min-h-screen flex flex-col bg-[#09090B] text-white">
      {/* Top Header */}
      <Header />

      {/* Main Content Area */}
      <div className="flex-1">
        {activeVignetteId ? (
          /* Active Vignette Problem & Diagnostic Autopsy Session */
          <VignetteEngine />
        ) : (
          /* Curriculum Dashboard */
          <>
            <HeroSection />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Column: Stacked Wireframe Circular Ring Tracker (4 cols) */}
                <div className="lg:col-span-4 sticky top-20">
                  <VerticalNodeTracker />
                </div>

                {/* Right Column: Edge-to-Edge Minimalist Curriculum Index (8 cols) */}
                <div className="lg:col-span-8 space-y-6">
                  <div className="flex items-center justify-between font-mono text-xs text-editorial-dim">
                    <span className="tracking-wider uppercase">
                      OFFICIAL 10 CFA LEVEL 1 CURRICULUM TRACKS
                    </span>
                    <span className="hidden sm:inline text-editorial-muted">
                      CLICK TRACK ROW TO REVEAL TRAP MECHANISMS
                    </span>
                  </div>

                  <CurriculumIndexTable />
                </div>

              </div>
            </div>
          </>
        )}
      </div>

      {/* Global Tool Modals */}
      <ExecutiveBriefingModal />
      <VirtualTIBAIIPLUS />
      <TrapLogModal />
      <FormulaSheetModal />
      <AIVignetteGeneratorModal />

      {/* Brutalist Terminal Footer */}
      <Footer />
    </main>
  );
}

"use client";

import React, { useState } from "react";
import { X, Layers, Check, RefreshCw, ChevronRight, Eye, ShieldAlert, Sparkles, Trash2, Cpu } from "lucide-react";
import { useCFAStore } from "@/store/useCFAStore";
import { LeitnerCard } from "@/types/cfa";
import { ERROR_MODE_LABELS } from "@/data/trapTaxonomy";
import { FormattedMathText } from "@/components/common/KaTeXRenderer";
import { sound } from "@/components/common/SoundEffects";

export const LeitnerTrapDeckModal: React.FC = () => {
  const {
    isLeitnerDeckOpen,
    setLeitnerDeckOpen,
    leitnerCards,
    updateLeitnerCard,
    deleteLeitnerCard,
    soundEnabled,
  } = useCFAStore();

  const [activeBox, setActiveBox] = useState<1 | 2 | 3>(1);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState<boolean>(false);

  const filteredCards = leitnerCards.filter((c) => c.box === activeBox);
  const safeIndex = filteredCards.length > 0 ? Math.min(currentCardIndex, filteredCards.length - 1) : 0;
  const currentCard: LeitnerCard | undefined = filteredCards[safeIndex];

  if (!isLeitnerDeckOpen) return null;

  const handleNext = (isCorrect: boolean) => {
    if (!currentCard) return;
    if (soundEnabled) {
      if (isCorrect) sound.playSuccessChime();
      else sound.playWarningBuzz();
    }

    const cardWillLeaveBox = (isCorrect && activeBox < 3) || (!isCorrect && activeBox > 1);

    updateLeitnerCard(currentCard.id, isCorrect);
    setIsAnswerRevealed(false);

    if (cardWillLeaveBox) {
      // The current card left this box view.
      // If we were at the end of the list, wrap back to 0.
      if (safeIndex >= filteredCards.length - 1) {
        setCurrentCardIndex(0);
      }
    } else {
      // Card stays in the same box. Advance to next card in deck.
      if (filteredCards.length > 1) {
        setCurrentCardIndex((safeIndex + 1) % filteredCards.length);
      } else {
        setCurrentCardIndex(0);
      }
    }
  };

  const handleDeleteCurrent = () => {
    if (!currentCard) return;
    deleteLeitnerCard(currentCard.id);
    setIsAnswerRevealed(false);
    if (safeIndex >= filteredCards.length - 1) {
      setCurrentCardIndex(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div className="bg-[#0B0B0E] border border-[#27272A] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#1F1F23] bg-[#0E0E12] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-lime/20 border border-brand-lime/40 flex items-center justify-center text-brand-lime">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-mono font-bold text-white tracking-wide uppercase">
                SPACED REPETITION TRAP VAULT (LEITNER SYSTEM)
              </h2>
              <p className="text-[11px] font-mono text-editorial-dim">
                Daily (Box 1) &bull; 3-Day (Box 2) &bull; 7-Day (Box 3) Mastery Progression
              </p>
            </div>
          </div>

          <button
            onClick={() => setLeitnerDeckOpen(false)}
            className="p-1.5 rounded-lg bg-[#141418] text-editorial-dim hover:text-white border border-[#27272A]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Box Selector Tabs */}
        <div className="grid grid-cols-3 border-b border-[#1F1F23] bg-[#0E0E12] font-mono text-xs">
          {([1, 2, 3] as const).map((boxNum) => {
            const count = leitnerCards.filter((c) => c.box === boxNum).length;
            const isSelected = activeBox === boxNum;
            return (
              <button
                key={boxNum}
                onClick={() => {
                  setActiveBox(boxNum);
                  setCurrentCardIndex(0);
                  setIsAnswerRevealed(false);
                }}
                className={`py-3 px-4 text-center border-b-2 transition-all flex items-center justify-center gap-2 ${
                  isSelected
                    ? "border-brand-lime text-brand-lime bg-brand-lime/5 font-bold"
                    : "border-transparent text-editorial-dim hover:text-white"
                }`}
              >
                <span>BOX {boxNum}</span>
                <span className="px-1.5 py-0.5 rounded-full bg-[#18181C] text-[10px] text-white">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Flashcard Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {filteredCards.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <ShieldAlert className="w-10 h-10 text-editorial-dim mx-auto" />
              <div className="font-mono text-sm font-bold text-white">
                NO TRAPS IN BOX {activeBox}
              </div>
              <p className="text-xs text-editorial-dim max-w-sm mx-auto">
                Missed questions and distractor traps from drills will automatically populate into Box 1 for spaced reinforcement.
              </p>
            </div>
          ) : currentCard ? (
            <div className="space-y-4">
              {/* Card Meta */}
              <div className="flex items-center justify-between font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-brand-lime/10 border border-brand-lime/30 text-brand-lime font-bold">
                    TOPIC {currentCard.topicId}: {currentCard.topicName}
                  </span>
                  <span className="text-editorial-dim">
                    Card {safeIndex + 1} of {filteredCards.length}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {currentCard.errorMode && (
                    <span
                      className={`px-2 py-0.5 rounded border text-[10px] ${
                        ERROR_MODE_LABELS[currentCard.errorMode]?.badgeColor || "text-editorial-dim"
                      }`}
                    >
                      {ERROR_MODE_LABELS[currentCard.errorMode]?.label || currentCard.errorMode}
                    </span>
                  )}
                  <button
                    onClick={handleDeleteCurrent}
                    className="p-1 rounded text-editorial-dim hover:text-red-400 hover:bg-red-950/30 transition-colors"
                    title="Remove from Spaced Deck"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Question Stem */}
              <div className="p-4 sm:p-5 rounded-xl bg-[#0E0E12] border border-[#1F1F23] text-sm text-zinc-100 leading-relaxed font-sans shadow-inner">
                <FormattedMathText text={currentCard.questionStem} />
              </div>

              {/* Multiple Choice Options preview if available */}
              {currentCard.options && (
                <div className="grid grid-cols-1 gap-2 font-mono text-xs">
                  {(["A", "B", "C"] as const).map((key) => {
                    const optText = currentCard.options?.[key];
                    if (!optText) return null;
                    const isKeyCorrect = isAnswerRevealed && key === currentCard.correctOption;
                    return (
                      <div
                        key={key}
                        className={`p-2.5 rounded-lg border transition-all flex items-start gap-2.5 ${
                          isKeyCorrect
                            ? "bg-brand-lime/10 border-brand-lime text-brand-lime font-bold"
                            : "bg-[#121215] border-[#1F1F23] text-zinc-300"
                        }`}
                      >
                        <span className="w-5 h-5 rounded flex items-center justify-center bg-black/40 text-[11px] shrink-0 font-bold">
                          {key}
                        </span>
                        <div className="leading-normal pt-0.5">
                          <FormattedMathText text={optText} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Revealable Solution / Distractor Autopsy */}
              {isAnswerRevealed ? (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <div className="p-4 rounded-xl bg-brand-lime/5 border border-brand-lime/40 space-y-2">
                    <div className="flex items-center gap-2 font-mono text-xs text-brand-lime font-bold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>CORRECT KEY: [{currentCard.correctOption}] &bull; CANONICAL SOLUTION</span>
                    </div>
                    <div className="text-xs text-zinc-200 leading-relaxed font-sans">
                      <FormattedMathText text={currentCard.solution} />
                    </div>
                  </div>

                  {currentCard.keystrokes && (
                    <div className="p-3 rounded-lg bg-[#121215] border border-[#27272A] flex items-center gap-2 text-xs font-mono text-amber-300/90">
                      <Cpu className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="truncate">TI BA II+: {currentCard.keystrokes}</span>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setIsAnswerRevealed(true)}
                  className="w-full py-3.5 rounded-xl border border-[#27272A] bg-[#121215] hover:bg-[#18181C] text-editorial-muted hover:text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <Eye className="w-4 h-4" />
                  <span>REVEAL CANONICAL SOLUTION & TRAP AUTOPSY</span>
                </button>
              )}
            </div>
          ) : null}
        </div>

        {/* Card Footer Controls */}
        {filteredCards.length > 0 && isAnswerRevealed && (
          <div className="p-4 border-t border-[#1F1F23] bg-[#0E0E12] flex items-center justify-between font-mono text-xs gap-3">
            <button
              onClick={() => handleNext(false)}
              className="flex-1 py-2.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30 font-bold transition-all"
            >
              MISSED (DEMOTE TO BOX 1)
            </button>
            <button
              onClick={() => handleNext(true)}
              className="flex-1 py-2.5 rounded-lg bg-brand-lime text-black font-extrabold hover:bg-brand-lime/90 shadow-lime-sm transition-all"
            >
              MASTERED (PROMOTE TO BOX {Math.min(3, activeBox + 1)})
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

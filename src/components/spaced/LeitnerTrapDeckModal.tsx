"use client";

import React, { useMemo, useState } from "react";
import { X, Layers, Trash2, Calculator, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { useCFAStore } from "@/store/useCFAStore";
import { LeitnerCard, OptionKey } from "@/types/cfa";
import { isDue, isRetired, LEITNER_BOX_LABELS, LEITNER_BOXES, LeitnerBox } from "@/lib/practice/leitner";
import { presentReviewCard } from "@/lib/practice/variants";
import { ERROR_MODE_LABELS } from "@/data/trapTaxonomy";
import { FormattedMathText } from "@/components/common/KaTeXRenderer";
import { sound } from "@/components/common/SoundEffects";
import { useAccessibleDialog } from "@/hooks/useAccessibleDialog";

type DeckView = "due" | LeitnerBox;

export const LeitnerTrapDeckModal: React.FC = () => {
  const {
    isLeitnerDeckOpen,
    setLeitnerDeckOpen,
    leitnerCards,
    updateLeitnerCard,
    deleteLeitnerCard,
    soundEnabled,
  } = useCFAStore();

  const [view, setView] = useState<DeckView>("due");
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [chosenOption, setChosenOption] = useState<OptionKey | null>(null);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const dialogRef = useAccessibleDialog<HTMLDivElement>(isLeitnerDeckOpen, () => setLeitnerDeckOpen(false));

  // Re-evaluated whenever the deck changes, so rated cards drop out of "Due now"
  const now = useMemo(() => Date.now(), [leitnerCards]); // eslint-disable-line react-hooks/exhaustive-deps
  const dueCards = useMemo(
    () => leitnerCards.filter((card) => isDue(card, now)).sort((a, b) => a.box - b.box),
    [leitnerCards, now]
  );
  const activeCards = useMemo(() => leitnerCards.filter((card) => !isRetired(card)), [leitnerCards]);
  const retiredCount = leitnerCards.length - activeCards.length;
  const viewCards = view === "due" ? dueCards : activeCards.filter((card) => card.box === view);
  const safeIndex = viewCards.length > 0 ? Math.min(currentCardIndex, viewCards.length - 1) : 0;
  const currentCard: LeitnerCard | undefined = viewCards[safeIndex];
  // Each review shows new numbers (or at least a new option order), keyed by the
  // review count so the question stays stable while the card is on screen
  const presented = useMemo(
    () => (currentCard ? presentReviewCard(currentCard, `review-${currentCard.reviewCount}`) : null),
    [currentCard]
  );

  if (!isLeitnerDeckOpen) return null;

  const resetCardState = () => {
    setChosenOption(null);
    setIsRevealed(false);
  };

  const switchView = (next: DeckView) => {
    setView(next);
    setCurrentCardIndex(0);
    resetCardState();
  };

  const handleChoose = (option: OptionKey) => {
    if (isRevealed) return;
    setChosenOption(option);
    setIsRevealed(true);
    if (soundEnabled) {
      if (presented && option === presented.correctOption) sound.playSuccessChime();
      else sound.playWarningBuzz();
    }
  };

  const handleNext = () => {
    if (!currentCard || !presented) return;
    const isCorrect = chosenOption === presented.correctOption;
    // A rated card is scheduled into the future, so it leaves "Due now"; in a box
    // view a correct card moves up (or retires) and a missed one returns to Box 1.
    const leavesView = view === "due" || isCorrect || currentCard.box > 1;
    updateLeitnerCard(currentCard.id, isCorrect);
    resetCardState();
    if (leavesView) {
      if (safeIndex >= viewCards.length - 1) setCurrentCardIndex(0);
    } else {
      setCurrentCardIndex(viewCards.length > 1 ? (safeIndex + 1) % viewCards.length : 0);
    }
  };

  const handleDeleteCurrent = () => {
    if (!currentCard) return;
    deleteLeitnerCard(currentCard.id);
    resetCardState();
    if (safeIndex >= viewCards.length - 1) setCurrentCardIndex(0);
  };

  const tabs: Array<{ id: DeckView; label: string; count: number }> = [
    { id: "due", label: "Due now", count: dueCards.length },
    ...LEITNER_BOXES.map((box) => ({
      id: box,
      label: `Box ${box}`,
      count: activeCards.filter((card) => card.box === box).length,
    })),
  ];

  const answeredCorrectly = isRevealed && chosenOption === presented?.correctOption;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="leitner-modal-title"
        className="liquid-glass-card flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl shadow-2xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-divider p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <h2 id="leitner-modal-title" className="text-base font-semibold text-foreground">
                Review deck
              </h2>
              <p className="text-xs text-muted">
                Missed questions come back with new numbers: daily until you get them right, then after 3, 7, 14 and 30 days. A card retires after a correct answer in Box 5.
              </p>
            </div>
          </div>
          <button
            onClick={() => setLeitnerDeckOpen(false)}
            aria-label="Close review deck"
            className="glass-pill-btn flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div role="tablist" aria-label="Review deck views" className="grid grid-cols-3 border-b border-divider text-xs sm:grid-cols-6 sm:text-sm">
          {tabs.map((tab) => {
            const isSelected = view === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isSelected}
                onClick={() => switchView(tab.id)}
                className={`flex min-h-11 items-center justify-center gap-1.5 border-b-2 px-2 transition-colors ${
                  isSelected ? "border-accent font-semibold text-foreground" : "border-transparent text-muted hover:text-foreground"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[11px] tabular-nums ${
                    tab.id === "due" && tab.count > 0 ? "bg-warning/20 text-warning" : "bg-surface-raised text-muted-strong"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
          {!currentCard ? (
            <div className="space-y-2 py-12 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-muted" />
              <p className="text-sm font-semibold text-foreground">
                {view === "due"
                  ? leitnerCards.length > 0
                    ? "You're up to date"
                    : retiredCount > 0
                      ? "Every card is retired"
                      : "No review cards yet"
                  : `Box ${view} is empty`}
              </p>
              <p className="mx-auto max-w-sm text-xs text-muted">
                {view === "due" && leitnerCards.length > 0
                  ? "Nothing is due right now. Cards come back automatically when they are due."
                  : "Questions you miss in practice sets, sprints and mock exams are added here automatically."}
                {retiredCount > 0 && ` ${retiredCount} card${retiredCount === 1 ? " has" : "s have"} been retired after a correct monthly review.`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-accent/10 px-2 py-0.5 font-medium text-accent">{currentCard.topicName}</span>
                  <span className="text-muted">
                    Card {safeIndex + 1} of {viewCards.length} · Box {currentCard.box} ({LEITNER_BOX_LABELS[currentCard.box]})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {currentCard.errorMode && currentCard.errorMode !== "UNSPECIFIED" && (
                    <span className="rounded-lg bg-surface-raised px-2 py-0.5 text-muted-strong">
                      {ERROR_MODE_LABELS[currentCard.errorMode]?.label || currentCard.errorMode}
                    </span>
                  )}
                  <button
                    onClick={handleDeleteCurrent}
                    aria-label="Remove this card from the deck"
                    title="Remove this card from the deck"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="surface-panel rounded-xl p-4 text-sm leading-relaxed text-foreground sm:p-5">
                <FormattedMathText text={presented?.stem ?? currentCard.questionStem} />
              </div>

              <div className="grid grid-cols-1 gap-2" role="radiogroup" aria-label="Answer options">
                {(["A", "B", "C"] as const).map((key) => {
                  const isCorrectKey = isRevealed && key === presented?.correctOption;
                  const isWrongChoice = isRevealed && key === chosenOption && key !== presented?.correctOption;
                  return (
                    <button
                      key={key}
                      role="radio"
                      aria-checked={chosenOption === key}
                      disabled={isRevealed}
                      onClick={() => handleChoose(key)}
                      className={`flex min-h-[44px] items-start gap-3 rounded-xl border p-3 text-left text-sm transition-colors ${
                        isCorrectKey
                          ? "border-accent bg-accent/10 text-foreground"
                          : isWrongChoice
                            ? "border-danger/60 bg-danger/10 text-foreground"
                            : "border-control bg-surface-interactive text-muted-strong enabled:hover:bg-surface-raised"
                      }`}
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-surface-raised text-xs font-bold">
                        {key}
                      </span>
                      <span className="pt-0.5 leading-normal">
                        <FormattedMathText text={presented?.options[key] ?? currentCard.options[key]} />
                      </span>
                    </button>
                  );
                })}
              </div>

              {isRevealed ? (
                <div className="space-y-3">
                  <div
                    role="status"
                    className={`flex items-center gap-2 text-sm font-semibold ${answeredCorrectly ? "text-accent" : "text-danger"}`}
                  >
                    {answeredCorrectly ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    {answeredCorrectly
                      ? currentCard.box === 5
                        ? "Correct. This card is retired from the deck."
                        : `Correct. This card moves to Box ${currentCard.box + 1}.`
                      : chosenOption
                        ? `Not quite: the answer is ${presented?.correctOption}. This card goes back to Box 1.`
                        : `The answer is ${presented?.correctOption}. This card goes back to Box 1.`}
                  </div>
                  {chosenOption && !answeredCorrectly && presented && (
                    <div className="space-y-1.5 rounded-xl bg-danger/5 p-4">
                      <p className="text-xs font-semibold text-muted-strong">Why {chosenOption} is wrong</p>
                      <div className="text-sm leading-relaxed text-foreground">
                        <FormattedMathText text={presented.distractorFeedback[chosenOption]} />
                      </div>
                    </div>
                  )}
                  <div className="space-y-1.5 rounded-xl bg-surface-interactive p-4">
                    <p className="text-xs font-semibold text-muted-strong">Solution</p>
                    <div className="text-sm leading-relaxed text-foreground">
                      <FormattedMathText text={presented?.solution ?? currentCard.solution} />
                    </div>
                  </div>
                  {(presented?.calculatorKeystrokes ?? currentCard.keystrokes) && (
                    <div className="flex items-start gap-2 rounded-xl bg-surface-interactive p-3 text-xs text-muted-strong">
                      <Calculator className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                      <span className="font-mono leading-relaxed">{presented?.calculatorKeystrokes ?? currentCard.keystrokes}</span>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setIsRevealed(true)}
                  className="w-full text-center text-xs text-muted underline-offset-4 hover:text-foreground hover:underline"
                >
                  I don&apos;t know, show me the answer
                </button>
              )}
            </div>
          )}
        </div>

        {currentCard && isRevealed && (
          <div className="flex justify-end border-t border-divider p-4">
            <button autoFocus onClick={handleNext} className="lime-btn-primary flex min-h-11 items-center gap-2 rounded-xl px-5 text-sm">
              Next card
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

"use client";

import React, { useState } from "react";
import {
  Play,
  BookOpen,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { CFA_CURRICULUM } from "@/data/curriculum";
import { CFA_VIGNETTES } from "@/data/vignettes";
import { useCFAStore } from "@/store/useCFAStore";
import { sound } from "@/components/common/SoundEffects";
import { getTopicPresentation } from "./topicPresentation";

interface CurriculumTracksGridProps {
  onOpenBriefing: (topicId: string) => void;
  onOpenScenarioSimulator: (topicId: string) => void;
}

export const CurriculumTracksGrid: React.FC<CurriculumTracksGridProps> = ({
  onOpenBriefing,
  onOpenScenarioSimulator,
}) => {
  const {
    completedTopicIds,
    activeTopicId,
    inProgressTopicId,
    selectTopic,
    startVignetteDrill,
    drillQuestionCount,
    practiceAttempts,
    soundEnabled,
  } = useCFAStore();

  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);

  const toggleExpand = (topicId: string) => {
    if (soundEnabled) sound.playKeyClick();
    setExpandedTopicId((prev) => (prev === topicId ? null : topicId));
  };

  const handleStartDrill = (topicId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (soundEnabled) sound.playNodeSwitch();
    selectTopic(topicId);
    const baseVignette = CFA_VIGNETTES.find((v) => v.topicId === topicId);
    startVignetteDrill(baseVignette?.id || topicId);
  };

  return (
    <section className="space-y-4">
      {/* Header & syllabus completion counter */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Curriculum index
          </h2>
          <p className="mt-1 text-sm text-muted">
            All 10 Level I topics organized by official syllabus sequence and exam weights.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 self-start rounded-lg bg-surface-interactive px-3 py-1.5 text-xs text-muted sm:self-auto sm:text-sm">
          <span className="font-mono font-semibold text-foreground tabular-nums">
            {completedTopicIds.length}
          </span>
          <span>of 10 topics completed</span>
        </div>
      </div>

      {/* Structured Curriculum Index (Single continuous surface with subtle dividers) */}
      <div className="overflow-hidden rounded-2xl surface-panel divide-y divide-divider shadow-sm">
        {/* Desktop Table Header */}
        <div className="hidden lg:grid grid-cols-12 items-center gap-4 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted bg-surface-raised/40">
          <span className="col-span-1">Topic</span>
          <span className="col-span-4">Curriculum title</span>
          <span className="col-span-2 text-right">Weight</span>
          <span className="col-span-2 text-right">Last score</span>
          <span className="col-span-1 text-center">Status</span>
          <span className="col-span-2 text-right pr-2">Action</span>
        </div>

        {CFA_CURRICULUM.map((topic) => {
          const presentation = getTopicPresentation({
            topicId: topic.id,
            activeTopicId,
            inProgressTopicId,
            completedTopicIds,
            practiceAttempts,
          });

          const isExpanded = expandedTopicId === topic.id;
          const isCurrent = presentation.state === "current";
          const isNeedsReview = presentation.state === "needs-review";
          const isCompleted = presentation.state === "completed";
          const isStarted = presentation.state === "started";

          return (
            <article
              key={topic.id}
              className={`transition-colors duration-150 ${
                isCurrent
                  ? "bg-accent/[0.04]"
                  : isNeedsReview
                  ? "bg-warning/[0.03]"
                  : "hover:bg-surface-interactive/40"
              }`}
            >
              {/* Desktop Row View */}
              <div className="hidden lg:grid grid-cols-12 items-center gap-4 px-5 py-3.5">
                {/* Col 1: Topic Number with expand trigger */}
                <div className="col-span-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleExpand(topic.id)}
                    aria-expanded={isExpanded}
                    aria-controls={`topic-details-${topic.id}`}
                    className="flex items-center gap-1.5 font-mono text-sm font-semibold text-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded p-1"
                  >
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        isExpanded ? "rotate-180 text-foreground" : "text-muted"
                      }`}
                      aria-hidden="true"
                    />
                    <span className={isCurrent ? "text-accent font-bold" : "text-muted-strong"}>
                      {topic.id}
                    </span>
                  </button>
                </div>

                {/* Col 2: Title & Learning Modules count */}
                <div className="col-span-4 min-w-0">
                  <button
                    type="button"
                    onClick={() => toggleExpand(topic.id)}
                    className="text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
                  >
                    <h3 className="truncate text-sm font-semibold text-foreground group-hover:text-accent transition-colors">
                      {topic.name}
                    </h3>
                    <p className="mt-0.5 text-xs text-muted">
                      {topic.subReadings.length} modules · {topic.formulas.length} formulas
                    </p>
                  </button>
                </div>

                {/* Col 3: Exam Weight */}
                <div className="col-span-2 text-right font-mono text-xs text-muted">
                  {topic.weight}
                </div>

                {/* Col 4: Last Score / Accuracy */}
                <div className="col-span-2 text-right">
                  {presentation.latestScore !== undefined && presentation.latestTotal !== undefined ? (
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-mono text-xs font-medium text-foreground">
                        {presentation.latestScore}/{presentation.latestTotal} ({presentation.latestAccuracy}%)
                      </span>
                      <div
                        className="h-1 w-16 overflow-hidden rounded-full bg-surface-interactive"
                        role="progressbar"
                        aria-valuenow={presentation.latestAccuracy ?? 0}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${topic.name} score: ${presentation.latestAccuracy}%`}
                      >
                        <div
                          className={`h-full rounded-full ${
                            isNeedsReview
                              ? "bg-warning"
                              : isCompleted || isCurrent
                              ? "bg-accent"
                              : "bg-info"
                          }`}
                          style={{ width: `${presentation.latestAccuracy ?? 0}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-muted/60">Not tested</span>
                  )}
                </div>

                {/* Col 5: Status Badge */}
                <div className="col-span-1 flex justify-center">
                  {isCurrent && (
                    <span className="inline-flex items-center rounded-md bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent">
                      Current
                    </span>
                  )}
                  {isNeedsReview && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-warning/15 px-2 py-0.5 text-xs font-medium text-warning">
                      <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                      Review
                    </span>
                  )}
                  {isCompleted && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                      <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                      Done
                    </span>
                  )}
                  {isStarted && (
                    <span className="inline-flex items-center rounded-md bg-info/15 px-2 py-0.5 text-xs font-medium text-info">
                      Started
                    </span>
                  )}
                  {!isCurrent && !isNeedsReview && !isCompleted && !isStarted && (
                    <span className="text-xs text-muted/50">—</span>
                  )}
                </div>

                {/* Col 6: Practice Action */}
                <div className="col-span-2 flex justify-end">
                  <button
                    type="button"
                    aria-label={`Practice ${topic.name}`}
                    onClick={(e) => handleStartDrill(topic.id, e)}
                    className={`inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                      isCurrent
                        ? "bg-accent text-accent-ink hover:bg-accent-strong"
                        : "bg-surface-interactive text-foreground hover:bg-surface-raised"
                    }`}
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Practice ({drillQuestionCount}Q)</span>
                  </button>
                </div>
              </div>

              {/* Mobile / Tablet Row View */}
              <div className="flex lg:hidden items-center justify-between gap-3 p-3.5 sm:p-4">
                <button
                  type="button"
                  onClick={() => toggleExpand(topic.id)}
                  aria-expanded={isExpanded}
                  aria-controls={`topic-details-${topic.id}`}
                  className="flex min-w-0 flex-1 items-start gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded p-1"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-interactive font-mono text-xs font-semibold text-accent">
                    {topic.id}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h3 className="text-sm font-semibold text-foreground leading-snug">
                        {topic.name}
                      </h3>
                      {isCurrent && (
                        <span className="inline-flex items-center rounded-md bg-accent/15 px-1.5 py-0.5 text-[11px] font-semibold text-accent">
                          Current
                        </span>
                      )}
                      {isNeedsReview && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-warning/15 px-1.5 py-0.5 text-[11px] font-medium text-warning">
                          <AlertTriangle className="h-2.5 w-2.5" aria-hidden="true" />
                          Review
                        </span>
                      )}
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-accent/10 px-1.5 py-0.5 text-[11px] font-medium text-accent">
                          <CheckCircle2 className="h-2.5 w-2.5" aria-hidden="true" />
                          Done
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      {topic.subReadings.length} modules · {topic.weight}
                      {presentation.latestScore !== undefined && (
                        <span className="font-mono ml-2 text-foreground">
                          · Last: {presentation.latestAccuracy}%
                        </span>
                      )}
                    </p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-muted transition-transform duration-200 mt-1 ${
                      isExpanded ? "rotate-180 text-foreground" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>

                <button
                  type="button"
                  aria-label={`Practice ${topic.name}`}
                  onClick={(e) => handleStartDrill(topic.id, e)}
                  className={`inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg px-3 text-xs font-semibold transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    isCurrent
                      ? "bg-accent text-accent-ink hover:bg-accent-strong"
                      : "bg-surface-interactive text-foreground hover:bg-surface-raised"
                  }`}
                >
                  <Play className="h-4 w-4 fill-current" />
                  <span className="hidden sm:inline sm:ml-1.5">Practice</span>
                </button>
              </div>

              {/* Accordion Expanded Learning Modules (Tonal inset region, no outlined card) */}
              {isExpanded && (
                <div
                  id={`topic-details-${topic.id}`}
                  className="space-y-4 border-t border-divider bg-surface-raised/60 px-4 py-4 sm:px-6 sm:py-5 transition-all"
                >
                  <p className="max-w-[75ch] text-xs leading-relaxed text-muted-strong sm:text-sm">
                    <span className="font-semibold text-foreground">Common difficulty:</span>{" "}
                    {topic.highYieldTrapArea}
                  </p>

                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">
                      Learning modules ({topic.subReadings.length})
                    </h4>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      {topic.subReadings.map((sub) => (
                        <div
                          key={sub.id}
                          className="flex items-start gap-2.5 rounded-lg bg-surface-interactive/60 px-3 py-2 text-xs text-muted-strong"
                        >
                          <span className="shrink-0 font-mono text-xs font-semibold text-accent">
                            {sub.losCode || sub.id}
                          </span>
                          <span className="leading-snug text-foreground">{sub.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions inside expanded section */}
                  <div className="flex flex-col gap-2 pt-1 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => onOpenBriefing(topic.id)}
                      className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-surface-interactive px-4 py-2 text-xs sm:text-sm font-medium text-foreground transition-colors hover:bg-surface-raised active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      <BookOpen className="h-4 w-4 text-muted" />
                      <span>Review topic notes</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenScenarioSimulator(topic.id)}
                      className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-medium text-accent transition-colors hover:bg-accent/10 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      <span>Create custom practice</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
};

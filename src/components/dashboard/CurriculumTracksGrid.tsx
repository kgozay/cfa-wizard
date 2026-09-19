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
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Curriculum
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Choose a topic to study, then practice with custom question sets.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 self-start rounded-xl glass-pill-btn px-3.5 py-1.5 text-xs text-slate-300 sm:self-auto">
          <span>All 10 topics</span>
          <span className="text-slate-500">•</span>
          <span className="font-mono font-semibold text-white tabular-nums">
            {completedTopicIds.length}/10
          </span>
          <span>completed</span>
        </div>
      </div>

      {/* Structured Curriculum Index (Liquid Glass Card) */}
      <div className="overflow-hidden rounded-2xl liquid-glass-card divide-y divide-white/[0.03]">
        {/* Desktop Table Header */}
        <div className="hidden lg:grid grid-cols-12 items-center gap-4 px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-white/[0.04]">
          <span className="col-span-1">#</span>
          <span className="col-span-4">Topic</span>
          <span className="col-span-2 text-center">Exam Weight</span>
          <span className="col-span-2 text-center">Last Result</span>
          <span className="col-span-1 text-center">Status</span>
          <span className="col-span-2 text-right pr-2">Practice</span>
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
                  ? "bg-white/[0.02]"
                  : isNeedsReview
                  ? "bg-warning/[0.02]"
                  : "hover:bg-white/[0.015]"
              }`}
            >
              {/* Desktop Row View */}
              <div className="hidden lg:grid grid-cols-12 items-center gap-4 px-6 py-4">
                {/* Col 1: Topic Number with expand trigger */}
                <div className="col-span-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleExpand(topic.id)}
                    aria-expanded={isExpanded}
                    aria-controls={`topic-details-${topic.id}`}
                    className="flex items-center gap-1.5 font-mono text-sm font-bold text-slate-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded p-1"
                  >
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        isExpanded ? "rotate-180 text-white" : "text-slate-500"
                      }`}
                      aria-hidden="true"
                    />
                    <span className={isCurrent ? "text-accent font-bold" : "text-slate-300"}>
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
                    <h3 className="truncate text-sm font-semibold text-white group-hover:text-accent transition-colors">
                      {topic.name}
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {topic.subReadings.length} learning modules • Practice sets • Key concepts
                    </p>
                  </button>
                </div>

                {/* Col 3: Exam Weight */}
                <div className="col-span-2 text-center font-mono text-xs text-slate-300">
                  {topic.weight}
                </div>

                {/* Col 4: Last Score / Accuracy */}
                <div className="col-span-2 text-center">
                  {presentation.latestScore !== undefined && presentation.latestTotal !== undefined ? (
                    <div className="inline-flex items-center gap-1.5">
                      <span className="font-mono text-xs font-semibold text-white">
                        {presentation.latestAccuracy}%
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        ({presentation.latestScore}/{presentation.latestTotal})
                      </span>
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                      Not started
                    </span>
                  )}
                </div>

                {/* Col 5: Status Badge */}
                <div className="col-span-1 flex justify-center">
                  {isCurrent && (
                    <span className="inline-flex items-center rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-medium text-accent">
                      Current
                    </span>
                  )}
                  {isNeedsReview && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2.5 py-0.5 text-xs font-medium text-warning">
                      <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                      Review
                    </span>
                  )}
                  {isCompleted && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                      <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                      Done
                    </span>
                  )}
                  {isStarted && (
                    <span className="inline-flex items-center rounded-full bg-info/15 px-2.5 py-0.5 text-xs font-medium text-info">
                      Started
                    </span>
                  )}
                  {!isCurrent && !isNeedsReview && !isCompleted && !isStarted && (
                    <span className="text-xs text-slate-500">—</span>
                  )}
                </div>

                {/* Col 6: Practice Action */}
                <div className="col-span-2 flex justify-end">
                  <button
                    type="button"
                    aria-label={`Practice ${topic.name}`}
                    onClick={(e) => handleStartDrill(topic.id, e)}
                    className="glass-pill-btn px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white inline-flex items-center gap-1.5"
                  >
                    <Play className="h-3 w-3 text-accent fill-current" />
                    <span>Practice</span>
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
                  className="glass-pill-btn px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white inline-flex items-center gap-1.5 shrink-0"
                >
                  <Play className="h-3 w-3 text-accent fill-current" />
                  <span className="hidden sm:inline">Practice</span>
                </button>
              </div>

              {/* Accordion Expanded Learning Modules (Liquid Glass Inset) */}
              {isExpanded && (
                <div
                  id={`topic-details-${topic.id}`}
                  className="space-y-4 border-t border-white/[0.04] bg-white/[0.02] px-4 py-4 sm:px-6 sm:py-5 transition-all"
                >
                  <p className="max-w-[75ch] text-xs leading-relaxed text-slate-300 sm:text-sm">
                    <span className="font-semibold text-white">Common difficulty:</span>{" "}
                    {topic.highYieldTrapArea}
                  </p>

                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Learning modules ({topic.subReadings.length})
                    </h4>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      {topic.subReadings.map((sub) => (
                        <div
                          key={sub.id}
                          className="flex items-start gap-2.5 rounded-xl bg-white/[0.03] px-3.5 py-2 text-xs text-slate-300"
                        >
                          <span className="shrink-0 font-mono text-xs font-semibold text-accent">
                            {sub.losCode || sub.id}
                          </span>
                          <span className="leading-snug text-white">{sub.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions inside expanded section */}
                  <div className="flex flex-col gap-2 pt-1 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => onOpenBriefing(topic.id)}
                      className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl glass-pill-btn px-4 py-2 text-xs sm:text-sm font-semibold text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      <BookOpen className="h-4 w-4 text-slate-400" />
                      <span>Review topic notes</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenScenarioSimulator(topic.id)}
                      className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold text-accent transition-colors hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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

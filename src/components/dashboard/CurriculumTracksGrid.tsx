"use client";

import React, { useState } from "react";
import {
  Play,
  BookOpen,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sigma,
  TrendingUp,
  Building2,
  FileSpreadsheet,
  LineChart,
  Landmark,
  ArrowLeftRight,
  Gem,
  PieChart,
  Scale,
  Sparkles,
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

const TOPIC_ICONS: Record<
  string,
  React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>
> = {
  "01": Sigma,
  "02": TrendingUp,
  "03": Building2,
  "04": FileSpreadsheet,
  "05": LineChart,
  "06": Landmark,
  "07": ArrowLeftRight,
  "08": Gem,
  "09": PieChart,
  "10": Scale,
};

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
            Choose a topic
          </h2>
          <p className="mt-1 text-sm text-muted">
            Open a topic for its modules, review notes, or start a focused practice set.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 self-start rounded-lg border border-border/80 bg-surface px-3 py-1.5 text-xs text-muted sm:self-auto sm:text-sm">
          <span className="font-semibold text-foreground tabular-nums">
            {completedTopicIds.length}
          </span>
          <span>of 10 topics completed</span>
        </div>
      </div>

      {/* Curriculum Topic Rows */}
      <div className="overflow-hidden rounded-2xl border border-border/80 bg-surface divide-y divide-border/60 shadow-sm">
        {CFA_CURRICULUM.map((topic) => {
          const presentation = getTopicPresentation({
            topicId: topic.id,
            activeTopicId,
            inProgressTopicId,
            completedTopicIds,
            practiceAttempts,
          });

          const isExpanded = expandedTopicId === topic.id;
          const TopicIcon = TOPIC_ICONS[topic.id] || Sparkles;

          // Distinct styling per presentation state
          const isCurrent = presentation.state === "current";
          const isNeedsReview = presentation.state === "needs-review";
          const isCompleted = presentation.state === "completed";
          const isStarted = presentation.state === "started";

          return (
            <article
              key={topic.id}
              className={`transition-colors duration-200 ${
                isCurrent
                  ? "bg-accent/[0.04]"
                  : isNeedsReview
                  ? "bg-warning/[0.02]"
                  : "bg-transparent hover:bg-surface-interactive/40"
              }`}
            >
              <div className="flex items-center gap-2 p-3 sm:p-4">
                {/* Expand / Collapse Button Header */}
                <button
                  type="button"
                  onClick={() => toggleExpand(topic.id)}
                  aria-expanded={isExpanded}
                  aria-controls={`topic-details-${topic.id}`}
                  className="flex min-h-14 min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  {/* Topic Icon Tile */}
                  <div
                    className={`flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
                      isCurrent
                        ? "bg-accent text-accent-ink shadow-sm"
                        : isNeedsReview
                        ? "bg-warning/20 text-warning"
                        : isCompleted
                        ? "bg-accent/15 text-accent"
                        : isStarted
                        ? "bg-info/20 text-info"
                        : "bg-surface-interactive text-muted"
                    }`}
                  >
                    <TopicIcon className="h-5 w-5" aria-hidden="true" />
                  </div>

                  {/* Topic Details & Meta */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="font-mono text-xs font-semibold text-muted">
                        {topic.id}
                      </span>
                      <h3 className="truncate text-sm font-semibold text-foreground sm:text-base">
                        {topic.name}
                      </h3>

                      {/* State Badges (Icon + Text) */}
                      {isCurrent && (
                        <span className="inline-flex items-center rounded-md bg-accent/20 px-2 py-0.5 text-xs font-medium text-accent">
                          Current
                        </span>
                      )}
                      {isNeedsReview && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-warning/15 px-2 py-0.5 text-xs font-medium text-warning">
                          <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                          Needs review
                        </span>
                      )}
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent">
                          <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                          Completed
                        </span>
                      )}
                      {isStarted && (
                        <span className="inline-flex items-center rounded-md bg-info/15 px-2 py-0.5 text-xs font-medium text-info">
                          In progress
                        </span>
                      )}
                    </div>

                    <p className="mt-0.5 truncate text-xs text-muted sm:text-sm">
                      {topic.subReadings.length} modules · {topic.formulas.length} formulas · {topic.weight} exam weight
                    </p>

                    {/* Latest Attempt Slim Progress Bar */}
                    {presentation.latestScore !== undefined &&
                      presentation.latestTotal !== undefined && (
                        <div className="mt-1.5 flex flex-wrap items-center gap-2 sm:gap-3">
                          <div
                            className="h-1.5 w-20 sm:w-28 overflow-hidden rounded-full bg-border"
                            role="progressbar"
                            aria-valuenow={presentation.latestAccuracy ?? 0}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`${topic.name} last attempt score: ${presentation.latestScore} of ${presentation.latestTotal}`}
                          >
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isNeedsReview
                                  ? "bg-warning"
                                  : isCompleted || isCurrent
                                  ? "bg-accent"
                                  : "bg-info"
                              }`}
                              style={{ width: `${presentation.latestAccuracy ?? 0}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs text-muted tabular-nums">
                            Last attempt {presentation.latestScore}/{presentation.latestTotal}
                            {presentation.latestAccuracy !== undefined ? ` (${presentation.latestAccuracy}%)` : ""}
                          </span>
                        </div>
                      )}
                  </div>

                  {/* Expand / Collapse Chevron */}
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-muted transition-transform duration-200 ${
                      isExpanded ? "rotate-180 text-foreground" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>

                {/* Practice Action Button */}
                <button
                  type="button"
                  aria-label={`Start ${topic.name} practice`}
                  onClick={(e) => handleStartDrill(topic.id, e)}
                  className={`inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:w-auto sm:px-3.5 ${
                    isCurrent
                      ? "bg-accent text-accent-ink hover:bg-accent-strong"
                      : "border border-border bg-surface-interactive/60 text-foreground hover:border-accent/50 hover:bg-surface-interactive"
                  }`}
                >
                  <Play className="h-4 w-4 fill-current" />
                  <span className="hidden sm:inline">Practice {drillQuestionCount}</span>
                </button>
              </div>

              {/* Accordion Expanded Content */}
              {isExpanded && (
                <div
                  id={`topic-details-${topic.id}`}
                  className="space-y-4 border-t border-border/60 bg-surface-raised px-5 py-5 transition-all sm:px-7"
                >
                  <p className="max-w-[75ch] text-xs leading-relaxed text-muted-strong sm:text-sm">
                    <span className="font-semibold text-foreground">Common difficulty:</span>{" "}
                    {topic.highYieldTrapArea}
                  </p>

                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted sm:text-xs">
                      Learning modules ({topic.subReadings.length})
                    </h4>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      {topic.subReadings.map((sub) => (
                        <div
                          key={sub.id}
                          className="flex items-start gap-3 rounded-lg border border-border/40 bg-surface-interactive/60 px-3 py-2.5 text-xs text-muted-strong transition-colors hover:border-border sm:text-sm"
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
                  <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => onOpenBriefing(topic.id)}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface-interactive/60 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-interactive hover:border-accent/40 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      <BookOpen className="h-4 w-4 text-muted" />
                      <span>Review topic notes</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenScenarioSimulator(topic.id)}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/10 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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

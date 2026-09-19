"use client";

import React, { useState } from "react";
import { Play, BookOpen, ChevronDown, CheckCircle2, ArrowRight } from "lucide-react";
import { CFA_CURRICULUM } from "@/data/curriculum";
import { CFA_VIGNETTES } from "@/data/vignettes";
import { useCFAStore } from "@/store/useCFAStore";
import { sound } from "@/components/common/SoundEffects";

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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-[-0.01em] text-white">Choose a topic</h2>
          <p className="mt-1 text-sm text-[#A8B0AD]">Open a topic for its modules, review notes, or start a practice set.</p>
        </div>
        <p className="text-sm text-[#A8B0AD]">
          <span className="font-semibold text-white">{completedTopicIds.length}</span> of 10 completed
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#2A3031] bg-[#15191A] divide-y divide-[#272D2E]">
        {CFA_CURRICULUM.map((topic) => {
          const isCompleted = completedTopicIds.includes(topic.id);
          const isCurrent = (activeTopicId || inProgressTopicId) === topic.id;
          const isExpanded = expandedTopicId === topic.id;
          const latestAttempt = [...practiceAttempts]
            .reverse()
            .find((attempt) => !attempt.containsDraftContent && attempt.itemAttempts.some((item) => item.topicId === topic.id));
          const latestTopicItems = latestAttempt?.itemAttempts.filter((item) => item.topicId === topic.id) || [];
          const latestTopicScore = latestTopicItems.filter((item) => item.isCorrect).length;

          return (
            <article
              key={topic.id}
              className={isCurrent ? "bg-brand-lime/[0.035]" : "bg-transparent"}
            >
              <div className="flex items-center gap-2 p-3 sm:p-4">
                <button
                  type="button"
                  onClick={() => toggleExpand(topic.id)}
                  aria-expanded={isExpanded}
                  aria-controls={`topic-details-${topic.id}`}
                  className="flex min-h-14 min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-[#1A1F20]"
                >
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold ${
                    isCurrent ? "bg-brand-lime text-[#111510]" : "bg-[#202526] text-[#C1C7C4]"
                  }`}>
                    {topic.id}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <h3 className="truncate text-base font-semibold text-white">{topic.name}</h3>
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-lime">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Completed
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-sm text-[#A8B0AD]">
                      {topic.subReadings.length} modules · {topic.formulas.length} formulas · {topic.weight} exam weight
                      {latestAttempt ? ` · Last eligible score ${latestTopicScore}/${latestTopicItems.length}` : ""}
                    </p>
                  </div>
                  <ChevronDown className={`h-5 w-5 shrink-0 text-[#8E9894] transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                </button>
                <button
                  type="button"
                  aria-label={`Start ${topic.name} practice`}
                  onClick={(e) => handleStartDrill(topic.id, e)}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#3A4241] text-sm font-semibold text-white transition-colors hover:border-brand-lime/60 hover:bg-brand-lime/10 sm:w-auto sm:px-3.5"
                >
                  <Play className="h-4 w-4 fill-current" />
                  <span className="hidden sm:inline">Practice {drillQuestionCount}</span>
                </button>
              </div>

              {isExpanded && (
                <div id={`topic-details-${topic.id}`} className="space-y-4 border-t border-[#272D2E] bg-[#121617] px-5 py-5 sm:px-7">
                  <p className="max-w-[75ch] text-sm leading-6 text-[#B7BEBA]">
                    <span className="font-medium text-white">Common difficulty:</span> {topic.highYieldTrapArea}
                  </p>

                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-white">Learning modules</h4>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      {topic.subReadings.map((sub) => (
                        <div
                          key={sub.id}
                          className="flex items-start gap-3 rounded-lg bg-[#191E1F] px-3 py-2.5 text-sm text-[#D4D9D6]"
                        >
                          <span className="shrink-0 font-mono text-xs text-brand-lime">
                            {sub.losCode || sub.id}
                          </span>
                          <span>{sub.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-1 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => onOpenBriefing(topic.id)}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#343B3B] px-4 py-2 text-sm font-medium text-[#DDE2DF] hover:bg-[#1D2223]"
                    >
                      <BookOpen className="h-4 w-4" />
                      Review topic notes
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenScenarioSimulator(topic.id)}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-brand-lime hover:bg-brand-lime/10"
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

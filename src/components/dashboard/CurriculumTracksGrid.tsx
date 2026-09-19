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
    <section className="liquid-glass-card rounded-2xl p-6 sm:p-8 space-y-6">
      {/* Header inside the liquid glass card */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Curriculum
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Choose a topic to study, then practice with custom question sets.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl glass-pill-btn px-3.5 py-1.5 text-xs font-medium text-slate-300">
          <span>All 10 topics</span>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        </div>
      </div>

      {/* Table Structure */}
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[620px]">
          <thead>
            <tr className="border-b border-white/[0.04] text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th className="pb-3 pl-2 w-12">#</th>
              <th className="pb-3">Topic</th>
              <th className="pb-3 text-center">Exam Weight</th>
              <th className="pb-3 text-center">Last Result</th>
              <th className="pb-3 pr-2 text-right">Practice</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
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

              return (
                <React.Fragment key={topic.id}>
                  <tr
                    onClick={() => toggleExpand(topic.id)}
                    className="hover:bg-white/[0.015] transition-colors cursor-pointer group"
                  >
                    {/* # */}
                    <td className="py-4 pl-2 font-mono font-bold text-sm">
                      <span className={isCurrent ? "text-accent font-bold" : "text-slate-300"}>
                        {topic.id}
                      </span>
                    </td>

                    {/* Topic */}
                    <td className="py-4">
                      <div className="font-semibold text-white text-sm group-hover:text-accent transition-colors">
                        {topic.name}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {topic.subReadings.length} learning modules • Practice sets • Key concepts
                      </div>
                    </td>

                    {/* Exam Weight */}
                    <td className="py-4 text-center font-mono text-xs text-slate-300">
                      {topic.weight}
                    </td>

                    {/* Last Result */}
                    <td className="py-4 text-center">
                      {presentation.latestScore !== undefined && presentation.latestTotal !== undefined ? (
                        <span className="inline-flex items-center gap-1.5 font-mono text-xs text-white">
                          <span>{presentation.latestAccuracy}%</span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            ({presentation.latestScore}/{presentation.latestTotal})
                          </span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                          Not started
                        </span>
                      )}
                    </td>

                    {/* Practice Action */}
                    <td className="py-4 pr-2 text-right">
                      <button
                        type="button"
                        aria-label={`Practice ${topic.name}`}
                        onClick={(e) => handleStartDrill(topic.id, e)}
                        className="glass-pill-btn px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white inline-flex items-center gap-1.5"
                      >
                        <Play className="h-3 w-3 text-accent fill-current" />
                        <span>Practice</span>
                      </button>
                    </td>
                  </tr>

                  {/* Accordion Expanded Learning Modules */}
                  {isExpanded && (
                    <tr className="bg-white/[0.02]">
                      <td colSpan={5} className="p-4 sm:p-6 border-t border-white/[0.04]">
                        <div className="space-y-4">
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
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};

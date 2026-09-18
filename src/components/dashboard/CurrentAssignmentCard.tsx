"use client";

import React from "react";
import { Play, BookOpen, Wand2, CheckCircle2 } from "lucide-react";
import { useCFAStore } from "@/store/useCFAStore";
import { CFA_CURRICULUM } from "@/data/curriculum";
import { CFA_VIGNETTES } from "@/data/vignettes";
import { sound } from "@/components/common/SoundEffects";

interface CurrentAssignmentCardProps {
  onOpenBriefing: (topicId: string) => void;
  onOpenScenarioSimulator: (topicId: string) => void;
}

export const CurrentAssignmentCard: React.FC<CurrentAssignmentCardProps> = ({
  onOpenBriefing,
  onOpenScenarioSimulator,
}) => {
  const {
    activeTopicId,
    inProgressTopicId,
    completedTopicIds,
    startVignetteDrill,
    drillQuestionCount,
    vignetteResults,
    soundEnabled,
  } = useCFAStore();

  const currentTopicId = activeTopicId || inProgressTopicId || "01";
  const topic = CFA_CURRICULUM.find((t) => t.id === currentTopicId) || CFA_CURRICULUM[0];
  const isCompleted = completedTopicIds.includes(topic.id);
  const baseVignette = CFA_VIGNETTES.find((v) => v.topicId === topic.id);
  const result = baseVignette ? vignetteResults[baseVignette.id] : undefined;

  const handleStartDrill = () => {
    if (soundEnabled) sound.playNodeSwitch();
    startVignetteDrill(topic.id);
  };

  return (
    <section className="w-full rounded-2xl border border-[#2A3031] bg-[#15191A] p-5 sm:p-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl space-y-3 sm:space-y-4">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-[#A8B0AD]">
            <span>Suggested next topic</span>
            <span aria-hidden="true" className="text-[#59615F]">•</span>
            <span>Topic {topic.id} of 10</span>
            <span aria-hidden="true" className="text-[#59615F]">•</span>
            <span>{topic.weight} exam weight</span>
            {isCompleted && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-lime/10 px-2.5 py-1 text-sm font-medium text-brand-lime">
                <CheckCircle2 className="h-4 w-4" />
                Completed
              </span>
            )}
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-[-0.02em] text-white sm:text-3xl">
              {topic.name}
            </h1>
            <p className="mt-2 max-w-[65ch] text-base leading-7 text-[#C1C7C4]">
              Build fluency across {topic.subReadings.length} learning modules with a focused practice set.
            </p>
          </div>

          <p className="hidden max-w-[70ch] text-sm leading-6 text-[#A8B0AD] sm:block">
            <span className="font-medium text-[#DDE2DF]">Common difficulty:</span>{" "}
            {topic.highYieldTrapArea}
          </p>

          {result && (
            <p className="text-sm text-[#A8B0AD]">
              Last attempt: <span className="font-semibold text-white">{result.score}/{result.total}</span>
            </p>
          )}
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-72">
          <button
            onClick={handleStartDrill}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand-lime px-6 py-3 text-base font-semibold text-[#111510] transition-colors hover:bg-brand-neon"
          >
            <Play className="h-4 w-4 fill-current" />
            <span>Start {drillQuestionCount}-question practice</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onOpenBriefing(topic.id)}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#343B3B] bg-transparent px-3 py-2 text-sm font-medium text-[#DDE2DF] transition-colors hover:bg-[#1A1F20]"
            >
              <BookOpen className="h-4 w-4" />
              Review topic
            </button>

            <button
              onClick={() => onOpenScenarioSimulator(topic.id)}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#343B3B] bg-transparent px-3 py-2 text-sm font-medium text-[#DDE2DF] transition-colors hover:bg-[#1A1F20]"
            >
              <Wand2 className="h-4 w-4" />
              Custom practice
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

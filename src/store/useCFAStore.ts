import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  ErrorMode,
  LeitnerCard,
  TrapLogEntry,
  VignetteSessionResult,
  VignetteSet } from "@/types/cfa";
import { PracticeAttempt, PracticeDraft, PracticeSession } from "@/types/practice";
import { MockExamDraft } from "@/types/mockExam";
import { CFA_VIGNETTES } from "@/data/vignettes";
import { migrateV3ToV4 } from "./migrations";
import { scheduleLeitnerCard } from "@/lib/practice/leitner";

interface CFAState {
  // Curriculum tracking
  completedTopicIds: string[];
  inProgressTopicId: string;
  activeTopicId: string | null;
  activeVignetteId: string | null;
  
  // Drill Configuration Preferences
  drillQuestionCount: 2 | 5 | 10 | 15;
  isPacingTimerEnabled: boolean;
  
  // Submissions & Error Logging
  vignetteResults: Record<string, VignetteSessionResult>;
  practiceAttempts: PracticeAttempt[];
  practiceSessions: Record<string, PracticeSession>;
  activePracticeSessionId: string | null;
  practiceDraft: PracticeDraft | null;
  mockExamDraft: MockExamDraft | null;
  trapLogs: TrapLogEntry[];
  customVignettes: VignetteSet[];
  leitnerCards: LeitnerCard[];
  
  // UI & Tool Modals
  soundEnabled: boolean;
  isCalculatorOpen: boolean;
  calculatorMode: "closed" | "docked" | "floating" | "minimized";
  isFormulaSheetOpen: boolean;
  isTrapLogOpen: boolean;
  isAIGeneratorOpen: boolean;
  isBriefingModalOpen: boolean;
  isSprintModalOpen: boolean;
  isLeitnerDeckOpen: boolean;
  isShortcutsOpen: boolean;
  isMockExamOpen: boolean;
  isLearnHubOpen: boolean;
  isAuthSyncOpen: boolean;
  weakAreaTargetTopic: string | null;
  
  // Actions
  selectTopic: (id: string) => void;
  markTopicCompleted: (id: string) => void;
  setActiveBriefing: (topicId: string | null) => void;
  startVignetteDrill: (vignetteId: string) => void;
  closeVignetteDrill: () => void;
  setDrillQuestionCount: (count: 2 | 5 | 10 | 15) => void;
  setPacingTimerEnabled: (enabled: boolean) => void;
  togglePacingTimer: () => void;
  recordPracticeAttempt: (attempt: PracticeAttempt, trapEntries?: TrapLogEntry[]) => void;
  savePracticeSession: (session: PracticeSession, makeActive?: boolean) => void;
  clearActivePracticeSession: () => void;
  setPracticeDraft: (draft: PracticeDraft | null) => void;
  setMockExamDraft: (draft: MockExamDraft | null) => void;
  getLatestAttemptForTopic: (topicId: string) => PracticeAttempt | undefined;
  logErrorMode: (trapEntryId: string, errorMode: ErrorMode) => void;
  updateLeitnerCard: (cardId: string, isCorrect: boolean) => void;
  deleteLeitnerCard: (cardId: string) => void;
  deleteTrapLogEntry: (id: string) => void;
  clearAllTrapLogs: () => void;
  addCustomVignette: (vignette: VignetteSet) => void;
  addQuestionsToActiveVignette: (questions: import("@/types/cfa").VignetteQuestion[]) => void;
  setWeakAreaTargetTopic: (topicId: string | null) => void;
  
  // Modals
  toggleSound: () => void;
  setCalculatorOpen: (open: boolean) => void;
  setCalculatorMode: (mode: "closed" | "docked" | "floating" | "minimized") => void;
  setFormulaSheetOpen: (open: boolean) => void;
  setTrapLogOpen: (open: boolean) => void;
  setAIGeneratorOpen: (open: boolean) => void;
  setBriefingModalOpen: (open: boolean) => void;
  setSprintModalOpen: (open: boolean) => void;
  setLeitnerDeckOpen: (open: boolean) => void;
  setShortcutsOpen: (open: boolean) => void;
  setMockExamOpen: (open: boolean) => void;
  setLearnHubOpen: (open: boolean) => void;
  setAuthSyncOpen: (open: boolean) => void;
  
  // Reset
  resetProgress: () => void;
}

/** Largest supported drill size that the set can fill. */
function toDrillCount(questionCount: number): 2 | 5 | 10 | 15 {
  return questionCount >= 15 ? 15 : questionCount >= 10 ? 10 : questionCount >= 5 ? 5 : 2;
}

/**
 * Routes missed questions into the spaced-review deck. A question that is
 * missed again resets its existing card to Box 1 instead of duplicating it.
 */
export function upsertLeitnerCards(cards: LeitnerCard[], trapEntries: TrapLogEntry[]): LeitnerCard[] {
  if (trapEntries.length === 0) return cards;
  const now = new Date().toISOString();
  const updated = [...cards];
  trapEntries.forEach((entry) => {
    if (!entry.options) return;
    const matchKey = entry.sourceItemId || `${entry.topicId}:${entry.questionStem.trim().toLowerCase()}`;
    const existingIdx = updated.findIndex(
      (card) => (card.sourceItemId || `${card.topicId}:${card.questionStem.trim().toLowerCase()}`) === matchKey
    );
    const card: LeitnerCard = {
      id: existingIdx >= 0 ? updated[existingIdx].id : crypto.randomUUID(),
      trapLogId: entry.id,
      sourceItemId: entry.sourceItemId,
      topicId: entry.topicId,
      topicName: entry.topicName,
      questionStem: entry.questionStem,
      options: entry.options,
      correctOption: entry.correctOption,
      solution: entry.solution || entry.autopsyExplanation,
      keystrokes: entry.calculatorKeystrokes || "",
      trapName: entry.trapName,
      errorMode: entry.errorMode || "UNSPECIFIED",
      box: 1,
      lastReviewedAt: existingIdx >= 0 ? updated[existingIdx].lastReviewedAt : undefined,
      nextReviewAt: now,
      reviewCount: existingIdx >= 0 ? updated[existingIdx].reviewCount : 0,
    };
    if (existingIdx >= 0) updated[existingIdx] = card;
    else updated.unshift(card);
  });
  return updated;
}

export const useCFAStore = create<CFAState>()(
  persist(
    (set, get) => ({
      completedTopicIds: [],
      inProgressTopicId: "01",
      activeTopicId: "01",
      activeVignetteId: null,

      drillQuestionCount: 5,
      isPacingTimerEnabled: true,

      vignetteResults: {},
      practiceAttempts: [],
      practiceSessions: {},
      activePracticeSessionId: null,
      practiceDraft: null,
      mockExamDraft: null,
      trapLogs: [],
      customVignettes: [],
      leitnerCards: [],

      soundEnabled: true,
      isCalculatorOpen: false,
      calculatorMode: "closed",
      isFormulaSheetOpen: false,
      isTrapLogOpen: false,
      isAIGeneratorOpen: false,
      isBriefingModalOpen: false,
      isSprintModalOpen: false,
      isLeitnerDeckOpen: false,
      isShortcutsOpen: false,
      isMockExamOpen: false,
      isLearnHubOpen: false,
      isAuthSyncOpen: false,
      weakAreaTargetTopic: null,

      selectTopic: (id: string) => {
        set({ activeTopicId: id, inProgressTopicId: id });
      },

      markTopicCompleted: (id: string) => {
        const currentCompleted = get().completedTopicIds;
        if (!currentCompleted.includes(id)) {
          set({ completedTopicIds: [...currentCompleted, id] });
        }
      },

      setActiveBriefing: (topicId: string | null) => {
        // Closing the briefing (null) keeps the selected topic
        set((state) => ({
          activeTopicId: topicId ?? state.activeTopicId,
          isBriefingModalOpen: topicId !== null,
        }));
      },

      startVignetteDrill: (vignetteId: string) => {
        const allVignettes = [...CFA_VIGNETTES, ...get().customVignettes];
        const v = allVignettes.find(
          (item) => item.id === vignetteId || item.topicId === vignetteId
        );
        if (v) {
          const activeSession = get().activePracticeSessionId
            ? get().practiceSessions[get().activePracticeSessionId!]
            : undefined;
          const canResume = activeSession && !activeSession.completedAt && activeSession.sourceSetIds.includes(v.id);
          set({
            activeVignetteId: v.id,
            activePracticeSessionId: canResume ? activeSession.id : null,
            practiceDraft: canResume ? get().practiceDraft : null,
            activeTopicId: v.topicId,
            inProgressTopicId: v.topicId,
            isBriefingModalOpen: false,
            isSprintModalOpen: false,
            isLeitnerDeckOpen: false,
          });
        } else {
          set({ activeVignetteId: vignetteId, isBriefingModalOpen: false });
        }
      },

      closeVignetteDrill: () => {
        set({ activeVignetteId: null });
      },

      setDrillQuestionCount: (count: 2 | 5 | 10 | 15) => {
        set({ drillQuestionCount: count });
      },

      setPacingTimerEnabled: (enabled: boolean) => {
        set({ isPacingTimerEnabled: enabled });
      },

      togglePacingTimer: () => {
        set((state) => ({ isPacingTimerEnabled: !state.isPacingTimerEnabled }));
      },

      recordPracticeAttempt: (attempt: PracticeAttempt, trapEntries?: TrapLogEntry[]) => {
        const currentAttempts = [...get().practiceAttempts, attempt];
        const currentTraps = [...(trapEntries || []), ...get().trapLogs];

        const updatedCompleted = [...get().completedTopicIds];
        const primaryTopicId = attempt.topicIds[0];
        if (
          attempt.mode === "practice" &&
          attempt.topicIds.length === 1 &&
          primaryTopicId &&
          attempt.score >= Math.ceil(attempt.total * 0.7) &&
          !updatedCompleted.includes(primaryTopicId)
        ) {
          updatedCompleted.push(primaryTopicId);
        }

        const storedSession = get().practiceSessions[attempt.sessionId];
        const practiceSessions = storedSession
          ? {
              ...get().practiceSessions,
              [attempt.sessionId]: { ...storedSession, completedAt: attempt.submittedAt },
            }
          : get().practiceSessions;

        set({
          practiceAttempts: currentAttempts,
          practiceSessions,
          trapLogs: currentTraps,
          leitnerCards: upsertLeitnerCards(get().leitnerCards, trapEntries || []),
          completedTopicIds: updatedCompleted,
          practiceDraft: get().practiceDraft?.sessionId === attempt.sessionId ? null : get().practiceDraft,
        });
      },

      savePracticeSession: (session, makeActive = true) => {
        set((state) => ({
          practiceSessions: { ...state.practiceSessions, [session.id]: session },
          activePracticeSessionId: makeActive ? session.id : state.activePracticeSessionId,
        }));
      },

      clearActivePracticeSession: () => set({ activePracticeSessionId: null }),
      setPracticeDraft: (draft) => set({ practiceDraft: draft }),
      setMockExamDraft: (draft) => set({ mockExamDraft: draft }),

      getLatestAttemptForTopic: (topicId: string) => {
        const attempts = get().practiceAttempts.filter((a) => a.topicIds.includes(topicId));
        return attempts.length > 0 ? attempts[attempts.length - 1] : undefined;
      },

      logErrorMode: (trapEntryId: string, errorMode: ErrorMode) => {
        set((state) => {
          const updatedLogs = state.trapLogs.map((log) =>
            log.id === trapEntryId ? { ...log, errorMode } : log
          );
          const updatedLeitner = state.leitnerCards.map((card) =>
            card.trapLogId === trapEntryId ? { ...card, errorMode } : card
          );
          return { trapLogs: updatedLogs, leitnerCards: updatedLeitner };
        });
      },

      updateLeitnerCard: (cardId: string, isCorrect: boolean) => {
        set((state) => ({
          leitnerCards: state.leitnerCards.map((card) =>
            card.id === cardId ? scheduleLeitnerCard(card, isCorrect) : card
          ),
        }));
      },

      deleteLeitnerCard: (cardId: string) => {
        set((state) => ({
          leitnerCards: state.leitnerCards.filter((c) => c.id !== cardId),
        }));
      },

      deleteTrapLogEntry: (id: string) => {
        set((state) => ({
          trapLogs: state.trapLogs.filter((t) => t.id !== id),
          leitnerCards: state.leitnerCards.filter((c) => c.trapLogId !== id),
        }));
      },

      clearAllTrapLogs: () => {
        set({ trapLogs: [], leitnerCards: [] });
      },

      addCustomVignette: (vignette: VignetteSet) => {
        const qCount = vignette.questions.length;
        set((state) => ({
          customVignettes: [vignette, ...state.customVignettes],
          activeVignetteId: vignette.id,
          activeTopicId: vignette.topicId,
          inProgressTopicId: vignette.topicId,
          isAIGeneratorOpen: false,
          drillQuestionCount: toDrillCount(qCount),
        }));
      },

      addQuestionsToActiveVignette: (questions: import("@/types/cfa").VignetteQuestion[]) => {
        const { activeVignetteId, customVignettes } = get();
        if (!activeVignetteId) return;

        // Check if active vignette is in customVignettes or CFA_VIGNETTES
        const customIdx = customVignettes.findIndex((v) => v.id === activeVignetteId);
        if (customIdx >= 0) {
          const updatedQuestions = [...customVignettes[customIdx].questions, ...questions];
          const updatedCustom = [...customVignettes];
          updatedCustom[customIdx] = {
            ...updatedCustom[customIdx],
            questions: updatedQuestions,
          };
          set({
            customVignettes: updatedCustom,
          });
        } else {
          // Clone base vignette into customVignettes with added questions
          const baseV = CFA_VIGNETTES.find((v) => v.id === activeVignetteId);
          if (baseV) {
            const authoredProvenance = {
              origin: "authored" as const,
              status: "approved" as const,
              sourceIds: [baseV.id],
              createdAt: new Date().toISOString(),
            };
            const updatedQuestions = [
              ...baseV.questions.map((question) => ({ ...question, provenance: authoredProvenance })),
              ...questions,
            ];
            const newVignette: VignetteSet = {
              ...baseV,
              id: `${baseV.id}-expanded-${Date.now()}`,
              questions: updatedQuestions,
            };
            set({
              customVignettes: [newVignette, ...customVignettes],
              activeVignetteId: newVignette.id,
            });
          }
        }
      },

      setWeakAreaTargetTopic: (topicId: string | null) => {
        set({ weakAreaTargetTopic: topicId });
      },

      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      setCalculatorOpen: (open: boolean) =>
        set((state) => ({
          isCalculatorOpen: open,
          calculatorMode: open
            ? state.calculatorMode === "closed"
              ? "floating"
              : state.calculatorMode
            : "closed",
        })),
      setCalculatorMode: (mode) =>
        set({
          calculatorMode: mode,
          isCalculatorOpen: mode !== "closed",
        }),
      setFormulaSheetOpen: (open: boolean) => set({ isFormulaSheetOpen: open }),
      setTrapLogOpen: (open: boolean) => set({ isTrapLogOpen: open }),
      setAIGeneratorOpen: (open: boolean) => set({ isAIGeneratorOpen: open }),
      setBriefingModalOpen: (open: boolean) => set({ isBriefingModalOpen: open }),
      setSprintModalOpen: (open: boolean) => set({ isSprintModalOpen: open }),
      setLeitnerDeckOpen: (open: boolean) => set({ isLeitnerDeckOpen: open }),
      setShortcutsOpen: (open: boolean) => set({ isShortcutsOpen: open }),
      setMockExamOpen: (open: boolean) => set({ isMockExamOpen: open }),
      setLearnHubOpen: (open: boolean) => set({ isLearnHubOpen: open }),
      setAuthSyncOpen: (open: boolean) => set({ isAuthSyncOpen: open }),

      resetProgress: () => {
        set({
          completedTopicIds: [],
          inProgressTopicId: "01",
          activeTopicId: "01",
          activeVignetteId: null,
          vignetteResults: {},
          practiceAttempts: [],
          practiceSessions: {},
          activePracticeSessionId: null,
          practiceDraft: null,
          mockExamDraft: null,
          trapLogs: [],
          customVignettes: [],
          leitnerCards: [],
        });
      },
    }),
    {
      name: "cfa-wizard-storage-v3",
      version: 4,
      storage: createJSONStorage(() => {
        if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
          return window.localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      migrate: (persistedState: unknown, version: number) => migrateV3ToV4(persistedState, version),
      partialize: (state) => ({
        completedTopicIds: state.completedTopicIds,
        inProgressTopicId: state.inProgressTopicId,
        activeTopicId: state.activeTopicId,
        vignetteResults: state.vignetteResults,
        practiceAttempts: state.practiceAttempts,
        practiceSessions: state.practiceSessions,
        activePracticeSessionId: state.activePracticeSessionId,
        practiceDraft: state.practiceDraft,
        mockExamDraft: state.mockExamDraft,
        activeVignetteId: state.activeVignetteId,
        trapLogs: state.trapLogs,
        customVignettes: state.customVignettes,
        leitnerCards: state.leitnerCards,
        soundEnabled: state.soundEnabled,
        drillQuestionCount: state.drillQuestionCount,
        isPacingTimerEnabled: state.isPacingTimerEnabled,
      }),
    }
  )
);

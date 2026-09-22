import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  ErrorMode,
  LeitnerCard,
  OptionKey,
  TrapLogEntry,
  VignetteSessionResult,
  VignetteSet,
  InterleavedSprintSession
} from "@/types/cfa";
import { PracticeAttempt, PracticeDraft, PracticeSession } from "@/types/practice";
import { MockExamDraft } from "@/types/mockExam";
import { CFA_VIGNETTES } from "@/data/vignettes";
import { migrateV3ToV4 } from "./migrations";

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
        set({ activeTopicId: topicId, isBriefingModalOpen: topicId !== null });
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
        set((state) => {
          const updated = state.leitnerCards.map((card) => {
            if (card.id !== cardId) return card;
            let newBox = card.box;
            let intervalDays = 1;
            if (isCorrect) {
              newBox = Math.min(3, card.box + 1) as 1 | 2 | 3;
              intervalDays = newBox === 2 ? 3 : 7;
            } else {
              newBox = 1;
              intervalDays = 1;
            }
            const nextDate = new Date();
            nextDate.setDate(nextDate.getDate() + intervalDays);
            return {
              ...card,
              box: newBox,
              reviewCount: card.reviewCount + 1,
              lastReviewedAt: new Date().toISOString(),
              nextReviewAt: nextDate.toISOString(),
            };
          });
          return { leitnerCards: updated };
        });
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
          drillQuestionCount: qCount >= 10 ? 10 : qCount >= 5 ? 5 : (state.drillQuestionCount || 5),
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
            drillQuestionCount: updatedQuestions.length >= 15 ? 15 : updatedQuestions.length >= 10 ? 10 : updatedQuestions.length >= 5 ? 5 : 2,
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
              drillQuestionCount: updatedQuestions.length >= 15 ? 15 : updatedQuestions.length >= 10 ? 10 : updatedQuestions.length >= 5 ? 5 : 2,
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

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { OptionKey, TrapLogEntry, VignetteSessionResult, VignetteSet } from "@/types/cfa";
import { CFA_VIGNETTES } from "@/data/vignettes";

interface CFAState {
  completedTopicIds: string[];
  inProgressTopicId: string;
  activeTopicId: string | null;
  activeVignetteId: string | null;
  vignetteResults: Record<string, VignetteSessionResult>;
  trapLogs: TrapLogEntry[];
  customVignettes: VignetteSet[];
  
  // UI & Tool States
  soundEnabled: boolean;
  isCalculatorOpen: boolean;
  isFormulaSheetOpen: boolean;
  isTrapLogOpen: boolean;
  isAIGeneratorOpen: boolean;
  isBriefingModalOpen: boolean;
  
  // Actions
  selectTopic: (id: string) => void;
  markTopicCompleted: (id: string) => void;
  setActiveBriefing: (topicId: string | null) => void;
  startVignetteDrill: (vignetteId: string) => void;
  closeVignetteDrill: () => void;
  recordVignetteSubmission: (result: VignetteSessionResult, trapEntries?: TrapLogEntry[]) => void;
  addCustomVignette: (vignette: VignetteSet) => void;
  
  // Toggle modals
  toggleSound: () => void;
  setCalculatorOpen: (open: boolean) => void;
  setFormulaSheetOpen: (open: boolean) => void;
  setTrapLogOpen: (open: boolean) => void;
  setAIGeneratorOpen: (open: boolean) => void;
  setBriefingModalOpen: (open: boolean) => void;
  
  // Reset
  resetProgress: () => void;
}

export const useCFAStore = create<CFAState>()(
  persist(
    (set, get) => ({
      completedTopicIds: ["01", "02", "03"],
      inProgressTopicId: "04",
      activeTopicId: "04",
      activeVignetteId: null,
      vignetteResults: {},
      trapLogs: [],
      customVignettes: [],

      soundEnabled: true,
      isCalculatorOpen: false,
      isFormulaSheetOpen: false,
      isTrapLogOpen: false,
      isAIGeneratorOpen: false,
      isBriefingModalOpen: false,

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
        // Look up topic of vignette to set as in progress
        const allVignettes = [...CFA_VIGNETTES, ...get().customVignettes];
        const v = allVignettes.find((item) => item.id === vignetteId);
        if (v) {
          set({
            activeVignetteId: vignetteId,
            activeTopicId: v.topicId,
            inProgressTopicId: v.topicId,
            isBriefingModalOpen: false
          });
        } else {
          set({ activeVignetteId: vignetteId, isBriefingModalOpen: false });
        }
      },

      closeVignetteDrill: () => {
        set({ activeVignetteId: null });
      },

      recordVignetteSubmission: (result: VignetteSessionResult, trapEntries?: TrapLogEntry[]) => {
        const currentResults = { ...get().vignetteResults, [result.vignetteId]: result };
        const currentTraps = [...(trapEntries || []), ...get().trapLogs];
        
        // If score is 2/2, mark topic completed if all questions correct
        let updatedCompleted = [...get().completedTopicIds];
        if (result.score === 2 && !updatedCompleted.includes(result.topicId)) {
          updatedCompleted.push(result.topicId);
        }

        set({
          vignetteResults: currentResults,
          trapLogs: currentTraps,
          completedTopicIds: updatedCompleted
        });
      },

      addCustomVignette: (vignette: VignetteSet) => {
        set((state) => ({
          customVignettes: [vignette, ...state.customVignettes],
          activeVignetteId: vignette.id,
          isAIGeneratorOpen: false
        }));
      },

      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      setCalculatorOpen: (open: boolean) => set({ isCalculatorOpen: open }),
      setFormulaSheetOpen: (open: boolean) => set({ isFormulaSheetOpen: open }),
      setTrapLogOpen: (open: boolean) => set({ isTrapLogOpen: open }),
      setAIGeneratorOpen: (open: boolean) => set({ isAIGeneratorOpen: open }),
      setBriefingModalOpen: (open: boolean) => set({ isBriefingModalOpen: open }),

      resetProgress: () => {
        set({
          completedTopicIds: [],
          inProgressTopicId: "01",
          activeTopicId: "01",
          activeVignetteId: null,
          vignetteResults: {},
          trapLogs: [],
          customVignettes: []
        });
      }
    }),
    {
      name: "cfa-wizard-storage-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        completedTopicIds: state.completedTopicIds,
        inProgressTopicId: state.inProgressTopicId,
        vignetteResults: state.vignetteResults,
        trapLogs: state.trapLogs,
        customVignettes: state.customVignettes,
        soundEnabled: state.soundEnabled,
      }),
    }
  )
);

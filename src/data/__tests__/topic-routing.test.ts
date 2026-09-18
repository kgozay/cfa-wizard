import { describe, it, expect, beforeEach } from "vitest";
import { useCFAStore } from "@/store/useCFAStore";
import { CFA_VIGNETTES } from "@/data/vignettes";
import { CFA_TOPIC_GUIDES } from "@/data/topicGuides";
import { generateMockExamSession, gradeMockExam } from "@/data/mockExamGenerator";

describe("Topic Routing & Drill Resolution", () => {
  beforeEach(() => {
    useCFAStore.setState({
      activeVignetteId: null,
      activeTopicId: null,
      inProgressTopicId: "01",
    });
  });

  it("resolves Economics topic ID '02' to vignette-02-econ and sets activeTopicId to '02'", () => {
    const store = useCFAStore.getState();
    store.startVignetteDrill("02");

    const state = useCFAStore.getState();
    expect(state.activeVignetteId).toBe("vignette-02-econ");
    expect(state.activeTopicId).toBe("02");
    expect(state.inProgressTopicId).toBe("02");
  });

  it("resolves every curriculum topic ID '01' through '10' to its respective vignette", () => {
    const store = useCFAStore.getState();

    const expectedMappings = Object.fromEntries(
      CFA_VIGNETTES.map((v) => [v.topicId, v.id])
    );

    Object.entries(expectedMappings).forEach(([topicId, expectedVignetteId]) => {
      store.startVignetteDrill(topicId);
      const state = useCFAStore.getState();
      expect(state.activeVignetteId).toBe(expectedVignetteId);
      expect(state.activeTopicId).toBe(topicId);
    });
  });

  it("resolves when given explicit vignette IDs directly", () => {
    const store = useCFAStore.getState();

    CFA_VIGNETTES.forEach((v) => {
      store.startVignetteDrill(v.id);
      const state = useCFAStore.getState();
      expect(state.activeVignetteId).toBe(v.id);
      expect(state.activeTopicId).toBe(v.topicId);
    });
  });

  it("has complete topic guides for all 10 topics", () => {
    expect(CFA_TOPIC_GUIDES.length).toBe(10);

    const topicIds = CFA_TOPIC_GUIDES.map((g) => g.topicId);
    expect(topicIds).toEqual(["01", "02", "03", "04", "05", "06", "07", "08", "09", "10"]);

    CFA_TOPIC_GUIDES.forEach((guide) => {
      expect(guide.losGuides.length).toBeGreaterThan(0);
      guide.losGuides.forEach((los) => {
        expect(los.losCode).toBeTruthy();
        expect(los.title).toBeTruthy();
        expect(los.coreConcept).toBeTruthy();
        expect(los.workedExample.solutionSteps.length).toBeGreaterThan(0);
        expect(los.trapMatrix.length).toBeGreaterThan(0);
      });
    });
  });

  it("sorts mock exam topic breakdowns in sequential topicId order", () => {
    const session = generateMockExamSession("quick_diagnostic_45");
    const { gradedSession } = gradeMockExam(session);

    const breakdownTopicIds = gradedSession.topicBreakdowns.map((t) => t.topicId);
    const sortedTopicIds = [...breakdownTopicIds].sort((a, b) => a.localeCompare(b));

    expect(breakdownTopicIds).toEqual(sortedTopicIds);
  });
});
